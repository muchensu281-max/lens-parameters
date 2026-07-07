'use strict';

const $ = id => document.getElementById(id);

const lensText = {
  main: '主相机 — 24 mm ƒ1.78',
  ultra: '超广角相机 — 13 mm ƒ2.2',
  tele: '长焦相机 — 100 mm ƒ2.8',
};

let selectedFile = null;
let selectedLens = 'main';
let objectUrl = '';
let resultBlob = null;
let resultFileName = '';
let resultUrl = '';

function fmtBytes(bytes) {
  if (!bytes) return '-';
  const units = ['B', 'KB', 'MB', 'GB'];
  let n = bytes;
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i += 1;
  }
  return `${n.toFixed(i ? 1 : 0)} ${units[i]}`;
}

function parseResolution() {
  const [width, height] = $('resolution').value.split('x').map(Number);
  return { width, height };
}

function resolutionLabel(value = $('resolution').value) {
  return value.replace('x', ' × ');
}

function codecLabel(value = $('codec').value) {
  return value === 'hevc' ? 'HEVC / MOV' : 'H.264 / MP4';
}

function fitLabel(value = $('fit').value) {
  if (value === 'preserve') return '跟随原视频比例';
  if (value === 'stretch') return '强制拉伸';
  if (value === 'contain') return '保持比例补边';
  return '铺满裁剪无黑边';
}

function updateSummary() {
  const { width, height } = parseResolution();
  const shortSide = Math.min(width, height);
  const fps = Math.max(60, Math.min(120, Number.parseInt($('fps').value, 10) || 60));
  $('fps').value = String(fps);
  $('fpsValue').textContent = `${fps} FPS`;
  $('resolutionValue').textContent = resolutionLabel();
  $('codecValue').textContent = codecLabel();
  document.querySelectorAll('#fpsPresets button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.fps === String(fps));
  });
  const codec = $('codec').value === 'hevc' ? 'HEVC' : 'H.264';
  $('summaryCard').innerHTML = [
    `Apple ${$('model').value}`,
    lensText[selectedLens],
    `${shortSide}p · ${width} × ${height} · ${codec} · ${fps} FPS`,
  ].join('<br>');
}

function setMessage(text, type = '') {
  $('message').textContent = text;
  $('message').className = `hint ${type}`;
}

function setBusy(busy) {
  $('processBtn').disabled = busy || !selectedFile;
  $('processBtn').textContent = busy ? '处理中，请等待...' : '导出视频';
}

function setFile(file) {
  if (!file) return;
  selectedFile = file;
  clearResult();
  if (objectUrl) URL.revokeObjectURL(objectUrl);
  objectUrl = URL.createObjectURL(file);
  $('videoPreview').src = objectUrl;
  $('previewCard').hidden = false;
  $('fileName').textContent = file.name;
  $('fileInfo').textContent = fmtBytes(file.size);
  $('processBtn').disabled = false;
  setMessage('已选择视频，可以开始处理。短视频测试会更快。');
}

function clearResult() {
  if (resultUrl) URL.revokeObjectURL(resultUrl);
  resultBlob = null;
  resultFileName = '';
  resultUrl = '';
  $('resultCard').hidden = true;
}

function downloadResult() {
  if (!resultBlob || !resultFileName) return;
  if (!resultUrl) resultUrl = URL.createObjectURL(resultBlob);
  const a = document.createElement('a');
  a.href = resultUrl;
  a.download = resultFileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

async function shareResult() {
  if (!resultBlob || !resultFileName) {
    setMessage('还没有可保存的视频，请先导出。');
    return;
  }
  const file = new File([resultBlob], resultFileName, { type: resultBlob.type || 'video/quicktime' });
  if (navigator.canShare?.({ files: [file] }) && navigator.share) {
    try {
      await navigator.share({
        files: [file],
        title: resultFileName,
        text: '视频已处理完成',
      });
      setMessage('已打开系统分享面板。如果手机支持，可以在里面选择保存到相册。');
      return;
    } catch (err) {
      if (err?.name === 'AbortError') return;
    }
  }
  downloadResult();
  setMessage('当前浏览器不支持直接分享到相册，已改为下载文件。电脑一般在“下载”文件夹。');
}

async function loadRuntime() {
  try {
    const res = await fetch('/api/capabilities', { cache: 'no-store' });
    const data = await res.json();
    if (data.ffmpeg) {
      $('runtimeStatus').textContent = '本地 ffmpeg 已就绪';
      $('runtimeStatus').classList.add('ok');
    } else {
      $('runtimeStatus').textContent = '缺少 ffmpeg';
      $('runtimeStatus').classList.add('bad');
      setMessage('当前环境没有 ffmpeg，不能处理视频。');
    }
  } catch {
    $('runtimeStatus').textContent = '后端未连接';
    $('runtimeStatus').classList.add('bad');
    setMessage('请先启动本地服务后再打开此页面。');
  }
}

async function processVideo(event) {
  event.preventDefault();
  if (!selectedFile) {
    setMessage('请先上传视频。');
    return;
  }
  const { width, height } = parseResolution();
  const meta = {
    model: $('model').value,
    lens: selectedLens,
    fps: $('fps').value,
    width,
    height,
    codec: $('codec').value,
    fit: $('fit').value,
    dateTimeOriginal: $('dateTimeOriginal').value,
    locationName: $('locationName').value.trim(),
    latitude: $('latitude').value.trim(),
    longitude: $('longitude').value.trim(),
  };

  const body = new FormData();
  body.append('video', selectedFile);
  body.append('meta', JSON.stringify(meta));

  setBusy(true);
  setMessage('正在处理视频。视频越大越慢，本地原型请先用短视频测试。');
  try {
    const res = await fetch('/api/video-process', { method: 'POST', body });
    if (!res.ok) {
      let msg = '视频处理失败';
      try {
        const data = await res.json();
        msg = data.msg || msg;
      } catch {}
      throw new Error(msg);
    }
    const blob = await res.blob();
    const rawName = res.headers.get('X-File-Name');
    const outputWidth = res.headers.get('X-Video-Width');
    const outputHeight = res.headers.get('X-Video-Height');
    const outputFps = res.headers.get('X-Video-Fps');
    let fileName = `video_params.${$('codec').value === 'hevc' ? 'mov' : 'mp4'}`;
    if (rawName) {
      try { fileName = decodeURIComponent(rawName); } catch { fileName = rawName; }
    }
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    resultBlob = blob;
    resultFileName = fileName;
    resultUrl = URL.createObjectURL(blob);
    downloadResult();
    const outputInfo = outputWidth && outputHeight
      ? `${outputWidth} × ${outputHeight} · ${outputFps || $('fps').value} FPS`
      : `${$('fps').value} FPS`;
    $('resultInfo').textContent = `${fileName} · ${fmtBytes(blob.size)} · ${outputInfo}`;
    $('resultCard').hidden = false;
    setMessage(`处理完成，已触发下载。电脑通常在“下载”文件夹；手机可点“分享 / 保存到相册”。`);
  } catch (err) {
    setMessage(err.message || '视频处理失败。');
  } finally {
    setBusy(false);
  }
}

$('videoInput').addEventListener('change', event => setFile(event.target.files?.[0]));
$('videoForm').addEventListener('submit', processVideo);
$('downloadAgainBtn').addEventListener('click', downloadResult);
$('shareBtn').addEventListener('click', shareResult);

['model', 'fps', 'resolution', 'codec'].forEach(id => {
  $(id).addEventListener('input', updateSummary);
  $(id).addEventListener('change', updateSummary);
});

function bindChoiceGroup(selector, hiddenId, dataName) {
  document.querySelectorAll(`${selector} button`).forEach(btn => {
    btn.addEventListener('click', () => {
      $(hiddenId).value = btn.dataset[dataName];
      document.querySelectorAll(`${selector} button`).forEach(item => item.classList.toggle('active', item === btn));
      updateSummary();
    });
  });
}

bindChoiceGroup('#modelTabs', 'model', 'model');
bindChoiceGroup('#resolutionTabs', 'resolution', 'resolution');
bindChoiceGroup('#codecTabs', 'codec', 'codec');

document.querySelectorAll('#fpsPresets button').forEach(btn => {
  btn.addEventListener('click', () => {
    $('fps').value = btn.dataset.fps;
    updateSummary();
  });
});

document.querySelectorAll('#lensTabs button').forEach(btn => {
  btn.addEventListener('click', () => {
    selectedLens = btn.dataset.lens;
    document.querySelectorAll('#lensTabs button').forEach(item => item.classList.toggle('active', item === btn));
    updateSummary();
  });
});

const dropZone = $('dropZone');
dropZone.addEventListener('dragover', event => {
  event.preventDefault();
  dropZone.classList.add('dragging');
});
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragging'));
dropZone.addEventListener('drop', event => {
  event.preventDefault();
  dropZone.classList.remove('dragging');
  setFile(event.dataTransfer.files?.[0]);
});

const now = new Date();
now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
$('fps').value = '60';
$('resolution').value = '1080x1920';
$('codec').value = 'hevc';
$('fit').value = 'preserve';
$('dateTimeOriginal').value = now.toISOString().slice(0, 16);
updateSummary();
loadRuntime();
