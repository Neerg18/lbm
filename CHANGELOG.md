# NEERG changelog

Every update to the site gets its own version number. The numbers stay under 7.1 and count up from 7.0: **7.0.1, 7.0.2, 7.0.3** and so on.

- **Where the number lives:** `NEERG_VERSION` in `logic.js`. The site's footer shows it, and the `?v=` tags in `index.html` and the header at the top of each file carry the same number.
- **On GitHub:** each version below links to its pull request and to its code, so you can always open the site's files exactly as they were in that version.
- **One-file copy:** after committing a release, run `sh one-file/make.sh` and commit `one-file/index.html`, so one-file sites can get the new version.

---

## 7.0.16 · 2026-10-25
**Smoother hovering and a lighter home page**
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
