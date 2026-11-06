# NEERG changelog

Every update to the site gets its own version number. The numbers stay under 7.1 and count up from 7.0: **7.0.1, 7.0.2, 7.0.3** and so on.

- **Where the number lives:** `NEERG_VERSION` in `logic.js`. The site's footer shows it, and the `?v=` tags in `index.html` and the header at the top of each file carry the same number.
- **On GitHub:** each version below links to its pull request and to its code, so you can always open the site's files exactly as they were in that version.
- **One-file copy:** after committing a release, run `sh one-file/make.sh` and commit `one-file/index.html`, so one-file sites can get the new version.

---

## 7.0.24 · 2026-11-05
**Reading modes, sketch slider, Characters and Series** · [#28](https://github.com/Neerg18/lbm/pull/28) · [code](https://github.com/Neerg18/lbm/tree/c88d468)
- **Comic reading modes:** the comic reader has **Page**, **Scroll** and **Two pages** buttons at the top. Scroll stacks every page, up to 1100 pixels wide so the words stay readable, and remembers where you stopped. Two pages shows pages side by side like an open book (the cover sits on its own on the right) and turns the page with a flip animation; it needs a wide screen, so phones stay on one page, and visitors who ask for less motion get a plain page change. Each visitor's choice is saved per comic. In **Admin → Comics** you can set the mode a comic opens in, for new comics and in each comic's edit form.
- **Sketch to finished:** New post and the post editor have a **Sketch** field. A post with a sketch shows a slider on its first picture: drag the line, or tap Sketch, Half or Finished. You can choose whether it starts on the sketch, the middle or the finished piece. Tiles and polaroids get a small "Sketch" badge.
- **Characters page:** a new **Admin → Characters** tab. Each character has a name, a one-line description, a bio (Markdown works), a reference picture, three colors (filled in from the reference picture, change any of them), "First drawn" and "Appears in", and the tag that links their art. The Characters page shows a paper card for each, and each character's page shows their profile, who they're often drawn with and every piece with their tag. The menu link stays hidden until you add a character.
- **Series:** a new **Admin → Series** tab. Pick pieces by tapping their pictures, put them in order, and add a title and description. Series show as cards at the top of the Gallery, open into polaroids marked Part 01, 02 and so on, and a post in a series says "Part 2 of 4" with links to the parts around it.
- **Updating by hand:** upload `css/style.css`, `js/logic.js` and `js/admin.js`, then `index.html`. Installing a new `index.html` resets your link preview, and the next time you open Admin it puts it back by itself.
- **Hotfix (Nov 5): series cards keep their picture shape.** A series card on its own stretched across the whole row and squashed its three pictures into wide strips. It's now drawn like the **All media** card: the title on the left and the pictures fanned across the right half (under the title on phones). Two series sit side by side like your other boards; with an odd number, the first one is the wide one. `css/style.css` and `js/logic.js` changed. · [#29](https://github.com/Neerg18/lbm/pull/29) · [#30](https://github.com/Neerg18/lbm/pull/30)
- **Hotfix (Nov 5): the sketch slider opens full size.** Opening a post with a sketch could show the slider as a tiny box in the middle of the screen, until you went to another post and back. It happened when your browser already had the pictures saved: the slider was measured just before the post window opened, while it had no size yet. Now it measures again as soon as the window opens (and whenever the browser window changes size). Only `js/logic.js` changed. · [#31](https://github.com/Neerg18/lbm/pull/31)
- **Hotfix (Nov 6): your colors on every Commissions design.** Each tier's color from Admin › Commissions now shows on **Rounded panels**, **Poster frame** and **Character strips**, not just the original taped poster, with dark or white words on it, whichever reads better. On those three designs the poster's **Ink** is the page background, **Paper** colors the terms box and the **Status color** colors the open dot; the corner tape only shows on the original poster. Also fixed: on Rounded panels the yellow and red tiers' words were white and hard to read, and on the original poster **Let the art pop out of its frame** now only pops out cut-out art with a see-through background, so a picture with a solid background stays in its frame instead of spilling over the tier's name and notes. `css/comm.css`, `js/comm.js`, `js/logic.js` and `js/admin.js` changed. · [#32](https://github.com/Neerg18/lbm/pull/32)

## 7.0.23 · 2026-11-02
**Comic folders box removed** · [#26](https://github.com/Neerg18/lbm/pull/26) · [code](https://github.com/Neerg18/lbm/tree/96718f1)
- **Done with the move:** every comic now lives in its own folder, so the **Comic folders** box and its **Move into folders** button are gone from Admin › Comics. New comics, added pages and swapped pages still go into the comic's own folder automatically.
- **Updating by hand:** upload `index.html`, `css/style.css`, `js/logic.js` and `js/admin.js`. Installing a new `index.html` resets your link preview, so press **Update link preview** in Site info afterwards.
- **Hotfix (Nov 2): the link preview survives updates.** Installing a new `index.html` still resets the link preview, but the next time you open Admin it puts your saved preview back by itself and says so. No more pressing **Update link preview** after every update. It reuses the preview pictures already on your site, so nothing is redrawn. Only `js/admin.js` changed. · [#27](https://github.com/Neerg18/lbm/pull/27)

## 7.0.22 · 2026-11-02
**Comic folders** · [#24](https://github.com/Neerg18/lbm/pull/24) · [code](https://github.com/Neerg18/lbm/tree/5460ac3)
- **Each comic gets its own folder:** a new comic's pages now upload into a folder named after it inside `img/comics/`, like `img/comics/space-cats/` for "Space Cats", with their small copies in `img/comics/space-cats/p/`. Pages you add or swap later go into the same folder, even if you rename the comic.
- **Move your older comics:** Admin › Comics has a new **Comic folders** box. **Move into folders** copies each older comic's pages (and their small copies) into its own folder and switches the comic over. Nothing is lost if it stops partway: the old files stay on Neocities until you delete them, and the box lists them. The list clears itself once they're gone.
- **Updating by hand:** upload `index.html`, `css/style.css`, `js/logic.js` and `js/admin.js`. Installing a new `index.html` resets your link preview, so press **Update link preview** in Site info afterwards.
- **Hotfix (Nov 2):** folder names drop apostrophes, so "Girl's Night" goes in `img/comics/girls-night/` instead of `girl-s-night/`. A comic already in a dashed folder shows up in the **Comic folders** box, and **Move into folders** moves it to the new name. The box also never moves a page that sits in another comic's folder (like a cover borrowed from it), and switches only each comic's own pages, never another comic's, a post's or your settings. Only `js/admin.js` changed. · [#25](https://github.com/Neerg18/lbm/pull/25)

## 7.0.21 · 2026-11-01
**Code files in folders** · [#22](https://github.com/Neerg18/lbm/pull/22) · [code](https://github.com/Neerg18/lbm/tree/a6856f6)
- **Tidier Neocities files:** the style files are now in a `css` folder and the code files in a `js` folder. Your main folder keeps `index.html`, your data files (`system.js`, `posts.js`, `comics.js`, `interactions.js`), `feed.xml` and the `fonts` and `img` folders. Your data files didn't move.
- **Updating by hand:** upload the new `css` and `js` folders first, then `index.html`, then delete the old code files from your main folder (see the README). Installing a new `index.html` resets your link preview, so press **Update link preview** in Site info afterwards.
- **Hotfix (Nov 2):** on phones and tablets, the **Rounded panels** Commissions design no longer stacks words on top of each other. "Pick a tier" and the "From" price circle sit side by side, tier names stay in one piece (no more "CO / LOR"), the spots labels stay on one line, and the third tier's price and note sit on the red instead of over its picture. Computers look the same. Only `css/comm.css` changed. · [#23](https://github.com/Neerg18/lbm/pull/23)

## 7.0.20 · 2026-10-31
**Pick a design for your Commissions page, with a page for each tier, add-ons, terms and spots** · [#20](https://github.com/Neerg18/lbm/pull/20) · [code](https://github.com/Neerg18/lbm/tree/0d86b22)
- **Page design:** in **Commissions → Page design**, choose your original taped poster or one of three new designs: **Rounded panels**, **Poster frame** or **Character strips**. Your page stays the same until you pick one and press Save. The new designs only load when picked, so the original stays as quick as before.
- **A page for each tier:** in the new designs the main page shows only your tiers. Picking one opens its own page with what's included, your add-ons with − and + buttons and a running total, your terms of service, and the request button.
- **Spots:** give each tier a number of **Spots** and how many are **Filled**. Visitors see "2 of 3 spots left", and when every spot is filled the tier says "Full right now" and its request button turns off.
- **Add-ons:** list extras like an extra character with their price. A tier's page adds them to the total.
- **Terms of service in sections:** write your terms as sections, like Ordering or Payment, that open and close on the page, plus **Will draw** and **Won't draw** lists (Won't draw shows in red). The original poster shows them too. You can ask buyers to tick "I've read the terms" before the request button works.
- **Two new files:** if you upload every file yourself, add `comm.js` and `comm.css`.
- **Hotfix (Nov 1):** after a save worked, Admin showed "Settings synced" and then, wrongly, "Couldn't sync system.js" (or comics.js). Your saves were going through, and now only the "synced" message shows. A save that really fails still shows the error. Only `logic.js` changed. · [#21](https://github.com/Neerg18/lbm/pull/21)

## 7.0.19 · 2026-10-31
**Backup reminder and tidier terms** · [#20](https://github.com/Neerg18/lbm/pull/20) · [code](https://github.com/Neerg18/lbm/tree/0d86b22)
- **Backup reminder:** your posts, comics, likes and settings live only in a few files on Neocities, so Admin now reminds you to press **Back up** when your last backup from that computer or phone is two weeks old, or you haven't made one there yet. **Back up now** saves everything in one click, and **Remind me in a week** puts it off.
- **Commissions terms:** a short terms box (a line or two) now reads as one column, instead of splitting a sentence across two columns. Longer terms still use two columns on wide screens.

## 7.0.18 · 2026-10-31
**Scheduled posts, steady boards, picture descriptions, an RSS feed and more** · [#20](https://github.com/Neerg18/lbm/pull/20) · [code](https://github.com/Neerg18/lbm/tree/0d86b22)
- **Schedule posts:** in New post, tick **Schedule it to go up later** and pick a date and time. Until then only you can see the post (in **Posts**, marked "Goes up …"). Visitors don't see it anywhere, even with a direct link, and it appears on its own at that time, as your newest piece. To change the time or put it up now, use Edit. The post sits in your site's data file until then, so someone digging through that file could find it early.
- **Boards don't jump:** Admin remembers each picture's shape when you upload it, so boards keep the right space for every picture while it loads. For pictures you posted before, press **Clean up → Make small previews** again; it saves their shapes too (quickly, from the small copies).
- **Picture descriptions:** New post and Edit have an optional description box. People who use screen readers hear it instead of the caption.
- **RSS feed:** your site keeps a `feed.xml` with your 20 newest posts, updated when you save a post, so people can follow you in a feed reader. Your footer links to it. You can turn it off in **Site info → Search and sharing**.
- **Clearer tab titles:** the browser tab shows where you are, like "Gallery · NEERG", a board's name, or the piece you're looking at.
- **Theme for first-time visitors:** in **Site info → Visitors**, choose dark, light, or match their phone or computer. Visitors can still switch with the sun/moon button, and their choice sticks.

## 7.0.17 · 2026-10-30
**Faster pictures, big boards in batches, and link previews** · [#19](https://github.com/Neerg18/lbm/pull/19) · [code](https://github.com/Neerg18/lbm/tree/2618be4)
- **Small previews:** every picture you upload now also gets a small copy, about a quarter of the size. Cards, Recent works, boards, sliders, comic covers and profile pictures show the small copy, so pages load much faster. Opening a piece still shows the full picture. For pictures you posted before, press **Clean up → Make small previews** once. If a small copy is ever missing, the full picture shows instead.
- **Boards in batches:** big boards show 48 pictures at a time, with a **Show more** button for the rest. The pictures already on screen stay where they are.
- **Link previews and tab icon:** in **Site info → Search and sharing**, choose the picture that shows when someone shares a link to your site (Discord, Bluesky, X, text messages) and the little icon in the browser tab. A mock-up shows how both will look. **Update link preview** puts them on your site. If your site doesn't let Admin change `index.html`, it gives you the finished file to upload in your Neocities dashboard. Installing a NEERG update resets the link preview, and the dashboard reminds you to put it back.

## 7.0.16 · 2026-10-25
**Smoother hovering and a lighter home page** · [#18](https://github.com/Neerg18/lbm/pull/18) · [code](https://github.com/Neerg18/lbm/tree/9aabc06)
- Pointing at Gallery boards, Comics and the pictures inside a board no longer makes the page stutter. The cards and pictures still lift, tilt and cast a shadow the same way, but the computer now moves them in one piece instead of redrawing them for every frame. In tests that cut the drawing work by about 8 times on Gallery boards and by over 100 times inside a board.
- The moving grid lines and the scanning light in the home page's featured frame work the same way now. The home page uses about a tenth of the drawing work it did while you're just looking at it.
- Nothing looks different.

## 7.0.15 · 2026-10-25
**Make a site by uploading one file** · [#17](https://github.com/Neerg18/lbm/pull/17) · [code](https://github.com/Neerg18/lbm/tree/ba08794)
- Anyone making their own NEERG site can now upload just one file, `one-file/index.html`, instead of 8 files and a folder. The rest of the code loads from this GitHub through jsDelivr, a free service that serves code to websites. Their posts, comics, pictures and settings still live on their own site.
- To update a one-file site, upload the newest `one-file/index.html` over the old one. Until then it stays on the version it has.
- Sites that upload every file, like this one, work exactly as before.

## 7.0.14 · 2026-10-25
**New home page** · [#16](https://github.com/Neerg18/lbm/pull/16) · [code](https://github.com/Neerg18/lbm/tree/9e6ddb9)
- **Featured frame:** the top of the home page is now a dark animated screen that shows one featured piece at a time. The title scrolls along the edges, the picture floats, and a crosshair spins over it. It moves to the next piece every 7 seconds, with a timer bar and up/down arrows to flip through by hand.
- **Side sliders:** tall picture strips run beside Recent works, from the top of the list down to the comics bar. They show one picture at a time and then slide to the next. Laptops show only the right strip. Phones show one sideways strip under the comics bar.
- **Customize the sliders in Admin:** under Home page → Side sliders you choose where they show (both sides, left, right or off), what they show (random art, newest art, pieces you pick, comics, your own pictures with links, or a mix of art, comics and a Commissions ad), how many seconds each picture stays, and which way they slide. A live preview shows the result.
- **Comics bar:** the comic you're reading (or the newest one) and the Commissions link now sit together in one bar under Recent works.
- Recent works cards show their number, tag and date, and the old paper-style home pieces were removed.
- Your header banner, profile picture and nav bar stay as they were.

## 7.0.13 · 2026-10-24
**Long titles shrink to fit** · [#15](https://github.com/Neerg18/lbm/pull/15) · [code](https://github.com/Neerg18/lbm/tree/043592c)
- Long board and comic names like "Animation" or "Commissions" get smaller until each word fits on one line, instead of breaking in the middle ("Animati / on"). Short names keep their full size. This works on every screen size, and again when the window is resized.

## 7.0.12 · 2026-10-24
**No shine on Gallery boards and comics** · [#14](https://github.com/Neerg18/lbm/pull/14) · [code](https://github.com/Neerg18/lbm/tree/7d5590b)
- The glass shine no longer sweeps over Gallery boards and comic cards when you point at them. Commission tier pictures still have it.

## 7.0.11 · 2026-10-24
**Comic pages fan out on computers like on phones** · [#13](https://github.com/Neerg18/lbm/pull/13) · [code](https://github.com/Neerg18/lbm/tree/6528654)
- On computers, the page previews on the top Comics card now bunch up in an overlapping fan at the card's right end, the way they look on phones, instead of spreading across the card.

## 7.0.10 · 2026-10-24
**Random board previews, upright comic pages** · [#12](https://github.com/Neerg18/lbm/pull/12) · [code](https://github.com/Neerg18/lbm/tree/f9cb831)
- Each Gallery board's preview shows three pictures picked at random from that board instead of the newest ones. You get a new mix on every visit, and boards skip pictures another board already shows, so boards that share posts still look different.
- The top card on the Comics page shows its page previews standing upright like pages, instead of in wide frames.

## 7.0.9 · 2026-10-15
**About covers fill wide screens** · [#9](https://github.com/Neerg18/lbm/pull/9), [#10](https://github.com/Neerg18/lbm/pull/10) · [code](https://github.com/Neerg18/lbm/tree/d0b1f94)
- On screens wider than a laptop, the About cover grows like a poster, up to twice its size, instead of leaving empty space on both sides. The picture effects stay lined up.
- Every update now has a version number, shown in the code, in the footer and in this changelog.

## 7.0.8 · 2026-10-15
**Browsers pick up updates** · [#8](https://github.com/Neerg18/lbm/pull/8) · [code](https://github.com/Neerg18/lbm/tree/c654d82)
- `style.css` and `logic.js` are linked with a `?v=` tag, so visitors get the new files right after an update instead of an old saved copy.

## 7.0.7 · 2026-10-15
**About covers you pick in Admin** · [#7](https://github.com/Neerg18/lbm/pull/7) · [code](https://github.com/Neerg18/lbm/tree/af84e58)
- About is drawn as a magazine cover in one of three designs, picked under **Admin › Site info › About page**:
  - **Broadcast:** a VHS screen and TV listings
  - **Mixtape:** a cassette label, a tape deck and a shelf of tapes
  - **Spectrum:** a rainbow label poster with your posts as tour dates
- The pictures get WebGL effects from VFX-JS: VHS wobble, pixel art, halftone print and a slit-scan entrance.
- The sky scene (sun, moon, sea and train) is gone.
- The admin tools load only when Admin opens, so visitors download about 70 KB less on every page.

## 7.0.6 · 2026-10-14
**Gallery and Comics follow the theme** · [#6](https://github.com/Neerg18/lbm/pull/6) · [code](https://github.com/Neerg18/lbm/tree/5015c6c)
- The Gallery and Comics pages take their colors from your palette in light and dark mode. The rainbow "Gallery" title square keeps its own colors.

## 7.0.5 · 2026-10-14
**11 more color presets** · [#5](https://github.com/Neerg18/lbm/pull/5) · [code](https://github.com/Neerg18/lbm/tree/4f34904)
- 11 new ready-made palettes for dark and light mode in **Admin › Colors & style**, for 18 in each mode.

## 7.0.4 · 2026-10-13
**About sky** · [#4](https://github.com/Neerg18/lbm/pull/4) · [code](https://github.com/Neerg18/lbm/tree/59a2ec1)
- About opened on a live cartoon sky over the sea. It was replaced by the covers in 7.0.7.

## 7.0.3 · 2026-10-13
**Speed and safety pass** · [#3](https://github.com/Neerg18/lbm/pull/3) · [code](https://github.com/Neerg18/lbm/tree/e690cf5)
- The icons and the Markdown reader load from the site itself, and the gallery loads pictures only as they come near the screen.
- Saving pauses if one of your data files didn't load, so a hiccup can never overwrite your posts, comics or settings.

## 7.0.2 · 2026-10-10
**Glass shine and phone menu** · [#2](https://github.com/Neerg18/lbm/pull/2) · [code](https://github.com/Neerg18/lbm/tree/30681ab)
- A glass glare passes over gallery boards, comics and commission tiers.
- The phone menu slides in with staggered links.

## 7.0.1 · 2026-10-10
**Hold-to-delete and tooltips** · [#1](https://github.com/Neerg18/lbm/pull/1) · [code](https://github.com/Neerg18/lbm/tree/0328026)
- Deleting in Admin asks you to hold the button.
- Icon buttons show a small label when you point at them.

## 7.0 · 2026-10-10
[code](https://github.com/Neerg18/lbm/tree/91cb4dc) · The starting point for these numbers: NEERG 7 with the Art of Today pop-up, the zine Gallery and Comics, the Commissions poster page and WebP uploads.
