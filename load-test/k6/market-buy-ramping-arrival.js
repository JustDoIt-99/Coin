import http from 'k6/http';
import { check, fail } from 'k6';
import exec from 'k6/execution';
import { BASE_URL, formatKst, jsonHeaders } from './common.js';

const TOKENS_FILE = __ENV.TOKENS_FILE || 'load-test/output/tokens.json';
const TOKENS = JSON.parse(open(TOKENS_FILE));
const MARKET_CODE = __ENV.MARKET_CODE || 'KRW-BTC';
const ORDER_AMOUNT = __ENV.ORDER_AMOUNT || '5000';
const RPS_STEPS = parsePositiveNumbers(__ENV.RPS_STEPS || '5,10,20,50,100', 'RPS_STEPS');
const STAGE_DURATION_SECONDS = Number(__ENV.STAGE_DURATION_SECONDS || 180);
const STAGE_GAP_SECONDS = Number(__ENV.STAGE_GAP_SECONDS || 0);
const TIME_UNIT = __ENV.TIME_UNIT || '1s';
const PRE_ALLOCATED_VUS = Number(__ENV.PRE_ALLOCATED_VUS || 200);
const MAX_VUS = Number(__ENV.MAX_VUS || 400);
const RUN_STARTED_AT = formatKst();
const STAGES = buildStages();

export const options = {
  thresholds: {
    http_req_failed: ['rate<0.01'],
  },
  scenarios: {
    market_buy_ramping_arrival: {
      executor: 'ramping-arrival-rate',
      startRate: RPS_STEPS[0],
      timeUnit: TIME_UNIT,
      preAllocatedVUs: PRE_ALLOCATED_VUS,
      maxVUs: MAX_VUS,
      stages: STAGES,
      tags: {
        scenarioType: 'ramping-arrival-rate',
      },
    },
  },
};

export function setup() {
  if (TOKENS.length === 0) {
    fail(`tokens file is empty: ${TOKENS_FILE}`);
  }

  if (!Number.isFinite(STAGE_DURATION_SECONDS) || STAGE_DURATION_SECONDS <= 0) {
    fail(`invalid STAGE_DURATION_SECONDS: ${STAGE_DURATION_SECONDS}`);
  }

  if (!Number.isFinite(STAGE_GAP_SECONDS) || STAGE_GAP_SECONDS < 0) {
    fail(`invalid STAGE_GAP_SECONDS: ${STAGE_GAP_SECONDS}`);
  }

  if (!Number.isFinite(PRE_ALLOCATED_VUS) || PRE_ALLOCATED_VUS <= 0) {
    fail(`invalid PRE_ALLOCATED_VUS: ${PRE_ALLOCATED_VUS}`);
  }

  if (!Number.isFinite(MAX_VUS) || MAX_VUS < PRE_ALLOCATED_VUS) {
    fail(`invalid MAX_VUS: ${MAX_VUS}, PRE_ALLOCATED_VUS=${PRE_ALLOCATED_VUS}`);
  }

  console.log(
    [
      '[k6][market-buy-ramping-arrival] run started',
      `startedAt=${RUN_STARTED_AT}`,
      `baseUrl=${BASE_URL}`,
      `tokensFile=${TOKENS_FILE}`,
      `marketCode=${MARKET_CODE}`,
      `orderAmount=${ORDER_AMOUNT}`,
      `rpsSteps=${RPS_STEPS.join(',')}`,
      `stageDurationSeconds=${STAGE_DURATION_SECONDS}`,
      `stageGapSeconds=${STAGE_GAP_SECONDS}`,
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
      '[k6][market-buy-ramping-arrival] run finished',
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
        scenarioType: 'ramping-arrival-rate',
        expectedRate: currentExpectedRate(),
      },
    }
  );

  const ok = check(response, {
    'market buy ramping arrival status is 200': (r) => r.status === 200,
    'market buy ramping arrival has executed amount': (r) => {
      try {
        return Number(r.json('executedAmount')) > 0;
      } catch (_) {
        return false;
      }
    },
  });

  if (!ok) {
    console.error(
      `market buy ramping arrival failed: status=${response.status}, expectedRate=${currentExpectedRate()}, body=${response.body}`
    );
  }
}

function parsePositiveNumbers(rawValue, envName) {
  const values = rawValue
    .split(',')
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isFinite(value) && value > 0);

  if (values.length === 0) {
    fail(`invalid ${envName}: ${rawValue}`);
  }

  return values;
}

function buildStages() {
  const stages = [];

  for (let index = 0; index < RPS_STEPS.length; index++) {
    stages.push({
      target: RPS_STEPS[index],
      duration: `${STAGE_DURATION_SECONDS}s`,
    });

    if (STAGE_GAP_SECONDS > 0 && index < RPS_STEPS.length - 1) {
      stages.push({
        target: 0,
        duration: `${STAGE_GAP_SECONDS}s`,
      });
    }
  }

  return stages;
}

function currentExpectedRate() {
  if (STAGE_GAP_SECONDS === 0) {
    const stageIndex = Math.min(
      Math.floor(exec.scenario.elapsedTime / 1000 / STAGE_DURATION_SECONDS),
      RPS_STEPS.length - 1
    );
    return String(RPS_STEPS[stageIndex]);
  }

  const blockSeconds = STAGE_DURATION_SECONDS + STAGE_GAP_SECONDS;
  const stageIndex = Math.min(
    Math.floor(exec.scenario.elapsedTime / 1000 / blockSeconds),
    RPS_STEPS.length - 1
  );
  const secondsInBlock = (exec.scenario.elapsedTime / 1000) % blockSeconds;

  if (secondsInBlock >= STAGE_DURATION_SECONDS) {
    return '0';
  }

  return String(RPS_STEPS[stageIndex]);
}
