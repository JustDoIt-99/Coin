# Observability Stack

이 디렉터리는 백엔드 로그를 `Alloy -> Loki -> Grafana`로 보내기 위한 최소 운영 구성을 담고 있습니다.

## 전제 조건

- 백엔드 컨테이너 이름이 `coinco-backend`여야 합니다.
- 백엔드는 `SPRING_PROFILES_ACTIVE=prod`로 실행되어야 합니다.
- 백엔드는 현재 코드 기준으로 stdout에 JSON structured log를 출력합니다.

## 시작 순서

1. 환경 파일 준비

```bash
cd deploy/observability
cp .env.example .env
```

2. 관측 스택 실행

```bash
docker compose up -d
```

3. 백엔드 실행

`deploy/.env` 또는 실제 운영 환경에 아래 값이 포함되어 있어야 합니다.

```env
SPRING_PROFILES_ACTIVE=prod
```

백엔드를 띄우면 Alloy가 Docker API를 통해 `coinco-backend` 컨테이너 로그를 수집합니다.

## 접속 정보

- Grafana: `http://localhost:3000`
- Loki: `http://localhost:3100`
- Alloy UI: `http://localhost:12345`

Grafana 기본 계정은 `.env`의 `GRAFANA_ADMIN_USER`, `GRAFANA_ADMIN_PASSWORD`를 사용합니다.

## Grafana Explore 예시

기본 스트림 조회:

```logql
{service="realtime-trading-backend", env="prod", job="backend"}
```

특정 요청 추적:

```logql
{service="realtime-trading-backend"} | json | requestId="YOUR_REQUEST_ID"
```

예상 못한 에러 조회:

```logql
{service="realtime-trading-backend", level="ERROR"} | json
```

특정 사용자 요청 추적:

```logql
{service="realtime-trading-backend"} | json | userId="123"
```

## Slack Alert 연결

Slack은 Grafana UI에서 붙이는 편이 가장 단순합니다.

1. Grafana 접속
2. `Alerts & IRM -> Alerting -> Contact points`
3. `Add contact point`
4. Integration을 `Slack`으로 선택
5. Slack webhook URL 입력

추천 알림 규칙:

- `level="ERROR"` 로그가 5분 동안 급증
- `Unexpected exception handled` 로그 발생
- `Upbit .* 재연결` 패턴 반복

## 운영 규칙

- `requestId`, `userId`는 JSON 필드로 검색하고 label로 올리지 않습니다.
- label은 `service`, `env`, `job`, `level` 정도만 유지합니다.
- 장애 알림은 로그 패턴보다 메트릭과 함께 설계하는 편이 낫습니다.
