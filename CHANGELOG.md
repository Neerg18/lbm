# NEERG changelog

Every update to the site gets its own version number. The numbers stay under 7.1 and count up from 7.0: **7.0.1, 7.0.2, 7.0.3** and so on.

- **Where the number lives:** `NEERG_VERSION` in `logic.js`. The site's footer shows it, and the `?v=` tags in `index.html` and the header at the top of each file carry the same number.
- **On GitHub:** each version below links to its pull request and to its code, so you can always open the site's files exactly as they were in that version.

---

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
