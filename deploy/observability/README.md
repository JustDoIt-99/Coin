# Observability Stack

이 디렉터리는 서버가 분리된 운영 환경을 기준으로, 백엔드 로그를 `Alloy -> Loki -> Grafana`로 보내기 위한 구성을 담고 있습니다.

## 전제 조건

- 백엔드 컨테이너 이름이 `coinco-backend`여야 합니다.
- 백엔드는 `SPRING_PROFILES_ACTIVE=prod`로 실행되어야 합니다.
- 백엔드는 현재 코드 기준으로 stdout에 JSON structured log를 출력합니다.
- 서버가 두 대로 분리되어 있습니다.
  - 앱 서버: `coinco-backend`, `alloy`
  - 모니터링 서버: `loki`, `grafana`

## 파일 구성

- 앱 서버용 compose: `app-node-compose.yml`
- 모니터링 서버용 compose: `monitoring-node-compose.yml`
- Alloy 설정: `alloy/config.alloy`

## 1. 모니터링 서버에서 실행

```bash
cd deploy/observability
cp .env.example .env
docker compose -f monitoring-node-compose.yml up -d
```

모니터링 서버에서 뜨는 것:

- `trading-loki`
- `trading-grafana`

## 2. 앱 서버에서 실행

앱 서버에서는 `.env`에 Loki 주소를 넣어야 합니다.

```env
LOKI_PUSH_URL=http://<monitoring-server-private-ip>:3100/loki/api/v1/push
```

그리고 실행:

```bash
cd deploy/observability
cp .env.example .env
# .env에서 LOKI_PUSH_URL 수정
docker compose -f app-node-compose.yml up -d
```

앱 서버에서 뜨는 것:

- `trading-alloy`

## 3. 백엔드 실행 확인

백엔드 환경에 아래 값이 포함되어 있어야 합니다.

```env
SPRING_PROFILES_ACTIVE=prod
```

백엔드가 떠 있으면 Alloy가 Docker API를 통해 `coinco-backend` 컨테이너 로그를 수집하고, 모니터링 서버의 Loki로 밀어 넣습니다.

## 접속 정보

- 모니터링 서버 Grafana: `http://<monitoring-server>:3000`
- 모니터링 서버 Loki: `http://<monitoring-server>:3100`
- 앱 서버 Alloy UI: `http://<app-server>:12345`

Grafana 계정은 모니터링 서버의 `.env`에 있는 `GRAFANA_ADMIN_USER`, `GRAFANA_ADMIN_PASSWORD`를 사용합니다.

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

## 서버별 점검 명령

앱 서버:

```bash
docker compose -f deploy/observability/app-node-compose.yml ps
docker logs trading-alloy --tail=100
docker logs coinco-backend --tail=100
```

모니터링 서버:

```bash
docker compose -f deploy/observability/monitoring-node-compose.yml ps
docker logs trading-loki --tail=100
docker logs trading-grafana --tail=100
```
