'use strict';

const $ = id => document.getElementById(id);
const tokenInput = $('adminToken');
const cardsBody = $('cardsBody');
const logsList = $('logsList');
const statsGrid = $('statsGrid');
const toast = $('toast');
let toastTimer;

tokenInput.value = localStorage.getItem('lens_video_admin_token') || 'LENS-ADMIN-2026';

function showToast(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('show');
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}

async function api(path, options = {}) {
    const res = await fetch(path, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'x-admin-token': tokenInput.value.trim(),
            ...(options.headers || {}),
        },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.msg || '请求失败');
    return data;
}

function fmtTime(value) {
    if (!value) return '-';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString();
}

function statusBadge(status) {
    if (status?.ok) return '<span class="badge ok">可用</span>';
    const reason = status?.reason || '不可用';
    const cls = reason.includes('过期') || reason.includes('次数') ? 'warn' : 'off';
    return `<span class="badge ${cls}">${reason}</span>`;
}

function typeLabel(type) {
    const map = {
        'video.ok': '视频处理成功',
        'video.denied': '卡密拒绝',
        'video.failed': '视频处理失败',
        'card.verify.ok': '卡密验证通过',
        'card.verify.failed': '卡密验证失败',
        'card.use': '卡密扣减',
        'admin.card.create': '新增卡密',
        'admin.card.generate': '批量生成卡密',
        'admin.card.update': '修改卡密',
        'admin.card.delete': '删除卡密',
    };
    return map[type] || type;
}

function typeColor(type) {
    if (type.startsWith('video.ok')) return 'ok';
    if (type.startsWith('video.') && !type.endsWith('ok')) return 'off';
    if (type.startsWith('card.verify.failed') || type.startsWith('card.use')) return 'warn';
    return '';
}

function renderStats(status) {
    const ffmpeg = status.runtime?.ffmpeg ? '已就绪' : '未安装';
    const ffmpegCls = status.runtime?.ffmpeg ? 'ok' : '';
    const serverCls = 'ok';

    statsGrid.innerHTML = `
        <div class="stat"><span>服务状态</span><strong class="${serverCls}">已连接</strong></div>
        <div class="stat"><span>ffmpeg</span><strong class="${ffmpegCls}">${ffmpeg}</strong></div>
        <div class="stat"><span>视频卡密</span><strong>${status.counts.cards}</strong></div>
        <div class="stat"><span>视频处理记录</span><strong>${status.counts.logs}</strong></div>
    `;
}

function renderCards(cards) {
    if (!cards.length) {
        cardsBody.innerHTML = '<tr><td colspan="6" class="empty">暂无卡密</td></tr>';
        return;
    }

    cardsBody.innerHTML = cards.map(card => `
        <tr>
            <td class="code-cell">${card.code}</td>
            <td>${statusBadge(card.status)}</td>
            <td>${card.usedCount || 0}/${card.maxUses || 0}</td>
            <td>${fmtTime(card.expiresAt)}</td>
            <td>${card.note || '-'}</td>
            <td>
                <div class="row-actions">
                    <button class="ghost" data-action="copy" data-code="${card.code}">复制</button>
                    <button class="ghost" data-action="toggle" data-id="${card.id}" data-active="${card.active ? 'false' : 'true'}">${card.active ? '停用' : '启用'}</button>
                    <button class="ghost danger" data-action="delete" data-id="${card.id}">删除</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function renderLogs(logs) {
    // 只显示视频相关日志
    const videoLogs = logs.filter(log => log.type && log.type.startsWith('video.'));

    if (!videoLogs.length) {
        logsList.innerHTML = '<div class="empty">暂无视频处理记录</div>';
        return;
    }

    logsList.innerHTML = videoLogs.map(log => {
        const label = typeLabel(log.type);
        const cls = typeColor(log.type);
        return `
        <div class="log">
            <strong class="${cls}">${label}</strong>
            <span>${fmtTime(log.time)}${log.card ? ' · ' + log.card : ''}</span>
            ${log.fileName ? `<span>${log.fileName}</span>` : ''}
            ${log.codec ? `<span>编码: ${log.codec} · ${log.fps}fps · ${log.width}x${log.height}</span>` : ''}
            ${log.bytes ? `<span>文件大小: ${(log.bytes / 1024 / 1024).toFixed(1)} MB</span>` : ''}
            ${log.msg ? `<span>${log.msg}</span>` : ''}
        </div>
    `}).join('');
}

async function refreshAll() {
    localStorage.setItem('lens_video_admin_token', tokenInput.value.trim());
    const [status, cards, logs] = await Promise.all([
        api('/api/admin/status'),
        api('/api/admin/cards'),
        api('/api/admin/logs'),
    ]);
    renderStats(status);
    renderCards(cards.cards || []);
    renderLogs(logs.logs || []);
}

async function createCard() {
    const body = {
        code: $('manualCode').value.trim(),
        maxUses: Number($('maxUses').value || 1),
        expiresAt: $('expiresAt').value,
        note: $('note').value.trim(),
    };
    await api('/api/admin/cards', { method: 'POST', body: JSON.stringify(body) });
    $('manualCode').value = '';
    showToast('卡密已新增');
    await refreshAll();
}

async function generateCards() {
    const body = {
        count: 10,
        maxUses: Number($('maxUses').value || 1),
        expiresAt: $('expiresAt').value,
        note: $('note').value.trim() || '视频版批量生成',
    };
    await api('/api/admin/cards/generate', { method: 'POST', body: JSON.stringify(body) });
    showToast('已批量生成 10 个卡密');
    await refreshAll();
}

cardsBody.addEventListener('click', async e => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;

    const action = btn.dataset.action;
    if (action === 'copy') {
        await navigator.clipboard.writeText(btn.dataset.code);
        showToast('已复制卡密');
        return;
    }

    if (action === 'toggle') {
        await api(`/api/admin/cards/${btn.dataset.id}`, {
            method: 'PATCH',
            body: JSON.stringify({ active: btn.dataset.active === 'true' }),
        });
        showToast('状态已更新');
        await refreshAll();
        return;
    }

    if (action === 'delete') {
        if (!confirm('确定删除这个卡密？')) return;
        await api(`/api/admin/cards/${btn.dataset.id}`, { method: 'DELETE' });
        showToast('卡密已删除');
        await refreshAll();
    }
});

$('saveTokenBtn').addEventListener('click', () => refreshAll().catch(err => showToast(err.message)));
$('refreshBtn').addEventListener('click', () => refreshAll().catch(err => showToast(err.message)));
$('createCardBtn').addEventListener('click', () => createCard().catch(err => showToast(err.message)));
$('generateCardsBtn').addEventListener('click', () => generateCards().catch(err => showToast(err.message)));
$('clearLogsBtn').addEventListener('click', async () => {
    if (!confirm('确定清空日志？')) return;
    await api('/api/admin/logs/clear', { method: 'POST', body: '{}' });
    showToast('日志已清空');
    await refreshAll();
});

refreshAll().catch(err => showToast(err.message));
