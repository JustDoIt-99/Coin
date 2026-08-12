import http from 'k6/http';
import { check, fail, sleep } from 'k6';
import exec from 'k6/execution';
import { BASE_URL, formatKst, jsonHeaders } from './common.js';

const TOKENS_FILE = __ENV.TOKENS_FILE || 'load-test/output/tokens.json';
const TOKENS = JSON.parse(open(TOKENS_FILE));
const MARKET_CODE = __ENV.MARKET_CODE || 'KRW-BTC';
const ORDER_AMOUNT = __ENV.ORDER_AMOUNT || '5000';
const REQUESTS_PER_USER = Number(__ENV.REQUESTS_PER_USER || 1);
const STAGE_STEPS = parseStageSteps(__ENV.USER_STEPS || '10,20,30,40,50,60,70,80,90,100,110,120,130,140,150,160,170,180,190,200');
const STAGE_DURATION_SECONDS = Number(__ENV.STAGE_DURATION_SECONDS || 30);
const STAGE_GAP_SECONDS = Number(__ENV.STAGE_GAP_SECONDS || 5);
const MAX_STAGE_DURATION = __ENV.MAX_STAGE_DURATION || '2m';
const SLEEP_SECONDS = Number(__ENV.SLEEP_SECONDS || 0);
const RUN_STARTED_AT = formatKst();
const SCENARIO_CONFIGS = buildScenarioConfigs();

export const options = {
  scenarios: Object.fromEntries(
    SCENARIO_CONFIGS.map((config) => [
      config.name,
      {
        executor: 'per-vu-iterations',
        vus: config.userCount,
        iterations: REQUESTS_PER_USER,
        startTime: `${config.startTimeSeconds}s`,
        maxDuration: MAX_STAGE_DURATION,
        tags: {
          stageUsers: String(config.userCount),
        },
      },
    ])
  ),
};

export function setup() {
  const maxUsers = Math.max(...STAGE_STEPS);

  if (TOKENS.length < maxUsers) {
    fail(`tokens file has ${TOKENS.length} users, but max stage needs ${maxUsers}: ${TOKENS_FILE}`);
  }

  console.log(
    [
      '[k6][market-buy-progressive] run started',
      `startedAt=${RUN_STARTED_AT}`,
      `baseUrl=${BASE_URL}`,
      `tokensFile=${TOKENS_FILE}`,
      `marketCode=${MARKET_CODE}`,
      `orderAmount=${ORDER_AMOUNT}`,
      `requestsPerUser=${REQUESTS_PER_USER}`,
      `userSteps=${STAGE_STEPS.join(',')}`,
      `stageDurationSeconds=${STAGE_DURATION_SECONDS}`,
      `stageGapSeconds=${STAGE_GAP_SECONDS}`,
      `sleepSeconds=${SLEEP_SECONDS}`,
      `maxStageDuration=${MAX_STAGE_DURATION}`,
    ].join(' ')
  );
}

export function teardown() {
  console.log(
    [
      '[k6][market-buy-progressive] run finished',
      `startedAt=${RUN_STARTED_AT}`,
      `finishedAt=${formatKst()}`,
    ].join(' ')
  );
}

export default function () {
  const scenario = SCENARIO_CONFIGS_BY_NAME[exec.scenario.name];
  const tokenIndex = exec.vu.idInScenario - 1;
  const tokenEntry = TOKENS[tokenIndex];

  if (!scenario) {
    fail(`missing scenario config for ${exec.scenario.name}`);
  }

  if (!tokenEntry) {
    fail(
      `missing token entry for scenario=${exec.scenario.name}, userIndex=${tokenIndex}, tokensFile=${TOKENS_FILE}`
    );
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
        scenario: scenario.name,
        stageUsers: String(scenario.userCount),
      },
    }
  );

  const ok = check(response, {
    'market buy status is 200': (r) => r.status === 200,
    'market buy has executed amount': (r) => {
      try {
        return Number(r.json('executedAmount')) > 0;
      } catch (_) {
        return false;
      }
    },
  });

  if (!ok) {
    fail(`market buy failed: status=${response.status}, body=${response.body}`);
  }

  sleep(SLEEP_SECONDS);
}

function parseStageSteps(rawValue) {
  const steps = rawValue
    .split(',')
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isFinite(value) && value > 0);

  if (steps.length === 0) {
    fail(`invalid USER_STEPS: ${rawValue}`);
  }

  return [...new Set(steps)].sort((a, b) => a - b);
}

function buildScenarioConfigs() {
  let startTimeSeconds = 0;

  return STAGE_STEPS.map((userCount) => {
    const config = {
      name: `market_buy_${String(userCount).padStart(3, '0')}_users`,
      userCount,
      startTimeSeconds,
    };

    startTimeSeconds += STAGE_DURATION_SECONDS + STAGE_GAP_SECONDS;
    return config;
  });
}

const SCENARIO_CONFIGS_BY_NAME = Object.fromEntries(
  SCENARIO_CONFIGS.map((config) => [config.name, config])
);
