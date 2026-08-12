import http from 'k6/http';
import { check, fail, sleep } from 'k6';
import exec from 'k6/execution';
import { BASE_URL, formatKst, jsonHeaders } from './common.js';

const TOKENS_FILE = __ENV.TOKENS_FILE || 'load-test/output/tokens.json';
const TOKENS = JSON.parse(open(TOKENS_FILE));
const ORDER_COUNT = Number(__ENV.ORDER_COUNT || 100);
const USER_START = Number(__ENV.USER_START || 1);
const MARKET_CODE = __ENV.MARKET_CODE || 'KRW-BTC';
const QUANTITY = __ENV.QUANTITY || '0.001';
const LIMIT_PRICE = __ENV.LIMIT_PRICE || '71000000';
const VUS = Number(__ENV.VUS || 10);
const MAX_DURATION = __ENV.MAX_DURATION || '10m';
const SLEEP_SECONDS = Number(__ENV.SLEEP_SECONDS || 0);
const RUN_STARTED_AT = formatKst();

export const options = {
  scenarios: {
    seed_limit_buy_orders: {
      executor: 'shared-iterations',
      vus: VUS,
      iterations: ORDER_COUNT,
      maxDuration: MAX_DURATION,
    },
  },
};

export function setup() {
  console.log(
    [
      '[k6][seed-limit-buy-orders] run started',
      `startedAt=${RUN_STARTED_AT}`,
      `baseUrl=${BASE_URL}`,
      `userStart=${USER_START}`,
      `orderCount=${ORDER_COUNT}`,
      `tokensFile=${TOKENS_FILE}`,
      `marketCode=${MARKET_CODE}`,
      `limitPrice=${LIMIT_PRICE}`,
      `quantity=${QUANTITY}`,
      `vus=${VUS}`,
      `sleepSeconds=${SLEEP_SECONDS}`,
      `maxDuration=${MAX_DURATION}`,
    ].join(' ')
  );
}

export function teardown() {
  console.log(
    [
      '[k6][seed-limit-buy-orders] run finished',
      `startedAt=${RUN_STARTED_AT}`,
      `finishedAt=${formatKst()}`,
    ].join(' ')
  );
}

export default function () {
  const offset = exec.scenario.iterationInTest;
  const tokenEntry = TOKENS[offset];

  if (!tokenEntry) {
    fail(`missing token entry for iteration=${offset}, tokensFile=${TOKENS_FILE}`);
  }

  const response = http.post(
    `${BASE_URL}/orders/limit-buy`,
    JSON.stringify({
      marketCode: MARKET_CODE,
      quantity: QUANTITY,
      limitPrice: LIMIT_PRICE,
    }),
    { headers: jsonHeaders(tokenEntry.accessToken) }
  );

  const ok = check(response, {
    'limit buy status is 200': (r) => r.status === 200,
    'limit buy is pending': (r) => {
      try {
        return r.json('status') === 'PENDING';
      } catch (_) {
        return false;
      }
    },
  });

  if (!ok) {
    fail(`limit buy failed: status=${response.status}, body=${response.body}`);
  }

  sleep(SLEEP_SECONDS);
}
