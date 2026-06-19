'use strict';

const $ = id => document.getElementById(id);
const tokenInput = $('adminToken');
const cardsBody = $('cardsBody');
const logsList = $('logsList');
const statsGrid = $('statsGrid');
const toast = $('toast');
let toastTimer;

tokenInput.value = localStorage.getItem('lens_admin_token') || 'LENS-ADMIN-2026';

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

function renderStats(status) {
    const heic = status.runtime?.heifHevcWrite ? '可导出' : '不可导出';
    statsGrid.innerHTML = `
        <div class="stat"><span>后端</span><strong>已连接</strong></div>
        <div class="stat"><span>卡密</span><strong>${status.counts.cards}</strong></div>
        <div class="stat"><span>日志</span><strong>${status.counts.logs}</strong></div>
        <div class="stat"><span>HEIC</span><strong>${heic}</strong></div>
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
    if (!logs.length) {
        logsList.innerHTML = '<div class="empty">暂无日志</div>';
        return;
    }

    logsList.innerHTML = logs.map(log => `
        <div class="log">
            <strong>${log.type}</strong>
            <span>${fmtTime(log.time)}${log.card ? ` · ${log.card}` : ''}${log.msg ? ` · ${log.msg}` : ''}</span>
            ${log.fileName ? `<span>${log.fileName} · ${log.width || '-'}×${log.height || '-'} · ${log.format || ''}</span>` : ''}
        </div>
    `).join('');
}

async function refreshAll() {
    localStorage.setItem('lens_admin_token', tokenInput.value.trim());
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
        note: $('note').value.trim() || '批量生成',
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
