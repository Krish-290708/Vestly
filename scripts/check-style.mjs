#!/usr/bin/env node
/**
 * scripts/check-style.mjs
 *
 * Scans src/ and reports exact counts of style anti-patterns that violate
 * "The Ledger" design system (Section C5).
 *
 * Counts across src/:
 * - Sparkles (icon or text)
 * - bg-gradient (Tailwind gradient classes)
 * - rounded-2xl / rounded-3xl (bubble cards)
 * - slate- (hardcoded legacy navy/slate classes)
 * - emerald- (hardcoded legacy green classes)
 * - emoji (Unicode emoji characters in UI text)
 *
 * Note: Counts are expected to be non-zero until Phase 10.
 * In Phase 10, all counts must reach 0.
 */

import fs from 'node:fs';
import path from 'node:path';

const SRC_DIR = path.resolve(process.cwd(), 'src');

const PATTERNS = {
  sparkles: /\bSparkles\b/g,
  bgGradient: /bg-gradient(-\w+)?/g,
  rounded2xl: /\brounded-2xl\b/g,
  rounded3xl: /\brounded-3xl\b/g,
  slate: /\bslate-\w+(?:\/\d+)?/g,
  emerald: /\bemerald-\w+(?:\/\d+)?/g,
  // Standard Unicode ranges for emoji
  emoji: /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu,
};

function walk(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.next') {
        files.push(...walk(fullPath));
      }
    } else if (/\.(tsx?|jsx?|css)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

const files = walk(SRC_DIR);
const totals = {
  sparkles: 0,
  bgGradient: 0,
  rounded2xl: 0,
  rounded3xl: 0,
  slate: 0,
  emerald: 0,
  emoji: 0,
};

const fileHits = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const relPath = path.relative(process.cwd(), file).replace(/\\/g, '/');

  const fileCounts = {
    sparkles: (content.match(PATTERNS.sparkles) || []).length,
    bgGradient: (content.match(PATTERNS.bgGradient) || []).length,
    rounded2xl: (content.match(PATTERNS.rounded2xl) || []).length,
    rounded3xl: (content.match(PATTERNS.rounded3xl) || []).length,
    slate: (content.match(PATTERNS.slate) || []).length,
    emerald: (content.match(PATTERNS.emerald) || []).length,
    emoji: (content.match(PATTERNS.emoji) || []).length,
  };

  const fileTotal = Object.values(fileCounts).reduce((a, b) => a + b, 0);
  if (fileTotal > 0) {
    fileHits.push({ file: relPath, counts: fileCounts, total: fileTotal });
  }

  for (const key of Object.keys(totals)) {
    totals[key] += fileCounts[key];
  }
}

const rounded2xl3xl = totals.rounded2xl + totals.rounded3xl;

console.log('============================================================');
console.log('VESTLY STYLE GATE AUDIT (The Ledger)');
console.log('============================================================');
console.log(`Files scanned: ${files.length} across src/`);
console.log(`Files with style legacy tokens: ${fileHits.length}`);
console.log('');
console.log('CURRENT COUNTS:');
console.log(`  Sparkles:        ${totals.sparkles}`);
console.log(`  bg-gradient:     ${totals.bgGradient}`);
console.log(`  rounded-2xl/3xl: ${rounded2xl3xl} (2xl: ${totals.rounded2xl}, 3xl: ${totals.rounded3xl})`);
console.log(`  slate-*:         ${totals.slate}`);
console.log(`  emerald-*:       ${totals.emerald}`);
console.log(`  emoji:           ${totals.emoji}`);
console.log('');
console.log(`Summary string for report:`);
console.log(`  Sparkles ${totals.sparkles} | bg-gradient ${totals.bgGradient} | rounded-2xl/3xl ${rounded2xl3xl} | slate- ${totals.slate} | emerald- ${totals.emerald} | emoji ${totals.emoji}`);
console.log('============================================================');

if (process.argv.includes('--strict')) {
  const grandTotal = totals.sparkles + totals.bgGradient + rounded2xl3xl + totals.slate + totals.emerald + totals.emoji;
  if (grandTotal > 0) {
    console.error(`\n[FAIL] --strict mode active: ${grandTotal} style violations found.`);
    process.exit(1);
  }
}

process.exit(0);
