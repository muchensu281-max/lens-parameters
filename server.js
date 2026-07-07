#!/usr/bin/env node
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');
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

const uploadVideo = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: 1,
    fileSize: 600 * 1024 * 1024,
    fieldSize: 1024 * 1024,
  },
});

const runtimeCaps = {
  heifRead: Boolean(sharp.versions.heif),
  heifHevcWrite: false,
  heifAvifWrite: false,
  exiftool: true,
  ffmpeg: false,
  ffmpegPath: '',
  ffprobe: false,
  ffprobePath: '',
  sharp: sharp.versions.sharp,
  vips: sharp.versions.vips,
};

const locationCache = new Map();
const knownLocations = [
  { names: ['北京故宫', '故宫', '故宫博物院'], latitude: 39.916344, longitude: 116.397155, displayName: '北京故宫' },
  { names: ['天安门', '北京天安门'], latitude: 39.908722, longitude: 116.397499, displayName: '北京天安门' },
  { names: ['上海外滩', '外滩'], latitude: 31.240246, longitude: 121.490317, displayName: '上海外滩' },
  { names: ['广州塔', '小蛮腰'], latitude: 23.106414, longitude: 113.324553, displayName: '广州塔' },
  { names: ['深圳湾公园', '深圳湾'], latitude: 22.523065, longitude: 113.944931, displayName: '深圳湾公园' },
  { names: ['成都太古里', '太古里'], latitude: 30.653438, longitude: 104.081915, displayName: '成都太古里' },
  { names: ['日本东京', '东京日本', '东京', 'Tokyo', 'Tokyo Japan'], latitude: 35.6895, longitude: 139.69171, displayName: '日本东京' },
  { names: ['日本大阪', '大阪', 'Osaka', 'Osaka Japan'], latitude: 34.69374, longitude: 135.50218, displayName: '日本大阪' },
  { names: ['日本京都', '京都日本', 'Kyoto', 'Kyoto Japan'], latitude: 35.02107, longitude: 135.75385, displayName: '日本京都' },
  { names: ['韩国首尔', '首尔', 'Seoul', 'Seoul Korea'], latitude: 37.566, longitude: 126.9784, displayName: '韩国首尔' },
  { names: ['新加坡', 'Singapore'], latitude: 1.28967, longitude: 103.85007, displayName: '新加坡' },
  { names: ['泰国曼谷', '曼谷', 'Bangkok', 'Bangkok Thailand'], latitude: 13.75398, longitude: 100.50144, displayName: '泰国曼谷' },
  { names: ['马来西亚吉隆坡', '吉隆坡', 'Kuala Lumpur'], latitude: 3.1412, longitude: 101.68653, displayName: '马来西亚吉隆坡' },
  { names: ['美国纽约', '纽约', 'New York', 'New York USA'], latitude: 40.71427, longitude: -74.00597, displayName: '美国纽约' },
  { names: ['美国洛杉矶', '洛杉矶', 'Los Angeles'], latitude: 34.05223, longitude: -118.24368, displayName: '美国洛杉矶' },
  { names: ['美国旧金山', '旧金山', 'San Francisco'], latitude: 37.77493, longitude: -122.41942, displayName: '美国旧金山' },
  { names: ['英国伦敦', '伦敦', 'London', 'London UK'], latitude: 51.50853, longitude: -0.12574, displayName: '英国伦敦' },
  { names: ['法国巴黎', '巴黎', 'Paris', 'Paris France'], latitude: 48.85341, longitude: 2.3488, displayName: '法国巴黎' },
  { names: ['意大利罗马', '罗马', 'Rome', 'Rome Italy'], latitude: 41.89193, longitude: 12.51133, displayName: '意大利罗马' },
  { names: ['阿联酋迪拜', '迪拜', 'Dubai'], latitude: 25.07725, longitude: 55.30927, displayName: '阿联酋迪拜' },
  { names: ['澳大利亚悉尼', '悉尼', 'Sydney'], latitude: -33.86785, longitude: 151.20732, displayName: '澳大利亚悉尼' },
  { names: ['澳大利亚墨尔本', '墨尔本', 'Melbourne'], latitude: -37.814, longitude: 144.96332, displayName: '澳大利亚墨尔本' },
  { names: ['加拿大多伦多', '多伦多', 'Toronto'], latitude: 43.70011, longitude: -79.4163, displayName: '加拿大多伦多' },
  { names: ['加拿大温哥华', '温哥华', 'Vancouver'], latitude: 49.24966, longitude: -123.11934, displayName: '加拿大温哥华' },
  { names: ['东京塔', 'Tokyo Tower'], latitude: 35.65858, longitude: 139.74543, displayName: '东京塔' },
  { names: ['埃菲尔铁塔', '艾菲尔铁塔', 'Eiffel Tower'], latitude: 48.85826, longitude: 2.2945, displayName: '埃菲尔铁塔' },
];

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

function formatIsoDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString();
}

function clampNumber(value, min, max, fallback) {
  const n = Number.parseFloat(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function videoExt(file) {
  const ext = path.extname(String(file?.originalname || '')).toLowerCase();
  if (ext === '.mov') return 'mov';
  return 'mp4';
}

function isVideoFile(file) {
  const type = String(file?.mimetype || '').toLowerCase();
  const name = String(file?.originalname || '').toLowerCase();
  return type.startsWith('video/') || /\.(mp4|mov|m4v|hevc)$/i.test(name);
}

function normalizeLocationText(value) {
  return String(value || '').trim().replace(/\s+/g, ' ');
}

function parseLocationCoordinates(value) {
  const match = normalizeLocationText(value).match(/^(-?\d+(?:\.\d+)?)\s*[,， ]\s*(-?\d+(?:\.\d+)?)$/);
  if (!match) return null;
  const latitude = Number.parseFloat(match[1]);
  const longitude = Number.parseFloat(match[2]);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;
  return { latitude, longitude, displayName: value };
}

function locationQueryVariants(locationName) {
  const aliases = [
    [/日本.*东京|东京.*日本|^东京$/, 'Tokyo Japan'],
    [/日本.*大阪|^大阪$/, 'Osaka Japan'],
    [/日本.*京都|京都.*日本|^京都$/, 'Kyoto Japan'],
    [/韩国.*首尔|^首尔$/, 'Seoul South Korea'],
    [/美国.*纽约|^纽约$/, 'New York USA'],
    [/美国.*洛杉矶|^洛杉矶$/, 'Los Angeles USA'],
    [/美国.*旧金山|^旧金山$/, 'San Francisco USA'],
    [/英国.*伦敦|^伦敦$/, 'London UK'],
    [/法国.*巴黎|^巴黎$/, 'Paris France'],
    [/意大利.*罗马|^罗马$/, 'Rome Italy'],
    [/阿联酋.*迪拜|^迪拜$/, 'Dubai UAE'],
    [/澳大利亚.*悉尼|^悉尼$/, 'Sydney Australia'],
    [/澳大利亚.*墨尔本|^墨尔本$/, 'Melbourne Australia'],
    [/加拿大.*多伦多|^多伦多$/, 'Toronto Canada'],
    [/加拿大.*温哥华|^温哥华$/, 'Vancouver Canada'],
  ];
  const variants = [locationName];
  const compact = locationName.replace(/\s+/g, '');
  for (const [pattern, query] of aliases) {
    if (pattern.test(compact)) variants.push(query);
  }
  return [...new Set(variants)];
}

async function fetchJsonWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs || 6000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: options.headers || {},
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function geocodeOpenMeteo(query) {
  const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
  url.searchParams.set('name', query);
  url.searchParams.set('count', '1');
  url.searchParams.set('language', 'zh');
  url.searchParams.set('format', 'json');
  const data = await fetchJsonWithTimeout(url, { timeoutMs: 6000 });
  const first = data?.results?.[0];
  if (!first) return null;
  const latitude = Number.parseFloat(first.latitude);
  const longitude = Number.parseFloat(first.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  return {
    latitude,
    longitude,
    displayName: [first.country, first.admin1, first.name].filter(Boolean).join(' '),
  };
}

async function geocodeNominatim(query) {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('limit', '1');
  url.searchParams.set('accept-language', 'zh-CN');
  url.searchParams.set('q', query);
  const data = await fetchJsonWithTimeout(url, {
    timeoutMs: 6000,
    headers: { 'User-Agent': 'LensParametersLocal/1.0' },
  });
  const first = Array.isArray(data) ? data[0] : null;
  if (!first) return null;
  const latitude = Number.parseFloat(first.lat);
  const longitude = Number.parseFloat(first.lon);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  return {
    latitude,
    longitude,
    displayName: first.display_name || query,
  };
}

async function geocodeLocationName(value) {
  const locationName = normalizeLocationText(value);
  if (!locationName) return null;

  const direct = parseLocationCoordinates(locationName);
  if (direct) return direct;

  const cacheKey = locationName.toLowerCase();
  if (locationCache.has(cacheKey)) return locationCache.get(cacheKey);

  const known = knownLocations.find(item => item.names.some(name => locationName.includes(name) || name.includes(locationName)));
  if (known) {
    const result = { latitude: known.latitude, longitude: known.longitude, displayName: known.displayName };
    locationCache.set(cacheKey, result);
    return result;
  }

  if (typeof fetch !== 'function') return null;

  for (const query of locationQueryVariants(locationName)) {
    const result = await geocodeOpenMeteo(query) || await geocodeNominatim(query);
    if (result) {
      locationCache.set(cacheKey, result);
      return result;
    }
  }
  return null;
}

async function applyVideoLocation(meta) {
  const lat = Number.parseFloat(meta.latitude);
  const lon = Number.parseFloat(meta.longitude);
  if (Number.isFinite(lat) && Number.isFinite(lon)) return meta;

  const location = await geocodeLocationName(meta.locationName);
  if (!location) return meta;

  meta.latitude = String(location.latitude);
  meta.longitude = String(location.longitude);
  meta.locationDisplayName = location.displayName;
  return meta;
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ['ignore', 'ignore', 'pipe'], ...options });
    let stderr = '';
    child.stderr.on('data', chunk => {
      stderr += chunk.toString();
      if (stderr.length > 12000) stderr = stderr.slice(-12000);
    });
    child.on('error', reject);
    child.on('close', code => {
      if (code === 0) resolve();
      else reject(new Error(stderr || `${command} exited with code ${code}`));
    });
  });
}

function runCommandOutput(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'], ...options });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', chunk => {
      stdout += chunk.toString();
      if (stdout.length > 200000) stdout = stdout.slice(-200000);
    });
    child.stderr.on('data', chunk => {
      stderr += chunk.toString();
      if (stderr.length > 12000) stderr = stderr.slice(-12000);
    });
    child.on('error', reject);
    child.on('close', code => {
      if (code === 0) resolve(stdout);
      else reject(new Error(stderr || `${command} exited with code ${code}`));
    });
  });
}

async function probeVideoInfo(file) {
  if (!runtimeCaps.ffprobe) return {};
  try {
    const json = await runCommandOutput(runtimeCaps.ffprobePath || 'ffprobe', [
      '-v', 'error',
      '-select_streams', 'v:0',
      '-show_entries', 'stream=width,height,duration',
      '-show_entries', 'format=duration',
      '-of', 'json',
      file,
    ]);
    const parsed = JSON.parse(json);
    const stream = parsed.streams?.[0] || {};
    return {
      width: toPositiveInt(stream.width),
      height: toPositiveInt(stream.height),
      duration: Number.parseFloat(stream.duration || parsed.format?.duration || 0) || 0,
    };
  } catch {
    return {};
  }
}

function videoLensProfile(value) {
  const key = String(value || 'main');
  const profiles = {
    main: {
      label: '主相机 — 24 mm ƒ1.78',
      raw: '后置摄像头 — 6.86mm f/1.78',
      focal35: 24,
      fNumber: 1.78,
    },
    ultra: {
      label: '超广角相机 — 13 mm ƒ2.2',
      raw: '后置超广角摄像头 — 2.22mm f/2.2',
      focal35: 13,
      fNumber: 2.2,
    },
    tele: {
      label: '长焦相机 — 100 mm ƒ2.8',
      raw: '后置长焦摄像头 — 15.66mm f/2.8',
      focal35: 100,
      fNumber: 2.8,
    },
  };
  return profiles[key] || profiles.main;
}

function buildVideoMeta(raw) {
  const lens = videoLensProfile(raw.lens);
  const model = String(raw.model || 'iPhone 17 Pro Max').replace(/[^\w\s().-]/g, '').trim() || 'iPhone 17 Pro Max';
  const fps = Math.round(clampNumber(raw.fps, 60, 120, 60));
  const width = Math.round(clampNumber(raw.width, 1, 7680, 1080));
  const height = Math.round(clampNumber(raw.height, 1, 7680, 1920));
  return {
    make: 'Apple',
    model,
    lens,
    fps,
    width,
    height,
    codec: String(raw.codec || 'hevc') === 'h264' ? 'h264' : 'hevc',
    fit: ['preserve', 'stretch', 'contain', 'cover'].includes(String(raw.fit || 'preserve')) ? String(raw.fit || 'preserve') : 'preserve',
    dateTimeOriginal: String(raw.dateTimeOriginal || ''),
    locationName: String(raw.locationName || '').trim(),
    latitude: String(raw.latitude || '').trim(),
    longitude: String(raw.longitude || '').trim(),
    locationDisplayName: '',
  };
}

function orientVideoDimensions(targetWidth, targetHeight, sourceInfo = {}) {
  const sourcePortrait = sourceInfo.height && sourceInfo.width ? sourceInfo.height > sourceInfo.width : targetHeight > targetWidth;
  const targetPortrait = targetHeight > targetWidth;
  if (sourcePortrait !== targetPortrait) {
    return { width: targetHeight, height: targetWidth };
  }
  return { width: targetWidth, height: targetHeight };
}

function videoBitrateKbps(width, height, fps, codec) {
  const pixels = Math.max(1, width * height);
  const mp = pixels / 1000000;
  const fpsFactor = Math.max(1, fps / 60);
  const codecFactor = codec === 'hevc' ? 0.82 : 1;
  const kbps = Math.round(mp * fpsFactor * 5200 * codecFactor);
  return Math.max(codec === 'hevc' ? 4500 : 6500, Math.min(kbps, codec === 'hevc' ? 52000 : 70000));
}

function buildVideoExifTags(meta, info = {}) {
  const dt = formatExifDate(meta.dateTimeOriginal);
  const tags = {
    Make: meta.make,
    Model: meta.model,
    'Keys:Make': meta.make,
    'Keys:Model': meta.model,
    'UserData:Make': meta.make,
    'UserData:Model': meta.model,
    LensMake: meta.make,
    LensModel: `${meta.model} ${meta.lens.raw}`,
    'VideoKeys:LensModel': `${meta.model} ${meta.lens.raw}`,
    'VideoKeys:FocalLengthIn35mmFormat': meta.lens.focal35,
    CameraModel: meta.model,
    CameraMakeModel: `${meta.make} ${meta.model}`,
    FNumber: meta.lens.fNumber,
    FocalLengthIn35mmFormat: meta.lens.focal35,
    Software: '18.3',
  };
  if (dt) {
    tags.CreateDate = dt;
    tags.ModifyDate = dt;
    tags.TrackCreateDate = dt;
    tags.TrackModifyDate = dt;
    tags.MediaCreateDate = dt;
    tags.MediaModifyDate = dt;
  }
  const lat = Number.parseFloat(meta.latitude);
  const lon = Number.parseFloat(meta.longitude);
  if (Number.isFinite(lat) && Number.isFinite(lon)) {
    const gpsText = `${Math.abs(lat)} ${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lon)} ${lon >= 0 ? 'E' : 'W'}`;
    tags.GPSLatitude = lat;
    tags.GPSLongitude = lon;
    tags.GPSLatitudeRef = lat >= 0 ? 'N' : 'S';
    tags.GPSLongitudeRef = lon >= 0 ? 'E' : 'W';
    tags.GPSCoordinates = gpsText;
    tags['Keys:GPSCoordinates'] = gpsText;
    tags['UserData:GPSCoordinates'] = gpsText;
  }
  if (info.width) tags.ImageWidth = info.width;
  if (info.height) tags.ImageHeight = info.height;
  return Object.fromEntries(Object.entries(tags).filter(([, v]) => v !== '' && v != null && !Number.isNaN(v)));
}

async function writeVideoExif(file, tags) {
  if (!Object.keys(tags).length) return;
  await exiftool.write(file, tags, ['-overwrite_original', '-api', 'QuickTimeUTC=1']);
}

async function renderVideo(file, meta) {
  const tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'lens-video-'));
  const inputExt = videoExt(file);
  const input = path.join(tmpDir, `input.${inputExt}`);
  const outputExt = meta.codec === 'hevc' ? 'mov' : 'mp4';
  const output = path.join(tmpDir, `output.${outputExt}`);

  try {
    await fs.promises.writeFile(input, file.buffer);
    const sourceInfo = await probeVideoInfo(input);
    const target = orientVideoDimensions(meta.width, meta.height, sourceInfo);
    const scaleFilter = meta.fit === 'stretch'
      ? `scale=${target.width}:${target.height},setsar=1,fps=${meta.fps}`
      : meta.fit === 'contain'
        ? `scale=${target.width}:${target.height}:force_original_aspect_ratio=decrease,pad=${target.width}:${target.height}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=${meta.fps}`
        : meta.fit === 'cover'
          ? `scale=${target.width}:${target.height}:force_original_aspect_ratio=increase,crop=${target.width}:${target.height},setsar=1,fps=${meta.fps}`
          : `scale=${target.width}:${target.height}:force_original_aspect_ratio=decrease,scale=trunc(iw/2)*2:trunc(ih/2)*2,setsar=1,fps=${meta.fps}`;
    const bitrate = videoBitrateKbps(target.width, target.height, meta.fps, meta.codec);
    const maxrate = Math.round(bitrate * 1.35);
    const bufsize = Math.round(bitrate * 2);
    const videoArgs = meta.codec === 'hevc'
      ? ['-c:v', 'libx265', '-tag:v', 'hvc1', '-preset', 'fast', '-b:v', `${bitrate}k`, '-maxrate', `${maxrate}k`, '-bufsize', `${bufsize}k`, '-pix_fmt', 'yuv420p']
      : ['-c:v', 'libx264', '-preset', 'fast', '-b:v', `${bitrate}k`, '-maxrate', `${maxrate}k`, '-bufsize', `${bufsize}k`, '-pix_fmt', 'yuv420p'];
    const createdAt = formatIsoDate(meta.dateTimeOriginal);
    const args = [
      '-y',
      '-i', input,
      '-map', '0:v:0',
      '-map', '0:a?',
      '-vf', scaleFilter,
      ...videoArgs,
      '-metadata:s:v:0', 'handler_name=Core Media Video',
      '-metadata:s:v:0', `encoder=${meta.make} ${meta.model}`,
      '-c:a', 'aac',
      '-b:a', '128k',
      '-shortest',
      '-movflags', '+faststart',
    ];
    if (createdAt) args.push('-metadata', `creation_time=${createdAt}`);
    args.push(output);

    await runCommand(runtimeCaps.ffmpegPath || 'ffmpeg', args);
    const outputInfo = await probeVideoInfo(output);
    await writeVideoExif(output, buildVideoExifTags(meta, { width: outputInfo.width || target.width, height: outputInfo.height || target.height }));
    const data = await fs.promises.readFile(output);
    return {
      data,
      ext: outputExt,
      mime: outputExt === 'mov' ? 'video/quicktime' : 'video/mp4',
      width: outputInfo.width || target.width,
      height: outputInfo.height || target.height,
      fps: meta.fps,
      codec: meta.codec,
    };
  } finally {
    await fs.promises.rm(tmpDir, { recursive: true, force: true });
  }
}

function buildExifTags(meta, info) {
  const tags = {};
  if (meta.make) tags.Make = String(meta.make);
  if (meta.model) tags.Model = String(meta.model);
  if (meta.software) tags.Software = String(meta.software);
  if (meta.lensMake || meta.make) tags.LensMake = String(meta.lensMake || meta.make);
  if (meta.lensModel) tags.LensModel = String(meta.lensModel);

  if (meta.fNumber) tags.FNumber = Number.parseFloat(meta.fNumber);
  if (meta.iso) tags.ISO = Number.parseInt(meta.iso, 10);
  if (meta.focalLength) tags.FocalLength = Number.parseFloat(meta.focalLength);
  if (meta.focalLength35) tags.FocalLengthIn35mmFormat = Number.parseInt(meta.focalLength35, 10);
  if (meta.exposureBias !== '' && meta.exposureBias != null) tags.ExposureCompensation = Number.parseFloat(meta.exposureBias);

  const shutter = parseShutter(meta.exposureTime);
  if (shutter) tags.ExposureTime = shutter;

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

app.get('/video', (req, res) => {
  res.sendFile(path.join(root, 'video.html'));
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
      ffmpeg: runtimeCaps.ffmpeg,
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

app.post('/api/video-process', uploadVideo.single('video'), async (req, res) => {
  try {
    if (!runtimeCaps.ffmpeg) {
      res.status(422).json({ code: 422, msg: '当前本地环境没有检测到 ffmpeg，暂不能处理视频' });
      return;
    }

    if (!req.file || !isVideoFile(req.file)) {
      res.status(400).json({ code: 400, msg: '请上传 MP4 或 MOV 视频' });
      return;
    }

    const meta = await applyVideoLocation(buildVideoMeta(parseMeta(req.body.meta)));
    if (meta.locationName && (!meta.latitude || !meta.longitude)) {
      res.status(422).json({ code: 422, msg: '位置解析失败，请换成更具体的位置，例如“北京故宫”' });
      return;
    }
    const result = await renderVideo(req.file, meta);
    const base = path.basename(req.file.originalname || 'video', path.extname(req.file.originalname || ''));
    const fileName = `${base}_video_params.${result.ext}`;

    await appendLog({
      type: 'video.process.ok',
      fileName,
      codec: result.codec,
      fps: result.fps,
      width: result.width,
      height: result.height,
      bytes: result.data.length,
    });

    res.setHeader('Content-Type', result.mime);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
    res.setHeader('X-File-Name', encodeURIComponent(fileName));
    res.setHeader('X-Video-Width', String(result.width));
    res.setHeader('X-Video-Height', String(result.height));
    res.setHeader('X-Video-Fps', String(result.fps));
    res.send(result.data);
  } catch (err) {
    const status = err.status || 500;
    await appendLog({ type: 'video.process.failed', msg: err.message || '视频处理失败' });
    res.status(status).json({
      code: status,
      msg: err.message || '视频处理失败',
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

  const candidates = [
    process.env.FFMPEG_PATH,
    '/opt/homebrew/bin/ffmpeg',
    '/usr/local/bin/ffmpeg',
    'ffmpeg',
  ].filter(Boolean);
  runtimeCaps.ffmpeg = false;
  runtimeCaps.ffmpegPath = '';
  for (const candidate of candidates) {
    try {
      await runCommand(candidate, ['-version']);
      runtimeCaps.ffmpeg = true;
      runtimeCaps.ffmpegPath = candidate;
      break;
    } catch {
      // Try next candidate.
    }
  }

  const probeCandidates = [
    process.env.FFPROBE_PATH,
    runtimeCaps.ffmpegPath ? runtimeCaps.ffmpegPath.replace(/ffmpeg$/, 'ffprobe') : '',
    '/opt/homebrew/bin/ffprobe',
    '/usr/local/bin/ffprobe',
    'ffprobe',
  ].filter(Boolean);
  runtimeCaps.ffprobe = false;
  runtimeCaps.ffprobePath = '';
  for (const candidate of probeCandidates) {
    try {
      await runCommand(candidate, ['-version']);
      runtimeCaps.ffprobe = true;
      runtimeCaps.ffprobePath = candidate;
      break;
    } catch {
      // Try next candidate.
    }
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
