import { chromium } from '@playwright/test';
import { spawn } from 'child_process';
import http from 'http';

const PORT = 3010;
const BASE_URL = `http://localhost:${PORT}`;

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

async function run() {
  console.log(`Starting Next.js production server on port ${PORT}...`);
  const server = spawn('npx', ['next', 'start', '-p', String(PORT)], {
    shell: true,
    stdio: 'ignore',
  });

  try {
    await waitForServer(`${BASE_URL}/api/health`, 30000);
    console.log('Next.js server is ready.');

    const browser = await chromium.launch();
    const context = await browser.newContext();

    // Authenticate via demo
    const apiRes = await context.request.post(`${BASE_URL}/api/auth/demo`);
    if (!apiRes.ok()) {
      throw new Error(`Demo login failed with status ${apiRes.status()}`);
    }
    console.log('Authenticated with demo account.');

    const page = await context.newPage();
    await page.setViewportSize({ width: 1440, height: 900 });

    const routesToCheck = [
      { name: 'Dashboard', path: '/dashboard', minHeight: 2200 },
      { name: 'Landing', path: '/', minHeight: 2000 },
      { name: 'Grants Ledger', path: '/grants', minHeight: 800 },
      { name: 'Calculator', path: '/calculator', minHeight: 900 },
      { name: 'Scenarios', path: '/scenarios', minHeight: 900 },
      { name: 'Action Centre', path: '/actions', minHeight: 800 },
      { name: 'Reports', path: '/reports', minHeight: 800 },
      { name: 'Option Pool', path: '/pool', minHeight: 900 },
      { name: 'Learn Index', path: '/learn', minHeight: 1200 },
      { name: 'Equity Glossary', path: '/learn/glossary', minHeight: 1500 },
      { name: 'Offer Checklist', path: '/learn/checklist', minHeight: 1200 },
      { name: 'Equity Quiz', path: '/learn/quiz', minHeight: 800 },
      { name: 'Research Market', path: '/research/market', minHeight: 900 },
      { name: 'Research Companies', path: '/research/companies', minHeight: 800 },
    ];

    console.log('\n============================================================');
    console.log('VESTLY CONTENT VOLUME & PAGE HEIGHT AUDIT');
    console.log('============================================================');

    let allPassed = true;

    for (const route of routesToCheck) {
      await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(500);

      const height = await page.evaluate(() => {
        return Math.max(
          document.body.scrollHeight,
          document.body.offsetHeight,
          document.documentElement.clientHeight,
          document.documentElement.scrollHeight,
          document.documentElement.offsetHeight
        );
      });

      const passed = height >= route.minHeight;
      if (!passed) allPassed = false;

      const status = passed ? 'PASS' : 'WARN';
      console.log(
        `[${status}] ${route.name.padEnd(22)}: ${String(height).padStart(5)}px (target >= ${route.minHeight}px)`
      );
    }

    console.log('============================================================');
    console.log(allPassed ? 'ALL CONTENT HEIGHT CHECKS PASSED' : 'SOME CHECKS BELOW MINIMUM');
    console.log('============================================================\n');

    await browser.close();
  } finally {
    console.log('Stopping test server...');
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', String(server.pid), '/f', '/t'], { stdio: 'ignore' });
    } else {
      server.kill('SIGTERM');
    }
  }
}

run().catch((err) => {
  console.error('Content height verification failed:', err);
  process.exit(1);
});
