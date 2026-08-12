import http from 'k6/http';
import { check, fail } from 'k6';
import exec from 'k6/execution';
import { BASE_URL, jsonHeaders, loginAndGetToken, userForSequence } from './common.js';

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
    cancel_pending_limit_orders: {
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
      '[k6][cancel-pending-limit-orders] run started',
      `startedAt=${RUN_STARTED_AT}`,
      `baseUrl=${BASE_URL}`,
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
      '[k6][cancel-pending-limit-orders] run finished',
      `startedAt=${RUN_STARTED_AT}`,
      `finishedAt=${formatKst()}`,
    ].join(' ')
  );
}

export default function () {
  const sequence = USER_START + exec.scenario.iterationInTest;
  const user = userForSequence(sequence);
  const accessToken = loginAndGetToken(user.email, user.password);

  const pendingResponse = http.get(
    `${BASE_URL}/orders/limit/pending`,
    { headers: jsonHeaders(accessToken) }
  );

  const pendingOk = check(pendingResponse, {
    'pending orders status is 200': (r) => r.status === 200,
    'pending orders response is array': (r) => {
      try {
        return Array.isArray(r.json());
      } catch (_) {
        return false;
      }
    },
  });

  if (!pendingOk) {
    fail(`pending orders failed: status=${pendingResponse.status}, body=${pendingResponse.body}`);
  }

  const pendingOrders = pendingResponse.json();

  for (const order of pendingOrders) {
    const cancelResponse = http.del(
      `${BASE_URL}/orders/limit/${order.orderId}`,
      null,
      { headers: jsonHeaders(accessToken) }
    );

    const cancelOk = check(cancelResponse, {
      'cancel limit order status is 200': (r) => r.status === 200,
      'cancel limit order is cancelled': (r) => {
        try {
          return r.json('status') === 'CANCELLED';
        } catch (_) {
          return false;
        }
      },
    });

    if (!cancelOk) {
      fail(`cancel limit order failed: status=${cancelResponse.status}, body=${cancelResponse.body}`);
    }
  }
}
