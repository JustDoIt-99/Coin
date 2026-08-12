import http from 'k6/http';
import { check, fail } from 'k6';
import exec from 'k6/execution';
import { BASE_URL, formatKst, jsonHeaders } from './common.js';

const TOKENS_FILE = __ENV.TOKENS_FILE || 'load-test/output/tokens.json';
const TOKENS = JSON.parse(open(TOKENS_FILE));
const MARKET_CODE = __ENV.MARKET_CODE || 'KRW-BTC';
const ORDER_AMOUNT = __ENV.ORDER_AMOUNT || '5000';
const RATE = Number(__ENV.RATE || 5);
const DURATION = __ENV.DURATION || '1m';
const TIME_UNIT = __ENV.TIME_UNIT || '1s';
const PRE_ALLOCATED_VUS = Number(__ENV.PRE_ALLOCATED_VUS || 100);
const MAX_VUS = Number(__ENV.MAX_VUS || 200);
const RUN_STARTED_AT = formatKst();

export const options = {
  thresholds: {
    http_req_failed: ['rate<0.01'],
  },
  scenarios: {
    market_buy_constant_arrival: {
      executor: 'constant-arrival-rate',
      rate: RATE,
      timeUnit: TIME_UNIT,
      duration: DURATION,
      preAllocatedVUs: PRE_ALLOCATED_VUS,
      maxVUs: MAX_VUS,
      tags: {
        scenarioType: 'constant-arrival-rate',
        expectedRate: String(RATE),
      },
    },
  },
};

export function setup() {
  if (TOKENS.length === 0) {
    fail(`tokens file is empty: ${TOKENS_FILE}`);
  }

  if (!Number.isFinite(RATE) || RATE <= 0) {
    fail(`invalid RATE: ${RATE}`);
  }

  if (!Number.isFinite(PRE_ALLOCATED_VUS) || PRE_ALLOCATED_VUS <= 0) {
    fail(`invalid PRE_ALLOCATED_VUS: ${PRE_ALLOCATED_VUS}`);
  }

  if (!Number.isFinite(MAX_VUS) || MAX_VUS < PRE_ALLOCATED_VUS) {
    fail(`invalid MAX_VUS: ${MAX_VUS}, PRE_ALLOCATED_VUS=${PRE_ALLOCATED_VUS}`);
  }

  console.log(
    [
      '[k6][market-buy-constant-arrival] run started',
      `startedAt=${RUN_STARTED_AT}`,
      `baseUrl=${BASE_URL}`,
      `tokensFile=${TOKENS_FILE}`,
      `marketCode=${MARKET_CODE}`,
      `orderAmount=${ORDER_AMOUNT}`,
      `rate=${RATE}`,
      `duration=${DURATION}`,
      `timeUnit=${TIME_UNIT}`,
      `preAllocatedVUs=${PRE_ALLOCATED_VUS}`,
      `maxVUs=${MAX_VUS}`,
      `tokenCount=${TOKENS.length}`,
    ].join(' ')
  );
}

export function teardown() {
  console.log(
    [
      '[k6][market-buy-constant-arrival] run finished',
      `startedAt=${RUN_STARTED_AT}`,
      `finishedAt=${formatKst()}`,
    ].join(' ')
  );
}

export default function () {
  const tokenEntry = TOKENS[exec.scenario.iterationInTest % TOKENS.length];

  if (!tokenEntry?.accessToken) {
    fail(`missing accessToken in tokens file: ${TOKENS_FILE}`);
  }

  const response = http.post(
    `${BASE_URL}/orders/market-buy`,
    JSON.stringify({
      marketCode: MARKET_CODE,
      amount: ORDER_AMOUNT,
    }),
    {
      headers: jsonHeaders(tokenEntry.accessToken),
      tags: {
        scenarioType: 'constant-arrival-rate',
        expectedRate: String(RATE),
      },
    }
  );

  const ok = check(response, {
    'market buy constant arrival status is 200': (r) => r.status === 200,
    'market buy constant arrival has executed amount': (r) => {
      try {
        return Number(r.json('executedAmount')) > 0;
      } catch (_) {
        return false;
      }
    },
  });

  if (!ok) {
    console.error(
      `market buy constant arrival failed: status=${response.status}, expectedRate=${RATE}, body=${response.body}`
    );
  }
}
