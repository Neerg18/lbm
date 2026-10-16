/*
 NEERG v7 · about.js
 The About page, drawn as one of three covers picked in Admin › Site info › About page:
   broadcast  a VHS screen and TV listings
   mixtape    a cassette label, tape shelf and label sheet
   spectrum   a label-system tour poster
 logic.js loads this file and about.css the first time About opens, then calls
 NeergAbout.show(root, data) each time About is shown and NeergAbout.hide() when it isn't.

 Picture effects use VFX-JS by AMAGI (github.com/fand/vfx-js, MIT), self-hosted as vfx.min.js and
 loaded only when the visitor allows motion. Without WebGL the pictures simply show as they are.
*/
(function () {
'use strict';

const VFX_SRC = 'vfx.min.js?v=1';
const FONTS = {
    broadcast: 'family=Archivo+Black&family=Archivo:wght@400;600;800&family=VT323&family=Zen+Kaku+Gothic+New:wght@500;700;900',
    mixtape: 'family=Archivo:wdth,wght@62..125,400..900&family=Unbounded:wght@600;900&family=Yomogi&family=Space+Mono:wght@400;700',
    spectrum: 'family=Krona+One&family=Big+Shoulders+Stencil+Display:wght@900&family=IBM+Plex+Mono:wght@400;600&family=Archivo:wdth,wght@62..125,400..900&family=VT323&family=DotGothic16'
};

const $ = (sel, root) => root.querySelector(sel);
const $$ = (sel, root) => Array.from(root.querySelectorAll(sel));
const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const two = n => String(n).padStart(2, '0');
const still = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const touch = () => window.matchMedia('(hover: none)').matches;
const postLink = p => 'href="#/post/' + p.id + '" data-action="open-post" data-id="' + p.id + '"';
const linkAttrs = l => 'href="' + esc(l.url) + '" target="_blank" rel="noopener me"';
const clockText = () => { const d = new Date(), h = d.getHours(); return (h < 12 ? 'AM ' : 'PM ') + two(h % 12 || 12) + ':' + two(d.getMinutes()); };

function ensureFonts(style) {
    const id = 'ab-fonts-' + style;
    if (!FONTS[style] || document.getElementById(id)) return;
    const l = document.createElement('link');
    l.rel = 'stylesheet'; l.id = id;
    l.href = 'https://fonts.googleapis.com/css2?' + FONTS[style] + '&display=swap';
    document.head.appendChild(l);
}

// A name drawn letter by letter. Each letter keeps its final width while it scrambles, so nothing moves.
function nameCells(name) {
    return Array.from(name).map(ch => {
        const c = ch === ' ' ? '&nbsp;' : esc(ch);
        return '<span class="ab-cell"><span class="ab-ghost">' + c + '</span><span class="ab-glyph">' + c + '</span></span>';
    }).join('');
}
const GLYPHS = 'アイウエオカキクケコサシスセソ#%&@*+=?';
function scrambler(root, name) {
    const glyphs = $$('.ab-glyph', root), chars = Array.from(name);
    let timer = 0;
    return {
        run() {
            if (still() || !glyphs.length) return;
            let frame = 0;
            clearInterval(timer);
            timer = setInterval(() => {
                frame++;
                const settled = Math.floor(frame / 3);
                glyphs.forEach((g, i) => { g.textContent = i < settled || chars[i] === ' ' ? chars[i].replace(' ', ' ') : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]; });
                if (settled >= glyphs.length) clearInterval(timer);
            }, 55);
        },
        stop() { clearInterval(timer); glyphs.forEach((g, i) => { g.textContent = chars[i].replace(' ', ' '); }); }
    };
}

const BARCODE = '<svg viewBox="0 0 64 22" width="64" height="22" aria-hidden="true"><path fill="currentColor" d="M0 0h3v22H0zM5 0h1v22H5zM8 0h4v22H8zM14 0h1v22h-1zM17 0h2v22h-2zM21 0h3v22h-3zM26 0h1v22h-1zM29 0h4v22h-4zM35 0h2v22h-2zM39 0h1v22h-1zM42 0h3v22h-3zM47 0h1v22h-1zM50 0h4v22h-4zM56 0h2v22h-2zM60 0h4v22h-4z"/></svg>';
const TRIANGLE = '<svg viewBox="0 0 10 12" width="10" height="12" aria-hidden="true"><path d="M0 0 L10 6 L0 12 Z" fill="currentColor"/></svg>';

/* ═════════════════════════════════════════════
   WEBGL PICTURES (VFX-JS)
   Each picture is painted into a <canvas> with a "cover" crop, then VFX-JS redraws it through a
   shader on its own canvas. Frames that carry tags or captions sit above that canvas and turn
   see-through (.fx-live), so the effect shows from underneath while their labels stay on top.
   ═════════════════════════════════════════════ */

let vfxLoading = null;
function loadVfx() {
    if (window.VFXJS) return Promise.resolve(true);
    if (vfxLoading) return vfxLoading;
    vfxLoading = new Promise(resolve => {
        const s = document.createElement('script');
        s.src = VFX_SRC;
        s.onload = () => resolve(!!window.VFXJS);
        s.onerror = () => { vfxLoading = null; resolve(false); };
        document.head.appendChild(s);
    });
    return vfxLoading;
}

// Resolves false if the picture can't be read back (another site's picture without permission),
// in which case it is shown plain.
function paintCover(canvas, src, scale) {
    const draw = img => {
        const pr = Math.min(window.devicePixelRatio || 1, 2) * (scale || 1);
        const w = Math.max(2, Math.round(canvas.offsetWidth * pr)), h = Math.max(2, Math.round(canvas.offsetHeight * pr));
        canvas.width = w; canvas.height = h;
        const s = Math.max(w / img.naturalWidth, h / img.naturalHeight), sw = w / s, sh = h / s;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, (img.naturalWidth - sw) / 2, (img.naturalHeight - sh) / 2, sw, sh, 0, 0, w, h);
        try { ctx.getImageData(0, 0, 1, 1); return true; } catch (e) { return false; }
    };
    return new Promise(done => {
        const load = cors => {
            const img = new Image();
            if (cors) img.crossOrigin = 'anonymous';
            img.onload = () => done(img.naturalWidth ? draw(img) : false);
            img.onerror = () => cors ? load(false) : done(false);
            img.src = src;
        };
        load(true);
    });
}

const FX_HEAD = `precision highp float;
uniform vec2 resolution;
uniform vec2 offset;
uniform float time;
uniform vec2 mouse;
uniform sampler2D src;
out vec4 outColor;
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
float rbox(vec2 p, vec2 b, float r) { vec2 q = abs(p) - b + r; return length(max(q, 0.)) + min(max(q.x, q.y), 0.) - r; }
`;

class Fx {
    constructor() {
        this.vfx = null; this.recs = new Map(); this.dead = false;
        this.pr = Math.min(window.devicePixelRatio || 1, 1.5);
        this.scale = 1; // how much the cover is zoomed on wide screens
        this.px = null; this.py = null;
        this.onPointer = e => { this.px = e.clientX; this.py = e.clientY; };
        window.addEventListener('pointermove', this.onPointer, { passive: true });
        window.addEventListener('pointerdown', this.onPointer, { passive: true }); // a tap counts as pointing on phones
    }
    start() {
        try { this.vfx = new window.VFXJS.VFX({ pixelRatio: this.pr, zIndex: 0, scrollPadding: false }); } catch (e) { this.vfx = null; }
        if (this.vfx) for (const [canvas, rec] of this.recs) if (rec.ok) this.put(canvas, rec.src);
        return !!this.vfx;
    }
    // Paint a picture into a canvas and hand it to VFX-JS (the first call's options stick)
    async put(canvas, src, opts) {
        if (!canvas || !src || this.dead) return;
        const rec = this.recs.get(canvas) || { opts };
        this.recs.set(canvas, rec);
        const token = rec.token = (rec.token || 0) + 1;
        rec.src = src;
        rec.ok = await paintCover(canvas, src, this.scale);
        if (rec.token !== token || this.dead || !this.vfx) return;
        const host = canvas.parentElement;
        try {
            if (!rec.ok) { if (rec.added) { this.vfx.remove(canvas); rec.added = false; canvas.style.opacity = ''; host.classList.remove('fx-live'); } return; }
            if (rec.added) { this.vfx.update(canvas); return; }
            rec.added = true;
            await this.vfx.add(canvas, Object.assign({ wrap: 'clamp' }, rec.opts));
            host.classList.add('fx-live');
        } catch (e) { rec.added = false; canvas.style.opacity = ''; host.classList.remove('fx-live'); }
    }
    repaint() { for (const [canvas, rec] of this.recs) if (canvas.isConnected) this.put(canvas, rec.src); }
    // Eases 0..1 toward "the pointer is over this element", once per frame
    hover(state, el) {
        let on = 0;
        if (el && this.px != null) { const r = el.getBoundingClientRect(); on = this.px >= r.left && this.px <= r.right && this.py >= r.top && this.py <= r.bottom ? 1 : 0; }
        state.v = (state.v || 0) + (on - (state.v || 0)) * 0.14;
        return state.v;
    }
    stop() {
        this.dead = true;
        window.removeEventListener('pointermove', this.onPointer);
        window.removeEventListener('pointerdown', this.onPointer);
        if (this.vfx) { try { this.vfx.destroy(); } catch (e) {} }
        this.vfx = null; this.recs.clear();
    }
}

// Corner radii as drawn (CSS shrinks them when they don't fit), in effect pixels: [tr, br, tl, bl]
function radii(el, pr) {
    const cs = getComputedStyle(el), w = el.offsetWidth, h = el.offsetHeight;
    const tl = parseFloat(cs.borderTopLeftRadius) || 0, tr = parseFloat(cs.borderTopRightRadius) || 0;
    const br = parseFloat(cs.borderBottomRightRadius) || 0, bl = parseFloat(cs.borderBottomLeftRadius) || 0;
    const f = Math.min(1, w / (tl + tr || 1), w / (bl + br || 1), h / (tl + bl || 1), h / (tr + br || 1));
    return [tr * f * pr, br * f * pr, tl * f * pr, bl * f * pr];
}

/* ═════════════════════════════════════════════
   A · BROADCAST
   ═════════════════════════════════════════════ */

// Big screen: a worn VHS picture (line wobble, color split, rolling tracking band, scanlines). Changing
// channel spikes "zap" for a burst of snow and tearing. Line noise after VFX-JS's glitch preset.
const SCREEN_FX = FX_HEAD + `
uniform float zap;
void main() {
  vec2 uv = (gl_FragCoord.xy - offset) / resolution;
  float t = time, line = floor(gl_FragCoord.y / 2.);
  float band = 1. - smoothstep(0., .045, abs(uv.y - fract(1. - t * .11)));
  float wob = sin(uv.y * 40. + t * 3.) * .0015 + (hash(vec2(line, floor(t * 24.))) - .5) * (.003 + zap * .14) + band * (hash(vec2(line, t)) - .5) * .03;
  vec2 u = vec2(uv.x + wob, fract(uv.y + zap * zap * .4 * sin(t * 37.)));
  float split = .003 + zap * .035 + band * .006;
  vec3 c = vec3(texture(src, u + vec2(split, 0.)).r, texture(src, u).g, texture(src, u - vec2(split, 0.)).b);
  c *= .86 + .14 * sin(gl_FragCoord.y * 3.14159);
  float g = hash(gl_FragCoord.xy + fract(t) * 91.);
  c += (g - .5) * .07 + band * g * .22;
  c = mix(c, vec3(g), clamp(zap * 1.3 - .1, 0., .92));
  vec2 d = uv - .5;
  c *= 1. - dot(d, d) * .9;
  outColor = vec4(c, 1.);
}`;
// Small TVs: clean until you point at one, then the picture tears sideways and splits into RGB
const TILE_FX = FX_HEAD + `
uniform float hover;
void main() {
  vec2 uv = (gl_FragCoord.xy - offset) / resolution;
  float line = floor(gl_FragCoord.y / 3.);
  vec2 u = uv + vec2((hash(vec2(line, floor(time * 18.))) - .5) * .06 * hover, 0.);
  float s = .003 + .014 * hover;
  vec3 c = vec3(texture(src, u + vec2(s, 0.)).r, texture(src, u).g, texture(src, u - vec2(s, 0.)).b);
  c *= .9 + .1 * sin(gl_FragCoord.y * 2.1);
  outColor = vec4(c, 1.);
}`;

const BC_TIMES = ['8:00', '8:30', '9:00', '9:30', '10:00', '10:30'];
const BC_FRAMES = ['#E8413B', '#F5D33A', '#3EC6E0', '#7BD34A'];
const BC_TAGS = ['#F2507B', '#3EC6E0', '#F5D33A', '#7BD34A'];

const broadcast = {
    html(d) {
        const P = d.posts, len = Math.max(Array.from(d.name).length, 3);
        const tiles = P.slice(1, 4).map((p, k) => '<button type="button" class="bc-tv" style="--frame:' + BC_FRAMES[k] + '"><canvas role="img"></canvas><span class="bc-vt"></span></button>').join('');
        const rows = P.map((p, i) => '<a class="bc-lrow" ' + postLink(p) + '><span class="bc-vt" style="font-size:26px">' + BC_TIMES[i] + ' PM</span><img src="' + esc(p.img) + '" alt="" loading="lazy" decoding="async"><span style="min-width:0"><b>' + esc(p.label) + '</b><small>' + esc(p.date) + '</small></span>' + (p.tag ? '<span class="bc-ltag" style="--c:' + BC_TAGS[i % 4] + '">' + esc(p.tag) + '</span>' : '<span></span>') + '</a>').join('');
        const links = d.links.map((l, i) => '<a ' + linkAttrs(l) + '><span><i class="' + esc(l.icon) + '" aria-hidden="true"></i> CH ' + (11 + i) + ' · ' + esc(l.label) + '</span><span aria-hidden="true">→</span></a>').join('');
        return '<section class="bc-crt"><div class="bc-track" aria-hidden="true"></div><div class="ab-in bc-hero">'
            + '<div style="position:relative;min-width:0">'
            + '<div class="bc-rec bc-vt"><span>VIDEO 1</span><span class="bc-recbox bc-blink">REC</span></div>'
            + '<div class="bc-name"><p class="bc-kana bc-jp">アーカイブ ' + two(d.counts.posts) + '</p>'
            + '<div class="bc-row"><div class="bc-stripe" aria-hidden="true"><span></span><span></span><span></span><span></span></div>'
            + '<h1 class="bc-ttl bc-blk bc-rgb" style="--len:' + len + '" aria-label="' + esc(d.name) + '"><span aria-hidden="true">' + nameCells(d.name) + '</span></h1></div>'
            + '<p class="bc-kana2 bc-jp">デジタルアートアーカイブ <span class="bc-ng">' + esc(d.initials) + '</span></p></div>'
            + '<div class="bc-bio bc-vt">' + (d.tagline ? '<p class="bc-tagline">' + esc(d.tagline) + '.</p>' : '') + '<div class="ab-prose">' + d.bio + '</div></div>'
            + '<div class="bc-btns"><a class="bc-btn is-solid bc-blk" href="#/gallery">' + TRIANGLE + ' PLAY: SEE MY WORK</a>'
            + '<a class="bc-btn bc-blk" href="#/commissions"><span class="bc-dot bc-blink" aria-hidden="true"></span> COMMISSIONS ' + (d.open ? 'ON AIR' : 'OFF AIR') + '</a></div>'
            + '</div>'
            + '<div style="min-width:0"><div class="bc-nowbar bc-vt"><span>NOW PLAYING · <span data-ch>CH 01</span></span>'
            + '<svg viewBox="0 0 64 30" width="64" height="30" aria-hidden="true"><rect x="2" y="3" width="54" height="24" rx="3" fill="none" stroke="#CFE8FF" stroke-width="3"/><rect x="57" y="10" width="5" height="10" fill="#CFE8FF"/><rect x="7" y="8" width="30" height="14" fill="#CFE8FF"/></svg></div>'
            + '<div class="bc-big">' + (P.length ? '<canvas role="img"></canvas>' : '<div class="ab-none">No signal yet. Post some art!</div>')
            + '<div class="bc-static" aria-hidden="true"></div><div class="bc-scan" aria-hidden="true"></div>'
            + (P.length ? '<a class="bc-cap bc-vt" data-cap></a>' : '')
            + '<span class="bc-burst" aria-hidden="true"><svg viewBox="0 0 100 100" width="108" height="108"><polygon points="50,2 58,30 86,14 72,42 98,50 72,58 86,86 58,70 50,98 42,70 14,86 28,58 2,50 28,42 14,14 42,30" fill="#F5D33A"/></svg><b>NEW<br>ART</b></span></div>'
            + (tiles ? '<div class="bc-screens">' + tiles + '</div>' : '') + '</div>'
            + '<div class="bc-hud bc-vt" aria-hidden="true">SP<br>STEREO<br><span data-clock></span></div>'
            + '</div></section>'
            + '<section class="bc-list"><div class="ab-in"><div><div class="bc-lhead"><h2>TONIGHT\'S LISTINGS</h2><span class="bc-jp">今夜の番組</span></div>'
            + (rows || '<p style="padding:20px 6px">Nothing on tonight yet.</p>') + '</div>'
            + '<aside class="bc-side"><div class="bc-guide"><p class="bc-vt" style="margin-bottom:12px;font-size:24px">CHANNEL GUIDE</p><div class="bc-nums">'
            + '<div style="--c:#3EC6E0"><b>' + d.counts.posts + '</b><span>pieces</span></div><div style="--c:#F5D33A"><b>' + d.counts.boards + '</b><span>boards</span></div><div style="--c:#F2507B"><b>' + d.counts.comics + '</b><span>comics</span></div></div></div>'
            + (links ? '<div class="bc-find"><h3>FIND ME ON</h3>' + links + '</div>' : '')
            + '</aside></div></section>';
    },
    wire(root, d, fx) {
        const P = d.posts, name = scrambler(root, d.name);
        const screen = $('.bc-big > canvas', root), cap = $('[data-cap]', root), ch = $('[data-ch]', root), stat = $('.bc-static', root), clock = $('[data-clock]', root);
        const tiles = $$('.bc-tv', root);
        let now = 0, zapAt = -1e9, clockTimer = 0;
        const others = () => P.map((p, i) => i).filter(i => i !== now).slice(0, 3);
        function draw() {
            const p = P[now]; if (!p) return;
            ch.textContent = 'CH ' + two(now + 1);
            cap.textContent = p.label + ' · ' + p.date;
            cap.setAttribute('href', '#/post/' + p.id); cap.dataset.action = 'open-post'; cap.dataset.id = p.id;
            screen.setAttribute('aria-label', p.label);
            fx.put(screen, p.img, { shader: SCREEN_FX, uniforms: { zap: () => Math.max(0, 1 - (performance.now() - zapAt) / 650) } });
            others().forEach((i, k) => {
                const t = tiles[k]; if (!t) return;
                const h = {};
                t.dataset.i = i;
                t.setAttribute('aria-label', 'Tune to ' + P[i].label);
                t.lastElementChild.textContent = 'CH ' + two(i + 1);
                t.firstElementChild.setAttribute('aria-label', P[i].label);
                fx.put(t.firstElementChild, P[i].img, { shader: TILE_FX, uniforms: { hover: () => fx.hover(h, t) } });
            });
        }
        tiles.forEach(t => t.addEventListener('click', () => {
            now = Number(t.dataset.i); zapAt = performance.now();
            stat.classList.remove('is-zap'); void stat.offsetWidth; stat.classList.add('is-zap');
            name.run(); draw();
        }));
        const tick = () => { if (clock) clock.textContent = clockText(); };
        return {
            start() { draw(); name.run(); tick(); clockTimer = setInterval(tick, 1000); },
            stop() { clearInterval(clockTimer); name.stop(); }
        };
    }
};

/* ═════════════════════════════════════════════
   D · MIXTAPE
   ═════════════════════════════════════════════ */

// J-card: a worn tape picture. "noise" (noise reduction OFF) adds wow and flutter, color bleed and a
// tracking line; "wind" (FF/REW) smears and rolls it. The card is tilted, so the shader turns the picture
// by the same angle inside its upright box and leaves the corners clear.
const JCARD_FX = FX_HEAD + `
uniform float noise;
uniform float wind;
uniform float ang;
uniform vec2 box;
void main() {
  vec2 p = gl_FragCoord.xy - offset - resolution * .5;
  float c0 = cos(ang), s0 = sin(ang);
  vec2 uv = vec2(c0 * p.x - s0 * p.y, s0 * p.x + c0 * p.y) / box + .5;
  if (uv.x < 0. || uv.x > 1. || uv.y < 0. || uv.y > 1.) discard;
  float t = time, line = floor(uv.y * box.y / 2.);
  float sway = sin(uv.y * 6. + t * 1.7) * .004 + sin(uv.y * 31. + t * 9.) * .0015;
  float jit = (hash(vec2(line, floor(t * 20.))) - .5) * .006;
  float dx = (sway + jit) * noise + wind * (sin(uv.y * 14. + t * 30.) * .03 + (hash(vec2(line, t)) - .5) * .08);
  vec2 u = vec2(uv.x + dx, fract(uv.y + wind * fract(t * 1.6)));
  float bleed = .0025 * noise + .012 * wind;
  vec3 col = vec3(texture(src, u + vec2(bleed, 0.)).r, texture(src, u).g, texture(src, u - vec2(bleed, 0.)).b);
  float b = (1. - smoothstep(0., .03, abs(uv.y - fract(t * .09)))) * noise;
  float g = hash(vec2(floor(gl_FragCoord.x * .5), line + floor(t * 30.)));
  col = mix(col, vec3(g), b * .4 + wind * .15);
  col += (g - .5) * .07 * noise;
  col = mix(col, col * vec3(1.04, .98, .92) + .03, noise * .6);
  outColor = vec4(col, 1.);
}`;
// Label thumbnails: chunky pixels with a 2x2 ordered dither; pointing at a label sharpens it smoothly
const LABEL_FX = FX_HEAD + `
uniform float hover;
uniform float radius;
void main() {
  vec2 uv = (gl_FragCoord.xy - offset) / resolution;
  float m = clamp(.5 - rbox((uv - .5) * resolution, resolution * .5, radius), 0., 1.);
  if (m <= 0.) discard;
  float k = 1. - hover;
  float cells = mix(320., 20., k * k);
  vec2 grid = vec2(cells, cells * resolution.y / resolution.x);
  vec2 cell = floor(uv * grid);
  vec3 c = texture(src, (cell + .5) / grid).rgb;
  float bx = mod(cell.x, 2.), by = mod(cell.y, 2.);
  float d = (mix(mix(0., 3., by), mix(2., 1., by), bx) + .5) / 4. - .5;
  c = mix(c, floor(c * 4. + d * 1.2 + .5) / 4., k);
  outColor = vec4(c * m, m);
}`;

const MX_SPINES = [
    { brand: 'SUPERCOLOR 60', bg: '#1E1A17', fg: '#F6EFE0', band: 'linear-gradient(90deg,#E8412F 0 20%,#F2892B 0 40%,#F5C33B 0 60%,#5DAE5B 0 80%,#2E86C8 0)' },
    { brand: 'CHROMA T-70', bg: '#F6C9D3', fg: '#5A1E2C', band: 'repeating-linear-gradient(180deg,#E05A7A 0 8px,#F7F1E3 8px 11px)' },
    { brand: 'STANDARD C-90', bg: '#F4F1EA', fg: '#1E1A17', band: '#E8412F' },
    { brand: 'DUSK HI-FI', bg: 'linear-gradient(90deg,#2B1B4F,#8E2F7A 60%,#F2762E)', fg: '#FFE9C9', band: 'repeating-linear-gradient(180deg,#F5C33B 0 7px,#2B1B4F 7px 10px)' },
    { brand: 'VHS T-120', bg: '#111111', fg: '#FFFFFF', band: 'linear-gradient(115deg,#E8412F,#F5C33B,#5DAE5B,#2E86C8)' },
    { brand: 'SUPER·ART C-07', bg: '#F2762E', fg: '#1E1A17', band: '#1E1A17' }
];
const MX_SHIFT = ['0px', '18px', '6px', '26px', '10px', '20px'];
const MX_ROT = ['-0.6deg', '0.5deg', '-0.3deg', '0.8deg', '-0.5deg', '0.3deg'];
const MX_TICK = '<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="M3 11 L8 16 L18 3" fill="none" stroke="#2E4FA8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const MX_REEL = '<svg class="mx-reel" viewBox="-60 -60 120 120" aria-hidden="true" style="POS"><circle r="40" fill="#5A3A22" stroke="#3A2414" stroke-width="2"/><g class="hub"><circle r="21" fill="#F7F1E3"/>'
    + [0, 60, 120, 180, 240, 300].map(a => '<rect x="-3" y="-17" width="6" height="9" fill="#2A2420" transform="rotate(' + a + ')"/>').join('') + '<circle r="6" fill="#2A2420"/></g></svg>';

const mixtape = {
    html(d) {
        const P = d.posts, N = two(d.counts.posts), len = Math.max(Array.from(d.name).length, 3), now = P[0];
        const today = (() => { const t = new Date(); return t.getFullYear() + '.' + two(t.getMonth() + 1) + '.' + two(t.getDate()); })();
        const spines = P.map((p, i) => {
            const s = MX_SPINES[i % MX_SPINES.length];
            return '<button type="button" class="mx-spine" data-i="' + i + '" aria-label="Play ' + esc(p.label) + '" style="margin-left:' + MX_SHIFT[i] + ';transform:rotate(' + MX_ROT[i] + ');--bg:' + s.bg + ';--fg:' + s.fg + ';--band:' + s.band + '">'
                + '<span class="mx-thumb"><img src="' + esc(p.img) + '" alt="" loading="lazy" decoding="async"></span><span class="mx-code mx-wide" style="font-size:15px">A' + (i + 1) + '</span>'
                + '<span class="mx-ttl">' + esc(p.label) + '</span><span class="mx-meta mx-mono">' + esc([p.tag, p.md].filter(Boolean).join(' · ')) + '</span>'
                + '<span class="mx-band"><span class="mx-brandname mx-mono">' + s.brand + '</span><span class="mx-chip mx-mono">IN THE DECK</span></span></button>';
        }).join('');
        const pic = i => P.length ? P[i % P.length].img : '';
        const labels = [
            { code: 'NG-01', img: pic(1), big: d.counts.posts, what: 'Pieces in the gallery', go: 'Gallery', href: '#/gallery' },
            { code: 'NG-02', img: d.comicCover || pic(2), big: d.counts.comics, what: 'Comics to read', go: 'Comics', href: '#/comics' },
            { code: 'NG-03', img: pic(3), big: d.counts.boards, what: 'Boards', go: 'Boards', href: '#/gallery' },
            { code: 'NG-04', img: pic(4), big: d.open ? 'OPEN' : 'CLOSED', what: 'Commissions', go: 'Order', href: '#/commissions' }
        ].map(l => '<a class="mx-plab" href="' + l.href + '"><span class="mx-plab-top"><span class="mx-bars" style="width:30px;height:18px;border-radius:3px"></span><span class="mx-mono">' + l.code + '</span><span class="mx-mono">製品</span></span>'
            + '<span class="mx-px">' + (l.img ? '<canvas data-src="' + esc(l.img) + '" aria-hidden="true"></canvas><span class="mx-dither"></span>' : '<span class="ab-none">Nothing yet</span>') + '</span>'
            + '<b class="mx-uni">' + esc(l.big) + '</b><span class="mx-wide">' + l.what + '</span><span class="mx-plab-foot">' + BARCODE + '<span class="mx-wide">' + l.go + ' →</span></span></a>').join('');
        const links = d.links.map(l => '<a ' + linkAttrs(l) + '><i class="' + esc(l.icon) + '" aria-hidden="true"></i>' + esc(l.label) + '</a>').join('');
        return '<svg class="mx-hiss" aria-hidden="true"><filter id="mx-grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#mx-grain)"/></svg>'
            + '<div class="ab-in mx-top mx-mono"><span>SIDE A · ' + esc(d.name) + (d.tagline ? ' · ' + esc(d.tagline) : '') + ' · ' + d.counts.posts + ' PIECES ON THIS TAPE</span><span>製品 · NOISE REDUCTION <span data-nr-label>OFF</span> · REC ' + esc(d.years) + '</span></div>'
            + '<div class="ab-in"><div class="mx-mast"><span class="mx-mastband mx-stripes" aria-hidden="true"></span><h1 class="mx-uni" style="--len:' + len + '">' + esc(d.name) + '</h1>'
            + '<p class="mx-mixhand mx-hand" aria-hidden="true">mixtape vol.' + N + '</p><span class="mx-mastkana" aria-hidden="true">アート</span></div></div>'
            + '<section class="ab-in mx-hero" aria-label="Now playing"><div class="mx-cassette"><div class="mx-shell">'
            + '<span class="mx-screw" style="left:7px;top:7px"></span><span class="mx-screw" style="right:7px;top:7px"></span><span class="mx-screw" style="left:7px;bottom:30px"></span><span class="mx-screw" style="right:7px;bottom:30px"></span>'
            + '<div class="mx-label"><div class="mx-brand"><div><span class="mx-uni" style="font-size:40px;line-height:.9">SUPER·ART</span><span class="mx-brandsub mx-wide" style="font-size:11px;white-space:nowrap">Digital art tape</span></div><div class="mx-pills"><span class="mx-pill mx-wide">High bias</span><span class="mx-pill mx-wide">Type II</span></div></div>'
            + '<div class="mx-side"><span class="mx-wide" style="font-size:12px">Side</span><span class="mx-uni" style="font-size:56px;line-height:1">A</span></div>'
            + '<div class="mx-lines"><div class="mx-ln"><span class="mx-wide">Name</span><span class="mx-hand">' + esc(d.name.toLowerCase()) + '</span></div><div class="mx-ln"><span class="mx-wide">Date</span><span class="mx-hand">' + today + '</span></div><div class="mx-ln"><span class="mx-wide">Title</span><span class="mx-hand" data-title></span></div></div>'
            + '<p class="mx-kana mx-hand" aria-hidden="true">アートの<br>テープ ★</p>'
            + '<div class="mx-nr"><span class="mx-wide" style="font-size:11px;line-height:1.25">Noise<br>reduction</span><button type="button" class="mx-nrb" data-nr="on" aria-pressed="false"><span class="mx-box">' + MX_TICK + '</span>ON</button><button type="button" class="mx-nrb" data-nr="off" aria-pressed="true"><span class="mx-box">' + MX_TICK + '</span>OFF</button></div>'
            + '<div class="mx-win">' + (now ? '<img src="' + esc(now.img) + '" alt="" data-win>' : '') + MX_REEL.replace('POS', 'left:14%') + MX_REEL.replace('POS', 'right:14%') + '</div>'
            + '<div class="mx-num"><span class="mx-uni">' + N + '</span><span class="mx-wide" style="margin-top:8px;font-size:11px">Pieces</span></div>'
            + '<div class="mx-strip"><span class="mx-mono">DIGITAL ART ARCHIVE · 製品 · ' + esc(d.initials) + '-' + N + '</span><span class="mx-stripes" aria-hidden="true"></span></div>'
            + '</div><div class="mx-mouth" aria-hidden="true"><span></span><span></span></div></div>'
            + (P.length > 1 ? '<div class="mx-deck"><button type="button" class="mx-key" data-key="rew" aria-label="Previous piece"><svg viewBox="0 0 24 16" width="22" height="15" aria-hidden="true"><path d="M12 0 L0 8 L12 16 Z M24 0 L12 8 L24 16 Z" fill="currentColor"/></svg>REW</button>'
                + '<button type="button" class="mx-key is-on" data-key="play" aria-label="Play or pause"><svg class="ic-play" viewBox="0 0 14 16" width="13" height="15" aria-hidden="true"><path d="M0 0 L14 8 L0 16 Z" fill="currentColor"/></svg><svg class="ic-pause" viewBox="0 0 14 16" width="13" height="15" aria-hidden="true"><path d="M0 0 H5 V16 H0 Z M9 0 H14 V16 H9 Z" fill="currentColor"/></svg><span>PAUSE</span></button>'
                + '<button type="button" class="mx-key" data-key="ff" aria-label="Next piece"><svg viewBox="0 0 24 16" width="22" height="15" aria-hidden="true"><path d="M0 0 L12 8 L0 16 Z M12 0 L24 8 L12 16 Z" fill="currentColor"/></svg>FF</button>'
                + '<span class="mx-counter mx-mono" aria-hidden="true" data-counter>120</span><p class="mx-hint mx-mono">TAP A TAPE ON THE SHELF<br>TO PUT IT IN THE DECK</p></div>' : '')
            + '</div>'
            + '<figure class="mx-jcard"><div class="mx-jspine"><span class="mx-wide" data-spine></span></div><div class="mx-jfront">'
            + (now ? '<canvas role="img"></canvas><span class="mx-track" aria-hidden="true"></span><span class="mx-now mx-wide" data-now></span>'
                + '<a class="mx-jcap" data-cap><span class="mx-bars"></span><span><b class="mx-wide" data-cap-title></b><small class="mx-mono" data-cap-meta></small></span><span class="mx-mono" style="font-size:11px;line-height:1.3;text-align:right" data-cap-no></span></a>'
                : '<div class="ab-none">No tape loaded yet</div>')
            + '</div></figure></section>'
            + '<section class="ab-in mx-shelf"><div>' + (spines ? '<div class="mx-h2row"><h2 class="mx-uni">THE TAPE SHELF</h2><span class="mx-mono" style="font-size:11px;letter-spacing:.08em">LATEST POSTS</span></div>' + spines : '') + '</div>'
            + '<aside class="mx-notes"><div style="display:flex;align-items:center;justify-content:space-between;gap:12px;height:34px"><h2 class="mx-wide">Liner notes</h2><span class="mx-bars" style="width:30px;height:22px"></span></div>'
            + '<div class="ab-prose">' + d.bio + '</div><p class="mx-hand" style="font-size:28px;line-height:34px">— ' + esc(d.name.toLowerCase()) + '</p>'
            + '<div class="mx-btns"><a class="mx-btn" href="#/gallery" style="background:#221C17;color:#F7F1E3">See my work</a><a class="mx-btn" href="#/commissions" style="background:#F2762E">Commissions ' + (d.open ? 'open' : 'closed') + '</a></div>'
            + (links ? '<p class="mx-mono" style="margin-top:22px;font-size:11px;line-height:34px;letter-spacing:.1em">FIND ME ON</p><div class="mx-links">' + links + '</div>' : '')
            + '</aside></section>'
            + '<section class="ab-in mx-sheetsec"><div class="mx-sheet"><p class="mx-mono">LABEL SHEET · PEEL &amp; STICK · ' + (touch() ? 'TAP' : 'HOVER') + ' A LABEL TO CLEAR THE PICTURE</p>' + labels + '</div></section>'
            + '<div class="mx-end"><div class="mx-stripes" aria-hidden="true"></div><p class="mx-mono">END OF SIDE A · PLEASE FLIP THE TAPE</p></div>';
    },
    wire(root, d, fx) {
        const P = d.posts;
        const card = $('.mx-jfront > canvas', root), jcard = $('.mx-jcard', root);
        const counter = $('[data-counter]', root), packs = $$('.mx-reel > circle', root);
        const spines = $$('.mx-spine', root), play = $('[data-key="play"]', root);
        let now = 0, nr = false, playing = true, winding = false, count = 120, timer = 0, windTimer = 0, ang = 0;
        const noise = { v: 1 }, wind = { v: 0 };
        const tilt = () => { const m = jcard && getComputedStyle(jcard).transform.match(/matrix\(([^,]+),\s*([^,]+)/); ang = m ? Math.atan2(Number(m[2]), Number(m[1])) : 0; };
        const set = (sel, text) => { const n = $(sel, root); if (n) n.textContent = text; };
        // Tape moves from the left reel to the right one as the counter goes up
        function reels() {
            if (counter) counter.textContent = String(count).padStart(3, '0');
            const p = count / 999;
            if (packs[0]) packs[0].setAttribute('r', Math.round(25 + 31 * (1 - p)));
            if (packs[1]) packs[1].setAttribute('r', Math.round(25 + 31 * p));
        }
        function load(i, wound) {
            const p = P[i]; if (!p) return;
            now = i;
            const title = $('[data-title]', root);
            title.textContent = p.label;
            title.classList.remove('mx-write'); void title.offsetWidth; title.classList.add('mx-write');
            set('[data-spine]', d.name + ' · ' + p.label + ' · C-' + two(d.counts.posts));
            set('[data-now]', 'Now playing · A' + (i + 1));
            set('[data-cap-title]', p.label);
            set('[data-cap-meta]', [p.tag, p.md].filter(Boolean).join(' · '));
            const no = $('[data-cap-no]', root); if (no) no.innerHTML = '製品<br>No.' + p.no;
            const cap = $('[data-cap]', root);
            if (cap) { cap.setAttribute('href', '#/post/' + p.id); cap.dataset.action = 'open-post'; cap.dataset.id = p.id; }
            const win = $('[data-win]', root); if (win) win.src = p.img;
            spines.forEach(s => s.classList.toggle('is-on', Number(s.dataset.i) === i));
            if (card) {
                card.setAttribute('aria-label', p.label);
                fx.put(card, p.img, { shader: JCARD_FX, uniforms: {
                    noise: () => (noise.v += ((nr ? 0 : 1) - noise.v) * .08),
                    wind: () => (wind.v += ((winding ? 1 : 0) - wind.v) * .2),
                    ang: () => ang,
                    box: () => [card.offsetWidth * fx.scale * fx.pr, card.offsetHeight * fx.scale * fx.pr]
                } });
            }
            if (wound) {
                count = (i * 163 + 40) % 1000; reels();
                winding = true; root.classList.add('is-winding');
                clearTimeout(windTimer);
                windTimer = setTimeout(() => { winding = false; root.classList.remove('is-winding'); }, 800);
                setPlaying(true);
            }
        }
        function setPlaying(on) {
            playing = on;
            root.classList.toggle('is-playing', on);
            if (play) { play.classList.toggle('is-on', on); play.lastElementChild.textContent = on ? 'PAUSE' : 'PLAY'; }
        }
        function setNr(on) {
            nr = on;
            root.classList.toggle('is-hiss', !on);
            $$('[data-nr]', root).forEach(b => b.setAttribute('aria-pressed', String((b.dataset.nr === 'on') === on)));
            set('[data-nr-label]', on ? 'ON' : 'OFF');
        }
        root.addEventListener('click', e => {
            const t = e.target.closest('[data-key],[data-nr],.mx-spine');
            if (!t || !root.contains(t)) return;
            if (t.dataset.nr) setNr(t.dataset.nr === 'on');
            else if (t.dataset.key === 'play') setPlaying(!playing);
            else if (t.dataset.key === 'ff') load((now + 1) % P.length, true);
            else if (t.dataset.key === 'rew') load((now + P.length - 1) % P.length, true);
            else if (t.dataset.i != null) load(Number(t.dataset.i), true);
        });
        $$('.mx-px > canvas', root).forEach(c => {
            const h = {}, lab = c.closest('.mx-plab');
            fx.put(c, c.dataset.src, { shader: LABEL_FX, uniforms: { hover: () => fx.hover(h, lab), radius: () => 10 * fx.scale * fx.pr } });
        });
        return {
            start() {
                tilt(); setNr(false); setPlaying(true); reels(); load(0, false);
                // The counter ticks while the tape plays, faster while winding
                timer = setInterval(() => { if (playing) { count = (count + (winding ? 9 : 1)) % 1000; reels(); } }, 500);
            },
            resize: tilt,
            stop() { clearInterval(timer); clearTimeout(windTimer); }
        };
    }
};

/* ═════════════════════════════════════════════
   E · SPECTRUM
   ═════════════════════════════════════════════ */

// Orange frames: the picture prints as a halftone (dark ink dots on orange, after VFX-JS's halftone preset)
// and its real colors show through a soft circle around the pointer. "prog" runs a label-printer feed from
// the top whenever a new picture goes in.
const FRAME_FX = FX_HEAD + `
uniform float hover;
uniform float radius;
uniform float prog;
uniform float cell;
const vec3 HI = vec3(1., .357, .122);
const vec3 LO = vec3(.165, .059, .024);
void main() {
  vec2 uv = (gl_FragCoord.xy - offset) / resolution;
  float m = clamp(.5 - rbox((uv - .5) * resolution, resolution * .5, radius), 0., 1.);
  if (m <= 0.) discard;
  vec3 c = texture(src, uv).rgb;
  float l = clamp((dot(c, vec3(.299, .587, .114)) - .5) * 1.3 + .55, 0., 1.);
  vec2 g = mat2(.7071, -.7071, .7071, .7071) * gl_FragCoord.xy / cell;
  float r = sqrt(1. - l) * .68;
  float ink = smoothstep(r + .08, r - .08, length(fract(g) - .5));
  vec3 col = mix(HI, LO, ink);
  float R = max(hover * length(resolution) * .3, 1.);
  col = mix(col, c, smoothstep(R, R * .5, length(gl_FragCoord.xy - mouse)) * smoothstep(0., .05, hover));
  float head = 1. - prog;
  if (uv.y < head) col = mix(HI, vec3(1.), .18);
  col += (1. - smoothstep(0., .012, abs(uv.y - head))) * step(prog, .999) * .55;
  outColor = vec4(col * m, m);
}`;
// Tour arch: lavender-and-ink duotone that slides in as a slit-scan (after VFX-JS's slitScanTransition)
// each time a date is picked; pointing at it brings back the color
const ARCH_FX = FX_HEAD + `
uniform float prog;
uniform float hover;
uniform vec4 rad;
float rbox4(vec2 p, vec2 b, vec4 r) {
  r.xy = p.x > 0. ? r.xy : r.zw;
  r.x = p.y > 0. ? r.x : r.y;
  vec2 q = abs(p) - b + r.x;
  return min(max(q.x, q.y), 0.) + length(max(q, 0.)) - r.x;
}
void main() {
  vec2 uv = (gl_FragCoord.xy - offset) / resolution;
  float m = clamp(.5 - rbox4((uv - .5) * resolution, resolution * .5, rad), 0., 1.);
  if (m <= 0.) discard;
  vec3 c = texture(src, vec2(uv.x, max(uv.y, 1. - prog))).rgb;
  float l = clamp((dot(c, vec3(.299, .587, .114)) - .5) * 1.25 + .55, 0., 1.);
  vec3 col = mix(mix(vec3(.07), vec3(.79, .76, .945), l), c, hover);
  outColor = vec4(col * m, m);
}`;
const ease = x => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const vhsClock = () => { const d = new Date(); return clockText().replace(/ 0/, ' ') + ' ' + MONTHS[d.getMonth()] + '. ' + d.getDate() + ' ' + d.getFullYear(); };

const spectrum = {
    html(d) {
        const P = d.posts, len = Math.max(Array.from(d.name).length, 3), first = P[0];
        const echo = [7, 6, 5, 4, 3, 2, 1, 0].map(i => '<span style="--i:' + i + '"' + (i ? ' aria-hidden="true"' : '') + '>ARCHIVE</span>').join('');
        const thumbs = P.slice(1, 3).map(() => '<button type="button" class="sp-frame" data-thumb><canvas role="img"></canvas><span class="sp-tone"></span><span class="sp-tag" style="left:8px;bottom:8px;background:#F4EFE6;color:#121212"></span></button>').join('');
        const rows = P.map((p, i) => '<button type="button" class="sp-row" data-i="' + i + '" aria-label="Preview ' + esc(p.label) + '"><span class="sp-wd">' + esc(p.md || 'No.' + p.no) + '</span><span class="sp-kr">' + esc(p.label) + '</span><span class="sp-mono">' + esc(p.tag) + '</span><span class="sp-chip">' + (i < 2 ? 'NEW' : 'ON VIEW') + '</span></button>').join('');
        const links = d.links.map(l => '<a ' + linkAttrs(l) + '><i class="' + esc(l.icon) + '" aria-hidden="true"></i>' + esc(l.label) + '</a>').join(' · ');
        const last = d.links[0];
        const word = d.name.toLowerCase();
        return '<svg class="sp-grain" aria-hidden="true"><filter id="sp-grain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#sp-grain)"/></svg>'
            + '<section class="ab-in sp-hero"><h1 class="sp-vert" style="--len:' + len + '">' + esc(d.name) + '</h1>'
            + '<div class="sp-head sp-mono"><span>Label system</span><span>' + esc(d.initials) + '—' + two(d.counts.posts) + '</span><span>' + esc(d.tagline || 'Digital art archive') + '</span><span>アーカイブ</span></div>'
            + '<div class="sp-echo" aria-hidden="true">' + echo + '</div>'
            + '<div class="sp-vhs" aria-hidden="true"><p class="sp-rain" style="--len:' + len + '">' + esc(d.name) + '</p><p><span>PLAY</span><span data-clock></span></p></div>'
            + '<div class="sp-data' + (d.open ? '' : ' is-closed') + '"><p class="sp-sub sp-kr">' + esc(d.tagline ? d.tagline : 'digital art by ' + word) + '</p>'
            + '<div class="sp-stamp"><span class="sp-wd">' + esc(d.updated || '00—00') + '</span><span class="sp-mono">' + esc(d.initials) + esc(d.updatedYear) + '<br>LAST UPDATE</span></div>'
            + '<div class="sp-cells"><div class="sp-cell"><b class="sp-wd">' + d.counts.posts + '</b><span class="sp-mono">PIECES</span></div><div class="sp-cell"><b class="sp-wd">' + d.counts.comics + '</b><span class="sp-mono">COMICS</span></div><div class="sp-cell"><b class="sp-wd">' + d.counts.boards + '</b><span class="sp-mono">BOARDS</span></div></div>'
            + '<a class="sp-comm" href="#/commissions"><span class="sp-mono" style="font-size:12px;font-weight:600;letter-spacing:.08em">COMMISSIONS</span><i></i><span class="sp-wd" style="display:inline-flex;align-items:center;gap:8px;font-size:18px"><span class="sp-dot"></span>' + (d.open ? 'OPEN' : 'CLOSED') + '</span></a>'
            + '<div class="sp-warn sp-mono"><svg viewBox="0 0 40 36" width="34" height="31" aria-hidden="true"><path d="M20 2 L38 34 H2 Z" fill="#121212"/><path d="M20 12 V24 M20 28 V30" stroke="#FFC93C" stroke-width="4" stroke-linecap="round"/></svg><span>CAUTION: CONTAINS ORIGINAL ART<br>HANDLE WITH CARE · DO NOT REPOST</span></div>'
            + '<div class="ab-prose">' + d.bio + '</div>'
            + '<div class="sp-btns"><a class="sp-btn" href="#/gallery" style="background:#121212;color:#C9C1F1">SEE MY WORK</a><a class="sp-btn" href="#/commissions" style="background:#FF5B1F">COMMISSIONS</a></div></div>'
            + '<div class="sp-stage"><span class="sp-band" aria-hidden="true"></span><span class="sp-sun" aria-hidden="true"></span>'
            + '<svg class="sp-spark" viewBox="-10 -10 20 20" width="72" height="72" aria-hidden="true"><path d="M0 -10 C1 -2 2 -1 10 0 C2 1 1 2 0 10 C-1 2 -2 1 -10 0 C-2 -1 -1 -2 0 -10 Z" fill="#FFFFFF"/></svg>'
            + '<div class="sp-frame sp-main">' + (first ? '<canvas role="img"></canvas><span class="sp-tone"></span><span class="sp-tag" style="left:18px;top:18px;background:#121212;color:#FF5B1F">NOW SHOWING</span><span class="sp-tag" style="right:18px;top:18px;background:#F4EFE6;color:#121212" data-no></span>'
                + '<a class="sp-cap" data-cap><span><b class="sp-kr" data-cap-title></b><small class="sp-mono" data-cap-meta></small></span><span class="sp-mono" style="font-size:11px;font-weight:600;white-space:nowrap">VIEW POST →</span></a>' : '<div class="ab-none">Nothing printed yet</div>') + '</div>'
            + '<div class="sp-thumbs">' + thumbs + '<a class="sp-go sp-mono" href="#/gallery" style="grid-column:-2">' + BARCODE.replace('width="64"', 'width="76"') + '<span>GALLERY →</span></a></div></div></section>'
            + (rows ? '<div class="sp-tourwrap"><section class="ab-in sp-tour"><div><div class="sp-tourhead"><h2 class="sp-kr">THE ARCHIVE<br>TOUR ' + esc(first.year || d.updatedYear) + '</h2><span class="sp-mono">LATEST POSTS<br>TAP A DATE</span></div>' + rows + '<div class="sp-rows-end"></div></div>'
                + '<div class="sp-preview"><div class="sp-frame is-lav sp-arch"><canvas role="img"></canvas><span class="sp-tone"></span></div>'
                + '<div class="sp-prevcap"><span><b class="sp-kr" data-sel-title></b><small class="sp-mono" data-sel-date></small></span><a class="sp-btn" data-sel-link style="flex:none;min-height:44px;padding:0 18px;background:#121212;color:#FF5B1F">VIEW</a></div></div></section></div>' : '')
            + '<section class="ab-in sp-spec"><div><div class="sp-h2row"><h2 class="sp-kr">SPEC SHEET</h2><span class="sp-mono">' + esc(d.initials) + '/' + two(d.counts.posts) + ' · REV ' + esc(d.updatedYear) + '</span></div>'
            + '<div class="sp-srow"><span class="sp-mono">NAME</span><span class="sp-kr" style="font-size:20px">' + esc(d.name) + '</span></div>'
            + (d.tagline ? '<div class="sp-srow"><span class="sp-mono">TYPE</span><span style="font-size:17px;font-weight:600">' + esc(d.tagline) + '</span></div>' : '')
            + '<div class="sp-srow"><span class="sp-mono">ABOUT</span><div class="ab-prose">' + d.bio + '</div></div>'
            + '<div class="sp-srow"><span class="sp-mono">OUTPUT</span><span class="sp-wd" style="font-size:18px">' + d.counts.posts + ' PIECES · ' + d.counts.comics + ' COMICS · ' + d.counts.boards + ' BOARDS</span></div>'
            + '<div class="sp-srow' + (d.open ? '' : ' is-closed') + '"><span class="sp-mono">STATUS</span><a class="sp-wd" href="#/commissions" style="display:inline-flex;align-items:center;gap:10px;font-size:20px"><span class="sp-dot"></span>' + esc(d.status || (d.open ? 'COMMISSIONS OPEN' : 'COMMISSIONS CLOSED')) + '</a></div>'
            + (links ? '<div class="sp-srow"><span class="sp-mono">FIND ME</span><span style="font-size:18px;font-weight:700">' + links + '</span></div>' : '')
            + '</div><div><div class="sp-h2row"><h2 class="sp-kr">STICKERS</h2><span class="sp-mono">PEEL ONE TO GO THERE</span></div><div class="sp-stickers">'
            + '<a class="sp-stk" href="#/gallery" style="--r:-3deg;background:#0E0E12;color:#FFFFFF"><span class="sp-rain sp-kr sp-word" style="font-size:64px;line-height:1;-webkit-mask-image:repeating-linear-gradient(180deg,#000 0 5px,transparent 5px 7px);mask-image:repeating-linear-gradient(180deg,#000 0 5px,transparent 5px 7px)">' + esc(d.initials) + '</span><span>GALLERY</span></a>'
            + '<a class="sp-stk" href="#/comics" style="--r:2deg;background:#F4EFE6;color:#121212"><span class="sp-word" style="font-family:\'DotGothic16\',monospace;font-size:52px;line-height:1">' + two(d.counts.comics) + 'BIT</span><span class="sp-spect" style="width:70%;height:8px;border-radius:4px"></span><span>COMICS</span></a>'
            + '<a class="sp-stk" href="#/commissions" style="--r:1.5deg;background:#1B1F4A;color:#FFFFFF"><span aria-hidden="true" style="position:absolute;right:-30px;top:0;bottom:0;width:120px;background:repeating-linear-gradient(115deg,#FF3B30 0 10px,#FF8A2B 10px 20px,#FFC93C 20px 30px,#4CD964 30px 40px,#3A7BF2 40px 50px);transform:skewX(-12deg)"></span><span class="sp-wd" style="position:relative;font-size:22px;font-style:italic;line-height:1">COMMISSIONS</span><span>' + (d.open ? 'OPEN NOW' : 'CLOSED') + '</span></a>'
            + '<a class="sp-stk" ' + (last ? linkAttrs(last) : 'href="#/gallery"') + ' style="--r:-2deg;background:#0E0E12;color:#FFFFFF"><span class="sp-kr sp-word" style="max-width:100%;overflow:hidden;font-size:' + (word.length > 7 ? 28 : 40) + 'px;line-height:1.1;white-space:nowrap;background:linear-gradient(90deg,#19C3B1,#7A4BE8 45%,#FF4FA0 70%,#FF8A2B);-webkit-background-clip:text;background-clip:text;color:transparent">' + esc(word) + '</span><span>' + esc(last ? last.label.toUpperCase() : 'MORE ART') + '</span></a>'
            + '</div></div></section>'
            + '<div class="sp-end"><div class="ab-in"><p class="sp-kr">END OF<br>TRANSMISSION</p><div class="sp-mono"><span>' + esc(d.initials) + esc(d.updatedYear) + ' · 製品 · LABEL ' + two(d.counts.posts) + '/' + two(d.counts.posts) + '</span>' + BARCODE.replace('width="64" height="22"', 'width="150" height="34"') + '</div></div></div>';
    },
    wire(root, d, fx) {
        const P = d.posts, main = $('.sp-main > canvas', root), arch = $('.sp-arch > canvas', root);
        const thumbs = $$('[data-thumb]', root), clock = $('[data-clock]', root);
        let show = 0, sel = 0, printAt = performance.now(), tourAt = performance.now(), clockTimer = 0;
        const hm = {}, ha = {};
        const set = (sel_, text) => { const n = $(sel_, root); if (n) n.textContent = text; };
        const hoverWord = touch() ? 'TAP' : 'HOVER';
        function drawMain() {
            const p = P[show]; if (!p || !main) return;
            set('[data-no]', 'NO.' + two(p.no));
            set('[data-cap-title]', p.label);
            set('[data-cap-meta]', [p.tag, p.date].filter(Boolean).join(' · ') + ' · ' + hoverWord + ' FOR COLOR');
            const cap = $('[data-cap]', root); cap.setAttribute('href', '#/post/' + p.id); cap.dataset.action = 'open-post'; cap.dataset.id = p.id;
            main.setAttribute('aria-label', p.label);
            main.classList.remove('sp-print'); void main.offsetWidth; main.classList.add('sp-print');
            fx.put(main, p.img, { shader: FRAME_FX, uniforms: {
                hover: () => fx.hover(hm, main.parentElement),
                radius: () => radii(main.parentElement, fx.scale * fx.pr)[0],
                prog: () => Math.min(1, (performance.now() - printAt) / 900),
                cell: () => 6 * fx.scale * fx.pr
            } });
            const others = P.map((x, i) => i).filter(i => i !== show).slice(0, 2);
            thumbs.forEach((t, k) => {
                const i = others[k]; if (i == null) return;
                const h = {};
                t.dataset.i = i;
                t.setAttribute('aria-label', 'Show ' + P[i].label);
                t.lastElementChild.textContent = 'NO.' + two(P[i].no);
                fx.put(t.firstElementChild, P[i].img, { shader: FRAME_FX, uniforms: { hover: () => fx.hover(h, t), radius: () => radii(t, fx.scale * fx.pr)[0], prog: 1, cell: () => 4 * fx.scale * fx.pr } });
            });
        }
        function drawArch() {
            const p = P[sel]; if (!p || !arch) return;
            $$('.sp-row', root).forEach(r => r.classList.toggle('is-on', Number(r.dataset.i) === sel));
            set('[data-sel-title]', p.label);
            set('[data-sel-date]', p.date);
            const a = $('[data-sel-link]', root); a.setAttribute('href', '#/post/' + p.id); a.dataset.action = 'open-post'; a.dataset.id = p.id;
            arch.setAttribute('aria-label', p.label);
            arch.classList.remove('sp-print'); void arch.offsetWidth; arch.classList.add('sp-print');
            fx.put(arch, p.img, { shader: ARCH_FX, uniforms: {
                prog: () => ease((performance.now() - tourAt) / 750),
                hover: () => fx.hover(ha, arch.parentElement),
                rad: () => radii(arch.parentElement, fx.scale * fx.pr)
            } });
        }
        root.addEventListener('click', e => {
            const t = e.target.closest('[data-thumb],.sp-row,.sp-main');
            if (!t || !root.contains(t) || e.target.closest('a')) return;
            if (t.matches('.sp-row')) { sel = Number(t.dataset.i); tourAt = performance.now(); drawArch(); }
            else if (t.matches('[data-thumb]')) { show = Number(t.dataset.i); printAt = performance.now(); drawMain(); }
            else { printAt = performance.now(); main.classList.remove('sp-print'); void main.offsetWidth; main.classList.add('sp-print'); }
        });
        const tick = () => { if (clock) clock.textContent = vhsClock(); };
        return {
            start() { drawMain(); drawArch(); tick(); clockTimer = setInterval(tick, 1000); },
            stop() { clearInterval(clockTimer); }
        };
    }
};

/* ═════════════════════════════════════════════
   SHOW / HIDE
   ═════════════════════════════════════════════ */

const COVERS = { broadcast, mixtape, spectrum };
let cur = null;

// Wider than 1280px, the whole cover scales up like a poster (up to 2x) so it fills the screen
// instead of leaving empty margins. fx.scale is the zoom as the browser actually applied it.
function fit(root, fx) {
    const w = document.documentElement.clientWidth;
    root.style.setProperty('--ab-zoom', w > 1280 ? String(Math.min(w / 1280, 2)) : '1');
    const page = root.firstElementChild;
    fx.scale = page && page.offsetWidth ? page.getBoundingClientRect().width / page.offsetWidth : 1;
}

function show(root, data) {
    hide();
    const style = COVERS[data.style] ? data.style : 'broadcast';
    ensureFonts(style);
    root.className = 'ab ab-' + style + (data.open ? '' : ' is-closed');
    // A fresh page element each time, so the old cover's listeners go with it
    root.innerHTML = '<div class="ab-page">' + COVERS[style].html(data) + '</div>';
    const fx = new Fx();
    fit(root, fx);
    const ctl = COVERS[style].wire(root.firstElementChild, data, fx);
    const onResize = () => { clearTimeout(cur && cur.resizeTimer); if (cur) cur.resizeTimer = setTimeout(() => { fit(root, fx); if (ctl.resize) ctl.resize(); fx.repaint(); }, 200); };
    cur = { root, fx, ctl, onResize, resizeTimer: 0 };
    window.addEventListener('resize', onResize);
    ctl.start();
    // Fonts change the layout a little, so repaint the pictures once they're in
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (cur && cur.fx === fx) { fit(root, fx); if (ctl.resize) ctl.resize(); fx.repaint(); } });
    if (!still()) loadVfx().then(ok => { if (ok && cur && cur.fx === fx && fx.start()) root.classList.add('fx-on'); });
}

function hide() {
    if (!cur) return;
    window.removeEventListener('resize', cur.onResize);
    clearTimeout(cur.resizeTimer);
    cur.ctl.stop();
    cur.fx.stop();
    cur.root.classList.remove('fx-on');
    cur = null;
}

window.NeergAbout = { show, hide, get shown() { return !!cur; } };
})();
