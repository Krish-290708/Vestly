import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const OUT_DIR = path.resolve('.redesign/before');

const routes = [
  { name: 'landing', path: '/' },
  { name: 'login', path: '/login' },
  { name: 'register', path: '/register' },
  { name: 'dashboard', path: '/dashboard' },
  { name: 'grants', path: '/grants' },
  { name: 'calculator', path: '/calculator' },
  { name: 'scenarios', path: '/scenarios' },
  { name: 'actions', path: '/actions' },
  { name: 'reports', path: '/reports' },
  { name: 'pool', path: '/pool' },
  { name: 'learn', path: '/learn' },
  { name: 'research-companies', path: '/research/companies' },
  { name: 'research-market', path: '/research/market' },
  { name: 'research-news', path: '/research/news' },
  { name: 'research-watchlist', path: '/research/watchlist' },
];

async function capture() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  const browser = await chromium.launch();
  const context = await browser.newContext();

  // Sign in through /api/auth/demo
  console.log(`Authenticating via POST ${BASE_URL}/api/auth/demo ...`);
  const apiRes = await context.request.post(`${BASE_URL}/api/auth/demo`);
  if (!apiRes.ok()) {
    console.error(`Demo login failed with status ${apiRes.status()}`);
    process.exit(1);
  }
  console.log('Demo login succeeded.');

  const page = await context.newPage();

  for (const r of routes) {
    const url = `${BASE_URL}${r.path}`;
    console.log(`Navigating to ${r.name} (${url}) ...`);

    // 1440x900
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000); // Wait for animations/charts
    const dest1440 = path.join(OUT_DIR, `${r.name}-1440.png`);
    await page.screenshot({ path: dest1440, fullPage: true });

    // 390x844
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(500);
    const dest390 = path.join(OUT_DIR, `${r.name}-390.png`);
    await page.screenshot({ path: dest390, fullPage: true });

    console.log(`Captured ${r.name} at 1440x900 and 390x844.`);
  }

  await browser.close();
  console.log('All baseline screenshots captured.');
}

capture().catch((err) => {
  console.error('Error capturing baseline screenshots:', err);
  process.exit(1);
});

