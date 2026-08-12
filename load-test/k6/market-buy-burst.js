import http from 'k6/http';
import { check, fail, sleep } from 'k6';
import exec from 'k6/execution';
import { BASE_URL, formatKst, jsonHeaders } from './common.js';

const TOKENS_FILE = __ENV.TOKENS_FILE || 'load-test/output/tokens.json';
const TOKENS = JSON.parse(open(TOKENS_FILE));
const MARKET_CODE = __ENV.MARKET_CODE || 'KRW-BTC';
const ORDER_AMOUNT = __ENV.ORDER_AMOUNT || '5000';
const BURST_USERS = Number(__ENV.BURST_USERS || 100);
const REQUESTS_PER_USER = Number(__ENV.REQUESTS_PER_USER || 1);
const MAX_DURATION = __ENV.MAX_DURATION || '1m';
const SLEEP_SECONDS = Number(__ENV.SLEEP_SECONDS || 0);
const RUN_STARTED_AT = formatKst();

export const options = {
  scenarios: {
    market_buy_burst: {
      executor: 'per-vu-iterations',
      vus: BURST_USERS,
      iterations: REQUESTS_PER_USER,
      maxDuration: MAX_DURATION,
      tags: {
        scenarioType: 'burst',
        burstUsers: String(BURST_USERS),
      },
    },
  },
};

export function setup() {
  if (TOKENS.length < BURST_USERS) {
    fail(`tokens file has ${TOKENS.length} users, but burst needs ${BURST_USERS}: ${TOKENS_FILE}`);
  }

  console.log(
    [
      '[k6][market-buy-burst] run started',
      `startedAt=${RUN_STARTED_AT}`,
      `baseUrl=${BASE_URL}`,
      `tokensFile=${TOKENS_FILE}`,
      `marketCode=${MARKET_CODE}`,
      `orderAmount=${ORDER_AMOUNT}`,
      `burstUsers=${BURST_USERS}`,
      `requestsPerUser=${REQUESTS_PER_USER}`,
      `sleepSeconds=${SLEEP_SECONDS}`,
      `maxDuration=${MAX_DURATION}`,
    ].join(' ')
  );
}

export function teardown() {
  console.log(
    [
      '[k6][market-buy-burst] run finished',
      `startedAt=${RUN_STARTED_AT}`,
      `finishedAt=${formatKst()}`,
    ].join(' ')
  );
}

export default function () {
  const tokenIndex = exec.vu.idInScenario - 1;
  const tokenEntry = TOKENS[tokenIndex];

  if (!tokenEntry) {
    fail(`missing token entry for userIndex=${tokenIndex}, tokensFile=${TOKENS_FILE}`);
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
        scenarioType: 'burst',
        burstUsers: String(BURST_USERS),
      },
    }
  );

  const ok = check(response, {
    'market buy burst status is 200': (r) => r.status === 200,
    'market buy burst has executed amount': (r) => {
      try {
        return Number(r.json('executedAmount')) > 0;
      } catch (_) {
        return false;
      }
    },
  });

  if (!ok) {
    fail(`market buy burst failed: status=${response.status}, body=${response.body}`);
  }

  sleep(SLEEP_SECONDS);
}
