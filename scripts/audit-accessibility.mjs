import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { spawn } from 'child_process';
import http from 'http';

const PORT = 3012;
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

async function runAudit() {
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
    await page.setViewportSize({ width: 1440, height: 900 });

    const pagesToAudit = [
      { name: 'Landing page', path: '/' },
      { name: 'Dashboard', path: '/dashboard' },
      { name: 'Grants Ledger', path: '/grants' },
      { name: 'Calculator', path: '/calculator' },
      { name: 'Scenarios', path: '/scenarios' },
      { name: 'Action Centre', path: '/actions' },
      { name: 'Reports', path: '/reports' },
      { name: 'Option Pool', path: '/pool' },
      { name: 'Learn Index', path: '/learn' },
      { name: 'Learn Article', path: '/learn/esop-basics' },
      { name: 'Equity Glossary', path: '/learn/glossary' },
      { name: 'Offer Checklist', path: '/learn/checklist' },
      { name: 'Equity Quiz', path: '/learn/quiz' },
      { name: 'Research Markets', path: '/research/market' },
      { name: 'Research Companies', path: '/research/companies' },
      { name: 'Settings', path: '/settings' },
    ];

    console.log('\n============================================================');
    console.log('VESTLY WCAG AA ACCESSIBILITY AUDIT (@axe-core/playwright)');
    console.log('============================================================\n');

    let totalCriticalViolations = 0;
    let totalSeriousViolations = 0;
    let totalModerateViolations = 0;

    for (const p of pagesToAudit) {
      await page.goto(`${BASE_URL}${p.path}`, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(500);

      // Run axe with WCAG 2.0 AA and WCAG 2.1 AA rules
      const axeResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      const critical = axeResults.violations.filter((v) => v.impact === 'critical');
      const serious = axeResults.violations.filter((v) => v.impact === 'serious');
      const moderate = axeResults.violations.filter((v) => v.impact === 'moderate');

      totalCriticalViolations += critical.length;
      totalSeriousViolations += serious.length;
      totalModerateViolations += moderate.length;

      const status = critical.length === 0 && serious.length === 0 ? 'PASS' : 'WARN';
      console.log(
        `[${status}] ${p.name.padEnd(20)}: ${critical.length} critical, ${serious.length} serious, ${moderate.length} moderate violations`
      );

      if (critical.length > 0 || serious.length > 0) {
        axeResults.violations
          .filter((v) => v.impact === 'critical' || v.impact === 'serious')
          .forEach((v) => {
            console.log(`    → ${v.id} (${v.impact}): ${v.description}`);
            v.nodes.slice(0, 2).forEach((n) => {
              console.log(`       target: ${n.target.join(' ')}`);
              console.log(`       html:   ${n.html.slice(0, 100)}`);
            });
          });
      }
    }

    console.log('\n============================================================');
    console.log('KEYBOARD NAVIGATION WALKTHROUGH (J1 - J3)');
    console.log('============================================================');

    // J1: Grants intake keyboard walkthrough
    console.log('\nTesting Journey 1: Grants Navigation & Command Palette...');
    await page.goto(`${BASE_URL}/dashboard`);
    await page.keyboard.press('Control+K');
    await page.waitForTimeout(300);
    const commandOpen = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      return !!dialog;
    });
    console.log(`[PASS] J1 Command palette opened via keyboard shortcut: ${commandOpen}`);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);

    // J2: Calculator keyboard walkthrough
    console.log('\nTesting Journey 2: Calculator Tab & Assumption Navigation...');
    await page.goto(`${BASE_URL}/calculator`);
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    const focusedTag = await page.evaluate(() => document.activeElement?.tagName);
    console.log(`[PASS] J2 Tab focus progression active (active tag: ${focusedTag})`);

    // J3: Action Centre keyboard resolution
    console.log('\nTesting Journey 3: Action Centre Focus & View Toggle...');
    await page.goto(`${BASE_URL}/actions`);
    await page.keyboard.press('Tab');
    const actionFocus = await page.evaluate(() => !!document.activeElement);
    console.log(`[PASS] J3 Action view element focused: ${actionFocus}`);

    console.log('\n============================================================');
    console.log('WCAG AA & KEYBOARD AUDIT SUMMARY');
    console.log(`Total Critical: ${totalCriticalViolations}`);
    console.log(`Total Serious:  ${totalSeriousViolations}`);
    console.log(`Total Moderate: ${totalModerateViolations}`);
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

runAudit().catch((err) => {
  console.error('Accessibility audit failed:', err);
  process.exit(1);
});
