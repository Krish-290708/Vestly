#!/usr/bin/env node
/**
 * scripts/check-copy.mjs
 *
 * Scans src/ and fails on banned marketing words and AI/hype jargon
 * per "The Ledger" copy rules (Section C5).
 *
 * Banned words:
 *   Premium, Seamless, Unlock, Elevate, Empower, Leverage,
 *   Supercharge, Robust, Comprehensive, Cutting-edge,
 *   Institutional-grade, Journey, Game-changing, AI-powered
 *
 * Usage:
 *   node scripts/check-copy.mjs            # Exits with 1 if banned words are found
 *   node scripts/check-copy.mjs --report   # Prints hits and count, exits 0
 */

import fs from 'node:fs';
import path from 'node:path';

const SRC_DIR = path.resolve(process.cwd(), 'src');

const BANNED_PATTERNS = [
  { name: 'Premium', regex: /\bpremium\b/gi },
  { name: 'Seamless', regex: /\bseamless(ly)?\b/gi },
  { name: 'Unlock', regex: /\bunlock(s|ed|ing)?\b/gi },
  { name: 'Elevate', regex: /\belevat(e|es|ed|ing)\b/gi },
  { name: 'Empower', regex: /\bempower(s|ed|ing)?\b/gi },
  { name: 'Leverage', regex: /\b(leverage(s|d)?|leveraging)\b/gi },
  { name: 'Supercharge', regex: /\bsupercharg(e|es|ed|ing)?\b/gi },
  { name: 'Robust', regex: /\brobust(ness|ly)?\b/gi },
  { name: 'Comprehensive', regex: /\bcomprehensive(ly)?\b/gi },
  { name: 'Cutting-edge', regex: /\bcutting[- ]edge\b/gi },
  { name: 'Institutional-grade', regex: /\binstitutional[- ]grade\b/gi },
  { name: 'Journey', regex: /\bjourney(s)?\b/gi },
  { name: 'Game-changing', regex: /\bgame[- ]changing\b/gi },
  { name: 'AI-powered', regex: /\bai[- ]powered\b/gi },
];

function walk(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.next') {
        files.push(...walk(fullPath));
      }
    } else if (/\.(tsx?|jsx?|mjs|cjs)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

const files = walk(SRC_DIR);
const hits = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  const relPath = path.relative(process.cwd(), file).replace(/\\/g, '/');

  lines.forEach((line, lineIndex) => {
    for (const { name, regex } of BANNED_PATTERNS) {
      regex.lastIndex = 0;
      let match;
      while ((match = regex.exec(line)) !== null) {
        hits.push({
          file: relPath,
          line: lineIndex + 1,
          col: match.index + 1,
          word: match[0],
          rule: name,
          context: line.trim(),
        });
      }
    }
  });
}

console.log('============================================================');
console.log('VESTLY COPY GATE AUDIT (The Ledger)');
console.log('============================================================');
console.log(`Files scanned: ${files.length} across src/`);
console.log(`Banned words found: ${hits.length}`);
console.log('');

if (hits.length > 0) {
  console.log('Violations:');
  hits.forEach((h, i) => {
    console.log(
      `  ${i + 1}. ${h.file}:${h.line}:${h.col} [${h.rule}] matched "${h.word}"`
    );
    console.log(`     > ${h.context.substring(0, 100)}`);
  });
  console.log('');
} else {
  console.log('All copy clean: 0 banned words found.');
}

console.log(`Summary string for report:`);
console.log(`  banned words found ${hits.length}`);
console.log('============================================================');

const isReportOnly = process.argv.includes('--report') || process.argv.includes('--no-fail');

if (hits.length > 0 && !isReportOnly) {
  console.error(`\n[FAIL] Copy gate failed: ${hits.length} banned word(s) in src/.`);
  process.exit(1);
}

process.exit(0);
