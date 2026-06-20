#!/usr/bin/env node
'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const count = Number.parseInt(process.argv[2] || '20', 10);
const salt = 'LENS_STATIC_CARD_V1';
const root = path.resolve(__dirname, '..');
const cardsPath = path.join(root, 'js', 'cards.js');
const outDir = path.join(root, 'data');
const outFile = path.join(outDir, `generated-cards-${new Date().toISOString().replace(/[:.]/g, '-')}.txt`);

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

const codes = ['DEMO-2026-LENS-0001'];
while (codes.length < count + 1) {
  const code = randomCode();
  if (!codes.includes(code)) codes.push(code);
}

const hashes = codes.map(hashCode);
const js = `window.LENS_CARD_CONFIG = {
  salt: '${salt}',
  hashes: [
${hashes.map(h => `    '${h}'`).join(',\n')}
  ]
};
`;

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(cardsPath, js);
fs.writeFileSync(outFile, codes.join('\n') + '\n');

console.log(`Generated ${codes.length} cards`);
console.log(`Plain cards: ${outFile}`);
console.log(`Hash config: ${cardsPath}`);
