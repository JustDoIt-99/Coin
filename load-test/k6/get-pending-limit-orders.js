import http from 'k6/http';
import { check, fail, sleep } from 'k6';
import { BASE_URL, jsonHeaders, loginAndGetToken } from './common.js';

const TEST_EMAIL = __ENV.TEST_EMAIL;
const TEST_PASSWORD = __ENV.TEST_PASSWORD;

if (!TEST_EMAIL || !TEST_PASSWORD) {
  fail('TEST_EMAIL and TEST_PASSWORD are required');
}

const accessToken = loginAndGetToken(TEST_EMAIL, TEST_PASSWORD);

export const options = {
  scenarios: {
    pending_limit_orders_read: {
      executor: 'constant-vus',
      vus: Number(__ENV.VUS || 5),
      duration: __ENV.DURATION || '30s',
    },
  },
};

export default function () {
  const response = http.get(
    `${BASE_URL}/orders/limit/pending`,
    { headers: jsonHeaders(accessToken) }
  );

  const ok = check(response, {
    'pending orders status is 200': (r) => r.status === 200,
    'pending orders response is array': (r) => {
      try {
        return Array.isArray(r.json());
      } catch (_) {
        return false;
      }
    },
  });

  if (!ok) {
    fail(`pending orders failed: status=${response.status}, body=${response.body}`);
  }

  sleep(Number(__ENV.SLEEP_SECONDS || 1));
}
