// Tests generated using AI
// Standalone login script — run via `npm run test:e2e:login`
// Opens Edge, waits for you to log in, then saves the session.

import { chromium } from '@playwright/test';
import { createInterface } from 'readline';
import { mkdirSync } from 'fs';

const AUTH_FILE = 'tests/.auth/session.json';
const BASE_URL = 'http://localhost:4000';

mkdirSync('tests/.auth', { recursive: true });

const browser = await chromium.launch({ channel: 'msedge', headless: false });
const context = await browser.newContext();
const page = await context.newPage();

await page.goto(BASE_URL);

console.log('\n-------------------------------------------');
console.log('Please log in to Chromatix in the browser.');
console.log('Once you are fully logged in, press Enter here to save the session.');
console.log('-------------------------------------------\n');

await new Promise((resolve) => {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  rl.question('', () => {
    rl.close();
    resolve();
  });
});

await context.storageState({ path: AUTH_FILE });
console.log('Session saved to', AUTH_FILE);

await browser.close();
process.exit(0);
