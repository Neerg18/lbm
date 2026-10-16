/*
 ╔══════════════════════════════════════════════════════════════════╗
 ║  NEERG v7 · logic.js                                             ║
 ║  Built on the LBM bridge pattern by applesaucy.                  ║
 ║                                                                  ║
 ║  The admin tools live in admin.js, loaded when Admin opens.      ║
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
    comicProgress: 'neerg_comic_progress',
    shrinkLeftovers: 'neerg_shrink_leftovers',
    shrinkSkipped: 'neerg_shrink_skipped',
    aotdSeen: 'neerg_aotd_seen'
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
    { name: 'Vintage', colors: ['#1A1408', '#FAF2E0', '#2A2010', '#D4A843', '#221A08', '#342A18', '#E06432'] },
    { name: 'Evening Walk', colors: ['#1F3434', '#F1D49A', '#2A4343', '#D35E36', '#253C3C', '#416B66', '#C0C29D'] },
    { name: 'Retro Poster', colors: ['#1C1C1C', '#F2E8D5', '#262E2D', '#C94E44', '#222727', '#3E6868', '#C1AB85'] },
    { name: 'Aurora Pastel', colors: ['#15122A', '#E5EBF8', '#211C3D', '#F4A4F5', '#1B1734', '#352E5C', '#BEFFEA'] },
    { name: 'Terracotta', colors: ['#2E1818', '#F5DFBB', '#452424', '#F2542D', '#3A1F1F', '#5E3434', '#0E9594'] },
    { name: 'Palace Spring', colors: ['#12233A', '#FFF6E8', '#1B3150', '#FA9058', '#172A45', '#2A4468', '#FECC64'] },
    { name: 'Peach Fuzz', colors: ['#1A1730', '#FFEEDD', '#262145', '#9381FF', '#201C3B', '#3A3366', '#FFD8BE'] },
    { name: 'Neon Lights', colors: ['#14122E', '#EEF0FF', '#222174', '#E23D8B', '#1B1A50', '#2A28AD', '#5DEA90'] },
    { name: 'Mysterious Depths', colors: ['#0C0827', '#E6E8FF', '#14194D', '#1EA598', '#100F38', '#25387A', '#5950B8'] },
    { name: 'Volcanic Ash', colors: ['#212529', '#E9ECEF', '#2B3035', '#FB5607', '#262A2F', '#3A4047', '#8338EC'] },
    { name: 'Dragon Tales', colors: ['#2A1D2A', '#F6EEDC', '#4B344B', '#F93C0A', '#3A283A', '#5E465E', '#ADDCCC'] },
    { name: 'Wildflower', colors: ['#172A1F', '#EAF3F8', '#264431', '#EAA043', '#1F3829', '#3A5A47', '#BED9EB'] }
];
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

// Commissions poster (Admin, Commissions). New tiers take these colors in turn.
const TIER_COLORS = ['#35E04A', '#5B2EE8', '#C04BFF', '#FF6B2C', '#00B8F5', '#FF3D7F'];
const HAZARD_WORDS = ['COMMISSIONS CLOSED', 'CLOSED', 'CHECK BACK SOON'];
const COMM_DEFAULTS = { open: true, title: '', handle: '', contact: '', button: '', tiers: [], terms: '', termsImage: '', tapeWords: [], closedNote: '', paper: '#DFDAD0', ink: '#161616', tape: '#3AA6F2' };
// Hazard tapes all over the page while closed: [kind (y yellow, k black, s stripes), distance down the page in %, tilt in degrees]
const HAZARD_LAYOUT = [['y', 5, -6], ['s', 13, 10], ['k', 21, 3], ['y', 30, -9], ['s', 38, 6], ['k', 46, -4], ['y', 55, 8], ['s', 63, -11], ['k', 71, 4], ['y', 79, -6], ['s', 87, 9], ['k', 94, -3]];
// Comic "POW" burst behind each price, tinted with the tier's color (viewBox 0 0 220 150)
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
    socialLinks: [], bannerSettings: null, aboutBio: '', aboutStyle: 'broadcast',
    commissionStatus: 'AVAILABLE FOR COMMISSIONS', statusColor: '#FB3640',
    commissionsInfo: '', commissionsLink: '',
    ageGate: true, featuredMode: 'recent', recommendedComic: '', blurNsfw: false, webpUploads: true,
    artOfToday: true, aotd: null,
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
    featured: { i: 0, timer: null, stops: 0, list: [] },
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
    return new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(atob(str), c => c.charCodeAt(0)));
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
function readText(key) {
    try { return localStorage.getItem(key) || ''; } catch (e) { return ''; }
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
   ARE YOU SURE? (in place of the browser's confirm box)
   Anything that deletes asks you to press and hold, so a slip of the finger can't remove it.
   Hold idea from React Bits (reactbits.dev)
   ═════════════════════════════════════════════ */

const HOLD_MS = 1000;
const Confirm = { resolve: null, holding: null, pointer: null, rect: null, down: 0, p: 0, raf: 0 };

// Resolves true or false. opts: { hold, title, yes } (hold: a press-and-hold button labeled with `yes`)
function askConfirm(text, opts = {}) {
    if (Confirm.resolve) finishConfirm(false);
    const el = byId('confirm-modal'), hold = byId('confirm-hold');
    byId('confirm-heading').textContent = opts.title || (opts.hold ? 'Are you sure?' : 'Continue?');
    byId('confirm-text').textContent = text;
    byId('confirm-yes').hidden = !!opts.hold;
    byId('confirm-yes').textContent = opts.yes || 'OK';
    hold.hidden = !opts.hold;
    $$('.hold-label', hold).forEach(s => { s.textContent = opts.yes || 'Hold to delete'; });
    holdSet(0); hold.classList.remove('is-holding', 'is-done');
    byId('confirm-hint').hidden = !opts.hold;
    byId('confirm-hint').textContent = 'Press and hold until the button fills up.';
    return new Promise(resolve => {
        Confirm.resolve = resolve;
        Modals.open(el, { onRequestClose: () => finishConfirm(false), focus: opts.hold ? '#confirm-hold' : '#confirm-yes' });
    });
}
function finishConfirm(ok) {
    const resolve = Confirm.resolve; if (!resolve) return;
    Confirm.resolve = null; Confirm.holding = null; Confirm.pointer = null;
    cancelAnimationFrame(Confirm.raf);
    Modals.close(byId('confirm-modal'));
    resolve(ok);
}

function holdSet(p) { Confirm.p = p; byId('confirm-hold').style.setProperty('--hold', p.toFixed(4)); }
// Fills toward 1 at a steady speed while held; drains back quickly when let go early
function holdDrive(to, ms, ease) {
    cancelAnimationFrame(Confirm.raf);
    const from = Confirm.p, start = performance.now();
    const step = now => {
        const t = ms > 0 ? Math.min(1, (now - start) / ms) : 1;
        holdSet(from + (to - from) * ease(t));
        if (t < 1) Confirm.raf = requestAnimationFrame(step);
        else if (to === 1 && Confirm.holding) holdDone();
    };
    Confirm.raf = requestAnimationFrame(step);
}
function holdStart(kind) {
    if (Confirm.holding || !Confirm.resolve) return;
    const btn = byId('confirm-hold');
    Confirm.holding = kind; Confirm.down = performance.now(); Confirm.rect = btn.getBoundingClientRect();
    btn.classList.add('is-holding');
    holdDrive(1, HOLD_MS * (1 - Confirm.p), t => t);
}
function holdRelease(drifted) {
    if (!Confirm.holding) return;
    Confirm.holding = null; Confirm.pointer = null;
    byId('confirm-hold').classList.remove('is-holding');
    if (!drifted && performance.now() - Confirm.down < 250) byId('confirm-hint').textContent = 'Keep holding: let go once the button is full.';
    holdDrive(0, 200, t => 1 - Math.pow(1 - t, 3));
}
function holdDone() {
    Confirm.holding = null; Confirm.pointer = null;
    byId('confirm-hold').classList.add('is-done');
    try { if (navigator.vibrate) navigator.vibrate(12); } catch (e) {}
    setTimeout(() => finishConfirm(true), reduceMotion() ? 0 : 160);
}
function bindHoldButton() {
    const btn = byId('confirm-hold');
    btn.addEventListener('pointerdown', e => {
        if (e.button !== 0 || !e.isPrimary || Confirm.holding) return;
        Confirm.pointer = e.pointerId;
        try { btn.setPointerCapture(e.pointerId); } catch (err) {}
        holdStart('pointer');
    });
    btn.addEventListener('pointermove', e => {
        const r = Confirm.rect;
        if (e.pointerId !== Confirm.pointer || !r) return;
        // Sliding off the button cancels, like letting go
        if (e.clientX < r.left - 10 || e.clientX > r.right + 10 || e.clientY < r.top - 10 || e.clientY > r.bottom + 10) holdRelease(true);
    });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => btn.addEventListener(type, e => {
        if (e.pointerId === Confirm.pointer) holdRelease(type !== 'pointerup');
    }));
    btn.addEventListener('keydown', e => {
        if (e.key !== ' ' && e.key !== 'Enter') return;
        e.preventDefault();
        if (!e.repeat) holdStart('key');
    });
    btn.addEventListener('keyup', e => {
        if ((e.key === ' ' || e.key === 'Enter') && Confirm.holding === 'key') { e.preventDefault(); holdRelease(false); }
    });
    btn.addEventListener('blur', () => holdRelease(true));
    btn.addEventListener('contextmenu', e => e.preventDefault());
}

/* ═════════════════════════════════════════════
   TOOLTIPS (buttons that only show an icon)
   The first one waits a moment; while one is up, the next shows right away.
   Warm-up idea from React Bits (reactbits.dev)
   ═════════════════════════════════════════════ */

const TIP_DELAY = 450, TIP_WARM = 300;
const Tip = { target: null, timer: 0, hideTimer: 0, warmUntil: 0 };

function tipTarget(node) {
    const t = node && node.closest ? node.closest('button[aria-label], a[aria-label]') : null;
    if (!t || t.disabled || t.getAttribute('aria-hidden') === 'true' || t.hidden) return null;
    // Only icon buttons: anything with words or a picture on it already explains itself
    if (/[\p{L}\p{N}]/u.test(t.textContent) || t.querySelector('img, video, canvas')) return null;
    return t;
}
function tipArm(t) {
    clearTimeout(Tip.timer);
    const warm = !byId('tip').hidden || performance.now() < Tip.warmUntil;
    Tip.target = t;
    if (warm) tipShow(t); else Tip.timer = setTimeout(() => tipShow(t), TIP_DELAY);
}
function tipShow(t) {
    const tip = byId('tip');
    if (!document.contains(t) || !t.getAttribute('aria-label')) return;
    clearTimeout(Tip.hideTimer);
    tip.textContent = t.getAttribute('aria-label');
    tip.hidden = false;
    const r = t.getBoundingClientRect(), w = tip.offsetWidth, h = tip.offsetHeight, gap = 9;
    const below = r.top - h - gap < 8;
    const left = clamp(r.left + r.width / 2 - w / 2, 8, Math.max(8, innerWidth - w - 8));
    tip.dataset.side = below ? 'bottom' : 'top';
    tip.style.left = left + 'px';
    tip.style.top = (below ? r.bottom + gap : r.top - h - gap) + 'px';
    tip.style.setProperty('--tip-arrow', clamp(r.left + r.width / 2 - left, 10, w - 10) + 'px');
    requestAnimationFrame(() => tip.classList.add('is-on'));
}
function tipHide(instant) {
    clearTimeout(Tip.timer);
    const tip = byId('tip');
    if (!tip.hidden) Tip.warmUntil = performance.now() + TIP_WARM;
    Tip.target = null;
    tip.classList.remove('is-on');
    clearTimeout(Tip.hideTimer);
    if (instant || reduceMotion()) tip.hidden = true;
    else Tip.hideTimer = setTimeout(() => { if (!tip.classList.contains('is-on')) tip.hidden = true; }, 160);
}
function bindTooltips() {
    document.addEventListener('pointerover', e => {
        if (e.pointerType === 'touch') return;
        const t = tipTarget(e.target);
        if (t === Tip.target) return;
        if (t) tipArm(t); else if (Tip.target) tipHide();
    });
    document.addEventListener('pointerout', e => { if (!e.relatedTarget && Tip.target) tipHide(); });
    // Keyboard users get the label as soon as they tab onto the button
    document.addEventListener('focusin', e => {
        const t = tipTarget(e.target);
        if (t && t.matches(':focus-visible')) { Tip.target = t; tipShow(t); }
    });
    document.addEventListener('focusout', e => { if (Tip.target && e.target === Tip.target) tipHide(); });
    document.addEventListener('pointerdown', () => { if (Tip.target) tipHide(true); }, true);
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && Tip.target) tipHide(true); }, true);
    window.addEventListener('scroll', () => { if (Tip.target) tipHide(true); }, { capture: true, passive: true });
    window.addEventListener('resize', () => { if (Tip.target) tipHide(true); });
}

/* ═════════════════════════════════════════════
   GLASS GLARE (gallery boards, comic cards, commission tiers)
   A shine sweeps across a card when the pointer comes on and again as it goes off,
   in the direction it moved. Idea from React Bits' Glare Hover (reactbits.dev)
   ═════════════════════════════════════════════ */

const GLARE_ANGLE = -45, GLARE_SIZE = .3, GLARE_MS = 650;
const glares = new WeakMap();

// Cards opt in with data-glare; a commission tier shines on its picture frame
function glareSurface(host) { return $('.cm-frame', host) || host; }
function glareFor(host) {
    let g = glares.get(host);
    if (g) return g;
    const surface = glareSurface(host);
    const layer = document.createElement('span');
    layer.className = 'glare'; layer.setAttribute('aria-hidden', 'true');
    layer.innerHTML = '<span class="glare-band"></span><span class="glare-rim"><span class="glare-band"></span></span>';
    surface.appendChild(layer);
    g = { surface, bands: $$('.glare-band', layer), pos: -1e4, reach: 0, ux: 0, uy: 0, run: null, raf: 0 };
    glares.set(host, g);
    return g;
}
function glareMeasure(g) {
    const w = g.surface.clientWidth, h = g.surface.clientHeight, rad = GLARE_ANGLE * Math.PI / 180;
    const diag = Math.hypot(w, h), band = Math.max(8, diag * GLARE_SIZE);
    g.ux = Math.sin(rad); g.uy = -Math.cos(rad);
    g.reach = (Math.abs(w * g.ux) + Math.abs(h * g.uy)) / 2 + band / 2 + 2;
    g.bands.forEach(b => { b.style.width = band + 'px'; b.style.height = (diag + band) + 'px'; });
    if (!g.run) g.pos = g.pos > 0 ? g.reach : -g.reach;
    glareDraw(g);
}
function glareDraw(g) {
    const t = 'translate(-50%, -50%) rotate(' + (GLARE_ANGLE - 90) + 'deg) translateX(' + g.pos.toFixed(1) + 'px)';
    g.bands.forEach(b => { b.style.transform = t; });
}
// Positive when the point is on the side the shine travels toward
function glareSide(g, e) {
    const r = g.surface.getBoundingClientRect();
    return (e.clientX - r.left - r.width / 2) * g.ux + (e.clientY - r.top - r.height / 2) * g.uy;
}
function glareSweep(g, sign) {
    if (reduceMotion() || !g.reach) return;
    const to = sign * g.reach;
    const from = g.run || Math.abs(g.pos) < g.reach ? g.pos : -to;
    if (from === to) return;
    g.run = { from, to, start: performance.now(), ms: Math.max(120, GLARE_MS * Math.abs(to - from) / (2 * g.reach)) };
    cancelAnimationFrame(g.raf);
    const step = now => {
        const run = g.run; if (!run) return;
        const t = Math.min(1, (now - run.start) / run.ms);
        g.pos = run.from + (run.to - run.from) * (1 - Math.cos(Math.PI * t)) / 2;
        glareDraw(g);
        if (t < 1) g.raf = requestAnimationFrame(step); else g.run = null;
    };
    g.raf = requestAnimationFrame(step);
}
function bindGlare() {
    const hostOf = n => n && n.closest ? n.closest('[data-glare]') : null;
    document.addEventListener('pointerover', e => {
        const host = hostOf(e.target);
        if (!host || e.pointerType === 'touch' || hostOf(e.relatedTarget) === host) return;
        const g = glareFor(host); glareMeasure(g);
        glareSweep(g, glareSide(g, e) > 0 ? -1 : 1);
    });
    document.addEventListener('pointerout', e => {
        const host = hostOf(e.target);
        if (!host || e.pointerType === 'touch' || hostOf(e.relatedTarget) === host || !glares.has(host)) return;
        const g = glares.get(host);
        glareSweep(g, glareSide(g, e) > 0 ? 1 : -1);
    });
    document.addEventListener('focusin', e => {
        const host = hostOf(e.target);
        if (!host || !e.target.matches(':focus-visible')) return;
        const g = glareFor(host); glareMeasure(g); glareSweep(g, 1);
    });
}

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
        '--status': normalizeHex(currentConfig.statusColor, p.accent),
        ...zineVars(p)
    };
}

/* Gallery and Comics: the six paper colors their cards take in turn, drawn from the palette so the zine follows
   the theme. Colors too close to the desk or to a card already picked are skipped; shifted hues of the accent and
   the classic zine colors fill any gaps. Each card gets dark or cream ink, whichever reads better. */
function zinePalette(p) {
    const mix = (a, b, t) => { const x = hexToRgb(a), y = hexToRgb(b); return '#' + ['r', 'g', 'b'].map(k => Math.round(x[k] + (y[k] - x[k]) * t).toString(16).padStart(2, '0')).join('').toUpperCase(); };
    const turn = (hex, deg) => { const [h, sat, l] = hexToHsl(hex); return hslToHex(h + deg, sat, l); };
    const far = (a, b) => { const x = hexToRgb(a), y = hexToRgb(b); return Math.hypot(x.r - y.r, x.g - y.g, x.b - y.b) >= 55; };
    const picks = [];
    [p.accent, p.navActive, p.text, p.border, mix(p.accent, p.navActive, .5), mix(p.accent, p.text, .5), mix(p.navActive, p.text, .5),
        mix(p.accent, p.bg, .35), mix(p.navActive, p.bg, .35), turn(p.accent, 35), turn(p.accent, -35), turn(p.navActive, 35), turn(p.navActive, -35),
        turn(p.accent, 180)].concat(ZINE_COLORS).forEach(c => {
        if (picks.length < 6 && contrastRatio(c, p.bg) >= 1.4 && picks.every(o => far(o, c))) picks.push(c);
    });
    return picks;
}
// The zine's soft ink or cream when it reads well (4.5:1), otherwise plain black or white
function zineInk(c) {
    const soft = contrastRatio(c, ZINE_INK) >= contrastRatio(c, ZINE_CREAM) ? ZINE_INK : ZINE_CREAM;
    return contrastRatio(c, soft) >= 4.5 ? soft : inkFor(c);
}
function zineVars(p) {
    const v = {};
    zinePalette(p).forEach((c, i) => { v['--zc-' + i] = c; v['--zi-' + i] = zineInk(c); });
    return v;
}
// Inline style giving a card the n-th zine color and its ink
function zineSlot(n) { n %= 6; return '--zc:var(--zc-' + n + ');--zg-ink:var(--zi-' + n + ')'; }
function setZineSlot(el, n) { n %= 6; el.style.setProperty('--zc', 'var(--zc-' + n + ')'); el.style.setProperty('--zg-ink', 'var(--zi-' + n + ')'); }

function applyPalette(p) {
    const root = document.documentElement;
    const vars = paletteVars(p);
    Object.keys(vars).forEach(k => root.style.setProperty(k, vars[k]));
    const meta = $('meta[name="theme-color"]'); if (meta) meta.setAttribute('content', p.bg);
    return vars;
}

// The palette studio's draft. Its editor loads with admin.js; the state lives here so the theme can preview it.
const Studio = { editing: 'dark', draft: null, dirty: false, ring: null };

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

    ['brand-name', 'hero-name', 'footer-name'].forEach(id => { const n = byId(id); if (n) n.textContent = name; });
    const fb = byId('hero-fallback'); if (fb) fb.textContent = name.trim().charAt(0).toUpperCase() || '✦';
    const tg = byId('hero-tagline'); if (tg) { tg.textContent = cfg.tagline || ''; tg.hidden = !cfg.tagline; }
    const fc = byId('footer-copy'); if (fc) fc.textContent = cfg.copyright ? '© ' + cfg.copyright : '';
    const ft = byId('feed-title'); if (ft) ft.textContent = 'Recent ' + (cfg.leafletsName || 'works').toLowerCase();

    // Profile picture everywhere
    const pfp = safeUrl(cfg.pfpImage && cfg.pfpImage.length > 4 ? cfg.pfpImage : '');
    [['brand-pfp', null], ['hero-pfp', 'hero-fallback']].forEach(([imgId, fbId]) => {
        const img = byId(imgId); if (!img) return;
        const fb = fbId ? byId(fbId) : null;
        if (pfp) {
            img.onerror = () => { img.hidden = true; if (fb) fb.hidden = false; };
            img.src = pfp; img.hidden = false; if (fb) fb.hidden = true;
        } else { img.hidden = true; img.removeAttribute('src'); if (fb) fb.hidden = false; }
    });

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
    const card = byId('feat-comm'); if (card) card.hidden = !text;
    $$('.feat-comm-text').forEach(n => { n.textContent = text; });
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
    return '<article class="cm-tier' + (img && t.pop ? ' is-pop' : '') + '" style="--tc:' + color + ';--chars:' + Math.max(name.length, 4) + '" data-glare>'
        + ARROWS_SVG
        + '<div class="cm-frame"><h2 class="cm-name"><span>' + esc(name) + '</span></h2>' + art + '</div>'
        + '<span class="cm-ticks" aria-hidden="true"></span>'
        + (notes ? '<div class="cm-info"><span class="cm-bang" aria-hidden="true">!</span><div class="cm-notes">' + md(notes) + '</div></div>' : '')
        + (price ? '<p class="cm-price" style="--pc:' + Math.max(price.length, 3) + '">' + burstSVG('cm-burst-' + i) + '<span class="sr-only">Price: </span><span class="cm-price-text">' + esc(price) + '</span></p>' : '')
        + '</article>';
}

// Colors come from the tier's own color in CSS (.cm-burst rules); the attributes are only a fallback
function burstSVG(id) {
    return '<svg class="cm-burst" viewBox="0 0 220 150" aria-hidden="true"><defs><radialGradient id="' + id + '" cx="50%" cy="50%" r="55%"><stop class="b-s0" offset="0" stop-color="#FFE34A"/><stop class="b-s1" offset=".5" stop-color="#FF9B30"/><stop class="b-s2" offset="1" stop-color="#EE3F2A"/></radialGradient></defs>'
        + '<path class="b-out" d="' + BURST_PATH + '" fill="#C3141B" stroke="#C3141B" stroke-width="22" stroke-linejoin="miter" stroke-miterlimit="12"/>'
        + '<path class="b-band" d="' + BURST_PATH + '" fill="#FFE21C" stroke="#FFE21C" stroke-width="16" stroke-linejoin="miter" stroke-miterlimit="12"/>'
        + '<path class="b-fill" d="' + BURST_PATH + '" fill="url(#' + id + ')" stroke="#D9351E" stroke-width="2"/></svg>';
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
        return '<a href="' + esc(safeUrl(l.url)) + '" target="_blank" rel="noopener me" aria-label="' + esc(label) + '"><i class="' + PLATFORMS[key].icon + '" aria-hidden="true"></i></a>';
    });
    const hero = byId('hero-social'); if (hero) hero.innerHTML = icons.slice(0, 5).join('');
    ['menu-social', 'footer-social'].forEach(id => { const n = byId(id); if (n) n.innerHTML = icons.join(''); });
    const pills = links.map(l => {
        const key = normalizePlatform(l.platform);
        const brand = PLATFORMS[key].color;
        return '<a class="link-pill" href="' + esc(safeUrl(l.url)) + '" target="_blank" rel="noopener me"' + (brand ? ' style="--brand:' + brand + '"' : '') + '><i class="' + PLATFORMS[key].icon + '" aria-hidden="true"></i>' + esc(l.label || l.platform) + '</a>';
    }).join('');
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

/* A data file that exists but didn't load (offline, server hiccup) must never be saved over from this page:
   the save would replace the live file with this page's empty copy. A file that isn't there yet is fine. */
const loadFailed = new Set();
const LOAD_FAILED_MSG = 'Some of your site\'s files didn\'t load, so saving is paused to keep them safe. Refresh the page and try again.';
async function noteLoadFailure(src) {
    if (IS_LOCAL_FILE) return;
    try { const r = await fetch(src + '?v=' + Date.now(), { method: 'HEAD', cache: 'no-store' }); if (r.status === 404) return; } catch (e) {}
    loadFailed.add(src);
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
    let raw = location.hash.replace(/^#\/?/, '');
    try { raw = decodeURIComponent(raw); } catch (e) {}
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

/* ═════════════════════════════════════════════
   ABOUT
   The cover picked in Admin (about.js, about.css and its fonts) loads the first time About opens
   and only runs while About is on screen. Bump ABOUT_VERSION after changing about.js or about.css.
   ═════════════════════════════════════════════ */

const ABOUT_VERSION = '1';
const ABOUT_STYLES = ['broadcast', 'mixtape', 'spectrum'];
let aboutLoading = null, aboutShown = '';
function loadAbout() {
    if (window.NeergAbout) return Promise.resolve(window.NeergAbout);
    if (aboutLoading) return aboutLoading;
    const css = new Promise(resolve => {
        const l = document.createElement('link');
        l.rel = 'stylesheet'; l.href = 'about.css?v=' + ABOUT_VERSION;
        l.onload = l.onerror = resolve;
        document.head.appendChild(l);
    });
    const js = new Promise(resolve => {
        const s = document.createElement('script');
        s.src = 'about.js?v=' + ABOUT_VERSION;
        s.onload = resolve;
        s.onerror = () => { aboutLoading = null; resolve(); };
        document.head.appendChild(s);
    });
    aboutLoading = Promise.all([css, js]).then(() => window.NeergAbout || null);
    return aboutLoading;
}
// Everything a cover shows, as plain values
function aboutData() {
    const cfg = currentConfig, name = siteName();
    const two = n => String(n).padStart(2, '0');
    const nos = postNumbers();
    const dated = p => Number(p.id) > 1e12 ? new Date(Number(p.id)) : null;
    const posts = postsCache.filter(p => firstImage(p) && !(cfg.blurNsfw && isNsfw(p))).sort((a, b) => b.id - a.id).slice(0, 6).map(p => {
        const d = dated(p), no = nos.get(p.id);
        return { id: p.id, img: safeUrl(firstImage(p)), no, label: excerpt(p.content, 48) || 'No.' + no, tag: stampTag(p), date: formatDate(p), md: d ? two(d.getMonth() + 1) + '.' + two(d.getDate()) : '', year: d ? String(d.getFullYear()) : '' };
    });
    const years = postsCache.map(dated).filter(Boolean).map(d => d.getFullYear());
    const newest = postsCache.map(dated).filter(Boolean).sort((a, b) => b - a)[0];
    const comic = comicsCache.slice().sort((a, b) => b.id - a.id)[0];
    const letters = name.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    const bio = cfg.aboutBio || readJSON(KEYS.bio, null) || readText(KEYS.bio);
    return {
        style: ABOUT_STYLES.includes(cfg.aboutStyle) ? cfg.aboutStyle : ABOUT_STYLES[0],
        name, tagline: cfg.tagline || '',
        bio: bio ? md(bio) : '<p>' + esc(name) + ' hasn\'t written a bio yet.</p>',
        initials: letters ? letters.charAt(0) + letters.slice(-1) : 'ART',
        posts,
        counts: { posts: postsCache.length, boards: new Set(postsCache.flatMap(p => postTags(p).map(t => t.toLowerCase()))).size, comics: comicsCache.length },
        comicCover: comic ? comicCover(comic) : '',
        status: (cfg.commissionStatus || '').trim(),
        open: commPage().open !== false,
        links: socialLinks().map(l => ({ label: l.label || l.platform || 'Link', url: safeUrl(l.url), icon: PLATFORMS[normalizePlatform(l.platform)].icon })),
        years: years.length ? (Math.min(...years) === Math.max(...years) ? String(years[0]) : Math.min(...years) + '–' + Math.max(...years)) : String(new Date().getFullYear()),
        updated: newest ? two(newest.getMonth() + 1) + '—' + two(newest.getDate()) : '',
        updatedYear: String((newest || new Date()).getFullYear())
    };
}
function startAbout() {
    loadAbout().then(about => {
        if (!about || ui.view !== 'about') return;
        const data = aboutData(), key = JSON.stringify(data);
        if (about.shown && key === aboutShown) return;
        aboutShown = key;
        about.show(byId('about-root'), data);
    });
}
function stopAbout() { aboutShown = ''; if (window.NeergAbout) window.NeergAbout.hide(); }
// Data or settings changed: redraw the cover if it's on screen
function renderAbout() { if (ui.view === 'about') startAbout(); }

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
    if (view === 'home') { renderRecComic(); fitHome(); startFeatured(); } else stopFeatured();
    if (view === 'gallery') renderGallery();
    if (view === 'comics') renderComics();
    if (view === 'commissions') replayTapes();
    if (view === 'about') startAbout(); else if (leaving === 'about') stopAbout();
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

// Staggered menu (idea from React Bits): the top bar sits above it, so the Menu button turns into Close in place
let menuCloseTimer = 0;
function openMobileMenu() {
    const m = byId('mobile-menu'), btn = byId('menu-btn');
    clearTimeout(menuCloseTimer);
    m.classList.add('is-open'); m.setAttribute('aria-hidden', 'false');
    btn.setAttribute('aria-expanded', 'true'); btn.setAttribute('aria-label', 'Close menu');
    document.documentElement.classList.add('is-locked', 'is-menu-open');
}
function closeMobileMenu() {
    const m = byId('mobile-menu'), btn = byId('menu-btn');
    if (!m || !m.classList.contains('is-open')) return;
    m.classList.remove('is-open'); m.setAttribute('aria-hidden', 'true');
    btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-label', 'Open menu');
    if (!Modals.stack.length) document.documentElement.classList.remove('is-locked');
    // Keep the top bar on top until the panel has slid away
    clearTimeout(menuCloseTimer);
    menuCloseTimer = setTimeout(() => document.documentElement.classList.remove('is-menu-open'), reduceMotion() ? 0 : 340);
}
function toggleMobileMenu() { if (byId('mobile-menu').classList.contains('is-open')) closeMobileMenu(); else openMobileMenu(); }

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
// Read once and kept in memory: every tile asks for it, and reading storage for each one adds up
let myReactionsCache = null;
function myReactions() { return myReactionsCache || (myReactionsCache = readJSON(KEYS.reactions, {}) || {}); }
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

// Bright paper colors for tag chips on the Home sheet
const NB_CHIP_COLORS = ['#FF8CC6', '#00C2CB', '#FFD23F', '#FF9A3C', '#C9A7F5', '#8EE3B0'];
function newestPostId() { return postsCache.reduce((m, p) => Math.max(m, p.id), 0); }

function renderFeatured() {
    const sec = byId('featured'), track = byId('featured-track');
    const list = ui.featured.list = featuredPosts();
    if (!list.length) { sec.hidden = true; stopFeatured(); return; }
    sec.hidden = false;
    track.innerHTML = list.map((p, i) => {
        const cap = excerpt(p.content, 80);
        const tag = postTags(p)[0];
        return '<a class="feat" href="#/post/' + p.id + '" data-action="open-post" data-id="' + p.id + '" data-index="' + i + '" aria-label="Open featured post: ' + esc(cap || 'Untitled piece') + '">'
            + '<span class="feat-media"><img src="' + esc(firstImage(p)) + '" alt="" loading="lazy" decoding="async"></span>'
            + (tag ? '<span class="nb-sticker" aria-hidden="true">#' + esc(tag) + '</span>' : '')
            + '</a>';
    }).join('');
    ui.featured.i = 0;
    renderFeaturedDots();
    track.scrollLeft = 0;
    renderFeatInfo();
    startFeatured();
}

// The yellow card beside the board describes whichever piece is showing
function renderFeatInfo() {
    const box = byId('feat-info'); if (!box) return;
    const list = ui.featured.list || [];
    const p = list[ui.featured.i];
    const burst = byId('feat-new');
    if (!p) { box.innerHTML = ''; if (burst) burst.hidden = true; return; }
    const cap = excerpt(p.content, 90);
    const tags = postTags(p);
    box.innerHTML = '<span class="nb-label">Now showing · ' + (ui.featured.i + 1) + ' of ' + list.length + '</span>'
        + '<h3 class="nb-feat-title">' + (cap ? esc(cap) : 'Untitled piece') + '</h3>'
        + '<dl class="nb-table"><div><dt>Posted</dt><dd>' + esc(formatDate(p)) + '</dd></div>'
        + '<div><dt>Tags</dt><dd>' + (tags.length ? tags.slice(0, 3).map(t => '#' + esc(t)).join(' ') : 'None') + '</dd></div></dl>'
        + '<a class="nb-btn is-ink" href="#/post/' + p.id + '" data-action="open-post" data-id="' + p.id + '">View post <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>';
    if (burst) burst.hidden = p.id !== newestPostId();
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
    byId('featured-dots').innerHTML = stops > 1 ? Array.from({ length: stops }, (_, i) => '<button data-action="featured-go" data-index="' + i + '" aria-label="Show featured post ' + (i + 1) + '"' + (i === ui.featured.i ? ' aria-current="true"' : '') + '>' + (i + 1) + '</button>').join('') : '';
    $$('#featured .carousel-ctrl').forEach(c => { c.hidden = stops < 2; });
}

function featuredGo(i) {
    const track = byId('featured-track'); if (!track) return;
    const cards = $$('.feat', track); if (!cards.length) return;
    const stops = featuredStops();
    ui.featured.i = (i + stops) % stops;
    track.scrollTo({ left: cards[ui.featured.i].offsetLeft - cards[0].offsetLeft, behavior: reduceMotion() ? 'auto' : 'smooth' });
    syncFeaturedDots();
    renderFeatInfo();
}
// Swiping the board by hand keeps the numbers and the details card in step
function syncFeaturedFromScroll() {
    const track = byId('featured-track'); if (!track) return;
    const cards = $$('.feat', track); if (cards.length < 2) return;
    const step = cards[1].offsetLeft - cards[0].offsetLeft || track.clientWidth;
    const i = clamp(Math.round(track.scrollLeft / step), 0, cards.length - 1);
    if (i === ui.featured.i) return;
    ui.featured.i = i;
    syncFeaturedDots();
    renderFeatInfo();
}
function syncFeaturedDots() { $$('#featured-dots button').forEach((d, n) => d.setAttribute('aria-current', String(n === ui.featured.i))); }
function startFeatured() {
    stopFeatured();
    if (reduceMotion() || ui.view !== 'home') return;
    if (featuredStops() < 2) return;
    ui.featured.timer = setInterval(() => {
        const sec = byId('featured');
        if (document.hidden || Modals.stack.length || !sec || sec.matches(':hover') || sec.contains(document.activeElement)) return;
        const r = sec.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
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
        + tags.map(([k, v], i) => '<button class="chip" style="--cc:' + NB_CHIP_COLORS[i % NB_CHIP_COLORS.length] + '" data-action="filter-tag" data-tag="' + esc(k) + '" aria-pressed="' + (ui.feed.tag === k) + '">' + esc(v.name) + ' <span class="n">' + v.n + '</span></button>').join('');
}

// Post numbers for the stamps: the oldest post is No.1
function postNumbers() { return new Map(postsCache.slice().sort((a, b) => a.id - b.id).map((p, i) => [p.id, i + 1])); }
function stampTag(post) { const t = postTags(post); return t.find(x => x.toLowerCase() !== 'nsfw') || t[0] || ''; }
function stampCapHTML(post, no) {
    const tag = stampTag(post);
    return '<span class="stamp-cap"><b>No.' + no + '</b>' + (tag ? '<span class="stamp-tag">' + esc(tag) + '</span>' : '') + '</span>';
}

function tileHTML(post, no) {
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
    const del = isAdminLoggedIn ? '<button class="tile-del" data-action="delete-post" data-id="' + post.id + '" aria-label="Delete post"><i class="fa-regular fa-trash-can" aria-hidden="true"></i></button>' : '';
    return '<article class="tile' + (veiled ? ' is-veiled' : '') + '" data-id="' + post.id + '">'
        + '<div class="tile-frame stamp"><div class="stamp-pic"><a class="tile-media' + (type === 'none' ? ' is-text' : '') + '" href="#/post/' + post.id + '" data-action="open-post" data-id="' + post.id + '"' + (type === 'none' ? '' : ' aria-label="Open post from ' + esc(date) + '"') + '>' + visual + '<span class="tile-badges">' + badges + '</span></a>' + veil + '</div>' + stampCapHTML(post, no) + '</div>'
        + (type !== 'none' && cap ? '<p class="tile-cap">' + esc(cap) + '</p>' : '')
        + '<div class="tile-meta"><time>' + esc(date) + '</time><span class="reacts">' + reactsHTML(post) + '</span>' + del + '</div>'
        + '</article>';
}

// keep: how many tiles are already on screen (Show more), so only the new ones get added
function renderFeed(keep = 0) {
    const grid = byId('feed-grid'); if (!grid) return;
    const all = filteredPosts();
    // Round each batch up to whole rows so the grid never ends on a half-empty row
    const cols = ui.feed.cols = feedColumns();
    const shown = all.slice(0, Math.ceil(ui.feed.limit / cols) * cols);
    const count = byId('feed-count');
    const filtering = ui.feed.tag !== 'all' || ui.feed.q.trim();
    if (count) {
        const n = filtering ? all.length : postsCache.length;
        count.innerHTML = '<b>' + n + '</b>' + (filtering ? (n === 1 ? 'match' : 'matches') : (n === 1 ? 'post' : 'posts'));
    }
    if (!postsCache.length) {
        grid.innerHTML = '<div class="empty"><h3>Nothing posted yet</h3><p>New work will show up here.</p>' + (isAdminLoggedIn ? '<a class="btn btn-primary" href="#/admin">Make your first post</a>' : '') + '</div>';
    } else if (!all.length) {
        grid.innerHTML = '<div class="empty"><h3>No posts match that</h3><p>Try a different word or tag.</p><button class="btn" data-action="clear-filters">Show all posts</button></div>';
    } else {
        const nos = postNumbers(), have = keep ? $$('.tile', grid) : [];
        if (keep && have.length === keep && have.every((t, i) => shown[i] && Number(t.dataset.id) === shown[i].id)) grid.insertAdjacentHTML('beforeend', shown.slice(keep).map(p => tileHTML(p, nos.get(p.id))).join(''));
        else grid.innerHTML = shown.map(p => tileHTML(p, nos.get(p.id))).join('');
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

function renderHome() { renderHero(); renderFeatured(); renderTagChips(); renderFeed(); renderRecComic(); renderAbout(); }

// The comic picked in Admin (Site info), or the newest one; 'off' hides the ticket
function recommendedComic() {
    const pick = currentConfig.recommendedComic;
    if (pick === 'off') return null;
    const list = comicsCache.filter(c => (c.pages || []).length).sort((a, b) => b.id - a.id);
    return list.find(c => String(c.id) === String(pick)) || list[0] || null;
}
const NB_SPARK = '<svg class="nb-spark" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1C13 8 16 11 23 12C16 13 13 16 12 23C11 16 8 13 1 12C8 11 11 8 12 1Z" style="fill:var(--hl)" stroke="#0B0F1A" stroke-width="1.6" stroke-linejoin="round"/></svg>';
function renderRecComic() {
    const sec = byId('rec-comic'), box = byId('rec-ticket'); if (!sec || !box) return;
    const c = recommendedComic();
    sec.hidden = !c;
    if (!c) { box.innerHTML = ''; return; }
    const pages = c.pages, n = pages.length;
    const title = c.title || 'Untitled';
    const p = comicProgress()[c.id];
    const midway = p != null && p > 0 && p < n - 1;
    const cover = comicCover(c);
    const thumbs = (n > 1 ? pages.slice(1, 4) : pages.slice(0, 1)).map(safeUrl).filter(Boolean);
    const run = (words, times) => Array(times).fill(words).join(' ✦ ');
    box.innerHTML = '<span class="nb-oval" aria-hidden="true">Read this!</span>'
        + '<div class="nb-stub">'
        + '<span class="nb-stub-side" aria-hidden="true"><span>' + esc(run('Recommended read ✦ ' + siteName() + ' comics', 4)) + '</span></span>'
        + '<div class="nb-stub-main"><span class="nb-stub-top" aria-hidden="true">' + esc(run(siteName() + ' comics ✦ Recommended read', 3)) + '</span>'
        + '<a class="nb-stub-cover" href="#/comics/' + c.id + '" aria-label="See every page of ' + esc(title) + '">'
        + (cover ? '<img src="' + esc(cover) + '" alt="" loading="lazy" decoding="async">' : '<span class="nb-stub-empty" aria-hidden="true">' + esc(title.charAt(0).toUpperCase()) + '</span>')
        + NB_SPARK + '</a></div></div>'
        + '<div class="nb-tk-body"><span class="nb-notch top" aria-hidden="true"><i></i></span><span class="nb-notch bottom" aria-hidden="true"><i></i></span>'
        + '<div class="nb-tk-main">'
        + '<div class="nb-tk-top"><h2 class="nb-tk-kicker" id="rec-title">Recommended comic</h2><i class="fa-solid fa-crosshairs" aria-hidden="true"></i></div>'
        + '<h3 class="nb-tk-title">' + esc(title) + '</h3>'
        + '<div class="nb-tk-chips"><span>' + esc(siteName()) + '</span>' + (c.tags || []).slice(0, 3).map(t => '<span>' + esc(t) + '</span>').join('') + '</div>'
        + '<div class="nb-tk-mid"><dl class="nb-tk-info"><dt>Pages</dt><dd>' + plural(n, 'page') + '</dd><dt>Posted</dt><dd>' + esc(formatDate(c)) + '</dd>'
        + '<dt>Start</dt><dd>' + (midway ? 'Page ' + (p + 1) + ', where you left off' : 'Page 1') + '</dd></dl>'
        + (thumbs.length ? '<div class="nb-tk-pages" aria-hidden="true">' + thumbs.map(u => '<img src="' + esc(u) + '" alt="" loading="lazy" decoding="async">').join('') + '</div>' : '')
        + '</div>'
        + '<div class="nb-tk-actions"><a class="nb-btn is-ink" href="#/comics/' + c.id + '/' + (midway ? p + 1 : 1) + '">' + (midway ? 'Keep reading' : 'Start reading') + ' <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>'
        + '<a class="nb-btn" href="#/comics">All comics</a></div>'
        + '</div>'
        + '<div class="nb-tk-foot" aria-hidden="true">' + esc(run(siteName() + ' ✦ Recommended comic ✦ ' + (midway ? 'Pick up on page ' + (p + 1) : 'Start from page 1'), 3)) + '</div>'
        + '</div>';
}

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

// Zine gallery: the classic paper colors (used when the theme can't supply enough), card inks, and each polaroid's tilt and tape
const ZINE_COLORS = ['#F2C230', '#E8752A', '#7DB46C', '#E88AAE', '#6FB1E0', '#C9A7F5'];
const ZINE_INK = '#2B2B2B', ZINE_CREAM = '#FFFDF6';
const ZINE_TILTS = [-1.5, 1.2, -0.8, 1.8, 1, -1.6, 0.8, -1.2];
const ZINE_TAPES = ['rgba(242,194,48,.75)', 'rgba(125,180,108,.75)', 'rgba(232,117,42,.7)', 'rgba(58,166,242,.6)', 'rgba(201,167,245,.75)'];
const ALL_BOARD = '__all';

function polaHTML(items, listName) {
    if (!items.length) return '<div class="empty"><h3>No images here yet</h3></div>';
    return items.map((m, i) => {
        const veil = currentConfig.blurNsfw && m.nsfw && !ui.revealed.has(m.postId);
        let inner;
        if (m.type === 'video') inner = '<video src="' + esc(m.url) + '" muted loop playsinline preload="metadata" data-hoverplay></video><span class="badge"><i class="fa-solid fa-play" aria-hidden="true"></i></span>';
        else if (m.type === 'audio') inner = '<span class="tile-audio" style="position:relative;aspect-ratio:1"><i class="fa-solid fa-music" aria-hidden="true"></i></span>';
        else inner = '<img src="' + esc(m.url) + '" alt="" loading="lazy" decoding="async" class="is-loading">';
        const n = items.length - i;
        return '<button class="zg-pola' + (veil ? ' is-veiled' : '') + '" style="--r:' + ZINE_TILTS[i % ZINE_TILTS.length] + 'deg;--tape:' + ZINE_TAPES[i % ZINE_TAPES.length] + '" data-action="open-viewer" data-list="' + listName + '" data-index="' + i + '" aria-label="View piece ' + n + ' full size">'
            + '<span class="zg-tape" aria-hidden="true"></span>'
            + '<span class="zg-pola-img">' + inner + (veil ? '<span class="veil"><i class="fa-regular fa-eye-slash" aria-hidden="true"></i>Sensitive</span>' : '') + '</span>'
            + '<span class="zg-pola-cap">No. ' + n + '</span></button>';
    }).join('');
}

// "All media" is a board of its own, ahead of the tag boards
function galleryBoards(tagBoards) {
    const all = allMediaItems();
    return all.length ? [{ key: ALL_BOARD, name: 'All media', items: all }].concat(tagBoards) : tagBoards;
}

function zineCardHTML(b, i) {
    const blur = currentConfig.blurNsfw;
    const pics = b.items.filter(m => m.type === 'image').slice(0, 3);
    const newest = postsCache.find(p => p.id === (b.items[0] || {}).postId);
    const stickers = pics.map(m => '<span class="zg-sticker' + (blur && m.nsfw ? ' is-veiled' : '') + '"><img src="' + esc(m.url) + '" alt="" loading="lazy" decoding="async"></span>').join('');
    return '<button class="zg-card zg-paper' + (i === 0 ? ' is-wide' : '') + '" style="' + zineSlot(i) + '" data-action="open-board" data-key="' + esc(b.key) + '" data-glare>'
        + '<span class="zg-card-text">'
        + '<span class="zg-card-title">' + esc(b.name) + '</span>'
        + '<span class="zg-card-meta"><span><strong>' + plural(b.items.length, 'piece') + '</strong>' + (b.key === ALL_BOARD ? 'Everything, every board' : 'Board ' + String(i).padStart(2, '0')) + '</span>'
        + (newest ? '<span><strong>Latest</strong>' + esc(formatDate(newest)) + '</span>' : '') + '</span>'
        + '<span class="zg-open">Open board <span aria-hidden="true">→</span></span>'
        + '</span>'
        + '<span class="zg-stickers n' + pics.length + '" aria-hidden="true">' + stickers + (blur && pics.some(m => m.nsfw) ? '<span class="zg-reveal">Sensitive</span>' : '') + '</span>'
        + '</button>';
}

function renderGalleryId(tagBoards) {
    byId('zg-name').textContent = siteName();
    const tag = (currentConfig.tagline || '').trim();
    const t = byId('zg-tag'); t.textContent = tag; t.hidden = !tag;
    byId('zg-boards').textContent = tagBoards.length;
    byId('zg-pieces').textContent = postsCache.filter(p => mediaList(p).length).length;
    byId('zg-media').textContent = allMediaItems().some(m => m.type === 'video') ? 'Images & video' : 'Images';
    const pfp = safeUrl(currentConfig.pfpImage), img = byId('zg-pfp'), fb = byId('zg-pfp-fallback');
    fb.textContent = siteName().trim().charAt(0).toUpperCase() || '✦';
    if (pfp) { img.onerror = () => { img.hidden = true; fb.hidden = false; }; img.src = pfp; img.hidden = false; fb.hidden = true; }
    else { img.hidden = true; img.removeAttribute('src'); fb.hidden = false; }
}

let galleryLists = { all: [], board: [], tiers: [] };
function renderGallery() {
    const g = ui.gallery;
    const tagBoards = boardsData();
    const boards = galleryBoards(tagBoards);
    renderGalleryId(tagBoards);
    const boardsEl = byId('gallery-boards'), boardEl = byId('gallery-board');
    const open = g.board ? boards.find(x => x.key === g.board) : null;
    if (!open) g.board = null;
    boardsEl.hidden = !!open;
    boardEl.hidden = !open;
    if (open) {
        setZineSlot(byId('board-head'), boards.indexOf(open));
        byId('board-title').textContent = open.name;
        byId('board-count').textContent = plural(open.items.length, 'piece');
        galleryLists.board = open.items;
        byId('board-grid').innerHTML = polaHTML(open.items, 'board');
        return;
    }
    boardsEl.innerHTML = boards.length ? boards.map(zineCardHTML).join('')
        : '<div class="empty"><h3>No boards yet</h3><p>Boards are made from post tags. Tag your posts and they\'ll group here.</p></div>';
}

/* ═════════════════════════════════════════════
   COMICS SHELF
   ═════════════════════════════════════════════ */

function comicCover(c) { return safeUrl(c.cover || (c.pages && c.pages[0]) || ''); }
// Each comic keeps the same paper color on the shelf and on its page list
function comicSlot(id) {
    const i = comicsCache.slice().sort((a, b) => b.id - a.id).findIndex(c => c.id === id);
    return Math.max(i, 0);
}
function renderComics() {
    renderRecComic(); renderAbout();
    const grid = byId('comics-grid'); if (!grid) return;
    const list = comicsCache.slice().sort((a, b) => b.id - a.id);
    const progress = comicProgress();
    // Intro card: counts, and a shortcut back into the newest comic left half-read
    byId('comics-count').textContent = list.length;
    byId('zc-pages').textContent = list.reduce((n, c) => n + (c.pages || []).length, 0);
    const midway = list.find(c => { const p = progress[c.id]; return p != null && p > 0 && p < (c.pages || []).length - 1; });
    const cont = byId('zc-continue');
    cont.hidden = !midway;
    byId('zc-reading').textContent = midway ? (midway.title || 'Untitled') + ', p. ' + (progress[midway.id] + 1) : 'Not started';
    if (midway) { cont.href = '#/comics/' + midway.id + '/' + (progress[midway.id] + 1); cont.textContent = 'Continue ' + (midway.title || 'reading') + ' →'; }
    if (!list.length) { grid.innerHTML = '<div class="empty"><h3>No comics yet</h3><p>Comics will appear here once they\'re posted.</p></div>'; return; }
    grid.innerHTML = list.map((c, i) => {
        const pages = (c.pages || []).length;
        const cover = comicCover(c);
        const p = progress[c.id];
        const started = p != null && pages > 1;
        // Pages 2-4 fanned out; always shown on the top card, and on any card left with a wide row to itself
        const strip = (c.pages || []).slice(1, 4).map(u => '<span class="zg-sticker"><img src="' + esc(safeUrl(u)) + '" alt="" loading="lazy" decoding="async"></span>').join('');
        return '<a class="zg-card zg-paper zc-card' + (i === 0 ? ' is-wide' : '') + '" style="' + zineSlot(i) + '" href="#/comics/' + c.id + '" data-action="open-comic" data-id="' + c.id + '" data-glare>'
            + '<span class="zc-cover">' + (cover ? '<img src="' + esc(cover) + '" alt="" loading="lazy" decoding="async">' : '<span class="zc-cover-empty" aria-hidden="true">' + esc((c.title || '?').charAt(0).toUpperCase()) + '</span>') + '</span>'
            + '<span class="zg-card-text">'
            + '<span class="zg-card-title">' + esc(c.title || 'Untitled') + '</span>'
            + '<span class="zg-card-meta"><span><strong>' + plural(pages, 'page') + '</strong>Comic ' + String(list.length - i).padStart(2, '0') + '</span><span><strong>Posted</strong>' + esc(formatDate(c)) + '</span></span>'
            + (started ? '<span class="zc-progress"><span class="zc-bar"><i style="width:' + Math.round((p + 1) / pages * 100) + '%"></i></span>' + (p >= pages - 1 ? 'Finished' : 'On page ' + (p + 1) + ' of ' + pages) + '</span>' : '')
            + '<span class="zg-open">' + (started && p < pages - 1 ? 'Keep reading' : 'Read it') + ' <span aria-hidden="true">→</span></span>'
            + '</span>'
            + (strip ? '<span class="zg-stickers n' + Math.min(3, pages - 1) + '" aria-hidden="true">' + strip + '</span>' : '')
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
    const saved = readText(KEYS.commenter);
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
    const saved = readText(KEYS.commenter);
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

async function deleteComment(postId, cid) {
    if (!await askConfirm('Delete this comment? Replies to it will go too.', { hold: true, title: 'Delete this comment?' })) return;
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
    // Without a fresh copy, uploading would wipe likes and comments added since this page loaded. The actions
    // stay saved in this browser and sync next time.
    if (!fresh || typeof fresh !== 'object') { interactionsSyncing = false; interactionsAgain = false; return; }
    interactionsRemote = fresh;
    loadFailed.delete('interactions.js');
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
    if (loadFailed.has('interactions.js')) { showToast(LOAD_FAILED_MSG, 'error'); return { success: false }; }
    pendingOps = []; persistOps();
    writeJSON(KEYS.interactions, interactionsCache);
    if (!globalAuthToken || IS_LOCAL_FILE) return { success: false };
    const r = await uploadToBridge('interactions', { data: interactionsCache });
    if (r.success) interactionsRemote = clone(interactionsCache);
    return r;
}

function reactTo(postId, type, btn) {
    postId = Number(postId);
    const mine = myReactions();
    const cur = mine[postId] || null;
    const next = cur === type ? null : type;
    queueOp({ k: 'vote', p: postId, from: cur, to: next });
    if (next) mine[postId] = next; else delete mine[postId];
    writeJSON(KEYS.reactions, mine); myReactionsCache = mine;
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
    setZineSlot(overlay, comicSlot(comic.id));
    byId('co-title').textContent = comic.title || 'Untitled';
    byId('co-meta').textContent = plural(pages.length, 'page') + ', posted ' + formatDate(comic);
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
    if (loadFailed.has(target + '.js')) {
        if (!opts.quiet) showToast(LOAD_FAILED_MSG, 'error');
        return { success: false, message: 'load failed' };
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

/* WebP: PNG and JPG art re-encoded in the browser, usually a fraction of the size at a quality that looks the same */
const WEBP_QUALITY = 0.9;
const SHRINKABLE_EXT = /\.(png|jpe?g|bmp)(?=([?#].*)?$)/i;
function canShrink(type, name) { return /^image\/(png|jpeg|bmp)$/.test(type || '') || SHRINKABLE_EXT.test(name || ''); }
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
function webpName(name) { return String(name || 'image').replace(/\.[^./]*$/, '') + '.webp'; }

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
    if (Studio.dirty) { Studio.draft = null; Studio.dirty = false; Studio.ring = null; applyTheme(); }
    isAdminLoggedIn = false; sessionPassword = null;
    renderAdminView();
    renderFeed();
    showToast('Logged out');
}

/* The admin tools (admin.js) load the first time Admin opens, so visitors never download them.
   Bump ADMIN_VERSION after changing admin.js. */
const ADMIN_VERSION = '1';
let adminLoading = null;
function loadAdmin() {
    if (window.NEERG_ADMIN) return Promise.resolve(true);
    if (adminLoading) return adminLoading;
    adminLoading = new Promise(resolve => {
        const s = document.createElement('script');
        s.src = 'admin.js?v=' + ADMIN_VERSION;
        s.onload = () => resolve(!!window.NEERG_ADMIN);
        s.onerror = () => { adminLoading = null; resolve(false); };
        document.head.appendChild(s);
    });
    return adminLoading;
}

function renderAdminView() {
    byId('admin-login').hidden = isAdminLoggedIn;
    byId('admin-panel').hidden = !isAdminLoggedIn;
    // Start fetching the tools while the password is typed
    const ready = loadAdmin();
    if (!isAdminLoggedIn) { setTimeout(() => { if (ui.view === 'admin') byId('admin-pass').focus(); }, 60); return; }
    ready.then(ok => {
        if (!ok) { showToast('The admin tools didn\'t load. Check your connection and refresh the page.', 'error'); return; }
        if (ui.view !== 'admin' || !isAdminLoggedIn) return;
        updateSyncChip();
        renderRecovery();
        renderNewPostTags();
        showAdminTab(ui.adminTab || 'post');
    });
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
    const ok = parseInt(readText(KEYS.age) || '0', 10);
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
    setTimeout(() => {
        gate.hidden = true; Gate.active = false;
        if (!Modals.stack.length) document.documentElement.classList.remove('is-locked');
        maybeShowAotd();
    }, 520);
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
   ART OF TODAY (a pop-up with one piece from the archive, once a day per visitor)
   Ten designs from the mockup. Each one is drawn by a function below that returns
   its HTML; style.css lays it out as a wide poster on computers and a stacked
   card on phones, and gives it its own entrance and exit.
   ═════════════════════════════════════════════ */

// `fonts` is the Google Fonts query a design needs (loaded only when it's shown), `check` the faces to wait for,
// `colors` the choices offered in Admin (the first is the default)
const AOTD_DESIGNS = [
    { id: 'botanical', name: 'Botanical', fonts: 'family=Cormorant+Garamond:ital,wght@0,500;1,400&family=Playfair+Display:ital@1', check: ['italic 40px "Playfair Display"', '500 20px "Cormorant Garamond"'], colors: ['Ink', [['#3E7FE0', 'Blue'], ['#2F6A55', 'Green'], ['#B4467A', 'Berry'], ['#1E3350', 'Navy']]] },
    { id: 'cinema', name: 'Cinema', fonts: 'family=Cormorant+Garamond:ital,wght@1,500&family=DM+Serif+Display', check: ['40px "DM Serif Display"', 'italic 500 20px "Cormorant Garamond"'] },
    { id: 'calligraphy', name: 'Calligraphy', fonts: 'family=Courier+Prime:wght@400;700&family=Pinyon+Script', check: ['40px "Pinyon Script"', '20px "Courier Prime"', '700 20px "Courier Prime"'] },
    { id: 'magazine', name: 'Magazine', fonts: 'family=Cormorant+Garamond:ital,wght@0,300;0,500;1,400', check: ['300 40px "Cormorant Garamond"', '500 20px "Cormorant Garamond"', 'italic 20px "Cormorant Garamond"'] },
    { id: 'caption', name: 'Caption strip', fonts: 'family=Cormorant+Garamond:wght@600&family=Playfair+Display:ital@1', check: ['italic 40px "Playfair Display"', '600 20px "Cormorant Garamond"'], colors: ['Caption', [['#2E7BC4', 'Blue'], ['#B4467A', 'Berry'], ['#2F6A55', 'Green'], ['#1A1A1A', 'Black']]] },
    { id: 'editorial', name: 'Editorial', fonts: 'family=DM+Serif+Display&family=Josefin+Sans:wght@400;600', check: ['40px "DM Serif Display"', '600 20px "Josefin Sans"'] },
    { id: 'award', name: 'Award band', fonts: 'family=Archivo+Black&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,300&family=DM+Serif+Display&family=Pinyon+Script', check: ['40px "DM Serif Display"', '40px "Pinyon Script"', '600 20px "Cormorant Garamond"', 'italic 300 40px "Cormorant Garamond"', '20px "Archivo Black"'] },
    { id: 'chapter', name: 'Chapter frame', fonts: 'family=Archivo+Black&family=Permanent+Marker', check: ['40px "Permanent Marker"', '20px "Archivo Black"'], colors: ['Frame', [['#F4A6C8', 'Pink'], ['#F2C230', 'Yellow'], ['#9ED6C8', 'Mint'], ['#C9A7F5', 'Lilac']]] },
    { id: 'tabloid', name: 'Tabloid', fonts: '', check: ['40px Anton'], colors: ['Paper', [['#FFE53B', 'Yellow'], ['#FF8CC6', 'Pink'], ['#7FD3F7', 'Blue'], ['#F3EBDD', 'Cream']]] },
    { id: 'calendar', name: 'Calendar', fonts: 'family=Archivo+Black&family=Caveat:wght@600', check: ['20px "Archivo Black"', '600 40px Caveat', '40px "Dela Gothic One"'], colors: ['Accent', [['#8B6CF6', 'Violet'], ['#E5483A', 'Red'], ['#8FD19E', 'Green']]] }
];
const AOTD_DEFAULTS = { mode: 'random', off: [], design: 'tabloid', art: 'all', board: '', post: '', skipNsfw: true, headline: 'Art of Today', message: 'One piece a day, picked just for you.', delay: 2, anim: 'design', phones: true, colors: {} };
const AOTD_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const AOTD_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const AOTD_ARROW = '<svg class="aotd-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const AOTD_SPARK = 'M12 1C12.8 8.5 15.5 11.2 23 12C15.5 12.8 12.8 15.5 12 23C11.2 15.5 8.5 12.8 1 12C8.5 11.2 11.2 8.5 12 1Z';
const AOTD_PHONE = '(max-width: 819.98px), (max-height: 519.98px)';
const Aotd = { draft: null, timer: 0 };

function aotdSettings(cfg = currentConfig) {
    const s = Object.assign({}, AOTD_DEFAULTS, cfg.aotd || {});
    s.off = Array.isArray(s.off) ? s.off.filter(id => AOTD_DESIGNS.some(d => d.id === id)) : [];
    // The first version only had a Tabloid paper color
    s.colors = Object.assign({}, cfg.aotdColor ? { tabloid: cfg.aotdColor } : {}, s.colors || {});
    s.delay = [1, 2, 5].includes(Number(s.delay)) ? Number(s.delay) : 2;
    if (!['design', 'fade', 'none'].includes(s.anim)) s.anim = 'design';
    return s;
}
function aotdDesign(id) { return AOTD_DESIGNS.find(d => d.id === id) || null; }
function aotdColor(design, s) {
    if (!design.colors) return '';
    const list = design.colors[1].map(c => c[0]);
    return list.includes(s.colors[design.id]) ? s.colors[design.id] : list[0];
}
function aotdDayNumber() {
    const d = new Date();
    return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
}
function aotdToday() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
// Everyone gets the same design on the same day. The designs take turns in a fixed shuffled order, so one never shows twice in a row.
function aotdDesignFor(s) {
    if (s.mode === 'one') return aotdDesign(s.design) || aotdDesign('tabloid');
    let list = AOTD_DESIGNS.filter(d => !s.off.includes(d.id));
    if (!list.length) list = AOTD_DESIGNS.slice();
    let seed = 20261010;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (let i = list.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [list[i], list[j]] = [list[j], list[i]]; }
    return list[aotdDayNumber() % list.length];
}
function aotdAllowed(p, s) { return !!firstImage(p) && !(s.skipNsfw && isNsfw(p)); }
// Everyone gets the same piece on the same day. Stepping by a large prime walks through every post before repeating.
function aotdPick(s) {
    if (s.art === 'pick') {
        const p = postsCache.find(x => String(x.id) === String(s.post));
        if (p && aotdAllowed(p, s)) return p;
    }
    let pool = postsCache.filter(p => aotdAllowed(p, s));
    if (s.art === 'board' && s.board) {
        const k = s.board.toLowerCase();
        const onBoard = pool.filter(p => postTags(p).some(t => t.toLowerCase() === k));
        if (onBoard.length) pool = onBoard;
    }
    if (!pool.length) return null;
    pool.sort((a, b) => a.id - b.id);
    return pool[(aotdDayNumber() * 7919) % pool.length];
}

/* ─── The ten designs ─── */

function aotdData(post, design, s) {
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const cap = excerpt(post.content, 60);
    const tag = stampTag(post);
    const head = String(s.headline || '').trim() || AOTD_DEFAULTS.headline;
    const words = head.split(/\s+/);
    const days = [];
    const len = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    for (let n = 1; n <= len; n++) days.push({ n: pad(n), wd: AOTD_DAYS[new Date(now.getFullYear(), now.getMonth(), n).getDay()].slice(0, 3).toUpperCase(), today: n === now.getDate() });
    return {
        id: post.id, img: esc(firstImage(post)), alt: esc(cap ? 'Today\'s artwork: ' + cap : 'Today\'s artwork'),
        title: esc(cap || 'Untitled piece'), titleLen: (cap || 'Untitled piece').length, tag: esc(tag), posted: esc(formatDate(post)), no: postNumbers().get(post.id) || '', site: esc(siteName()),
        head: esc(head), letters: Array.from(Array.from(words[0]).filter(ch => /[\p{L}\p{N}]/u.test(ch)).slice(0, 6).join('') || 'Art'), first: esc(words[0]), rest: esc(words.slice(1).join(' ')), lead: esc(words.slice(0, -1).join(' ')), last: esc(words[words.length - 1]),
        msg: esc(String(s.message || '').trim()), msgWords: String(s.message || '').trim().split(/\s+/).filter(Boolean).map(esc),
        y: now.getFullYear(), m: pad(now.getMonth() + 1), dd: pad(now.getDate()), day: now.getDate(),
        month: AOTD_MONTHS[now.getMonth()], mon: AOTD_MONTHS[now.getMonth()].slice(0, 3), weekday: AOTD_DAYS[now.getDay()], wd: AOTD_DAYS[now.getDay()].slice(0, 3),
        days, link: 'href="#/post/' + post.id + '" data-action="aotd-view" data-id="' + post.id + '"'
    };
}
const aotdBoard = d => d.tag ? 'From the ' + d.tag + ' board' : 'From the archive';
const aotdImg = (d, cls) => '<img' + (cls ? ' class="' + cls + '"' : '') + ' src="' + d.img + '" alt="' + d.alt + '" decoding="async">';
const aotdLeaf = (cls, mirror) => '<svg class="bt-leaf ' + cls + '" viewBox="0 0 230 330" aria-hidden="true">' + (mirror
    ? '<path d="M60 330 C40 240 90 170 160 140" fill="none" stroke="#4F8F78" stroke-width="7" stroke-linecap="round"/><g fill="#7DBBA2" stroke="#2F6A55" stroke-width="2"><path d="M160 140 C180 80 222 64 228 70 C228 120 200 160 160 140 Z"/><path d="M70 250 C20 236 0 176 8 172 C64 170 90 214 70 250 Z"/></g><g fill="none" stroke="#2F6A55" stroke-width="1.5"><path d="M162 138 C185 110 205 92 224 74"/><path d="M68 246 C48 222 30 200 12 176"/></g><path d="M120 40 C140 18 180 22 186 40 C166 58 132 58 120 40 Z" fill="#FFFFFF" stroke="#B9C7D8" stroke-width="1.5"/>'
    : '<path d="M40 330 C30 250 70 170 150 120" fill="none" stroke="#4F8F78" stroke-width="7" stroke-linecap="round"/><g fill="#7DBBA2" stroke="#2F6A55" stroke-width="2"><path d="M150 120 C170 60 220 40 226 46 C230 100 200 140 150 120 Z"/><path d="M60 230 C10 210 -4 150 4 146 C60 150 80 190 60 230 Z"/><path d="M95 175 C120 120 190 120 196 128 C180 190 130 200 95 175 Z"/></g><g fill="none" stroke="#2F6A55" stroke-width="1.5"><path d="M152 118 C175 90 200 70 222 50"/><path d="M58 226 C40 200 22 175 8 150"/><path d="M98 173 C130 155 160 140 192 130"/></g><path d="M20 290 C40 270 80 272 90 290 C70 306 36 306 20 290 Z" fill="#FFFFFF" stroke="#B9C7D8" stroke-width="1.5"/>') + '</svg>';

const AOTD_RENDER = {
    botanical: d => '<span class="bt-date">(' + d.mon + ' ' + d.day + ' — ' + d.y + ')</span>'
        + '<span class="bt-stamp">© ' + d.site + '</span>'
        + '<h2 class="bt-title aotd-fit aotd-fit2" id="aotd-title">' + d.head + '<span class="bt-star-at"><svg class="bt-star" viewBox="0 0 24 24" aria-hidden="true"><path d="' + AOTD_SPARK + '"/></svg></span></h2>'
        + '<div class="bt-stage">' + aotdImg(d, 'bt-art') + aotdLeaf('bt-leafL') + aotdLeaf('bt-leafR', true) + '</div>'
        + '<div class="bt-row"><span class="bt-sign">' + d.site + '</span><div class="bt-mid">' + (d.msg ? '<span class="bt-msg">' + d.msg + '</span>' : '')
        + '<span class="bt-meta">' + [d.tag, 'No.' + d.no, d.title, d.posted && 'Posted ' + d.posted].filter(Boolean).join(' / ') + '</span></div>'
        + '<a class="bt-view" ' + d.link + '>View post ' + AOTD_ARROW + '</a></div>',

    cinema: d => aotdImg(d, 'cn-art')
        + '<span class="cn-corner cn-date">' + d.wd.toUpperCase() + ' · ' + d.mon.toUpperCase() + ' ' + d.day + ' · ' + d.y + '</span><span class="cn-corner cn-no">NO.' + d.no + '</span>'
        + '<div class="cn-plaque"><h2 class="cn-title aotd-fit aotd-fit2" id="aotd-title">' + d.head + '</h2>'
        + '<div class="cn-row"><span>' + d.site + ' artwork</span><span class="cn-line"></span><span class="cn-dot"></span><span class="cn-board">' + (d.tag ? 'Part of the ' + d.tag + ' board' : 'From the archive') + '</span></div>'
        + (d.msg ? '<p class="cn-msg">' + d.msg + '</p>' : '') + '</div>'
        + '<div class="cn-foot"><a class="cn-view" ' + d.link + '>View post ' + AOTD_ARROW + '</a><span class="cn-cap">' + d.title + (d.posted ? ' · posted ' + d.posted : '') + '</span></div>',

    calligraphy: d => {
        const column = d.msgWords.length && d.msgWords.length <= 10;
        return aotdImg(d, 'cl-art') + '<span class="cl-shade"></span>'
            + (column ? '<p class="cl-words" aria-label="' + d.msg + '">' + d.msgWords.map(w => '<span aria-hidden="true">' + w + '</span>').join('') + '</p>' : '')
            + '<h2 class="cl-title" id="aotd-title"><span class="cl-t1 aotd-fit">' + d.first + '</span>' + (d.rest ? '<span class="cl-t2 aotd-fit aotd-fit2">' + d.rest + '</span>' : '') + '</h2>'
            + '<svg class="cl-swirl" viewBox="0 0 420 170" aria-hidden="true"><path d="M10 120 C60 60 140 50 190 90 C240 130 320 140 410 70"/><path d="M40 150 C90 110 170 105 230 130 C290 155 350 150 400 120"/><path d="M90 92 C70 70 74 40 100 36 C126 32 132 64 108 74"/><circle cx="64" cy="58" r="22"/><path class="cl-spark" d="M64 30 L68 52 L90 58 L68 64 L64 86 L60 64 L38 58 L60 52 Z"/></svg>'
            + '<div class="cl-info">' + (d.msg && !column ? '<i>' + d.msg + '</i>' : '') + '<span>Today: <b>' + d.title + '</b>, No.' + d.no + '.</span><span>' + (d.tag || 'From the archive') + (d.posted ? ' · posted ' + d.posted : '') + '.</span></div>'
            + '<div class="cl-foot"><span class="cl-date">' + d.dd + ' · ' + d.m + ' · ' + d.y + '</span><a class="cl-view" ' + d.link + '>View post ' + AOTD_ARROW + '</a></div>';
    },

    magazine: d => '<div class="mg-top"><h2 class="mg-title aotd-fit" id="aotd-title" aria-label="' + d.head + '">' + d.last + '</h2>'
        + '<div class="mg-col">' + (d.msg ? '<p class="mg-msg">' + d.msg + '</p>' : '') + '<span class="mg-note">No.' + d.no + (d.tag ? ' · ' + d.tag : '') + '&#160;&#160;&#160; Presented by ' + d.site + '</span></div>'
        + '<div class="mg-side"><span class="mg-label">' + d.head + '</span><span class="mg-date">' + d.weekday + ', ' + d.month + ' ' + d.day + ', ' + d.y + '</span>'
        + '<svg class="mg-flower" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12c0-4 1.5-8 4-9-1 3-2 6-4 9zM12 12c4 0 8 1.5 9 4-3-1-6-2-9-4zM12 12c0 4-1.5 8-4 9 1-3 2-6 4-9zM12 12c-4 0-8-1.5-9-4 3 1 6 2 9 4zM12 12c2.8-2.8 6.4-4.6 9-4-2.4 1.2-5.6 2.8-9 4zM12 12c-2.8 2.8-6.4 4.6-9 4 2.4-1.2 5.6-2.8 9-4z"/></svg>'
        + '<a class="mg-view" ' + d.link + '>View post ' + AOTD_ARROW + '</a></div></div>'
        + '<div class="mg-art">' + aotdImg(d) + '<span class="mg-cap"><b>' + d.title + '</b><i>' + (d.posted ? 'Posted ' + d.posted : 'From the archive') + (d.tag ? ' · ' + d.tag : '') + '</i></span></div>'
        + '<button type="button" class="mg-later" data-action="close-aotd">See you tomorrow</button>',

    caption: d => '<p class="cp-top aotd-fit">' + (d.msg || 'today\'s pick from ' + d.site) + '</p>'
        + '<div class="cp-band">' + aotdImg(d) + '<span class="cp-date">' + d.dd + ' · ' + d.m + ' · ' + d.y + '</span>'
        + '<h2 class="cp-title" id="aotd-title">' + (d.lead ? '<span class="cp-l1 aotd-fit aotd-fit2"><span class="cp-star-at"><svg class="cp-star" viewBox="0 0 24 24" aria-hidden="true"><path d="' + AOTD_SPARK + '"/></svg></span>' + d.lead + '</span>' : '') + '<span class="cp-l2 aotd-fit">' + d.last + '</span></h2>'
        + '<div class="cp-foot"><span class="cp-name">' + d.title + ' · No.' + d.no + '</span><a class="cp-view" ' + d.link + '>view post ' + AOTD_ARROW + '</a></div></div>'
        + '<p class="cp-bot">come back tomorrow for another</p>',

    editorial: d => aotdImg(d, 'ed-art') + '<span class="ed-shade"></span>'
        + '<div class="ed-a">' + (d.msg ? '<p class="ed-lead">' + d.msg + '</p>' : '') + '<h2 class="ed-title" id="aotd-title">' + (d.lead ? '<span class="ed-t1 aotd-fit aotd-fit2">' + d.lead + '</span>' : '') + '<span class="ed-t2 aotd-fit">' + d.last + '</span></h2></div>'
        + '<div class="ed-b"><span>here is one</span><span>piece from</span><span>the archive:</span><span class="ed-no">No.' + d.no + '</span></div>'
        + '<div class="ed-c"><a class="ed-view" ' + d.link + '>View post ' + AOTD_ARROW + '</a><span class="ed-cap">' + d.title + (d.tag ? ' · ' + d.tag : '') + ' · ' + d.wd + ', ' + d.mon + ' ' + d.day + ', ' + d.y + '</span></div>',

    award: d => {
        const letters = d.letters;
        return (d.msg ? '<p class="aw-top">' + d.msg + '</p>' : '')
            + '<div class="aw-band">' + aotdImg(d) + '</div>'
            + '<h2 class="aw-title" id="aotd-title" aria-label="' + d.head + '" style="--n: ' + Math.max(3, letters.length) + '">' + letters.map(l => '<span aria-hidden="true">' + esc(l) + '</span>').join('') + '</h2>'
            + '<span class="aw-script aotd-fit" aria-hidden="true">' + d.head + '</span>'
            + '<div class="aw-date"><span class="aw-pick">Today\'s pick</span><span class="aw-num">' + d.m + '.' + d.dd + '</span><span class="aw-wd">' + d.wd + '</span></div>'
            + '<div class="aw-tags"><span class="aw-site">' + d.site + '</span><span>/ ' + (d.tag ? d.tag + ' / ' : '') + 'No.' + d.no + ' / ' + d.title + ' /</span>'
            + '<span>/ ' + (d.posted ? 'Posted ' + d.posted + ' / ' : '') + '<a class="aw-view" ' + d.link + '>View post</a> /</span></div>';
    },

    chapter: d => '<div class="ch-art">' + aotdImg(d) + '</div>'
        + '<a class="ch-view" ' + d.link + '>View post ' + AOTD_ARROW + '</a>'
        + '<div class="ch-tl"><span class="ch-presents">' + d.site + '<br>presents</span><h2 class="ch-title" id="aotd-title">' + (d.lead ? '<span class="aotd-fit aotd-fit2">' + d.lead + '</span>' : '') + '<span class="aotd-fit">' + d.last + '</span></h2></div>'
        + '<div class="ch-bl"><span class="ch-when">' + d.weekday + ',<br>' + d.month + ' ' + d.day + ', ' + d.y + '<br>' + (d.msg || 'Today\'s pick') + '</span>'
        + '<span class="ch-name"><span class="ch-big" style="--len: ' + Math.max(8, d.titleLen) + '">' + d.title + '</span><span class="ch-small">' + (d.tag ? d.tag + ' · ' : '') + (d.posted ? 'posted ' + d.posted : 'from the archive') + '</span></span></div>'
        + '<div class="ch-br"><span>Piece</span><span class="ch-no aotd-fit">' + d.no + '</span></div>',

    tabloid: d => '<h2 class="tb-top aotd-fit" id="aotd-title">' + d.head + '</h2>'
        + '<a class="tb-art" ' + d.link + '>' + aotdImg(d) + '</a>'
        + '<span class="tb-vert" aria-hidden="true">Today\'s art</span>'
        + '<span class="tb-side aotd-fit aotd-fit-v" aria-hidden="true">' + d.site + ' · Daily pick</span>'
        + '<svg class="tb-face" viewBox="0 0 74 74" fill="none" stroke="#111111" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 40c0-17 10-28 24-28s22 11 22 26c0 17-10 28-23 28S14 56 14 40z" fill="#FFFFFF"/><path d="M20 26c6-10 22-14 34-6 4-6 10-6 12-2-6 0-8 4-10 8"/><path d="M28 40v3M46 40v3"/><path d="M30 53c5 4 11 4 15 0"/></svg>'
        + '<div class="tb-info"><p class="tb-date">' + d.y + '.' + d.m + '.' + d.dd + ' <small>(' + d.wd.toUpperCase() + ')</small></p>' + (d.msg ? '<p class="tb-msg">' + d.msg + '</p>' : '') + '<ol class="tb-list">'
        + '<li><b>01</b><mark>' + d.title + '</mark></li>'
        + '<li><b>02</b><span>' + aotdBoard(d) + '</span></li>'
        + '<li><b>03</b><span>' + (d.posted ? 'Posted ' + d.posted : 'From the vault') + '</span></li>'
        + '<li><b>04</b><span>Post</span><mark>No.' + d.no + '</mark></li></ol></div>'
        + '<a class="tb-view" ' + d.link + '>View post ' + AOTD_ARROW + '</a>'
        + '<span class="tb-bot" aria-hidden="true">Pick of the day</span>',

    calendar: d => {
        const day = x => '<span class="ca-d' + (x.today ? ' is-today' : (x.wd === 'SUN' || x.wd === 'SAT') ? ' is-weekend' : '') + '"><small>' + x.wd + '</small><b>' + x.n + '</b></span>';
        return '<span class="ca-ghost" aria-hidden="true">ART</span>'
            + '<div class="ca-panel ca-p1">' + aotdImg(d) + (d.msg ? '<span class="ca-say">' + d.msg + '</span>' : '') + '</div>'
            + '<div class="ca-panel ca-p2"><img src="' + d.img + '" alt="" style="object-position: 30% 80%"></div>'
            + '<div class="ca-panel ca-p3"><img src="' + d.img + '" alt="" style="object-position: 62% 50%"><span class="ca-copy">©' + d.site + '</span></div>'
            + '<div class="ca-info"><span class="ca-label">Calendar</span><span class="ca-sub">' + d.head + ' · ' + d.m + '/' + d.dd + '</span>'
            + '<svg class="ca-burst" viewBox="0 0 120 120" aria-hidden="true"><polygon points="60.0,2.0 69.8,17.1 85.2,7.7 87.4,25.6 105.3,23.8 99.6,40.9 116.5,47.1 104.0,60.0 116.5,72.9 99.6,79.1 105.3,96.2 87.4,94.4 85.2,112.3 69.8,102.9 60.0,118.0 50.2,102.9 34.8,112.3 32.6,94.4 14.7,96.2 20.4,79.1 3.5,72.9 16.0,60.0 3.5,47.1 20.4,40.9 14.7,23.8 32.6,25.6 34.8,7.7 50.2,17.1" fill="#E7E5E0" stroke="#111111" stroke-width="4"/><text x="60" y="68" text-anchor="middle" font-family="Archivo Black, sans-serif" font-size="20" fill="#111111">' + d.site.slice(0, 6) + '</text></svg>'
            + '<h2 class="ca-big" id="aotd-title" aria-label="' + d.head + ', ' + d.month + ' ' + d.day + '">' + d.dd + '</h2><span class="ca-oct" aria-hidden="true">' + d.mon + '.</span>'
            + '<span class="ca-tag">■ Piece</span><span class="ca-name"><span>' + d.title + '</span>No.' + d.no + '</span></div>'
            + '<div class="ca-strip"><svg class="ca-slash" viewBox="0 0 44 60" aria-hidden="true"><path d="M18 4 L4 56 M40 4 L26 56"/></svg>'
            + '<div class="ca-days"><div class="ca-row">' + d.days.slice(0, 16).map(day).join('') + '</div><div class="ca-row">' + d.days.slice(16).map(day).join('') + '</div></div>'
            + '<div class="ca-end"><span class="ca-today"><b>Today</b><span>[ ' + d.y + ' ]</span></span><a class="ca-view" ' + d.link + '>View post ' + AOTD_ARROW + '</a></div></div>';
    }
};

/* ─── Showing and closing ─── */

function aotdFonts(design) {
    if (design.fonts && !byId('aotd-font-' + design.id)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet'; link.id = 'aotd-font-' + design.id;
        link.href = 'https://fonts.googleapis.com/css2?' + design.fonts + '&display=swap';
        document.head.appendChild(link);
    }
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    // Give the fonts a moment; if they're slow the pop-up still opens with a stand-in font
    const loaded = new Promise(r => { if (!design.fonts) return r(); const l = byId('aotd-font-' + design.id); if (l.sheet) return r(); l.addEventListener('load', r, { once: true }); l.addEventListener('error', r, { once: true }); })
        .then(() => Promise.all(design.check.map(f => document.fonts.load(f).catch(() => {}))));
    return Promise.race([loaded, wait(2500)]);
}
function aotdImage(url) {
    return new Promise(r => { const img = new Image(); img.onload = img.onerror = r; img.src = url; setTimeout(r, 2500); });
}
function aotdPrepare(design, post) { return Promise.all([aotdFonts(design), aotdImage(firstImage(post))]); }

// Shrinks a headline until it fits its box, for long custom headlines. Headlines marked aotd-fit2 shrink a
// little on one line first, then take a second line if they still don't fit. When the pop-up opens, the
// entrance animations are paused for the measurement (some start with the letters spread apart).
function aotdFitOne(el) {
    el.style.fontSize = ''; el.style.whiteSpace = ''; el.style.textWrap = '';
    const cs = getComputedStyle(el);
    const base = parseFloat(cs.fontSize);
    const lines = parseInt(cs.getPropertyValue('--fit-lines'), 10) || 1;
    const vertical = el.classList.contains('aotd-fit-v');
    const wide = () => el.scrollWidth > el.clientWidth + 1 || (vertical && el.scrollHeight > el.clientHeight + 1);
    // Counts the lines the text actually takes (the box itself may have padding or a minimum height)
    const tall = () => {
        const r = document.createRange(); r.selectNodeContents(el);
        const half = parseFloat(getComputedStyle(el).fontSize) / 2, tops = [];
        for (const rc of r.getClientRects()) if (rc.width && !tops.some(t => Math.abs(t - rc.top) < half)) tops.push(rc.top);
        return tops.length > lines;
    };
    let size = base;
    const shrink = (tooBig, floor) => { let n = 0; while (tooBig() && size > base * floor && n++ < 40) { size *= .94; el.style.fontSize = size + 'px'; } };
    if (lines < 2) return shrink(wide, .3);
    el.style.whiteSpace = 'nowrap';
    shrink(wide, .72);
    if (!wide()) return;
    size = base; el.style.fontSize = '';
    el.style.whiteSpace = 'normal'; el.style.textWrap = 'balance';
    shrink(() => wide() || tall(), .3);
}
function aotdFit(opening) {
    const box = byId('aotd');
    if (opening) box.classList.add('aotd-measure');
    $$('#aotd .aotd-fit').forEach(aotdFitOne);
    if (opening) box.classList.remove('aotd-measure');
}
const aotdRefit = debounce(() => { if (Modals.isOpen(byId('aotd'))) aotdFit(); }, 150);

function openAotd(post, design, s, preview) {
    const el = byId('aotd');
    if (!el || Modals.isOpen(el)) return;
    const paper = byId('aotd-paper');
    paper.className = 'aotd-paper aotd-' + design.id;
    paper.style.setProperty('--aotd-ink', aotdColor(design, s) || '');
    paper.innerHTML = '<div class="aotd-frame">' + AOTD_RENDER[design.id](aotdData(post, design, s)) + '</div>';
    el.dataset.design = design.id;
    // Visitors whose device asks for less motion get a simple fade
    const anim = reduceMotion() && s.anim === 'design' ? 'fade' : s.anim;
    el.dataset.anim = anim;
    el.classList.remove('aotd-in', 'aotd-out', 'aotd-fadein', 'aotd-fadeout');
    if (anim === 'design') el.classList.add('aotd-in');
    else if (anim === 'fade') el.classList.add('aotd-fadein');
    Modals.open(el, { onRequestClose: () => closeAotd(), focus: '.aotd-card' });
    paper.scrollTop = 0;
    aotdFit(true);
    if (!preview) try { localStorage.setItem(KEYS.aotdSeen, aotdToday()); } catch (e) {}
}
function aotdBlocked() { return Modals.stack.length || ui.view === 'admin' || !byId('setup').hidden || Gate.active; }
async function maybeShowAotd() {
    if (!dataReady || currentConfig.artOfToday === false || aotdBlocked()) return;
    const s = aotdSettings();
    if (!s.phones && window.matchMedia(AOTD_PHONE).matches) return;
    let seen = null;
    try { seen = localStorage.getItem(KEYS.aotdSeen); } catch (e) {}
    if (seen === aotdToday()) return;
    const post = aotdPick(s);
    if (!post) return;
    const design = aotdDesignFor(s);
    // Fonts and the picture load during the wait, so the entrance plays with everything in place
    await Promise.all([aotdPrepare(design, post), wait(s.delay * 1000)]);
    // Don't cover a post someone came to see from a shared link, or the admin page; it'll wait for their next visit
    if (aotdBlocked()) return;
    openAotd(post, design, s, false);
}
async function previewAotd(designId) {
    const s = aotdFormSettings();
    const post = aotdPick(s);
    if (!post) { showToast('Post some artwork first, then the pop-up has something to show.', 'error'); return; }
    const design = aotdDesign(designId) || aotdDesignFor(s);
    await aotdPrepare(design, post);
    openAotd(post, design, s, true);
}
async function closeAotd(then) {
    const el = byId('aotd');
    if (!Modals.isOpen(el) || el.classList.contains('aotd-out') || el.classList.contains('aotd-fadeout')) return;
    const anim = el.dataset.anim;
    if (anim !== 'none') {
        el.classList.remove('aotd-in', 'aotd-fadein');
        el.classList.add(anim === 'design' ? 'aotd-out' : 'aotd-fadeout');
        const running = el.getAnimations ? el.getAnimations({ subtree: true }).map(a => a.finished.catch(() => {})) : [];
        await Promise.race([Promise.all(running), wait(1000)]);
    }
    Modals.close(el);
    if (then) then();
}

/* ─── Admin: Site info → Art of Today ─── */

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
        ? '<img src="' + esc(firstImage(p)) + '" alt=""><span>No.' + postNumbers().get(p.id) + ' · ' + esc(excerpt(p.content, 40) || 'Untitled piece') + '</span>'
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
        ? list.map(p => '<button type="button" data-action="aotd-pick-post" data-id="' + p.id + '" aria-label="No.' + nums.get(p.id) + ' ' + esc(excerpt(p.content, 40)) + '"><img src="' + esc(firstImage(p)) + '" alt="" loading="lazy"></button>').join('')
        : '<p class="hint">No image posts yet.</p>';
    Modals.open(byId('picker-modal'));
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
    'toggle-menu': () => toggleMobileMenu(),
    'to-top': () => window.scrollTo({ top: 0, behavior: reduceMotion() ? 'auto' : 'smooth' }),

    'open-post': (el, e) => { e.preventDefault(); if (el.dataset.closePost) closePost(); openPost(Number(el.dataset.id), 0, { focus: el.dataset.focus }); },
    'close-aotd': () => closeAotd(),
    'aotd-view': (el, e) => { e.preventDefault(); const id = Number(el.dataset.id); closeAotd(() => openPost(id)); },
    'preview-aotd': () => previewAotd(),
    'aotd-peek': el => previewAotd(el.dataset.id),
    'aotd-tile': el => aotdTile(el.dataset.id),
    'aotd-choose': () => openAotdPostPicker(),
    'aotd-pick-post': el => { byId('s-aotd-post').value = el.dataset.id; renderAotdPicked(); Modals.close(byId('picker-modal')); },
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
    'feed-more': () => { const keep = $$('#feed-grid .tile').length; ui.feed.limit += FEED_STEP; renderFeed(keep); },
    'featured-prev': () => featuredGo(ui.featured.i - 1),
    'featured-next': () => featuredGo(ui.featured.i + 1),
    'featured-go': el => featuredGo(Number(el.dataset.index)),

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
    'confirm-yes': () => finishConfirm(true),
    'confirm-no': () => finishConfirm(false),

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
    'shrink-start': () => runShrink(),
    'shrink-stop': el => { Shrink.stop = true; el.disabled = true; el.textContent = 'Stopping'; setTimeout(() => { el.disabled = false; el.textContent = 'Stop after this one'; }, 1500); },
    'shrink-copy': () => { const t = byId('shrink-list').value; (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => showToast('List copied'), () => { byId('shrink-list').select(); showToast('Press Ctrl+C to copy the selected list'); }); },
    'shrink-download': () => downloadFile(byId('shrink-list').value + '\n', 'old-images-to-delete.txt'),
    'shrink-forget': async () => { if (!await askConfirm('Only do this once the old files are deleted from Neocities.', { title: 'Clear the list?', yes: 'Clear the list' })) return; writeJSON(KEYS.shrinkLeftovers, []); renderShrink(); },
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
    bindHoldButton();
    bindTooltips();
    bindGlare();
    window.matchMedia('(max-width: 900px)').addEventListener('change', e => { if (!e.matches) closeMobileMenu(); });
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
    byId('mp-search').addEventListener('input', debounce(() => renderManagePosts(), 150));

    // Featured carousel follows manual swipes
    const ft = byId('featured-track');
    ft.addEventListener('scroll', debounce(syncFeaturedFromScroll, 80), { passive: true });

    // Images fade in once loaded
    document.addEventListener('load', e => { if (e.target.tagName === 'IMG') e.target.classList.remove('is-loading'); }, true);
    document.addEventListener('error', e => {
        if (e.target.tagName !== 'IMG') return;
        e.target.classList.remove('is-loading');
        if (e.target.closest('.tile-media, .feat-media, .hero-panel, .zg-pola-img, .zg-sticker, .zc-cover, .cm-art, .page-thumb, .m-thumb, .stamp-pic, .nb-stub-cover, .nb-tk-pages')) e.target.classList.add('is-broken');
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
    await Promise.all(files.map(f => loadScript(f).then(async ok => { if (!ok) await noteLoadFailure(f); loaded++; gateProgress(10 + loaded * 20); })));

    const hasSystem = parseSystemData();
    applyVisualConfig();
    renderHome();
    dataReady = true;
    route();
    if (!hasSystem && loadFailed.has('system.js')) { gateDataReady(); showToast('This site didn\'t finish loading. Check your connection and refresh the page.', 'error'); }
    else if (!hasSystem) { gateSkip(); showSetup(); }
    else gateDataReady();
    if (hasSystem && !Gate.active) maybeShowAotd();
    window.addEventListener('resize', aotdRefit);
    if (pendingOps.length) setTimeout(() => scheduleInteractionsSync(), 2500);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();