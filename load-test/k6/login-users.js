import exec from 'k6/execution';
import { sleep } from 'k6';
import {
  BASE_URL,
  formatKst,
  loginAndGetTokenForUser,
  userForSequence,
} from './common.js';

const USER_COUNT = Number(__ENV.USER_COUNT || 100);
const USER_START = Number(__ENV.USER_START || 1);
const VUS = Number(__ENV.VUS || 1);
const MAX_DURATION = __ENV.MAX_DURATION || '10m';
const SLEEP_SECONDS = Number(__ENV.SLEEP_SECONDS || 0);
const TOKENS_OUTPUT_FILE = __ENV.TOKENS_OUTPUT_FILE || 'load-test/output/tokens.json';
const RUN_STARTED_AT = formatKst();
const TOKENS = new Array(USER_COUNT);

export const options = {
  scenarios: {
    login_users: {
      executor: 'shared-iterations',
      vus: VUS,
      iterations: USER_COUNT,
      maxDuration: MAX_DURATION,
    },
  },
};

export function setup() {
  console.log(
    [
      '[k6][login-users] run started',
      `startedAt=${RUN_STARTED_AT}`,
      `baseUrl=${BASE_URL}`,
      `userStart=${USER_START}`,
      `userCount=${USER_COUNT}`,
      `vus=${VUS}`,
      `sleepSeconds=${SLEEP_SECONDS}`,
      `maxDuration=${MAX_DURATION}`,
      `tokensOutputFile=${TOKENS_OUTPUT_FILE}`,
    ].join(' ')
  );
}

export default function () {
  const offset = exec.scenario.iterationInTest;
  const sequence = USER_START + offset;
  const user = userForSequence(sequence);
  const accessToken = loginAndGetTokenForUser(user);

  TOKENS[offset] = {
    sequence,
    email: user.email,
    accessToken,
  };

  sleep(SLEEP_SECONDS);
}

export function teardown() {
  console.log(
    [
      '[k6][login-users] run finished',
      `startedAt=${RUN_STARTED_AT}`,
      `finishedAt=${formatKst()}`,
    ].join(' ')
  );
}

export function handleSummary() {
  return {
    [TOKENS_OUTPUT_FILE]: JSON.stringify(TOKENS.filter(Boolean), null, 2),
  };
}
