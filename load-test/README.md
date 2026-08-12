# Load Test

이 디렉터리는 `k6` 기반 부하 테스트와 시드 데이터를 위한 스크립트를 둡니다.

현재 목적은 두 가지입니다.

1. `PENDING` 지정가 주문 데이터를 빠르게 적재
2. `ORDER_LIMIT_INDEX_ENABLED=false/true` 비교 실험 전에 동일한 입력 조건 준비

## 현재 범위

지금 저장소에는 ticker 이벤트를 HTTP로 주입하는 전용 엔드포인트가 없습니다. 따라서 `k6`는 현재 기준으로:

- 회원가입
- 로그인
- 지정가 주문 생성
- 지정가 대기 주문 조회

같은 HTTP API 부하와 시드 생성에 적합합니다.

반면 아래는 아직 직접 재생할 수 없습니다.

- `TickerPriceUpdatedEvent` 자체를 HTTP로 대량 주입하는 실험
- `PendingLimitOrderIndex` on/off에 대한 "동일 ticker event" 재생 비교

그 비교 실험까지 하려면 이후에 별도 테스트용 이벤트 주입 API나 replay harness가 필요합니다.

## 폴더 구조

```text
load-test/
  README.md
  k6/
    common.js
    seed-users.js
    seed-limit-buy-orders.js
    cancel-pending-limit-orders.js
    get-pending-limit-orders.js
    market-buy-burst.js
    market-buy-progressive.js
  scripts/
    login-users.mjs
```

## 준비

`k6` 설치 예시:

```bash
brew install k6
```

백엔드 API 기준 기본 URL 예시:

```text
https://api.coinco.kr/api
```

## 1) 사용자 시드 적재

이 스크립트는 iteration마다 신규 사용자 1명을 회원가입시킵니다.

계정은 순번형으로 고정 생성됩니다.

- `perf-user-000001@example.com`
- `perf-user-000002@example.com`
- ...

비밀번호 기본값:

- `Password123!`

실행 예시:

```bash
k6 run \
  -e BASE_URL=https://api.coinco.kr/api \
  -e USER_START=1 \
  -e USER_COUNT=200 \
  load-test/k6/seed-users.js
```

이 단계는 아래처럼 사용자 수를 점차 늘리며 baseline을 만들 때 유용합니다.

- 100명
- 500명
- 1,000명

## 2) 로그인 토큰 준비

이 단계는 `k6`가 아니라 Node 스크립트로 수행합니다. 이미 생성된 계정 집합을 순번대로 로그인하고, access token 목록을 파일로 저장합니다.

실행 예시:

```bash
mkdir -p load-test/output

BASE_URL=https://api.coinco.kr/api \
USER_START=1 \
USER_COUNT=50 \
SLEEP_MS=100 \
TOKENS_OUTPUT_FILE=load-test/output/tokens-1-50.json \
node load-test/scripts/login-users.mjs
```

## 3) 지정가 매수 주문 시드 적재

이 스크립트는 사전에 준비한 access token 파일을 읽어 로그인 없이 계정당 지정가 매수 주문 1건을 생성합니다.

기본 전제:

- 사전에 `seed-users.js`로 같은 순번 범위의 계정을 생성해 두어야 합니다.
- 사전에 `login-users.js`로 같은 순번 범위의 access token 파일을 준비해 두어야 합니다.
- `LIMIT_PRICE * QUANTITY`가 초기 KRW 잔고보다 작아야 합니다.

실행 예시:

```bash
k6 run \
  -e BASE_URL=https://api.coinco.kr/api \
  -e TOKENS_FILE=load-test/output/tokens-1-50.json \
  -e MARKET_CODE=KRW-BTC \
  -e LIMIT_PRICE=71000000 \
  -e QUANTITY=0.001 \
  -e ORDER_COUNT=50 \
  load-test/k6/seed-limit-buy-orders.js
```

권장 해석:

- `LIMIT_PRICE=71000000`
- ticker 비교 가격 `91000000`

이면 이후 index가 warm 상태일 때 `limit index enabled=true`에서는 매수 후보 조회 skip 대상이 됩니다.

## 4) 지정가 대기 주문 취소

이 스크립트는 순번형 계정 범위를 순회하면서 각 사용자의 pending 지정가 주문을 조회하고 모두 취소합니다.

실행 예시:

```bash
k6 run \
  -e BASE_URL=https://api.coinco.kr/api \
  -e USER_START=1 \
  -e USER_COUNT=50 \
  -e VUS=5 \
  load-test/k6/cancel-pending-limit-orders.js
```

실험을 다시 시작하기 전에 기존 pending 주문을 정리할 때 사용합니다.

## 5) 지정가 대기 주문 조회 부하

이 스크립트는 단일 테스트 계정으로 로그인한 뒤 `GET /api/orders/limit/pending`을 반복 호출합니다.

먼저 테스트 계정을 하나 준비한 뒤 실행합니다.

```bash
k6 run \
  -e BASE_URL=https://api.coinco.kr/api \
  -e TEST_EMAIL=perf-user-000001@example.com \
  -e TEST_PASSWORD=Password123! \
  load-test/k6/get-pending-limit-orders.js
```

## 6) 시장가 매수 API 점진 부하

이 스크립트는 미리 준비한 토큰 파일을 사용해 `POST /api/orders/market-buy`를
`10 -> 20 -> 30 -> ... -> 200명` 단계로 점진 증가시키며 호출합니다.

실행 특성:

- 각 단계는 `per-vu-iterations`로 동작합니다.
- 단계별 사용자 수만큼 동시에 시작합니다.
- 기본값에서는 사용자당 단계마다 1회 주문합니다.
- 같은 사용자는 여러 단계에서 재사용되므로 `ORDER_AMOUNT * REQUESTS_PER_USER * 단계 수`가 초기 잔고를 넘지 않도록 잡아야 합니다.

현재 회원가입 시 테스트 계정은 초기 KRW `1000000`을 받습니다.

권장 준비:

1. `seed-users.js`로 최소 200명 생성
2. `login-users.mjs`로 200명 토큰 파일 생성
3. 필요 시 `ORDER_AMOUNT`를 `5000` 또는 `10000`처럼 낮게 설정

실행 예시:

```bash
k6 run \
  -e BASE_URL=https://api.coinco.kr/api \
  -e TOKENS_FILE=load-test/output/tokens-1-200.json \
  -e MARKET_CODE=KRW-BTC \
  -e ORDER_AMOUNT=5000 \
  -e USER_STEPS=10,20,30,40,50,60,70,80,90,100,110,120,130,140,150,160,170,180,190,200 \
  -e REQUESTS_PER_USER=1 \
  -e STAGE_DURATION_SECONDS=30 \
  -e STAGE_GAP_SECONDS=5 \
  load-test/k6/market-buy-progressive.js
```

자주 바꾸는 값:

- `ORDER_AMOUNT`: 사용자당 1회 시장가 매수 금액
- `REQUESTS_PER_USER`: 단계당 사용자 1명 기준 반복 횟수
- `USER_STEPS`: 사용자 증가 단계
- `STAGE_DURATION_SECONDS`: 각 단계의 최대 실행 시간 구간
- `STAGE_GAP_SECONDS`: 단계 사이 휴지 시간

예를 들어 더 거친 baseline이면 아래처럼도 가능합니다.

```bash
k6 run \
  -e BASE_URL=https://api.coinco.kr/api \
  -e TOKENS_FILE=load-test/output/tokens-1-200.json \
  -e ORDER_AMOUNT=10000 \
  -e USER_STEPS=10,50,100,150,200 \
  -e REQUESTS_PER_USER=2 \
  -e STAGE_DURATION_SECONDS=45 \
  load-test/k6/market-buy-progressive.js
```

## 7) 시장가 매수 API req/s 고정 부하

첫 실험은 이 방식이 해석이 가장 쉽습니다. `5 RPS 1분`, `10/20/50/100 RPS 각 3분`처럼
RPS별로 독립 실행하면 어느 구간에서 p95/p99가 꺾이는지 바로 비교할 수 있습니다.

실행 특성:

- `constant-arrival-rate`로 동작합니다.
- 하나의 실행은 하나의 목표 req/s만 유지합니다.
- `dropped_iterations`를 반드시 같이 봐야 합니다.
- `maxVUs` 자동 확장에 기대기보다 `preAllocatedVUs`를 충분히 크게 잡는 편이 결과 해석에 유리합니다.

Smoke 예시:

```bash
k6 run \
  -e BASE_URL=https://api.coinco.kr/api \
  -e TOKENS_FILE=load-test/output/tokens-1-200.json \
  -e MARKET_CODE=KRW-BTC \
  -e ORDER_AMOUNT=5000 \
  -e RATE=5 \
  -e DURATION=1m \
  -e PRE_ALLOCATED_VUS=100 \
  -e MAX_VUS=200 \
  load-test/k6/market-buy-constant-arrival.js
```

본 실험 예시:

```bash
k6 run -e BASE_URL=https://api.coinco.kr/api -e TOKENS_FILE=load-test/output/tokens-1-500.json -e ORDER_AMOUNT=5000 -e RATE=10 -e DURATION=3m -e PRE_ALLOCATED_VUS=150 -e MAX_VUS=300 load-test/k6/market-buy-constant-arrival.js
k6 run -e BASE_URL=https://api.coinco.kr/api -e TOKENS_FILE=load-test/output/tokens-1-500.json -e ORDER_AMOUNT=5000 -e RATE=20 -e DURATION=3m -e PRE_ALLOCATED_VUS=150 -e MAX_VUS=300 load-test/k6/market-buy-constant-arrival.js
k6 run -e BASE_URL=https://api.coinco.kr/api -e TOKENS_FILE=load-test/output/tokens-1-500.json -e ORDER_AMOUNT=5000 -e RATE=50 -e DURATION=3m -e PRE_ALLOCATED_VUS=200 -e MAX_VUS=400 load-test/k6/market-buy-constant-arrival.js
k6 run -e BASE_URL=https://api.coinco.kr/api -e TOKENS_FILE=load-test/output/tokens-1-500.json -e ORDER_AMOUNT=5000 -e RATE=100 -e DURATION=3m -e PRE_ALLOCATED_VUS=250 -e MAX_VUS=500 load-test/k6/market-buy-constant-arrival.js
```

해석 포인트:

- `http_req_duration`의 `p95`, `p99`
- `http_req_failed`
- `dropped_iterations`
- 백엔드의 Hikari pending, active connection
- DB CPU, lock wait, slow query

## 8) 시장가 매수 API req/s 램프업 부하

이 스크립트는 미리 준비한 토큰 파일을 사용해 `POST /api/orders/market-buy`를
`5 -> 10 -> 20 -> 50 -> 100 req/s`처럼 초당 요청 수 기준으로 점진 증가시키며 호출합니다.

실행 특성:

- `ramping-arrival-rate`로 동작합니다.
- 단계별 목표 요청 수는 `RPS_STEPS`로 제어합니다.
- 각 단계 지속 시간은 `STAGE_DURATION_SECONDS`로 통일합니다.
- 단계 사이 휴지 시간은 `STAGE_GAP_SECONDS`로 둡니다.
- 요청마다 토큰을 round-robin으로 선택하므로 특정 계정에만 주문이 몰리지 않게 할 수 있습니다.
- 같은 토큰이 여러 번 재사용되므로 `ORDER_AMOUNT * 총 요청 수`가 초기 잔고 총합을 넘지 않도록 잡아야 합니다.
- `dropped_iterations`를 반드시 같이 봐야 합니다.
- `preAllocatedVUs`를 보수적으로 충분히 잡고, `maxVUs` 확장은 보조로만 두는 편이 좋습니다.

현재 회원가입 시 테스트 계정은 초기 KRW `1000000`을 받습니다.

권장 준비:

1. `seed-users.js`로 충분한 테스트 계정 생성
2. `login-users.mjs`로 같은 범위의 토큰 파일 생성
3. `100 req/s`까지 볼 경우 최소 수백 개 토큰과 낮은 `ORDER_AMOUNT` 준비

실행 예시:

```bash
k6 run \
  -e BASE_URL=https://api.coinco.kr/api \
  -e TOKENS_FILE=load-test/output/tokens-1-500.json \
  -e MARKET_CODE=KRW-BTC \
  -e ORDER_AMOUNT=5000 \
  -e RPS_STEPS=5,10,20,50,100 \
  -e STAGE_DURATION_SECONDS=180 \
  -e STAGE_GAP_SECONDS=0 \
  -e PRE_ALLOCATED_VUS=200 \
  -e MAX_VUS=400 \
  load-test/k6/market-buy-ramping-arrival.js
```

자주 바꾸는 값:

- `RPS_STEPS`: 단계별 목표 req/s
- `STAGE_DURATION_SECONDS`: 각 단계 유지 시간
- `STAGE_GAP_SECONDS`: 단계 사이 휴지 시간
- `PRE_ALLOCATED_VUS`: 미리 확보할 VU 수
- `MAX_VUS`: k6가 확장 가능한 최대 VU 수
- `ORDER_AMOUNT`: 요청 1건당 시장가 매수 금액

권장 해석:

- `http_req_duration`의 `p95`, `p99`
- `http_req_failed`
- `dropped_iterations`
- 백엔드의 Hikari pending, active connection
- DB CPU, lock wait, slow query

## 9) 시장가 매수 API burst 부하

이 스크립트는 특정 사용자 수를 한 번에 시작시켜 시장가 매수 요청이 짧은 시간에 몰리는 상황을 봅니다.

이 시나리오는 아래를 확인할 때 적합합니다.

- 특정 동시 사용자 수에서 갑자기 에러율이 뛰는지
- DB row lock 또는 connection pool 대기가 급증하는지
- 외부 orderbook 조회 지연이 한 번에 커지는지

실행 특성:

- 모든 VU가 같은 시점에 시작합니다.
- 기본값에서는 사용자당 1회 주문합니다.
- `BURST_USERS=10`, `50`, `100`, `200`처럼 바꿔가며 여러 번 독립 실행하는 방식이 맞습니다.
- 이전 실행이 잔고를 소모하므로, 가능하면 실행마다 새 사용자 집합이나 새 토큰 범위를 쓰는 편이 좋습니다.

실행 예시:

```bash
k6 run \
  -e BASE_URL=https://api.coinco.kr/api \
  -e TOKENS_FILE=load-test/output/tokens-1-200.json \
  -e MARKET_CODE=KRW-BTC \
  -e ORDER_AMOUNT=5000 \
  -e BURST_USERS=100 \
  -e REQUESTS_PER_USER=1 \
  -e MAX_DURATION=1m \
  load-test/k6/market-buy-burst.js
```

권장 실행 순서 예시:

```bash
k6 run -e BASE_URL=https://api.coinco.kr/api -e TOKENS_FILE=load-test/output/tokens-1-200.json -e ORDER_AMOUNT=5000 -e BURST_USERS=10 load-test/k6/market-buy-burst.js
k6 run -e BASE_URL=https://api.coinco.kr/api -e TOKENS_FILE=load-test/output/tokens-1-200.json -e ORDER_AMOUNT=5000 -e BURST_USERS=50 load-test/k6/market-buy-burst.js
k6 run -e BASE_URL=https://api.coinco.kr/api -e TOKENS_FILE=load-test/output/tokens-1-200.json -e ORDER_AMOUNT=5000 -e BURST_USERS=100 load-test/k6/market-buy-burst.js
k6 run -e BASE_URL=https://api.coinco.kr/api -e TOKENS_FILE=load-test/output/tokens-1-200.json -e ORDER_AMOUNT=5000 -e BURST_USERS=200 load-test/k6/market-buy-burst.js
```

해석 팁:

- `BURST_USERS`가 올라갈수록 p95/p99, timeout, 5xx, 잔고 부족 비율을 같이 봐야 합니다.
- 잔고 부족이 섞이면 락 문제와 분리해서 보기 어려우니, 가능하면 테스트마다 새 계정을 쓰거나 `ORDER_AMOUNT`를 충분히 낮게 유지하는 편이 좋습니다.
- 애플리케이션 내부 병목을 보려면 외부 orderbook 응답 시간도 함께 수집해야 합니다.

## 권장 실험 순서

1. `ORDER_LIMIT_INDEX_ENABLED=false` 배포
2. `seed-users.js`로 사용자 수를 원하는 단계까지 적재
3. `login-users.mjs`로 같은 순번 범위의 access token 준비
4. 같은 token 범위에 대해 `seed-limit-buy-orders.js`로 지정가 주문 적재
5. DB 지표 baseline 측정
6. `ORDER_LIMIT_INDEX_ENABLED=true` 배포
7. 같은 시드 조건에서 비교

## 주의

- `seed-users.js`, `login-users.mjs`, `seed-limit-buy-orders.js`는 같은 사용자 범위를 공유해야 합니다.
- 예를 들어 `USER_START=1`, `USER_COUNT=50`으로 사용자/토큰을 준비했다면 주문 적재도 같은 50명 범위로 맞춰야 합니다.
- 운영 DB에 직접 실행하기 전에 테스트 범위를 먼저 작은 수치로 검증하는 편이 좋습니다.
