/*
 ╔══════════════════════════════════════════════════════════════════╗
 ║  NEERG 7.0.24 · admin.js                                         ║
 ║  The admin tools: new posts, managing posts and comics, site     ║
 ║  info, commissions, colors, the Home page, links and cleanup.    ║
 ║  logic.js loads this the first time Admin opens, so visitors     ║
 ║  never download it. It shares logic.js's helpers and state.      ║
 ╚══════════════════════════════════════════════════════════════════╝
*/
'use strict';

/* ═════════════════════════════════════════════
   HELPERS ONLY THE ADMIN TOOLS USE
   ═════════════════════════════════════════════ */

const PRESET_TAGS = ['SFW', 'NSFW', 'Sketch', 'Commissions', 'Animation', 'Fanart', 'OC', 'WIP'];

const PALETTE_LABELS = {
    bg: ['Background', 'Behind everything'],
    text: ['Text', 'Body copy and headings'],
    sidebar: ['Panels', 'Cards, menus, info panel'],
    leaflet: ['Fields', 'Inputs and post backs'],
    border: ['Lines', 'Borders and dividers'],
    accent: ['Accent', 'Buttons and links'],
    navActive: ['Highlight', 'Active tab and focus']
};

const LIGHT_PRESETS = [
    { name: 'Paper & Ink', colors: ['#F6F4EF', '#16130F', '#ECE8E1', '#C8102E', '#FFFFFF', '#DCD5CA', '#16130F'] },
    { name: 'Cream & Fire', colors: ['#F8F4EE', '#1A1410', '#EDE8E0', '#E85D26', '#FFFFFF', '#D8D0C4', '#1A1410'] },
    { name: 'Cotton Candy', colors: ['#FFF0F8', '#2A0A1E', '#FCE0F0', '#D946A8', '#FFFFFF', '#E8C8DC', '#8B1A6A'] },
    { name: 'Sky & Sand', colors: ['#F0F8FF', '#0A1A2E', '#E0F0FA', '#0E7FC0', '#FFFFFF', '#B8D8EE', '#B45309'] },
    { name: 'Mint Garden', colors: ['#F0FDF4', '#0A1E12', '#DCFCE7', '#15803D', '#FFFFFF', '#BBF7D0', '#7C3AED'] },
    { name: 'Lavender Mist', colors: ['#FAF5FF', '#1E0A3E', '#F3E8FF', '#7C3AED', '#FFFFFF', '#DDD6FE', '#5B21B6'] },
    { name: 'Golden Hour', colors: ['#FFFBEB', '#1C0F04', '#FEF3C7', '#B45309', '#FFFFFF', '#FDE68A', '#DC2626'] },
    { name: 'Evening Walk', colors: ['#F6E6C2', '#2A4343', '#F1D49A', '#D35E36', '#FBF3E1', '#C0C29D', '#416B66'] },
    { name: 'Retro Poster', colors: ['#EFE6D3', '#1E2424', '#E3D5B8', '#C94E44', '#FAF5EA', '#C1AB85', '#3E6868'] },
    { name: 'Aurora Pastel', colors: ['#F2F5FC', '#2A1640', '#E5EBF8', '#A94ACE', '#FFFFFF', '#D3CBF6', '#9881FF'] },
    { name: 'Terracotta', colors: ['#FAEFDC', '#3A1E1E', '#F5DFBB', '#11686A', '#FFF8EC', '#E3C79A', '#F2542D'] },
    { name: 'Palace Spring', colors: ['#FFF6E8', '#3B2414', '#FCEABC', '#D9622A', '#FFFFFF', '#F2D9A4', '#4A9BEF'] },
    { name: 'Peach Fuzz', colors: ['#F8F7FF', '#2B2350', '#FFEEDD', '#6C5CE7', '#FFFFFF', '#FFD8BE', '#9381FF'] },
    { name: 'Neon Lights', colors: ['#F2F2FF', '#1C1A4A', '#E4E4FB', '#E23D8B', '#FFFFFF', '#C9C8F0', '#2A28AD'] },
    { name: 'Mysterious Depths', colors: ['#EEF0FA', '#0C0827', '#DFE3F5', '#5950B8', '#FFFFFF', '#C3C9EA', '#1EA598'] },
    { name: 'Volcanic Ash', colors: ['#F1F3F5', '#212529', '#E9ECEF', '#8338EC', '#FFFFFF', '#D3D8DE', '#FB5607'] },
    { name: 'Dragon Tales', colors: ['#EEF7F3', '#2E1F2E', '#D6EDE5', '#F93C0A', '#FFFFFF', '#ADDCCC', '#4886AB'] },
    { name: 'Wildflower', colors: ['#EEF5FA', '#1B2B22', '#DCEBF5', '#264431', '#FFFFFF', '#BED9EB', '#EAA043'] }
];

const RING_PRESETS = [
    { name: 'Neon Sunset', colors: ['#ff6b35', '#b8ff38', '#ff3c8e'] },
    { name: 'Ocean', colors: ['#00d4ff', '#8b5cf6', '#00d4ff'] },
    { name: 'Fire', colors: ['#ff6b35', '#ff3c8e', '#ffca28'] },
    { name: 'Forest', colors: ['#b8ff38', '#00d4ff', '#8b5cf6'] },
    { name: 'Mono', colors: ['#ffffff', '#aaaaaa', '#ffffff'] },
    { name: 'Gold', colors: ['#f5a623', '#f8e71c', '#f5a623'] }
];

const STATUS_PRESETS = [
    { text: 'AVAILABLE FOR COMMISSIONS', color: '#3DD68C', label: 'Open' },
    { text: 'ON HIATUS', color: '#FFCA28', label: 'Hiatus' },
    { text: 'IN TRAINING', color: '#00D4FF', label: 'Training' },
    { text: 'BUSY, QUEUE FULL', color: '#FF9944', label: 'Busy' },
    { text: 'OPEN FOR ART TRADES', color: '#8B5CF6', label: 'Art trades' },
    { text: 'CLOSED', color: '#888888', label: 'Closed' }
];

const PLATFORM_OPTIONS = ['Twitter/X', 'Instagram', 'Bluesky', 'Tumblr', 'YouTube', 'TikTok', 'DeviantArt', 'Pixiv', 'Twitch', 'Ko-fi', 'Patreon', 'Discord', 'Threads', 'Cara', 'Email', 'Other'];

function formatTime(ts) {
    try { return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }); } catch (e) { return ''; }
}

function buildRingGradient(c1, c2, c3, dir) {
    return dir === 'circle' ? 'radial-gradient(circle, ' + c1 + ', ' + c2 + ', ' + c3 + ')' : 'linear-gradient(' + dir + ', ' + c1 + ', ' + c2 + ', ' + c3 + ')';
}

/* Admin tools that rewrite interactions as a whole (cleanup, erase all) */
async function saveInteractionsOverwrite() {
    if (loadFailed.has('interactions.js')) { showToast(LOAD_FAILED_MSG, 'error'); return { success: false }; }
    pendingOps = []; persistOps();
    writeJSON(KEYS.interactions, interactionsCache);
    if (!globalAuthToken || IS_LOCAL_FILE) return { success: false };
    const r = await uploadToBridge('interactions', { data: interactionsCache });
    if (r.success) interactionsRemote = clone(interactionsCache);
    return r;
}

async function forceSyncAll() {
    if (isLocalMode()) { downloadBackup(); return; }
    saveDataLocally();
    const t = showToast('Syncing all four files', 'loading');
    const results = [];
    results.push(await uploadToBridge('system', { quiet: true }));
    results.push(await uploadToBridge('posts', { quiet: true }));
    results.push(await uploadToBridge('comics', { quiet: true }));
    if (pendingOps.length) { await syncInteractions(); results.push({ success: !pendingOps.length }); }
    else results.push(await uploadToBridge('interactions', { data: interactionsCache, quiet: true }));
    dismissToast(t);
    const failed = results.filter(r => !r.success).length;
    if (failed) showToast(failed + ' of 4 files didn\'t sync. Try again in a moment.', 'error');
    else showToast('Everything synced');
}

function downloadBackup() {
    downloadSystemJS();
    setTimeout(downloadPostsJS, 300);
    setTimeout(downloadComicsJS, 600);
    setTimeout(downloadInteractionsJS, 900);
    showToast('Downloading system.js, posts.js, comics.js and interactions.js');
    writeJSON(KEYS.lastBackup, Date.now());
    if (typeof renderBackupNudge === 'function') renderBackupNudge();
}

function downloadInteractionsJS() { downloadFile('window.AZUMINT_INTERACTIONS = "' + unicodeToBase64(JSON.stringify(interactionsCache)) + '";', 'interactions.js'); }

/* Uploads a list of files one by one. onStep(i, total, file) reports progress. Returns paths, or null on failure. */
async function uploadFiles(files, folder, onStep) {
    const out = [];
    for (let i = 0; i < files.length; i++) {
        let f = files[i];
        if (onStep) onStep(i, files.length, f);
        if (!isLocalMode() && currentConfig.webpUploads !== false && canShrink(f.type, f.name)) {
            const w = await toWebp(f, f.name);
            if (w) f = new File([w], webpName(f.name), { type: 'image/webp' });
        }
        if (isLocalMode()) {
            const b64 = await compressImage(f, folder.includes('comics') ? 1000 : 1200, 0.7, false);
            if (!b64) { showToast('Couldn\'t read ' + f.name, 'error'); return null; }
            out.push(b64);
        } else {
            const path = folder + safeFileName(f.name, f.type);
            try { await promisifiedUpload(f, path); out.push(path); }
            catch (err) { showToast('Upload failed for ' + f.name + '. ' + err, 'error'); return null; }
            await addPreview(f, path);
        }
    }
    if (onStep) onStep(files.length, files.length, null);
    return out;
}

function promisifiedUpload(file, path) {
    return uploadToBridge('media_only', { mediaFile: file, mediaPath: path }).then(r => { if (!r.success) throw (r.message || 'Upload failed'); return path; });
}

/* Image compression, used when running the site from your computer without uploads */
function compressImage(file, maxWidth = 800, quality = 0.65, forceJPEG = true) {
    return new Promise(resolve => {
        const reader = new FileReader();
        reader.onerror = () => resolve(null);
        reader.onload = () => {
            const dataUri = reader.result;
            if (!file.type || !file.type.startsWith('image/')) return resolve(dataUri);
            const img = new Image();
            img.onerror = () => resolve(dataUri);
            img.onload = () => {
                let w = img.naturalWidth, h = img.naturalHeight;
                if (w > maxWidth) { h = Math.round(h * maxWidth / w); w = maxWidth; }
                const c = document.createElement('canvas'); c.width = w; c.height = h;
                c.getContext('2d').drawImage(img, 0, 0, w, h);
                const mime = (!forceJPEG && file.type === 'image/png') ? 'image/png' : 'image/jpeg';
                const out = c.toDataURL(mime, mime === 'image/png' ? undefined : quality);
                resolve(out.length < dataUri.length ? out : dataUri);
            };
            img.src = dataUri;
        };
        reader.readAsDataURL(file);
    });
}

// Returns a smaller WebP blob, or null when converting wouldn't help (animated, already small, or the browser can't make WebP)
async function toWebp(blob, name) {
    if (!canShrink(blob.type, name)) return null;
    try {
        if (isAnimatedPng(await blob.arrayBuffer())) return null;
        const bmp = await createImageBitmap(blob, { imageOrientation: 'from-image' });
        const c = document.createElement('canvas');
        c.width = bmp.width; c.height = bmp.height;
        c.getContext('2d').drawImage(bmp, 0, 0);
        if (bmp.close) bmp.close();
        const out = await new Promise(res => c.toBlob(res, 'image/webp', WEBP_QUALITY));
        return out && out.type === 'image/webp' && out.size < blob.size * 0.95 ? out : null;
    } catch (e) { return null; }
}

/* WebP: PNG and JPG art re-encoded in the browser, usually a fraction of the size at a quality that looks the same */
const WEBP_QUALITY = 0.9;

function canShrink(type, name) { return /^image\/(png|jpeg|bmp)$/.test(type || '') || SHRINKABLE_EXT.test(name || ''); }

const SHRINKABLE_EXT = /\.(png|jpe?g|bmp)(?=([?#].*)?$)/i;

function webpName(name) { return String(name || 'image').replace(/\.[^./]*$/, '') + '.webp'; }

// Makes and uploads the small copy of a picture stored at path (ref is how posts refer to it), and notes its size.
// Quietly skips when it can't
async function addPreview(blob, path, ref) {
    const info = await readPicture(blob, path);
    if (info) freshSizes.set(ref || path, [info.w, info.h]);
    const small = info && info.small;
    if (!small) return 'skip';
    const to = previewPath(path);
    const r = await uploadToBridge('media_only', { mediaFile: new File([small], to.split('/').pop(), { type: 'image/webp' }), mediaPath: to, quiet: true });
    if (!r.success) return 'fail';
    freshPreviews.set(ref || path, to);
    return 'ok';
}

// img/ab12.png → img/p/ab12-png.webp (the old type stays in the name, so two pictures never share a copy)
function previewPath(path) { return path.replace(/([^/]+)\.([a-z0-9]+)$/i, 'p/$1-$2.webp'); }

// Reads a picture once: its size, and (when wanted) a small WebP copy if it is big and not animated. Null when it can't be read
async function readPicture(blob, name, wantCopy = true) {
    const plain = String(name || '').split(/[?#]/)[0];
    if (!SIZEABLE.test(plain) && !/^image\//.test(blob.type || '')) return null;
    try {
        const buf = await blob.arrayBuffer();
        const bmp = await createImageBitmap(blob, { imageOrientation: 'from-image' });
        const info = { w: bmp.width, h: bmp.height, small: null };
        const s = Math.min(PREVIEW_SIDE / Math.min(info.w, info.h), PREVIEW_MAX / Math.max(info.w, info.h));
        const copyable = (PREVIEWABLE.test(plain) || /^image\/(png|jpeg|webp|bmp)$/.test(blob.type || '')) && !isAnimatedPng(buf) && !isAnimatedWebp(buf);
        if (wantCopy && copyable && s <= 0.75) {
            const c = document.createElement('canvas');
            c.width = Math.round(info.w * s); c.height = Math.round(info.h * s);
            const cx = c.getContext('2d'); cx.imageSmoothingQuality = 'high';
            cx.drawImage(bmp, 0, 0, c.width, c.height);
            const out = await new Promise(res => c.toBlob(res, 'image/webp', PREVIEW_QUALITY));
            if (out && out.type === 'image/webp' && out.size < blob.size * 0.7) info.small = out;
        }
        if (bmp.close) bmp.close();
        return info;
    } catch (e) { return null; }
}

// Animated PNGs carry an acTL chunk before their first IDAT; a canvas would flatten them to one frame
function isAnimatedPng(buf) {
    const b = new Uint8Array(buf), dv = new DataView(buf);
    if (b.length < 16 || b[1] !== 0x50 || b[2] !== 0x4E || b[3] !== 0x47) return false;
    for (let i = 8; i + 8 <= b.length;) {
        const type = String.fromCharCode(b[i + 4], b[i + 5], b[i + 6], b[i + 7]);
        if (type === 'acTL') return true;
        if (type === 'IDAT') return false;
        i += 12 + dv.getUint32(i);
    }
    return false;
}

const PREVIEW_SIDE = 800, PREVIEW_MAX = 2400, PREVIEW_QUALITY = 0.82;

const PREVIEWABLE = /\.(png|jpe?g|webp|bmp)$/i, SIZEABLE = /\.(png|jpe?g|webp|bmp|gif|avif)$/i;

function isAnimatedWebp(buf) {
    const b = new Uint8Array(buf), tag = i => String.fromCharCode(b[i], b[i + 1], b[i + 2], b[i + 3]);
    return b.length > 21 && tag(8) === 'WEBP' && tag(12) === 'VP8X' && (b[20] & 2) === 2;
}

function readPreviews(files) {
    return Promise.all(files.map(f => new Promise(res => {
        if (!f.type || !f.type.startsWith('image/')) return res({ file: f, preview: null });
        const r = new FileReader();
        r.onload = e => res({ file: f, preview: e.target.result });
        r.onerror = () => res({ file: f, preview: null });
        r.readAsDataURL(f);
    })));
}

function logoutAdmin() {
    if (Studio.dirty) { Studio.draft = null; Studio.dirty = false; Studio.ring = null; applyTheme(); }
    isAdminLoggedIn = false; sessionPassword = null;
    renderAdminView();
    renderFeed();
    showToast('Logged out');
}

function enableDragSort(container, itemSel, onMove) {
    let from = null;
    $$(itemSel, container).forEach(item => {
        item.addEventListener('dragstart', e => { from = Number(item.dataset.index); item.classList.add('is-drag'); e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', String(from)); } catch (x) {} });
        item.addEventListener('dragend', () => { item.classList.remove('is-drag'); $$('.is-target', container).forEach(n => n.classList.remove('is-target')); });
        item.addEventListener('dragover', e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; item.classList.add('is-target'); });
        item.addEventListener('dragleave', () => item.classList.remove('is-target'));
        item.addEventListener('drop', e => { e.preventDefault(); const to = Number(item.dataset.index); if (from !== null && from !== to) onMove(from, to); from = null; });
    });
}

function wireDropzone(zone, onFiles) {
    if (!zone) return;
    const input = byId(zone.dataset.input);
    zone.addEventListener('click', e => { if (e.target !== input) input.click(); });
    zone.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); } });
    ['dragenter', 'dragover'].forEach(t => zone.addEventListener(t, e => { e.preventDefault(); zone.classList.add('is-over'); }));
    ['dragleave', 'drop'].forEach(t => zone.addEventListener(t, e => { e.preventDefault(); zone.classList.remove('is-over'); }));
    zone.addEventListener('drop', e => { if (e.dataTransfer && e.dataTransfer.files.length) onFiles(e.dataTransfer.files); });
    input.addEventListener('change', () => { if (input.files.length) onFiles(input.files); input.value = ''; });
}

/* ═════════════════════════════════════════════
   ADMIN: NEW POST
   ═════════════════════════════════════════════ */

let currentPostMediaQueue = [];

function knownTags() {
    const set = new Map();
    PRESET_TAGS.concat(...postsCache.map(postTags)).forEach(t => { const k = t.toLowerCase(); if (!set.has(k)) set.set(k, t); });
    return Array.from(set.values());
}
function renderNewPostTags() {
    const box = byId('np-tags'); if (!box) return;
    const selected = new Set($$('.chip[aria-pressed="true"]', box).map(b => b.dataset.tag));
    box.innerHTML = knownTags().map(t => '<button type="button" class="chip" data-action="toggle-chip" data-tag="' + esc(t) + '" aria-pressed="' + selected.has(t) + '">' + esc(t) + '</button>').join('');
}
function selectedNewPostTags() {
    const tags = $$('#np-tags .chip[aria-pressed="true"]').map(b => b.dataset.tag);
    String(byId('np-custom-tags').value || '').split(',').map(t => t.trim()).filter(Boolean).forEach(t => { if (!tags.some(x => x.toLowerCase() === t.toLowerCase())) tags.push(t); });
    return tags;
}

async function addFilesToQueue(files) {
    const items = await readPreviews(Array.from(files).filter(f => /^(image|video|audio)\//.test(f.type) || !f.type));
    items.forEach(it => currentPostMediaQueue.push({ type: 'file', val: it.file, preview: it.preview }));
    renderMediaQueue();
}
function addUrlToQueue() {
    const el = byId('np-url'); const url = safeUrl(el.value);
    if (!url) { showToast('Paste a link first.', 'error'); return; }
    currentPostMediaQueue.push({ type: 'url', val: url });
    el.value = '';
    renderMediaQueue();
}
function renderMediaQueue() {
    const list = byId('np-queue'); if (!list) return;
    list.innerHTML = currentPostMediaQueue.map((item, i) => {
        const name = item.type === 'file' ? item.val.name : item.val;
        const kind = item.type === 'file' ? (item.val.type || '') : getMediaType(item.val);
        let thumb;
        if (item.preview) thumb = '<img class="thumb" src="' + esc(item.preview) + '" alt="">';
        else if (item.type === 'url' && getMediaType(item.val) === 'image') thumb = '<img class="thumb" src="' + esc(item.val) + '" alt="">';
        else thumb = '<span class="thumb"><i class="fa-solid ' + (/video/.test(kind) ? 'fa-film' : /audio/.test(kind) ? 'fa-music' : 'fa-link') + '" aria-hidden="true"></i></span>';
        return '<li draggable="true" data-index="' + i + '">' + thumb + '<span class="name" title="' + esc(name) + '">' + esc(name) + '</span>'
            + '<button class="q-btn" data-action="queue-move" data-index="' + i + '" data-dir="-1" aria-label="Move up"' + (i === 0 ? ' disabled' : '') + '><i class="fa-solid fa-arrow-up" aria-hidden="true"></i></button>'
            + '<button class="q-btn" data-action="queue-move" data-index="' + i + '" data-dir="1" aria-label="Move down"' + (i === currentPostMediaQueue.length - 1 ? ' disabled' : '') + '><i class="fa-solid fa-arrow-down" aria-hidden="true"></i></button>'
            + '<button class="q-btn del" data-action="queue-remove" data-index="' + i + '" aria-label="Remove"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button></li>';
    }).join('');
    enableDragSort(list, 'li', (from, to) => { const [m] = currentPostMediaQueue.splice(from, 1); currentPostMediaQueue.splice(to, 0, m); renderMediaQueue(); });
}

let publishing = false;
async function createPost() {
    if (publishing) return;
    const content = byId('np-content').value.trim();
    if (byId('np-url').value.trim()) addUrlToQueue();
    if (!content && !currentPostMediaQueue.length) { showToast('Add a caption or some media first.', 'error'); return; }
    // A sketch pairs with the first picture, so that has to be a picture
    const sketch = safeUrl((byId('np-sketch') || {}).value || ''), firstItem = currentPostMediaQueue[0];
    if (sketch && !(firstItem && (firstItem.type === 'file' ? /^image\//.test(firstItem.val.type) : getMediaType(firstItem.val) === 'image'))) { showToast('A sketch goes with the first picture, so put a picture first in this post.', 'error'); return; }
    const at = byId('np-later').checked ? new Date(byId('np-at').value).getTime() : 0;
    if (byId('np-later').checked && !(at > Date.now() + 30000)) { showToast('Pick a time in the future to schedule this post.', 'error'); return; }
    publishing = true;
    const files = currentPostMediaQueue.filter(i => i.type === 'file').map(i => i.val);
    let paths = [];
    if (files.length) {
        let t = null;
        paths = await uploadFiles(files, 'img/', (i, n) => { dismissToast(t); if (i < n) t = showToast('Uploading ' + (i + 1) + ' of ' + n, 'loading'); });
        dismissToast(t);
        if (!paths) { publishing = false; return; }
    }
    let fi = 0;
    const media = currentPostMediaQueue.map(item => item.type === 'file' ? paths[fi++] : item.val).filter(Boolean);
    const post = { id: at ? freePostId(at) : Date.now(), content, tags: selectedNewPostTags(), pinned: byId('np-pinned').checked };
    if (at) post.at = post.id;
    const alt = byId('np-alt').value.trim(); if (alt) post.alt = alt;
    if (media.length === 1) post.media = media[0]; else if (media.length > 1) post.media = media;
    if (sketch) { post.sketch = sketch; const start = byId('np-sketch-start').value; if (start !== 'middle') post.sketchStart = start; }
    postsCache.push(post);

    byId('np-content').value = ''; byId('np-alt').value = ''; byId('np-custom-tags').value = ''; byId('np-pinned').checked = false;
    byId('np-sketch').value = ''; byId('np-sketch-start').value = 'middle';
    byId('np-later').checked = false; syncScheduleField();
    $$('#np-tags .chip').forEach(b => b.setAttribute('aria-pressed', 'false'));
    currentPostMediaQueue = []; renderMediaQueue();
    ui.feed.limit = FEED_STEP;
    renderHome(); renderNewPostTags();
    await savePosts();
    publishing = false;
    showToast(at ? 'Scheduled for ' + whenText(at) : 'Published');
}

/* Scheduling: a scheduled post's id is the time it goes up (a few random milliseconds keep ids apart),
   so it sorts, dates and numbers like a post made at that moment */
function freePostId(at) {
    let id = Math.floor(at / 1000) * 1000 + Math.floor(Math.random() * 1000);
    while (postsCache.some(p => p.id === id)) id++;
    return id;
}
function whenText(ts) { return new Date(ts).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }); }
// The value a datetime-local field uses, in this device's time
function localInputValue(ts) { const d = new Date(ts - new Date(ts).getTimezoneOffset() * 60000); return d.toISOString().slice(0, 16); }
function syncScheduleField() {
    const on = byId('np-later').checked, at = byId('np-at');
    byId('np-at-field').hidden = !on;
    at.min = localInputValue(Date.now());
    if (on && !at.value) at.value = localInputValue(Math.ceil((Date.now() + 36e5) / 9e5) * 9e5);
    byId('np-publish').innerHTML = '<i class="fa-solid fa-paper-plane" aria-hidden="true"></i> ' + (on ? 'Schedule post' : 'Publish post');
}

/* Bulk upload: every image becomes its own post */
let bulkFiles = [];
async function setBulkFiles(files) {
    bulkFiles = Array.from(files).filter(f => /^image\//.test(f.type));
    const items = await readPreviews(bulkFiles);
    byId('bulk-preview').innerHTML = items.map(it => it.preview ? '<img src="' + esc(it.preview) + '" alt="">' : '').join('');
    const btn = byId('bulk-btn');
    btn.disabled = !bulkFiles.length;
    btn.textContent = bulkFiles.length ? 'Upload as ' + plural(bulkFiles.length, 'post') : 'Upload as separate posts';
}
async function bulkUpload() {
    if (!bulkFiles.length || publishing) return;
    publishing = true;
    const tags = selectedNewPostTags();
    const box = byId('bulk-progress'), bar = byId('bulk-progress-bar'), txt = byId('bulk-progress-text'), cnt = byId('bulk-progress-count');
    box.hidden = false;
    const paths = await uploadFiles(bulkFiles, 'img/', (i, n, f) => {
        bar.style.width = (i / n * 100) + '%'; cnt.textContent = Math.min(i + 1, n) + ' of ' + n;
        txt.textContent = f ? 'Uploading ' + f.name : 'Saving posts';
    });
    if (!paths) { publishing = false; box.hidden = true; return; }
    const base = Date.now();
    paths.forEach((path, i) => postsCache.push({ id: base + i, content: '', media: path, tags: tags.slice(), date: new Date().toLocaleDateString() }));
    bar.style.width = '100%';
    renderHome(); renderNewPostTags();
    await savePosts();
    bulkFiles = []; byId('bulk-files').value = ''; byId('bulk-preview').innerHTML = '';
    const btn = byId('bulk-btn'); btn.disabled = true; btn.textContent = 'Upload as separate posts';
    setTimeout(() => { box.hidden = true; bar.style.width = '0'; }, 1600);
    publishing = false;
    showToast('Published ' + plural(paths.length, 'post'));
}

/* ═════════════════════════════════════════════
   ADMIN: MANAGE POSTS
   ═════════════════════════════════════════════ */

let editingPostId = null;
function renderManagePosts() {
    const list = byId('mp-list'); if (!list) return;
    const q = (byId('mp-search').value || '').toLowerCase().trim();
    const posts = sortPosts(postsCache, 'newest').filter(p => !q || (plainText(p.content) + ' ' + postTags(p).join(' ')).toLowerCase().includes(q));
    byId('mp-count').textContent = plural(posts.length, 'post');
    if (!posts.length) { list.innerHTML = '<div class="empty"><h3>' + (q ? 'No posts match' : 'No posts yet') + '</h3></div>'; return; }
    list.innerHTML = posts.map(p => {
        const media = mediaList(p);
        const thumb = firstImage(p);
        const ints = getInteractions(p.id);
        const title = excerpt(p.content, 90);
        const editing = editingPostId === p.id;
        return '<div class="m-row" data-id="' + p.id + '">'
            + '<div class="m-thumb">' + (thumb ? '<img src="' + esc(thumbOf(thumb)) + '" alt="" loading="lazy">' : '<i class="fa-solid fa-align-left" aria-hidden="true"></i>') + '</div>'
            + '<div class="m-body"><span class="m-title' + (title ? '' : ' is-muted') + '">' + (title ? esc(title) : 'No caption') + '</span>'
            + '<span class="m-meta"><span>' + esc(formatDate(p)) + '</span>' + (isScheduled(p) ? '<span class="pin">Goes up ' + esc(whenText(p.at)) + '</span>' : '') + (p.pinned ? '<span class="pin">Pinned</span>' : '')
            + '<span><i class="fa-solid fa-thumbs-up" aria-hidden="true"></i> ' + (ints.likes || 0) + '</span><span><i class="fa-solid fa-thumbs-down" aria-hidden="true"></i> ' + (ints.dislikes || 0) + '</span>'
            + '<span><i class="fa-regular fa-comment" aria-hidden="true"></i> ' + commentCount(p.id) + '</span>' + (media.length ? '<span><i class="fa-regular fa-image" aria-hidden="true"></i> ' + media.length + '</span>' : '') + '</span>'
            + (postTags(p).length ? '<span class="m-tags">' + postTags(p).map(t => '<span>' + esc(t) + '</span>').join('') + '</span>' : '')
            + '</div>'
            + '<div class="m-actions">'
            + '<a class="btn small" href="#/post/' + p.id + '" data-action="open-post" data-id="' + p.id + '">View</a>'
            + '<button class="btn small" data-action="edit-post" data-id="' + p.id + '">' + (editing ? 'Close' : 'Edit') + '</button>'
            + '<button class="btn small" data-action="toggle-pin" data-id="' + p.id + '">' + (p.pinned ? 'Unpin' : 'Pin') + '</button>'
            + '<button class="btn small danger" data-action="delete-post" data-id="' + p.id + '">Delete</button>'
            + '</div>'
            + (editing ? editPostHTML(p) : '')
            + '</div>';
    }).join('');
}
function editPostHTML(p) {
    const media = mediaList(p);
    return '<form class="m-edit" data-form="edit-post" data-id="' + p.id + '">'
        + '<label class="field"><span>Caption</span><textarea name="content" rows="4">' + esc(p.content || '') + '</textarea></label>'
        + '<label class="field"><span>Picture description <em>(for screen readers)</em></span><input type="text" name="alt" value="' + esc(p.alt || '') + '"></label>'
        + '<label class="field"><span>Tags, separated by commas</span><input type="text" name="tags" value="' + esc(postTags(p).join(', ')) + '"></label>'
        + (isScheduled(p) ? '<label class="field"><span>Goes up at <em>(your time; clear it to put the post up now)</em></span><input type="datetime-local" name="at" value="' + localInputValue(p.at) + '"></label>' : '')
        + '<div class="field"><span>Sketch <em>(optional: adds a slider that compares it with the first picture)</em></span><div class="inline-form"><input type="text" name="sketch" id="ep-sketch-' + p.id + '" value="' + esc(p.sketch || '') + '" placeholder="img/sketch.png" aria-label="Sketch link"><label class="btn small file-btn"><i class="fa-solid fa-upload" aria-hidden="true"></i> Upload<input type="file" accept="image/*" data-upload-target="ep-sketch-' + p.id + '" hidden></label></div></div>'
        + '<label class="field"><span>The slider starts at</span><select name="sketchStart">' + [['middle', 'Half way'], ['sketch', 'The sketch'], ['finished', 'The finished piece']].map(([v, l]) => '<option value="' + v + '"' + ((p.sketchStart || 'middle') === v ? ' selected' : '') + '>' + l + '</option>').join('') + '</select></label>'
        + (media.length ? '<div class="field"><span>Media <em>(tap ✕ to remove from this post)</em></span><div class="m-media">' + media.map((u, i) => '<span class="mm" data-i="' + i + '">' + (getMediaType(u) === 'image' ? '<img src="' + esc(u) + '" alt="">' : '<i class="fa-solid fa-film" aria-hidden="true"></i>') + '<button type="button" data-action="edit-remove-media" aria-label="Remove">✕</button></span>').join('') + '</div></div>' : '')
        + '<div class="form-foot"><button type="button" class="btn btn-ghost small" data-action="edit-post" data-id="' + p.id + '">Cancel</button><button type="submit" class="btn btn-primary small">Save changes</button></div>'
        + '</form>';
}
function saveEditedPost(form) {
    const post = postsCache.find(p => p.id === Number(form.dataset.id)); if (!post) return;
    if (form.elements.at) {
        const v = form.elements.at.value, at = v ? new Date(v).getTime() : 0;
        if (!at || at <= Date.now() + 30000) { post.id = Date.now(); delete post.at; }
        else if (Math.floor(at / 6e4) !== Math.floor(post.at / 6e4)) { post.id = post.at = freePostId(at); }
    }
    post.content = form.elements.content.value.trim();
    const alt = form.elements.alt.value.trim(); if (alt) post.alt = alt; else delete post.alt;
    post.tags = form.elements.tags.value.split(',').map(t => t.trim()).filter(Boolean);
    const sketch = safeUrl(form.elements.sketch ? form.elements.sketch.value : '');
    if (sketch) post.sketch = sketch; else delete post.sketch;
    const start = form.elements.sketchStart ? form.elements.sketchStart.value : 'middle';
    if (sketch && start !== 'middle') post.sketchStart = start; else delete post.sketchStart;
    const removed = $$('.mm.is-removed', form).map(n => Number(n.dataset.i));
    if (removed.length) {
        const keep = mediaList(post).filter((_, i) => !removed.includes(i));
        if (!keep.length) delete post.media; else post.media = keep.length === 1 ? keep[0] : keep;
    }
    editingPostId = null;
    renderManagePosts(); renderHome();
    savePosts();
}
function togglePin(id) {
    const p = postsCache.find(x => x.id === Number(id)); if (!p) return;
    p.pinned = !p.pinned;
    renderManagePosts(); renderHome();
    savePosts();
}
async function deletePost(id) {
    id = Number(id);
    if (!await askConfirm('It\'s removed from your site for good. This can\'t be undone.', { hold: true, title: 'Delete this post?' })) return;
    postsCache = postsCache.filter(p => p.id !== id);
    delete interactionsCache[id]; delete interactionsRemote[id];
    if (ui.post.id === id) closePost();
    renderHome(); renderManagePosts();
    if (ui.view === 'gallery') renderGallery();
    savePosts();
}

/* ═════════════════════════════════════════════
   ADMIN: COMICS
   ═════════════════════════════════════════════ */

let comicPagesQueue = [];
let addPagesComicId = null, addPagesQueue = [];

/* Each comic keeps its pages in its own folder inside img/comics/, named after the comic when its first pages
   upload: "Space Cats" → img/comics/space-cats/ (small copies in img/comics/space-cats/p/). The folder name is
   saved on the comic, so renaming the comic later keeps all its pages together. Accents and apostrophes are
   dropped: "Café Days" → cafe-days, "Girl's Night" → girls-night. */
function comicSlug(title) {
    return String(title || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/['\u2018\u2019\u02bc`]/g, '')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40).replace(/-+$/, '');
}
function comicFolder(c) {
    if (!/^[a-z0-9][a-z0-9-]*$/.test(c.folder || '')) {
        let name = comicSlug(c.title) || 'comic';
        // p/ already holds the small copies of older comics' pages, and two comics never share a folder
        if (name === 'p' || comicsCache.some(o => o !== c && o.folder === name)) name += '-' + Number(c.id).toString(36);
        c.folder = name;
    }
    return 'img/comics/' + c.folder + '/';
}

function renderPageSorter(boxId, queue, rerender) {
    const box = byId(boxId); if (!box) return;
    box.innerHTML = queue.map((it, i) => '<div class="ps-item" draggable="true" data-index="' + i + '">' + (it.preview ? '<img src="' + esc(it.preview) + '" alt="">' : '') + '<span class="num">' + (i + 1) + '</span><button type="button" data-action="sorter-remove" data-sorter="' + boxId + '" data-index="' + i + '" aria-label="Remove page ' + (i + 1) + '">✕</button></div>').join('');
    enableDragSort(box, '.ps-item', (from, to) => { const [m] = queue.splice(from, 1); queue.splice(to, 0, m); rerender(); });
}
function renderNewComicPages() { renderPageSorter('nc-pages', comicPagesQueue, renderNewComicPages); }
function renderAddPages() { renderPageSorter('ap-pages', addPagesQueue, renderAddPages); }

async function setComicFiles(files, target) {
    const items = await readPreviews(Array.from(files).filter(f => /^image\//.test(f.type)).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true })));
    if (target === 'nc') { comicPagesQueue.push(...items); renderNewComicPages(); }
    else { addPagesQueue.push(...items); renderAddPages(); }
}

async function createComic() {
    if (publishing) return;
    const title = byId('nc-title').value.trim();
    const cover = safeUrl(byId('nc-cover').value);
    const tags = byId('nc-tags').value.split(',').map(t => t.trim()).filter(Boolean);
    if (!title) { showToast('Give the comic a title.', 'error'); byId('nc-title').focus(); return; }
    if (!comicPagesQueue.length) { showToast('Add at least one page.', 'error'); return; }
    publishing = true;
    const box = byId('nc-progress'), bar = byId('nc-progress-bar'), txt = byId('nc-progress-text');
    box.hidden = false;
    const comic = { id: Date.now(), title, cover: '', pages: [], tags, date: new Date().toLocaleDateString() };
    const mode = byId('nc-mode') ? byId('nc-mode').value : 'page';
    if (mode !== 'page') comic.mode = mode;
    const pages = await uploadFiles(comicPagesQueue.map(i => i.file), comicFolder(comic), (i, n) => { bar.style.width = (i / n * 100) + '%'; txt.textContent = i < n ? 'Uploading page ' + (i + 1) + ' of ' + n : 'Saving comic'; });
    if (!pages) { publishing = false; box.hidden = true; return; }
    comic.cover = cover || pages[0]; comic.pages = pages;
    comicsCache.push(comic);
    byId('nc-title').value = ''; byId('nc-cover').value = ''; byId('nc-tags').value = ''; byId('nc-files').value = '';
    if (byId('nc-mode')) byId('nc-mode').value = 'page';
    comicPagesQueue = []; renderNewComicPages();
    bar.style.width = '100%';
    renderComicsAdmin(); renderComics();
    await saveComics();
    box.hidden = true; bar.style.width = '0';
    publishing = false;
    showToast('Comic created');
}

let editingComicId = null;
function renderComicsAdmin() {
    const list = byId('mc-list'); if (!list) return;
    const comics = comicsCache.slice().sort((a, b) => b.id - a.id);
    if (!comics.length) { list.innerHTML = '<div class="empty"><h3>No comics yet</h3><p>Make one above.</p></div>'; return; }
    list.innerHTML = comics.map(c => {
        const cover = comicCover(c);
        const editing = editingComicId === c.id;
        return '<div class="m-row" data-id="' + c.id + '">'
            + '<div class="m-thumb">' + (cover ? '<img src="' + esc(thumbOf(cover)) + '" alt="" loading="lazy">' : '<i class="fa-solid fa-book" aria-hidden="true"></i>') + '</div>'
            + '<div class="m-body"><span class="m-title">' + esc(c.title || 'Untitled') + '</span><span class="m-meta"><span>' + plural((c.pages || []).length, 'page') + '</span>' + (c.date ? '<span>' + esc(c.date) + '</span>' : '') + '</span>'
            + ((c.tags || []).length ? '<span class="m-tags">' + c.tags.map(t => '<span>' + esc(t) + '</span>').join('') + '</span>' : '') + '</div>'
            + '<div class="m-actions"><button class="btn small" data-action="open-add-pages" data-id="' + c.id + '"><i class="fa-solid fa-plus" aria-hidden="true"></i> Add pages</button>'
            + '<button class="btn small" data-action="edit-comic" data-id="' + c.id + '">' + (editing ? 'Close' : 'Edit') + '</button>'
            + '<button class="btn small danger" data-action="delete-comic" data-id="' + c.id + '">Delete</button></div>'
            + (editing ? '<form class="m-edit" data-form="edit-comic" data-id="' + c.id + '"><div class="form-grid">'
                + '<label class="field"><span>Title</span><input type="text" name="title" value="' + esc(c.title || '') + '"></label>'
                + '<label class="field"><span>Tags</span><input type="text" name="tags" value="' + esc((c.tags || []).join(', ')) + '"></label>'
                + '<label class="field"><span>Cover image link</span><input type="text" name="cover" value="' + esc(c.cover || '') + '"></label>'
                + '<label class="field"><span>Opens in <em>(readers can still switch)</em></span><select name="mode">' + [['page', 'One page at a time'], ['scroll', 'Long scroll'], ['spread', 'Two pages, like a comic book']].map(([v, l]) => '<option value="' + v + '"' + ((c.mode || 'page') === v ? ' selected' : '') + '>' + l + '</option>').join('') + '</select></label></div>'
                + '<div class="field"><span>Pages <em>(drag to reorder, tap <i class="fa-solid fa-arrows-rotate" aria-hidden="true"></i> to swap an image, tap ✕ to remove a page)</em></span>'
                + '<div class="page-sorter ec-sorter" id="ec-pages"></div>'
                + '<input type="file" accept="image/*" id="ec-swap-file" hidden>'
                + '<p class="hint">Nothing changes on your site until you press Save changes. Cancel throws away your edits.</p></div>'
                + '<div class="form-foot"><button type="button" class="btn btn-ghost small" data-action="edit-comic" data-id="' + c.id + '">Cancel</button><button type="submit" class="btn btn-primary small">Save changes</button></div></form>' : '')
            + '</div>';
    }).join('');
    if (editingComicId != null) renderEditComicPages();
}

/* Editing the pages of a comic that's already posted.
   Works on a draft copy, so swaps, removals and reordering only stick once "Save changes" is pressed. */
let editPagesDraft = { id: null, items: [] }, editSwapIndex = null;
function resetEditPagesDraft() { editPagesDraft = { id: null, items: [] }; editSwapIndex = null; }
function renderEditComicPages() {
    const box = byId('ec-pages'); if (!box) return;
    const c = getComic(editingComicId); if (!c) return;
    if (editPagesDraft.id !== c.id) editPagesDraft = { id: c.id, items: (c.pages || []).map(url => ({ url, orig: url, file: null, preview: null })) };
    const items = editPagesDraft.items;
    box.innerHTML = items.map((it, i) => '<div class="ps-item' + (it.file ? ' is-new' : '') + '" draggable="true" data-index="' + i + '">'
        + '<img src="' + esc(it.preview || it.url) + '" alt="">'
        + '<span class="num">' + (i + 1) + '</span>'
        + '<button type="button" class="ps-swap" data-action="ec-swap" data-index="' + i + '" aria-label="Swap the image on page ' + (i + 1) + '"><i class="fa-solid fa-arrows-rotate" aria-hidden="true"></i></button>'
        + '<button type="button" data-action="ec-remove" data-index="' + i + '" aria-label="Remove page ' + (i + 1) + '">✕</button>'
        + '</div>').join('');
    enableDragSort(box, '.ps-item', (from, to) => { const [m] = items.splice(from, 1); items.splice(to, 0, m); renderEditComicPages(); });
}
function editComicSwap(index) {
    editSwapIndex = Number(index);
    const input = byId('ec-swap-file'); if (input) input.click();
}
async function editComicSwapPicked(input) {
    const file = input.files && input.files[0];
    input.value = '';
    const it = editPagesDraft.items[editSwapIndex];
    const pageNum = editSwapIndex + 1;
    editSwapIndex = null;
    if (!file || !it) return;
    if (!/^image\//.test(file.type)) { showToast('That file isn\'t an image. Pick a PNG, JPG, GIF or WEBP.', 'error'); return; }
    const [p] = await readPreviews([file]);
    it.file = file; it.preview = p.preview;
    renderEditComicPages();
    showToast('Page ' + pageNum + ' swapped. Press Save changes to keep it.');
}
function editComicRemove(index) {
    const items = editPagesDraft.items;
    if (items.length <= 1) { showToast('A comic needs at least one page. Swap this one instead, or delete the comic.', 'error'); return; }
    items.splice(Number(index), 1);
    renderEditComicPages();
}
async function saveEditedComic(form) {
    const c = getComic(form.dataset.id); if (!c || publishing) return;
    // Read the form now, before any upload, in case the list re-renders while waiting
    const title = form.elements.title.value.trim();
    const tags = form.elements.tags.value.split(',').map(t => t.trim()).filter(Boolean);
    const coverField = safeUrl(form.elements.cover.value);
    const mode = form.elements.mode ? form.elements.mode.value : 'page';
    const oldPages = (c.pages || []).slice();
    const items = editPagesDraft.id === c.id ? editPagesDraft.items : oldPages.map(url => ({ url, orig: url, file: null, preview: null }));
    if (!items.length) { showToast('A comic needs at least one page.', 'error'); return; }

    // Upload any swapped-in images first
    const swaps = items.filter(it => it.file);
    if (swaps.length) {
        publishing = true;
        const btn = form.querySelector('[type="submit"]'); if (btn) btn.disabled = true;
        const t = showToast('Uploading ' + plural(swaps.length, 'new page'), 'loading');
        const paths = await uploadFiles(swaps.map(it => it.file), comicFolder(c));
        dismissToast(t);
        publishing = false;
        if (btn) btn.disabled = false;
        if (!paths) return; // uploadFiles already showed what went wrong; the draft is kept so you can try again
        swaps.forEach((it, k) => { it.url = paths[k]; it.file = null; it.preview = null; });
    }
    const pages = items.map(it => it.url);

    // Keep the cover pointing at a real page: follow a swap, or fall back to page 1 if its page was removed
    let cover = coverField;
    const swapped = items.find(it => it.orig && it.orig === cover && it.url !== it.orig);
    if (swapped) cover = swapped.url;
    else if (!cover || (oldPages.includes(cover) && !pages.includes(cover))) cover = pages[0];

    c.title = title || c.title;
    c.tags = tags;
    if (mode && mode !== 'page') c.mode = mode; else delete c.mode;
    c.pages = pages;
    c.cover = cover;
    editingComicId = null; resetEditPagesDraft();
    renderComicsAdmin(); renderComics();
    saveComics();
}
async function deleteComic(id) {
    if (!await askConfirm('The page images stay on Neocities, but the comic is removed from your site.', { hold: true, title: 'Delete this comic?' })) return;
    comicsCache = comicsCache.filter(c => c.id !== Number(id));
    renderComicsAdmin(); renderComics();
    saveComics();
}
function openAddPagesModal(id) {
    const c = getComic(id); if (!c) return;
    addPagesComicId = c.id; addPagesQueue = [];
    byId('ap-title').textContent = c.title || 'Untitled';
    byId('ap-count').textContent = '(' + plural((c.pages || []).length, 'page') + ' now)';
    byId('ap-files').value = ''; renderAddPages();
    byId('ap-progress').hidden = true;
    Modals.open(byId('ap-modal'));
}
async function submitAddPages() {
    const c = getComic(addPagesComicId); if (!c || publishing) return;
    if (!addPagesQueue.length) { showToast('Choose at least one page.', 'error'); return; }
    publishing = true;
    const box = byId('ap-progress'), bar = byId('ap-progress-bar'), txt = byId('ap-progress-text');
    box.hidden = false;
    const pages = await uploadFiles(addPagesQueue.map(i => i.file), comicFolder(c), (i, n) => { bar.style.width = (i / n * 100) + '%'; txt.textContent = i < n ? 'Uploading page ' + (i + 1) + ' of ' + n : 'Saving'; });
    if (!pages) { publishing = false; box.hidden = true; return; }
    c.pages = (c.pages || []).concat(pages);
    renderComicsAdmin(); renderComics();
    await saveComics();
    publishing = false;
    Modals.close(byId('ap-modal'));
    addPagesQueue = []; addPagesComicId = null;
    showToast('Added ' + plural(pages.length, 'page') + ' to ' + (c.title || 'your comic'));
}

/* ═════════════════════════════════════════════
   ADMIN: CHARACTERS
   Saved in your settings (system.js) as characters: [{ id, name, role, bio, tag, img, colors, first, appears }].
   ═════════════════════════════════════════════ */

let chEditId = null;
function renderCharsAdmin(fresh) {
    const list = byId('chf-list'); if (!list) return;
    if (fresh) { byId('chf-intro').value = currentConfig.charactersIntro || ''; chfFill(null); }
    byId('chf-tags').innerHTML = knownTags().map(t => '<option value="' + esc(tagKey(t)) + '">').join('');
    const chars = siteCharacters();
    list.innerHTML = chars.length ? chars.map((c, i) => {
        const img = safeUrl(c.img), n = characterPosts(c).length;
        return '<div class="m-row" data-id="' + esc(c.id) + '">'
            + '<div class="m-thumb">' + (img ? '<img src="' + esc(thumbOf(img)) + '" alt="" loading="lazy">' : '<i class="fa-regular fa-image" aria-hidden="true"></i>') + '</div>'
            + '<div class="m-body"><span class="m-title">' + esc(c.name) + '</span><span class="m-meta">' + (c.tag ? '<span>#' + esc(tagKey(c.tag)) + '</span>' : '<span>No tag</span>') + '<span>' + plural(n, 'piece') + '</span></span></div>'
            + '<div class="m-actions">'
            + '<button class="q-btn" data-action="chf-move" data-id="' + esc(c.id) + '" data-dir="-1" aria-label="Move ' + esc(c.name) + ' up"' + (i === 0 ? ' disabled' : '') + '><i class="fa-solid fa-arrow-up" aria-hidden="true"></i></button>'
            + '<button class="q-btn" data-action="chf-move" data-id="' + esc(c.id) + '" data-dir="1" aria-label="Move ' + esc(c.name) + ' down"' + (i === chars.length - 1 ? ' disabled' : '') + '><i class="fa-solid fa-arrow-down" aria-hidden="true"></i></button>'
            + '<a class="btn small" href="#/characters/' + esc(c.id) + '">View</a>'
            + '<button class="btn small" data-action="chf-edit" data-id="' + esc(c.id) + '">Edit</button>'
            + '<button class="btn small danger" data-action="chf-delete" data-id="' + esc(c.id) + '">Delete</button>'
            + '</div></div>';
    }).join('') : '<div class="empty"><h3>No characters yet</h3><p>Add one above. The Characters page shows up in your menu once there is one.</p></div>';
}
function chfFill(c) {
    chEditId = c ? c.id : null;
    const set = (id, v) => { byId(id).value = v || ''; };
    set('chf-name', c && c.name); set('chf-tag', c && tagKey(c.tag)); set('chf-role', c && c.role); set('chf-bio', c && c.bio);
    set('chf-img', c && c.img); set('chf-first', c && c.first); set('chf-appears', c && c.appears);
    const cols = c ? characterColors(c) : [];
    ['chf-c1', 'chf-c2', 'chf-c3'].forEach((id, i) => { byId(id).value = cols[i] || '#000000'; });
    byId('chf-heading').textContent = c ? 'Edit ' + c.name : 'New character';
    byId('chf-save').textContent = c ? 'Save changes' : 'Add character';
    byId('chf-cancel').hidden = !c;
}
function saveCharacterList(list) {
    currentConfig.characters = list;
    applyVisualConfig();
    renderCharsAdmin();
    if (ui.view === 'characters') renderCharacters();
    return saveSystem();
}
async function saveCharacter() {
    const name = byId('chf-name').value.trim();
    if (!name) { showToast('Give the character a name.', 'error'); byId('chf-name').focus(); return; }
    const colors = ['chf-c1', 'chf-c2', 'chf-c3'].map(id => byId(id).value.toLowerCase());
    const c = { id: chEditId || Date.now(), name };
    const opt = { role: byId('chf-role').value.trim(), bio: byId('chf-bio').value.trim(), tag: tagKey(byId('chf-tag').value),
        img: safeUrl(byId('chf-img').value), first: byId('chf-first').value.trim(), appears: byId('chf-appears').value.trim() };
    Object.keys(opt).forEach(k => { if (opt[k]) c[k] = opt[k]; });
    if (colors.some(h => h !== '#000000')) c.colors = colors;
    const list = (currentConfig.characters || []).slice(), i = list.findIndex(x => x.id === c.id);
    if (i >= 0) list[i] = c; else list.push(c);
    chfFill(null);
    await saveCharacterList(list);
}
async function deleteCharacter(id) {
    const c = siteCharacters().find(x => String(x.id) === String(id)); if (!c) return;
    if (!await askConfirm('Their card and page go. Their art stays in your posts.', { hold: true, title: 'Delete ' + c.name + '?' })) return;
    if (chEditId === c.id) chfFill(null);
    await saveCharacterList((currentConfig.characters || []).filter(x => x.id !== c.id));
}
function moveCharacter(id, dir) {
    const list = (currentConfig.characters || []).slice(), i = list.findIndex(x => String(x.id) === String(id)), j = i + Number(dir);
    if (i < 0 || j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    saveCharacterList(list);
}
async function saveCharactersIntro() {
    const v = byId('chf-intro').value.trim();
    if (v) currentConfig.charactersIntro = v; else delete currentConfig.charactersIntro;
    if (ui.view === 'characters') renderCharacters();
    await saveSystem();
}
// Three colors that stand apart, read from the reference picture
async function paletteFromImage(url) {
    try {
        const res = await fetch(new URL(url, location.href));
        if (!res.ok) return [];
        const bmp = await createImageBitmap(await res.blob());
        const cv = document.createElement('canvas'); cv.width = cv.height = 48;
        const cx = cv.getContext('2d'); cx.drawImage(bmp, 0, 0, 48, 48);
        if (bmp.close) bmp.close();
        const d = cx.getImageData(0, 0, 48, 48).data, counts = new Map();
        for (let i = 0; i < d.length; i += 4) {
            if (d[i + 3] < 128) continue;
            const k = (d[i] >> 4) << 8 | (d[i + 1] >> 4) << 4 | (d[i + 2] >> 4);
            counts.set(k, (counts.get(k) || 0) + 1);
        }
        const out = [];
        for (const [k] of [...counts].sort((a, b) => b[1] - a[1])) {
            const c = [(k >> 8 & 15) * 17, (k >> 4 & 15) * 17, (k & 15) * 17];
            if (out.every(o => Math.abs(o[0] - c[0]) + Math.abs(o[1] - c[1]) + Math.abs(o[2] - c[2]) > 120)) out.push(c);
            if (out.length === 3) break;
        }
        return out.map(c => '#' + c.map(v => v.toString(16).padStart(2, '0')).join(''));
    } catch (e) { return []; }
}
async function pickCharacterColors(quiet) {
    const url = safeUrl(byId('chf-img').value);
    if (!url) { if (!quiet) showToast('Add a reference picture first.', 'error'); return; }
    const cols = await paletteFromImage(url);
    if (!cols.length) { if (!quiet) showToast('Couldn\'t read colors from that picture.', 'error'); return; }
    ['chf-c1', 'chf-c2', 'chf-c3'].forEach((id, i) => { byId(id).value = cols[i] || cols[0]; });
    if (!quiet) showToast('Colors picked from the picture');
}

/* ═════════════════════════════════════════════
   ADMIN: SERIES
   Saved in your settings (system.js) as series: [{ id, name, desc, posts: [post ids, in order] }].
   ═════════════════════════════════════════════ */

let srDraft = { id: null, posts: [] };
function renderSeriesAdmin(fresh) {
    const list = byId('srf-list'); if (!list) return;
    if (fresh) srfFill(null);
    const all = siteSeries();
    list.innerHTML = all.length ? all.map((s, i) => {
        const posts = (s.posts || []).map(id => postsCache.find(p => p.id === Number(id))).filter(Boolean), cover = posts[0] && firstImage(posts[0]);
        return '<div class="m-row" data-id="' + esc(s.id) + '">'
            + '<div class="m-thumb">' + (cover ? '<img src="' + esc(thumbOf(cover)) + '" alt="" loading="lazy">' : '<i class="fa-regular fa-images" aria-hidden="true"></i>') + '</div>'
            + '<div class="m-body"><span class="m-title">' + esc(s.name) + '</span><span class="m-meta"><span>' + plural(posts.length, 'part') + '</span>' + (s.desc ? '<span>' + esc(excerpt(s.desc, 60)) + '</span>' : '') + '</span></div>'
            + '<div class="m-actions">'
            + '<button class="q-btn" data-action="srf-move" data-id="' + esc(s.id) + '" data-dir="-1" aria-label="Move ' + esc(s.name) + ' up"' + (i === 0 ? ' disabled' : '') + '><i class="fa-solid fa-arrow-up" aria-hidden="true"></i></button>'
            + '<button class="q-btn" data-action="srf-move" data-id="' + esc(s.id) + '" data-dir="1" aria-label="Move ' + esc(s.name) + ' down"' + (i === all.length - 1 ? ' disabled' : '') + '><i class="fa-solid fa-arrow-down" aria-hidden="true"></i></button>'
            + '<button class="btn small" data-action="open-series" data-id="' + esc(s.id) + '">View</button>'
            + '<button class="btn small" data-action="srf-edit" data-id="' + esc(s.id) + '">Edit</button>'
            + '<button class="btn small danger" data-action="srf-delete" data-id="' + esc(s.id) + '">Delete</button>'
            + '</div></div>';
    }).join('') : '<div class="empty"><h3>No series yet</h3><p>Make one above. Series show up in your Gallery, ahead of the tag boards.</p></div>';
    renderSeriesParts();
    renderSeriesPicker();
}
function srfFill(s) {
    srDraft = { id: s ? s.id : null, posts: s ? (s.posts || []).map(Number).filter(id => postsCache.some(p => p.id === id)) : [] };
    byId('srf-name').value = s ? s.name : ''; byId('srf-desc').value = s ? s.desc || '' : '';
    byId('srf-heading').textContent = s ? 'Edit ' + s.name : 'New series';
    byId('srf-save').textContent = s ? 'Save changes' : 'Add series';
    byId('srf-cancel').hidden = !s;
}
function renderSeriesParts() {
    const box = byId('srf-parts'); if (!box) return;
    const n = srDraft.posts.length;
    box.innerHTML = n ? srDraft.posts.map((id, i) => {
        const p = postsCache.find(x => x.id === id), img = p && firstImage(p), label = p ? (excerpt(p.content, 60) || formatDate(p)) : 'Missing post';
        return '<li draggable="true" data-index="' + i + '">' + (img ? '<img class="thumb" src="' + esc(thumbOf(img)) + '" alt="">' : '<span class="thumb"><i class="fa-regular fa-image" aria-hidden="true"></i></span>')
            + '<span class="name"><strong>Part ' + (i + 1) + '</strong> ' + esc(label) + '</span>'
            + '<button class="q-btn" data-action="srf-part-move" data-index="' + i + '" data-dir="-1" aria-label="Move part ' + (i + 1) + ' up"' + (i === 0 ? ' disabled' : '') + '><i class="fa-solid fa-arrow-up" aria-hidden="true"></i></button>'
            + '<button class="q-btn" data-action="srf-part-move" data-index="' + i + '" data-dir="1" aria-label="Move part ' + (i + 1) + ' down"' + (i === n - 1 ? ' disabled' : '') + '><i class="fa-solid fa-arrow-down" aria-hidden="true"></i></button>'
            + '<button class="q-btn del" data-action="srf-part-remove" data-index="' + i + '" aria-label="Take part ' + (i + 1) + ' out"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button></li>';
    }).join('') : '<li class="srf-empty">No pieces yet. Add some below.</li>';
    if (n) enableDragSort(box, 'li', (from, to) => { const [m] = srDraft.posts.splice(from, 1); srDraft.posts.splice(to, 0, m); renderSeriesParts(); renderSeriesPicker(); });
}
function renderSeriesPicker() {
    const box = byId('srf-pick'); if (!box) return;
    const q = (byId('srf-search').value || '').toLowerCase().trim();
    const posts = sortPosts(postsCache, 'newest').filter(p => firstImage(p) && (!q || (plainText(p.content) + ' ' + postTags(p).join(' ')).toLowerCase().includes(q)));
    box.innerHTML = posts.length ? posts.map(p => {
        const at = srDraft.posts.indexOf(p.id);
        return '<button type="button" data-action="srf-toggle" data-id="' + p.id + '" aria-pressed="' + (at >= 0) + '" aria-label="' + esc((excerpt(p.content, 60) || 'Post from ' + formatDate(p)) + (at >= 0 ? ', part ' + (at + 1) : '')) + '">'
            + '<img src="' + esc(thumbOf(firstImage(p))) + '" alt="" loading="lazy">' + (at >= 0 ? '<span class="srf-num">' + (at + 1) + '</span>' : '') + '</button>';
    }).join('') : '<p class="hint">' + (q ? 'No posts match.' : 'Posts with pictures show up here.') + '</p>';
}
function seriesToggle(id) {
    id = Number(id);
    const i = srDraft.posts.indexOf(id);
    if (i >= 0) srDraft.posts.splice(i, 1); else srDraft.posts.push(id);
    renderSeriesParts(); renderSeriesPicker();
}
function seriesPartMove(i, dir) {
    i = Number(i); const j = i + Number(dir);
    if (j < 0 || j >= srDraft.posts.length) return;
    [srDraft.posts[i], srDraft.posts[j]] = [srDraft.posts[j], srDraft.posts[i]];
    renderSeriesParts(); renderSeriesPicker();
}
function seriesPartRemove(i) { srDraft.posts.splice(Number(i), 1); renderSeriesParts(); renderSeriesPicker(); }
function saveSeriesList(list) {
    currentConfig.series = list;
    renderSeriesAdmin();
    if (ui.view === 'gallery') renderGallery();
    return saveSystem();
}
async function saveSeries() {
    const name = byId('srf-name').value.trim();
    if (!name) { showToast('Give the series a title.', 'error'); byId('srf-name').focus(); return; }
    if (!srDraft.posts.length) { showToast('Add at least one piece.', 'error'); return; }
    const s = { id: srDraft.id || Date.now(), name, posts: srDraft.posts.slice() };
    const desc = byId('srf-desc').value.trim(); if (desc) s.desc = desc;
    const list = (currentConfig.series || []).slice(), i = list.findIndex(x => x.id === s.id);
    if (i >= 0) list[i] = s; else list.push(s);
    srfFill(null);
    await saveSeriesList(list);
}
async function deleteSeries(id) {
    const s = siteSeries().find(x => String(x.id) === String(id)); if (!s) return;
    if (!await askConfirm('The series goes. Its pieces stay in your posts.', { hold: true, title: 'Delete ' + s.name + '?' })) return;
    if (srDraft.id === s.id) srfFill(null);
    await saveSeriesList((currentConfig.series || []).filter(x => x.id !== s.id));
}
function moveSeries(id, dir) {
    const list = (currentConfig.series || []).slice(), i = list.findIndex(x => String(x.id) === String(id)), j = i + Number(dir);
    if (i < 0 || j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    saveSeriesList(list);
}

/* ═════════════════════════════════════════════
   ADMIN: SITE INFO
   ═════════════════════════════════════════════ */

function populateSiteForm() {
    const c = currentConfig;
    const set = (id, v) => { const el = byId(id); if (el) el.value = v == null ? '' : v; };
    const chk = (id, v) => { const el = byId(id); if (el) el.checked = !!v; };
    set('s-sitename', c.siteName); set('s-tagline', c.tagline); set('s-feedname', c.leafletsName); set('s-copyright', c.copyright);
    set('s-pfp', c.pfpImage); set('s-bio', c.aboutBio || readText(KEYS.bio));
    const look = ABOUT_STYLES.includes(c.aboutStyle) ? c.aboutStyle : ABOUT_STYLES[0];
    $$('input[name="about-style"]').forEach(r => { r.checked = r.value === look; });
    chk('s-agegate', c.ageGate !== false); chk('s-blur', c.blurNsfw); chk('s-comments', c.allowComments); chk('s-reactions', c.reactionsEnabled);
    set('s-reaction-style', c.reactionIcon || 'thumb'); set('s-featured', c.featuredMode || 'recent');
    const rec = byId('s-rec-comic');
    if (rec) {
        const list = comicsCache.slice().sort((a, b) => b.id - a.id);
        rec.innerHTML = '<option value="">Newest comic</option>' + list.map(cm => '<option value="' + cm.id + '">' + esc(cm.title || 'Untitled') + '</option>').join('') + '<option value="off">Don\'t show one</option>';
        rec.value = list.some(cm => String(cm.id) === String(c.recommendedComic)) || c.recommendedComic === 'off' ? String(c.recommendedComic) : '';
    }
    populateAotdForm();
    set('s-like-label', c.likeLabel); set('s-dislike-label', c.dislikeLabel);
    set('s-title', c.metaTitle); set('s-desc', c.metaDescription);
    set('s-start-theme', c.startTheme || 'dark'); chk('s-feed', !c.feedOff); renderFeedStatus();
    const lp = lpSettings();
    set('lp-pic', lp.pic); set('lp-pic-url', lp.picUrl); set('lp-icon', lp.icon); set('lp-icon-url', lp.iconUrl);
    linkPreviewSoon();
    set('s-bgimage', c.bgImage); set('s-css', c.customCss); set('s-newkey', '');
    chk('s-webp', c.webpUploads !== false);
}

async function saveSiteSettings() {
    const c = currentConfig;
    const val = id => (byId(id).value || '').trim();
    c.siteName = val('s-sitename') || 'NEERG';
    c.tagline = val('s-tagline'); c.leafletsName = val('s-feedname') || 'Works'; c.copyright = val('s-copyright');
    c.pfpImage = val('s-pfp'); c.aboutBio = byId('s-bio').value.trim();
    const look = $('input[name="about-style"]:checked'); if (look) c.aboutStyle = look.value;
    c.ageGate = byId('s-agegate').checked; c.blurNsfw = byId('s-blur').checked;
    c.allowComments = byId('s-comments').checked; c.reactionsEnabled = byId('s-reactions').checked;
    c.reactionIcon = byId('s-reaction-style').value; c.featuredMode = byId('s-featured').value;
    if (byId('s-rec-comic')) c.recommendedComic = byId('s-rec-comic').value;
    if (byId('aotd-tiles') && Aotd.draft) { c.artOfToday = byId('s-aotd').checked; c.aotd = aotdFormSettings(); delete c.aotdColor; Aotd.draft = clone(c.aotd); }
    c.likeLabel = byId('s-like-label').value; c.dislikeLabel = byId('s-dislike-label').value;
    c.metaTitle = val('s-title'); c.metaDescription = val('s-desc');
    c.startTheme = byId('s-start-theme').value; c.feedOff = !byId('s-feed').checked;
    c.linkPreview = Object.assign({}, c.linkPreview, lpFormSettings());
    c.bgImage = val('s-bgimage'); c.customCss = byId('s-css').value;
    c.webpUploads = byId('s-webp').checked;
    if (c.aboutBio) try { localStorage.setItem(KEYS.bio, c.aboutBio); } catch (e) {}
    const newKey = val('s-newkey');
    if (newKey.length > 5) {
        const t = showToast('Updating your secure token', 'loading');
        const token = await requestTokenGeneration(newKey, sessionPassword);
        dismissToast(t);
        if (token) { globalAuthToken = token; byId('s-newkey').value = ''; showToast('Neocities key updated'); }
        else { showToast('That key didn\'t work, so nothing was saved.', 'error'); return false; }
    }
    applyVisualConfig(); renderHome();
    saveSystem();
    return true;
}

async function uploadIntoField(input) {
    const file = input.files && input.files[0]; if (!file) return;
    const target = byId(input.dataset.uploadTarget); if (!target) return;
    const t = showToast('Uploading ' + file.name, 'loading');
    const paths = await uploadFiles([file], 'img/');
    dismissToast(t);
    input.value = '';
    if (!paths) return;
    target.value = paths[0];
    target.dispatchEvent(new Event('input', { bubbles: true }));
    showToast('Uploaded. Save to keep it.');
}

/* ═════════════════════════════════════════════
   ADMIN: COMMISSIONS
   ═════════════════════════════════════════════ */

function populateCommForm() {
    const c = currentConfig, cp = commPage();
    const set = (id, v) => { const el = byId(id); if (el) el.value = v == null ? '' : v; };
    set('s-status-text', c.commissionStatus); set('s-status-color', normalizeHex(c.statusColor, '#FB3640').toLowerCase());
    set('s-comm-link', c.commissionsLink); set('s-comm-info', c.commissionsInfo);
    set('cm-f-title', cp.title); set('cm-f-handle', cp.handle); set('cm-f-contact', cp.contact); set('cm-f-button', cp.button);
    set('cm-f-terms', cp.terms); set('cm-f-termspic', cp.termsImage);
    set('cm-f-tape', (cp.tapeWords || []).join('\n')); set('cm-f-closednote', cp.closedNote);
    setCommColors(cp);
    byId('status-presets').innerHTML = STATUS_PRESETS.map(p => '<button type="button" class="chip" data-action="status-preset" data-text="' + esc(p.text) + '" data-color="' + p.color + '"><span class="status-dot" style="background:' + p.color + ';animation:none"></span>' + esc(p.label) + '</button>').join('');
    renderTierEditor(cp.tiers || []);
    const design = COMM_DESIGNS.includes(cp.design) ? cp.design : 'original';
    $$('input[name="comm-design"]').forEach(r => { r.checked = r.value === design; });
    renderAddonEditor(cp.addons || []);
    renderTermSections(cp.termSections || []);
    set('cm-f-will', (cp.willDraw || []).join('\n')); set('cm-f-wont', (cp.wontDraw || []).join('\n'));
    byId('cm-f-agree').checked = cp.agreeCheck !== false;
    syncCommSwitch(cp.open !== false);
    syncTapeSample();
}
function setCommColors(cp) {
    byId('cm-f-paper').value = normalizeHex(cp.paper, COMM_DEFAULTS.paper).toLowerCase();
    byId('cm-f-ink').value = normalizeHex(cp.ink, COMM_DEFAULTS.ink).toLowerCase();
    byId('cm-f-tapecolor').value = normalizeHex(cp.tape, COMM_DEFAULTS.tape).toLowerCase();
}
function syncTapeSample() {
    const first = byId('cm-f-tape').value.split('\n').map(w => w.trim()).find(Boolean);
    byId('cm-tape-sample').textContent = first || HAZARD_WORDS[0];
}
function syncCommSwitch(open) {
    const b = byId('cm-switch'); if (!b) return;
    b.dataset.state = open ? 'open' : 'closed';
    byId('cm-switch-label').textContent = open ? 'Commissions are open' : 'Commissions are closed';
    byId('cm-switch-sub').textContent = open ? 'Click to close them and tape off your Commissions page.' : 'Hazard tape is up on your Commissions page. Click to open again.';
}

// The big switch saves straight away. The status badge follows it, unless it says something custom.
function toggleCommissions() {
    const open = commPage().open === false;
    const OPEN = STATUS_PRESETS[0], CLOSED = STATUS_PRESETS.find(p => p.label === 'Closed');
    const textEl = byId('s-status-text'), colorEl = byId('s-status-color');
    const now = textEl.value.trim().toUpperCase();
    if (!open && (!now || now === OPEN.text)) { textEl.value = CLOSED.text; colorEl.value = CLOSED.color.toLowerCase(); }
    if (open && now === CLOSED.text) { textEl.value = OPEN.text; colorEl.value = OPEN.color.toLowerCase(); }
    currentConfig.commissionStatus = textEl.value.trim();
    currentConfig.statusColor = colorEl.value;
    currentConfig.commPage = Object.assign(commPage(), { open });
    syncCommSwitch(open);
    renderStatus(); renderCommissions();
    saveSystem();
}

function tierRowHTML(t, i, n) {
    const color = normalizeHex(t.color, TIER_COLORS[i % TIER_COLORS.length]).toLowerCase();
    const id = 'tier-img-' + i;
    return '<div class="tier-row" style="--tc:' + color + '">'
        + '<div class="tier-thumb" aria-hidden="true"></div>'
        + '<div class="tier-fields form-grid">'
        + '<label class="field"><span>Name</span><input type="text" name="name" value="' + esc(t.name || '') + '" placeholder="SKETCH" maxlength="16"></label>'
        + '<div class="tier-pair"><label class="field"><span>Price</span><input type="text" name="price" value="' + esc(t.price || '') + '" placeholder="$60 or CUSTOM" maxlength="12"></label>'
        + '<label class="field field-color"><span>Color</span><input type="color" name="color" value="' + color + '"></label></div>'
        + '<div class="field span-2"><span>Example art</span><div class="inline-form">'
        + '<input type="text" name="image" id="' + id + '" value="' + esc(t.image || '') + '" placeholder="img/sketch.png or https://..." aria-label="Example art link">'
        + '<button type="button" class="btn small" data-action="pick-image" data-target="' + id + '">From posts</button>'
        + '<label class="btn small file-btn"><i class="fa-solid fa-upload" aria-hidden="true"></i> Upload<input type="file" accept="image/*" data-upload-target="' + id + '" hidden></label>'
        + '</div></div>'
        + '<div class="tier-pair span-2 tier-spots"><label class="field"><span>Spots <em>(how many you take; empty means no limit)</em></span><input type="number" name="limit" min="0" max="99" inputmode="numeric" value="' + esc(t.limit || '') + '" placeholder="No limit"></label>'
        + '<label class="field"><span>Filled</span><input type="number" name="taken" min="0" max="99" inputmode="numeric" value="' + esc(t.taken || '') + '" placeholder="0"></label></div>'
        + '<label class="check span-2"><input type="checkbox" name="pop"' + (t.pop ? ' checked' : '') + '> <span>Let the art pop out of its frame <em>(for cut-out art with a see-through background; a picture with a solid background stays in its frame)</em></span></label>'
        + '<label class="field span-2"><span>Details <em>(one per line; **bold** works)</em></span><textarea name="notes" rows="4" placeholder="Flat colors, one character.&#10;**Extra characters:** +$20 each.">' + esc(t.notes || '') + '</textarea></label>'
        + '</div>'
        + '<div class="tier-actions">'
        + '<button type="button" class="q-btn" data-action="tier-move" data-dir="-1" aria-label="Move tier up"' + (i === 0 ? ' disabled' : '') + '><i class="fa-solid fa-arrow-up" aria-hidden="true"></i></button>'
        + '<button type="button" class="q-btn" data-action="tier-move" data-dir="1" aria-label="Move tier down"' + (i === n - 1 ? ' disabled' : '') + '><i class="fa-solid fa-arrow-down" aria-hidden="true"></i></button>'
        + '<button type="button" class="q-btn del" data-action="tier-remove" aria-label="Remove tier"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>'
        + '</div></div>';
}
function renderTierEditor(tiers) {
    const box = byId('cm-tier-list');
    box.innerHTML = tiers.length ? tiers.map((t, i) => tierRowHTML(t, i, tiers.length)).join('') : '<p class="hint">No tiers yet. Add one for each kind of commission you offer.</p>';
    $$('.tier-row', box).forEach(refreshTierThumb);
}
function readTierRows() {
    return $$('#cm-tier-list .tier-row').map(r => {
        const v = name => $('[name="' + name + '"]', r).value.trim();
        const num = name => { const n = parseInt(v(name), 10); return n > 0 ? Math.min(n, 99) : 0; };
        return { name: v('name'), price: v('price'), color: v('color'), image: v('image'), pop: $('[name="pop"]', r).checked, notes: v('notes'), limit: num('limit'), taken: num('taken') };
    });
}
// Keeps the little preview beside each tier in step with its art, color and name
function refreshTierThumb(row) {
    const img = safeUrl($('[name="image"]', row).value.trim());
    const name = $('[name="name"]', row).value.trim();
    row.style.setProperty('--tc', $('[name="color"]', row).value);
    $('.tier-thumb', row).innerHTML = img ? '<img src="' + esc(thumbOf(img)) + '" alt="">' : '<span>' + esc(name.charAt(0).toUpperCase() || '?') + '</span>';
}
function addTier() {
    const tiers = readTierRows();
    tiers.push({ name: '', price: '', color: TIER_COLORS[tiers.length % TIER_COLORS.length], image: '', pop: false, notes: '', limit: 0, taken: 0 });
    renderTierEditor(tiers);
    const rows = $$('#cm-tier-list .tier-row');
    $('[name="name"]', rows[rows.length - 1]).focus();
}
function moveTier(btn) {
    const rows = $$('#cm-tier-list .tier-row');
    const i = rows.indexOf(btn.closest('.tier-row')), j = i + Number(btn.dataset.dir);
    const tiers = readTierRows();
    if (i < 0 || j < 0 || j >= tiers.length) return;
    [tiers[i], tiers[j]] = [tiers[j], tiers[i]];
    renderTierEditor(tiers);
    const moved = $$('#cm-tier-list .tier-row')[j];
    const again = $('[data-action="tier-move"][data-dir="' + btn.dataset.dir + '"]', moved);
    (again && !again.disabled ? again : $('[name="name"]', moved)).focus();
}
async function removeTier(btn) {
    const rows = $$('#cm-tier-list .tier-row');
    const i = rows.indexOf(btn.closest('.tier-row'));
    const tiers = readTierRows();
    const t = tiers[i]; if (!t) return;
    if ((t.name || t.price || t.image || t.notes) && !await askConfirm('It leaves your page when you save.', { hold: true, title: 'Remove the ' + (t.name || 'untitled') + ' tier?', yes: 'Hold to remove' })) return;
    tiers.splice(i, 1);
    renderTierEditor(tiers);
}

// Add-ons: extras buyers can add on a tier's page (the new designs add them to the total)
function addonRowHTML(a) {
    return '<div class="addon-row">'
        + '<label class="field"><span>Add-on</span><input type="text" name="name" value="' + esc(a.name || '') + '" placeholder="Extra character" maxlength="40"></label>'
        + '<label class="field"><span>Price</span><input type="text" name="price" value="' + esc(a.price || '') + '" placeholder="$15" maxlength="12"></label>'
        + '<button type="button" class="q-btn del" data-action="addon-remove" aria-label="Remove add-on"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button></div>';
}
function renderAddonEditor(list) { byId('cm-addon-list').innerHTML = list.map(addonRowHTML).join(''); }
function readAddonRows() {
    return $$('#cm-addon-list .addon-row').map(r => ({ name: $('[name="name"]', r).value.trim(), price: $('[name="price"]', r).value.trim() })).filter(a => a.name);
}
function addAddon() {
    byId('cm-addon-list').insertAdjacentHTML('beforeend', addonRowHTML({}));
    const rows = $$('#cm-addon-list .addon-row');
    $('[name="name"]', rows[rows.length - 1]).focus();
}

// Terms of service, in sections that open and close on the page (each rule on its own line)
function termSectionHTML(sec, i, n) {
    return '<div class="tsec-row">'
        + '<div class="tsec-fields"><label class="field"><span>Section</span><input type="text" name="title" value="' + esc(sec.title || '') + '" placeholder="Payment" maxlength="40"></label>'
        + '<label class="field"><span>Rules <em>(one per line; **bold** works)</em></span><textarea name="rules" rows="3" placeholder="Full payment is due before I start.">' + esc((sec.rules || []).join('\n')) + '</textarea></label></div>'
        + '<div class="tier-actions">'
        + '<button type="button" class="q-btn" data-action="tsec-move" data-dir="-1" aria-label="Move section up"' + (i === 0 ? ' disabled' : '') + '><i class="fa-solid fa-arrow-up" aria-hidden="true"></i></button>'
        + '<button type="button" class="q-btn" data-action="tsec-move" data-dir="1" aria-label="Move section down"' + (i === n - 1 ? ' disabled' : '') + '><i class="fa-solid fa-arrow-down" aria-hidden="true"></i></button>'
        + '<button type="button" class="q-btn del" data-action="tsec-remove" aria-label="Remove section"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>'
        + '</div></div>';
}
function renderTermSections(list) {
    byId('cm-tsec-list').innerHTML = list.map((sec, i) => termSectionHTML(sec, i, list.length)).join('');
}
function readTermSections() {
    return $$('#cm-tsec-list .tsec-row').map(r => ({
        title: $('[name="title"]', r).value.trim(),
        rules: $('[name="rules"]', r).value.split('\n').map(x => x.trim()).filter(Boolean)
    })).filter(sec => sec.title || sec.rules.length);
}
function addTermSection() {
    const list = readTermSections();
    list.push({ title: '', rules: [] });
    renderTermSections(list);
    const rows = $$('#cm-tsec-list .tsec-row');
    $('[name="title"]', rows[rows.length - 1]).focus();
}
function moveTermSection(btn) {
    const rows = $$('#cm-tsec-list .tsec-row');
    const i = rows.indexOf(btn.closest('.tsec-row')), j = i + Number(btn.dataset.dir);
    const list = $$('#cm-tsec-list .tsec-row').map(r => ({ title: $('[name="title"]', r).value, rules: $('[name="rules"]', r).value.split('\n') }));
    if (i < 0 || j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    renderTermSections(list);
    const again = $('[data-action="tsec-move"][data-dir="' + btn.dataset.dir + '"]', $$('#cm-tsec-list .tsec-row')[j]);
    if (again && !again.disabled) again.focus();
}
async function removeTermSection(btn) {
    const row = btn.closest('.tsec-row');
    const title = $('[name="title"]', row).value.trim();
    if ((title || $('[name="rules"]', row).value.trim()) && !await askConfirm('Its rules leave your page when you save.', { hold: true, title: 'Remove the ' + (title || 'untitled') + ' section?', yes: 'Hold to remove' })) return;
    row.remove();
    renderTermSections(readTermSections());
}

function saveCommSettings() {
    const c = currentConfig;
    const val = id => (byId(id).value || '').trim();
    let link = val('s-comm-link');
    if (/^[^\s@/:]+@[^\s@/]+\.[a-z]{2,}$/i.test(link)) link = 'mailto:' + link;
    c.commissionStatus = val('s-status-text'); c.statusColor = byId('s-status-color').value;
    c.commissionsLink = link; c.commissionsInfo = byId('s-comm-info').value.trim();
    const tiers = readTierRows().filter(t => t.name || t.price || t.image || t.notes);
    c.commPage = Object.assign(commPage(), {
        title: val('cm-f-title'), handle: val('cm-f-handle'), contact: val('cm-f-contact'), button: val('cm-f-button'),
        tiers, terms: byId('cm-f-terms').value.trim(), termsImage: val('cm-f-termspic'),
        tapeWords: byId('cm-f-tape').value.split('\n').map(w => w.trim()).filter(Boolean),
        closedNote: val('cm-f-closednote'),
        design: ($('input[name="comm-design"]:checked') || { value: 'original' }).value,
        addons: readAddonRows(), termSections: readTermSections(),
        willDraw: byId('cm-f-will').value.split('\n').map(w => w.trim()).filter(Boolean),
        wontDraw: byId('cm-f-wont').value.split('\n').map(w => w.trim()).filter(Boolean),
        agreeCheck: byId('cm-f-agree').checked,
        paper: byId('cm-f-paper').value, ink: byId('cm-f-ink').value, tape: byId('cm-f-tapecolor').value
    });
    byId('s-comm-link').value = link;
    renderTierEditor(tiers);
    renderAddonEditor(c.commPage.addons); renderTermSections(c.commPage.termSections);
    renderStatus(); renderCommissions();
    saveSystem();
}

/* ═════════════════════════════════════════════
   ADMIN: COLORS & STYLE (palette studio)
   ═════════════════════════════════════════════ */

// The palette studio. Its state lives in logic.js (the theme previews the draft); these are the editor parts.
Object.assign(Studio, {
    reset() { this.draft = null; this.dirty = false; this.ring = null; },
    ensure() {
        if (this.draft) return;
        this.draft = { dark: paletteFor('dark'), light: paletteFor('light') };
        const r = currentConfig.pfpRingStyle || readJSON(KEYS.ring, null) || {};
        this.ring = { c1: r.c1 || '#ff6b35', c2: r.c2 || '#b8ff38', c3: r.c3 || '#ff3c8e', dir: r.dir || '135deg', thickness: Number(r.thickness) || 4, glowSize: r.glowSize != null ? Number(r.glowSize) : 8, custom: !!r.gradient };
    },
    open() {
        this.ensure();
        this.editing = getMode();
        this.render();
    },
    markDirty() { this.dirty = true; byId('studio-unsaved').hidden = false; },
    preview() {
        if (getMode() !== this.editing) {
            document.documentElement.setAttribute('data-theme', this.editing);
            try { localStorage.setItem(KEYS.theme, this.editing); } catch (e) {}
        }
        applyTheme();
        this.renderContrast();
    },
    render() {
        const p = this.draft[this.editing];
        $$('[data-action="studio-mode"]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === this.editing)));
        byId('studio-swatches').innerHTML = ['bg', 'sidebar', 'leaflet', 'border', 'text', 'accent', 'navActive'].map(k =>
            '<label class="swatch"><input type="color" data-studio-key="' + k + '" value="' + p[k].toLowerCase() + '"><span>' + PALETTE_LABELS[k][0] + '<small>' + p[k] + '</small></span></label>').join('');
        const presets = this.editing === 'light' ? LIGHT_PRESETS : DARK_PRESETS;
        byId('studio-presets').innerHTML = presets.map((pr, i) => '<button type="button" class="preset" data-action="studio-preset" data-index="' + i + '"><span class="strip">' + [0, 4, 3, 6, 1].map(n => '<i style="background:' + pr.colors[n] + '"></i>').join('') + '</span>' + esc(pr.name) + '</button>').join('');
        const shared = this.draft.dark;
        byId('c-like').value = shared.like.toLowerCase(); byId('c-like-ink').value = shared.likeBtn.toLowerCase();
        byId('c-dislike').value = shared.dislike.toLowerCase(); byId('c-dislike-ink').value = shared.dislikeBtn.toLowerCase();
        byId('gen-base').value = p.accent.toLowerCase();
        this.renderRing();
        this.renderContrast();
        byId('studio-unsaved').hidden = !this.dirty;
    },
    renderContrast() {
        const p = this.draft[this.editing];
        const rate = r => r >= 7 ? '<b class="ok">' + r.toFixed(1) + ':1, very easy to read</b>' : r >= 4.5 ? '<b class="ok">' + r.toFixed(1) + ':1, easy to read</b>' : r >= 3 ? '<b class="warn">' + r.toFixed(1) + ':1, a bit faint</b>' : '<b class="bad">' + r.toFixed(1) + ':1, hard to read</b>';
        byId('studio-contrast').innerHTML = 'Text on background: ' + rate(contrastRatio(p.text, p.bg)) + '. Text on panels: ' + rate(contrastRatio(p.text, p.sidebar)) + '.';
    },
    setKey(key, value) {
        this.draft[this.editing][key] = normalizeHex(value);
        this.markDirty();
        const sw = $('[data-studio-key="' + key + '"]'); if (sw) sw.nextElementSibling.querySelector('small').textContent = normalizeHex(value);
        this.preview();
    },
    setShared(key, value) {
        ['dark', 'light'].forEach(m => { this.draft[m][key] = normalizeHex(value); });
        this.markDirty(); this.preview();
    },
    applyPreset(i) {
        const pr = (this.editing === 'light' ? LIGHT_PRESETS : DARK_PRESETS)[i]; if (!pr) return;
        PALETTE_KEYS.forEach((k, n) => { this.draft[this.editing][k] = normalizeHex(pr.colors[n]); });
        this.markDirty(); this.render(); this.preview();
    },
    generate() {
        const base = byId('gen-base').value, harmony = byId('gen-harmony').value;
        Object.assign(this.draft[this.editing], generatePalette(base, harmony, this.editing));
        this.markDirty(); this.render(); this.preview();
    },
    switchMode(mode) { this.editing = mode; this.render(); this.preview(); },
    renderRing() {
        const r = this.ring;
        byId('ring-c1').value = r.c1; byId('ring-c2').value = r.c2; byId('ring-c3').value = r.c3;
        byId('ring-dir').value = r.dir; byId('ring-width').value = r.thickness; byId('ring-glow').value = r.glowSize;
        byId('ring-width-out').textContent = r.thickness + 'px'; byId('ring-glow-out').textContent = r.glowSize + 'px';
        byId('ring-presets').innerHTML = '<button type="button" class="preset" data-action="ring-preset" data-index="-1"><span class="dot" style="background:linear-gradient(135deg,var(--accent),var(--hl))"></span>Match palette</button>'
            + RING_PRESETS.map((p, i) => '<button type="button" class="preset" data-action="ring-preset" data-index="' + i + '"><span class="dot" style="background:linear-gradient(135deg,' + p.colors.join(',') + ')"></span>' + esc(p.name) + '</button>').join('');
        this.applyRingPreview();
    },
    readRing() {
        const r = this.ring;
        r.c1 = byId('ring-c1').value; r.c2 = byId('ring-c2').value; r.c3 = byId('ring-c3').value;
        r.dir = byId('ring-dir').value; r.thickness = Number(byId('ring-width').value); r.glowSize = Number(byId('ring-glow').value);
        r.custom = true;
        byId('ring-width-out').textContent = r.thickness + 'px'; byId('ring-glow-out').textContent = r.glowSize + 'px';
        this.markDirty(); this.applyRingPreview();
    },
    ringStyle() {
        const r = this.ring; if (!r.custom) return null;
        return { gradient: buildRingGradient(r.c1, r.c2, r.c3, r.dir), thickness: r.thickness, glowSize: r.glowSize, c1: r.c1, c2: r.c2, c3: r.c3, dir: r.dir };
    },
    applyRingPreview() { applyRingStyle(this.ringStyle()); },
    ringPreset(i) {
        if (i < 0) { this.ring.custom = false; this.markDirty(); this.applyRingPreview(); return; }
        const p = RING_PRESETS[i]; [this.ring.c1, this.ring.c2, this.ring.c3] = p.colors; this.ring.custom = true;
        this.markDirty(); this.renderRing();
    },
    async save() {
        this.ensure();
        currentConfig.colors = { ...currentConfig.colors, ...this.draft.dark };
        currentConfig.lightColors = { ...this.draft.light };
        const ring = this.ringStyle();
        currentConfig.pfpRingStyle = ring;
        if (ring) writeJSON(KEYS.ring, ring); else try { localStorage.removeItem(KEYS.ring); } catch (e) {}
        this.dirty = false; byId('studio-unsaved').hidden = true;
        applyVisualConfig();
        await saveSystem();
    },
    discard() {
        this.reset(); applyTheme(); applyRingStyle(currentConfig.pfpRingStyle);
        this.open();
        showToast('Color changes discarded', 'info');
    }
});

function generatePalette(baseHex, harmony, mode) {
    const [h, s0, l0] = hexToHsl(baseHex);
    const s = Math.max(s0, 35);
    const partner = { analogous: 30, complementary: 180, split: 150, triadic: 120, tetradic: 90, mono: 0 }[harmony] || 30;
    if (mode === 'light') {
        const accent = hslToHex(h, clamp(s, 55, 90), clamp(l0, 34, 44));
        const hl = harmony === 'mono' ? hslToHex(h, clamp(s * 0.6, 20, 60), 18) : hslToHex(h + partner, clamp(s, 45, 80), 36);
        return {
            bg: hslToHex(h, clamp(s * 0.35, 10, 40), 96.5), text: hslToHex(h, 25, 9), sidebar: hslToHex(h, clamp(s * 0.3, 8, 35), 92),
            leaflet: hslToHex(h, 30, 99.5), border: hslToHex(h, clamp(s * 0.22, 8, 25), 84), accent, navActive: hl
        };
    }
    const accent = hslToHex(h, clamp(s, 60, 100), clamp(l0, 52, 64));
    const hl = harmony === 'mono' ? hslToHex(h, clamp(s, 50, 100), 74) : hslToHex(h + partner, clamp(s, 55, 100), 62);
    return {
        bg: hslToHex(h + (harmony === 'mono' ? 0 : partner / 4), clamp(s * 0.45, 15, 60), 4.5), text: hslToHex(h, 18, 94),
        sidebar: hslToHex(h, clamp(s * 0.35, 12, 45), 9), leaflet: hslToHex(h, clamp(s * 0.3, 10, 40), 7.5),
        border: hslToHex(h, clamp(s * 0.28, 10, 35), 17), accent, navActive: hl
    };
}

/* ═════════════════════════════════════════════
   ADMIN: HOME BANNER
   ═════════════════════════════════════════════ */

let bannerDraftMode = 'auto';
function populateBannerForm() {
    const s = bannerSettings();
    bannerDraftMode = s.bannerMode === 'manual' ? 'manual' : 'auto';
    byId('bn-count').value = String(clamp(parseInt(s.panelCount, 10) || 4, 2, 4));
    byId('bn-marquee').checked = !!s.visible;
    byId('bn-items').value = (s.items && s.items.length ? s.items : String(s.text || '').split('\n').filter(Boolean)).join('\n');
    byId('bn-speed').value = s.speed || 20; byId('bn-speed-out').textContent = (s.speed || 20) + 's per loop';
    byId('bn-sep').value = s.separator || '✦';
    byId('bn-bg').value = normalizeHex(s.bgColor, paletteFor(getMode()).accent).toLowerCase();
    byId('bn-fg').value = normalizeHex(s.textColor, inkFor(paletteFor(getMode()).accent)).toLowerCase();
    const imgs = s.bannerImages || [];
    byId('bn-manual').innerHTML = [0, 1, 2, 3].map(i => '<div class="banner-row" data-row="' + i + '"><span class="prev" style="background-image:url(&quot;' + esc(safeUrl(imgs[i] || '')) + '&quot;)"></span>'
        + '<input type="text" id="bn-img-' + i + '" value="' + esc(imgs[i] || '') + '" placeholder="Panel ' + (i + 1) + ' image link" aria-label="Panel ' + (i + 1) + ' image link">'
        + '<button type="button" class="btn small" data-action="pick-image" data-target="bn-img-' + i + '">From posts</button>'
        + '<label class="btn small file-btn"><i class="fa-solid fa-upload" aria-hidden="true"></i><span class="sr-only">Upload</span><input type="file" accept="image/*" data-upload-target="bn-img-' + i + '" hidden></label></div>').join('');
    syncBannerForm();
    populateSliderForm();
}
function syncBannerForm() {
    $$('[data-action="banner-mode"]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === bannerDraftMode)));
    byId('bn-manual').hidden = bannerDraftMode !== 'manual';
    byId('bn-auto-hint').hidden = bannerDraftMode !== 'auto';
    byId('bn-manual-hint').hidden = bannerDraftMode !== 'manual';
    const n = parseInt(byId('bn-count').value, 10);
    $$('#bn-manual .banner-row').forEach(r => { r.hidden = Number(r.dataset.row) >= n; });
    byId('bn-marquee-fields').hidden = !byId('bn-marquee').checked;
}
function saveBannerSettings() {
    const items = byId('bn-items').value.split('\n').map(t => t.trim()).filter(Boolean);
    const s = {
        bannerMode: bannerDraftMode,
        bannerImages: [0, 1, 2, 3].map(i => (byId('bn-img-' + i) ? byId('bn-img-' + i).value.trim() : '')),
        panelCount: parseInt(byId('bn-count').value, 10) || 4,
        text: items.join('\n'), items,
        speed: parseInt(byId('bn-speed').value, 10) || 20,
        bgColor: byId('bn-bg').value, textColor: byId('bn-fg').value,
        separator: byId('bn-sep').value || '✦',
        visible: byId('bn-marquee').checked
    };
    currentConfig.bannerSettings = s;
    writeJSON(KEYS.banner, s);
    currentConfig.homeSliders = sliderFormSettings();
    renderHero(); renderMarquee(); renderSliders();
    saveSystem();
}

/* ═════════════════════════════════════════════
   ADMIN: SIDE SLIDERS (saved with the header settings)
   ═════════════════════════════════════════════ */

let sliderPicks = [], sliderRowCount = 0;
function populateSliderForm() {
    const s = sliderSettings();
    byId('sl-where').value = s.where; byId('sl-show').value = s.show;
    byId('sl-secs').value = s.secs; byId('sl-dir').value = s.dir;
    sliderPicks = s.picks.map(String);
    byId('sl-own').innerHTML = '';
    (s.own.length ? s.own : [{ img: '', link: '' }]).forEach(o => addSliderOwnRow(o.img, o.link));
    const art = sortPosts(postsCache, 'newest').filter(p => firstImage(p));
    byId('sl-picks').innerHTML = art.length
        ? art.map(p => '<button type="button" data-action="sl-pick" data-id="' + p.id + '" aria-pressed="' + sliderPicks.includes(String(p.id)) + '" aria-label="' + esc(postTitle(p)) + '"><img src="' + esc(thumbOf(firstImage(p))) + '" alt="" loading="lazy"></button>').join('')
        : '<p class="hint">No image posts yet.</p>';
    syncSliderForm();
}
function addSliderOwnRow(img, link) {
    const id = 'sl-own-img-' + (++sliderRowCount), row = document.createElement('div');
    row.className = 'sl-own-row';
    row.innerHTML = '<input type="text" id="' + id + '" class="sl-own-img" value="' + esc(img) + '" placeholder="Image link" aria-label="Image link">'
        + '<button type="button" class="btn small" data-action="pick-image" data-target="' + id + '">From posts</button>'
        + '<label class="btn small file-btn"><i class="fa-solid fa-upload" aria-hidden="true"></i><span class="sr-only">Upload</span><input type="file" accept="image/*" data-upload-target="' + id + '" hidden></label>'
        + '<input type="text" class="sl-own-link" value="' + esc(link) + '" placeholder="Goes to (optional): a post, a shop, anywhere" aria-label="Where the image goes">'
        + '<button type="button" class="btn small" data-action="sl-own-remove" aria-label="Remove this image"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>';
    byId('sl-own').appendChild(row);
}
function toggleSliderPick(el) {
    const id = el.dataset.id, i = sliderPicks.indexOf(id);
    if (i >= 0) sliderPicks.splice(i, 1); else sliderPicks.push(id);
    el.setAttribute('aria-pressed', String(i < 0));
    syncSliderForm();
}
function sliderFormSettings() {
    return {
        where: byId('sl-where').value, show: byId('sl-show').value,
        secs: clamp(parseInt(byId('sl-secs').value, 10) || 3, 2, 10), dir: byId('sl-dir').value,
        picks: sliderPicks.slice(),
        own: $$('#sl-own .sl-own-row').map(r => ({ img: $('.sl-own-img', r).value.trim(), link: $('.sl-own-link', r).value.trim() })).filter(o => o.img)
    };
}
// Shows only the fields the chosen kind needs, and redraws the preview slider with the form as it stands
function syncSliderForm() {
    const s = sliderSettings(sliderFormSettings());
    byId('sl-secs-out').textContent = plural(s.secs, 'second');
    byId('sl-pick-field').hidden = s.show !== 'pick';
    byId('sl-own-field').hidden = s.show !== 'own';
    byId('sl-pick-count').textContent = '(' + sliderPicks.length + ' picked)';
    fillRail(byId('sl-preview'), s.where === 'off' ? [] : sliderSlides(s, 'R'), s);
}

let pickerTarget = null;
function openPicker(targetId) {
    pickerTarget = targetId;
    byId('picker-heading').textContent = 'Choose an image';
    const imgs = [];
    sortPosts(postsCache, 'oldest').reverse().forEach(p => mediaList(p).forEach(u => { if (getMediaType(u) === 'image') imgs.push(u); }));
    byId('picker-grid').innerHTML = imgs.length ? imgs.map(u => '<button type="button" data-action="pick-this" data-url="' + esc(u) + '"><img src="' + esc(thumbOf(u)) + '" alt="" loading="lazy"></button>').join('') : '<p class="hint">No image posts yet.</p>';
    Modals.open(byId('picker-modal'));
}

/* ═════════════════════════════════════════════
   ADMIN: SOCIAL LINKS
   ═════════════════════════════════════════════ */

function renderLinksEditor() {
    const box = byId('links-editor'); box.innerHTML = '';
    const links = socialLinks();
    if (!links.length) addLinkRow('', '', '');
    links.forEach(l => addLinkRow(l.platform, l.url, l.label));
}
function addLinkRow(platform, url, label) {
    const row = document.createElement('div');
    row.className = 'link-row';
    row.innerHTML = '<select aria-label="Platform">' + PLATFORM_OPTIONS.map(p => '<option' + (p === platform ? ' selected' : '') + '>' + p + '</option>').join('') + '</select>'
        + '<input type="text" placeholder="Name to show" aria-label="Name to show" value="' + esc(label || '') + '">'
        + '<input type="text" placeholder="https://..." aria-label="Link" value="' + esc(url || '') + '">'
        + '<button type="button" class="q-btn del" data-action="link-remove" aria-label="Remove link"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>';
    byId('links-editor').appendChild(row);
}
function saveSocialLinks() {
    const links = $$('#links-editor .link-row').map(r => {
        const inputs = $$('input', r);
        let url = inputs[1].value.trim();
        const platform = $('select', r).value;
        if (platform === 'Email' && url && !/^mailto:/i.test(url) && url.includes('@')) url = 'mailto:' + url;
        return { platform, label: inputs[0].value.trim(), url };
    }).filter(l => safeUrl(l.url));
    currentConfig.socialLinks = links;
    writeJSON(KEYS.social, links);
    renderSocialLinks();
    saveSystem();
}

/* ═════════════════════════════════════════════
   CLEANUP
   ═════════════════════════════════════════════ */

function formatBytes(b) { return b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(2) + ' MB'; }
function fileSizes() {
    const enc = (name, obj) => new Blob(['window.' + name + ' = "' + unicodeToBase64(JSON.stringify(obj)) + '";']).size;
    return { system: enc('AZUMINT_SYSTEM', systemPayload()), posts: enc('AZUMINT_POSTS', postsCache), comics: enc('AZUMINT_COMICS', comicsCache), interactions: enc('AZUMINT_INTERACTIONS', interactionsCache) };
}
function cleanupLog(msg, type) {
    const log = byId('cleanup-log'); const dim = $('.dim', log); if (dim) dim.remove();
    const e = document.createElement('div'); e.className = 'log-entry ' + (type || 'info');
    e.innerHTML = '<time>' + formatTime(Date.now()) + '</time>'; e.appendChild(document.createTextNode(msg));
    log.appendChild(e); log.scrollTop = log.scrollHeight;
}
function openCleanupPanel() {
    byId('cleanup-log').innerHTML = '<div class="log-entry dim">Nothing run yet.</div>';
    $$('#cleanup-modal .tool-grid .btn').forEach(b => b.classList.remove('is-done', 'is-running'));
    refreshCleanupStats();
    renderShrink(); renderPreviews();
    Modals.open(byId('cleanup-modal'));
}
function refreshCleanupStats() {
    const f = fileSizes();
    const segs = [['Posts (' + postsCache.length + ')', f.posts, 'var(--accent)'], ['Comics (' + comicsCache.length + ')', f.comics, 'var(--hl)'], ['Likes & comments', f.interactions, 'var(--like)'], ['Settings', f.system, 'var(--text-3)']];
    const max = Math.max(...segs.map(s => s[1]), 1);
    byId('cleanup-bars').innerHTML = segs.map(s => '<div class="bar-row"><span>' + s[0] + '</span><span class="bar-track"><span class="bar-fill" style="display:block;width:' + Math.max(2, s[1] / max * 100) + '%;background:' + s[2] + '"></span></span><span>' + formatBytes(s[1]) + '</span></div>').join('');
    byId('cleanup-total').textContent = 'Total on Neocities: ' + formatBytes(f.system + f.posts + f.comics + f.interactions);
    const issues = [];
    const ids = postsCache.map(p => p.id); const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    if (dupes.length) issues.push(['warn', plural(dupes.length, 'duplicate post')]);
    const ws = postsCache.filter(p => p.content && (p.content !== p.content.trim() || /\n{3,}/.test(p.content))).length;
    if (ws) issues.push(['info', plural(ws, 'post') + ' with extra blank space']);
    const live = new Set(postsCache.map(p => String(p.id)));
    const orphans = Object.keys(interactionsCache).filter(k => !live.has(k));
    if (orphans.length) issues.push(['warn', plural(orphans.length, 'like and comment set') + ' for deleted posts']);
    let b64 = 0, b64size = 0;
    postsCache.forEach(p => { mediaList(p).forEach(m => { if (String(m).startsWith('data:')) { b64++; b64size += m.length; } }); if (p.content && p.content.includes('data:image/')) b64++; });
    if (b64) issues.push(['warn', plural(b64, 'image') + ' stored inside posts.js (about ' + formatBytes(b64size) + '). This is the biggest cause of slow loading.']);
    byId('cleanup-issues').innerHTML = issues.length
        ? issues.map(i => '<div class="issue ' + i[0] + '"><i class="fa-solid ' + (i[0] === 'warn' ? 'fa-triangle-exclamation' : 'fa-circle-info') + '" aria-hidden="true"></i>' + esc(i[1]) + '</div>').join('')
        : '<div class="issue clean"><i class="fa-solid fa-circle-check" aria-hidden="true"></i>Nothing to fix. Your data is tidy.</div>';
}
const Cleanup = {
    trim() { let c = 0; postsCache.forEach(p => { if (p.content) { const b = p.content; p.content = p.content.trim().replace(/\n{3,}/g, '\n\n'); if (p.content !== b) c++; } }); cleanupLog(c ? 'Trimmed ' + plural(c, 'post') : 'No extra spaces found', c ? 'success' : 'info'); return { posts: c > 0 }; },
    dupes() { const seen = new Set(), b = postsCache.length; postsCache = postsCache.filter(p => { if (seen.has(p.id)) return false; seen.add(p.id); return true; }); const r = b - postsCache.length; cleanupLog(r ? 'Removed ' + plural(r, 'duplicate') : 'No duplicates', r ? 'success' : 'info'); return { posts: r > 0 }; },
    orphans() { const live = new Set(postsCache.map(p => String(p.id))), b = Object.keys(interactionsCache).length; Object.keys(interactionsCache).forEach(k => { if (!live.has(k)) delete interactionsCache[k]; }); const r = b - Object.keys(interactionsCache).length; cleanupLog(r ? 'Cleared ' + plural(r, 'orphaned set') : 'No orphans', r ? 'success' : 'info'); return { interactions: r > 0 }; },
    empty() {
        let s = 0;
        postsCache.forEach(p => {
            Object.keys(p).forEach(k => { if (p[k] === null || p[k] === undefined || (k !== 'content' && p[k] === '')) { delete p[k]; s++; } });
            if (p.tags && typeof p.tags === 'string') p.tags = p.tags.split(',').map(t => t.trim()).filter(Boolean);
            if (Array.isArray(p.tags)) { p.tags = p.tags.filter(Boolean); if (!p.tags.length) { delete p.tags; s++; } }
        });
        comicsCache.forEach(c => Object.keys(c).forEach(k => { if (c[k] === null || c[k] === undefined) { delete c[k]; s++; } }));
        cleanupLog(s ? 'Stripped ' + plural(s, 'empty field') : 'No empty fields', s ? 'success' : 'info');
        return { posts: s > 0, comics: s > 0 };
    },
    compact() {
        let c = 0;
        postsCache.forEach(p => {
            if (p.date && p.id > 1e12 && p.date === new Date(p.id).toLocaleDateString()) { delete p.date; c++; }
            if (p.pinned === false) { delete p.pinned; c++; }
            if (Array.isArray(p.media) && p.media.length === 1) { p.media = p.media[0]; c++; }
            if (Array.isArray(p.media) && !p.media.length) { delete p.media; c++; }
        });
        Object.keys(interactionsCache).forEach(k => { const i = interactionsCache[k]; if (!(i.likes || 0) && !(i.dislikes || 0) && !(i.comments || []).length) { delete interactionsCache[k]; c++; } });
        cleanupLog(c ? 'Compacted ' + plural(c, 'field') : 'Already compact', c ? 'success' : 'info');
        return { posts: c > 0, interactions: c > 0 };
    },
    base64() {
        let s = 0, b = 0;
        postsCache.forEach(p => {
            if (p.media) {
                const keep = mediaList(p).filter(m => { if (String(m).startsWith('data:')) { b += m.length; s++; return false; } return true; });
                if (keep.length !== mediaList(p).length) { if (!keep.length) delete p.media; else p.media = keep.length === 1 ? keep[0] : keep; }
            }
            if (p.content && p.content.includes('data:image/')) {
                const before = p.content.length;
                p.content = p.content.replace(/!\[([^\]]*)\]\(data:image\/[^)]+\)/g, '[image removed]').replace(/data:image\/[a-z+]+;base64,[A-Za-z0-9+/=]+/g, '[image removed]');
                if (p.content.length < before) { s++; b += before - p.content.length; }
            }
        });
        cleanupLog(s ? 'Removed ' + plural(s, 'inline image') + ', freed about ' + formatBytes(b) : 'No inline images', s ? 'success' : 'info');
        return { posts: s > 0 };
    },
    async old() {
        const d = prompt('Delete posts older than how many days?', '365');
        if (!d || isNaN(parseInt(d, 10))) { cleanupLog('Cancelled', 'info'); return {}; }
        const cutoff = Date.now() - parseInt(d, 10) * 86400000, b = postsCache.length;
        if (!await askConfirm('This permanently deletes ' + plural(postsCache.filter(p => p.id < cutoff).length, 'post') + '. It can\'t be undone.', { hold: true, title: 'Delete old posts?' })) { cleanupLog('Cancelled', 'info'); return {}; }
        postsCache = postsCache.filter(p => p.id >= cutoff);
        const r = b - postsCache.length; cleanupLog(r ? 'Deleted ' + plural(r, 'post') + ' older than ' + d + ' days' : 'No posts that old', r ? 'warn' : 'info');
        return { posts: r > 0 };
    },
    async nuke() {
        if (!await askConfirm('Every like, dislike and comment on your site goes. This can\'t be undone.', { hold: true, title: 'Erase all likes and comments?', yes: 'Hold to erase' })) { cleanupLog('Cancelled', 'info'); return {}; }
        const c = Object.keys(interactionsCache).length; interactionsCache = {};
        cleanupLog(c ? 'Erased likes and comments on ' + plural(c, 'post') : 'Nothing to erase', c ? 'warn' : 'info');
        return { interactions: true };
    }
};
async function runCleanup(fn, btn) {
    if (btn) btn.classList.add('is-running');
    let changed = {};
    if (fn === 'full') {
        cleanupLog('Running all safe cleanups', 'info');
        ['trim', 'dupes', 'orphans', 'empty', 'compact', 'base64'].forEach(k => Object.entries(Cleanup[k]()).forEach(([f, v]) => { if (v) changed[f] = true; }));
    } else changed = (await Cleanup[fn]()) || {};
    refreshCleanupStats();
    renderHome();
    if (btn) { btn.classList.remove('is-running'); btn.classList.add('is-done'); }
    if (changed.system) await saveSystem();
    if (changed.posts) await savePosts();
    if (changed.comics) await saveComics();
    if (changed.interactions) await saveInteractionsOverwrite();
    if (Object.values(changed).some(Boolean)) cleanupLog('Synced changes', 'success');
}

/* ═════════════════════════════════════════════
   SHRINK IMAGES (PNG and JPG to WebP)
   The bridge can upload but not delete, so the originals stay on
   Neocities; we keep a list of them for the owner to remove.
   ═════════════════════════════════════════════ */

const Shrink = { running: false, stop: false };

// The path of an image stored on this site ("img/a.png"), or '' for outside links and inline data
function siteImagePath(u) {
    const s = String(u || '').trim();
    if (!s || /^data:/i.test(s)) return '';
    try { const url = new URL(s, location.href); return url.origin === location.origin ? decodeURIComponent(url.pathname).replace(/^\//, '') : ''; }
    catch (e) { return ''; }
}
// Every PNG/JPG reference on the site, exactly as stored (minus ones an earlier run found it couldn't shrink)
function shrinkableRefs(includeSkipped) {
    const refs = new Set(), skipped = includeSkipped ? [] : readJSON(KEYS.shrinkSkipped, []) || [];
    const add = u => { if (typeof u === 'string' && SHRINKABLE_EXT.test(siteImagePath(u)) && !skipped.includes(u)) refs.add(u); };
    postsCache.forEach(p => { mediaList(p).forEach(add); add(p.sketch); });
    comicsCache.forEach(c => { (c.pages || []).forEach(add); add(c.cover); });
    const c = currentConfig;
    [c.pfpImage, c.bgImage, c.bannerImage].forEach(add);
    (bannerSettings().bannerImages || []).forEach(add);
    const cp = commPage();
    (cp.tiers || []).forEach(t => add(t.image));
    add(cp.termsImage);
    return [...refs];
}
function swapImageRefs(map) {
    const sw = u => (typeof u === 'string' && map[u]) || u;
    const olds = Object.keys(map);
    postsCache.forEach(p => {
        if (Array.isArray(p.media)) p.media = p.media.map(sw); else if (p.media) p.media = sw(p.media);
        if (p.sketch) p.sketch = sw(p.sketch);
        if (p.content) olds.forEach(o => { if (p.content.includes(o)) p.content = p.content.split(o).join(map[o]); });
    });
    comicsCache.forEach(cm => { if (cm.pages) cm.pages = cm.pages.map(sw); if (cm.cover) cm.cover = sw(cm.cover); });
    // A picture's small copy still shows the same picture, so it moves to the new name
    const swKeys = m => Object.fromEntries(Object.entries(m).map(([k, v]) => [sw(k), v]));
    postsCache.forEach(p => { if (p.previews) p.previews = swKeys(p.previews); if (p.sizes) p.sizes = swKeys(p.sizes); });
    comicsCache.forEach(cm => { if (cm.previews) cm.previews = swKeys(cm.previews); });
    if (currentConfig.previews) currentConfig.previews = swKeys(currentConfig.previews);
    olds.forEach(o => [freshPreviews, freshSizes].forEach(m => { if (m.has(o)) { m.set(map[o], m.get(o)); m.delete(o); } }));
    previewIndex = null;
    const c = currentConfig;
    ['pfpImage', 'bgImage', 'bannerImage'].forEach(k => { if (c[k]) c[k] = sw(c[k]); });
    const b = bannerSettings();
    if ((b.bannerImages || []).some(u => map[u])) { c.bannerSettings = Object.assign({}, b, { bannerImages: b.bannerImages.map(sw) }); writeJSON(KEYS.banner, c.bannerSettings); }
    if (c.commPage) c.commPage = Object.assign({}, c.commPage, { tiers: (c.commPage.tiers || []).map(t => Object.assign({}, t, { image: sw(t.image) })), termsImage: sw(c.commPage.termsImage) });
}
async function siteHasFile(u) {
    try { const r = await fetch(new URL(u, location.href), { method: 'HEAD', cache: 'no-store' }); return r.ok; } catch (e) { return false; }
}

function renderShrink() {
    const refs = shrinkableRefs();
    const kept = shrinkableRefs(true).length - refs.length;
    byId('shrink-info').textContent = refs.length
        ? 'Found ' + plural(refs.length, 'PNG or JPG image') + ' on your site. This makes smaller WebP copies, switches your posts, comics and pages over to them, and lists the old files for you to delete.'
        : 'Nothing left to shrink.' + (kept ? ' ' + plural(kept, 'image') + ' stayed as ' + (kept === 1 ? 'it was' : 'they were') + ' because ' + (kept === 1 ? 'it is' : 'they are') + ' animated or already small.' : ' Your images are already WebP, GIF or video.');
    byId('shrink-start').disabled = !refs.length || Shrink.running;
    const left = readJSON(KEYS.shrinkLeftovers, []) || [];
    byId('shrink-left').hidden = !left.length;
    byId('shrink-left-count').textContent = plural(left.length, 'old file') + ' still on Neocities.';
    byId('shrink-list').value = left.join('\n');
}

async function runShrink() {
    if (Shrink.running) return;
    if (isLocalMode()) { showToast('Connect your site to Neocities first, so the copies can be uploaded.', 'error'); return; }
    const refs = shrinkableRefs();
    if (!refs.length) return;
    if (!await askConfirm('Your originals stay on Neocities until you delete them, so nothing is lost if something goes wrong. Keep this tab open until it finishes.', { title: 'Make smaller WebP copies of ' + plural(refs.length, 'image') + '?', yes: 'Shrink images' })) return;
    Shrink.running = true; Shrink.stop = false;
    const bar = byId('shrink-bar'), txt = byId('shrink-text'), count = byId('shrink-count');
    byId('shrink-progress').hidden = false; byId('shrink-stop').hidden = false; byId('shrink-start').disabled = true;
    cleanupLog('Shrinking ' + plural(refs.length, 'image'), 'info');
    const map = {}, done = [], cant = [];
    let before = 0, after = 0, skipped = 0, failed = 0;
    for (let i = 0; i < refs.length && !Shrink.stop; i++) {
        const old = refs[i], name = siteImagePath(old);
        txt.textContent = 'Shrinking ' + name.split('/').pop();
        count.textContent = (i + 1) + ' of ' + refs.length;
        bar.style.width = (i / refs.length * 100) + '%';
        try {
            const res = await fetch(new URL(old, location.href), { cache: 'no-store' });
            if (!res.ok) { skipped++; cleanupLog('Skipped ' + name + ' (not found on your site)', 'info'); continue; }
            const blob = await res.blob();
            const webp = await toWebp(blob, name);
            if (!webp) { skipped++; cant.push(old); continue; }
            let next = old.replace(SHRINKABLE_EXT, '.webp');
            if (await siteHasFile(next)) next = old.replace(SHRINKABLE_EXT, '-' + Date.now().toString(36) + '.webp');
            const path = siteImagePath(next);
            await promisifiedUpload(new File([webp], path.split('/').pop(), { type: 'image/webp' }), path);
            map[old] = next; done.push(name);
            before += blob.size; after += webp.size;
        } catch (e) {
            failed++;
            cleanupLog('Couldn\'t shrink ' + name + '. ' + e, 'error');
            if (!done.length && failed >= 3) { cleanupLog('Stopped: the first few uploads failed. Check your connection, then try again.', 'error'); break; }
        }
    }
    bar.style.width = '100%';
    if (done.length) {
        txt.textContent = 'Saving your posts';
        swapImageRefs(map);
        applyVisualConfig(); renderHome(); renderComics();
        await savePosts(); await saveComics(); await saveSystem();
        const left = readJSON(KEYS.shrinkLeftovers, []) || [];
        writeJSON(KEYS.shrinkLeftovers, left.concat(done.filter(n => !left.includes(n))));
        cleanupLog('Shrank ' + plural(done.length, 'image') + ' from ' + formatBytes(before) + ' to ' + formatBytes(after) + ' (' + Math.round((1 - after / before) * 100) + '% smaller)', 'success');
    }
    if (skipped) cleanupLog('Left ' + plural(skipped, 'image') + ' as ' + (skipped === 1 ? 'it was' : 'they were') + ' (animated, already small, or your browser can\'t make WebP)', 'info');
    if (cant.length && document.createElement('canvas').toDataURL('image/webp').startsWith('data:image/webp')) writeJSON(KEYS.shrinkSkipped, (readJSON(KEYS.shrinkSkipped, []) || []).concat(cant));
    if (Shrink.stop) cleanupLog('Stopped early. Run it again any time to finish the rest.', 'info');
    Shrink.running = false;
    byId('shrink-progress').hidden = true; byId('shrink-stop').hidden = true;
    renderShrink(); refreshCleanupStats();
}


/* ═════════════════════════════════════════════
   CLEAN UP: SMALL PREVIEWS
   Makes the small copies (see PREVIEWS in logic.js) for pictures uploaded before
   previews existed. The full pictures are left as they are.
   ═════════════════════════════════════════════ */

const Previews = { running: false, stop: false };

// Where a picture lives on the site, as an upload path: "img/a.png" as stored (minus any ?query), or the path of a full link to this site
function uploadPathOf(u) {
    const s = String(u || '').trim();
    return /^[a-z][a-z0-9+.-]*:|^\/\//i.test(s) ? siteImagePath(s) : s.split(/[?#]/)[0].replace(/^\.?\//, '');
}
// Pictures stored on this site that still need a small copy, or (post pictures) their shape. Ones an earlier run
// couldn't copy (too small, animated, missing) or couldn't measure are left out
function previewWork() {
    const noCopy = readJSON(KEYS.previewSkipped, []) || [], noSize = readJSON(KEYS.sizeSkipped, []) || [], work = new Map();
    const want = (u, size) => {
        if (typeof u !== 'string') return;
        const path = uploadPathOf(u);
        const copy = PREVIEWABLE.test(path) && thumbOf(u) === u && !noCopy.includes(u);
        const shape = size && SIZEABLE.test(path) && !sizeOf(u) && !noSize.includes(u);
        if (copy || shape) work.set(u, { copy: copy || (work.get(u) || {}).copy, shape: shape || (work.get(u) || {}).shape });
    };
    postsCache.forEach(p => mediaList(p).forEach(u => want(u, true)));
    comicsCache.forEach(c => { (c.pages || []).forEach(u => want(u)); want(c.cover); });
    configImageRefs().forEach(u => want(u));
    return [...work].map(([ref, w]) => Object.assign({ ref }, w));
}

function renderPreviews() {
    const n = previewWork().length;
    byId('pv-info').textContent = n
        ? plural(n, 'picture') + ' on your site ' + (n === 1 ? 'needs' : 'need') + ' a small preview or ' + (n === 1 ? 'its' : 'their') + ' shape saved. Small copies make cards, boards and sliders load faster, and saved shapes keep boards from jumping while pictures load. Your full pictures stay exactly as they are.'
        : 'Every picture that can have a small preview has one, and boards know every picture\'s shape.';
    byId('pv-start').disabled = !n || Previews.running;
}

async function runPreviews() {
    if (Previews.running) return;
    if (isLocalMode()) { showToast('Connect your site to Neocities first, so the copies can be uploaded.', 'error'); return; }
    const work = previewWork();
    if (!work.length) return;
    if (!await askConfirm('Your full pictures stay as they are. Keep this tab open until it finishes.', { title: 'Prepare ' + plural(work.length, 'picture') + '?', yes: 'Make previews' })) return;
    Previews.running = true; Previews.stop = false;
    const bar = byId('pv-bar'), txt = byId('pv-text'), count = byId('pv-count');
    byId('pv-progress').hidden = false; byId('pv-stop').hidden = false; byId('pv-start').disabled = true;
    cleanupLog('Preparing ' + plural(work.length, 'picture'), 'info');
    const noCopy = [], noSize = [], byPath = new Map();
    let made = 0, measured = 0, failed = 0, missing = 0;
    for (let i = 0; i < work.length && !Previews.stop; i++) {
        const { ref, copy, shape } = work[i], path = uploadPathOf(ref);
        txt.textContent = 'Preparing ' + path.split('/').pop();
        count.textContent = (i + 1) + ' of ' + work.length;
        bar.style.width = (i / work.length * 100) + '%';
        // Posts that share a file share its copy and shape
        const seen = byPath.get(path);
        if (seen && seen.r !== 'fail') {
            if (seen.copied) freshPreviews.set(ref, seen.copied); else if (copy) noCopy.push(ref);
            if (seen.size) freshSizes.set(ref, seen.size); else if (shape) noSize.push(ref);
            continue;
        }
        try {
            // A picture that only needs its shape is measured from its small copy, when it has one
            const src = copy ? ref : thumbOf(ref);
            const res = await fetch(new URL(src, location.href), { cache: 'no-store' });
            if (!res.ok) { missing++; if (copy) noCopy.push(ref); if (shape) noSize.push(ref); byPath.set(path, { r: 'missing' }); continue; }
            const blob = await res.blob();
            let copied = '', r = '';
            if (copy) {
                r = await addPreview(blob, path, ref);
                if (r === 'ok') { made++; copied = previewPath(path); }
                else if (r === 'skip') noCopy.push(ref);
                else if (++failed >= 3 && !made) { cleanupLog('Stopped: the first few uploads failed. Check your connection, then try again.', 'error'); break; }
            } else {
                const info = await readPicture(blob, uploadPathOf(src), false);
                if (info) freshSizes.set(ref, [info.w, info.h]);
            }
            const size = freshSizes.get(ref);
            if (shape) { if (size) measured++; else noSize.push(ref); }
            byPath.set(path, { copied, size, r });
        } catch (e) { failed++; }
    }
    bar.style.width = '100%';
    if (made || measured) {
        txt.textContent = 'Saving your posts';
        renderHome(); renderComics(); renderGallery();
        await savePosts(); await saveComics(); await saveSystem();
        if (made) cleanupLog('Made ' + plural(made, 'small preview'), 'success');
        if (measured) cleanupLog('Saved the shape of ' + plural(measured, 'picture'), 'success');
    }
    const remember = (key, list) => { if (list.length) writeJSON(key, (readJSON(key, []) || []).concat(list)); };
    remember(KEYS.previewSkipped, noCopy); remember(KEYS.sizeSkipped, noSize);
    if (noCopy.length > missing) cleanupLog('Left ' + plural(noCopy.length - missing, 'picture') + ' without a preview because ' + (noCopy.length - missing === 1 ? 'it is' : 'they are') + ' small already or animated', 'info');
    if (missing) cleanupLog('Skipped ' + plural(missing, 'picture') + ' not found on your site', 'info');
    if (failed) cleanupLog(plural(failed, 'preview') + ' didn\'t upload. Run it again to try those again.', 'error');
    if (Previews.stop) cleanupLog('Stopped early. Run it again any time to finish the rest.', 'info');
    Previews.running = false;
    byId('pv-progress').hidden = true; byId('pv-stop').hidden = true;
    renderPreviews();
}


/* ═════════════════════════════════════════════
   ADMIN: LINK PREVIEW AND TAB ICON
   Discord, Bluesky, X and message apps read a link's title, text and picture from the page's own HTML,
   and browsers read the tab icon from it too, so these live in index.html between the Link preview
   markers. Updating draws a preview card and icons, uploads them to img/, and rewrites only the lines
   between the markers on your site. Installing a newer index.html puts the plain lines back, so the
   next time Admin opens it writes the saved preview back in by itself (the pictures stay in img/).
   ═════════════════════════════════════════════ */

const LP_START = '<!-- Link preview:', LP_END = '<!-- /Link preview -->';
const LP_FILES = { card: 'img/link-preview.jpg', icon: 'img/favicon.png', touch: 'img/apple-touch-icon.png' };
let lpPage = '', lpTimer = 0, lpDraw = 0, lpWarned = false;
const lpBitmaps = new Map(); // pictures already read, so typing in the form doesn't read them again

function lpSettings() { return Object.assign({ pic: 'newest', picUrl: '', icon: 'pfp', iconUrl: '' }, currentConfig.linkPreview || {}); }
function lpFormSettings() {
    const v = id => byId(id) ? (byId(id).value || '').trim() : '';
    return { pic: v('lp-pic') || 'newest', picUrl: v('lp-pic-url'), icon: v('lp-icon') || 'pfp', iconUrl: v('lp-icon-url') };
}
// The newest piece skips sensitive ones, so a shared link never shows them
function lpPicture(s) {
    if (s.pic === 'pfp') return safeUrl(currentConfig.pfpImage);
    if (s.pic === 'own') return safeUrl(s.picUrl);
    const p = sortPosts(shownPosts().filter(x => firstImage(x) && !isNsfw(x)), 'newest')[0];
    return p ? safeUrl(firstImage(p)) : safeUrl(currentConfig.pfpImage);
}
function lpIconPicture(s) { return s.icon === 'pic' ? lpPicture(s) : s.icon === 'own' ? safeUrl(s.iconUrl) : safeUrl(currentConfig.pfpImage); }
function lpText() { const c = currentConfig; return { title: c.metaTitle || siteName(), desc: c.metaDescription || c.tagline || '' }; }
function siteBase() { return location.origin + location.pathname.replace(/[^/]*$/, ''); }
// What the preview shows, to tell when the live one is out of date
function lpSignature(s) { const t = lpText(); return JSON.stringify([t.title, t.desc, siteName(), lpPicture(s), lpIconPicture(s), feedShown()]); }
function lpLiveStamp() { const m = $('meta[name="neerg-preview"]'); return m ? m.getAttribute('content') : ''; }
// This page was loaded before the update, so it learns the new stamp here
function lpMarkLive(v) {
    let m = $('meta[name="neerg-preview"]');
    if (!m) { m = document.createElement('meta'); m.name = 'neerg-preview'; document.head.appendChild(m); }
    m.content = String(v);
}

function lpBitmap(url) {
    if (!url) return Promise.resolve(null);
    if (!lpBitmaps.has(url)) {
        if (lpBitmaps.size > 6) lpBitmaps.clear();
        lpBitmaps.set(url, fetch(new URL(url, location.href)).then(res => {
            if (!res.ok) throw new Error('missing');
            return res.blob();
        }).then(b => createImageBitmap(b, { imageOrientation: 'from-image' })).catch(e => { lpBitmaps.delete(url); throw e; }));
    }
    return lpBitmaps.get(url);
}
function lpCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function drawCover(cx, bmp, x, y, w, h) {
    const s = Math.max(w / bmp.width, h / bmp.height), dw = bmp.width * s, dh = bmp.height * s;
    cx.drawImage(bmp, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}
function canvasBlob(c, type, q) { return new Promise((res, rej) => c.toBlob(b => b ? res(b) : rej(new Error('draw')), type, q)); }
// 1200 x 630, the size link previews use: the picture whole, on a blurred and dimmed copy of itself
function lpCard(bmp) {
    const c = lpCanvas(1200, 630), cx = c.getContext('2d'), pal = paletteFor('dark');
    cx.imageSmoothingQuality = 'high';
    if (bmp) {
        // A soft blurred copy fills the card: a real blur where the browser has one, else a tiny copy enlarged in steps
        if ('filter' in cx) { cx.filter = 'blur(40px)'; drawCover(cx, bmp, -80, -80, 1360, 790); cx.filter = 'none'; }
        else {
            const src = lpCanvas(30, 16);
            drawCover(src.getContext('2d'), bmp, 0, 0, 30, 16);
            const mid = lpCanvas(150, 79), mx = mid.getContext('2d');
            mx.imageSmoothingQuality = 'high'; mx.drawImage(src, 0, 0, 150, 79);
            cx.drawImage(mid, -40, -40, 1280, 710);
        }
        cx.fillStyle = 'rgba(0,0,0,.45)'; cx.fillRect(0, 0, 1200, 630);
        const s = Math.min(1080 / bmp.width, 550 / bmp.height), w = bmp.width * s, h = bmp.height * s;
        cx.shadowColor = 'rgba(0,0,0,.55)'; cx.shadowBlur = 40; cx.shadowOffsetY = 14;
        cx.drawImage(bmp, (1200 - w) / 2, (630 - h) / 2, w, h);
    } else {
        cx.fillStyle = pal.bg; cx.fillRect(0, 0, 1200, 630);
        cx.fillStyle = pal.accent; cx.font = '800 120px system-ui, sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
        cx.fillText(siteName(), 600, 315, 1080);
    }
    return c;
}
// A square icon cut from the middle of the picture, round for the tab; the first letter of the site name without one
function lpIcon(bmp, size, round) {
    const c = lpCanvas(size, size), cx = c.getContext('2d'), accent = paletteFor('dark').accent;
    if (round) { cx.beginPath(); cx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2); cx.clip(); }
    cx.imageSmoothingQuality = 'high';
    if (bmp) drawCover(cx, bmp, 0, 0, size, size);
    else {
        cx.fillStyle = accent; cx.fillRect(0, 0, size, size);
        cx.fillStyle = inkFor(accent); cx.font = '800 ' + Math.round(size * .6) + 'px system-ui, sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
        cx.fillText(siteName().trim().charAt(0).toUpperCase() || 'N', size / 2, size / 2 + size * .04);
    }
    return c;
}
async function lpPictures(s) {
    const load = async url => { try { return await lpBitmap(url); } catch (e) { return url ? 'blocked' : null; } };
    return { pic: await load(lpPicture(s)), icon: await load(lpIconPicture(s)) };
}

function linkPreviewSoon() { clearTimeout(lpTimer); lpTimer = setTimeout(renderLinkPreview, 250); }
async function renderLinkPreview() {
    if (!byId('lp-pic')) return;
    const s = lpFormSettings(), draw = ++lpDraw;
    byId('lp-pic-field').hidden = s.pic !== 'own';
    byId('lp-icon-field').hidden = s.icon !== 'own';
    // The form's title and description, as they would be saved
    const title = (byId('s-title').value || '').trim() || (byId('s-sitename').value || '').trim() || siteName();
    const desc = (byId('s-desc').value || '').trim() || (byId('s-tagline').value || '').trim();
    byId('lp-tab-title').textContent = title;
    byId('lp-card-site').textContent = location.host || siteName();
    byId('lp-card-title').textContent = title;
    byId('lp-card-desc').textContent = desc;
    const pics = await lpPictures(s);
    if (draw !== lpDraw) return;
    const bad = pics.pic === 'blocked' || pics.icon === 'blocked';
    byId('lp-card-img').src = lpCard(pics.pic === 'blocked' ? null : pics.pic).toDataURL('image/jpeg', .8);
    byId('lp-tab-icon').src = lpIcon(pics.icon === 'blocked' ? null : pics.icon, 64, true).toDataURL('image/png');
    renderLinkPreviewStatus(bad ? 'That picture is on another website, so it can\'t be used here. Upload it instead.' : '');
}
function renderLinkPreviewStatus(note) {
    const lp = lpSettings(), st = byId('lp-status'); if (!st) return;
    let text;
    if (note) text = note;
    else if (!lp.v) text = 'Not set up yet: links to your site show no picture.';
    else if (lpLiveStamp() !== String(lp.v)) text = 'Your link preview isn\'t on your site right now. Installing an update does this. Press Update link preview to put it back.';
    else if (lp.sig !== lpSignature(Object.assign({}, lp, lpFormSettings()))) text = 'Your link preview shows older details. Press Update link preview to use these.';
    else text = 'Live on your site since ' + new Date(lp.v).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) + '. Sites like Discord can take a while to notice a change.';
    st.textContent = text;
    byId('lp-download').hidden = !lpPage;
}

// The lines between the markers, for this site's address
function lpBlock(v) {
    const t = lpText(), base = siteBase(), q = '?v=' + v;
    const m = (key, val, attr) => '    <meta ' + (attr || 'property') + '="' + key + '" content="' + esc(val) + '">';
    return [LP_START + ' Admin › Site info › Search and sharing rewrites the lines from here to the end marker on your site -->',
        '    <title>' + esc(t.title) + '</title>',
        m('description', t.desc, 'name'),
        m('og:type', 'website'), m('og:site_name', siteName()), m('og:title', t.title), m('og:description', t.desc), m('og:url', base),
        m('og:image', base + LP_FILES.card + q), m('og:image:width', '1200'), m('og:image:height', '630'), m('og:image:alt', 'Art from ' + siteName()),
        m('twitter:card', 'summary_large_image', 'name'),
        '    <link rel="icon" type="image/png" href="' + LP_FILES.icon + q + '">',
        '    <link rel="apple-touch-icon" href="' + LP_FILES.touch + q + '">',
        ...(feedShown() ? ['    <link rel="alternate" type="application/rss+xml" title="' + esc(t.title) + '" href="feed.xml">'] : []),
        m('neerg-preview', String(v), 'name'),
        '    ' + LP_END].join('\n');
}
// The site's own address, not /index.html, which Neocities redirects (dropping the ?tag that skips its cache)
const freshPage = tag => fetch(siteBase() + '?' + tag + '=' + Date.now(), { cache: 'no-store' }).then(r => r.ok ? r.text() : '').catch(() => '');
// Rewrites the lines between the markers in the site's index.html, then reads it back to be sure
async function lpWritePage(v, page) {
    const html = page || await freshPage('read');
    const a = html.indexOf(LP_START), b = html.indexOf(LP_END);
    if (a < 0 || b < a || html.indexOf(LP_START, a + 1) >= 0 || html.indexOf(LP_END, b + 1) >= 0 || !/logic\.js/.test(html) || !/<\/html>\s*$/i.test(html)) return 'old';
    lpPage = html.slice(0, a) + lpBlock(v) + html.slice(b + LP_END.length);
    const r = await uploadToBridge('page', { content: lpPage, quiet: true });
    if (!r.success) return 'refused';
    const stamp = 'name="neerg-preview" content="' + v + '"';
    for (let i = 0; i < 3; i++) { await wait(1200 * i); if ((await freshPage('check')).includes(stamp)) { lpPage = ''; return 'ok'; } }
    return 'unchecked';
}

let lpBusy = false;
async function updateLinkPreview() {
    if (lpBusy) return;
    if (isLocalMode()) { showToast('Connect your site to Neocities first, so the files can be uploaded.', 'error'); return; }
    lpBusy = true; byId('lp-update').disabled = true;
    const t = showToast('Updating your link preview', 'loading');
    try {
        // The preview uses what the form shows, so save the form first
        if (!await saveSiteSettings()) return;
        const s = lpSettings();
        const pics = await lpPictures(s);
        if (pics.pic === 'blocked' || pics.icon === 'blocked') { renderLinkPreviewStatus('That picture is on another website, so it can\'t be used here. Upload it instead.'); return; }
        const files = [[LP_FILES.card, await canvasBlob(lpCard(pics.pic), 'image/jpeg', .88)], [LP_FILES.icon, await canvasBlob(lpIcon(pics.icon, 64, true), 'image/png')], [LP_FILES.touch, await canvasBlob(lpIcon(pics.icon, 180, false), 'image/png')]];
        for (const [path, blob] of files) {
            const r = await uploadToBridge('media_only', { mediaFile: new File([blob], path.split('/').pop(), { type: blob.type }), mediaPath: path, quiet: true });
            if (!r.success) { showToast('Couldn\'t upload the preview pictures. ' + (r.message || 'Try again.'), 'error'); return; }
        }
        const v = Date.now(), result = await lpWritePage(v);
        if (result === 'old') { renderLinkPreviewStatus('Your index.html is from an older NEERG, so it has no place for a link preview. Install the newest index.html first.'); return; }
        currentConfig.linkPreview = Object.assign({}, s, { v, sig: lpSignature(s) });
        await saveSystem();
        if (result !== 'refused') lpMarkLive(v);
        if (result === 'ok') { showToast('Link preview updated'); renderLinkPreviewStatus(''); }
        else renderLinkPreviewStatus(result === 'refused'
            ? 'Your site didn\'t let Admin change index.html. Download it here and upload it to your Neocities dashboard to finish.'
            : 'Your site hasn\'t shown the new index.html yet. If links still show no picture in a few minutes, download it here and upload it to your Neocities dashboard.');
    } finally {
        dismissToast(t); lpBusy = false; byId('lp-update').disabled = false;
    }
}
function downloadLinkPreviewPage() { if (lpPage) downloadFile(lpPage, 'index.html'); }

/* ═════════════════════════════════════════════
   ADMIN: BACKUP REMINDER
   Your posts, comics, likes and settings live only in four files on Neocities, so the dashboard asks
   for a fresh backup when this device's last one is two weeks old, or there isn't one yet.
   ═════════════════════════════════════════════ */

const BACKUP_EVERY = 14 * 864e5;
function renderBackupNudge() {
    const box = byId('backup-nudge'); if (!box) return;
    const now = Date.now(), last = Number(readJSON(KEYS.lastBackup, 0)) || 0, snooze = Number(readJSON(KEYS.backupSnooze, 0)) || 0;
    const due = (postsCache.length || comicsCache.length) && now - last > BACKUP_EVERY && now > snooze;
    box.hidden = !due;
    if (!due) return;
    const days = Math.floor((now - last) / 864e5);
    box.innerHTML = '<span><strong>' + (last ? 'Your last backup from this device was ' + plural(days, 'day') + ' ago.' : 'You haven\'t backed up your site from this device yet.') + '</strong>'
        + ' A backup saves your posts, comics, likes and settings to your computer, in case anything ever goes wrong on Neocities.</span>'
        + '<span class="row-actions"><button class="btn small btn-primary" data-action="download-backup"><i class="fa-solid fa-download" aria-hidden="true"></i> Back up now</button>'
        + '<button class="btn small btn-ghost" data-action="backup-snooze">Remind me in a week</button></span>';
}

/* ═════════════════════════════════════════════
   ADMIN: RSS FEED
   feed.xml lists the 20 newest posts that are up, for feed readers. Admin rewrites it after posts are
   saved (when it changed) and once each visit, so scheduled posts that have gone up join it.
   ═════════════════════════════════════════════ */

let feedLast = '', feedState = '';
function feedXml() {
    const base = siteBase(), t = lpText(), nos = postNumbers();
    const abs = u => { try { return new URL(u, base).href; } catch (e) { return ''; } };
    const items = sortPosts(shownPosts(), 'newest').slice(0, 20).map(p => {
        const img = firstImage(p), link = base + '#/post/' + p.id, sensitive = isNsfw(p);
        const body = (img && !sensitive ? '<p><img src="' + esc(abs(thumbOf(img))) + '" alt="' + esc(p.alt || '') + '"></p>' : '')
            + md(p.content || '') + (sensitive ? '<p>Sensitive piece: see it on the site.</p>' : '');
        return '<item><title>' + esc('No.' + nos.get(p.id) + ' · ' + (excerpt(p.content, 80) || stampTag(p) || 'Untitled piece')) + '</title>'
            + '<link>' + esc(link) + '</link><guid isPermaLink="false">' + esc(link) + '</guid>'
            + (p.id > 1e12 ? '<pubDate>' + new Date(p.id).toUTCString() + '</pubDate>' : '')
            + postTags(p).map(g => '<category>' + esc(g) + '</category>').join('')
            + '<description>' + esc(body) + '</description></item>';
    });
    const newest = shownPosts().reduce((m, p) => Math.max(m, p.id), 0);
    return '<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>'
        + '<title>' + esc(t.title) + '</title><link>' + esc(base) + '</link><description>' + esc(t.desc || siteName()) + '</description>'
        + '<atom:link href="' + esc(base + 'feed.xml') + '" rel="self" type="application/rss+xml"/>'
        + (newest > 1e12 ? '<lastBuildDate>' + new Date(newest).toUTCString() + '</lastBuildDate>' : '')
        + '\n' + items.join('\n') + '\n</channel></rss>\n';
}
async function writeFeed() {
    if (currentConfig.feedOff || isLocalMode()) return;
    const xml = feedXml();
    if (xml === feedLast) return;
    const r = await uploadToBridge('feed', { content: xml, quiet: true });
    feedState = r.success ? 'ok' : 'refused';
    if (r.success) {
        feedLast = xml;
        if (!currentConfig.feedLive) { currentConfig.feedLive = true; applyVisualConfig(); saveSystem(); }
    }
    renderFeedStatus();
}
function renderFeedStatus() {
    const st = byId('feed-status'); if (!st) return;
    const on = byId('s-feed').checked;
    st.innerHTML = !on ? 'The feed is off.'
        : feedState === 'refused' ? 'Your site didn\'t accept feed.xml, so there\'s no feed for now.'
        : currentConfig.feedLive ? 'Your feed: <a href="feed.xml" target="_blank" rel="noopener">' + esc(siteBase() + 'feed.xml') + '</a>'
        : 'It\'s written the next time you save a post.';
}

// Once each visit to Admin: restore notes and the feed
async function adminArrived() {
    if (lpWarned) return;
    await checkLinkPreview();
    writeFeed();
}

// After logging in: an index.html update puts the plain lines back, so the saved preview goes back in by itself.
// Its pictures are still in img/ under the same ?v= stamp, so only the lines in index.html are written again.
async function checkLinkPreview() {
    const lp = lpSettings();
    lpWarned = true;
    if (!lp.v || isLocalMode()) return;
    // This tab may have loaded an older copy of the page, so look at the one on the site
    const live = await freshPage('read');
    if (!live) return;
    if (live.includes('name="neerg-preview" content="' + lp.v + '"')) { lpMarkLive(lp.v); return; }
    const r = await lpWritePage(lp.v, live);
    if (r === 'ok' || r === 'unchecked') { lpMarkLive(lp.v); showToast('Your link preview is back on your site after the update.'); }
    else showToast('Your link preview isn\'t on your site right now. Put it back in Site info › Search and sharing.', 'info');
    renderLinkPreviewStatus('');
}


/* ═════════════════════════════════════════════
   ADMIN: ART OF TODAY SETTINGS (Site info → Art of Today)
   The pop-up itself is in aotd.js, which loads with this file.
   ═════════════════════════════════════════════ */

// The settings being edited in Site info, before they're saved
const Aotd = { draft: null };
async function previewAotd(designId) {
    const s = aotdFormSettings();
    const post = aotdPick(s);
    if (!post) { showToast('Post some artwork first, then the pop-up has something to show.', 'error'); return; }
    const design = aotdDesign(designId) || aotdDesignFor(s);
    await aotdPrepare(design, post);
    openAotd(post, design, s, true);
}

const AOTD_MINIS = {
    botanical: '<span class="aotd-mini" style="background:#F4F2EC"><span style="position:absolute;left:0;right:0;top:8px;text-align:center;font:italic 17px \'Playfair Display\',serif;color:var(--mc)">Art of Today</span><span style="position:absolute;left:8px;right:8px;top:38px;height:32px;background:#6FA8E8"></span><span style="position:absolute;left:4px;top:30px;width:18px;height:26px;border-radius:50% 0;background:#5E9F86"></span><span style="position:absolute;right:6px;top:46px;width:18px;height:26px;border-radius:0 50%;background:#5E9F86"></span></span>',
    cinema: '<span class="aotd-mini" style="display:grid;place-items:center;background:#B8652A"><span style="position:absolute;inset:6px;border:1px solid rgba(255,255,255,.7)"></span><span style="font:16px \'DM Serif Display\',serif;color:#FFF">Art of Today</span></span>',
    calligraphy: '<span class="aotd-mini" style="background:#2E6A3C"><span style="position:absolute;left:10px;top:2px;font:46px \'Pinyon Script\',cursive;color:#FFF">Art</span><span style="position:absolute;left:34px;top:46px;font:30px \'Pinyon Script\',cursive;color:#FFF">Today</span></span>',
    magazine: '<span class="aotd-mini" style="display:flex;flex-direction:column;background:#FFF"><span style="height:34px;padding:0 8px;font:300 26px/34px \'Cormorant Garamond\',serif;color:#1A1A1A">TODAY</span><span style="flex:1;background:#F0B62E"></span></span>',
    caption: '<span class="aotd-mini" style="display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:6px 0;background:#FDFDFB"><span style="width:70%;height:4px;border-radius:2px;background:var(--mc)"></span><span style="display:grid;place-items:center;align-self:stretch;height:54px;background:#3F86DB;font:italic 15px \'Playfair Display\',serif;color:#FFF">art of today</span><span style="width:62%;height:4px;border-radius:2px;background:var(--mc)"></span></span>',
    editorial: '<span class="aotd-mini" style="display:flex;flex-direction:column;justify-content:center;padding:0 10px;background:#93CBD0;font:24px/.95 \'DM Serif Display\',serif;color:#FFF"><span>Art of</span><span>Today</span></span>',
    award: '<span class="aotd-mini" style="background:#FAFAF8"><span style="position:absolute;left:14px;right:0;top:32px;height:34px;background:#7FB9E0"></span><span style="position:absolute;left:8px;top:4px;display:flex;flex-direction:column;font:26px/.95 \'DM Serif Display\',serif;color:#1E3350"><span>A</span><span>R</span><span>T</span></span></span>',
    chapter: '<span class="aotd-mini" style="background:var(--mc)"><span style="position:absolute;inset:6px;border-radius:6px;background:#2E6A3C"></span><span style="position:absolute;left:0;top:0;width:58px;height:36px;padding:4px 6px;border-radius:0 0 8px 0;background:var(--mc);font:11px/1 \'Permanent Marker\',cursive;color:#111">Art of Today</span><span style="position:absolute;left:0;bottom:0;width:70%;height:22px;border-radius:0 8px 0 0;background:var(--mc)"></span></span>',
    tabloid: '<span class="aotd-mini" style="background:var(--mc)"><span style="position:absolute;left:6px;top:2px;font:22px Anton,sans-serif;color:#111;white-space:nowrap">ART OF TODAY</span><span style="position:absolute;left:34px;top:34px;width:70px;height:52px;background:#6B6B6B"></span></span>',
    calendar: '<span class="aotd-mini" style="background:#E7E5E0"><span style="position:absolute;left:6px;top:6px;width:62%;height:44px;background:var(--mc)"></span><span style="position:absolute;right:6px;top:6px;width:26%;height:64px;background:var(--mc)"></span><span style="position:absolute;left:8px;top:48px;font:22px \'Archivo Black\',sans-serif;color:#111">10</span><span style="position:absolute;left:0;right:0;bottom:0;height:18px;background:#111"></span></span>'
};

function aotdBoards() {
    const count = new Map();
    postsCache.forEach(p => { if (firstImage(p)) postTags(p).forEach(t => { const k = t.toLowerCase(); const e = count.get(k) || { name: t, n: 0 }; e.n++; count.set(k, e); }); });
    return Array.from(count.values()).sort((a, b) => b.n - a.n);
}
function renderAotdTiles() {
    const s = Aotd.draft, box = byId('aotd-tiles'); if (!box) return;
    const random = s.mode !== 'one';
    const on = AOTD_DESIGNS.filter(d => random ? !s.off.includes(d.id) : s.design === d.id).length;
    byId('aotd-mode-help').textContent = random
        ? (on === 1 ? 'Only 1 design is' : on + ' of ' + AOTD_DESIGNS.length + ' designs are') + ' in the rotation. Tap a design to add it or leave it out.'
        : 'Tap the design to use every day.';
    box.innerHTML = AOTD_DESIGNS.map((d, i) => {
        const chosen = random ? !s.off.includes(d.id) : s.design === d.id;
        const color = aotdColor(d, s);
        return '<div class="aotd-tile' + (chosen ? ' is-on' : '') + '">'
            + '<button type="button" class="aotd-tile-main" data-action="aotd-tile" data-id="' + d.id + '" aria-pressed="' + chosen + '">'
            + '<span class="aotd-mini-wrap" aria-hidden="true" style="--mc:' + (color || '#3B8FD9') + '">' + AOTD_MINIS[d.id] + '</span>'
            + '<span class="aotd-tile-name">' + String(i + 1).padStart(2, '0') + ' ' + d.name + '</span>'
            + '<span class="aotd-tile-status">' + (random ? (chosen ? 'In the rotation' : 'Left out') : (chosen ? 'Shown every day' : 'Not used')) + '</span></button>'
            + '<div class="aotd-tile-tools">'
            + (d.colors ? '<select class="aotd-tile-color" data-id="' + d.id + '" aria-label="' + d.name + ' ' + d.colors[0].toLowerCase() + ' color">' + d.colors[1].map(c => '<option value="' + c[0] + '"' + (c[0] === color ? ' selected' : '') + '>' + c[1] + '</option>').join('') + '</select>' : '<span class="aotd-tile-nocolor"></span>')
            + '<button type="button" class="aotd-tile-peek" data-action="aotd-peek" data-id="' + d.id + '" aria-label="Preview ' + d.name + '"><i class="fa-regular fa-eye" aria-hidden="true"></i></button>'
            + '</div></div>';
    }).join('');
    $$('input[name="aotd-mode"]').forEach(r => { r.checked = r.value === (random ? 'random' : 'one'); r.closest('.aotd-mode').classList.toggle('is-on', r.checked); });
}
function syncAotdArtFields() {
    const art = ($('input[name="aotd-art"]:checked') || {}).value || 'all';
    byId('aotd-board-field').hidden = art !== 'board';
    byId('aotd-pick-field').hidden = art !== 'pick';
}
function renderAotdPicked() {
    const id = byId('s-aotd-post').value;
    const p = postsCache.find(x => String(x.id) === String(id));
    byId('aotd-pick-show').innerHTML = p && firstImage(p)
        ? '<img src="' + esc(thumbOf(firstImage(p))) + '" alt=""><span>No.' + postNumbers().get(p.id) + ' · ' + esc(excerpt(p.content, 40) || 'Untitled piece') + '</span>'
        : '<span class="hint">No piece chosen yet</span>';
}
function populateAotdForm() {
    if (!byId('aotd-tiles')) return;
    const s = aotdSettings();
    Aotd.draft = clone(s);
    AOTD_DESIGNS.forEach(aotdFonts);
    byId('s-aotd').checked = currentConfig.artOfToday !== false;
    $$('input[name="aotd-art"]').forEach(r => { r.checked = r.value === s.art; });
    const boards = aotdBoards();
    const board = byId('s-aotd-board');
    board.innerHTML = boards.length ? boards.map(b => '<option value="' + esc(b.name) + '">' + esc(b.name) + ' (' + b.n + ')</option>').join('') : '<option value="">No boards yet</option>';
    if (boards.some(b => b.name.toLowerCase() === String(s.board).toLowerCase())) board.value = boards.find(b => b.name.toLowerCase() === String(s.board).toLowerCase()).name;
    byId('s-aotd-post').value = s.post || '';
    renderAotdPicked();
    byId('s-aotd-nsfw').checked = s.skipNsfw;
    byId('s-aotd-headline').value = s.headline;
    byId('s-aotd-message').value = s.message;
    byId('s-aotd-delay').value = String(s.delay);
    byId('s-aotd-anim').value = s.anim;
    byId('s-aotd-phones').checked = s.phones;
    syncAotdArtFields();
    renderAotdTiles();
}
// The settings as they are in the form right now, saved or not (used by Preview and Save)
function aotdFormSettings() {
    if (!Aotd.draft || !byId('aotd-tiles') || ui.view !== 'admin') return aotdSettings();
    return Object.assign({}, Aotd.draft, {
        art: ($('input[name="aotd-art"]:checked') || {}).value || 'all',
        board: byId('s-aotd-board').value, post: byId('s-aotd-post').value,
        skipNsfw: byId('s-aotd-nsfw').checked,
        headline: byId('s-aotd-headline').value.trim() || AOTD_DEFAULTS.headline,
        message: byId('s-aotd-message').value.trim(),
        delay: Number(byId('s-aotd-delay').value) || 2, anim: byId('s-aotd-anim').value,
        phones: byId('s-aotd-phones').checked
    });
}
function aotdTile(id) {
    const s = Aotd.draft;
    if (s.mode === 'one') s.design = id;
    else if (s.off.includes(id)) s.off = s.off.filter(x => x !== id);
    else if (s.off.length >= AOTD_DESIGNS.length - 1) { showToast('Keep at least one design in the rotation.', 'error'); return; }
    else s.off = s.off.concat(id);
    renderAotdTiles();
    const btn = $('.aotd-tile-main[data-id="' + id + '"]'); if (btn) btn.focus({ preventScroll: true });
}
function openAotdPostPicker() {
    const s = aotdFormSettings();
    const list = sortPosts(postsCache, 'newest').filter(p => aotdAllowed(p, s));
    const nums = postNumbers();
    byId('picker-heading').textContent = 'Choose a piece';
    byId('picker-grid').innerHTML = list.length
        ? list.map(p => '<button type="button" data-action="aotd-pick-post" data-id="' + p.id + '" aria-label="No.' + nums.get(p.id) + ' ' + esc(excerpt(p.content, 40)) + '"><img src="' + esc(thumbOf(firstImage(p))) + '" alt="" loading="lazy"></button>').join('')
        : '<p class="hint">No image posts yet.</p>';
    Modals.open(byId('picker-modal'));
}

/* ═════════════════════════════════════════════
   THE DASHBOARD
   Its buttons, its markup and the listeners for its form fields. index.html keeps only the empty
   #admin-panel box, so visitors never download any of this. It all goes in place as soon as this file
   loads, before anything above is called.
   ═════════════════════════════════════════════ */

// What the dashboard's buttons do (logic.js has the rest, and runs them: see `actions` there)
Object.assign(actions, {
    'preview-aotd': () => previewAotd(),
    'aotd-peek': el => previewAotd(el.dataset.id),
    'aotd-tile': el => aotdTile(el.dataset.id),
    'aotd-choose': () => openAotdPostPicker(),
    'aotd-pick-post': el => { byId('s-aotd-post').value = el.dataset.id; renderAotdPicked(); Modals.close(byId('picker-modal')); },
    // Admin
    'logout': () => logoutAdmin(),
    'chf-save': () => saveCharacter(),
    'chf-cancel': () => chfFill(null),
    'chf-edit': el => { const c = siteCharacters().find(x => String(x.id) === el.dataset.id); if (c) { chfFill(c); byId('chf-name').focus(); byId('chf-heading').scrollIntoView({ block: 'start', behavior: reduceMotion() ? 'auto' : 'smooth' }); } },
    'chf-delete': el => deleteCharacter(el.dataset.id),
    'chf-move': el => moveCharacter(el.dataset.id, el.dataset.dir),
    'chf-pick-colors': () => pickCharacterColors(),
    'chf-intro-save': () => saveCharactersIntro(),
    'srf-save': () => saveSeries(),
    'srf-cancel': () => { srfFill(null); renderSeriesParts(); renderSeriesPicker(); },
    'srf-edit': el => { const s = siteSeries().find(x => String(x.id) === el.dataset.id); if (s) { srfFill(s); renderSeriesParts(); renderSeriesPicker(); byId('srf-name').focus(); byId('srf-heading').scrollIntoView({ block: 'start', behavior: reduceMotion() ? 'auto' : 'smooth' }); } },
    'srf-delete': el => deleteSeries(el.dataset.id),
    'srf-move': el => moveSeries(el.dataset.id, el.dataset.dir),
    'srf-toggle': el => seriesToggle(el.dataset.id),
    'srf-part-move': el => seriesPartMove(el.dataset.index, el.dataset.dir),
    'srf-part-remove': el => seriesPartRemove(el.dataset.index),
    'force-sync': () => forceSyncAll(),
    'open-cleanup': () => openCleanupPanel(),
    'download-backup': () => downloadBackup(),
    'backup-snooze': () => { writeJSON(KEYS.backupSnooze, Date.now() + 7 * 864e5); renderBackupNudge(); },
    'toggle-chip': el => el.setAttribute('aria-pressed', String(el.getAttribute('aria-pressed') !== 'true')),
    'np-add-url': () => addUrlToQueue(),
    'queue-move': el => { const i = Number(el.dataset.index), j = i + Number(el.dataset.dir); if (j < 0 || j >= currentPostMediaQueue.length) return; [currentPostMediaQueue[i], currentPostMediaQueue[j]] = [currentPostMediaQueue[j], currentPostMediaQueue[i]]; renderMediaQueue(); },
    'queue-remove': el => { currentPostMediaQueue.splice(Number(el.dataset.index), 1); renderMediaQueue(); },
    'publish-post': () => createPost(),
    'bulk-upload': () => bulkUpload(),
    'edit-post': el => { const id = Number(el.dataset.id); editingPostId = editingPostId === id ? null : id; renderManagePosts(); },
    'edit-remove-media': el => el.closest('.mm').classList.toggle('is-removed'),
    'toggle-pin': el => togglePin(el.dataset.id),
    'comic-create': () => createComic(),
    'comics-download': () => { downloadComicsJS(); showToast('Downloaded comics.js'); },
    'comics-sync': () => saveComics(),
    'edit-comic': el => { const id = Number(el.dataset.id); editingComicId = editingComicId === id ? null : id; resetEditPagesDraft(); renderComicsAdmin(); },
    'ec-swap': el => editComicSwap(el.dataset.index),
    'ec-remove': el => editComicRemove(el.dataset.index),
    'delete-comic': el => deleteComic(el.dataset.id),
    'open-add-pages': el => openAddPagesModal(el.dataset.id),
    'ap-submit': () => submitAddPages(),
    'sorter-remove': el => { const q = el.dataset.sorter === 'nc-pages' ? comicPagesQueue : addPagesQueue; q.splice(Number(el.dataset.index), 1); if (el.dataset.sorter === 'nc-pages') renderNewComicPages(); else renderAddPages(); },
    'site-save': () => saveSiteSettings(),
    'goto-admin-tab': (el, e) => { e.preventDefault(); showAdminTab(el.dataset.tab); window.scrollTo(0, 0); },
    'status-preset': el => { byId('s-status-text').value = el.dataset.text; byId('s-status-color').value = el.dataset.color.toLowerCase(); },
    'comm-toggle': () => toggleCommissions(),
    'comm-save': () => saveCommSettings(),
    'comm-colors-reset': () => setCommColors(COMM_DEFAULTS),
    'tier-add': () => addTier(),
    'tier-move': el => moveTier(el),
    'tier-remove': el => removeTier(el),
    'addon-add': () => addAddon(),
    'addon-remove': el => el.closest('.addon-row').remove(),
    'tsec-add': () => addTermSection(),
    'tsec-move': el => moveTermSection(el),
    'tsec-remove': el => removeTermSection(el),
    'studio-mode': el => Studio.switchMode(el.dataset.mode),
    'studio-preset': el => Studio.applyPreset(Number(el.dataset.index)),
    'studio-generate': () => Studio.generate(),
    'studio-save': () => Studio.save(),
    'studio-discard': () => Studio.discard(),
    'ring-preset': el => Studio.ringPreset(Number(el.dataset.index)),
    'banner-mode': el => { bannerDraftMode = el.dataset.mode; syncBannerForm(); },
    'banner-save': () => saveBannerSettings(),
    'sl-pick': el => toggleSliderPick(el),
    'sl-own-add': () => { addSliderOwnRow('', ''); syncSliderForm(); },
    'sl-own-remove': el => { el.closest('.sl-own-row').remove(); syncSliderForm(); },
    'pick-image': el => openPicker(el.dataset.target),
    'pick-this': el => {
        const t = byId(pickerTarget); if (t) { t.value = el.dataset.url; t.dispatchEvent(new Event('input', { bubbles: true })); }
        Modals.close(byId('picker-modal'));
    },
    'link-add': () => addLinkRow('', '', ''),
    'link-remove': el => el.closest('.link-row').remove(),
    'links-save': () => saveSocialLinks(),
    'cleanup': el => runCleanup(el.dataset.fn, el),
    'shrink-start': () => runShrink(),
    'pv-start': () => runPreviews(),
    'lp-update': () => updateLinkPreview(),
    'lp-download': () => downloadLinkPreviewPage(),
    'pv-stop': el => { Previews.stop = true; el.disabled = true; el.textContent = 'Stopping'; setTimeout(() => { el.disabled = false; el.textContent = 'Stop after this one'; }, 1500); },
    'shrink-stop': el => { Shrink.stop = true; el.disabled = true; el.textContent = 'Stopping'; setTimeout(() => { el.disabled = false; el.textContent = 'Stop after this one'; }, 1500); },
    'shrink-copy': () => { const t = byId('shrink-list').value; (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => showToast('List copied'), () => { byId('shrink-list').select(); showToast('Press Ctrl+C to copy the selected list'); }); },
    'shrink-download': () => downloadFile(byId('shrink-list').value + '\n', 'old-images-to-delete.txt'),
    'shrink-forget': async () => { if (!await askConfirm('Only do this once the old files are deleted from Neocities.', { title: 'Clear the list?', yes: 'Clear the list' })) return; writeJSON(KEYS.shrinkLeftovers, []); renderShrink(); }
});

const ADMIN_HTML = `
<div class="dash-head">
    <div class="dash-title">
        <h1>Dashboard</h1>
        <span class="sync-chip" id="sync-chip" data-state="idle">All changes synced</span>
    </div>
    <div class="dash-actions">
        <button class="btn" data-action="force-sync"><i class="fa-solid fa-rotate" aria-hidden="true"></i> Sync everything</button>
        <button class="btn" data-action="open-cleanup"><i class="fa-solid fa-broom" aria-hidden="true"></i> Clean up</button>
        <button class="btn" data-action="download-backup"><i class="fa-solid fa-download" aria-hidden="true"></i> Back up</button>
        <button class="btn btn-ghost" data-action="logout">Log out</button>
    </div>
</div>

<div class="notice" id="recovery" hidden></div>
<div class="notice" id="backup-nudge" role="status" hidden></div>

<div class="dash-tabs" role="tablist" aria-label="Admin sections">
    <button role="tab" data-action="admin-tab" data-tab="post" aria-selected="true">New post</button>
    <button role="tab" data-action="admin-tab" data-tab="posts" aria-selected="false">Posts</button>
    <button role="tab" data-action="admin-tab" data-tab="comics" aria-selected="false">Comics</button>
    <button role="tab" data-action="admin-tab" data-tab="chars" aria-selected="false">Characters</button>
    <button role="tab" data-action="admin-tab" data-tab="series" aria-selected="false">Series</button>
    <button role="tab" data-action="admin-tab" data-tab="comm" aria-selected="false">Commissions</button>
    <button role="tab" data-action="admin-tab" data-tab="site" aria-selected="false">Site info</button>
    <button role="tab" data-action="admin-tab" data-tab="look" aria-selected="false">Colors &amp; style</button>
    <button role="tab" data-action="admin-tab" data-tab="banner" aria-selected="false">Home page</button>
    <button role="tab" data-action="admin-tab" data-tab="links" aria-selected="false">Social links</button>
</div>

<!-- New post -->
<div class="dash-panel" data-tab-panel="post" role="tabpanel">
    <div class="compose">
        <div class="compose-main">
            <label class="field">
                <span>Caption</span>
                <textarea id="np-content" rows="7" placeholder="Say something about this piece. Markdown works: **bold**, *italic*, [link](https://...)"></textarea>
            </label>
            <label class="field">
                <span>Picture description <em>(optional: read aloud to people who use screen readers)</em></span>
                <input type="text" id="np-alt" placeholder="For example: a girl in a red coat walking a fox through snow">
            </label>
            <div class="field">
                <span>Tags</span>
                <div class="chips chips-toggle" id="np-tags"></div>
                <input type="text" id="np-custom-tags" placeholder="More tags, separated by commas">
            </div>
            <label class="check"><input type="checkbox" id="np-pinned"> <span>Pin to the top of the feed</span></label>
            <label class="check"><input type="checkbox" id="np-later"> <span>Schedule it to go up later</span></label>
            <label class="field" id="np-at-field" hidden><span>Goes up at <em>(your time; until then only you can see it, in Posts)</em></span><input type="datetime-local" id="np-at"></label>
        </div>
        <div class="compose-media">
            <div class="dropzone" id="np-drop" data-input="np-files" tabindex="0" role="button" aria-label="Add images, video or audio">
                <i class="fa-regular fa-image" aria-hidden="true"></i>
                <p><strong>Drop images or video here</strong><br>or click to browse. You can also paste an image.</p>
                <input type="file" id="np-files" accept="image/*,video/*,audio/*" multiple hidden>
            </div>
            <div class="inline-form">
                <input type="url" id="np-url" placeholder="Or paste a link to an image or video" aria-label="Media link">
                <button class="btn" data-action="np-add-url">Add</button>
            </div>
            <ol class="queue" id="np-queue"></ol>
            <div class="field">
                <span>Sketch <em>(optional: adds a slider so visitors can compare it with the first picture)</em></span>
                <div class="inline-form">
                    <input type="text" id="np-sketch" placeholder="img/sketch.png or https://..." aria-label="Sketch link">
                    <label class="btn file-btn"><i class="fa-solid fa-upload" aria-hidden="true"></i> Upload<input type="file" accept="image/*" data-upload-target="np-sketch" hidden></label>
                </div>
            </div>
            <label class="field"><span>The slider starts at</span><select id="np-sketch-start"><option value="middle">Half way</option><option value="sketch">The sketch</option><option value="finished">The finished piece</option></select></label>
        </div>
    </div>
    <div class="form-foot">
        <button class="btn btn-primary" data-action="publish-post" id="np-publish"><i class="fa-solid fa-paper-plane" aria-hidden="true"></i> Publish post</button>
    </div>

    <details class="drawer">
        <summary>Upload many images as separate posts</summary>
        <div class="drawer-body">
            <p class="hint">Each image becomes its own post. The tags you picked above are added to all of them.</p>
            <div class="dropzone small" id="bulk-drop" data-input="bulk-files" tabindex="0" role="button" aria-label="Choose images for bulk upload">
                <p><strong>Choose images</strong> or drop them here</p>
                <input type="file" id="bulk-files" accept="image/*" multiple hidden>
            </div>
            <div class="thumb-row" id="bulk-preview"></div>
            <div class="progress" id="bulk-progress" hidden>
                <div class="progress-row"><span id="bulk-progress-text">Uploading</span><span id="bulk-progress-count"></span></div>
                <div class="progress-bar"><div class="progress-fill" id="bulk-progress-bar"></div></div>
            </div>
            <button class="btn btn-primary" data-action="bulk-upload" id="bulk-btn" disabled>Upload as separate posts</button>
        </div>
    </details>
</div>

<!-- Manage posts -->
<div class="dash-panel" data-tab-panel="posts" role="tabpanel" hidden>
    <div class="list-tools">
        <label class="search">
            <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
            <input type="search" id="mp-search" placeholder="Find a post" aria-label="Find a post">
        </label>
        <span class="section-count" id="mp-count"></span>
    </div>
    <div class="manage-list" id="mp-list"></div>
</div>

<!-- Comics -->
<div class="dash-panel" data-tab-panel="comics" role="tabpanel" hidden>
    <div class="form-card">
        <h2>New comic</h2>
        <div class="form-grid">
            <label class="field"><span>Title</span><input type="text" id="nc-title" placeholder="Comic title"></label>
            <label class="field"><span>Tags</span><input type="text" id="nc-tags" placeholder="fantasy, action"></label>
            <label class="field"><span>Cover image link <em>(optional, page 1 is used if empty)</em></span><input type="url" id="nc-cover" placeholder="https://..."></label>
            <label class="field"><span>Opens in <em>(readers can still switch)</em></span><select id="nc-mode"><option value="page">One page at a time</option><option value="scroll">Long scroll</option><option value="spread">Two pages, like a comic book</option></select></label>
        </div>
        <div class="dropzone small" id="nc-drop" data-input="nc-files" tabindex="0" role="button" aria-label="Choose comic pages">
            <p><strong>Choose pages</strong> or drop them here, in reading order</p>
            <input type="file" id="nc-files" accept="image/*" multiple hidden>
        </div>
        <p class="hint">Drag thumbnails to reorder. Pages upload to the comic's own folder on your site, like img/comics/space-cats/ for a comic called Space Cats.</p>
        <div class="page-sorter" id="nc-pages"></div>
        <div class="progress" id="nc-progress" hidden>
            <div class="progress-row"><span id="nc-progress-text">Uploading</span></div>
            <div class="progress-bar"><div class="progress-fill" id="nc-progress-bar"></div></div>
        </div>
        <button class="btn btn-primary" data-action="comic-create">Create comic</button>
    </div>

    <div class="section-head">
        <h2>Your comics</h2>
        <div class="row-actions">
            <button class="btn small" data-action="comics-download"><i class="fa-solid fa-download" aria-hidden="true"></i> comics.js</button>
            <button class="btn small" data-action="comics-sync"><i class="fa-solid fa-rotate" aria-hidden="true"></i> Sync comics</button>
        </div>
    </div>
    <div class="manage-list" id="mc-list"></div>
</div>

<!-- Characters -->
<div class="dash-panel" data-tab-panel="chars" role="tabpanel" hidden>
    <div class="form-card">
        <h2 id="chf-heading">New character</h2>
        <div class="form-grid">
            <label class="field"><span>Name</span><input type="text" id="chf-name" placeholder="Their name"></label>
            <label class="field"><span>Tag that links their art <em>(posts with this tag show on their page)</em></span><input type="text" id="chf-tag" list="chf-tags" placeholder="their-name"><datalist id="chf-tags"></datalist></label>
            <label class="field span-2"><span>One-line description</span><input type="text" id="chf-role" placeholder="Who they are, in a few words"></label>
            <label class="field span-2"><span>Bio <em>(Markdown works: **bold**, *italic*)</em></span><textarea id="chf-bio" rows="4" placeholder="A few sentences about them"></textarea></label>
            <div class="field span-2">
                <span>Reference picture</span>
                <div class="inline-form">
                    <input type="text" id="chf-img" placeholder="img/reference.png or https://..." aria-label="Reference picture link">
                    <label class="btn file-btn"><i class="fa-solid fa-upload" aria-hidden="true"></i> Upload<input type="file" accept="image/*" data-upload-target="chf-img" hidden></label>
                </div>
            </div>
            <div class="field span-2">
                <span>Colors <em>(picked from the reference picture; change any of them, or set all three to black to hide them)</em></span>
                <div class="chf-colors">
                    <input type="color" id="chf-c1" aria-label="First color">
                    <input type="color" id="chf-c2" aria-label="Second color">
                    <input type="color" id="chf-c3" aria-label="Third color">
                    <button class="btn small" data-action="chf-pick-colors"><i class="fa-solid fa-palette" aria-hidden="true"></i> Pick from the picture</button>
                </div>
            </div>
            <label class="field"><span>First drawn <em>(optional)</em></span><input type="text" id="chf-first" placeholder="Spring 2024"></label>
            <label class="field"><span>Appears in <em>(optional)</em></span><input type="text" id="chf-appears" placeholder="A comic or series"></label>
        </div>
        <div class="form-foot">
            <button class="btn btn-ghost" data-action="chf-cancel" id="chf-cancel" hidden>Cancel</button>
            <button class="btn btn-primary" data-action="chf-save" id="chf-save">Add character</button>
        </div>
    </div>
    <div class="section-head"><h2>Your characters</h2></div>
    <div class="manage-list" id="chf-list"></div>
    <div class="form-card">
        <h2>Page intro</h2>
        <label class="field"><span>A line at the top of the Characters page <em>(leave it empty for the standard one)</em></span><input type="text" id="chf-intro" placeholder="Everyone who shows up in my art"></label>
        <div class="form-foot"><button class="btn" data-action="chf-intro-save">Save intro</button></div>
    </div>
</div>

<!-- Series -->
<div class="dash-panel" data-tab-panel="series" role="tabpanel" hidden>
    <div class="form-card">
        <h2 id="srf-heading">New series</h2>
        <div class="form-grid">
            <label class="field"><span>Title</span><input type="text" id="srf-name" placeholder="Inktober 2026"></label>
            <label class="field"><span>Description <em>(optional)</em></span><input type="text" id="srf-desc" placeholder="What this series is about"></label>
        </div>
        <div class="field">
            <span>Pieces, in order <em>(the first one is the cover; use the arrows or drag to reorder)</em></span>
            <ol class="queue" id="srf-parts"></ol>
        </div>
        <div class="field">
            <span>Add pieces <em>(tap a picture to add it, tap again to take it out)</em></span>
            <input type="search" id="srf-search" placeholder="Search captions and tags" aria-label="Search your posts">
            <div class="srf-pick" id="srf-pick"></div>
        </div>
        <div class="form-foot">
            <button class="btn btn-ghost" data-action="srf-cancel" id="srf-cancel" hidden>Cancel</button>
            <button class="btn btn-primary" data-action="srf-save" id="srf-save">Add series</button>
        </div>
    </div>
    <div class="section-head"><h2>Your series</h2></div>
    <div class="manage-list" id="srf-list"></div>
</div>

<!-- Commissions -->
<div class="dash-panel" data-tab-panel="comm" role="tabpanel" hidden>
    <fieldset class="group">
        <legend>Page design</legend>
        <p class="hint">How your Commissions page looks. In the three new designs the page shows only your tiers; picking one opens its own page with your add-ons, terms of service and the request button. Press Save to switch.</p>
        <div class="ab-picks" role="radiogroup" aria-label="Commissions page design">
            <label class="ab-pick"><input type="radio" name="comm-design" value="original"><span class="ab-mini cmx-mini is-original" aria-hidden="true"><i></i><i></i><i></i></span><b>Original poster</b><small>Your taped poster with a card for each tier</small></label>
            <label class="ab-pick"><input type="radio" name="comm-design" value="event"><span class="ab-mini cmx-mini is-event" aria-hidden="true"><i></i><i></i><i></i></span><b>Rounded panels</b><small>Bright panels with a white star, and art-tool stickers</small></label>
            <label class="ab-pick"><input type="radio" name="comm-design" value="signal"><span class="ab-mini cmx-mini is-signal" aria-hidden="true"><i></i><i></i><i></i></span><b>Poster frame</b><small>A sky poster with orbit rings over a yellow strip of tiers</small></label>
            <label class="ab-pick"><input type="radio" name="comm-design" value="strips"><span class="ab-mini cmx-mini is-strips" aria-hidden="true"><i></i><i></i><i></i></span><b>Character strips</b><small>Tall slanted posters; the one you pick slides left</small></label>
        </div>
    </fieldset>

    <fieldset class="group">
        <legend>Open or closed</legend>
        <button type="button" class="cm-switch" id="cm-switch" data-action="comm-toggle" aria-pressed="false">
            <span class="cm-switch-tapes" aria-hidden="true"><i></i><i></i><i></i></span>
            <span class="cm-switch-text">
                <strong id="cm-switch-label">Commissions are open</strong>
                <span id="cm-switch-sub">Click to close them and tape off your Commissions page.</span>
            </span>
        </button>
        <p class="hint">This button saves and syncs straight away. Your status badge flips between Open and Closed with it, unless you've written your own.</p>
        <div class="field">
            <span>Status badge</span>
            <div class="chips" id="status-presets"></div>
        </div>
        <div class="form-grid">
            <label class="field"><span>Status text</span><input type="text" id="s-status-text" placeholder="AVAILABLE FOR COMMISSIONS"></label>
            <label class="field field-color"><span>Status color</span><input type="color" id="s-status-color"></label>
        </div>
    </fieldset>

    <fieldset class="group">
        <legend>Page text</legend>
        <div class="form-grid">
            <label class="field"><span>Big title</span><input type="text" id="cm-f-title" placeholder="COMMISSIONS" maxlength="24"></label>
            <label class="field"><span>Name on the blue tape</span><input type="text" id="cm-f-handle" placeholder="Your site name"></label>
            <label class="field span-2"><span>Contact line on the blue tape</span><input type="text" id="cm-f-contact" placeholder="DM or you@email.com"></label>
            <label class="field"><span>Request link <em>(a form, or mailto:you@site.com)</em></span><input type="text" id="s-comm-link" placeholder="https://..."></label>
            <label class="field"><span>Request button text</span><input type="text" id="cm-f-button" placeholder="Request a commission"></label>
        </div>
    </fieldset>

    <fieldset class="group">
        <legend>Tiers</legend>
        <p class="hint">Each tier is a card with example art, its name running down the side, your notes and a price badge. Art with a see-through background (a PNG) can pop out of its frame like a sticker. <strong>Spots</strong> is how many of that tier you take at a time: when they're all filled, the new designs show "Full right now" and turn off its request button.</p>
        <div class="tier-list" id="cm-tier-list"></div>
        <button type="button" class="btn" data-action="tier-add" style="align-self:flex-start"><i class="fa-solid fa-plus" aria-hidden="true"></i> Add tier</button>
    </fieldset>

    <fieldset class="group">
        <legend>Add-ons</legend>
        <p class="hint">Extras buyers can add on a tier's page, like an extra character. The new designs add them to the total.</p>
        <div class="addon-list" id="cm-addon-list"></div>
        <button type="button" class="btn" data-action="addon-add" style="align-self:flex-start"><i class="fa-solid fa-plus" aria-hidden="true"></i> Add an add-on</button>
    </fieldset>

    <fieldset class="group">
        <legend>Terms of service</legend>
        <p class="hint">Sections like Ordering, Payment or Refunds. Each one opens and closes on the page.</p>
        <div class="tier-list" id="cm-tsec-list"></div>
        <button type="button" class="btn" data-action="tsec-add" style="align-self:flex-start"><i class="fa-solid fa-plus" aria-hidden="true"></i> Add a section</button>
        <div class="form-grid">
            <label class="field"><span>Will draw <em>(one per line)</em></span><textarea id="cm-f-will" rows="3" placeholder="Original characters&#10;Fan art"></textarea></label>
            <label class="field"><span>Won't draw <em>(one per line; shown in red)</em></span><textarea id="cm-f-wont" rows="3" placeholder="Gore&#10;Hateful content"></textarea></label>
        </div>
        <label class="check"><input type="checkbox" id="cm-f-agree"> <span>Buyers must tick "I've read the terms" before the request button works <em>(new designs)</em></span></label>
        <label class="field"><span>Simple terms <em>(one per line; Markdown works; used only when you have no sections above)</em></span><textarea id="cm-f-terms" rows="4" placeholder="Payment upfront via PayPal or Ko-fi.&#10;No refunds once work has started."></textarea></label>
        <div class="field">
            <span>Picture beside the terms <em>(leave empty to use your profile picture)</em></span>
            <div class="inline-form">
                <input type="text" id="cm-f-termspic" placeholder="img/me.png or https://..." aria-label="Picture beside the terms">
                <button type="button" class="btn small" data-action="pick-image" data-target="cm-f-termspic">From posts</button>
                <label class="btn small file-btn"><i class="fa-solid fa-upload" aria-hidden="true"></i> Upload<input type="file" accept="image/*" data-upload-target="cm-f-termspic" hidden></label>
            </div>
        </div>
        <label class="field"><span>Extra details <em>(optional, shown under the terms; Markdown works)</em></span><textarea id="s-comm-info" rows="5"></textarea></label>
    </fieldset>

    <fieldset class="group">
        <legend>When closed</legend>
        <div class="hz-sample" aria-hidden="true"><span id="cm-tape-sample">COMMISSIONS CLOSED</span></div>
        <label class="field"><span>Words on the hazard tape <em>(one per line)</em></span><textarea id="cm-f-tape" rows="3" placeholder="COMMISSIONS CLOSED&#10;CLOSED&#10;CHECK BACK SOON"></textarea></label>
        <label class="field"><span>Closed message <em>(optional, shown under the title)</em></span><input type="text" id="cm-f-closednote" placeholder="Back soon! Follow me to hear when slots open."></label>
    </fieldset>

    <fieldset class="group">
        <legend>Poster colors</legend>
        <div class="swatches compact">
            <label class="swatch"><input type="color" id="cm-f-paper"><span>Paper</span></label>
            <label class="swatch"><input type="color" id="cm-f-ink"><span>Ink</span></label>
            <label class="swatch"><input type="color" id="cm-f-tapecolor"><span>Corner tape</span></label>
        </div>
        <button type="button" class="btn small" data-action="comm-colors-reset" style="align-self:flex-start">Reset poster colors</button>
    </fieldset>

    <div class="form-foot sticky-foot">
        <a class="btn btn-ghost" href="#/commissions">View page</a>
        <button class="btn btn-primary" data-action="comm-save">Save &amp; sync</button>
    </div>
</div>

<!-- Site info -->
<div class="dash-panel" data-tab-panel="site" role="tabpanel" hidden>
    <fieldset class="group">
        <legend>Identity</legend>
        <div class="form-grid">
            <label class="field"><span>Site name</span><input type="text" id="s-sitename"></label>
            <label class="field"><span>Tagline</span><input type="text" id="s-tagline"></label>
            <label class="field"><span>Name for your posts</span><input type="text" id="s-feedname" placeholder="Works"></label>
            <label class="field"><span>Copyright line</span><input type="text" id="s-copyright" placeholder="2026 NEERG"></label>
            <div class="field span-2">
                <span>Profile picture</span>
                <div class="inline-form">
                    <input type="text" id="s-pfp" placeholder="img/me.png or https://..." aria-label="Profile picture link">
                    <label class="btn file-btn"><i class="fa-solid fa-upload" aria-hidden="true"></i> Upload<input type="file" accept="image/*" data-upload-target="s-pfp" hidden></label>
                </div>
            </div>
        </div>
    </fieldset>

    <fieldset class="group">
        <legend>About page</legend>
        <div class="field">
            <span>Cover design</span>
            <div class="ab-picks" role="radiogroup" aria-label="About page design">
                <label class="ab-pick"><input type="radio" name="about-style" value="broadcast"><span class="ab-mini is-broadcast" aria-hidden="true"><i></i><i></i><i></i></span><b>Broadcast</b><small>A VHS screen with your newest art and TV listings</small></label>
                <label class="ab-pick"><input type="radio" name="about-style" value="mixtape"><span class="ab-mini is-mixtape" aria-hidden="true"><i></i><i></i><i></i></span><b>Mixtape</b><small>A cassette label, a shelf of tapes and a label sheet</small></label>
                <label class="ab-pick"><input type="radio" name="about-style" value="spectrum"><span class="ab-mini is-spectrum" aria-hidden="true"><i></i><i></i><i></i></span><b>Spectrum</b><small>A rainbow label poster with your posts as tour dates</small></label>
            </div>
        </div>
        <label class="field"><span>Bio <em>(Markdown works)</em></span><textarea id="s-bio" rows="5" placeholder="Who you are, what you make, what you're into."></textarea></label>
    </fieldset>

    <p class="hint">Commission prices, status and terms now live in their own <a href="#/admin" data-action="goto-admin-tab" data-tab="comm">Commissions</a> tab.</p>

    <fieldset class="group">
        <legend>Visitors</legend>
        <label class="check"><input type="checkbox" id="s-agegate"> <span>Ask first-time visitors to confirm they're 18 or older</span></label>
        <label class="field"><span>Theme for first-time visitors <em>(they can still switch with the sun/moon button)</em></span>
            <select id="s-start-theme"><option value="dark">Dark</option><option value="light">Light</option><option value="device">Match their phone or computer</option></select>
        </label>
        <label class="check"><input type="checkbox" id="s-blur"> <span>Blur posts tagged NSFW until a visitor taps to reveal</span></label>
        <label class="check"><input type="checkbox" id="s-comments"> <span>Allow comments</span></label>
        <label class="check"><input type="checkbox" id="s-reactions"> <span>Show like and dislike buttons</span></label>
        <div class="form-grid">
            <label class="field"><span>Reaction style</span>
                <select id="s-reaction-style">
                    <option value="thumb">Thumbs</option>
                    <option value="arrow">Arrows</option>
                    <option value="faces">Custom text</option>
                </select>
            </label>
            <label class="field"><span>Featured posts on Home</span>
                <select id="s-featured">
                    <option value="recent">Newest work</option>
                    <option value="popular">Most liked</option>
                    <option value="pinned">Pinned posts only</option>
                    <option value="off">Hide featured</option>
                </select>
            </label>
            <label class="field"><span>Recommended comic on Home</span>
                <select id="s-rec-comic">
                    <option value="">Newest comic</option>
                    <option value="off">Don't show one</option>
                </select>
            </label>
            <label class="field"><span>Like text <em>(custom text style)</em></span><input type="text" id="s-like-label"></label>
            <label class="field"><span>Dislike text <em>(custom text style)</em></span><input type="text" id="s-dislike-label"></label>
        </div>
    </fieldset>

    <fieldset class="group aotd-admin">
        <legend>Art of Today pop-up</legend>
        <label class="check"><input type="checkbox" id="s-aotd"> <span>Show a pop-up with one piece from your archive the first time someone visits each day <em>(closing it hides it until tomorrow)</em></span></label>

        <div class="aotd-sec">
            <h3 class="aotd-h">Design</h3>
            <div class="aotd-modes" role="radiogroup" aria-label="How the design is picked">
                <label class="aotd-mode"><input type="radio" name="aotd-mode" value="random"> A different design every day</label>
                <label class="aotd-mode"><input type="radio" name="aotd-mode" value="one"> Always use one design</label>
            </div>
            <p class="hint" id="aotd-mode-help"></p>
            <div class="aotd-tiles" id="aotd-tiles"></div>
            <p class="hint">Some designs have a color to choose under their picture. The eye button previews that design.</p>
        </div>

        <div class="aotd-sec">
            <h3 class="aotd-h">Artwork</h3>
            <label class="check"><input type="radio" name="aotd-art" value="all"> <span>A random piece from all posts</span></label>
            <label class="check"><input type="radio" name="aotd-art" value="board"> <span>A random piece from one board</span></label>
            <label class="field aotd-indent" id="aotd-board-field"><span>Board</span><select id="s-aotd-board"></select></label>
            <label class="check"><input type="radio" name="aotd-art" value="pick"> <span>The same piece I pick</span></label>
            <div class="aotd-indent aotd-pick" id="aotd-pick-field">
                <span class="aotd-pick-show" id="aotd-pick-show"></span>
                <button type="button" class="btn small" data-action="aotd-choose">Choose a piece</button>
                <input type="hidden" id="s-aotd-post">
            </div>
            <label class="check"><input type="checkbox" id="s-aotd-nsfw"> <span>Skip posts tagged NSFW <em>(the pop-up can appear on top of any page, so this keeps it safe to open anywhere)</em></span></label>
        </div>

        <div class="aotd-sec">
            <h3 class="aotd-h">Words and timing</h3>
            <div class="form-grid">
                <label class="field"><span>Headline</span><input type="text" id="s-aotd-headline" maxlength="40" placeholder="Art of Today"></label>
                <label class="field"><span>Message <em>(leave empty for none)</em></span><input type="text" id="s-aotd-message" maxlength="80" placeholder="One piece a day, picked just for you."></label>
                <label class="field"><span>Show it after</span>
                    <select id="s-aotd-delay">
                        <option value="1">1 second</option>
                        <option value="2">2 seconds</option>
                        <option value="5">5 seconds</option>
                    </select>
                </label>
                <label class="field"><span>Animation</span>
                    <select id="s-aotd-anim">
                        <option value="design">Each design's own entrance and exit</option>
                        <option value="fade">Simple fade</option>
                        <option value="none">No animation</option>
                    </select>
                </label>
            </div>
            <p class="hint">Visitors whose device asks for less motion always get a simple fade.</p>
            <label class="check"><input type="checkbox" id="s-aotd-phones"> <span>Also show it on phones</span></label>
            <p class="hint">Each visitor sees it once a day. Everyone gets the same piece and design on the same day.</p>
            <div><button type="button" class="btn" data-action="preview-aotd"><i class="fa-regular fa-eye" aria-hidden="true"></i> Preview today's pop-up</button></div>
        </div>
    </fieldset>

    <fieldset class="group">
        <legend>Search and sharing</legend>
        <div class="form-grid">
            <label class="field"><span>Browser tab title</span><input type="text" id="s-title"></label>
            <label class="field"><span>Description for search engines</span><input type="text" id="s-desc"></label>
        </div>
        <p class="hint">When someone shares a link to your site on Discord, Bluesky, X or in a text message, it shows this title and description with a picture. Browsers show the tab icon next to the title.</p>
        <div class="form-grid">
            <label class="field"><span>Link picture</span>
                <select id="lp-pic"><option value="newest">My newest piece</option><option value="pfp">My profile picture</option><option value="own">A picture I choose</option></select>
            </label>
            <label class="field"><span>Tab icon</span>
                <select id="lp-icon"><option value="pfp">My profile picture</option><option value="pic">Same as the link picture</option><option value="own">A picture I choose</option></select>
            </label>
        </div>
        <div class="field" id="lp-pic-field" hidden>
            <span>Picture for links</span>
            <div class="inline-form">
                <input type="text" id="lp-pic-url" placeholder="img/..." aria-label="Picture for links">
                <button type="button" class="btn small" data-action="pick-image" data-target="lp-pic-url">From posts</button>
                <label class="btn small file-btn"><i class="fa-solid fa-upload" aria-hidden="true"></i> Upload<input type="file" accept="image/*" data-upload-target="lp-pic-url" hidden></label>
            </div>
        </div>
        <div class="field" id="lp-icon-field" hidden>
            <span>Picture for the tab icon <em>(a square one works best)</em></span>
            <div class="inline-form">
                <input type="text" id="lp-icon-url" placeholder="img/..." aria-label="Picture for the tab icon">
                <button type="button" class="btn small" data-action="pick-image" data-target="lp-icon-url">From posts</button>
                <label class="btn small file-btn"><i class="fa-solid fa-upload" aria-hidden="true"></i> Upload<input type="file" accept="image/*" data-upload-target="lp-icon-url" hidden></label>
            </div>
        </div>
        <div class="lp-preview" aria-hidden="true">
            <div class="lp-tab"><img id="lp-tab-icon" alt=""><span id="lp-tab-title"></span><i class="fa-solid fa-xmark"></i></div>
            <div class="lp-card">
                <small id="lp-card-site"></small>
                <strong id="lp-card-title"></strong>
                <span id="lp-card-desc"></span>
                <img id="lp-card-img" alt="">
            </div>
        </div>
        <p class="lp-status" id="lp-status" role="status"></p>
        <label class="check"><input type="checkbox" id="s-feed"> <span>Keep an RSS feed, so people can follow your new posts in a feed reader <em>(feed.xml, updated whenever you save a post)</em></span></label>
        <p class="lp-status" id="feed-status" role="status"></p>
        <div class="row-actions">
            <button class="btn" data-action="lp-update" id="lp-update"><i class="fa-solid fa-paper-plane" aria-hidden="true"></i> Update link preview</button>
            <button class="btn btn-ghost" data-action="lp-download" id="lp-download" hidden><i class="fa-solid fa-download" aria-hidden="true"></i> Download index.html</button>
        </div>
    </fieldset>

    <fieldset class="group">
        <legend>Advanced</legend>
        <div class="field">
            <span>Page background image <em>(optional)</em></span>
            <div class="inline-form">
                <input type="text" id="s-bgimage" placeholder="https://..." aria-label="Background image link">
                <label class="btn file-btn"><i class="fa-solid fa-upload" aria-hidden="true"></i> Upload<input type="file" accept="image/*" data-upload-target="s-bgimage" hidden></label>
            </div>
        </div>
        <label class="check"><input type="checkbox" id="s-webp"> <span>Save uploaded PNG and JPG images as smaller WebP files <em>(saves Neocities space; animated images are left alone)</em></span></label>
        <label class="field"><span>Custom CSS</span><textarea id="s-css" rows="5" class="code" spellcheck="false"></textarea></label>
        <label class="field"><span>New Neocities API key <em>(only if you regenerated it)</em></span><input type="password" id="s-newkey" autocomplete="off" placeholder="Leave empty to keep your current key"></label>
    </fieldset>

    <div class="form-foot sticky-foot">
        <button class="btn btn-primary" data-action="site-save">Save &amp; sync</button>
    </div>
</div>

<!-- Colors & style -->
<div class="dash-panel" data-tab-panel="look" role="tabpanel" hidden>
    <fieldset class="group">
        <legend>Palette</legend>
        <p class="hint">Your site has a dark and a light palette. Visitors switch between them with the sun and moon button. Changes preview live on this page.</p>
        <div class="seg" role="group" aria-label="Palette to edit">
            <button data-action="studio-mode" data-mode="dark" aria-pressed="true"><i class="fa-solid fa-moon" aria-hidden="true"></i> Dark palette</button>
            <button data-action="studio-mode" data-mode="light" aria-pressed="false"><i class="fa-solid fa-sun" aria-hidden="true"></i> Light palette</button>
        </div>
        <div class="swatches" id="studio-swatches"></div>
        <p class="contrast" id="studio-contrast"></p>

        <div class="field">
            <span>Start from a preset</span>
            <div class="presets" id="studio-presets"></div>
        </div>

        <div class="generator">
            <label class="field field-color"><span>Build from one color</span><input type="color" id="gen-base" value="#fb3640"></label>
            <label class="field"><span>Color harmony</span>
                <select id="gen-harmony">
                    <option value="analogous">Analogous: neighbors, calm</option>
                    <option value="complementary">Complementary: opposites, punchy</option>
                    <option value="split">Split complementary: lively but balanced</option>
                    <option value="triadic">Triadic: playful</option>
                    <option value="tetradic">Tetradic: lots of variety</option>
                    <option value="mono">Monochrome: one hue</option>
                </select>
            </label>
            <button class="btn" data-action="studio-generate"><i class="fa-solid fa-wand-magic-sparkles" aria-hidden="true"></i> Generate</button>
        </div>
    </fieldset>

    <fieldset class="group">
        <legend>Reaction buttons</legend>
        <div class="swatches compact">
            <label class="swatch"><input type="color" id="c-like"><span>Like</span></label>
            <label class="swatch"><input type="color" id="c-like-ink"><span>Like text</span></label>
            <label class="swatch"><input type="color" id="c-dislike"><span>Dislike</span></label>
            <label class="swatch"><input type="color" id="c-dislike-ink"><span>Dislike text</span></label>
        </div>
    </fieldset>

    <fieldset class="group">
        <legend>Profile ring</legend>
        <div class="ring-editor">
            <div class="ring ring-preview" id="ring-preview"><span class="ring-fallback" aria-hidden="true">✦</span></div>
            <div class="ring-controls">
                <div class="field">
                    <span>Gradient colors</span>
                    <div class="color-row">
                        <input type="color" id="ring-c1" aria-label="Ring color 1">
                        <input type="color" id="ring-c2" aria-label="Ring color 2">
                        <input type="color" id="ring-c3" aria-label="Ring color 3">
                    </div>
                </div>
                <div class="presets ring-presets" id="ring-presets"></div>
                <div class="form-grid">
                    <label class="field"><span>Direction</span>
                        <select id="ring-dir">
                            <option value="135deg">Diagonal ↘</option>
                            <option value="to right">Horizontal →</option>
                            <option value="to bottom">Vertical ↓</option>
                            <option value="to top right">Diagonal ↗</option>
                            <option value="circle">Radial</option>
                        </select>
                    </label>
                    <label class="field"><span>Thickness <output id="ring-width-out">4px</output></span><input type="range" id="ring-width" min="2" max="12" value="4"></label>
                    <label class="field"><span>Glow <output id="ring-glow-out">8px</output></span><input type="range" id="ring-glow" min="0" max="30" value="8"></label>
                </div>
            </div>
        </div>
    </fieldset>

    <div class="form-foot sticky-foot">
        <span class="unsaved" id="studio-unsaved" hidden>Unsaved color changes</span>
        <button class="btn btn-ghost" data-action="studio-discard">Discard</button>
        <button class="btn btn-primary" data-action="studio-save">Save &amp; sync</button>
    </div>
</div>

<!-- Home page: header, text band and side sliders -->
<div class="dash-panel" data-tab-panel="banner" role="tabpanel" hidden>
    <fieldset class="group">
        <legend>Header panels</legend>
        <div class="seg" role="group" aria-label="Where header images come from">
            <button data-action="banner-mode" data-mode="auto" aria-pressed="true">Latest posts</button>
            <button data-action="banner-mode" data-mode="manual" aria-pressed="false">Pick my own</button>
        </div>
        <label class="field narrow"><span>Number of panels</span>
            <select id="bn-count"><option value="2">2</option><option value="3">3</option><option value="4">4</option></select>
        </label>
        <p class="hint" id="bn-auto-hint">Your newest image posts fill the header automatically.</p>
        <div class="banner-rows" id="bn-manual" hidden></div>
        <p class="hint" id="bn-manual-hint" hidden>Any panel you leave empty uses one of your newest posts.</p>
    </fieldset>

    <fieldset class="group">
        <legend>Scrolling text band</legend>
        <label class="check"><input type="checkbox" id="bn-marquee"> <span>Show a scrolling text band under the header</span></label>
        <div id="bn-marquee-fields" hidden>
            <label class="field"><span>Text, one item per line</span><textarea id="bn-items" rows="4" placeholder="NEW WORK EVERY WEEK&#10;COMMISSIONS OPEN"></textarea></label>
            <div class="form-grid">
                <label class="field"><span>Speed <output id="bn-speed-out">20s per loop</output></span><input type="range" id="bn-speed" min="5" max="60" value="20"></label>
                <label class="field narrow"><span>Separator</span><input type="text" id="bn-sep" maxlength="3" value="✦"></label>
                <label class="field field-color"><span>Band color</span><input type="color" id="bn-bg"></label>
                <label class="field field-color"><span>Text color</span><input type="color" id="bn-fg"></label>
            </div>
        </div>
    </fieldset>

    <fieldset class="group sl-admin">
        <legend>Side sliders</legend>
        <p class="hint">Tall sliders beside Recent works that show one picture at a time and keep moving to the next. Laptops show only the right one, and phones show one sideways under the comics bar.</p>
        <div class="sl-layout">
            <div class="sl-fields">
                <div class="form-grid">
                    <label class="field"><span>Where they sit</span>
                        <select id="sl-where">
                            <option value="both">Both sides</option>
                            <option value="right">Right only</option>
                            <option value="left">Left only</option>
                            <option value="off">Off</option>
                        </select>
                    </label>
                    <label class="field"><span>What they show</span>
                        <select id="sl-show">
                            <option value="random">Random art, a new mix every visit</option>
                            <option value="newest">Newest art</option>
                            <option value="pick">Pieces I pick</option>
                            <option value="comics">Comics</option>
                            <option value="mix">Art, comics and a commissions ad</option>
                            <option value="own">My own images</option>
                        </select>
                    </label>
                    <label class="field"><span>Change every <output id="sl-secs-out">3 seconds</output></span><input type="range" id="sl-secs" min="2" max="10" value="3"></label>
                    <label class="field"><span>Slide direction</span>
                        <select id="sl-dir">
                            <option value="up">Up</option>
                            <option value="down">Down</option>
                        </select>
                    </label>
                </div>
                <div class="field" id="sl-pick-field">
                    <span>Pieces I pick <em id="sl-pick-count"></em></span>
                    <div class="sl-picks" id="sl-picks"></div>
                </div>
                <div class="field" id="sl-own-field">
                    <span>My own images <em>(each can link anywhere)</em></span>
                    <div class="sl-own" id="sl-own"></div>
                    <button type="button" class="btn small" data-action="sl-own-add"><i class="fa-solid fa-plus" aria-hidden="true"></i> Add image</button>
                </div>
            </div>
            <div class="sl-preview">
                <span class="sl-preview-label">Preview</span>
                <div class="ha-rail" id="sl-preview"></div>
            </div>
        </div>
    </fieldset>

    <div class="form-foot sticky-foot">
        <button class="btn btn-primary" data-action="banner-save">Save &amp; sync</button>
    </div>
</div>

<!-- Social links -->
<div class="dash-panel" data-tab-panel="links" role="tabpanel" hidden>
    <fieldset class="group">
        <legend>Social links</legend>
        <p class="hint">These show on your header, About page, Commissions page and footer.</p>
        <div class="links-editor" id="links-editor"></div>
        <button class="btn" data-action="link-add"><i class="fa-solid fa-plus" aria-hidden="true"></i> Add link</button>
    </fieldset>
    <div class="form-foot sticky-foot">
        <button class="btn btn-primary" data-action="links-save">Save &amp; sync</button>
    </div>
</div>
`;

// The windows only Admin opens: add pages to a comic, then clean up and the picture picker
const ADMIN_WINDOWS = [`<div class="overlay modal" id="ap-modal" role="dialog" aria-modal="true" aria-labelledby="ap-heading" hidden>
    <div class="modal-card">
        <div class="modal-head">
            <div>
                <h2 id="ap-heading">Add pages</h2>
                <p class="modal-sub"><span id="ap-title"></span> <span id="ap-count"></span></p>
            </div>
            <button class="icon-btn" data-action="modal-close" aria-label="Close"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
        </div>
        <div class="dropzone small" id="ap-drop" data-input="ap-files" tabindex="0" role="button" aria-label="Choose new pages">
            <p><strong>Choose new pages</strong> or drop them here</p>
            <input type="file" id="ap-files" accept="image/*" multiple hidden>
        </div>
        <p class="hint">New pages go after the last page. Drag to reorder before uploading.</p>
        <div class="page-sorter" id="ap-pages"></div>
        <div class="progress" id="ap-progress" hidden>
            <div class="progress-row"><span id="ap-progress-text">Uploading</span></div>
            <div class="progress-bar"><div class="progress-fill" id="ap-progress-bar"></div></div>
        </div>
        <div class="form-foot">
            <button class="btn btn-ghost" data-action="modal-close">Cancel</button>
            <button class="btn btn-primary" data-action="ap-submit">Upload &amp; add pages</button>
        </div>
    </div>
</div>`, `<div class="overlay modal" id="cleanup-modal" role="dialog" aria-modal="true" aria-labelledby="cleanup-heading" hidden>
    <div class="modal-card">
        <div class="modal-head">
            <h2 id="cleanup-heading">Clean up your data</h2>
            <button class="icon-btn" data-action="modal-close" aria-label="Close"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
        </div>
        <h3 class="mini-head">Storage</h3>
        <div class="bars" id="cleanup-bars"></div>
        <p class="hint" id="cleanup-total"></p>
        <h3 class="mini-head">What we found</h3>
        <div class="issues" id="cleanup-issues"></div>
        <h3 class="mini-head">Tools</h3>
        <div class="tool-grid">
            <button class="btn small" data-action="cleanup" data-fn="trim"><i class="fa-solid fa-scissors" aria-hidden="true"></i> Trim extra spaces</button>
            <button class="btn small" data-action="cleanup" data-fn="dupes"><i class="fa-solid fa-copy" aria-hidden="true"></i> Remove duplicates</button>
            <button class="btn small" data-action="cleanup" data-fn="orphans"><i class="fa-solid fa-ghost" aria-hidden="true"></i> Clear orphaned likes</button>
            <button class="btn small" data-action="cleanup" data-fn="empty"><i class="fa-solid fa-broom" aria-hidden="true"></i> Strip empty fields</button>
            <button class="btn small" data-action="cleanup" data-fn="compact"><i class="fa-solid fa-compress" aria-hidden="true"></i> Compact data</button>
            <button class="btn small" data-action="cleanup" data-fn="base64"><i class="fa-solid fa-image" aria-hidden="true"></i> Strip inline images</button>
            <button class="btn small danger" data-action="cleanup" data-fn="old"><i class="fa-solid fa-calendar-xmark" aria-hidden="true"></i> Delete old posts</button>
            <button class="btn small danger" data-action="cleanup" data-fn="nuke"><i class="fa-solid fa-fire" aria-hidden="true"></i> Erase all likes &amp; comments</button>
        </div>
        <h3 class="mini-head">Shrink images</h3>
        <div class="shrink">
            <p class="hint" id="shrink-info">Makes smaller WebP copies of the PNG and JPG images on your site and switches your posts over to them.</p>
            <div class="progress" id="shrink-progress" hidden>
                <div class="progress-row"><span id="shrink-text">Shrinking</span><span id="shrink-count"></span></div>
                <div class="progress-bar"><div class="progress-fill" id="shrink-bar"></div></div>
            </div>
            <div class="row-actions">
                <button class="btn small" data-action="shrink-start" id="shrink-start"><i class="fa-solid fa-feather" aria-hidden="true"></i> Shrink images to WebP</button>
                <button class="btn small btn-ghost" data-action="shrink-stop" id="shrink-stop" hidden>Stop after this one</button>
            </div>
            <div class="shrink-left" id="shrink-left" hidden>
                <p><strong id="shrink-left-count"></strong> Your posts no longer use these, so delete them in your <a href="https://neocities.org/dashboard" target="_blank" rel="noopener">Neocities dashboard</a> to free up the space.</p>
                <textarea id="shrink-list" class="code" rows="5" readonly aria-label="Old image files to delete"></textarea>
                <div class="row-actions">
                    <button class="btn small" data-action="shrink-copy"><i class="fa-regular fa-copy" aria-hidden="true"></i> Copy list</button>
                    <button class="btn small" data-action="shrink-download"><i class="fa-solid fa-download" aria-hidden="true"></i> Download list</button>
                    <button class="btn small btn-ghost" data-action="shrink-forget">I've deleted them</button>
                </div>
            </div>
        </div>
        <h3 class="mini-head">Small previews</h3>
        <div class="shrink">
            <p class="hint" id="pv-info">Makes small copies of your pictures for cards, boards and sliders, so pages load faster.</p>
            <div class="progress" id="pv-progress" hidden>
                <div class="progress-row"><span id="pv-text">Making previews</span><span id="pv-count"></span></div>
                <div class="progress-bar"><div class="progress-fill" id="pv-bar"></div></div>
            </div>
            <div class="row-actions">
                <button class="btn small" data-action="pv-start" id="pv-start"><i class="fa-solid fa-image" aria-hidden="true"></i> Make small previews</button>
                <button class="btn small btn-ghost" data-action="pv-stop" id="pv-stop" hidden>Stop after this one</button>
            </div>
        </div>
        <h3 class="mini-head">Activity</h3>
        <div class="log" id="cleanup-log"><div class="log-entry dim">Nothing run yet.</div></div>
        <div class="form-foot">
            <button class="btn btn-primary btn-block" data-action="cleanup" data-fn="full">Run all safe cleanups &amp; sync</button>
        </div>
    </div>
</div>

<div class="overlay modal" id="picker-modal" role="dialog" aria-modal="true" aria-labelledby="picker-heading" hidden>
    <div class="modal-card wide">
        <div class="modal-head">
            <h2 id="picker-heading">Choose an image</h2>
            <button class="icon-btn" data-action="modal-close" aria-label="Close"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
        </div>
        <div class="picker-grid" id="picker-grid"></div>
    </div>
</div>`];

function buildDashboard() {
    byId('admin-panel').innerHTML = ADMIN_HTML;
    // index.html marks where each window goes, so the page ends up in the same order as before
    ADMIN_WINDOWS.forEach((html, i) => { byId('admin-window-' + i).outerHTML = html; });

    byId('mp-search').addEventListener('input', debounce(() => renderManagePosts(), 150));
    byId('srf-search').addEventListener('input', debounce(() => renderSeriesPicker(), 150));
    // A newly uploaded or pasted reference picture fills in the character's colors
    byId('chf-img').addEventListener('input', debounce(() => pickCharacterColors(true), 500));

    // Admin form inputs
    document.addEventListener('input', e => {
        const t = e.target;
        if (t.dataset && t.dataset.studioKey) Studio.setKey(t.dataset.studioKey, t.value);
        else if (t.id === 'c-like') Studio.setShared('like', t.value);
        else if (t.id === 'c-like-ink') Studio.setShared('likeBtn', t.value);
        else if (t.id === 'c-dislike') Studio.setShared('dislike', t.value);
        else if (t.id === 'c-dislike-ink') Studio.setShared('dislikeBtn', t.value);
        else if (/^ring-/.test(t.id)) Studio.readRing();
        else if (t.id === 'bn-speed') byId('bn-speed-out').textContent = t.value + 's per loop';
        else if (t.id === 'np-later') syncScheduleField();
        else if (t.id === 's-feed') renderFeedStatus();
        else if (/^lp-|^s-(title|desc|sitename|tagline|pfp)$/.test(t.id)) linkPreviewSoon();
        else if (/^sl-/.test(t.id) || t.closest('.sl-own')) syncSliderForm();
        else if (/^bn-img-\d$/.test(t.id)) { const prev = t.parentElement.querySelector('.prev'); if (prev) prev.style.backgroundImage = 'url("' + safeUrl(t.value).replace(/"/g, '%22') + '")'; }
        else if (t.id === 's-status-color') document.documentElement.style.setProperty('--status', t.value);
        else if (t.id === 'cm-f-tape') syncTapeSample();
        else if (/^(image|color|name)$/.test(t.name) && t.closest('.tier-row')) refreshTierThumb(t.closest('.tier-row'));
    });
    document.addEventListener('change', e => {
        const t = e.target;
        if (t.dataset && t.dataset.uploadTarget) uploadIntoField(t);
        else if (t.id === 'ec-swap-file') editComicSwapPicked(t);
        else if (t.id === 'bn-count' || t.id === 'bn-marquee') syncBannerForm();
        else if (t.id === 'ring-dir') Studio.readRing();
        else if (t.name === 'aotd-mode' && Aotd.draft) { Aotd.draft.mode = t.value; renderAotdTiles(); }
        else if (t.name === 'aotd-art') syncAotdArtFields();
        else if (t.classList && t.classList.contains('aotd-tile-color') && Aotd.draft) { Aotd.draft.colors[t.dataset.id] = t.value; const m = t.closest('.aotd-tile').querySelector('.aotd-mini-wrap'); if (m) m.style.setProperty('--mc', t.value); }
    });

    // Paste images straight into a new post
    byId('np-content').addEventListener('paste', e => {
        const files = Array.from((e.clipboardData && e.clipboardData.files) || []).filter(f => /^image\//.test(f.type));
        if (files.length) { e.preventDefault(); addFilesToQueue(files); showToast('Image added to the post'); }
    });

    wireDropzone(byId('np-drop'), files => addFilesToQueue(files));
    wireDropzone(byId('bulk-drop'), files => setBulkFiles(files));
    wireDropzone(byId('nc-drop'), files => setComicFiles(files, 'nc'));
    wireDropzone(byId('ap-drop'), files => setComicFiles(files, 'ap'));
}
buildDashboard();

window.NEERG_ADMIN = true;
