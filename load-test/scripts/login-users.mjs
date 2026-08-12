import fs from 'node:fs/promises';
import path from 'node:path';

const baseUrl = process.env.BASE_URL || 'http://localhost:8080/api';
const userStart = Number(process.env.USER_START || 1);
const userCount = Number(process.env.USER_COUNT || 100);
const password = process.env.TEST_PASSWORD || 'Password123!';
const outputFile = process.env.TOKENS_OUTPUT_FILE || 'load-test/output/tokens.json';
const sleepMs = Number(process.env.SLEEP_MS || 0);

function formatUserSequence(sequence) {
  return String(sequence).padStart(6, '0');
}

function userForSequence(sequence) {
  const suffix = formatUserSequence(sequence);
  return {
    sequence,
    email: `perf-user-${suffix}@example.com`,
    password,
  };
}

function formatKst(date = new Date()) {
  const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 19);
}

function sleep(delayMs) {
  if (delayMs <= 0) {
    return Promise.resolve();
  }

  return new Promise((resolve) => setTimeout(resolve, delayMs));
}

async function loginAndGetToken(user) {
  const response = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: user.email,
      password: user.password,
    }),
  });

  const bodyText = await response.text();
  let body;

  try {
    body = JSON.parse(bodyText);
  } catch {
    body = null;
  }

  if (!response.ok || !body?.accessToken) {
    throw new Error(
      `login failed: sequence=${user.sequence}, status=${response.status}, body=${bodyText}`
    );
  }

  return {
    sequence: user.sequence,
    email: user.email,
    accessToken: body.accessToken,
  };
}

async function main() {
  const startedAt = formatKst();
  console.log(
    [
      '[node][login-users] run started',
      `startedAt=${startedAt}`,
      `baseUrl=${baseUrl}`,
      `userStart=${userStart}`,
      `userCount=${userCount}`,
      `sleepMs=${sleepMs}`,
      `outputFile=${outputFile}`,
    ].join(' ')
  );

  const tokens = [];

  for (let offset = 0; offset < userCount; offset += 1) {
    const user = userForSequence(userStart + offset);
    const tokenEntry = await loginAndGetToken(user);
    tokens.push(tokenEntry);
    await sleep(sleepMs);
  }

  const outputDir = path.dirname(outputFile);
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(outputFile, `${JSON.stringify(tokens, null, 2)}\n`, 'utf8');

  console.log(
    [
      '[node][login-users] run finished',
      `startedAt=${startedAt}`,
      `finishedAt=${formatKst()}`,
      `tokenCount=${tokens.length}`,
      `outputFile=${outputFile}`,
    ].join(' ')
  );
}

main().catch((error) => {
  console.error('[node][login-users] run failed', error.message);
  process.exitCode = 1;
});
