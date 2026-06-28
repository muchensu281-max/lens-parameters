#!/usr/bin/env node
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const { exiftool } = require('exiftool-vendored');

const app = express();
const root = __dirname;
const port = Number(process.env.PORT || 4173);
const adminToken = process.env.ADMIN_TOKEN || 'LENS-ADMIN-2026';
const dataDir = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(root, 'data');
const cardsFile = path.join(dataDir, 'cards.json');
const logsFile = path.join(dataDir, 'logs.json');
const demoCode = 'DEMO-2026-LENS-0001';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: 1,
    fileSize: 50 * 1024 * 1024,
    fieldSize: 1024 * 1024,
  },
});

const runtimeCaps = {
  heifRead: Boolean(sharp.versions.heif),
  heifHevcWrite: false,
  heifAvifWrite: false,
  exiftool: true,
  sharp: sharp.versions.sharp,
  vips: sharp.versions.vips,
};

app.use(express.json({ limit: '1mb' }));
app.use(express.static(root, {
  etag: false,
  lastModified: false,
  setHeaders(res) {
    res.setHeader('Cache-Control', 'no-store');
  },
}));

function nowIso() {
  return new Date().toISOString();
}

function normalizeCode(code) {
  return String(code || '').trim().toUpperCase();
}

function maskCode(code) {
  const clean = normalizeCode(code);
  if (clean.length <= 8) return clean ? '****' : '';
  return `${clean.slice(0, 4)}…${clean.slice(-4)}`;
}

function randomCode(prefix = 'LENS') {
  const bytes = crypto.randomBytes(10).toString('hex').toUpperCase();
  return `${prefix}-${bytes.slice(0, 4)}-${bytes.slice(4, 8)}-${bytes.slice(8, 12)}-${bytes.slice(12, 16)}`;
}

async function ensureDataFiles() {
  await fs.promises.mkdir(dataDir, { recursive: true });

  if (!fs.existsSync(cardsFile)) {
    const seed = {
      cards: [{
        id: crypto.randomUUID(),
        code: demoCode,
        active: true,
        maxUses: 999,
        usedCount: 0,
        note: '本地演示卡密',
        createdAt: nowIso(),
        updatedAt: nowIso(),
        expiresAt: '',
      }],
    };
    await fs.promises.writeFile(cardsFile, JSON.stringify(seed, null, 2));
  }

  if (!fs.existsSync(logsFile)) {
    await fs.promises.writeFile(logsFile, JSON.stringify({ logs: [] }, null, 2));
  }
}

async function readJson(file, fallback) {
  try {
    return JSON.parse(await fs.promises.readFile(file, 'utf8'));
  } catch {
    return fallback;
  }
}

async function writeJson(file, value) {
  await fs.promises.writeFile(file, JSON.stringify(value, null, 2));
}

async function loadCards() {
  const data = await readJson(cardsFile, { cards: [] });
  return Array.isArray(data.cards) ? data.cards : [];
}

async function saveCards(cards) {
  await writeJson(cardsFile, { cards });
}

async function appendLog(event) {
  const data = await readJson(logsFile, { logs: [] });
  const logs = Array.isArray(data.logs) ? data.logs : [];
  logs.unshift({
    id: crypto.randomUUID(),
    time: nowIso(),
    ...event,
  });
  await writeJson(logsFile, { logs: logs.slice(0, 500) });
}

function cardStatus(card) {
  if (!card) return { ok: false, reason: '卡密不存在' };
  if (!card.active) return { ok: false, reason: '卡密已停用' };
  if (card.expiresAt && new Date(card.expiresAt).getTime() < Date.now()) {
    return { ok: false, reason: '卡密已过期' };
  }
  if (Number(card.maxUses) > 0 && Number(card.usedCount || 0) >= Number(card.maxUses)) {
    return { ok: false, reason: '卡密次数已用完' };
  }
  return {
    ok: true,
    remaining: Number(card.maxUses) > 0 ? Math.max(0, Number(card.maxUses) - Number(card.usedCount || 0)) : null,
  };
}

async function findCard(code) {
  const normalized = normalizeCode(code);
  const cards = await loadCards();
  return { cards, card: cards.find(c => normalizeCode(c.code) === normalized) };
}

async function validateCard(code) {
  const { card } = await findCard(code);
  const status = cardStatus(card);
  return { card, ...status };
}

async function markCardUsed(code, deviceHash = '') {
  const normalized = normalizeCode(code);
  const cards = await loadCards();
  const card = cards.find(c => normalizeCode(c.code) === normalized);
  const status = cardStatus(card);
  if (!status.ok) return { card, ...status };

  card.usedCount = Number(card.usedCount || 0) + 1;
  card.lastUsedAt = nowIso();
  card.lastDeviceHash = String(deviceHash || '').slice(0, 128);
  card.updatedAt = nowIso();
  await saveCards(cards);
  return { card, ...cardStatus(card), used: true };
}

function requireAdmin(req, res, next) {
  const token = req.get('x-admin-token') || req.query.token || req.body?.token;
  if (token !== adminToken) {
    res.status(401).json({ code: 401, msg: '后台令牌无效' });
    return;
  }
  next();
}

function parseMeta(value) {
  if (!value) return {};
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

function toPositiveInt(value) {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function sourceIsHeif(file) {
  const name = String(file?.originalname || '').toLowerCase();
  const type = String(file?.mimetype || '').toLowerCase();
  return type.includes('heif') || type.includes('heic') || /\.(heic|heif)$/.test(name);
}

function chooseFormat(requested, file) {
  const fmt = String(requested || 'jpeg').toLowerCase();
  if (fmt === 'same') return sourceIsHeif(file) ? 'heif' : 'jpeg';
  if (fmt === 'heif' || fmt === 'heic') return 'heif';
  return 'jpeg';
}

function parseShutter(value) {
  const s = String(value || '').trim();
  if (!s) return '';
  if (/^\d+\s*\/\s*\d+$/.test(s)) return s.replace(/\s+/g, '');
  const n = Number.parseFloat(s);
  if (!Number.isFinite(n) || n <= 0) return '';
  return n < 1 ? `1/${Math.round(1 / n)}` : String(n);
}

function normalizeLensModelForExif(value) {
  return String(value || '')
    .trim()
    .replace(/\s+\d+(?:\.\d+)?\s*mm\s*[ƒfF]\s*\d+(?:\.\d+)?\s*$/u, '')
    .trim();
}

function hasFullLensLabel(value) {
  return /\d+(?:\.\d+)?\s*mm\s*[ƒfF]\s*\d+(?:\.\d+)?\s*$/u.test(String(value || ''));
}

function formatExifDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = n => String(n).padStart(2, '0');
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join(':') + ' ' + [
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join(':');
}

function buildExifTags(meta, info) {
  const tags = {};
  if (meta.make) tags.Make = String(meta.make);
  if (meta.model) tags.Model = String(meta.model);
  if (meta.software) tags.Software = String(meta.software);
  const lensModel = String(meta.lensModel || '').trim();
  const fullLensLabel = hasFullLensLabel(lensModel);
  if (lensModel) tags.LensModel = lensModel;

  if (meta.fNumber) {
    const fNumber = Number.parseFloat(meta.fNumber);
    tags.FNumber = fNumber;
    if (Number.isFinite(fNumber) && fNumber > 0) tags.ApertureValue = Number((Math.log2(fNumber * fNumber)).toFixed(2));
  }
  if (meta.iso) tags.ISO = Number.parseInt(meta.iso, 10);
  if (!fullLensLabel) {
    if (meta.focalLength) tags.FocalLength = Number.parseFloat(meta.focalLength);
    if (meta.focalLength35) tags.FocalLengthIn35mmFormat = Number.parseInt(meta.focalLength35, 10);
  }
  if (meta.exposureBias !== '' && meta.exposureBias != null) tags.ExposureCompensation = Number.parseFloat(meta.exposureBias);

  const shutter = parseShutter(meta.exposureTime);
  if (shutter) tags.ExposureTime = shutter;

  tags.CustomRendered = 'Normal';
  tags.SceneCaptureType = 'Standard';

  const dt = formatExifDate(meta.dateTimeOriginal);
  if (dt) {
    tags.DateTimeOriginal = dt;
    tags.CreateDate = dt;
    tags.ModifyDate = dt;
  }

  if (info.width) tags.ExifImageWidth = info.width;
  if (info.height) tags.ExifImageHeight = info.height;
  return Object.fromEntries(Object.entries(tags).filter(([, v]) => v !== '' && v != null && !Number.isNaN(v)));
}

async function writeExif(buffer, ext, tags) {
  if (!Object.keys(tags).length) return buffer;

  const tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'lens-'));
  const file = path.join(tmpDir, `out-${crypto.randomUUID()}.${ext}`);

  try {
    await fs.promises.writeFile(file, buffer);
    await exiftool.write(file, tags, ['-overwrite_original']);
    return await fs.promises.readFile(file);
  } finally {
    await fs.promises.rm(tmpDir, { recursive: true, force: true });
  }
}

async function renderImage(file, meta, requestedFormat) {
  const format = chooseFormat(requestedFormat, file);
  const width = toPositiveInt(meta.imageWidth);
  const height = toPositiveInt(meta.imageHeight);
  const lockAspect = meta.lockAspect !== false && meta.lockAspect !== 'false';
  const quality = Math.min(100, Math.max(1, toPositiveInt(meta.quality) || 95));

  if (format === 'heif' && !runtimeCaps.heifHevcWrite) {
    const err = new Error('当前后端环境不支持 HEIC/HEVC 编码，请安装带 x265/HEVC 的 libheif 后再启用 HEIC 导出。');
    err.status = 422;
    throw err;
  }

  let pipeline = sharp(file.buffer, { limitInputPixels: false }).rotate();
  if (width || height) {
    pipeline = pipeline.resize({
      width: width || undefined,
      height: height || undefined,
      fit: lockAspect ? (width && height ? 'inside' : 'cover') : (width && height ? 'fill' : 'cover'),
      withoutEnlargement: false,
    });
  }

  if (format === 'heif') {
    pipeline = pipeline.heif({ quality, compression: 'hevc' });
  } else {
    pipeline = pipeline.jpeg({ quality, mozjpeg: true });
  }

  const rendered = await pipeline.toBuffer({ resolveWithObject: true });
  const ext = format === 'heif' ? 'heic' : 'jpg';
  const mime = format === 'heif' ? 'image/heic' : 'image/jpeg';
  const exifTags = buildExifTags(meta, rendered.info);
  const data = await writeExif(rendered.data, ext, exifTags);

  return {
    data,
    ext,
    mime,
    width: rendered.info.width,
    height: rendered.info.height,
  };
}

app.get('/admin', (req, res) => {
  res.sendFile(path.join(root, 'admin.html'));
});

app.post('/api.php', async (req, res) => {
  const action = String(req.body?.action || '');
  const code = normalizeCode(req.body?.code);
  const deviceHash = String(req.body?.device_hash || 'anonymous');

  const validation = await validateCard(code);
  if (!validation.ok) {
    await appendLog({ type: 'card.verify.failed', card: maskCode(code), msg: validation.reason });
    res.json({ code: 403, msg: validation.reason || '卡密无效' });
    return;
  }

  if (action === 'verify') {
    await appendLog({ type: 'card.verify.ok', card: maskCode(code), remaining: validation.remaining });
    res.json({ code: 200, msg: '验证成功', remaining: validation.remaining });
    return;
  }

  if (action === 'use') {
    const used = await markCardUsed(code, deviceHash);
    await appendLog({ type: 'card.use', card: maskCode(code), remaining: used.remaining });
    res.json({ code: 200, msg: '使用成功', used: used.card?.usedCount || 0, remaining: used.remaining });
    return;
  }

  res.json({ code: 400, msg: '未知操作' });
});

app.get('/api/capabilities', (req, res) => {
  res.json(runtimeCaps);
});

app.get('/api/health', async (req, res) => {
  res.json({
    ok: true,
    time: nowIso(),
    runtime: {
      sharp: runtimeCaps.sharp,
      exiftool: runtimeCaps.exiftool,
      heifRead: runtimeCaps.heifRead,
      heifHevcWrite: runtimeCaps.heifHevcWrite,
    },
  });
});

app.post('/api/process', upload.single('image'), async (req, res) => {
  try {
    const validation = await validateCard(req.body.code);
    if (!validation.ok) {
      await appendLog({ type: 'process.denied', card: maskCode(req.body.code), msg: validation.reason });
      res.status(403).json({ code: 403, msg: validation.reason || '卡密无效' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ code: 400, msg: '请上传图片' });
      return;
    }

    const meta = parseMeta(req.body.meta);
    const result = await renderImage(req.file, meta, req.body.format);
    const base = path.basename(req.file.originalname || 'image', path.extname(req.file.originalname || ''));
    const fileName = `${base}_edited.${result.ext}`;

    await appendLog({
      type: 'process.ok',
      card: maskCode(req.body.code),
      fileName,
      format: result.ext,
      width: result.width,
      height: result.height,
      bytes: result.data.length,
    });

    res.setHeader('Content-Type', result.mime);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
    res.setHeader('X-File-Name', encodeURIComponent(fileName));
    res.setHeader('X-Image-Width', String(result.width));
    res.setHeader('X-Image-Height', String(result.height));
    res.send(result.data);
  } catch (err) {
    const status = err.status || 500;
    await appendLog({ type: 'process.failed', msg: err.message || '图片处理失败' });
    res.status(status).json({
      code: status,
      msg: err.message || '图片处理失败',
    });
  }
});

app.get('/api/admin/status', requireAdmin, async (req, res) => {
  const cards = await loadCards();
  const logs = await readJson(logsFile, { logs: [] });
  res.json({
    ok: true,
    runtime: runtimeCaps,
    counts: {
      cards: cards.length,
      activeCards: cards.filter(c => cardStatus(c).ok).length,
      logs: Array.isArray(logs.logs) ? logs.logs.length : 0,
    },
    adminTokenDefault: adminToken === 'LENS-ADMIN-2026',
  });
});

app.get('/api/admin/cards', requireAdmin, async (req, res) => {
  const cards = await loadCards();
  res.json({ cards: cards.map(card => ({ ...card, status: cardStatus(card) })) });
});

app.post('/api/admin/cards', requireAdmin, async (req, res) => {
  const cards = await loadCards();
  const code = normalizeCode(req.body.code || randomCode(req.body.prefix));
  if (!code) {
    res.status(400).json({ code: 400, msg: '卡密不能为空' });
    return;
  }
  if (cards.some(c => normalizeCode(c.code) === code)) {
    res.status(409).json({ code: 409, msg: '卡密已存在' });
    return;
  }

  const card = {
    id: crypto.randomUUID(),
    code,
    active: req.body.active !== false,
    maxUses: toPositiveInt(req.body.maxUses) || 1,
    usedCount: 0,
    note: String(req.body.note || ''),
    createdAt: nowIso(),
    updatedAt: nowIso(),
    expiresAt: String(req.body.expiresAt || ''),
  };
  cards.unshift(card);
  await saveCards(cards);
  await appendLog({ type: 'admin.card.create', card: maskCode(card.code) });
  res.status(201).json({ card });
});

app.post('/api/admin/cards/generate', requireAdmin, async (req, res) => {
  const count = Math.min(100, Math.max(1, toPositiveInt(req.body.count) || 1));
  const prefix = String(req.body.prefix || 'LENS').replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 10) || 'LENS';
  const cards = await loadCards();
  const created = [];

  while (created.length < count) {
    const code = randomCode(prefix);
    if (cards.some(c => normalizeCode(c.code) === code)) continue;
    const card = {
      id: crypto.randomUUID(),
      code,
      active: true,
      maxUses: toPositiveInt(req.body.maxUses) || 1,
      usedCount: 0,
      note: String(req.body.note || '批量生成'),
      createdAt: nowIso(),
      updatedAt: nowIso(),
      expiresAt: String(req.body.expiresAt || ''),
    };
    cards.unshift(card);
    created.push(card);
  }

  await saveCards(cards);
  await appendLog({ type: 'admin.card.generate', count: created.length });
  res.status(201).json({ cards: created });
});

app.patch('/api/admin/cards/:id', requireAdmin, async (req, res) => {
  const cards = await loadCards();
  const card = cards.find(c => c.id === req.params.id);
  if (!card) {
    res.status(404).json({ code: 404, msg: '卡密不存在' });
    return;
  }

  if (typeof req.body.active === 'boolean') card.active = req.body.active;
  if (req.body.maxUses != null) card.maxUses = toPositiveInt(req.body.maxUses);
  if (req.body.expiresAt != null) card.expiresAt = String(req.body.expiresAt || '');
  if (req.body.note != null) card.note = String(req.body.note || '');
  card.updatedAt = nowIso();

  await saveCards(cards);
  await appendLog({ type: 'admin.card.update', card: maskCode(card.code) });
  res.json({ card, status: cardStatus(card) });
});

app.delete('/api/admin/cards/:id', requireAdmin, async (req, res) => {
  const cards = await loadCards();
  const next = cards.filter(c => c.id !== req.params.id);
  if (next.length === cards.length) {
    res.status(404).json({ code: 404, msg: '卡密不存在' });
    return;
  }
  await saveCards(next);
  await appendLog({ type: 'admin.card.delete' });
  res.json({ ok: true });
});

app.get('/api/admin/logs', requireAdmin, async (req, res) => {
  const data = await readJson(logsFile, { logs: [] });
  res.json({ logs: Array.isArray(data.logs) ? data.logs : [] });
});

app.post('/api/admin/logs/clear', requireAdmin, async (req, res) => {
  await writeJson(logsFile, { logs: [] });
  res.json({ ok: true });
});

async function detectCapabilities() {
  const input = await sharp({
    create: {
      width: 8,
      height: 8,
      channels: 3,
      background: '#ff6699',
    },
  }).png().toBuffer();

  try {
    await sharp(input).heif({ quality: 80, compression: 'hevc' }).toBuffer();
    runtimeCaps.heifHevcWrite = true;
  } catch {
    runtimeCaps.heifHevcWrite = false;
  }

  try {
    await sharp(input).heif({ quality: 80, compression: 'av1' }).toBuffer();
    runtimeCaps.heifAvifWrite = true;
  } catch {
    runtimeCaps.heifAvifWrite = false;
  }

  try {
    runtimeCaps.exiftoolVersion = await exiftool.version();
  } catch {
    runtimeCaps.exiftool = false;
  }
}

process.on('SIGINT', async () => {
  await exiftool.end();
  process.exit(0);
});

Promise.all([ensureDataFiles(), detectCapabilities()]).then(() => {
  app.listen(port, () => {
    console.log(`Lens Parameters backend: http://127.0.0.1:${port}/`);
    console.log(`Admin UI: http://127.0.0.1:${port}/admin`);
    console.log(`Admin token: ${adminToken}`);
    console.log(`Demo card: ${demoCode}`);
    console.log(`HEIC output: ${runtimeCaps.heifHevcWrite ? 'enabled' : 'not supported in this local runtime'}`);
  });
}).catch(err => {
  console.error(err);
  process.exit(1);
});
