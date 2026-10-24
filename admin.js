/*
 ╔══════════════════════════════════════════════════════════════════╗
 ║  NEERG 7.0.12 · admin.js                                         ║
 ║  The admin tools: new posts, managing posts and comics, site     ║
 ║  info, commissions, colors, the Home banner, links and cleanup.  ║
 ║  logic.js loads this the first time Admin opens, so visitors     ║
 ║  never download it. It shares logic.js's helpers and state.      ║
 ╚══════════════════════════════════════════════════════════════════╝
*/
'use strict';

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
    c.bgImage = val('s-bgimage'); c.customCss = byId('s-css').value;
    c.webpUploads = byId('s-webp').checked;
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
async function removeTier(btn) {
    const rows = $$('#cm-tier-list .tier-row');
    const i = rows.indexOf(btn.closest('.tier-row'));
    const tiers = readTierRows();
    const t = tiers[i]; if (!t) return;
    if ((t.name || t.price || t.image || t.notes) && !await askConfirm('It leaves your page when you save.', { hold: true, title: 'Remove the ' + (t.name || 'untitled') + ' tier?', yes: 'Hold to remove' })) return;
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
    byId('picker-heading').textContent = 'Choose an image';
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
    renderShrink();
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
    postsCache.forEach(p => mediaList(p).forEach(add));
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
        if (p.content) olds.forEach(o => { if (p.content.includes(o)) p.content = p.content.split(o).join(map[o]); });
    });
    comicsCache.forEach(cm => { if (cm.pages) cm.pages = cm.pages.map(sw); if (cm.cover) cm.cover = sw(cm.cover); });
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


window.NEERG_ADMIN = true;
