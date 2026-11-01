/*
 NEERG 7.0.20 · comm.js
 The Commissions page in one of the designs picked in Admin › Commissions › Page design:
   event   rounded panels: one frame cut into panels, with a white star where they meet
   signal  poster frame: a rounded poster over a yellow strip of tiers
   strips  character strips: slanted full-height posters, one per tier
 (The original taped poster is drawn by logic.js.) logic.js loads this file and comm.css the first time
 Commissions opens with one of these designs, then calls NeergComm.show(root, data) each time the page is
 shown and NeergComm.hide() when it isn't.
 The main page shows only the tiers. Picking one opens that tier's page with its add-ons, terms of service
 and the request button.
*/
(function () {
'use strict';

const FONTS = 'family=Anton&family=Archivo+Black&family=Archivo:ital,wght@0,500;0,600;0,700;0,800;0,900;1,800;1,900';
const STRIP_COLORS = ['#F08A24', '#8A5CF0', '#3DBE6C', '#25A9C9', '#E85AA8', '#E2483D'];
const CARD_COLORS = ['#2E5BD6', '#F3D23C', '#D8453A', '#2F9C8F', '#7E5BE0', '#E69A2E'];

const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const two = n => String(n).padStart(2, '0');
const still = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const money = (cur, n) => cur + (Math.round(n * 100) % 100 ? n.toFixed(2) : String(Math.round(n)));

function ensureFonts() {
    if (document.getElementById('cx-fonts')) return;
    const l = document.createElement('link');
    l.rel = 'stylesheet'; l.id = 'cx-fonts';
    l.href = 'https://fonts.googleapis.com/css2?' + FONTS + '&display=swap';
    document.head.appendChild(l);
}

/* ─── Shared pieces ─── */

// The art-tool stickers (pencil, palette, brush) and the white star, drawn once per page
const DEFS = '<svg width="0" height="0" class="cx-defs" aria-hidden="true"><defs>'
    + '<path id="cx-ring" d="M50,50 m-36,0 a36,36 0 1,1 72,0 a36,36 0 1,1 -72,0"/>'
    + '<g id="cx-palette" stroke="#111" stroke-width="2.5" stroke-linejoin="round"><path d="M50 6C80 6 98 28 94 52 91 68 76 64 68 70 60 76 70 90 54 94 26 100 4 78 4 50 4 24 24 6 50 6Z" fill="#F1E6D2"/><ellipse cx="60" cy="76" rx="8" ry="7" fill="#D8453A"/><circle cx="26" cy="40" r="8" fill="#D8453A"/><circle cx="44" cy="22" r="8" fill="#2E5BD6"/><circle cx="70" cy="26" r="8" fill="#2F9C8F"/><circle cx="24" cy="64" r="8" fill="#7E5BE0"/><circle cx="52" cy="46" r="2.6" fill="#111" stroke="none"/><circle cx="66" cy="46" r="2.6" fill="#111" stroke="none"/><path d="M50 54Q58 61 68 54" fill="none"/></g>'
    + '<g id="cx-pencil" stroke="#111" stroke-width="2.5" stroke-linejoin="round"><rect x="0" y="38" width="14" height="24" rx="4" fill="#F6A6C8"/><rect x="14" y="38" width="10" height="24" fill="#BDBDBD"/><rect x="24" y="38" width="56" height="24" fill="#E69A2E"/><polygon points="80,38 100,50 80,62" fill="#F1E6D2"/><polygon points="93,46 100,50 93,54" fill="#111"/><circle cx="44" cy="47" r="2.4" fill="#111" stroke="none"/><circle cx="58" cy="47" r="2.4" fill="#111" stroke="none"/><path d="M45 53Q51 58 57 53" fill="none"/></g>'
    + '<g id="cx-brush" stroke="#111" stroke-width="2.5" stroke-linejoin="round"><rect x="0" y="44" width="60" height="12" rx="6" fill="#2E5BD6"/><rect x="58" y="41" width="14" height="18" fill="#BDBDBD"/><path d="M72 41C86 38 98 45 100 50 98 55 86 62 72 59Z" fill="#7E5BE0"/></g>'
    + '</defs></svg>';
const STAR = '<path d="M50 0C54 36 64 46 100 50 64 54 54 64 50 100 46 64 36 54 0 50 36 46 46 36 50 0z" fill="currentColor"/>';
const sticker = (id, extra) => '<svg viewBox="0 0 100 100" aria-hidden="true"' + (extra || '') + '><use href="#cx-' + id + '"/></svg>';
const TOOLS = ['pencil', 'palette', 'brush'];

// Big panels use the full picture; small ones its small preview copy
function art(t, cls, big) {
    const src = big ? t.full || t.img : t.img;
    return src
        ? '<img class="' + cls + '" src="' + esc(src) + '" alt="" loading="lazy" decoding="async">'
        : '<span class="' + cls + ' cx-noart" aria-hidden="true"><span>' + esc(t.name.charAt(0).toUpperCase() || '?') + '</span></span>';
}
function spotPill(t, cls) {
    if (!t.spots) return '';
    return '<span class="' + cls + (t.spots.full ? ' is-full' : '') + '">' + esc(t.spots.text) + '</span>';
}

// The add-on steppers, the summary and the total for the tier on screen
function addonsHTML(d, st, cls) {
    if (!d.addons.length) return '<p class="' + cls + '-none">' + esc('One character is included. No add-ons right now.') + '</p>';
    return d.addons.map((a, i) => {
        const n = st.counts[i] || 0;
        return '<div class="' + cls + '-row"><span class="' + cls + '-name"><b>' + esc(a.name) + '</b><small>' + (a.amount != null ? '+' + esc(money(d.currency, a.amount)) + ' each' : esc(a.price)) + '</small></span>'
            + '<span class="' + cls + '-step" role="group" aria-label="' + esc(a.name) + '">'
            + '<button type="button" class="cx-step" data-cx="dec" data-a="' + i + '" aria-label="One less ' + esc(a.name.toLowerCase()) + '"' + (n ? '' : ' disabled') + '>−</button>'
            + '<span class="cx-count" aria-live="polite">' + n + '</span>'
            + '<button type="button" class="cx-step" data-cx="inc" data-a="' + i + '" aria-label="One more ' + esc(a.name.toLowerCase()) + '"' + (n >= 9 ? ' disabled' : '') + '>+</button>'
            + '</span></div>';
    }).join('');
}
function totals(d, st) {
    const t = d.tiers[st.sel];
    const parts = [t.name + ' ' + t.price];
    let sum = t.amount;
    d.addons.forEach((a, i) => {
        const n = st.counts[i] || 0;
        if (!n) return;
        parts.push(n + ' × ' + a.name.toLowerCase());
        if (sum != null && a.amount != null) sum += n * a.amount;
    });
    return { summary: parts.join(' + '), total: sum == null ? '' : money(d.currency, sum) };
}

// Terms of service: sections that open and close, then the "I've read" check
function termsHTML(d, st, cls) {
    if (!d.sections.length) return '';
    const secs = d.sections.map((s, i) => {
        const open = st.rule === i;
        return '<div class="' + cls + '-sec"><button type="button" class="' + cls + '-head" data-cx="rule" data-r="' + i + '" aria-expanded="' + open + '"><span><i>' + two(i + 1) + '</i> ' + esc(s.title) + '</span><span aria-hidden="true">' + (open ? '−' : '+') + '</span></button>'
            + (open ? '<ul class="' + cls + '-rules">' + s.rules.map(r => '<li' + (r.wont ? ' class="is-wont"' : '') + '>' + (r.lead ? '<b>' + esc(r.lead) + '</b> ' : '') + r.html + '</li>').join('') + '</ul>' : '')
            + '</div>';
    }).join('');
    const check = d.agree
        ? '<button type="button" class="' + cls + '-agree" role="checkbox" aria-checked="' + st.agreed + '" data-cx="agree"><span class="' + cls + '-box" aria-hidden="true">' + (st.agreed ? '✓' : '') + '</span>I\'ve read and agree to the terms of service</button>'
        : '';
    return '<p class="' + cls + '-title">Terms of service</p><p class="' + cls + '-sub">Please read these before you send a request.</p>' + secs + check;
}

// The request button, or why it can't be pressed yet
function ctaHTML(d, st, cls) {
    const t = d.tiers[st.sel];
    const spot = t.spots ? '<p class="cx-spot' + (t.spots.full ? ' is-full' : '') + '">● ' + esc(t.spots.text) + '</p>' : '';
    if (!d.open) return spot + '<span class="' + cls + ' is-off">' + esc(d.closedNote || 'Closed for now · check back soon') + '</span>';
    if (t.spots && t.spots.full) return spot + '<span class="' + cls + ' is-off">Full right now</span>';
    if (d.agree && d.sections.length && !st.agreed) return spot + '<span class="' + cls + ' is-off" aria-disabled="true">Agree to the terms first</span>';
    if (!d.request.url) return spot + (d.contact ? '<span class="' + cls + ' is-off">' + esc(d.contact) + '</span>' : '');
    return spot + '<a class="' + cls + '" href="' + esc(d.request.url) + '" target="_blank" rel="noopener">' + esc(d.request.text) + ' →</a>';
}
const included = t => t.notes ? '<div class="cx-notes">' + t.notes + '</div>' : '<p>One character is included in the price.</p>';
const questions = d => d.request.url ? 'Questions? <a href="' + esc(d.request.url) + '" target="_blank" rel="noopener">' + esc(d.contact || 'Get in touch') + '</a>' : (d.contact ? 'Questions? ' + esc(d.contact) : '');

/* ─── Design: rounded panels (event) ─── */

function eventMain(d) {
    const t = d.tiers, cheapest = t.map(x => x.amount).filter(x => x != null).sort((a, b) => a - b)[0];
    const half = Math.ceil(d.name.length / 2);
    const big = t[0], yel = t[1], wish = t[2];
    const status = '<span class="cxe-chip"><i class="' + (d.open ? 'is-open' : '') + '"></i>' + esc(d.status) + '</span>';
    const slotBig = big
        ? '<button type="button" class="cxe-card cxe-big cxe-btn" data-cx="open" data-i="0" aria-label="' + esc(big.name + ', ' + big.price + ': see options') + '">' + art(big, 'cxe-fill', true) + '<span class="cxe-shade"></span><span class="cxe-line" aria-hidden="true"></span><span class="cxe-word">' + esc(big.name.toLowerCase()) + '.</span>'
            + '<span class="cxe-bigtext"><small>✤ TIER 01</small><b>' + esc(big.price) + '</b><span>' + esc(big.short) + '</span>' + spotPill(big, 'cxe-pill') + '</span>'
            + '<svg class="cxe-badge" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="48" fill="#fff"/><text font-size="11" letter-spacing="1.2"><textPath href="#cx-ring">SEE OPTIONS ✦ SEE OPTIONS ✦</textPath></text><path d="M40 60 60 40M46 40H60V54" fill="none" stroke="#111" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg></button>'
        : '<div class="cxe-card cxe-big cxe-empty"><b>Details coming soon</b><span>Prices and examples will be posted here.</span></div>';
    const slotYel = yel
        ? '<button type="button" class="cxe-card cxe-yel cxe-btn" data-cx="open" data-i="1" aria-label="' + esc(yel.name + ', ' + yel.price + ': see options') + '"><span class="cxe-yeltext"><small>✤ TIER 02</small><b>' + esc(yel.name) + '</b><em>' + esc(yel.price) + '</em><span>' + esc(yel.short) + '</span>' + spotPill(yel, 'cxe-pill') + '</span>'
            + '<span class="cxe-round">' + art(yel, 'cxe-roundimg') + sticker('palette', ' class="cxe-wob cxe-pal"') + '</span></button>'
        : '<div class="cxe-card cxe-yel cxe-yelstatus"><b>' + (d.open ? 'open.' : 'closed.') + '</b><span>' + esc(d.open ? 'taking requests now' : 'back soon') + '</span></div>';
    const slotWish = wish
        ? '<button type="button" class="cxe-card cxe-wish cxe-btn" data-cx="open" data-i="2" aria-label="' + esc(wish.name + ', ' + wish.price + ': see options') + '">' + art(wish, 'cxe-wishimg', true) + '<span class="cxe-wishtext"><span><i>Get your</i> <b>' + esc(wish.name) + '</b></span><em>' + esc(wish.price) + ' <small>· ' + esc(wish.short.toLowerCase()) + '</small></em>' + spotPill(wish, 'cxe-pill') + '</span>'
            + '<svg class="cxe-tools cxe-wob" viewBox="0 0 220 110" aria-hidden="true"><use href="#cx-pencil" transform="translate(0 40) rotate(-14)"/><use href="#cx-brush" transform="translate(100 10) rotate(20)"/></svg></button>'
        : '<div class="cxe-card cxe-wish cxe-wishq"><b>Questions?</b><span>' + questions(d) + '</span></div>';
    const more = t.slice(3).map((x, k) => {
        const i = k + 3;
        return '<button type="button" class="cxe-more cxe-btn" data-cx="open" data-i="' + i + '" style="--c:' + CARD_COLORS[i % CARD_COLORS.length] + '">' + art(x, 'cxe-moreimg') + '<span><small>✤ TIER ' + two(i + 1) + '</small><b>' + esc(x.name) + '</b><em>' + esc(x.price) + '</em>' + spotPill(x, 'cxe-pill') + '</span></button>';
    }).join('');
    return '<h1 class="cx-sr">' + esc(d.title) + '</h1>'
        + '<div class="cxe-bento">'
        + '<div class="cxe-card cxe-sky">' + status + '<p class="cxe-pick"><i>Pick a</i> <b>tier</b></p>' + (cheapest != null ? '<span class="cxe-from" aria-hidden="true"><small>From</small><b>' + esc(money(d.currency, cheapest)) + '</b></span>' : '') + '<span class="cxe-keys" aria-hidden="true"><i></i><i></i><i></i><i></i></span></div>'
        + '<div class="cxe-card cxe-logo"><p>' + esc(d.name.slice(0, half)) + '<br><span>' + esc(d.name.slice(half)) + '</span></p></div>'
        + slotBig + slotYel + slotWish
        + '<svg class="cxe-star" viewBox="0 0 100 100" aria-hidden="true">' + STAR + '</svg>'
        + '</div>'
        + (more ? '<div class="cxe-morerow">' + more + '</div>' : '')
        + '<p class="cxe-help">' + (t.length ? 'Tap a tier to see its add-ons and terms. ' : '') + questions(d) + '</p>';
}
function eventDetail(d, st) {
    const t = d.tiers[st.sel], tot = totals(d, st);
    const half = Math.ceil(d.name.length / 2);
    return '<button type="button" class="cxe-back" data-cx="back">← All tiers</button>'
        + '<div class="cxe-bento is-detail">'
        + '<div class="cxe-card cxe-sky cxe-addons"><p class="cxe-addtitle"><i>Add-ons</i></p>' + addonsHTML(d, st, 'cxe-ad') + '</div>'
        + '<div class="cxe-card cxe-logo"><p>' + esc(d.name.slice(0, half)) + '<br><span>' + esc(d.name.slice(half)) + '</span></p></div>'
        + '<div class="cxe-card cxe-big" style="--c:' + CARD_COLORS[st.sel % CARD_COLORS.length] + '">' + art(t, 'cxe-fill', true) + '<span class="cxe-shade top"></span><span class="cxe-line" aria-hidden="true"></span><h1 class="cxe-word" tabindex="-1">' + esc(t.name.toLowerCase()) + '.</h1>' + (t.short ? '<p class="cxe-chipline">' + esc(t.short) + '</p>' : '') + '</div>'
        + '<div class="cxe-card cxe-yel cxe-price"><small>✤ TIER ' + two(st.sel + 1) + '</small><b>' + esc(t.price) + '</b><span>' + (t.spots ? esc(t.spots.text) : 'one character included') + '</span></div>'
        + '<div class="cxe-card cxe-wish cxe-total"><p class="cxe-gety"><i>Get your</i> <b>total</b></p><div><p class="cxe-sum">' + esc(tot.summary) + '</p>' + (tot.total ? '<p class="cxe-tot">' + esc(tot.total) + '</p>' : '') + ctaHTML(d, st, 'cxe-cta') + '</div></div>'
        + '<svg class="cxe-star" viewBox="0 0 100 100" aria-hidden="true">' + STAR + '</svg>'
        + '</div>'
        + '<div class="cxe-terms"><p class="cxe-tterm">What you get</p>' + included(t) + termsHTML(d, st, 'cxt') + '</div>'
        + '<p class="cxe-help">' + questions(d) + '</p>';
}

/* ─── Design: poster frame (signal) ─── */

function signalFrame(d, st, detail) {
    const t = detail ? d.tiers[st.sel] : (d.tiers.find(x => x.img) || d.tiers[0]);
    return '<section class="cxs-frame" aria-label="' + esc(d.title) + '">'
        + '<span class="cxs-bar" aria-hidden="true"></span>'
        + '<svg class="cxs-orbit" viewBox="0 0 200 300" aria-hidden="true"><g fill="none" stroke="#F3D23C" stroke-width="2"><circle cx="100" cy="72" r="70"/><circle cx="100" cy="150" r="70"/><circle cx="100" cy="228" r="70"/></g><path class="cxs-pulse" d="M100 70C104 132 118 146 180 150 118 154 104 168 100 230 96 168 82 154 20 150 82 146 96 132 100 70z" fill="#fff"/></svg>'
        + '<div class="cxs-arch">' + (t ? art(t, 'cxs-archimg', true) : '') + '</div>'
        + '<div class="cxs-tab" aria-hidden="true"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#F3D23C"/><path d="M50 18 52 44 74 26 56 48 82 50 56 52 74 74 52 56 50 82 48 56 26 74 44 52 18 50 44 48 26 26 48 44z" fill="#111"/></svg><span>' + esc(d.name.slice(0, Math.ceil(d.name.length / 2))) + '<br>' + esc(d.name.slice(Math.ceil(d.name.length / 2))) + '</span></div>'
        + '<svg class="cxs-tools cxe-wob" viewBox="0 0 260 150" aria-hidden="true"><use href="#cx-palette" transform="translate(130 30) scale(1.1)"/><use href="#cx-pencil" transform="translate(0 92) rotate(-18)"/><use href="#cx-brush" transform="translate(30 10) rotate(16) scale(.95)"/></svg>'
        + '<div class="cxs-copy"><span class="cxe-chip"><i class="' + (d.open ? 'is-open' : '') + '"></i>' + esc(d.status) + '</span>'
        + (detail
            ? '<h1 tabindex="-1">' + esc(t.name) + '</h1><p class="cxs-price"><b>' + esc(t.price) + '</b><span>' + esc(t.short) + '</span></p>'
            : '<h1>' + esc(d.title) + '</h1>')
        + '</div></section>';
}
function signalMain(d) {
    const tiers = d.tiers.map((t, i) => '<button type="button" class="cxs-tier" data-cx="open" data-i="' + i + '">' + sticker(TOOLS[i % 3], ' class="cxs-icon"') + '<span><b>' + esc(t.name) + '</b><small>' + esc(t.price) + ' · ' + (t.spots ? '<em class="' + (t.spots.full ? 'is-full' : '') + '">' + esc(t.spots.text) + '</em>' : 'see options →') + '</small></span></button>').join('');
    return signalFrame(d, null, false)
        + '<div class="cxs-strip" style="--n:' + Math.min(Math.max(d.tiers.length, 1), 4) + '">' + (tiers || '<p class="cxs-empty">Details coming soon.</p>')
        + '<svg class="cxs-code" viewBox="0 0 151 38" preserveAspectRatio="none" aria-hidden="true"><path d="M0 0h2v38H0zM4 0h2v38H4zM7 0h1v38H7zM9 0h2v38H9zM12 0h3v38h-3zM17 0h1v38h-1zM19 0h2v38h-2zM24 0h1v38h-1zM27 0h1v38h-1zM31 0h1v38h-1zM35 0h3v38h-3zM41 0h1v38h-1zM47 0h2v38h-2zM54 0h3v38h-3zM59 0h3v38h-3zM67 0h2v38h-2zM70 0h3v38h-3zM78 0h3v38h-3zM83 0h2v38h-2zM93 0h3v38h-3zM99 0h2v38h-2zM106 0h4v38h-4zM115 0h3v38h-3zM121 0h2v38h-2zM129 0h1v38h-1zM136 0h1v38h-1zM143 0h4v38h-4zM148 0h3v38h-3z" fill="#111"/></svg>'
        + '<span class="cxs-smile"><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46" fill="none" stroke="#111" stroke-width="3"/><path d="M50 18 51.5 30 61 23 54 32 66 34 54 35.5 61 45 51.5 38 50 50 48.5 38 39 45 46 35.5 34 34 46 32 39 23 48.5 30z" fill="#111"/><path d="' + (d.open ? 'M30 64Q50 84 70 64' : 'M32 72H68') + '" fill="none" stroke="#111" stroke-width="3" stroke-linecap="round"/></svg><b>' + (d.open ? 'OPEN' : 'CLOSED') + '</b></span></div>'
        + '<p class="cxs-help">' + (d.tiers.length ? 'Tap a tier to see its add-ons and terms. ' : '') + questions(d) + '</p>';
}
function signalDetail(d, st) {
    const tot = totals(d, st);
    return signalFrame(d, st, true)
        + '<div class="cxs-strip is-detail"><button type="button" class="cxs-back" data-cx="back" aria-label="Back to all tiers">←</button>'
        + '<div class="cxs-addons"><small>ADD-ONS</small>' + addonsHTML(d, st, 'cxs-ad') + '</div>'
        + '<div class="cxs-total"><small>' + esc(tot.summary) + '</small>' + (tot.total ? '<b>' + esc(tot.total) + '</b>' : '') + '</div>'
        + '<div class="cxs-ctabox">' + ctaHTML(d, st, 'cxs-cta') + '</div></div>'
        + '<div class="cxe-terms cxs-terms"><p class="cxe-tterm">What you get</p>' + included(d.tiers[st.sel]) + termsHTML(d, st, 'cxt') + '</div>'
        + '<p class="cxs-help">' + questions(d) + '</p>';
}

/* ─── Design: character strips ─── */

function stripsPanel(d, st) {
    const t = d.tiers[st.sel], tot = totals(d, st), c = STRIP_COLORS[st.sel % STRIP_COLORS.length];
    return '<section class="cxh-panel" aria-labelledby="cxh-det" style="--c:' + c + '">'
        + '<button type="button" class="cxh-back" data-cx="back">← All tiers</button>'
        + '<p class="cxh-it cxh-kicker">Tier ' + two(st.sel + 1) + ' of ' + two(d.tiers.length) + '</p>'
        + '<h2 id="cxh-det" class="cxh-name" tabindex="-1"><span>' + esc(t.name) + '</span><span class="cxh-c">' + esc(t.price) + '</span></h2>'
        + '<div class="cxh-sec"><p class="cxh-it">What you get</p>' + included(t) + '</div>'
        + '<div class="cxh-sec"><p class="cxh-it">Options</p>' + addonsHTML(d, st, 'cxh-ad') + '</div>'
        + (d.sections.length ? '<div class="cxh-sec">' + termsHTML(d, st, 'cxt') + '</div>' : '')
        + '<div class="cxh-sec cxh-end"><span class="cxh-sum"><small>' + esc(tot.summary) + '</small>' + (tot.total ? '<b>' + esc(tot.total) + '</b>' : '') + '</span><span>' + ctaHTML(d, st, 'cxh-cta') + '</span></div>'
        + '</section>';
}
function stripsHTML(d, st) {
    const strips = d.tiers.map((t, i) => {
        const top = i % 2 === 0;
        return '<div class="cxh-strip" data-i="' + i + '" style="--c:' + STRIP_COLORS[i % STRIP_COLORS.length] + '">'
            + '<div class="cxh-in" aria-hidden="true">' + art(t, 'cxh-img', true) + '<span class="cxh-shade"></span>'
            + '<div class="cxh-lock' + (top ? ' is-top' : ' is-bottom') + '"><span class="cxh-big cxh-l1">' + esc(t.name) + '</span><span class="cxh-big cxh-l2">' + esc(t.price) + '</span>'
            + '<span class="cxh-it cxh-l3">' + esc(t.short || 'One character') + (t.spots ? ' · ' + esc(t.spots.text) : '') + '</span><span class="cxh-see">See options →</span></div></div>'
            + '<button type="button" class="cxh-hit" data-cx="open" data-i="' + i + '" aria-label="' + esc(t.name + ', ' + t.price + ': see options and terms') + '"></button>'
            + '</div>';
    }).join('');
    return '<div class="cxh-top"><h1 class="cxh-big cxh-title">' + esc(d.title) + '</h1><p class="cxh-it cxh-by">by ' + esc(d.name) + ' · ' + esc(d.status.toLowerCase()) + '</p></div>'
        + '<div class="cxh-stage">' + (strips ? '<div class="cxh-band">' + strips + '</div>' : '<p class="cxh-empty">Details coming soon.</p>') + '<div class="cxh-panelbox"></div></div>'
        + '<p class="cxh-help">' + questions(d) + '</p>';
}
// The strips stay on screen while a tier opens, so its strip can slide to the left
function updateStrips(root, d, st) {
    const stage = root.querySelector('.cxh-stage'); if (!stage) return;
    const detail = st.view === 'detail';
    stage.classList.toggle('is-open', detail);
    root.querySelectorAll('.cxh-strip').forEach(s => {
        const i = Number(s.dataset.i), on = i === st.sel;
        s.classList.toggle('is-on', detail && on);
        s.classList.toggle('is-gone', detail && !on);
        const hit = s.querySelector('.cxh-hit');
        if (hit) { hit.hidden = detail; hit.tabIndex = detail ? -1 : 0; }
    });
    root.querySelector('.cxh-panelbox').innerHTML = detail ? stripsPanel(d, st).replace('class="cxh-panel"', 'class="cxh-panel' + (st.slideIn ? '' : ' is-still') + '"') : '';
    st.slideIn = false;
}

/* ─── Show and hide ─── */

let cur = null;
const DESIGNS = { event: [eventMain, eventDetail], signal: [signalMain, signalDetail] };

function draw(focus) {
    const { root, data: d } = cur;
    const detail = cur.view === 'detail' && d.tiers[cur.sel];
    if (!detail) cur.view = 'main';
    root.className = 'cx cx-' + d.design + (detail ? ' is-detail' : '') + (d.open ? '' : ' is-closed');
    if (d.design === 'strips') {
        if (!root.querySelector('.cxh-stage') || cur.drawn !== cur.key) { root.innerHTML = DEFS + '<div class="cx-wrap">' + stripsHTML(d, cur) + '</div>'; cur.drawn = cur.key; }
        updateStrips(root, d, cur);
    } else {
        const [main, page] = DESIGNS[d.design];
        root.innerHTML = DEFS + '<div class="cx-wrap">' + (detail ? page(d, cur) : main(d)) + '</div>';
    }
    if (focus) {
        const el = focus === 'detail' ? root.querySelector('[tabindex="-1"]') : root.querySelector('[data-cx="open"][data-i="' + cur.sel + '"]');
        if (el) el.focus({ preventScroll: true });
    }
}

function onClick(e) {
    const b = e.target.closest('[data-cx]');
    if (!b || !cur || !cur.root.contains(b)) return;
    const act = b.dataset.cx;
    if (act === 'open') {
        const i = Number(b.dataset.i);
        if (i !== cur.sel) cur.counts = {};
        cur.sel = i; cur.view = 'detail'; cur.slideIn = true;
        draw('detail');
        if (cur.data.design !== 'strips') {
            const top = cur.root.getBoundingClientRect().top + window.scrollY - (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--topbar-h')) || 0);
            window.scrollTo({ top: Math.max(0, top), behavior: still() ? 'auto' : 'smooth' });
        }
    } else if (act === 'back') {
        cur.view = 'main'; draw('main');
    } else if (act === 'inc' || act === 'dec') {
        const a = Number(b.dataset.a), n = cur.counts[a] || 0;
        cur.counts[a] = Math.max(0, Math.min(9, n + (act === 'inc' ? 1 : -1)));
        draw(); refocus(act, a);
    } else if (act === 'rule') {
        const r = Number(b.dataset.r);
        cur.rule = cur.rule === r ? -1 : r;
        draw(); refocus('rule', r);
    } else if (act === 'agree') {
        cur.agreed = !cur.agreed;
        draw(); refocus('agree');
    }
}
// Redrawing replaces the buttons, so put focus back on the one that was pressed
function refocus(act, n) {
    const sel = act === 'agree' ? '[data-cx="agree"]' : act === 'rule' ? '[data-cx="rule"][data-r="' + n + '"]' : '[data-cx="' + act + '"][data-a="' + n + '"]';
    let el = cur.root.querySelector(sel);
    if (el && el.disabled) el = cur.root.querySelector('[data-a="' + n + '"]:not([disabled])');
    if (el) el.focus({ preventScroll: true });
}

function show(root, data) {
    ensureFonts();
    const key = data.design + '|' + JSON.stringify(data.tiers.map(t => [t.name, t.price, t.img, t.short, t.spots && t.spots.text])) + data.title + data.name + data.status + data.open;
    if (cur && cur.root === root && cur.data.design === data.design) {
        cur.data = data; cur.key = key;
        if (cur.sel >= data.tiers.length) { cur.sel = 0; cur.view = 'main'; }
        draw();
        return;
    }
    hide();
    cur = { root, data, key, drawn: '', view: 'main', sel: 0, counts: {}, agreed: false, rule: 0 };
    root.addEventListener('click', onClick);
    draw();
}
function hide() {
    if (!cur) return;
    cur.root.removeEventListener('click', onClick);
    cur.root.innerHTML = '';
    cur.root.className = '';
    cur = null;
}

window.NeergComm = { show, hide, get shown() { return !!cur; } };
})();
