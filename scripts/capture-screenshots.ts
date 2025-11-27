#!/usr/bin/env tsx
import path from 'node:path';
import { promises as fs } from 'node:fs';
import { chromium } from 'playwright';
import type { Page } from 'playwright';

const BASE_URL = process.env.APP_BASE_URL ?? 'https://simpleautomate.co.uk';
const RESULTS_DIR = path.resolve(process.cwd(), 'docs', 'test-results');
const ACCOUNT_FILE = path.join(RESULTS_DIR, 'account.json');
const SCREENSHOT_DIR = path.join(RESULTS_DIR, 'screenshots');

type Account = {
  email: string;
  password: string;
  contactName: string;
};

const log = (message: string) => console.log(`[screenshots] ${message}`);

const ensureDirs = async () => {
  await fs.mkdir(SCREENSHOT_DIR, { recursive: true });
};

const loadAccount = async (): Promise<Account> => {
  const raw = await fs.readFile(ACCOUNT_FILE, 'utf-8');
  return JSON.parse(raw) as Account;
};

const capture = async (page: Page, options: { url?: string; file: string; waitFor?: string }) => {
  if (options.url) {
    await page.goto(`${BASE_URL}${options.url}`, { waitUntil: 'networkidle' });
  }
  if (options.waitFor) {
    await page.waitForSelector(options.waitFor, { timeout: 15000 });
  }
  await page.waitForTimeout(1000);
  const targetPath = path.join(SCREENSHOT_DIR, options.file);
  await page.screenshot({ path: targetPath, fullPage: true });
  log(`Saved ${options.file}`);
};

const main = async () => {
  const account = await loadAccount();
  await ensureDirs();

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  log('Logging in to capture UI');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await page.fill('input[name="email"]', account.email);
  await page.fill('input[name="password"]', account.password);
  await Promise.all([
    page.waitForNavigation({ url: `${BASE_URL}/dashboard`, waitUntil: 'networkidle' }),
    page.click('button:has-text("Log in")'),
  ]);

  await capture(page, { file: '01-dashboard.png' });
  await capture(page, {
    url: '/contacts',
    file: '02-contacts.png',
    waitFor: `text=${account.contactName}`,
  });
  await capture(page, {
    url: '/pipelines',
    file: '03-pipelines.png',
    waitFor: `text=${account.contactName}`,
  });
  await capture(page, {
    url: '/automations',
    file: '04-automations.png',
    waitFor: 'text=Smoke Follow-up',
  });
  await capture(page, {
    url: '/campaigns',
    file: '05-campaigns.png',
    waitFor: 'text=Smoke Test Campaign',
  });
  await capture(page, {
    url: '/templates',
    file: '06-templates.png',
    waitFor: 'text=Smoke Template',
  });
  await capture(page, {
    url: '/settings',
    file: '07-settings.png',
    waitFor: 'text=Billing',
  });

  await browser.close();
  log('All screenshots captured');
};

main().catch((error) => {
  console.error('[screenshots] FAILED', error);
  process.exit(1);
});

