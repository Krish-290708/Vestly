import { chromium } from '@playwright/test';
import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

const PORT = 3011;
const BASE_URL = `http://localhost:${PORT}`;
const OUT_DIR = path.resolve('.redesign/after');

const VIEWPORTS = [
  { name: '1920', width: 1920, height: 1080 },
  { name: '1440', width: 1440, height: 900 },
  { name: '1024', width: 1024, height: 768 },
  { name: '768', width: 768, height: 1024 },
  { name: '390', width: 390, height: 844 },
  { name: '360', width: 360, height: 800 },
];

const ROUTES = [
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
  { name: 'learn-article', path: '/learn/esop-basics' },
  { name: 'learn-glossary', path: '/learn/glossary' },
  { name: 'learn-checklist', path: '/learn/checklist' },
  { name: 'learn-quiz', path: '/learn/quiz' },
  { name: 'research-companies', path: '/research/companies' },
  { name: 'research-market', path: '/research/market' },
  { name: 'research-news', path: '/research/news' },
  { name: 'research-watchlist', path: '/research/watchlist' },
  { name: 'settings', path: '/settings' },
];

function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    function ping() {
      http
        .get(url, (res) => {
          if (res.statusCode === 200) {
            resolve();
          } else {
            retry();
          }
        })
        .on('error', () => {
          retry();
        });
    }

    function retry() {
      if (Date.now() - start > timeoutMs) {
        reject(new Error(`Server at ${url} did not respond within ${timeoutMs}ms`));
      } else {
        setTimeout(ping, 500);
      }
    }

    ping();
  });
}

async function capture() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  console.log(`Starting Next.js server on port ${PORT}...`);
  const server = spawn('npx', ['next', 'start', '-p', String(PORT)], {
    shell: true,
    stdio: 'ignore',
  });

  try {
    await waitForServer(`${BASE_URL}/api/health`, 30000);
    console.log('Next.js server is ready.');

    const browser = await chromium.launch();
    const context = await browser.newContext();

    // Authenticate via /api/auth/demo
    console.log('Authenticating with demo account...');
    const apiRes = await context.request.post(`${BASE_URL}/api/auth/demo`);
    if (!apiRes.ok()) {
      throw new Error(`Demo login failed with status ${apiRes.status()}`);
    }
    console.log('Authentication successful.');

    const page = await context.newPage();

    console.log(`\nCapturing responsive screenshots for ${ROUTES.length} routes across ${VIEWPORTS.length} viewports...`);

    for (const r of ROUTES) {
      const url = `${BASE_URL}${r.path}`;
      console.log(`Navigating to ${r.name} (${url})...`);

      for (const vp of VIEWPORTS) {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(400); // Allow charts/transitions to settle

        const filename = `${r.name}-${vp.name}.png`;
        const dest = path.join(OUT_DIR, filename);
        await page.screenshot({ path: dest, fullPage: true });
      }

      console.log(`✓ Captured ${r.name} across all viewports.`);
    }

    await browser.close();
    console.log(`\nAll screenshots successfully saved to ${OUT_DIR}`);
  } finally {
    console.log('Stopping test server...');
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', String(server.pid), '/f', '/t'], { stdio: 'ignore' });
    } else {
      server.kill('SIGTERM');
    }
  }
}

capture().catch((err) => {
  console.error('Error capturing after screenshots:', err);
  process.exit(1);
});
