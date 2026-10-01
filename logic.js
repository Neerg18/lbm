/*
 ╔══════════════════════════════════════════════════════════════════╗
 ║  NEERG v7 · logic.js                                             ║
 ║  Built on the LBM bridge pattern by applesaucy.                  ║
 ║                                                                  ║
 ║  Your content lives in four files on Neocities:                  ║
 ║    system.js        settings, admin hash, secure token           ║
 ║    posts.js         every post                                   ║
 ║    comics.js        every comic                                  ║
 ║    interactions.js  likes, dislikes, comments                    ║
 ║  The formats are the same as NEERG v6, so nothing needs moving.  ║
 ╚══════════════════════════════════════════════════════════════════╝
*/
'use strict';

/* ═════════════════════════════════════════════
   CONSTANTS
   ═════════════════════════════════════════════ */

const NEERG_VERSION = '7.0';
const FIXED_BRIDGE_URL = 'https://applchu.link/lbm/0.4/bridge.html?v=' + Date.now();
const BRIDGE_ORIGIN = new URL(FIXED_BRIDGE_URL).origin;
const IS_LOCAL_FILE = location.protocol === 'file:';

const KEYS = {
    system: 'NEERG_SYSTEM_BACKUP',
    posts: 'NEERG_POSTS_BACKUP',
    comics: 'NEERG_COMICS_BACKUP',
    interactions: 'NEERG_INTERACTIONS_BACKUP',
    reactions: 'NEERG_USER_REACTIONS',
    ops: 'NEERG_PENDING_OPS',
    theme: 'neerg_theme',
    paletteCache: 'neerg_palette_cache',
    age: 'neerg_age_ok',
    commenter: 'neerg_commenter_name',
    banner: 'neerg_banner_settings',
    ring: 'neerg_pfp_ring_style',
    social: 'neerg_social_links',
    bio: 'neerg_about_bio',
    recoveryDismissed: 'neerg_recovery_dismissed',
    comicProgress: 'neerg_comic_progress'
};

const AGE_OK_DAYS = 30;
const FEED_STEP = 12;
const PRESET_TAGS = ['SFW', 'NSFW', 'Sketch', 'Commissions', 'Animation', 'Fanart', 'OC', 'WIP'];
const VIEWS = ['home', 'gallery', 'comics', 'commissions', 'about', 'admin'];

const DEFAULT_DARK = {
    bg: '#000F08', text: '#F0F0F0', sidebar: '#0A1A10', accent: '#FB3640', leaflet: '#0A1A10',
    border: '#1A3322', navActive: '#FB3640', like: '#FB3640', dislike: '#C4182A', likeBtn: '#000F08', dislikeBtn: '#000F08'
};
const DEFAULT_LIGHT = {
    bg: '#F6F4EF', text: '#16130F', sidebar: '#ECE8E1', accent: '#C8102E', leaflet: '#FFFFFF',
    border: '#DCD5CA', navActive: '#16130F'
};

/* Palette order in presets: [bg, text, cards, accent, post bg, borders, highlight] */
const PALETTE_KEYS = ['bg', 'text', 'sidebar', 'accent', 'leaflet', 'border', 'navActive'];
const PALETTE_LABELS = {
    bg: ['Background', 'Behind everything'],
    text: ['Text', 'Body copy and headings'],
    sidebar: ['Panels', 'Cards, menus, info panel'],
    leaflet: ['Fields', 'Inputs and post backs'],
    border: ['Lines', 'Borders and dividers'],
    accent: ['Accent', 'Buttons and links'],
    navActive: ['Highlight', 'Active tab and focus']
};
const DARK_PRESETS = [
    { name: 'Night & Imperial Red', colors: ['#000F08', '#F0F0F0', '#0A1A10', '#FB3640', '#0A1A10', '#1A3322', '#FB3640'] },
    { name: 'Neon Night', colors: ['#0D0D0D', '#F0F0F0', '#1A1A1A', '#FF6B35', '#141414', '#2A2A2A', '#C8FF00'] },
    { name: 'Sakura', colors: ['#1A0A12', '#FCE8F0', '#2A1020', '#FF7EB3', '#200818', '#3A1828', '#FFB3D1'] },
    { name: 'Ocean Deep', colors: ['#050D1A', '#E0F0FF', '#0A1828', '#00D4FF', '#071020', '#102238', '#7A4FFF'] },
    { name: 'Forest', colors: ['#0A1208', '#E8F8E0', '#142010', '#B8FF38', '#0C1A0A', '#1A2C18', '#38FFD4'] },
    { name: 'Grape', colors: ['#0D0A1A', '#EDE8FF', '#1A1530', '#8B5CF6', '#120F22', '#221C3A', '#C084FC'] },
    { name: 'Vintage', colors: ['#1A1408', '#FAF2E0', '#2A2010', '#D4A843', '#221A08', '#342A18', '#E06432'] }
];
const LIGHT_PRESETS = [
    { name: 'Paper & Ink', colors: ['#F6F4EF', '#16130F', '#ECE8E1', '#C8102E', '#FFFFFF', '#DCD5CA', '#16130F'] },
    { name: 'Cream & Fire', colors: ['#F8F4EE', '#1A1410', '#EDE8E0', '#E85D26', '#FFFFFF', '#D8D0C4', '#1A1410'] },
    { name: 'Cotton Candy', colors: ['#FFF0F8', '#2A0A1E', '#FCE0F0', '#D946A8', '#FFFFFF', '#E8C8DC', '#8B1A6A'] },
    { name: 'Sky & Sand', colors: ['#F0F8FF', '#0A1A2E', '#E0F0FA', '#0E7FC0', '#FFFFFF', '#B8D8EE', '#B45309'] },
    { name: 'Mint Garden', colors: ['#F0FDF4', '#0A1E12', '#DCFCE7', '#15803D', '#FFFFFF', '#BBF7D0', '#7C3AED'] },
    { name: 'Lavender Mist', colors: ['#FAF5FF', '#1E0A3E', '#F3E8FF', '#7C3AED', '#FFFFFF', '#DDD6FE', '#5B21B6'] },
    { name: 'Golden Hour', colors: ['#FFFBEB', '#1C0F04', '#FEF3C7', '#B45309', '#FFFFFF', '#FDE68A', '#DC2626'] }
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

// Commissions poster (Admin, Commissions). New tiers take these colors in turn.
const TIER_COLORS = ['#35E04A', '#5B2EE8', '#C04BFF', '#FF6B2C', '#00B8F5', '#FF3D7F'];
const HAZARD_WORDS = ['COMMISSIONS CLOSED', 'CLOSED', 'CHECK BACK SOON'];
const COMM_DEFAULTS = { open: true, title: '', handle: '', contact: '', button: '', tiers: [], terms: '', termsImage: '', tapeWords: [], closedNote: '', paper: '#DFDAD0', ink: '#161616', tape: '#3AA6F2' };
// Hazard tapes all over the page while closed: [kind (y yellow, k black, s stripes), distance down the page in %, tilt in degrees]
const HAZARD_LAYOUT = [['y', 5, -6], ['s', 13, 10], ['k', 21, 3], ['y', 30, -9], ['s', 38, 6], ['k', 46, -4], ['y', 55, 8], ['s', 63, -11], ['k', 71, 4], ['y', 79, -6], ['s', 87, 9], ['k', 94, -3]];
// Comic "POW" burst behind each price: red outline, yellow band, orange glow (viewBox 0 0 220 150)
const BURST_PATH = 'M37 67 61 62 60 51 75 49 74 33 97 44 108 36 120 41 138 32 141 50 183 42 156 64 178 71 164 79 182 89 154 92 156 102 141 104 135 118 115 107 101 114 90 107 68 114 73 97 56 94 55 81Z';
const ARROWS_SVG = '<svg class="cm-arrows" viewBox="0 0 44 18" aria-hidden="true"><path d="M2 16 14 4M5 3h10v10" fill="none" stroke="currentColor" stroke-width="3.4"/><path d="M26 16 38 4M29 3h10v10" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';

const PLATFORM_OPTIONS = ['Twitter/X', 'Instagram', 'Bluesky', 'Tumblr', 'YouTube', 'TikTok', 'DeviantArt', 'Pixiv', 'Twitch', 'Ko-fi', 'Patreon', 'Discord', 'Threads', 'Cara', 'Email', 'Other'];
const PLATFORMS = {
    'twitter': { icon: 'fa-brands fa-x-twitter', color: '#1d9bf0' },
    'x': { icon: 'fa-brands fa-x-twitter', color: '#1d9bf0' },
    'instagram': { icon: 'fa-brands fa-instagram', color: '#e4405f' },
    'bluesky': { icon: 'fa-brands fa-bluesky', color: '#0085ff' },
    'tumblr': { icon: 'fa-brands fa-tumblr', color: '#36465d' },
    'youtube': { icon: 'fa-brands fa-youtube', color: '#ff0000' },
    'tiktok': { icon: 'fa-brands fa-tiktok', color: '#ee1d52' },
    'deviantart': { icon: 'fa-brands fa-deviantart', color: '#05cc47' },
    'pixiv': { icon: 'fa-brands fa-pixiv', color: '#0096fa' },
    'twitch': { icon: 'fa-brands fa-twitch', color: '#9146ff' },
    'ko-fi': { icon: 'fa-solid fa-mug-hot', color: '#ff5e5b' },
    'patreon': { icon: 'fa-brands fa-patreon', color: '#ff424d' },
    'discord': { icon: 'fa-brands fa-discord', color: '#5865f2' },
    'threads': { icon: 'fa-brands fa-threads', color: '#444444' },
    'cara': { icon: 'fa-solid fa-palette', color: '#d33f49' },
    'email': { icon: 'fa-solid fa-envelope', color: '#6b7280' },
    'other': { icon: 'fa-solid fa-link', color: '' }
};

/* ═════════════════════════════════════════════
   STATE
   ═════════════════════════════════════════════ */

let postsCache = [];
let comicsCache = [];
let interactionsCache = {};
let interactionsRemote = {};
let pendingOps = [];
let globalAdminHash = null, globalSalt = null, globalAuthToken = null, globalApiKey = null;
let sessionPassword = null;
let isAdminLoggedIn = false;
let hasRemoteSystem = false;
let dataReady = false;
let legacyPostsInSystem = false, legacyComicsInSystem = false;

let currentConfig = {
    siteName: 'NEERG', metaTitle: 'NEERG // Art Blog', metaDescription: 'Digital art archive by NEERG',
    tagline: 'Digital Art Archive', leafletsName: 'Works', allowComments: true, copyright: '2026 NEERG',
    bgImage: '', bannerImage: '', pfpImage: '', customCss: '', reactionsEnabled: true,
    reactionIcon: 'thumb', likeLabel: '^ NICE', dislikeLabel: 'MEH ^', widgetPadding: '15px',
    socialLinks: [], bannerSettings: null, aboutBio: '',
    commissionStatus: 'AVAILABLE FOR COMMISSIONS', statusColor: '#FB3640',
    commissionsInfo: '', commissionsLink: '',
    ageGate: true, featuredMode: 'recent', blurNsfw: false,
    colors: { ...DEFAULT_DARK },
    lightColors: null,
    pfpRingStyle: null
};

const ui = {
    view: null,
    feed: { tag: 'all', q: '', sort: 'newest', limit: FEED_STEP, cols: 1 },
    gallery: { mode: 'boards', board: null },
    revealed: new Set(),
    post: { id: null, img: 0, list: [], pushed: false },
    viewer: { list: [], i: 0 },
    comic: { id: null, pushed: false },
    reader: { id: null, page: 0 },
    featured: { i: 0, timer: null, stops: 0 },
    lastCommentAt: 0
};

/* ═════════════════════════════════════════════
   SMALL HELPERS
   ═════════════════════════════════════════════ */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const byId = id => document.getElementById(id);
const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
const esc = escapeHtml;

function safeUrl(url) {
    const u = String(url || '').trim();
    if (!u) return '';
    if (/^\s*(javascript|vbscript):/i.test(u)) return '';
    if (/^data:/i.test(u) && !/^data:(image|video|audio)\//i.test(u)) return '';
    return u;
}

function unicodeToBase64(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (m, p1) => String.fromCharCode(parseInt(p1, 16))));
}
function base64ToUnicode(str) {
    return decodeURIComponent(atob(str).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
}
async function sha256(message) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(message));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}
function downloadFile(content, name) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
    a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
function readJSON(key, fallback) {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch (e) { return fallback; }
}
function writeJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (e) { return false; }
}
function clone(obj) { return JSON.parse(JSON.stringify(obj)); }
function debounce(fn, ms) { let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); }; }
function clamp(n, min, max) { return Math.min(max, Math.max(min, n)); }
function plural(n, word, many) { return n + ' ' + (n === 1 ? word : (many || word + 's')); }
function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

function getMediaType(url) {
    if (!url) return 'none';
    const u = String(url).split('?')[0].toLowerCase();
    if (/^data:video/.test(u) || /\.(mp4|webm|mov|m4v)$/.test(u)) return 'video';
    if (/^data:audio/.test(u) || /\.(mp3|wav|ogg|m4a|flac|aac)$/.test(u)) return 'audio';
    return 'image';
}
function mediaList(post) {
    if (!post || !post.media) return [];
    return (Array.isArray(post.media) ? post.media : [post.media]).filter(Boolean);
}
function firstImage(post) { return mediaList(post).find(u => getMediaType(u) === 'image') || ''; }
function postTags(post) {
    if (!post || !post.tags) return [];
    return (Array.isArray(post.tags) ? post.tags : String(post.tags).split(',')).map(t => String(t).trim()).filter(Boolean);
}
function isNsfw(post) { return postTags(post).some(t => t.toLowerCase() === 'nsfw'); }
function isVeiled(post) { return !!currentConfig.blurNsfw && isNsfw(post) && !ui.revealed.has(post.id); }

function formatDate(post) {
    const id = Number(post && post.id);
    if (id > 1e12) {
        try { return new Date(id).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }); } catch (e) {}
    }
    return (post && post.date) || '';
}
function formatTime(ts) {
    try { return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }); } catch (e) { return ''; }
}

function md(text) {
    if (!text) return '';
    if (window.marked) { try { return window.marked.parse(String(text)); } catch (e) {} }
    return '<p>' + esc(text).replace(/\n{2,}/g, '</p><p>').replace(/\n/g, '<br>') + '</p>';
}
function plainText(text) {
    return String(text || '')
        .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
        .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
        .replace(/<[^>]+>/g, '')
        .replace(/[*_`~#>]+/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}
function excerpt(text, len) {
    const t = plainText(text);
    return t.length > len ? t.slice(0, len - 1).replace(/\s+\S*$/, '') + '…' : t;
}

/* Uploads get a random name like "k7q2m9x4b1zt8w3a.png" so the original file name never shows up on your site */
const MIME_EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif', 'image/webp': 'webp', 'image/avif': 'avif', 'image/svg+xml': 'svg', 'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov', 'audio/mpeg': 'mp3', 'audio/wav': 'wav', 'audio/ogg': 'ogg' };
function safeFileName(name, type) {
    const n = String(name || '');
    const dot = n.lastIndexOf('.');
    let ext = dot > 0 ? n.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, '') : '';
    if (!ext || ext.length > 5) ext = MIME_EXT[type] || 'png';
    if (ext === 'jpeg') ext = 'jpg';
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    let id = '';
    for (let i = 0; i < bytes.length; i++) id += chars[bytes[i] % chars.length];
    return id + '.' + ext;
}

function hexToRgb(hex) {
    let h = String(hex || '').replace('#', '').trim();
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    if (!/^[0-9a-f]{6}$/i.test(h)) return { r: 0, g: 0, b: 0 };
    return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
}
function rgba(hex, a) { const { r, g, b } = hexToRgb(hex); return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')'; }
function luminance(hex) {
    const { r, g, b } = hexToRgb(hex);
    const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function contrastRatio(a, b) { const x = luminance(a), y = luminance(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
function inkFor(hex) { return contrastRatio(hex, '#000000') >= contrastRatio(hex, '#FFFFFF') ? '#000000' : '#FFFFFF'; }
function normalizeHex(hex, fallback) {
    let h = String(hex || '').trim();
    if (/^#[0-9a-f]{3}$/i.test(h)) h = '#' + h.slice(1).split('').map(c => c + c).join('');
    return /^#[0-9a-f]{6}$/i.test(h) ? h.toUpperCase() : (fallback || '#000000');
}
function hexToHsl(hex) {
    let { r, g, b } = hexToRgb(hex); r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0; const l = (max + min) / 2;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
        else if (max === g) h = (b - r) / d + 2;
        else h = (r - g) / d + 4;
        h *= 60;
    }
    return [h, s * 100, l * 100];
}
function hslToHex(h, s, l) {
    h = ((h % 360) + 360) % 360; s = clamp(s, 0, 100) / 100; l = clamp(l, 0, 100) / 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return '#' + [f(0), f(8), f(4)].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
}

/* ═════════════════════════════════════════════
   TOASTS
   ═════════════════════════════════════════════ */

let currentLoadingToast = null;
function showToast(msg, type = 'success') {
    const box = byId('toasts'); if (!box) return null;
    const t = document.createElement('div');
    t.className = 'toast' + (type === 'error' ? ' is-error' : '');
    const icon = type === 'error' ? 'fa-circle-exclamation' : type === 'loading' ? 'fa-circle-notch spin' : type === 'info' ? 'fa-circle-info' : 'fa-circle-check';
    t.innerHTML = '<i class="fa-solid ' + icon + '" aria-hidden="true"></i><span></span>';
    t.querySelector('span').textContent = msg;
    box.appendChild(t);
    while (box.children.length > 3) box.firstElementChild.remove();
    if (type === 'loading') { currentLoadingToast = t; }
    else setTimeout(() => dismissToast(t), type === 'error' ? 5200 : 3000);
    return t;
}
function dismissToast(t) {
    if (!t || !t.parentNode) return;
    t.classList.add('is-leaving');
    setTimeout(() => t.remove(), 300);
    if (t === currentLoadingToast) currentLoadingToast = null;
}

/* ═════════════════════════════════════════════
   MODALS (focus handling, Esc, scroll lock)
   ═════════════════════════════════════════════ */

const Modals = {
    stack: [],
    isOpen(el) { return this.stack.some(m => m.el === el); },
    top() { return this.stack[this.stack.length - 1] || null; },
    open(el, opts = {}) {
        if (!el) return;
        if (this.isOpen(el)) return;
        const entry = { el, onRequestClose: opts.onRequestClose || (() => this.close(el)), restore: document.activeElement };
        this.stack.push(entry);
        el.hidden = false;
        document.documentElement.classList.add('is-locked');
        requestAnimationFrame(() => el.classList.add('is-open'));
        if (opts.focus !== false) {
            setTimeout(() => {
                const target = (opts.focus && el.querySelector(opts.focus)) || el.querySelector('[autofocus]') || el.querySelector('button, [href], input, select, textarea');
                if (target) target.focus({ preventScroll: true });
            }, 30);
        }
    },
    close(el) {
        const idx = this.stack.findIndex(m => m.el === el);
        if (idx === -1) return;
        const [entry] = this.stack.splice(idx, 1);
        el.classList.remove('is-open');
        const done = () => { if (!this.isOpen(el)) el.hidden = true; };
        if (reduceMotion()) done(); else setTimeout(done, 220);
        if (!this.stack.length && !byId('mobile-menu').classList.contains('is-open')) document.documentElement.classList.remove('is-locked');
        if (entry.restore && entry.restore.focus && document.contains(entry.restore)) entry.restore.focus({ preventScroll: true });
    },
    requestCloseTop() {
        const top = this.top();
        if (top) { top.onRequestClose(); return true; }
        return false;
    },
    trapTab(e) {
        const top = this.top(); if (!top) return;
        const items = $$('button:not([disabled]), [href], input:not([type="hidden"]):not([hidden]), select, textarea, [tabindex]:not([tabindex="-1"])', top.el)
            .filter(n => n.offsetParent !== null || n === document.activeElement);
        if (!items.length) return;
        const first = items[0], last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        else if (!top.el.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    }
};

/* ═════════════════════════════════════════════
   THEME
   ═════════════════════════════════════════════ */

function getMode() { return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark'; }

function paletteFor(mode, cfg = currentConfig) {
    const shared = { ...DEFAULT_DARK, ...(cfg.colors || {}) };
    const base = mode === 'light' ? { ...DEFAULT_LIGHT, ...(cfg.lightColors || {}) } : { ...shared };
    ['like', 'dislike', 'likeBtn', 'dislikeBtn'].forEach(k => { if (!base[k]) base[k] = shared[k]; });
    PALETTE_KEYS.concat(['like', 'dislike', 'likeBtn', 'dislikeBtn']).forEach(k => {
        base[k] = normalizeHex(base[k], (mode === 'light' ? DEFAULT_LIGHT[k] : DEFAULT_DARK[k]) || DEFAULT_DARK[k]);
    });
    return base;
}

function paletteVars(p) {
    return {
        '--bg': p.bg, '--text': p.text, '--surface': p.sidebar, '--post-bg': p.leaflet, '--line': p.border,
        '--accent': p.accent, '--hl': p.navActive, '--like': p.like, '--dislike': p.dislike,
        '--like-ink': p.likeBtn || inkFor(p.like), '--dislike-ink': p.dislikeBtn || inkFor(p.dislike),
        '--accent-ink': inkFor(p.accent), '--hl-ink': inkFor(p.navActive),
        '--status': normalizeHex(currentConfig.statusColor, p.accent)
    };
}

function applyPalette(p) {
    const root = document.documentElement;
    const vars = paletteVars(p);
    Object.keys(vars).forEach(k => root.style.setProperty(k, vars[k]));
    const meta = $('meta[name="theme-color"]'); if (meta) meta.setAttribute('content', p.bg);
    return vars;
}

function applyTheme() {
    const mode = getMode();
    const draft = Studio.dirty && Studio.draft ? Studio.draft[mode] : null;
    applyPalette(draft || paletteFor(mode));
    if (!draft) writeJSON(KEYS.paletteCache, { dark: paletteVars(paletteFor('dark')), light: paletteVars(paletteFor('light')) });
    document.body.classList.toggle('light-mode', mode === 'light');
    const next = mode === 'light' ? 'dark' : 'light';
    const btn = byId('theme-btn');
    if (btn) {
        btn.innerHTML = '<i class="fa-solid ' + (mode === 'light' ? 'fa-moon' : 'fa-sun') + '" aria-hidden="true"></i>';
        btn.setAttribute('aria-label', 'Switch to ' + next + ' mode');
    }
    $$('.theme-label').forEach(n => { n.textContent = next === 'light' ? 'Light mode' : 'Dark mode'; });
}

function setMode(mode) {
    document.documentElement.setAttribute('data-theme', mode);
    try { localStorage.setItem(KEYS.theme, mode); } catch (e) {}
    applyTheme();
}
function toggleDarkLight() { setMode(getMode() === 'light' ? 'dark' : 'light'); }

function applyRingStyle(style) {
    const root = document.documentElement;
    if (!style || !style.gradient) {
        ['--ring-gradient', '--ring-width', '--ring-glow', '--ring-glow-color'].forEach(k => root.style.removeProperty(k));
        return;
    }
    root.style.setProperty('--ring-gradient', style.gradient);
    root.style.setProperty('--ring-width', (Number(style.thickness) || 4) + 'px');
    root.style.setProperty('--ring-glow', (style.glowSize != null ? Number(style.glowSize) : 8) + 'px');
    root.style.setProperty('--ring-glow-color', rgba(style.c2 || '#b8ff38', 0.4));
}
function buildRingGradient(c1, c2, c3, dir) {
    return dir === 'circle' ? 'radial-gradient(circle, ' + c1 + ', ' + c2 + ', ' + c3 + ')' : 'linear-gradient(' + dir + ', ' + c1 + ', ' + c2 + ', ' + c3 + ')';
}

/* ═════════════════════════════════════════════
   APPLY SITE SETTINGS TO THE PAGE
   ═════════════════════════════════════════════ */

function bannerSettings() {
    let s = currentConfig.bannerSettings;
    if (!s) s = readJSON(KEYS.banner, null);
    return Object.assign({ bannerMode: 'auto', bannerImages: ['', '', '', ''], panelCount: 4, text: '', items: [], speed: 20, bgColor: '', textColor: '', separator: '✦', visible: false }, s || {});
}

function commPage() { return Object.assign({}, COMM_DEFAULTS, currentConfig.commPage || {}); }

function siteName() { return currentConfig.siteName || 'NEERG'; }

function applyVisualConfig() {
    const cfg = currentConfig;
    const name = siteName();
    document.title = cfg.metaTitle || name;
    const md_ = $('meta[name="description"]'); if (md_ && cfg.metaDescription) md_.setAttribute('content', cfg.metaDescription);

    ['brand-name', 'hero-name', 'about-name', 'footer-name'].forEach(id => { const n = byId(id); if (n) n.textContent = name; });
    const mm = byId('mobile-menu-name'); if (mm) mm.textContent = name;
    ['hero-fallback', 'about-fallback'].forEach(id => { const n = byId(id); if (n) n.textContent = name.trim().charAt(0).toUpperCase() || '✦'; });
    ['hero-tagline', 'about-tagline'].forEach(id => { const n = byId(id); if (n) { n.textContent = cfg.tagline || ''; n.hidden = !cfg.tagline; } });
    const fc = byId('footer-copy'); if (fc) fc.textContent = cfg.copyright ? '© ' + cfg.copyright : '';
    const ft = byId('feed-title'); if (ft) ft.textContent = 'Recent ' + (cfg.leafletsName || 'works').toLowerCase();

    // Profile picture everywhere
    const pfp = safeUrl(cfg.pfpImage && cfg.pfpImage.length > 4 ? cfg.pfpImage : '');
    [['brand-pfp', null], ['hero-pfp', 'hero-fallback'], ['about-pfp', 'about-fallback']].forEach(([imgId, fbId]) => {
        const img = byId(imgId); if (!img) return;
        const fb = fbId ? byId(fbId) : null;
        if (pfp) {
            img.onerror = () => { img.hidden = true; if (fb) fb.hidden = false; };
            img.src = pfp; img.hidden = false; if (fb) fb.hidden = true;
        } else { img.hidden = true; img.removeAttribute('src'); if (fb) fb.hidden = false; }
    });

    // About + commissions
    const bio = cfg.aboutBio || readJSON(KEYS.bio, null) || localStorage.getItem(KEYS.bio) || '';
    const bioEl = byId('about-bio'); if (bioEl) bioEl.innerHTML = bio ? md(bio) : '<p>' + esc(name) + ' hasn\'t written a bio yet.</p>';
    renderCommissions();

    // Colors, ring, background, custom CSS
    applyTheme();
    let ring = cfg.pfpRingStyle || readJSON(KEYS.ring, null);
    applyRingStyle(ring);
    const bgi = safeUrl(cfg.bgImage && cfg.bgImage.length > 5 ? cfg.bgImage : '');
    document.documentElement.style.setProperty('--bg-image', bgi ? 'url("' + bgi.replace(/"/g, '%22') + '")' : 'none');
    let cs = byId('custom-css-block');
    if (!cs) { cs = document.createElement('style'); cs.id = 'custom-css-block'; document.head.appendChild(cs); }
    cs.textContent = cfg.customCss || '';

    renderSocialLinks();
    renderStatus();
    renderMarquee();
    if (dataReady) renderHero();
}

function renderStatus() {
    const text = (currentConfig.commissionStatus || '').trim();
    const pill = byId('hero-status');
    if (pill) { pill.hidden = !text; byId('hero-status-text').textContent = text; }
    document.documentElement.style.setProperty('--status', normalizeHex(currentConfig.statusColor, paletteFor(getMode()).accent));
}

function renderCommissions() {
    const root = byId('cm'); if (!root) return;
    const cp = commPage();
    const closed = cp.open === false;
    root.classList.toggle('is-closed', closed);
    root.style.setProperty('--cm-paper', normalizeHex(cp.paper, COMM_DEFAULTS.paper));
    root.style.setProperty('--cm-ink', normalizeHex(cp.ink, COMM_DEFAULTS.ink));
    root.style.setProperty('--cm-tape', normalizeHex(cp.tape, COMM_DEFAULTS.tape));

    const title = String(cp.title || '').trim() || 'Commissions';
    const h = byId('cm-title');
    h.textContent = title;
    h.style.setProperty('--chars', Math.max(title.length, 7));

    const text = (currentConfig.commissionStatus || '').trim();
    byId('comm-status').hidden = !text;
    byId('comm-status-text').textContent = text;
    const link = safeUrl(currentConfig.commissionsLink);
    const req = byId('comm-request');
    req.hidden = closed || !link;
    if (link) req.href = link;
    req.textContent = String(cp.button || '').trim() || 'Request a commission';
    byId('comm-closed').hidden = !closed;
    const note = byId('cm-closed-note');
    note.hidden = !(closed && cp.closedNote);
    note.textContent = cp.closedNote || '';

    const handle = String(cp.handle || '').trim() || siteName();
    byId('cm-band-tl').innerHTML = bandHTML(handle, cp.contact);
    byId('cm-band-br').innerHTML = bandHTML(handle, cp.contact);

    // Tier cards. With no tiers yet, older free-form commission info (or a placeholder) takes their place.
    const info = (currentConfig.commissionsInfo || '').trim();
    const tiers = (cp.tiers || []).filter(t => t && (t.name || t.price || t.image || t.notes));
    galleryLists.tiers = [];
    byId('cm-tiers').innerHTML = tiers.length
        ? tiers.map((t, i) => tierCardHTML(t, i)).join('')
        : info ? '<div class="cm-note prose">' + md(info) + '</div>'
        : '<div class="cm-empty"><h2>Details coming soon</h2><p>Prices and examples will be posted here.</p></div>';
    const extra = byId('comm-info');
    extra.hidden = !(tiers.length && info);
    extra.innerHTML = tiers.length && info ? md(info) : '';

    const hz = byId('cm-hazard');
    hz.hidden = !closed;
    hz.innerHTML = closed ? hazardHTML(cp.tapeWords) : '';
    hz.classList.toggle('is-in', closed);

    const terms = String(cp.terms || '').trim();
    byId('cm-terms').hidden = !terms;
    byId('cm-terms-text').innerHTML = terms ? md(terms) : '';
    const pic = safeUrl(cp.termsImage || currentConfig.pfpImage || '');
    const pi = byId('cm-terms-pic');
    if (pic) { pi.onerror = () => { pi.hidden = true; }; pi.src = pic; pi.hidden = false; }
    else { pi.hidden = true; pi.removeAttribute('src'); }
}

// The blue tape across each corner: your name repeated, with the contact line in the middle
function bandHTML(handle, contact) {
    const run = Array.from({ length: 12 }, () => '<span>' + esc(handle) + '<b></b><b></b></span>').join('');
    const chevs = '<i class="cm-chev"></i><i class="cm-chev"></i><i class="cm-chev"></i>';
    const c = String(contact || '').trim();
    return '<span class="cm-band-run l">' + run + '</span>'
        + '<span class="cm-band-mid">' + chevs + (c ? '<span>' + esc(c) + '</span>' + chevs : '') + '</span>'
        + '<span class="cm-band-run">' + run + '</span>';
}

function tierCardHTML(t, i) {
    const color = normalizeHex(t.color, TIER_COLORS[i % TIER_COLORS.length]);
    const name = String(t.name || '').trim() || 'Tier ' + (i + 1);
    const price = String(t.price || '').trim();
    const img = safeUrl(t.image);
    const notes = String(t.notes || '').trim();
    let art;
    if (img) {
        galleryLists.tiers.push({ url: img, type: 'image', postId: null });
        art = '<button type="button" class="cm-art" data-action="open-viewer" data-list="tiers" data-index="' + (galleryLists.tiers.length - 1) + '" aria-label="See the ' + esc(name) + ' example full size">'
            + '<img src="' + esc(img) + '" alt="" loading="lazy" decoding="async"></button>';
    } else {
        art = '<div class="cm-art is-empty" aria-hidden="true"><span>' + esc(name.charAt(0).toUpperCase()) + '</span></div>';
    }
    return '<article class="cm-tier' + (img && t.pop ? ' is-pop' : '') + '" style="--tc:' + color + ';--chars:' + Math.max(name.length, 4) + '">'
        + ARROWS_SVG
        + '<div class="cm-frame"><h2 class="cm-name"><span>' + esc(name) + '</span></h2>' + art + '</div>'
        + '<span class="cm-ticks" aria-hidden="true"></span>'
        + (notes ? '<div class="cm-info"><span class="cm-bang" aria-hidden="true">!</span><div class="cm-notes">' + md(notes) + '</div></div>' : '')
        + (price ? '<p class="cm-price" style="--pc:' + Math.max(price.length, 3) + '">' + burstSVG('cm-burst-' + i) + '<span class="sr-only">Price: </span><span class="cm-price-text">' + esc(price) + '</span></p>' : '')
        + '</article>';
}

function burstSVG(id) {
    return '<svg class="cm-burst" viewBox="0 0 220 150" aria-hidden="true"><defs><radialGradient id="' + id + '" cx="50%" cy="50%" r="55%"><stop offset="0" stop-color="#FFE34A"/><stop offset=".5" stop-color="#FF9B30"/><stop offset="1" stop-color="#EE3F2A"/></radialGradient></defs>'
        + '<path d="' + BURST_PATH + '" fill="#C3141B" stroke="#C3141B" stroke-width="22" stroke-linejoin="miter" stroke-miterlimit="12"/>'
        + '<path d="' + BURST_PATH + '" fill="#FFE21C" stroke="#FFE21C" stroke-width="16" stroke-linejoin="miter" stroke-miterlimit="12"/>'
        + '<path d="' + BURST_PATH + '" fill="url(#' + id + ')" stroke="#D9351E" stroke-width="2"/></svg>';
}

function hazardHTML(words) {
    const list = words && words.length ? words : HAZARD_WORDS;
    let w = 0;
    return HAZARD_LAYOUT.map(([kind, top, tilt], i) => {
        const style = ' style="--t:' + top + '%;--r:' + tilt + 'deg;--d:' + i + '"';
        if (kind === 's') return '<div class="hz s"' + style + '></div>';
        const word = '<span>' + esc(list[w++ % list.length]) + '</span>';
        return '<div class="hz ' + kind + '"' + style + '><div class="hz-run">' + word.repeat(18) + '</div></div>';
    }).join('');
}

// Slap the tape on again each time someone opens the page
function replayTapes() {
    const hz = byId('cm-hazard'); if (!hz || hz.hidden) return;
    hz.classList.remove('is-in'); void hz.offsetWidth; hz.classList.add('is-in');
}

function normalizePlatform(p) {
    const k = String(p || '').toLowerCase().replace('twitter/x', 'twitter').replace(/[^a-z-]/g, '');
    return PLATFORMS[k] ? k : 'other';
}
function socialLinks() {
    let links = currentConfig.socialLinks || [];
    if (!links.length) links = readJSON(KEYS.social, []) || [];
    return links.filter(l => l && safeUrl(l.url));
}
function renderSocialLinks() {
    const links = socialLinks();
    const icons = links.map(l => {
        const key = normalizePlatform(l.platform);
        const label = l.label || l.platform || 'Link';
        return '<a href="' + esc(safeUrl(l.url)) + '" target="_blank" rel="noopener me" aria-label="' + esc(label) + '" title="' + esc(label) + '"><i class="' + PLATFORMS[key].icon + '" aria-hidden="true"></i></a>';
    });
    const hero = byId('hero-social'); if (hero) hero.innerHTML = icons.slice(0, 5).join('');
    ['menu-social', 'footer-social'].forEach(id => { const n = byId(id); if (n) n.innerHTML = icons.join(''); });
    const pills = links.map(l => {
        const key = normalizePlatform(l.platform);
        const brand = PLATFORMS[key].color;
        return '<a class="link-pill" href="' + esc(safeUrl(l.url)) + '" target="_blank" rel="noopener me"' + (brand ? ' style="--brand:' + brand + '"' : '') + '><i class="' + PLATFORMS[key].icon + '" aria-hidden="true"></i>' + esc(l.label || l.platform) + '</a>';
    }).join('');
    const about = byId('about-links'); if (about) about.innerHTML = pills;
    const contact = byId('comm-contact');
    if (contact) contact.innerHTML = links.length ? '<p>Questions? Reach out on</p><div class="link-list" style="margin-top:0">' + pills + '</div>' : '';
}

function renderMarquee() {
    const s = bannerSettings();
    const box = byId('marquee'), track = byId('marquee-track');
    if (!box || !track) return;
    const items = (s.items && s.items.length ? s.items : String(s.text || '').split('\n')).map(t => String(t).trim()).filter(Boolean);
    if (!s.visible || !items.length) { box.hidden = true; return; }
    box.hidden = false;
    if (s.bgColor) box.style.setProperty('--band', s.bgColor); else box.style.removeProperty('--band');
    if (s.textColor) box.style.setProperty('--band-ink', s.textColor); else box.style.removeProperty('--band-ink');
    box.style.setProperty('--speed', (Number(s.speed) || 20) + 's');
    const sep = s.separator || '✦';
    let run = '';
    for (let i = 0; i < 4; i++) run += items.map(t => '<span data-sep="' + esc(sep) + '">' + esc(t.toUpperCase()) + '</span>').join('');
    track.innerHTML = run + run;
}

/* ═════════════════════════════════════════════
   LOADING YOUR DATA
   ═════════════════════════════════════════════ */

function loadScript(src) {
    return new Promise(resolve => {
        const s = document.createElement('script');
        s.src = src + '?v=' + Date.now();
        s.onload = () => resolve(true);
        s.onerror = () => resolve(false);
        document.head.appendChild(s);
    });
}

function decodeGlobal(name) {
    if (typeof window[name] === 'undefined') return undefined;
    try { return JSON.parse(base64ToUnicode(window[name])); }
    catch (e) { console.error('[NEERG] Could not read ' + name, e); return null; }
}

function mergeConfig(siteConfig) {
    if (!siteConfig) return;
    currentConfig = { ...currentConfig, ...siteConfig, colors: { ...DEFAULT_DARK, ...(siteConfig.colors || {}) } };
    // Older saves kept a few things only in this browser; pull them in if the site file lacks them
    if (!currentConfig.socialLinks || !currentConfig.socialLinks.length) { const l = readJSON(KEYS.social, null); if (Array.isArray(l) && l.length) currentConfig.socialLinks = l; }
    if (!currentConfig.bannerSettings) { const b = readJSON(KEYS.banner, null); if (b) currentConfig.bannerSettings = b; }
    if (!currentConfig.pfpRingStyle) { const r = readJSON(KEYS.ring, null); if (r) currentConfig.pfpRingStyle = r; }
    const ri = String(currentConfig.reactionIcon || 'thumb');
    currentConfig.reactionIcon = /^thumb/.test(ri) ? 'thumb' : /^arrow/.test(ri) ? 'arrow' : 'faces';
}

function parseSystemData() {
    const system = decodeGlobal('AZUMINT_SYSTEM');
    hasRemoteSystem = !!system;
    let sys = system;
    if (!sys && IS_LOCAL_FILE) {
        const local = readJSON(KEYS.system, null);
        if (local && local.adminHash) sys = local;
    }
    if (sys) {
        globalAdminHash = sys.adminHash || null;
        globalSalt = sys.salt || null;
        globalAuthToken = sys.authToken || null;
        globalApiKey = sys.apiKey || null;
        mergeConfig(sys.siteConfig);
    }

    const posts = decodeGlobal('AZUMINT_POSTS');
    if (Array.isArray(posts)) postsCache = posts;
    else if (sys && Array.isArray(sys.posts) && sys.posts.length) { postsCache = sys.posts; legacyPostsInSystem = true; }
    else if (IS_LOCAL_FILE) postsCache = readJSON(KEYS.posts, []) || [];

    const comics = decodeGlobal('AZUMINT_COMICS');
    if (Array.isArray(comics)) comicsCache = comics;
    else if (sys && Array.isArray(sys.comics) && sys.comics.length) { comicsCache = sys.comics; legacyComicsInSystem = true; }
    else if (IS_LOCAL_FILE) comicsCache = readJSON(KEYS.comics, []) || [];

    const inter = decodeGlobal('AZUMINT_INTERACTIONS');
    interactionsRemote = (inter && typeof inter === 'object') ? inter : (IS_LOCAL_FILE ? (readJSON(KEYS.interactions, {}) || {}) : {});
    pendingOps = readJSON(KEYS.ops, []) || [];
    rebuildInteractions();

    postsCache = postsCache.filter(p => p && p.id != null);
    comicsCache = comicsCache.filter(c => c && c.id != null);
    return !!sys;
}

/* ═════════════════════════════════════════════
   ROUTING (#/gallery, #/post/123, #/comics/5/2)
   ═════════════════════════════════════════════ */

function viewHash(view) { return view === 'home' || !view ? '#/' : '#/' + view; }

function parseHash() {
    const raw = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
    const r = { view: 'home', post: null, comic: null, page: null };
    if (/^\d+$/.test(raw)) { r.view = null; r.post = Number(raw); return r; }
    const parts = raw.split('/').filter(Boolean);
    if (!parts.length) return r;
    if (parts[0] === 'post' && parts[1]) { r.view = null; r.post = Number(parts[1]); return r; }
    if (parts[0] === 'comics') {
        r.view = 'comics';
        if (parts[1]) r.comic = Number(parts[1]);
        if (parts[2]) r.page = Math.max(0, Number(parts[2]) - 1);
        return r;
    }
    if (VIEWS.includes(parts[0])) r.view = parts[0];
    return r;
}

function setHash(hash, replace) {
    if (location.hash === hash || (hash === '#/' && !location.hash)) return;
    if (replace) history.replaceState(null, '', hash);
    else history.pushState(null, '', hash);
}

function route() {
    if (!dataReady) return;
    const r = parseHash();
    if (r.post != null) {
        if (!ui.view) showView('home');
        if (Modals.isOpen(byId('comic-overlay'))) closeComicGallery(true);
        openPost(r.post, 0, { fromRoute: true });
        return;
    }
    if (ui.post.id != null) closePost(true);
    if (Modals.isOpen(byId('viewer'))) closeViewer();
    showView(r.view);
    if (r.view === 'comics' && r.comic) {
        openComicGallery(r.comic, { fromRoute: true });
        if (r.page != null) openReader(r.comic, r.page, { fromRoute: true });
        else if (ui.reader.id != null) closeReader(true);
    } else {
        if (ui.reader.id != null) closeReader(true);
        if (ui.comic.id != null) closeComicGallery(true);
    }
}

function showView(view) {
    if (!VIEWS.includes(view)) view = 'home';
    closeMobileMenu();
    if (ui.view === view) return;
    const leaving = ui.view;
    ui.view = view;
    $$('.view').forEach(sec => { sec.hidden = sec.dataset.view !== view; });
    $$('[data-view-link]').forEach(a => {
        if (a.dataset.viewLink === view) a.setAttribute('aria-current', 'page');
        else a.removeAttribute('aria-current');
    });
    updateNavPill();
    window.scrollTo(0, 0);
    updateScrollState();

    if (leaving === 'admin' && Studio.dirty) applyTheme();
    if (view === 'home') { fitHome(); startFeatured(); } else stopFeatured();
    if (view === 'gallery') renderGallery();
    if (view === 'comics') renderComics();
    if (view === 'commissions') replayTapes();
    if (view === 'admin') renderAdminView();
}

function updateNavPill() {
    const nav = byId('mainnav'), pill = byId('mainnav-pill');
    if (!nav || !pill) return;
    const active = $('a[aria-current="page"]', nav);
    if (!active || nav.offsetParent === null) { pill.style.opacity = '0'; return; }
    pill.style.opacity = '1';
    pill.style.width = active.offsetWidth + 'px';
    pill.style.transform = 'translateX(' + active.offsetLeft + 'px)';
}

function openMobileMenu() {
    const m = byId('mobile-menu');
    m.classList.add('is-open'); m.setAttribute('aria-hidden', 'false');
    byId('menu-btn').setAttribute('aria-expanded', 'true');
    document.documentElement.classList.add('is-locked');
    setTimeout(() => { const c = $('[data-action="close-menu"]', m); if (c) c.focus(); }, 60);
}
function closeMobileMenu() {
    const m = byId('mobile-menu');
    if (!m || !m.classList.contains('is-open')) return;
    m.classList.remove('is-open'); m.setAttribute('aria-hidden', 'true');
    byId('menu-btn').setAttribute('aria-expanded', 'false');
    if (!Modals.stack.length) document.documentElement.classList.remove('is-locked');
}

let scrollTicking = false;
function updateScrollState() {
    const y = window.scrollY;
    const hero = byId('hero-strip');
    const overHero = ui.view === 'home' && hero && y < hero.offsetHeight - 70;
    document.documentElement.classList.toggle('is-over-hero', !!overHero);
    const top = byId('to-top'); if (top) top.classList.toggle('is-visible', y > 700);
    scrollTicking = false;
}

/* ═════════════════════════════════════════════
   POST HELPERS
   ═════════════════════════════════════════════ */

function getInteractions(id) { return interactionsCache[id] || { likes: 0, dislikes: 0, comments: [] }; }
function commentCount(id) { return (getInteractions(id).comments || []).length; }
function myReactions() { return readJSON(KEYS.reactions, {}) || {}; }
function postScore(p) { const i = getInteractions(p.id); return (i.likes || 0) - (i.dislikes || 0) * 0.5 + commentCount(p.id) * 0.5; }

function sortPosts(list, sort) {
    const arr = list.slice();
    const likes = p => getInteractions(p.id).likes || 0;
    switch (sort) {
        case 'oldest': arr.sort((a, b) => a.id - b.id); break;
        case 'popular': arr.sort((a, b) => likes(b) - likes(a) || b.id - a.id); break;
        case 'unpopular': arr.sort((a, b) => likes(a) - likes(b) || b.id - a.id); break;
        case 'discussed': arr.sort((a, b) => commentCount(b.id) - commentCount(a.id) || b.id - a.id); break;
        default: arr.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.id - a.id);
    }
    return arr;
}

function filteredPosts() {
    const f = ui.feed;
    const q = f.q.trim().toLowerCase();
    let list = postsCache.filter(p => {
        if (f.tag !== 'all' && !postTags(p).some(t => t.toLowerCase() === f.tag)) return false;
        if (q) {
            const hay = (plainText(p.content) + ' ' + postTags(p).join(' ')).toLowerCase();
            if (!q.split(/\s+/).every(w => hay.includes(w))) return false;
        }
        return true;
    });
    return sortPosts(list, f.sort);
}

function reactionIcons() {
    const style = currentConfig.reactionIcon;
    if (style === 'arrow') return ['<i class="fa-solid fa-arrow-up" aria-hidden="true"></i>', '<i class="fa-solid fa-arrow-down" aria-hidden="true"></i>'];
    if (style === 'faces') return [esc(currentConfig.likeLabel || '(^∇^)'), esc(currentConfig.dislikeLabel || '(;へ:)')];
    return ['<i class="fa-solid fa-thumbs-up" aria-hidden="true"></i>', '<i class="fa-solid fa-thumbs-down" aria-hidden="true"></i>'];
}

function reactsHTML(post, opts = {}) {
    const ints = getInteractions(post.id);
    const mine = myReactions()[post.id];
    const [lIcon, dIcon] = reactionIcons();
    let html = '';
    if (currentConfig.reactionsEnabled) {
        html += '<button class="react like' + (mine === 'like' ? ' is-on' : '') + '" data-action="react" data-id="' + post.id + '" data-type="like" aria-pressed="' + (mine === 'like') + '" aria-label="Like, ' + (ints.likes || 0) + ' so far">' + lIcon + '<span>' + (ints.likes || 0) + '</span></button>';
        html += '<button class="react dislike' + (mine === 'dislike' ? ' is-on' : '') + '" data-action="react" data-id="' + post.id + '" data-type="dislike" aria-pressed="' + (mine === 'dislike') + '" aria-label="Dislike, ' + (ints.dislikes || 0) + ' so far">' + dIcon + '<span>' + (ints.dislikes || 0) + '</span></button>';
    }
    if (currentConfig.allowComments && !opts.noComments) {
        const n = commentCount(post.id);
        html += '<a class="meta-link" href="#/post/' + post.id + '" data-action="open-post" data-id="' + post.id + '" data-focus="comments" aria-label="' + plural(n, 'comment') + '"><i class="fa-regular fa-comment" aria-hidden="true"></i>' + n + '</a>';
    }
    return html;
}

/* ═════════════════════════════════════════════
   HOME: HERO, FEATURED, FEED
   ═════════════════════════════════════════════ */

function renderHero() {
    const strip = byId('hero-strip'); if (!strip) return;
    const s = bannerSettings();
    const count = clamp(parseInt(s.panelCount, 10) || 4, 2, 4);
    let panels = [];
    // Newest image posts, used for auto mode and to fill any empty manual slots
    const pool = sortPosts(postsCache, 'oldest').reverse().filter(p => firstImage(p) && !(currentConfig.blurNsfw && isNsfw(p)));
    const manual = s.bannerMode === 'manual' ? (s.bannerImages || []).map(safeUrl) : [];
    const used = new Set(manual.filter(Boolean));
    let next = 0;
    for (let i = 0; i < count; i++) {
        const url = manual[i];
        if (url) {
            const owner = postsCache.find(p => mediaList(p).includes(url));
            panels.push({ url, id: owner ? owner.id : null });
            continue;
        }
        while (pool[next] && used.has(firstImage(pool[next]))) next++;
        const p = pool[next++];
        panels.push(p ? { url: firstImage(p), id: p.id } : { url: '', id: null });
    }
    strip.innerHTML = panels.map((p, i) => {
        if (!p.url) return '<div class="hero-panel is-empty" style="--i:' + i + '"></div>';
        const img = '<img src="' + esc(p.url) + '" alt="" decoding="async"' + (i > 1 ? ' loading="lazy"' : '') + '>';
        if (p.id == null) return '<div class="hero-panel" style="--i:' + i + '">' + img + '</div>';
        return '<a class="hero-panel" style="--i:' + i + '" href="#/post/' + p.id + '" data-action="open-post" data-id="' + p.id + '" aria-label="Open recent work ' + (i + 1) + '">' + img + '</a>';
    }).join('');
}

function featuredPosts() {
    const mode = currentConfig.featuredMode || 'recent';
    if (mode === 'off') return [];
    let list = postsCache.filter(p => firstImage(p) && !(currentConfig.blurNsfw && isNsfw(p)));
    if (mode === 'popular') list.sort((a, b) => postScore(b) - postScore(a) || b.id - a.id);
    else if (mode === 'pinned') list = list.filter(p => p.pinned).sort((a, b) => b.id - a.id);
    else list.sort((a, b) => b.id - a.id);
    return list.slice(0, 5);
}

function renderFeatured() {
    const sec = byId('featured'), track = byId('featured-track');
    const list = featuredPosts();
    if (!list.length) { sec.hidden = true; stopFeatured(); return; }
    sec.hidden = false;
    track.innerHTML = list.map((p, i) => {
        const cap = excerpt(p.content, 160);
        const ints = getInteractions(p.id);
        return '<a class="feat" href="#/post/' + p.id + '" data-action="open-post" data-id="' + p.id + '" data-index="' + i + '">'
            + '<div class="feat-media"><img src="' + esc(firstImage(p)) + '" alt="" loading="lazy" decoding="async"></div>'
            + '<div class="feat-body">'
            + '<p class="feat-title' + (cap ? '' : ' is-muted') + '">' + (cap ? esc(cap) : 'Untitled piece') + '</p>'
            + '<div class="feat-meta"><time>' + esc(formatDate(p)) + '</time>'
            + (currentConfig.reactionsEnabled ? '<span><i class="fa-solid fa-thumbs-up" aria-hidden="true"></i>' + (ints.likes || 0) + '</span>' : '')
            + (currentConfig.allowComments ? '<span><i class="fa-regular fa-comment" aria-hidden="true"></i>' + commentCount(p.id) + '</span>' : '')
            + (postTags(p)[0] ? '<span>#' + esc(postTags(p)[0]) + '</span>' : '')
            + '</div>'
            + '<span class="btn feat-cta">View post</span>'
            + '</div></a>';
    }).join('');
    ui.featured.i = 0;
    renderFeaturedDots();
    track.scrollLeft = 0;
    startFeatured();
}

// Places the carousel can rest: one per card, fewer when wide screens show several cards side by side
function featuredStops() {
    const track = byId('featured-track'); if (!track) return 0;
    const per = parseInt(getComputedStyle(track).getPropertyValue('--per'), 10) || 1;
    return Math.max($$('.feat', track).length - per + 1, 1);
}
function renderFeaturedDots() {
    const stops = ui.featured.stops = featuredStops();
    ui.featured.i = Math.min(ui.featured.i, stops - 1);
    byId('featured-dots').innerHTML = stops > 1 ? Array.from({ length: stops }, (_, i) => '<button data-action="featured-go" data-index="' + i + '" aria-label="Show featured post ' + (i + 1) + '"' + (i === ui.featured.i ? ' aria-current="true"' : '') + '></button>').join('') : '';
    $$('#featured .carousel-ctrl').forEach(c => { c.hidden = stops < 2; });
}

function featuredGo(i) {
    const track = byId('featured-track'); if (!track) return;
    const cards = $$('.feat', track); if (!cards.length) return;
    const stops = featuredStops();
    ui.featured.i = (i + stops) % stops;
    track.scrollTo({ left: cards[ui.featured.i].offsetLeft - track.offsetLeft, behavior: reduceMotion() ? 'auto' : 'smooth' });
    syncFeaturedDots();
}
function syncFeaturedDots() { $$('#featured-dots button').forEach((d, n) => d.setAttribute('aria-current', String(n === ui.featured.i))); }
function startFeatured() {
    stopFeatured();
    if (reduceMotion() || ui.view !== 'home') return;
    if (featuredStops() < 2) return;
    ui.featured.timer = setInterval(() => {
        const sec = byId('featured');
        if (document.hidden || !sec || sec.matches(':hover') || sec.contains(document.activeElement)) return;
        featuredGo(ui.featured.i + 1);
    }, 6000);
}
function stopFeatured() { if (ui.featured.timer) clearInterval(ui.featured.timer); ui.featured.timer = null; }

function renderTagChips() {
    const box = byId('feed-tags'); if (!box) return;
    const counts = new Map();
    postsCache.forEach(p => postTags(p).forEach(t => {
        const k = t.toLowerCase();
        if (!counts.has(k)) counts.set(k, { name: t, n: 0 });
        counts.get(k).n++;
    }));
    const tags = Array.from(counts.entries()).sort((a, b) => b[1].n - a[1].n || a[0].localeCompare(b[0]));
    if (ui.feed.tag !== 'all' && !counts.has(ui.feed.tag)) ui.feed.tag = 'all';
    box.hidden = !tags.length;
    box.innerHTML = '<button class="chip" data-action="filter-tag" data-tag="all" aria-pressed="' + (ui.feed.tag === 'all') + '">All <span class="n">' + postsCache.length + '</span></button>'
        + tags.map(([k, v]) => '<button class="chip" data-action="filter-tag" data-tag="' + esc(k) + '" aria-pressed="' + (ui.feed.tag === k) + '">' + esc(v.name) + ' <span class="n">' + v.n + '</span></button>').join('');
}

function tileHTML(post) {
    const media = mediaList(post);
    const first = media[0] || '';
    const type = first ? getMediaType(first) : 'none';
    const date = formatDate(post);
    const veiled = isVeiled(post);
    const cap = excerpt(post.content, 140);
    let visual = '';
    if (type === 'image') visual = '<img src="' + esc(first) + '" alt="' + esc(cap || 'Artwork from ' + date) + '" loading="lazy" decoding="async" class="is-loading">';
    else if (type === 'video') visual = '<video src="' + esc(first) + '" muted loop playsinline preload="metadata" data-hoverplay></video>';
    else if (type === 'audio') visual = '<div class="tile-audio"><i class="fa-solid fa-music" aria-hidden="true"></i></div>';
    else visual = '<div class="tile-text"><p>' + esc(excerpt(post.content, 320)) + '</p></div>';

    let badges = '';
    if (post.pinned) badges += '<span class="badge pin"><i class="fa-solid fa-thumbtack" aria-hidden="true"></i>Pinned</span>';
    if (type === 'video') badges += '<span class="badge right"><i class="fa-solid fa-play" aria-hidden="true"></i>Video</span>';
    else if (media.length > 1) badges += '<span class="badge right"><i class="fa-regular fa-images" aria-hidden="true"></i>' + media.length + '</span>';

    const veil = veiled ? '<button class="veil" data-action="reveal" data-id="' + post.id + '"><i class="fa-regular fa-eye-slash" aria-hidden="true"></i>Sensitive<small>Tap to show</small></button>' : '';
    const del = isAdminLoggedIn ? '<button class="tile-del" data-action="delete-post" data-id="' + post.id + '" aria-label="Delete post" title="Delete post"><i class="fa-regular fa-trash-can" aria-hidden="true"></i></button>' : '';
    return '<article class="tile' + (veiled ? ' is-veiled' : '') + '" data-id="' + post.id + '">'
        + '<div class="tile-frame"><a class="tile-media' + (type === 'none' ? ' is-text' : '') + '" href="#/post/' + post.id + '" data-action="open-post" data-id="' + post.id + '"' + (type === 'none' ? '' : ' aria-label="Open post from ' + esc(date) + '"') + '>' + visual + '<span class="tile-badges">' + badges + '</span></a>' + veil + '</div>'
        + (type !== 'none' && cap ? '<p class="tile-cap">' + esc(cap) + '</p>' : '')
        + '<div class="tile-meta"><time>' + esc(date) + '</time><span class="reacts">' + reactsHTML(post) + '</span>' + del + '</div>'
        + '</article>';
}

function renderFeed() {
    const grid = byId('feed-grid'); if (!grid) return;
    const all = filteredPosts();
    // Round each batch up to whole rows so the grid never ends on a half-empty row
    const cols = ui.feed.cols = feedColumns();
    const shown = all.slice(0, Math.ceil(ui.feed.limit / cols) * cols);
    const count = byId('feed-count');
    const filtering = ui.feed.tag !== 'all' || ui.feed.q.trim();
    if (count) count.textContent = filtering ? plural(all.length, 'match', 'matches') : plural(postsCache.length, 'post');
    if (!postsCache.length) {
        grid.innerHTML = '<div class="empty"><h3>Nothing posted yet</h3><p>New work will show up here.</p>' + (isAdminLoggedIn ? '<a class="btn btn-primary" href="#/admin">Make your first post</a>' : '') + '</div>';
    } else if (!all.length) {
        grid.innerHTML = '<div class="empty"><h3>No posts match that</h3><p>Try a different word or tag.</p><button class="btn" data-action="clear-filters">Show all posts</button></div>';
    } else {
        grid.innerHTML = shown.map(tileHTML).join('');
    }
    const more = byId('feed-more');
    if (more) {
        const left = all.length - shown.length;
        more.hidden = left <= 0;
        more.textContent = 'Show more (' + left + ' left)';
    }
}

function feedColumns() {
    const grid = byId('feed-grid');
    if (!grid || !grid.offsetParent) return 1;
    return getComputedStyle(grid).gridTemplateColumns.split(' ').length;
}

function renderHome() { renderHero(); renderFeatured(); renderTagChips(); renderFeed(); }

// After a resize, or on coming back to Home, refit the carousel and feed to the new width
function fitHome() {
    if (ui.view !== 'home') return;
    if (!byId('featured').hidden && featuredStops() !== ui.featured.stops) { renderFeaturedDots(); featuredGo(ui.featured.i); startFeatured(); }
    if (postsCache.length && feedColumns() !== ui.feed.cols) renderFeed();
}

function refreshReactionsUI(postId) {
    const post = postsCache.find(p => p.id === postId); if (!post) return;
    $$('.tile[data-id="' + postId + '"] .reacts').forEach(n => { n.innerHTML = reactsHTML(post); });
    if (ui.post.id === postId) renderEngage(post);
}

/* ═════════════════════════════════════════════
   GALLERY
   ═════════════════════════════════════════════ */

function boardsData() {
    const map = new Map();
    postsCache.filter(p => mediaList(p).length).sort((a, b) => b.id - a.id).forEach(p => {
        const tags = postTags(p); const list = tags.length ? tags : ['Untagged'];
        list.forEach(t => {
            const k = t.toLowerCase();
            if (!map.has(k)) map.set(k, { key: k, name: t, items: [] });
            mediaList(p).forEach(url => map.get(k).items.push({ url, type: getMediaType(url), postId: p.id, nsfw: isNsfw(p) }));
        });
    });
    return Array.from(map.values()).sort((a, b) => b.items.length - a.items.length);
}

function allMediaItems() {
    const items = [];
    postsCache.filter(p => mediaList(p).length).sort((a, b) => b.id - a.id)
        .forEach(p => mediaList(p).forEach(url => items.push({ url, type: getMediaType(url), postId: p.id, nsfw: isNsfw(p) })));
    return items;
}

function masonryHTML(items, listName) {
    if (!items.length) return '<div class="empty"><h3>No images here yet</h3></div>';
    return items.map((m, i) => {
        const veil = currentConfig.blurNsfw && m.nsfw && !ui.revealed.has(m.postId);
        let inner;
        if (m.type === 'video') inner = '<video src="' + esc(m.url) + '" muted loop playsinline preload="metadata" data-hoverplay></video><span class="badge"><i class="fa-solid fa-play" aria-hidden="true"></i></span>';
        else if (m.type === 'audio') inner = '<div class="tile-audio" style="position:relative;aspect-ratio:1"><i class="fa-solid fa-music" aria-hidden="true"></i></div>';
        else inner = '<img src="' + esc(m.url) + '" alt="" loading="lazy" decoding="async" class="is-loading">';
        return '<button class="masonry-item' + (veil ? ' is-veiled' : '') + '" data-action="open-viewer" data-list="' + listName + '" data-index="' + i + '" aria-label="View full size">' + inner + (veil ? '<span class="veil"><i class="fa-regular fa-eye-slash" aria-hidden="true"></i>Sensitive</span>' : '') + '</button>';
    }).join('');
}

let galleryLists = { all: [], board: [], tiers: [] };
function renderGallery() {
    const g = ui.gallery;
    $$('[data-action="gallery-mode"]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === g.mode)));
    const boardsEl = byId('gallery-boards'), boardEl = byId('gallery-board'), allEl = byId('gallery-all');
    boardsEl.hidden = !(g.mode === 'boards' && !g.board);
    boardEl.hidden = !(g.mode === 'boards' && g.board);
    allEl.hidden = g.mode !== 'all';
    if (g.mode === 'all') {
        galleryLists.all = allMediaItems();
        allEl.innerHTML = masonryHTML(galleryLists.all, 'all');
        return;
    }
    const boards = boardsData();
    if (g.board) {
        const b = boards.find(x => x.key === g.board);
        if (!b) { g.board = null; return renderGallery(); }
        byId('board-title').textContent = b.name;
        byId('board-count').textContent = plural(b.items.length, 'piece');
        galleryLists.board = b.items;
        byId('board-grid').innerHTML = masonryHTML(b.items, 'board');
        return;
    }
    if (!boards.length) { boardsEl.innerHTML = '<div class="empty"><h3>No boards yet</h3><p>Boards are made from post tags. Tag your posts and they\'ll group here.</p></div>'; return; }
    boardsEl.innerHTML = boards.map(b => {
        const covers = b.items.filter(m => m.type === 'image' && !(currentConfig.blurNsfw && m.nsfw)).slice(0, 3);
        const imgs = covers.map(m => '<img src="' + esc(m.url) + '" alt="" loading="lazy" decoding="async">').join('');
        return '<button class="board" data-action="open-board" data-key="' + esc(b.key) + '">'
            + '<span class="board-cover n' + covers.length + '">' + (imgs || '<i class="fa-regular fa-images" aria-hidden="true"></i>') + '</span>'
            + '<span><span class="board-name">' + esc(b.name) + '</span><br><span class="board-count">' + plural(b.items.length, 'piece') + '</span></span>'
            + '</button>';
    }).join('');
}

/* ═════════════════════════════════════════════
   COMICS SHELF
   ═════════════════════════════════════════════ */

function comicCover(c) { return safeUrl(c.cover || (c.pages && c.pages[0]) || ''); }
function renderComics() {
    const grid = byId('comics-grid'); if (!grid) return;
    const list = comicsCache.slice().sort((a, b) => b.id - a.id);
    byId('comics-count').textContent = list.length ? plural(list.length, 'comic') : '';
    if (!list.length) { grid.innerHTML = '<div class="empty"><h3>No comics yet</h3><p>Comics will appear here once they\'re posted.</p></div>'; return; }
    const progress = readJSON(KEYS.comicProgress, {}) || {};
    grid.innerHTML = list.map(c => {
        const pages = (c.pages || []).length;
        const cover = comicCover(c);
        const read = progress[c.id] != null ? ', you\'re on page ' + (progress[c.id] + 1) : '';
        return '<a class="comic-card" href="#/comics/' + c.id + '" data-action="open-comic" data-id="' + c.id + '">'
            + '<span class="comic-cover">' + (cover ? '<img src="' + esc(cover) + '" alt="" loading="lazy" decoding="async">' : '<span class="ring-fallback">✦</span>') + '</span>'
            + '<span class="comic-title">' + esc(c.title || 'Untitled') + '</span>'
            + '<span class="comic-sub">' + plural(pages, 'page') + esc(read) + '</span>'
            + '</a>';
    }).join('');
}

/* ═════════════════════════════════════════════
   POST VIEWER
   ═════════════════════════════════════════════ */

function postNavList() {
    const feedIds = filteredPosts().map(p => p.id);
    return feedIds.includes(ui.post.id) ? feedIds : sortPosts(postsCache, 'newest').map(p => p.id);
}

function openPost(id, imgIndex = 0, opts = {}) {
    id = Number(id);
    const post = postsCache.find(p => p.id === id);
    if (!post) {
        showToast('That post isn\'t here anymore.', 'error');
        if (opts.fromRoute) history.replaceState(null, '', viewHash(ui.view || 'home'));
        return;
    }
    const overlay = byId('post-overlay');
    const alreadyOpen = Modals.isOpen(overlay);
    if (!opts.fromRoute) {
        if (!alreadyOpen) { setHash('#/post/' + id, false); ui.post.pushed = true; }
        else setHash('#/post/' + id, true);
    } else if (!alreadyOpen) ui.post.pushed = false;
    if (alreadyOpen && ui.post.id === id && opts.fromRoute) return;

    ui.post.id = id;
    ui.post.img = clamp(imgIndex, 0, Math.max(0, mediaList(post).length - 1));
    if (!alreadyOpen) ui.post.list = postNavList();
    if (!ui.post.list.includes(id)) ui.post.list = sortPosts(postsCache, 'newest').map(p => p.id);
    if (isVeiled(post)) ui.revealed.add(post.id);

    renderPostOverlay();
    if (!alreadyOpen) Modals.open(overlay, { onRequestClose: () => closePost(), focus: '.overlay-close' });
    if (opts.focus === 'comments') {
        setTimeout(() => {
            const sec = byId('comments'); if (sec) sec.scrollIntoView({ block: 'start', behavior: 'smooth' });
            const box = byId('comment-text'); if (box) box.focus({ preventScroll: true });
        }, 120);
    }
    preloadNeighbors();
}

function closePost(fromRoute) {
    const overlay = byId('post-overlay');
    if (!Modals.isOpen(overlay)) { ui.post.id = null; return; }
    if (!fromRoute) {
        if (ui.post.pushed) { ui.post.pushed = false; history.back(); return; }
        history.replaceState(null, '', viewHash(ui.view || 'home'));
    }
    $$('video', overlay).forEach(v => v.pause());
    ui.post.id = null;
    Modals.close(overlay);
}

function stepPost(dir) {
    const list = ui.post.list; if (list.length < 2) return;
    const i = list.indexOf(ui.post.id);
    const next = list[(i + dir + list.length) % list.length];
    openPost(next, dir < 0 ? 999 : 0);
}
function stepImage(dir) {
    const post = postsCache.find(p => p.id === ui.post.id); if (!post) return;
    const n = mediaList(post).length;
    const next = ui.post.img + dir;
    if (next < 0 || next >= n) { stepPost(dir); return; }
    ui.post.img = next;
    renderStage(post);
}

function preloadNeighbors() {
    const list = ui.post.list, i = list.indexOf(ui.post.id);
    [list[i + 1], list[i - 1]].forEach(id => {
        const p = postsCache.find(x => x.id === id); const url = p && firstImage(p);
        if (url) { const im = new Image(); im.src = url; }
    });
}

function renderStage(post) {
    const media = mediaList(post);
    const box = byId('post-media'), pager = byId('post-pager');
    const url = media[ui.post.img] || '';
    const type = getMediaType(url);
    const alt = excerpt(post.content, 120) || 'Artwork';
    if (type === 'video') box.innerHTML = '<video src="' + esc(url) + '" controls autoplay loop muted playsinline></video>';
    else if (type === 'audio') box.innerHTML = '<audio src="' + esc(url) + '" controls></audio>';
    else box.innerHTML = '<img src="' + esc(url) + '" alt="' + esc(alt) + '" data-action="zoom-post-image">';
    if (media.length > 1) {
        pager.hidden = false;
        pager.innerHTML = '<button data-action="post-img-prev" aria-label="Previous image"><i class="fa-solid fa-chevron-left" aria-hidden="true"></i></button><span>' + (ui.post.img + 1) + ' / ' + media.length + '</span><button data-action="post-img-next" aria-label="Next image"><i class="fa-solid fa-chevron-right" aria-hidden="true"></i></button>';
    } else { pager.hidden = true; pager.innerHTML = ''; }
    const multiPosts = ui.post.list.length > 1;
    $$('#post-stage .stage-nav').forEach(b => { b.hidden = !multiPosts; });
}

function renderPostOverlay() {
    const post = postsCache.find(p => p.id === ui.post.id); if (!post) return;
    const overlay = byId('post-overlay');
    const hasMedia = mediaList(post).length > 0;
    overlay.classList.toggle('is-text-only', !hasMedia);
    if (hasMedia) renderStage(post); else byId('post-media').innerHTML = '';

    const pfp = safeUrl(currentConfig.pfpImage);
    const idx = ui.post.list.indexOf(post.id);
    const textNav = !hasMedia && ui.post.list.length > 1
        ? '<div class="text-nav"><button class="btn small" data-action="post-prev"><i class="fa-solid fa-chevron-left" aria-hidden="true"></i> Previous</button><span>' + (idx + 1) + ' of ' + ui.post.list.length + '</span><button class="btn small" data-action="post-next">Next <i class="fa-solid fa-chevron-right" aria-hidden="true"></i></button></div>'
        : '';
    const tags = postTags(post);
    byId('post-info').innerHTML = textNav
        + '<div class="info-head">' + (pfp ? '<img src="' + esc(pfp) + '" alt="">' : '')
        + '<div class="info-who"><strong>' + esc(siteName()) + '</strong><time>' + esc(formatDate(post)) + '</time></div>'
        + (post.pinned ? '<span class="badge pin"><i class="fa-solid fa-thumbtack" aria-hidden="true"></i>Pinned</span>' : '')
        + '</div>'
        + '<div class="info-scroll" id="post-scroll">'
        + (post.content ? '<div class="prose">' + md(post.content) + '</div>' : '')
        + (tags.length ? '<div class="post-tags">' + tags.map(t => '<button class="chip" data-action="filter-tag" data-tag="' + esc(t.toLowerCase()) + '" data-close-post="1">#' + esc(t) + '</button>').join('') + '</div>' : '')
        + '<div class="engage" id="post-engage"></div>'
        + (currentConfig.allowComments ? '<section id="comments" aria-labelledby="comments-title"><h3 class="comments-title" id="comments-title"></h3><div id="comment-list"></div></section>' : '')
        + '</div>'
        + (currentConfig.allowComments ? composerHTML() : '');
    renderEngage(post);
    renderComments(post.id);
    const sc = byId('post-scroll'); if (sc) sc.scrollTop = 0;
    overlay.scrollTop = 0;
}

function renderEngage(post) {
    const box = byId('post-engage'); if (!box) return;
    const ints = getInteractions(post.id);
    const likes = ints.likes || 0, dislikes = ints.dislikes || 0, total = likes + dislikes;
    const ratio = total ? Math.round(likes / total * 100) : 0;
    const shareLabel = navigator.share ? 'Share' : 'Copy link';
    box.innerHTML = (currentConfig.reactionsEnabled
        ? reactsHTML(post, { noComments: true }) + '<span class="ratio' + (total ? '' : ' is-empty') + '" title="' + (total ? ratio + '% liked' : 'No votes yet') + '"><span style="width:' + ratio + '%"></span></span>'
        : '')
        + '<button class="btn small" data-action="share-post" data-id="' + post.id + '"><i class="fa-solid ' + (navigator.share ? 'fa-share-nodes' : 'fa-link') + '" aria-hidden="true"></i> ' + shareLabel + '</button>';
}

function permalink(id) { return location.href.split('#')[0] + '#/post/' + id; }
async function sharePost(id) {
    const url = permalink(id);
    const post = postsCache.find(p => p.id === id);
    if (navigator.share) {
        try { await navigator.share({ title: siteName(), text: excerpt(post && post.content, 100) || siteName(), url }); return; } catch (e) { if (e && e.name === 'AbortError') return; }
    }
    try { await navigator.clipboard.writeText(url); showToast('Link copied'); }
    catch (e) { prompt('Copy this link:', url); }
}

/* ═════════════════════════════════════════════
   COMMENTS
   ═════════════════════════════════════════════ */

function composerHTML() {
    if (isAdminLoggedIn) {
        return '<form class="composer" data-form="comment"><p class="as-admin">Commenting as <b>' + esc(siteName()) + '</b> (admin)</p>'
            + '<label class="sr-only" for="comment-text">Your comment</label><textarea id="comment-text" maxlength="1000" placeholder="Write a comment" required></textarea>'
            + '<div class="composer-row" style="justify-content:flex-end"><button class="btn btn-primary small" type="submit">Post comment</button></div></form>';
    }
    const saved = localStorage.getItem(KEYS.commenter) || '';
    return '<form class="composer" data-form="comment">'
        + '<label class="sr-only" for="comment-text">Your comment</label><textarea id="comment-text" maxlength="1000" placeholder="Leave a comment" required></textarea>'
        + '<div class="composer-row"><label class="sr-only" for="comment-name">Your name</label><input type="text" id="comment-name" maxlength="40" placeholder="Your name (optional)" value="' + esc(saved) + '">'
        + '<button class="btn btn-primary small" type="submit">Post</button></div></form>';
}

function commentHTML(c, postId, isReply) {
    const admin = !!c.isAdmin;
    return '<div class="comment' + (isReply ? ' is-reply' : '') + (admin ? ' is-admin' : '') + '" data-cid="' + c.id + '">'
        + '<div class="c-head"><span class="c-author">' + esc(c.author) + '</span>' + (admin ? '<span class="c-badge">ADMIN</span>' : '') + '<span class="c-date">' + esc(c.date || '') + '</span></div>'
        + (isReply && c.replyToAuthor ? '<div class="c-replyto">↩ replying to <b>@' + esc(c.replyToAuthor) + '</b></div>' : '')
        + '<div class="c-text">' + esc(c.text) + '</div>'
        + '<div class="c-actions">'
        + (!isReply ? '<button data-action="reply" data-cid="' + c.id + '">Reply</button>' : '')
        + (isAdminLoggedIn ? '<button class="del" data-action="delete-comment" data-post="' + postId + '" data-cid="' + c.id + '">Delete</button>' : '')
        + '</div></div>';
}

function renderComments(postId) {
    const list = byId('comment-list'); if (!list) return;
    const comments = getInteractions(postId).comments || [];
    const title = byId('comments-title'); if (title) title.textContent = comments.length ? plural(comments.length, 'comment') : 'Comments';
    if (!comments.length) { list.innerHTML = '<p class="no-comments">No comments yet. Say something nice.</p>'; return; }
    const top = comments.filter(c => !c.parentId);
    const replies = comments.filter(c => c.parentId);
    list.innerHTML = top.map(c => commentHTML(c, postId, false) + replies.filter(r => r.parentId === c.id).map(r => commentHTML(r, postId, true)).join('')).join('');
}

function openReplyForm(cid) {
    $$('.reply-form').forEach(f => f.remove());
    const host = $('.comment[data-cid="' + cid + '"]'); if (!host) return;
    const parent = (getInteractions(ui.post.id).comments || []).find(c => c.id === cid);
    const form = document.createElement('form');
    form.className = 'reply-form'; form.dataset.form = 'reply'; form.dataset.cid = cid;
    const saved = localStorage.getItem(KEYS.commenter) || '';
    form.innerHTML = '<textarea maxlength="1000" placeholder="Reply to @' + esc(parent ? parent.author : '') + '" required aria-label="Your reply"></textarea>'
        + '<div class="composer-row">' + (isAdminLoggedIn ? '' : '<input type="text" maxlength="40" placeholder="Your name (optional)" value="' + esc(saved) + '" aria-label="Your name">')
        + '<button class="btn btn-ghost small" type="button" data-action="cancel-reply">Cancel</button><button class="btn btn-primary small" type="submit">Reply</button></div>';
    host.appendChild(form);
    $('textarea', form).focus();
}

function addComment(postId, author, text, parentId = null) {
    text = String(text || '').trim();
    if (!text) { showToast('Write something first.', 'error'); return false; }
    if (Date.now() - ui.lastCommentAt < 4000) { showToast('One moment before posting again.', 'error'); return false; }
    if (isAdminLoggedIn) author = siteName();
    else {
        author = String(author || '').trim().slice(0, 40) || 'Anon';
        if (author !== 'Anon') try { localStorage.setItem(KEYS.commenter, author); } catch (e) {}
    }
    const now = new Date();
    const c = { id: Date.now(), author, text: text.slice(0, 1000), date: now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), parentId: parentId || null };
    if (isAdminLoggedIn) c.isAdmin = true;
    if (parentId) { const par = (getInteractions(postId).comments || []).find(x => x.id === parentId); if (par) c.replyToAuthor = par.author; }
    ui.lastCommentAt = Date.now();
    queueOp({ k: 'comment', p: postId, c });
    renderComments(postId);
    refreshReactionsUI(postId);
    const el = $('.comment[data-cid="' + c.id + '"]'); if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    showToast('Comment posted');
    return true;
}

function deleteComment(postId, cid) {
    if (!confirm('Delete this comment? Replies to it will go too.')) return;
    queueOp({ k: 'del', p: postId, cid });
    renderComments(postId);
    refreshReactionsUI(postId);
}

/* ═════════════════════════════════════════════
   LIKES, DISLIKES, COMMENTS: SYNCING
   Every action is saved as a small change, applied
   on top of the newest interactions.js right before
   uploading, so two visitors never erase each other.
   ═════════════════════════════════════════════ */

function ensureEntry(data, id) {
    if (!data[id]) data[id] = { likes: 0, dislikes: 0, comments: [] };
    if (!Array.isArray(data[id].comments)) data[id].comments = [];
    return data[id];
}
function applyOp(data, op) {
    if (!op || op.p == null) return;
    if (op.k === 'vote') {
        const e = ensureEntry(data, op.p);
        if (op.from) e[op.from + 's'] = Math.max(0, (e[op.from + 's'] || 0) - 1);
        if (op.to) e[op.to + 's'] = (e[op.to + 's'] || 0) + 1;
    } else if (op.k === 'comment' && op.c) {
        const e = ensureEntry(data, op.p);
        if (!e.comments.some(c => c.id === op.c.id)) e.comments.push(op.c);
    } else if (op.k === 'del') {
        const e = data[op.p];
        if (e && e.comments) e.comments = e.comments.filter(c => c.id !== op.cid && c.parentId !== op.cid);
    }
}
function rebuildInteractions() {
    interactionsCache = clone(interactionsRemote || {});
    pendingOps.forEach(op => applyOp(interactionsCache, op));
}
function persistOps() { writeJSON(KEYS.ops, pendingOps.slice(-300)); }

function queueOp(op) {
    op.t = Date.now();
    pendingOps.push(op);
    persistOps();
    applyOp(interactionsCache, op);
    writeJSON(KEYS.interactions, interactionsCache);
    scheduleInteractionsSync();
}

const scheduleInteractionsSync = debounce(() => syncInteractions(), 1200);
let interactionsSyncing = false, interactionsAgain = false;

async function fetchRemoteInteractions() {
    if (IS_LOCAL_FILE) return null;
    try {
        const res = await fetch('interactions.js?v=' + Date.now(), { cache: 'no-store' });
        if (res.status === 404) return {};
        if (!res.ok) return null;
        const txt = await res.text();
        const m = txt.match(/AZUMINT_INTERACTIONS\s*=\s*["']([^"']*)["']/);
        if (!m) return null;
        return JSON.parse(base64ToUnicode(m[1]));
    } catch (e) { return null; }
}

async function syncInteractions() {
    if (!pendingOps.length) return;
    if (!globalAuthToken || IS_LOCAL_FILE) return;
    if (interactionsSyncing) { interactionsAgain = true; return; }
    interactionsSyncing = true;
    const ops = pendingOps.slice();
    const fresh = await fetchRemoteInteractions();
    if (fresh && typeof fresh === 'object') interactionsRemote = fresh;
    const merged = clone(interactionsRemote || {});
    ops.forEach(op => applyOp(merged, op));
    const result = await uploadToBridge('interactions', { data: merged, quiet: !isAdminLoggedIn });
    if (result.success) {
        interactionsRemote = merged;
        pendingOps = pendingOps.filter(op => !ops.includes(op));
        persistOps();
        rebuildInteractions();
        writeJSON(KEYS.interactions, interactionsCache);
        if (ui.view === 'home') $$('.tile').forEach(t => { const id = Number(t.dataset.id); const p = postsCache.find(x => x.id === id); const r = $('.reacts', t); if (p && r) r.innerHTML = reactsHTML(p); });
        if (ui.post.id != null) { renderComments(ui.post.id); const p = postsCache.find(x => x.id === ui.post.id); if (p) renderEngage(p); }
    }
    interactionsSyncing = false;
    if (interactionsAgain) { interactionsAgain = false; scheduleInteractionsSync(); }
}

/* Admin tools that rewrite interactions as a whole (cleanup, erase all) */
async function saveInteractionsOverwrite() {
    pendingOps = []; persistOps();
    writeJSON(KEYS.interactions, interactionsCache);
    if (!globalAuthToken || IS_LOCAL_FILE) return { success: false };
    const r = await uploadToBridge('interactions', { data: interactionsCache });
    if (r.success) interactionsRemote = clone(interactionsCache);
    return r;
}
function saveInteractionsLocal() { writeJSON(KEYS.interactions, interactionsCache); scheduleInteractionsSync(); }

function reactTo(postId, type, btn) {
    postId = Number(postId);
    const mine = myReactions();
    const cur = mine[postId] || null;
    const next = cur === type ? null : type;
    queueOp({ k: 'vote', p: postId, from: cur, to: next });
    if (next) mine[postId] = next; else delete mine[postId];
    writeJSON(KEYS.reactions, mine);
    refreshReactionsUI(postId);
    const fresh = $$('.react.' + type + '[data-id="' + postId + '"]');
    fresh.forEach(b => { b.classList.remove('pop'); void b.offsetWidth; if (next) b.classList.add('pop'); });
}

/* ═════════════════════════════════════════════
   FULL SIZE MEDIA VIEWER
   ═════════════════════════════════════════════ */

function openViewer(list, index) {
    if (!list || !list.length) return;
    ui.viewer.list = list;
    ui.viewer.i = clamp(index, 0, list.length - 1);
    const v = byId('viewer');
    v.classList.remove('is-zoomed');
    renderViewer();
    Modals.open(v, { onRequestClose: closeViewer, focus: '[data-action="close-viewer"]' });
}
function renderViewer() {
    const m = ui.viewer.list[ui.viewer.i]; if (!m) return;
    const box = byId('viewer-media');
    $$('video', box).forEach(x => x.pause());
    if (m.type === 'video') box.innerHTML = '<video src="' + esc(m.url) + '" controls autoplay loop playsinline></video>';
    else if (m.type === 'audio') box.innerHTML = '<audio src="' + esc(m.url) + '" controls autoplay></audio>';
    else box.innerHTML = '<img src="' + esc(m.url) + '" alt="Full size artwork" data-action="viewer-zoom">';
    byId('viewer-count').textContent = ui.viewer.list.length > 1 ? (ui.viewer.i + 1) + ' / ' + ui.viewer.list.length : '';
    byId('viewer-open-post').hidden = m.postId == null || Modals.isOpen(byId('post-overlay'));
    $$('#viewer .stage-nav').forEach(b => { b.hidden = ui.viewer.list.length < 2; });
    const nxt = ui.viewer.list[ui.viewer.i + 1];
    if (nxt && nxt.type === 'image') { const im = new Image(); im.src = nxt.url; }
}
function stepViewer(dir) {
    if (ui.viewer.list.length < 2) return;
    ui.viewer.i = (ui.viewer.i + dir + ui.viewer.list.length) % ui.viewer.list.length;
    byId('viewer').classList.remove('is-zoomed');
    renderViewer();
}
function closeViewer() {
    const v = byId('viewer');
    $$('video, audio', v).forEach(x => x.pause());
    Modals.close(v);
}

/* ═════════════════════════════════════════════
   COMIC PAGES + READER
   ═════════════════════════════════════════════ */

function getComic(id) { return comicsCache.find(c => c.id === Number(id)); }
function comicProgress() { return readJSON(KEYS.comicProgress, {}) || {}; }

function openComicGallery(id, opts = {}) {
    const comic = getComic(id);
    if (!comic || !(comic.pages || []).length) {
        showToast('That comic has no pages yet.', 'error');
        if (opts.fromRoute) history.replaceState(null, '', '#/comics');
        return;
    }
    const overlay = byId('comic-overlay');
    const already = Modals.isOpen(overlay) && ui.comic.id === comic.id;
    if (!opts.fromRoute) { setHash('#/comics/' + comic.id, false); ui.comic.pushed = true; }
    else if (!Modals.isOpen(overlay)) ui.comic.pushed = false;
    ui.comic.id = comic.id;
    if (already) return;

    const pages = comic.pages;
    const prog = comicProgress()[comic.id];
    byId('co-title').textContent = comic.title || 'Untitled';
    byId('co-meta').textContent = plural(pages.length, 'page') + (comic.date ? ', posted ' + comic.date : '');
    const tags = (comic.tags || []);
    byId('co-tags').innerHTML = tags.map(t => '<span class="chip">' + esc(t) + '</span>').join('');
    byId('co-tags').hidden = !tags.length;
    byId('co-actions').innerHTML = (prog != null && prog > 0 && prog < pages.length
        ? '<button class="btn" data-action="read-comic" data-id="' + comic.id + '" data-page="0">From the start</button><button class="btn btn-primary" data-action="read-comic" data-id="' + comic.id + '" data-page="' + prog + '">Continue on page ' + (prog + 1) + '</button>'
        : '<button class="btn btn-primary" data-action="read-comic" data-id="' + comic.id + '" data-page="0"><i class="fa-solid fa-book-open" aria-hidden="true"></i> Start reading</button>');
    byId('co-grid').innerHTML = pages.map((url, i) => '<button class="page-thumb' + (prog === i ? ' is-last' : '') + '" data-action="read-comic" data-id="' + comic.id + '" data-page="' + i + '"><span class="frame"><img src="' + esc(url) + '" alt="" loading="lazy" decoding="async"></span>Page ' + (i + 1) + (prog === i ? ', last read' : '') + '</button>').join('');
    overlay.scrollTop = 0;
    if (!Modals.isOpen(overlay)) Modals.open(overlay, { onRequestClose: () => closeComicGallery(), focus: '.back-btn' });
}

function closeComicGallery(fromRoute) {
    const overlay = byId('comic-overlay');
    if (!Modals.isOpen(overlay)) { ui.comic.id = null; return; }
    if (!fromRoute) {
        if (ui.comic.pushed) { ui.comic.pushed = false; history.back(); return; }
        history.replaceState(null, '', '#/comics');
    }
    if (ui.reader.id != null) closeReader(true);
    ui.comic.id = null;
    Modals.close(overlay);
    renderComics();
}

function openReader(id, page, opts = {}) {
    const comic = getComic(id); if (!comic || !(comic.pages || []).length) return;
    if (!Modals.isOpen(byId('comic-overlay')) || ui.comic.id !== comic.id) openComicGallery(comic.id, { fromRoute: true });
    ui.reader.id = comic.id;
    ui.reader.page = clamp(Number(page) || 0, 0, comic.pages.length - 1);
    byId('rd-title').textContent = comic.title || 'Untitled';
    const r = byId('reader');
    if (!Modals.isOpen(r)) Modals.open(r, { onRequestClose: () => closeReader(), focus: '.reader-top [data-action="close-reader"]' });
    renderReader(opts.fromRoute);
}

function renderReader(fromRoute) {
    const comic = getComic(ui.reader.id); if (!comic) return;
    const total = comic.pages.length, p = ui.reader.page;
    const img = byId('rd-img');
    img.src = comic.pages[p];
    img.alt = (comic.title || 'Comic') + ', page ' + (p + 1);
    byId('rd-page').textContent = 'Page ' + (p + 1) + ' of ' + total;
    const stage = byId('rd-stage'); stage.scrollTop = 0;
    const btns = [];
    btns.push('<button class="pg go" data-action="reader-prev"' + (p === 0 ? ' disabled' : '') + '><i class="fa-solid fa-chevron-left" aria-hidden="true"></i> Prev</button>');
    pageWindow(p, total).forEach(n => {
        if (n === '…') btns.push('<span class="pg dots">…</span>');
        else btns.push('<button class="pg" data-action="reader-go" data-page="' + n + '"' + (n === p ? ' aria-current="true"' : '') + ' aria-label="Page ' + (n + 1) + '">' + (n + 1) + '</button>');
    });
    btns.push(p === total - 1
        ? '<button class="pg go finish" data-action="close-reader" title="Back to the page gallery">Gallery ▶▶</button>'
        : '<button class="pg go" data-action="reader-next">Next <i class="fa-solid fa-chevron-right" aria-hidden="true"></i></button>');
    byId('rd-pages').innerHTML = btns.join('');
    const prog = comicProgress(); prog[comic.id] = p; writeJSON(KEYS.comicProgress, prog);
    if (!fromRoute) setHash('#/comics/' + comic.id + '/' + (p + 1), true);
    if (comic.pages[p + 1]) { const im = new Image(); im.src = comic.pages[p + 1]; }
}

function pageWindow(current, total) {
    const narrow = window.innerWidth < 520;
    if (total <= (narrow ? 5 : 7)) return Array.from({ length: total }, (_, i) => i);
    const out = [0];
    const r = narrow ? 0 : 2;
    const lo = Math.max(1, current - r), hi = Math.min(total - 2, current + r);
    if (lo > 1) out.push('…');
    for (let i = lo; i <= hi; i++) out.push(i);
    if (hi < total - 2) out.push('…');
    out.push(total - 1);
    return out;
}

function crGo(n) {
    const comic = getComic(ui.reader.id); if (!comic) return;
    if (n < 0) return;
    if (n >= comic.pages.length) { closeReader(); return; }
    ui.reader.page = n;
    renderReader();
}

function closeReader(fromRoute) {
    const r = byId('reader');
    if (!Modals.isOpen(r)) { ui.reader.id = null; return; }
    const id = ui.reader.id;
    ui.reader.id = null;
    Modals.close(r);
    if (!fromRoute && id != null) setHash('#/comics/' + id, true);
    if (id != null && ui.comic.id === id) {
        const prog = comicProgress()[id];
        $$('#co-grid .page-thumb').forEach((b, i) => b.classList.toggle('is-last', i === prog));
        const thumb = $$('#co-grid .page-thumb')[prog];
        if (thumb) thumb.scrollIntoView({ block: 'center' });
    }
}

/* ═════════════════════════════════════════════
   BRIDGE (uploads to Neocities via applesaucy's bridge)
   One upload at a time, each waits for its own result.
   ═════════════════════════════════════════════ */

const Bridge = { frame: null, ready: false, waiters: [], queue: [], busy: null, tokenResolve: null };

function injectBridge() {
    if (IS_LOCAL_FILE || Bridge.frame) return;
    const f = document.createElement('iframe');
    f.id = 'bridge-frame';
    f.title = 'Upload bridge';
    f.setAttribute('aria-hidden', 'true');
    f.tabIndex = -1;
    f.style.cssText = 'position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;border:0;left:-9999px;top:0;';
    f.addEventListener('load', () => {
        Bridge.ready = true;
        Bridge.waiters.splice(0).forEach(fn => fn());
        pumpBridge();
    });
    f.src = FIXED_BRIDGE_URL;
    document.body.appendChild(f);
    Bridge.frame = f;
}

function whenBridgeReady(timeout = 15000) {
    return new Promise(resolve => {
        if (Bridge.ready) return resolve(true);
        injectBridge();
        if (!Bridge.frame) return resolve(false);
        const t = setTimeout(() => resolve(false), timeout);
        Bridge.waiters.push(() => { clearTimeout(t); resolve(true); });
    });
}

function bridgeSend(message, timeout) {
    return new Promise(resolve => {
        Bridge.queue.push({ message, resolve, timeout: timeout || 45000 });
        updateSyncChip();
        pumpBridge();
    });
}

async function pumpBridge() {
    if (Bridge.busy || !Bridge.queue.length) return;
    const job = Bridge.queue.shift();
    Bridge.busy = job;
    updateSyncChip();
    const ok = await whenBridgeReady();
    if (Bridge.busy !== job) return;
    if (!ok || !Bridge.frame || !Bridge.frame.contentWindow) {
        finishBridgeJob({ success: false, message: 'The upload bridge didn\'t load. Check your connection and refresh.' });
        return;
    }
    job.timer = setTimeout(() => finishBridgeJob({ success: false, message: 'The upload timed out.', timedOut: true }), job.timeout);
    Bridge.frame.contentWindow.postMessage(job.message, BRIDGE_ORIGIN);
}

function finishBridgeJob(result) {
    const job = Bridge.busy; if (!job) return;
    clearTimeout(job.timer);
    Bridge.busy = null;
    lastSyncFailed = !result.success;
    job.resolve(result);
    updateSyncChip();
    setTimeout(pumpBridge, 60);
}

function handleBridgeMessage(e) {
    if (!Bridge.frame || e.source !== Bridge.frame.contentWindow) return;
    const d = e.data || {};
    if (d.type === 'TOKEN_RESULT') {
        if (Bridge.tokenResolve) {
            if (!d.success) showToast('Couldn\'t create a secure token: ' + (d.message || 'unknown error'), 'error');
            Bridge.tokenResolve(d.success ? d.token : null);
            Bridge.tokenResolve = null;
        }
    } else if (d.type === 'UPLOAD_RESULT') {
        finishBridgeJob({ success: !!d.success, message: d.message || '' });
    }
}

async function requestTokenGeneration(key, pass) {
    const ok = await whenBridgeReady();
    if (!ok) { showToast('The upload bridge didn\'t load. Check your connection and try again.', 'error'); return null; }
    return new Promise(resolve => {
        Bridge.tokenResolve = resolve;
        Bridge.frame.contentWindow.postMessage({ type: 'TOKENIZE', rawKey: key, adminPass: pass }, BRIDGE_ORIGIN);
        setTimeout(() => { if (Bridge.tokenResolve === resolve) { Bridge.tokenResolve = null; resolve(null); } }, 15000);
    });
}

let lastSyncFailed = false;
function updateSyncChip() {
    const chip = byId('sync-chip'); if (!chip) return;
    const n = Bridge.queue.length + (Bridge.busy ? 1 : 0);
    if (n) { chip.dataset.state = 'syncing'; chip.textContent = n > 1 ? 'Syncing ' + n + ' files' : 'Syncing'; }
    else if (lastSyncFailed) { chip.dataset.state = 'error'; chip.textContent = 'Last sync failed'; chip.title = 'Click Sync everything to try again'; }
    else { chip.dataset.state = 'idle'; chip.textContent = 'All changes synced'; chip.title = ''; }
}

function sanitizeBeforeSave() {
    let stripped = 0;
    postsCache.forEach(p => {
        if (p.content && p.content.includes('data:image/')) {
            const before = p.content.length;
            p.content = p.content.replace(/data:image\/[a-z+]+;base64,[A-Za-z0-9+/=]+/g, '[image]');
            if (p.content.length < before) stripped++;
        }
        if (p.media === undefined || p.media === null) delete p.media;
    });
    return stripped;
}

function systemPayload(token) {
    return { adminHash: globalAdminHash, salt: globalSalt, siteConfig: currentConfig, authToken: token || globalAuthToken, apiKey: null };
}

/* Returns a promise with { success, message } */
async function uploadToBridge(target, opts = {}) {
    if (typeof opts !== 'object' || opts === null || opts instanceof File) opts = { mediaFile: opts };
    const token = opts.token || globalAuthToken;
    if (!token) {
        if (!opts.quiet) showToast('Your site isn\'t connected to Neocities yet. Reconnect it to sync.', 'error');
        return { success: false, message: 'no token' };
    }
    let passwordCheck = null;
    if (['system', 'posts', 'comics', 'media_only'].includes(target)) {
        if (!sessionPassword) {
            if (!opts.quiet) showToast('Your admin session ended. Log in again to save.', 'error');
            return { success: false, message: 'no session' };
        }
        passwordCheck = sessionPassword;
    }
    let fileContent = '', filename = '', mediaName = null;
    if (target === 'system') {
        fileContent = 'window.AZUMINT_SYSTEM = "' + unicodeToBase64(JSON.stringify(systemPayload(token))) + '";';
        filename = 'system.js';
    } else if (target === 'posts') {
        sanitizeBeforeSave();
        fileContent = 'window.AZUMINT_POSTS = "' + unicodeToBase64(JSON.stringify(postsCache)) + '";';
        filename = 'posts.js';
    } else if (target === 'comics') {
        fileContent = 'window.AZUMINT_COMICS = "' + unicodeToBase64(JSON.stringify(comicsCache)) + '";';
        filename = 'comics.js';
    } else if (target === 'interactions') {
        fileContent = 'window.AZUMINT_INTERACTIONS = "' + unicodeToBase64(JSON.stringify(opts.data || interactionsCache)) + '";';
        filename = 'interactions.js';
    } else if (target === 'media_only') {
        if (!opts.mediaFile) return { success: false, message: 'no file' };
        const raw = opts.mediaPath || 'img/' + safeFileName(opts.mediaFile.name, opts.mediaFile.type);
        mediaName = raw.indexOf('/') === -1 ? 'img/' + raw : raw;
    }
    const result = await bridgeSend({
        type: 'UPLOAD', authToken: token, passwordCheck,
        fileContent, filename, mediaFile: opts.mediaFile || null, mediaName
    }, target === 'media_only' ? 120000 : 45000);
    if (!result.success) {
        const msg = result.message || '';
        if (isAdminLoggedIn && /invalid|403|credential|corrupt/i.test(msg)) openRepair();
        else if (isAdminLoggedIn && !opts.quiet) showToast('Couldn\'t sync ' + (filename || 'that file') + '. ' + (msg || 'Try again.'), 'error');
    }
    return result;
}

function promisifiedUpload(file, path) {
    return uploadToBridge('media_only', { mediaFile: file, mediaPath: path }).then(r => { if (!r.success) throw (r.message || 'Upload failed'); return path; });
}

/* ═════════════════════════════════════════════
   SAVING
   ═════════════════════════════════════════════ */

function saveDataLocally() {
    sanitizeBeforeSave();
    writeJSON(KEYS.system, { adminHash: globalAdminHash, salt: globalSalt, siteConfig: currentConfig, authToken: globalAuthToken });
    writeJSON(KEYS.posts, postsCache);
    writeJSON(KEYS.comics, comicsCache);
    writeJSON(KEYS.interactions, interactionsCache);
}

function isLocalMode() { return IS_LOCAL_FILE || !globalAuthToken; }

async function syncFile(target, labels) {
    saveDataLocally();
    if (isLocalMode()) {
        ({ system: downloadSystemJS, posts: downloadPostsJS, comics: downloadComicsJS })[target]();
        showToast('Saved here. Upload the downloaded ' + target + '.js to Neocities.', 'info');
        return { success: true, local: true };
    }
    const t = showToast(labels[0], 'loading');
    const r = await uploadToBridge(target, { quiet: true });
    dismissToast(t);
    if (r.success) showToast(labels[1]);
    else if (!/invalid|403|credential|corrupt/i.test(r.message || '')) showToast('Couldn\'t sync ' + target + '.js. ' + (r.message || 'Try again.'), 'error');
    return r;
}
function saveSystem() { return syncFile('system', ['Saving settings', 'Settings synced']); }
function savePosts() { return syncFile('posts', ['Saving posts', 'Posts synced']); }
function saveComics() { return syncFile('comics', ['Saving comics', 'Comics synced']); }

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

function downloadSystemJS() { downloadFile('window.AZUMINT_SYSTEM = "' + unicodeToBase64(JSON.stringify(systemPayload())) + '";', 'system.js'); }
function downloadPostsJS() { sanitizeBeforeSave(); downloadFile('window.AZUMINT_POSTS = "' + unicodeToBase64(JSON.stringify(postsCache)) + '";', 'posts.js'); }
function downloadComicsJS() { downloadFile('window.AZUMINT_COMICS = "' + unicodeToBase64(JSON.stringify(comicsCache)) + '";', 'comics.js'); }
function downloadInteractionsJS() { downloadFile('window.AZUMINT_INTERACTIONS = "' + unicodeToBase64(JSON.stringify(interactionsCache)) + '";', 'interactions.js'); }
function downloadBackup() {
    downloadSystemJS();
    setTimeout(downloadPostsJS, 300);
    setTimeout(downloadComicsJS, 600);
    setTimeout(downloadInteractionsJS, 900);
    showToast('Downloading system.js, posts.js, comics.js and interactions.js');
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

/* Uploads a list of files one by one. onStep(i, total, file) reports progress. Returns paths, or null on failure. */
async function uploadFiles(files, folder, onStep) {
    const out = [];
    for (let i = 0; i < files.length; i++) {
        const f = files[i];
        if (onStep) onStep(i, files.length, f);
        if (isLocalMode()) {
            const b64 = await compressImage(f, folder.includes('comics') ? 1000 : 1200, 0.7, false);
            if (!b64) { showToast('Couldn\'t read ' + f.name, 'error'); return null; }
            out.push(b64);
        } else {
            const path = folder + safeFileName(f.name, f.type);
            try { await promisifiedUpload(f, path); out.push(path); }
            catch (err) { showToast('Upload failed for ' + f.name + '. ' + err, 'error'); return null; }
        }
    }
    if (onStep) onStep(files.length, files.length, null);
    return out;
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

/* ═════════════════════════════════════════════
   CONNECTION REPAIR
   ═════════════════════════════════════════════ */

function openRepair() {
    const m = byId('repair-modal');
    if (Modals.isOpen(m)) return;
    Modals.open(m, { focus: '#repair-key' });
}
async function runRepair() {
    const key = byId('repair-key').value.trim();
    if (!key) { showToast('Paste your API key first.', 'error'); return; }
    if (!sessionPassword) { showToast('Log in again first, then reconnect.', 'error'); return; }
    const t = showToast('Reconnecting', 'loading');
    const token = await requestTokenGeneration(key, sessionPassword);
    dismissToast(t);
    if (!token) { showToast('That key didn\'t work. Double check it on Neocities.', 'error'); return; }
    globalAuthToken = token; globalApiKey = null;
    byId('repair-key').value = '';
    Modals.close(byId('repair-modal'));
    showToast('Reconnected');
    saveSystem();
}

/* ═════════════════════════════════════════════
   ADMIN: LOGIN
   ═════════════════════════════════════════════ */

async function loginAdmin() {
    const input = byId('admin-pass');
    if (!globalAdminHash) { showToast('This site hasn\'t been set up yet.', 'error'); showSetup(); return; }
    const raw = input.value;
    const hash = globalSalt ? await sha256(raw + globalSalt) : await sha256(raw);
    if (hash !== globalAdminHash) { showToast('That password isn\'t right.', 'error'); input.select(); return; }
    isAdminLoggedIn = true; sessionPassword = raw; input.value = '';
    if (globalApiKey && !globalAuthToken) {
        const t = showToast('Upgrading your site security', 'loading');
        const token = await requestTokenGeneration(globalApiKey, raw);
        dismissToast(t);
        if (token) { globalAuthToken = token; globalApiKey = null; saveSystem(); }
    }
    if (legacyPostsInSystem) setTimeout(async () => { await savePosts(); await saveSystem(); legacyPostsInSystem = false; }, 1500);
    if (legacyComicsInSystem) setTimeout(async () => { await saveComics(); await saveSystem(); legacyComicsInSystem = false; }, 3000);
    renderAdminView();
    renderFeed();
    if (ui.post.id != null) renderPostOverlay();
    showToast('Welcome back');
}

function logoutAdmin() {
    if (Studio.dirty) { Studio.reset(); applyTheme(); }
    isAdminLoggedIn = false; sessionPassword = null;
    renderAdminView();
    renderFeed();
    showToast('Logged out');
}

function renderAdminView() {
    byId('admin-login').hidden = isAdminLoggedIn;
    byId('admin-panel').hidden = !isAdminLoggedIn;
    if (!isAdminLoggedIn) { setTimeout(() => { if (ui.view === 'admin') byId('admin-pass').focus(); }, 60); return; }
    updateSyncChip();
    renderRecovery();
    renderNewPostTags();
    showAdminTab(ui.adminTab || 'post');
}

function showAdminTab(tab) {
    ui.adminTab = tab;
    $$('[data-action="admin-tab"]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === tab)));
    $$('[data-tab-panel]').forEach(p => { p.hidden = p.dataset.tabPanel !== tab; });
    if (tab === 'posts') renderManagePosts();
    if (tab === 'comics') renderComicsAdmin();
    if (tab === 'comm') populateCommForm();
    if (tab === 'site') populateSiteForm();
    if (tab === 'look') Studio.open();
    if (tab === 'banner') populateBannerForm();
    if (tab === 'links') renderLinksEditor();
}

/* Posts that exist in this browser's backup but not on the live site */
function renderRecovery() {
    const box = byId('recovery'); if (!box) return;
    const local = readJSON(KEYS.posts, []) || [];
    const dismissed = readJSON(KEYS.recoveryDismissed, []) || [];
    const live = new Set(postsCache.map(p => p.id));
    const missing = local.filter(p => p && p.id != null && !live.has(p.id) && !dismissed.includes(p.id));
    if (!missing.length || IS_LOCAL_FILE) { box.hidden = true; return; }
    box.hidden = false;
    box.innerHTML = '<span>This browser has ' + plural(missing.length, 'post') + ' that never made it to your live site.</span>'
        + '<span class="row-actions"><button class="btn small" data-action="recovery-dismiss">Dismiss</button><button class="btn btn-primary small" data-action="recovery-restore">Restore ' + (missing.length === 1 ? 'it' : 'them') + '</button></span>';
    box.dataset.ids = JSON.stringify(missing.map(p => p.id));
}
function recoveryRestore() {
    const ids = JSON.parse(byId('recovery').dataset.ids || '[]');
    const local = readJSON(KEYS.posts, []) || [];
    local.filter(p => ids.includes(p.id)).forEach(p => postsCache.push(p));
    renderHome(); renderRecovery();
    savePosts();
}
function recoveryDismiss() {
    const ids = JSON.parse(byId('recovery').dataset.ids || '[]');
    writeJSON(KEYS.recoveryDismissed, (readJSON(KEYS.recoveryDismissed, []) || []).concat(ids));
    byId('recovery').hidden = true;
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
    const post = { id: Date.now(), content, tags: selectedNewPostTags(), pinned: byId('np-pinned').checked };
    if (media.length === 1) post.media = media[0]; else if (media.length > 1) post.media = media;
    postsCache.push(post);

    byId('np-content').value = ''; byId('np-custom-tags').value = ''; byId('np-pinned').checked = false;
    $$('#np-tags .chip').forEach(b => b.setAttribute('aria-pressed', 'false'));
    currentPostMediaQueue = []; renderMediaQueue();
    ui.feed.limit = FEED_STEP;
    renderHome(); renderNewPostTags();
    await savePosts();
    publishing = false;
    showToast('Published');
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
            + '<div class="m-thumb">' + (thumb ? '<img src="' + esc(thumb) + '" alt="" loading="lazy">' : '<i class="fa-solid fa-align-left" aria-hidden="true"></i>') + '</div>'
            + '<div class="m-body"><span class="m-title' + (title ? '' : ' is-muted') + '">' + (title ? esc(title) : 'No caption') + '</span>'
            + '<span class="m-meta"><span>' + esc(formatDate(p)) + '</span>' + (p.pinned ? '<span class="pin">Pinned</span>' : '')
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
        + '<label class="field"><span>Tags, separated by commas</span><input type="text" name="tags" value="' + esc(postTags(p).join(', ')) + '"></label>'
        + (media.length ? '<div class="field"><span>Media <em>(tap ✕ to remove from this post)</em></span><div class="m-media">' + media.map((u, i) => '<span class="mm" data-i="' + i + '">' + (getMediaType(u) === 'image' ? '<img src="' + esc(u) + '" alt="">' : '<i class="fa-solid fa-film" aria-hidden="true"></i>') + '<button type="button" data-action="edit-remove-media" aria-label="Remove">✕</button></span>').join('') + '</div></div>' : '')
        + '<div class="form-foot"><button type="button" class="btn btn-ghost small" data-action="edit-post" data-id="' + p.id + '">Cancel</button><button type="submit" class="btn btn-primary small">Save changes</button></div>'
        + '</form>';
}
function saveEditedPost(form) {
    const post = postsCache.find(p => p.id === Number(form.dataset.id)); if (!post) return;
    post.content = form.elements.content.value.trim();
    post.tags = form.elements.tags.value.split(',').map(t => t.trim()).filter(Boolean);
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
function deletePost(id) {
    id = Number(id);
    if (!confirm('Delete this post for good? This can\'t be undone.')) return;
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
    const pages = await uploadFiles(comicPagesQueue.map(i => i.file), 'img/comics/', (i, n) => { bar.style.width = (i / n * 100) + '%'; txt.textContent = i < n ? 'Uploading page ' + (i + 1) + ' of ' + n : 'Saving comic'; });
    if (!pages) { publishing = false; box.hidden = true; return; }
    comicsCache.push({ id: Date.now(), title, cover: cover || pages[0], pages, tags, date: new Date().toLocaleDateString() });
    byId('nc-title').value = ''; byId('nc-cover').value = ''; byId('nc-tags').value = ''; byId('nc-files').value = '';
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
            + '<div class="m-thumb">' + (cover ? '<img src="' + esc(cover) + '" alt="" loading="lazy">' : '<i class="fa-solid fa-book" aria-hidden="true"></i>') + '</div>'
            + '<div class="m-body"><span class="m-title">' + esc(c.title || 'Untitled') + '</span><span class="m-meta"><span>' + plural((c.pages || []).length, 'page') + '</span>' + (c.date ? '<span>' + esc(c.date) + '</span>' : '') + '</span>'
            + ((c.tags || []).length ? '<span class="m-tags">' + c.tags.map(t => '<span>' + esc(t) + '</span>').join('') + '</span>' : '') + '</div>'
            + '<div class="m-actions"><button class="btn small" data-action="open-add-pages" data-id="' + c.id + '"><i class="fa-solid fa-plus" aria-hidden="true"></i> Add pages</button>'
            + '<button class="btn small" data-action="edit-comic" data-id="' + c.id + '">' + (editing ? 'Close' : 'Edit') + '</button>'
            + '<button class="btn small danger" data-action="delete-comic" data-id="' + c.id + '">Delete</button></div>'
            + (editing ? '<form class="m-edit" data-form="edit-comic" data-id="' + c.id + '"><div class="form-grid">'
                + '<label class="field"><span>Title</span><input type="text" name="title" value="' + esc(c.title || '') + '"></label>'
                + '<label class="field"><span>Tags</span><input type="text" name="tags" value="' + esc((c.tags || []).join(', ')) + '"></label>'
                + '<label class="field span-2"><span>Cover image link</span><input type="text" name="cover" value="' + esc(c.cover || '') + '"></label></div>'
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
        + '<button type="button" class="ps-swap" data-action="ec-swap" data-index="' + i + '" title="Swap image" aria-label="Swap the image on page ' + (i + 1) + '"><i class="fa-solid fa-arrows-rotate" aria-hidden="true"></i></button>'
        + '<button type="button" data-action="ec-remove" data-index="' + i + '" title="Remove page" aria-label="Remove page ' + (i + 1) + '">✕</button>'
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
    const oldPages = (c.pages || []).slice();
    const items = editPagesDraft.id === c.id ? editPagesDraft.items : oldPages.map(url => ({ url, orig: url, file: null, preview: null }));
    if (!items.length) { showToast('A comic needs at least one page.', 'error'); return; }

    // Upload any swapped-in images first
    const swaps = items.filter(it => it.file);
    if (swaps.length) {
        publishing = true;
        const btn = form.querySelector('[type="submit"]'); if (btn) btn.disabled = true;
        const t = showToast('Uploading ' + plural(swaps.length, 'new page'), 'loading');
        const paths = await uploadFiles(swaps.map(it => it.file), 'img/comics/');
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
    c.pages = pages;
    c.cover = cover;
    editingComicId = null; resetEditPagesDraft();
    renderComicsAdmin(); renderComics();
    saveComics();
}
function deleteComic(id) {
    if (!confirm('Delete this comic? The page images stay on Neocities, but the comic is removed from your site.')) return;
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
    const pages = await uploadFiles(addPagesQueue.map(i => i.file), 'img/comics/', (i, n) => { bar.style.width = (i / n * 100) + '%'; txt.textContent = i < n ? 'Uploading page ' + (i + 1) + ' of ' + n : 'Saving'; });
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
   ADMIN: SITE INFO
   ═════════════════════════════════════════════ */

function populateSiteForm() {
    const c = currentConfig;
    const set = (id, v) => { const el = byId(id); if (el) el.value = v == null ? '' : v; };
    const chk = (id, v) => { const el = byId(id); if (el) el.checked = !!v; };
    set('s-sitename', c.siteName); set('s-tagline', c.tagline); set('s-feedname', c.leafletsName); set('s-copyright', c.copyright);
    set('s-pfp', c.pfpImage); set('s-bio', c.aboutBio || localStorage.getItem(KEYS.bio) || '');
    chk('s-agegate', c.ageGate !== false); chk('s-blur', c.blurNsfw); chk('s-comments', c.allowComments); chk('s-reactions', c.reactionsEnabled);
    set('s-reaction-style', c.reactionIcon || 'thumb'); set('s-featured', c.featuredMode || 'recent');
    set('s-like-label', c.likeLabel); set('s-dislike-label', c.dislikeLabel);
    set('s-title', c.metaTitle); set('s-desc', c.metaDescription);
    set('s-bgimage', c.bgImage); set('s-css', c.customCss); set('s-newkey', '');
}

async function saveSiteSettings() {
    const c = currentConfig;
    const val = id => (byId(id).value || '').trim();
    c.siteName = val('s-sitename') || 'NEERG';
    c.tagline = val('s-tagline'); c.leafletsName = val('s-feedname') || 'Works'; c.copyright = val('s-copyright');
    c.pfpImage = val('s-pfp'); c.aboutBio = byId('s-bio').value.trim();
    c.ageGate = byId('s-agegate').checked; c.blurNsfw = byId('s-blur').checked;
    c.allowComments = byId('s-comments').checked; c.reactionsEnabled = byId('s-reactions').checked;
    c.reactionIcon = byId('s-reaction-style').value; c.featuredMode = byId('s-featured').value;
    c.likeLabel = byId('s-like-label').value; c.dislikeLabel = byId('s-dislike-label').value;
    c.metaTitle = val('s-title'); c.metaDescription = val('s-desc');
    c.bgImage = val('s-bgimage'); c.customCss = byId('s-css').value;
    if (c.aboutBio) try { localStorage.setItem(KEYS.bio, c.aboutBio); } catch (e) {}
    const newKey = val('s-newkey');
    if (newKey.length > 5) {
        const t = showToast('Updating your secure token', 'loading');
        const token = await requestTokenGeneration(newKey, sessionPassword);
        dismissToast(t);
        if (token) { globalAuthToken = token; byId('s-newkey').value = ''; showToast('Neocities key updated'); }
        else { showToast('That key didn\'t work, so nothing was saved.', 'error'); return; }
    }
    applyVisualConfig(); renderHome();
    saveSystem();
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
        + '<label class="check span-2"><input type="checkbox" name="pop"' + (t.pop ? ' checked' : '') + '> <span>Let the art pop out of its frame <em>(for art with a see-through background)</em></span></label>'
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
        return { name: v('name'), price: v('price'), color: v('color'), image: v('image'), pop: $('[name="pop"]', r).checked, notes: v('notes') };
    });
}
// Keeps the little preview beside each tier in step with its art, color and name
function refreshTierThumb(row) {
    const img = safeUrl($('[name="image"]', row).value.trim());
    const name = $('[name="name"]', row).value.trim();
    row.style.setProperty('--tc', $('[name="color"]', row).value);
    $('.tier-thumb', row).innerHTML = img ? '<img src="' + esc(img) + '" alt="">' : '<span>' + esc(name.charAt(0).toUpperCase() || '?') + '</span>';
}
function addTier() {
    const tiers = readTierRows();
    tiers.push({ name: '', price: '', color: TIER_COLORS[tiers.length % TIER_COLORS.length], image: '', pop: false, notes: '' });
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
function removeTier(btn) {
    const rows = $$('#cm-tier-list .tier-row');
    const i = rows.indexOf(btn.closest('.tier-row'));
    const tiers = readTierRows();
    const t = tiers[i]; if (!t) return;
    if ((t.name || t.price || t.image || t.notes) && !confirm('Remove the ' + (t.name || 'untitled') + ' tier? It leaves your page when you save.')) return;
    tiers.splice(i, 1);
    renderTierEditor(tiers);
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
        paper: byId('cm-f-paper').value, ink: byId('cm-f-ink').value, tape: byId('cm-f-tapecolor').value
    });
    byId('s-comm-link').value = link;
    renderTierEditor(tiers);
    renderStatus(); renderCommissions();
    saveSystem();
}

/* ═════════════════════════════════════════════
   ADMIN: COLORS & STYLE (palette studio)
   ═════════════════════════════════════════════ */

const Studio = {
    editing: 'dark', draft: null, dirty: false, ring: null,
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
};

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
    renderHero(); renderMarquee();
    saveSystem();
}

let pickerTarget = null;
function openPicker(targetId) {
    pickerTarget = targetId;
    const imgs = [];
    sortPosts(postsCache, 'oldest').reverse().forEach(p => mediaList(p).forEach(u => { if (getMediaType(u) === 'image') imgs.push(u); }));
    byId('picker-grid').innerHTML = imgs.length ? imgs.map(u => '<button type="button" data-action="pick-this" data-url="' + esc(u) + '"><img src="' + esc(u) + '" alt="" loading="lazy"></button>').join('') : '<p class="hint">No image posts yet.</p>';
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
function sizeOf(obj) { try { return new Blob([JSON.stringify(obj)]).size; } catch (e) { return JSON.stringify(obj).length; } }
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
    old() {
        const d = prompt('Delete posts older than how many days?', '365');
        if (!d || isNaN(parseInt(d, 10))) { cleanupLog('Cancelled', 'info'); return {}; }
        const cutoff = Date.now() - parseInt(d, 10) * 86400000, b = postsCache.length;
        if (!confirm('This permanently deletes ' + plural(postsCache.filter(p => p.id < cutoff).length, 'post') + '. Continue?')) { cleanupLog('Cancelled', 'info'); return {}; }
        postsCache = postsCache.filter(p => p.id >= cutoff);
        const r = b - postsCache.length; cleanupLog(r ? 'Deleted ' + plural(r, 'post') + ' older than ' + d + ' days' : 'No posts that old', r ? 'warn' : 'info');
        return { posts: r > 0 };
    },
    nuke() {
        if (!confirm('Erase every like, dislike and comment on your site? This can\'t be undone.')) { cleanupLog('Cancelled', 'info'); return {}; }
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
        changed = { posts: true, comics: true, interactions: true, system: true };
    } else changed = Cleanup[fn]() || {};
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
   FIRST TIME SETUP
   ═════════════════════════════════════════════ */

let setupPreset = 0;
function showSetup() {
    const s = byId('setup'); s.hidden = false;
    document.documentElement.classList.add('is-locked');
    byId('su-presets').innerHTML = DARK_PRESETS.map((pr, i) => '<button type="button" class="preset" data-action="setup-preset" data-index="' + i + '" aria-pressed="' + (i === setupPreset) + '"><span class="strip">' + [0, 4, 3, 6, 1].map(n => '<i style="background:' + pr.colors[n] + '"></i>').join('') + '</span>' + esc(pr.name) + '</button>').join('');
    const backup = readJSON(KEYS.system, null);
    byId('su-restore-box').hidden = !(backup && backup.adminHash && !IS_LOCAL_FILE);
    injectBridge();
}
function hideSetup() { byId('setup').hidden = true; if (!Modals.stack.length) document.documentElement.classList.remove('is-locked'); }

async function generateSystem() {
    const pass = byId('su-pass').value, pass2 = byId('su-pass2').value, key = byId('su-key').value.trim();
    if (pass.length < 8) { showToast('Use at least 8 characters for your password.', 'error'); byId('su-pass').focus(); return; }
    if (pass !== pass2) { showToast('The two passwords don\'t match.', 'error'); byId('su-pass2').focus(); return; }
    if (!key && !IS_LOCAL_FILE) { showToast('Paste your Neocities API key so the site can save itself.', 'error'); byId('su-key').focus(); return; }
    const salt = Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, '0')).join('');
    const hash = await sha256(pass + salt);
    let token = null;
    if (!IS_LOCAL_FILE) {
        const t = showToast('Creating your secure token', 'loading');
        token = await requestTokenGeneration(key, pass);
        dismissToast(t);
        if (!token) { showToast('Neocities didn\'t accept that key. Check it and try again.', 'error'); return; }
    }
    const v = id => byId(id).value.trim();
    const preset = DARK_PRESETS[setupPreset] || DARK_PRESETS[0];
    currentConfig.siteName = v('su-name') || 'NEERG';
    currentConfig.metaTitle = currentConfig.siteName;
    currentConfig.tagline = v('su-tagline'); currentConfig.leafletsName = v('su-feedname') || 'Works';
    currentConfig.copyright = v('su-copyright'); currentConfig.pfpImage = v('su-pfp');
    currentConfig.ageGate = byId('su-agegate').checked;
    currentConfig.reactionsEnabled = byId('su-reactions').checked;
    currentConfig.allowComments = byId('su-comments').checked;
    PALETTE_KEYS.forEach((k, i) => { currentConfig.colors[k] = preset.colors[i]; });
    currentConfig.statusColor = preset.colors[3];
    globalAdminHash = hash; globalSalt = salt; globalAuthToken = token; sessionPassword = pass;
    isAdminLoggedIn = true;
    hideSetup();
    applyVisualConfig(); renderHome();
    if (IS_LOCAL_FILE) { saveDataLocally(); downloadSystemJS(); showToast('Put the downloaded system.js next to index.html.', 'info'); }
    else await saveSystem();
    setHash('#/admin', false); route();
    showToast('Your site is ready. Make your first post.');
}

async function restoreFromBackup() {
    const backup = readJSON(KEYS.system, null);
    if (!backup || !backup.adminHash) return;
    const pass = prompt('Enter the admin password for the saved site:');
    if (!pass) return;
    const hash = backup.salt ? await sha256(pass + backup.salt) : await sha256(pass);
    if (hash !== backup.adminHash) { showToast('That password doesn\'t match the saved site.', 'error'); return; }
    globalAdminHash = backup.adminHash; globalSalt = backup.salt; globalAuthToken = backup.authToken || null;
    mergeConfig(backup.siteConfig);
    postsCache = readJSON(KEYS.posts, []) || [];
    comicsCache = readJSON(KEYS.comics, []) || [];
    sessionPassword = pass; isAdminLoggedIn = true;
    hideSetup(); applyVisualConfig(); renderHome();
    if (!globalAuthToken) { openRepair(); return; }
    await saveSystem(); await savePosts(); await saveComics();
    showToast('Site restored');
}

/* ═════════════════════════════════════════════
   LOADING SCREEN + AGE CHECK
   ═════════════════════════════════════════════ */

const Gate = { active: false, shown: 0, target: 0, raf: 0, done: false };

function ageAccepted() {
    const ok = parseInt(localStorage.getItem(KEYS.age) || '0', 10);
    return ok && Date.now() - ok < AGE_OK_DAYS * 86400000;
}
function gateInit() {
    const gate = byId('gate');
    if (ageAccepted() || document.documentElement.classList.contains('gate-passed')) { gate.hidden = true; return; }
    Gate.active = true;
    document.documentElement.classList.add('is-locked');
    const tick = () => {
        Gate.shown += (Gate.target - Gate.shown) * 0.12 + (Gate.shown < Gate.target ? 0.3 : 0);
        Gate.shown = Math.min(Gate.shown, Gate.target);
        byId('gate-bar').style.width = Gate.shown + '%';
        byId('gate-pct').textContent = Math.floor(Gate.shown) + '%';
        if (Gate.shown >= 99.9 && Gate.done) { cancelAnimationFrame(Gate.raf); setTimeout(gateLoaded, 250); return; }
        Gate.raf = requestAnimationFrame(tick);
    };
    Gate.raf = requestAnimationFrame(tick);
}
function gateProgress(pct) { if (Gate.active) Gate.target = Math.max(Gate.target, pct); }
function gateDataReady() {
    if (!Gate.active) return;
    Gate.target = 100; Gate.done = true;
}
function gateSkip() {
    if (!Gate.active) return;
    cancelAnimationFrame(Gate.raf);
    Gate.active = false;
    byId('gate').hidden = true;
}
function gateLoaded() {
    if (currentConfig.ageGate === false) { gateClose(); return; }
    byId('gate-loader').hidden = true;
    byId('gate-window').hidden = false;
    setTimeout(() => { const y = $('.gate-yes'); if (y) y.focus(); }, 80);
}
function gateClose() {
    const gate = byId('gate');
    gate.classList.add('is-leaving');
    setTimeout(() => { gate.hidden = true; Gate.active = false; if (!Modals.stack.length) document.documentElement.classList.remove('is-locked'); }, 520);
}
function ageGateAccept() {
    try { localStorage.setItem(KEYS.age, String(Date.now())); } catch (e) {}
    const win = byId('gate-window');
    if (reduceMotion()) { gateClose(); return; }
    // The window's outline grows to fill the screen, then the whole thing fades away
    const rect = win.getBoundingClientRect();
    $$('*', win).forEach(el => { el.style.visibility = 'hidden'; });
    Object.assign(win.style, { position: 'fixed', left: rect.left + 'px', top: rect.top + 'px', width: rect.width + 'px', height: rect.height + 'px', background: 'transparent', borderColor: 'var(--text)', animation: 'none', margin: '0', minWidth: '0', zIndex: '1001' });
    win.getBoundingClientRect();
    win.style.transition = ['left', 'top', 'width', 'height', 'border-radius'].map(p => p + ' .75s cubic-bezier(.4,0,.2,1)').join(', ');
    Object.assign(win.style, { left: '0px', top: '0px', width: window.innerWidth + 'px', height: window.innerHeight + 'px', borderRadius: '0' });
    setTimeout(gateClose, 700);
}
function ageGateDeny() {
    byId('gate-body').innerHTML = '<div class="gate-denied"><p class="big" aria-hidden="true">🚫</p><p>Access denied.</p><p>You must be 18+ to view this site.</p></div>';
}

/* ═════════════════════════════════════════════
   DRAG TO REORDER (queues and comic pages)
   ═════════════════════════════════════════════ */

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

/* Swipe left/right on touch screens */
function onSwipe(el, onLeft, onRight) {
    let x0 = null, y0 = null, t0 = 0;
    el.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse') return; x0 = e.clientX; y0 = e.clientY; t0 = Date.now(); }, { passive: true });
    el.addEventListener('pointerup', e => {
        if (x0 === null) return;
        const dx = e.clientX - x0, dy = e.clientY - y0;
        x0 = null;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4 && Date.now() - t0 < 700) { if (dx < 0) onLeft(); else onRight(); }
    }, { passive: true });
}

/* ═════════════════════════════════════════════
   EVENTS
   ═════════════════════════════════════════════ */

const actions = {
    'gate-yes': () => ageGateAccept(),
    'gate-no': () => ageGateDeny(),
    'toggle-theme': () => { toggleDarkLight(); if (Studio.draft && ui.adminTab === 'look' && ui.view === 'admin') { Studio.editing = getMode(); Studio.render(); } },
    'open-menu': () => openMobileMenu(),
    'close-menu': () => closeMobileMenu(),
    'to-top': () => window.scrollTo({ top: 0, behavior: reduceMotion() ? 'auto' : 'smooth' }),

    'open-post': (el, e) => { e.preventDefault(); if (el.dataset.closePost) closePost(); openPost(Number(el.dataset.id), 0, { focus: el.dataset.focus }); },
    'close-post': () => closePost(),
    'post-prev': () => stepPost(-1),
    'post-next': () => stepPost(1),
    'post-img-prev': () => stepImage(-1),
    'post-img-next': () => stepImage(1),
    'zoom-post-image': () => {
        const post = postsCache.find(p => p.id === ui.post.id); if (!post) return;
        const list = mediaList(post).map(url => ({ url, type: getMediaType(url), postId: post.id }));
        openViewer(list, ui.post.img);
    },
    'share-post': el => sharePost(Number(el.dataset.id)),
    'react': el => reactTo(Number(el.dataset.id), el.dataset.type, el),
    'reveal': el => { ui.revealed.add(Number(el.dataset.id)); const t = el.closest('.tile'); if (t) { t.classList.remove('is-veiled'); el.remove(); } },
    'reply': el => openReplyForm(Number(el.dataset.cid)),
    'cancel-reply': el => { const f = el.closest('.reply-form'); if (f) f.remove(); },
    'delete-comment': el => deleteComment(Number(el.dataset.post), Number(el.dataset.cid)),

    'filter-tag': el => {
        const fromPost = !!el.dataset.closePost;
        if (fromPost) closePost();
        ui.feed.tag = el.dataset.tag || 'all'; ui.feed.limit = FEED_STEP;
        renderTagChips(); renderFeed();
        setTimeout(() => {
            if (ui.view !== 'home') { setHash('#/', false); route(); }
            scrollToFeed();
        }, fromPost ? 320 : 0);
    },
    'clear-filters': () => { ui.feed.tag = 'all'; ui.feed.q = ''; byId('feed-search').value = ''; renderTagChips(); renderFeed(); },
    'feed-more': () => { ui.feed.limit += FEED_STEP; renderFeed(); },
    'featured-prev': () => featuredGo(ui.featured.i - 1),
    'featured-next': () => featuredGo(ui.featured.i + 1),
    'featured-go': el => featuredGo(Number(el.dataset.index)),

    'gallery-mode': el => { ui.gallery.mode = el.dataset.mode; ui.gallery.board = null; renderGallery(); },
    'open-board': el => { ui.gallery.board = el.dataset.key; renderGallery(); window.scrollTo(0, 0); },
    'close-board': () => { ui.gallery.board = null; renderGallery(); },
    'open-viewer': el => {
        const list = galleryLists[el.dataset.list] || [];
        const i = Number(el.dataset.index);
        const item = list[i];
        if (item && currentConfig.blurNsfw && item.nsfw && !ui.revealed.has(item.postId)) {
            ui.revealed.add(item.postId); el.classList.remove('is-veiled'); const v = $('.veil', el); if (v) v.remove(); return;
        }
        openViewer(list, i);
    },
    'close-viewer': () => closeViewer(),
    'viewer-prev': () => stepViewer(-1),
    'viewer-next': () => stepViewer(1),
    'viewer-zoom': () => byId('viewer').classList.toggle('is-zoomed'),
    'viewer-open-post': () => { const m = ui.viewer.list[ui.viewer.i]; if (!m) return; closeViewer(); openPost(m.postId); },

    'open-comic': (el, e) => { e.preventDefault(); openComicGallery(Number(el.dataset.id)); },
    'close-comic': () => closeComicGallery(),
    'read-comic': el => openReader(Number(el.dataset.id), Number(el.dataset.page)),
    'close-reader': () => closeReader(),
    'reader-prev': () => crGo(ui.reader.page - 1),
    'reader-next': () => crGo(ui.reader.page + 1),
    'reader-go': el => crGo(Number(el.dataset.page)),
    'reader-fit': el => { const r = byId('reader'); const on = !r.classList.contains('is-fit-width'); r.classList.toggle('is-fit-width', on); el.setAttribute('aria-pressed', String(on)); el.textContent = on ? 'Fit height' : 'Fit width'; },

    'modal-close': el => { const m = el.closest('.overlay'); if (m) Modals.close(m); },

    // Admin
    'logout': () => logoutAdmin(),
    'admin-tab': el => showAdminTab(el.dataset.tab),
    'force-sync': () => forceSyncAll(),
    'open-cleanup': () => openCleanupPanel(),
    'download-backup': () => downloadBackup(),
    'recovery-restore': () => recoveryRestore(),
    'recovery-dismiss': () => recoveryDismiss(),
    'repair-run': () => runRepair(),
    'toggle-chip': el => el.setAttribute('aria-pressed', String(el.getAttribute('aria-pressed') !== 'true')),
    'np-add-url': () => addUrlToQueue(),
    'queue-move': el => { const i = Number(el.dataset.index), j = i + Number(el.dataset.dir); if (j < 0 || j >= currentPostMediaQueue.length) return; [currentPostMediaQueue[i], currentPostMediaQueue[j]] = [currentPostMediaQueue[j], currentPostMediaQueue[i]]; renderMediaQueue(); },
    'queue-remove': el => { currentPostMediaQueue.splice(Number(el.dataset.index), 1); renderMediaQueue(); },
    'publish-post': () => createPost(),
    'bulk-upload': () => bulkUpload(),
    'edit-post': el => { const id = Number(el.dataset.id); editingPostId = editingPostId === id ? null : id; renderManagePosts(); },
    'edit-remove-media': el => el.closest('.mm').classList.toggle('is-removed'),
    'toggle-pin': el => togglePin(el.dataset.id),
    'delete-post': el => deletePost(el.dataset.id),
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
    'studio-mode': el => Studio.switchMode(el.dataset.mode),
    'studio-preset': el => Studio.applyPreset(Number(el.dataset.index)),
    'studio-generate': () => Studio.generate(),
    'studio-save': () => Studio.save(),
    'studio-discard': () => Studio.discard(),
    'ring-preset': el => Studio.ringPreset(Number(el.dataset.index)),
    'banner-mode': el => { bannerDraftMode = el.dataset.mode; syncBannerForm(); },
    'banner-save': () => saveBannerSettings(),
    'pick-image': el => openPicker(el.dataset.target),
    'pick-this': el => {
        const t = byId(pickerTarget); if (t) { t.value = el.dataset.url; t.dispatchEvent(new Event('input', { bubbles: true })); }
        Modals.close(byId('picker-modal'));
    },
    'link-add': () => addLinkRow('', '', ''),
    'link-remove': el => el.closest('.link-row').remove(),
    'links-save': () => saveSocialLinks(),
    'cleanup': el => runCleanup(el.dataset.fn, el),
    'setup-create': () => generateSystem(),
    'setup-restore': () => restoreFromBackup(),
    'setup-preset': el => { setupPreset = Number(el.dataset.index); $$('#su-presets .preset').forEach((b, i) => b.setAttribute('aria-pressed', String(i === setupPreset))); }
};

function scrollToFeed() {
    const f = byId('feed-tools'); if (!f) return;
    const y = f.parentElement.getBoundingClientRect().top + window.scrollY - 80;
    if (window.scrollY > y || window.scrollY < y - window.innerHeight) window.scrollTo({ top: y, behavior: reduceMotion() ? 'auto' : 'smooth' });
}

function bindEvents() {
    document.addEventListener('click', e => {
        const el = e.target.closest('[data-action]');
        if (!el) {
            // Click on the dark area around a modal card closes it
            const top = Modals.top();
            if (top && e.target === top.el && top.el.classList.contains('modal')) top.onRequestClose();
            if (top && top.el.id === 'viewer' && (e.target.id === 'viewer-media' || e.target === top.el)) closeViewer();
            if (top && top.el.id === 'post-overlay' && (e.target.id === 'post-media' || e.target.id === 'post-stage')) closePost();
            const link = e.target.closest('[data-view-link]');
            if (link) closeMobileMenu();
            return;
        }
        const fn = actions[el.dataset.action];
        if (fn) fn(el, e);
    });

    document.addEventListener('submit', e => {
        const form = e.target;
        if (form.id === 'login-form') { e.preventDefault(); loginAdmin(); return; }
        const kind = form.dataset.form;
        if (!kind) return;
        e.preventDefault();
        if (kind === 'comment') {
            const name = byId('comment-name');
            if (addComment(ui.post.id, name ? name.value : '', byId('comment-text').value)) byId('comment-text').value = '';
        } else if (kind === 'reply') {
            const name = $('input', form);
            if (addComment(ui.post.id, name ? name.value : '', $('textarea', form).value, Number(form.dataset.cid))) form.remove();
        } else if (kind === 'edit-post') saveEditedPost(form);
        else if (kind === 'edit-comic') saveEditedComic(form);
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            if (byId('mobile-menu').classList.contains('is-open')) { closeMobileMenu(); byId('menu-btn').focus(); return; }
            if (Modals.requestCloseTop()) e.preventDefault();
            return;
        }
        if (e.key === 'Tab' && Modals.top()) { Modals.trapTab(e); return; }
        const tag = (document.activeElement && document.activeElement.tagName) || '';
        if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) return;
        const top = Modals.top(); if (!top) return;
        const id = top.el.id;
        if (id === 'reader') {
            if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); crGo(ui.reader.page + 1); }
            if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); crGo(ui.reader.page - 1); }
        } else if (id === 'viewer') {
            if (e.key === 'ArrowRight') { e.preventDefault(); stepViewer(1); }
            if (e.key === 'ArrowLeft') { e.preventDefault(); stepViewer(-1); }
        } else if (id === 'post-overlay') {
            if (e.key === 'ArrowRight') { e.preventDefault(); stepImage(1); }
            if (e.key === 'ArrowLeft') { e.preventDefault(); stepImage(-1); }
        }
    });

    // Feed search and sort
    const search = byId('feed-search');
    search.addEventListener('input', debounce(() => { ui.feed.q = search.value; ui.feed.limit = FEED_STEP; renderFeed(); }, 180));
    byId('feed-sort').addEventListener('change', e => { ui.feed.sort = e.target.value; ui.feed.limit = FEED_STEP; renderFeed(); });
    byId('mp-search').addEventListener('input', debounce(renderManagePosts, 150));

    // Featured carousel follows manual swipes
    const ft = byId('featured-track');
    ft.addEventListener('scroll', debounce(() => {
        const cards = $$('.feat', ft); if (!cards.length) return;
        const step = cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : ft.clientWidth;
        ui.featured.i = clamp(Math.round(ft.scrollLeft / step), 0, featuredStops() - 1);
        syncFeaturedDots();
    }, 80), { passive: true });

    // Images fade in once loaded
    document.addEventListener('load', e => { if (e.target.tagName === 'IMG') e.target.classList.remove('is-loading'); }, true);
    document.addEventListener('error', e => {
        if (e.target.tagName !== 'IMG') return;
        e.target.classList.remove('is-loading');
        const tile = e.target.closest('.masonry-item'); if (tile) { tile.hidden = true; return; }
        if (e.target.closest('.tile-media, .feat-media, .hero-panel, .board-cover, .comic-cover, .page-thumb, .m-thumb')) e.target.classList.add('is-broken');
    }, true);

    // Hover to play video previews
    document.addEventListener('mouseover', e => { const v = e.target.closest && e.target.closest('[data-hoverplay]'); if (v) v.play().catch(() => {}); });
    document.addEventListener('mouseout', e => { const v = e.target.closest && e.target.closest('[data-hoverplay]'); if (v) v.pause(); });

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

    onSwipe(byId('post-stage'), () => stepImage(1), () => stepImage(-1));
    onSwipe(byId('viewer'), () => stepViewer(1), () => stepViewer(-1));
    onSwipe(byId('rd-stage'), () => crGo(ui.reader.page + 1), () => crGo(ui.reader.page - 1));

    window.addEventListener('hashchange', route);
    window.addEventListener('message', handleBridgeMessage);
    window.addEventListener('scroll', () => { if (!scrollTicking) { scrollTicking = true; requestAnimationFrame(updateScrollState); } }, { passive: true });
    window.addEventListener('resize', debounce(() => { updateNavPill(); updateScrollState(); fitHome(); }, 100));
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(updateNavPill);
    document.addEventListener('visibilitychange', () => { if (!document.hidden && pendingOps.length) scheduleInteractionsSync(); });
}

/* ═════════════════════════════════════════════
   START
   ═════════════════════════════════════════════ */

async function init() {
    if (window.marked && window.marked.setOptions) window.marked.setOptions({ breaks: true, gfm: true });
    bindEvents();
    gateInit();
    applyTheme();
    gateProgress(8);

    let loaded = 0;
    const files = ['system.js', 'posts.js', 'comics.js', 'interactions.js'];
    await Promise.all(files.map(f => loadScript(f).then(() => { loaded++; gateProgress(10 + loaded * 20); })));

    const hasSystem = parseSystemData();
    applyVisualConfig();
    renderHome();
    dataReady = true;
    route();
    if (!hasSystem) { gateSkip(); showSetup(); }
    else gateDataReady();
    if (!IS_LOCAL_FILE) setTimeout(injectBridge, 600);
    if (pendingOps.length) setTimeout(() => scheduleInteractionsSync(), 2500);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();