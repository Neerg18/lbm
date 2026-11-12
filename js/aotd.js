/*
 NEERG 7.0.25 · aotd.js
 Art of Today: a pop-up with one piece from the archive, once a day per visitor.
 Ten designs from the mockup. Each one is drawn by a function below that returns its HTML; aotd.css lays it
 out as a wide poster on computers and a stacked card on phones, and gives it its own entrance and exit.
 logic.js loads this file and aotd.css on a day the pop-up is due, and with Admin (for its settings and
 previews), so other visits never download them. It shares logic.js's helpers and state.
*/
'use strict';

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
function aotdAllowed(p, s) { return !!firstImage(p) && !isScheduled(p) && !(s.skipNsfw && isNsfw(p)); }
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
        id: post.id, img: esc(firstImage(post)), alt: esc(post.alt || cap ? 'Today\'s artwork: ' + (post.alt || cap) : 'Today\'s artwork'),
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
// logic.js has already checked that the pop-up is switched on and hasn't been shown today
async function showAotd() {
    const s = aotdSettings();
    if (!s.phones && window.matchMedia(AOTD_PHONE).matches) return;
    const post = aotdPick(s);
    if (!post) return;
    const design = aotdDesignFor(s);
    // Fonts and the picture load during the wait, so the entrance plays with everything in place
    await Promise.all([aotdPrepare(design, post), wait(s.delay * 1000)]);
    // Don't cover a post someone came to see from a shared link, or the admin page; it'll wait for their next visit
    if (aotdBlocked()) return;
    openAotd(post, design, s, false);
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

window.addEventListener('resize', aotdRefit);
window.NEERG_AOTD = true;
