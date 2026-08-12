import { sleep } from 'k6';
import exec from 'k6/execution';
import { signupAndGetToken, userForSequence } from './common.js';

function formatKst(date = new Date()) {
  const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 19);
}

const USER_COUNT = Number(__ENV.USER_COUNT || 100);
const USER_START = Number(__ENV.USER_START || 1);
const VUS = Number(__ENV.VUS || 10);
const MAX_DURATION = __ENV.MAX_DURATION || '10m';
const RUN_STARTED_AT = formatKst();

export const options = {
  scenarios: {
    seed_users: {
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
      '[k6][seed-users] run started',
      `startedAt=${RUN_STARTED_AT}`,
      `baseUrl=${__ENV.BASE_URL || 'http://localhost:8080/api'}`,
      `userStart=${USER_START}`,
      `userCount=${USER_COUNT}`,
      `vus=${VUS}`,
      `maxDuration=${MAX_DURATION}`,
    ].join(' ')
  );
}

export function teardown() {
  console.log(
    [
      '[k6][seed-users] run finished',
      `startedAt=${RUN_STARTED_AT}`,
      `finishedAt=${formatKst()}`,
    ].join(' ')
  );
}

export default function () {
  const sequence = USER_START + exec.scenario.iterationInTest;
  signupAndGetToken(userForSequence(sequence));
  sleep(Number(__ENV.SLEEP_SECONDS || 0));
}
