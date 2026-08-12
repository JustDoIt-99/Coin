import http from 'k6/http';
import { check, fail } from 'k6';

export const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080/api';
export const DEFAULT_PASSWORD = __ENV.TEST_PASSWORD || 'Password123!';

export function formatKst(date = new Date()) {
  const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 19);
}

export function jsonHeaders(token) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

export function formatUserSequence(sequence) {
  return String(sequence).padStart(6, '0');
}

export function userForSequence(sequence) {
  const suffix = formatUserSequence(sequence);
  return {
    email: `perf-user-${suffix}@example.com`,
    password: DEFAULT_PASSWORD,
    nickname: `perf-user-${suffix}`,
  };
}

export function signupAndGetToken(user) {
  const response = http.post(
    `${BASE_URL}/auth/signup`,
    JSON.stringify(user),
    { headers: jsonHeaders() }
  );

  const ok = check(response, {
    'signup status is 200': (r) => r.status === 200,
    'signup has accessToken': (r) => {
      try {
        return !!r.json('accessToken');
      } catch (_) {
        return false;
      }
    },
  });

  if (!ok) {
    fail(`signup failed: status=${response.status}, body=${response.body}`);
  }

  return response.json('accessToken');
}

export function loginAndGetTokenForUser(user) {
  return loginAndGetToken(user.email, user.password);
}

export function loginAndGetToken(email, password) {
  const response = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({ email, password: password || DEFAULT_PASSWORD }),
    { headers: jsonHeaders() }
  );

  const ok = check(response, {
    'login status is 200': (r) => r.status === 200,
    'login has accessToken': (r) => {
      try {
        return !!r.json('accessToken');
      } catch (_) {
        return false;
      }
    },
  });

  if (!ok) {
    fail(`login failed: status=${response.status}, body=${response.body}`);
  }

  return response.json('accessToken');
}
