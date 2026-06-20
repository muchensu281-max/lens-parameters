#!/usr/bin/env node
'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const salt = 'LENS_STATIC_CARD_V1';
const root = path.resolve(__dirname, '..');
const cardsPath = path.join(root, 'js', 'cards.js');
const outDir = path.join(root, 'data');

const args = process.argv.slice(2);
const count = Number.parseInt(args[0] || '20', 10);
const plan = (args[1] || '30d').toLowerCase();
const note = args.slice(2).join(' ') || '';

function formatCode(raw) {
  return raw.match(/.{1,4}/g).join('-');
}

function randomCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let raw = '';
  for (let i = 0; i < 16; i++) raw += alphabet[crypto.randomInt(alphabet.length)];
  return formatCode(raw);
}

function hashCode(code) {
  return crypto.createHash('sha256').update(`${salt}:${code}`).digest('hex');
}

function expiryFor(planName) {
  if (['forever', 'permanent', 'perm', '永久'].includes(planName)) return '';
  const days = planName === '7d' || planName === '7天' ? 7 : 30;
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

function typeFor(planName) {
  if (['forever', 'permanent', 'perm', '永久'].includes(planName)) return 'permanent';
  if (planName === '7d' || planName === '7天') return '7d';
  return '30d';
}

function readExistingEntries() {
  if (!fs.existsSync(cardsPath)) return [];
  const text = fs.readFileSync(cardsPath, 'utf8');
  const configMatch = text.match(/window\.LENS_CARD_CONFIG\s*=\s*({[\s\S]*?});?\s*$/);
  if (configMatch) {
    try {
      const fn = new Function(`return ${configMatch[1]};`);
      const config = fn();
      if (Array.isArray(config.entries)) return config.entries;
      if (Array.isArray(config.hashes)) return config.hashes.map(hash => ({
        hash,
        type: 'legacy',
        expiresAt: '',
        note: '旧版永久卡',
      }));
    } catch {
      // Fall through to regex.
    }
  }
  return Array.from(text.matchAll(/'([a-f0-9]{64})'/g), match => ({
    hash: match[1],
    type: 'legacy',
    expiresAt: '',
    note: '旧版永久卡',
  }));
}

function writeCards(entries) {
  const js = `window.LENS_CARD_CONFIG = {
  salt: '${salt}',
  entries: ${JSON.stringify(entries, null, 2)}
};
`;
  fs.writeFileSync(cardsPath, js);
}

function writeSalesFile(rows, planType) {
  fs.mkdirSync(outDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const file = path.join(outDir, `sales-${planType}-${stamp}.csv`);
  const header = 'code,type,expiresAt,note,createdAt\n';
  const body = rows.map(row => [
    row.code,
    row.type,
    row.expiresAt || 'permanent',
    row.note,
    row.createdAt,
  ].map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
  fs.writeFileSync(file, header + body + '\n');
  return file;
}

if (!Number.isFinite(count) || count <= 0) {
  console.error('Usage: npm run cards -- <count> <7d|30d|permanent> [note]');
  process.exit(1);
}

const existing = readExistingEntries();
const knownHashes = new Set(existing.map(item => item.hash));
const type = typeFor(plan);
const expiresAt = expiryFor(plan);
const createdAt = new Date().toISOString();
const rows = [];

while (rows.length < count) {
  const code = randomCode();
  const hash = hashCode(code);
  if (knownHashes.has(hash)) continue;
  knownHashes.add(hash);
  rows.push({
    code,
    hash,
    type,
    expiresAt,
    note,
    createdAt,
  });
}

const entries = existing.concat(rows.map(({ hash, type: rowType, expiresAt: rowExpiresAt, note: rowNote, createdAt: rowCreatedAt }) => ({
  hash,
  type: rowType,
  expiresAt: rowExpiresAt,
  note: rowNote,
  createdAt: rowCreatedAt,
})));

writeCards(entries);
const salesFile = writeSalesFile(rows, type);

console.log(`Generated ${rows.length} ${type} cards`);
console.log(`Expires at: ${expiresAt || 'permanent'}`);
console.log(`Plain sales file: ${salesFile}`);
console.log(`Hash config: ${cardsPath}`);
