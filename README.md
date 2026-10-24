# NEERG 7.0.12
### A fork of [LBM — Leaflet Blog Manager](https://lbm-test.neocities.org) by applesaucy

> Self-hosted digital art archive for Neocities. Post your art, comics and commission info, all managed from your browser. No code editing needed.

Every update has its own version number (7.0.1, 7.0.2 and so on). See what changed in each one in the [changelog](CHANGELOG.md), with links to each version's code on GitHub.

Looking for the old version? [NEERG 5.0](https://github.com/Neerg18/lbm/tree/219467fa6bcdc0d06dc786a3bc935ef99e58cf8f) is still in this repository's history.

---

## What's New Since 5.0

- **Full Light & Dark Palettes:** Edit a separate dark and light palette, with a live preview and a contrast check. 18 ready-made presets for each (Evening Walk, Retro Poster, Aurora Pastel, Terracotta, Palace Spring, Peach Fuzz, Neon Lights, Mysterious Depths, Volcanic Ash, Dragon Tales, Wildflower and more)
- **Color Generator:** Pick one color and a harmony (analogous, complementary, triadic and more) to build a whole palette
- **Profile Ring Editor:** Gradient ring around your profile picture with presets, direction, thickness and glow
- **18+ Age Check:** Optional content warning for first-time visitors, remembered for 30 days
- **NSFW Blur:** Posts tagged NSFW stay blurred until a visitor taps to reveal
- **Reaction Styles:** Thumbs, arrows, or your own custom like/dislike text
- **Better Sorting:** Sort the feed by newest, oldest, most liked, least liked or most discussed
- **Featured Carousel:** Show your newest, most liked or pinned posts on Home, or hide it
- **Paper Home:** Below your banner, Home sits on a paper sheet with bold outlined cards: cream in light mode, night blue with cream outlines in dark mode. Recent work shows as postage stamps, and Featured gets a details card and a commissions card
- **About Covers:** About is drawn like a retro magazine cover, in one of three designs you pick under **Site info → About page**: **Broadcast** (a VHS screen playing your newest art, with TV listings), **Mixtape** (a cassette label, a tape deck and a shelf of tapes) or **Spectrum** (a rainbow label poster with your posts as tour dates). Each one shows your name, tagline, bio, latest work, counts, commission status and links, and its pictures get WebGL effects (VHS wobble, pixel art, halftone print) for visitors who allow motion
- **Recommended Comic:** A ticket at the bottom of Home (side by side on computers, upright on phones) points visitors to a comic, picking up where they left off. It's the newest comic unless you choose one in **Admin → Site info**
- **Art of Today:** Once a day, visitors are greeted by a pop-up with one piece from your archive, in one of ten designs (Botanical, Cinema, Calligraphy, Magazine, Caption strip, Editorial, Award band, Chapter frame, Tabloid, Calendar), each with its own entrance and exit and a phone version. Everyone gets the same piece and design on the same day, and it waits until after the age check. In **Admin → Site info** you choose a different design every day or one design always, which designs are in the rotation and their colors, where the art comes from (any post, one board, or a piece you pick), whether NSFW posts are skipped, the headline and message, how long it waits, the animation, and whether phones get it, with a preview for each design
- **Both Themes Everywhere:** Home, Gallery and Comics all switch with the light/dark button (the About covers keep their own colors)
- **Zine Gallery:** The Gallery is a collage of colored paper cards, one per board with "All media" first, and each board opens into taped-on polaroids
- **Zine Comics:** The Comics page matches the Gallery: a paper card for each comic with its cover stuck on, a reading progress bar, a "Continue" shortcut back to where you left off, and each comic's page list has a header in that comic's color
- **Wide-Screen Layout:** Home, Gallery and Comics fill big monitors edge to edge, with more work per row
- **Commissions Poster:** A zine-style Commissions page with a tier card for each kind of commission (example art, price badge, notes) and a terms box, plus a one-click switch that tapes the whole page off with hazard tape when you're closed
- **One-Click Backup:** Download all four data files from the dashboard
- **Clean Up Tool:** Storage overview plus tools to trim, de-duplicate and compact your data
- **Smaller Images:** PNG and JPG uploads are saved as WebP automatically, and **Clean up → Shrink images** converts the ones already on your site (then lists the old files to delete on Neocities)
- **Faster Posting:** Paste an image straight into the post editor, or bulk upload many images as separate posts
- **Accessibility:** Keyboard navigation, screen reader labels and a skip-to-content link
- **Hold to Delete:** Deleting a post, comic, comment or commission tier (and the big Clean up erases) takes a one-second press and hold, by mouse, finger or the Enter key, so nothing goes by accident. Other questions use the same pop-up with a normal button
- **Button Tooltips:** Icon-only buttons show their name when you hover over them or tab to them. The first one waits a moment, then the next ones appear right away
- **Glass Shine:** Commission tier pictures catch a diagonal glass glare as the mouse moves on and off them (and when you tab to them). Nothing else on the site gets it, and devices that ask for less motion skip it
- **Staggered Phone Menu:** On phones, two color layers in your accent color sweep in, then the menu panel, then each link rises into place with its number. The Menu button rolls to Close and its plus turns into a cross
- **No Flash on Load:** Your saved theme and colors appear instantly for returning visitors

---

## Getting Started

1. Upload `index.html`, `style.css`, `logic.js`, `admin.js`, `marked.min.js`, `about.js`, `about.css`, `vfx.min.js` and the `fonts` folder to your Neocities site
2. Open your site. A **Setup Wizard** appears automatically
3. Enter a password (8+ characters) and your Neocities API key (Neocities → Settings → API). That's it, you're live

No code editing required. Everything is managed from the **Admin** page (the ⚙️ gear icon).

### Upgrading from an earlier NEERG

NEERG 7 stores your content in the same format as 6.0, so just replace `index.html`, `style.css`, `logic.js`, `admin.js`, `marked.min.js`, `about.js`, `about.css`, `vfx.min.js` and the `fonts` folder (and delete `sky.js` and `sky.css` if you have them). Your posts, comics, likes and settings stay where they are.

> Tip: hit **Back up** in the dashboard before upgrading, just in case.

---

## File Structure

```
your-neocities-site/
├── index.html          ← main page
├── style.css           ← all styles
├── logic.js            ← the site's logic
├── admin.js            ← the admin tools (loads only when Admin opens)
├── marked.min.js       ← turns Markdown captions into formatted text
├── about.js, about.css ← the About page covers (load only when About opens)
├── vfx.min.js          ← WebGL picture effects for the About covers
├── fonts/              ← the site's icons (a trimmed Font Awesome)
├── system.js           ← auto-generated on first setup
├── posts.js            ← auto-generated when you post
├── comics.js           ← auto-generated when you add a comic
├── interactions.js     ← auto-generated on first like/comment
└── img/                ← uploaded images stored here
    └── comics/         ← comic pages stored here
```

Only the files above `system.js` live in this repository. The rest are created on your Neocities site by the Admin page.

### Icons

The site carries only the Font Awesome icons it uses (about 9 KB instead of about 300 KB). The list is at the top of `style.css`. To use an icon that isn't on it, add a line such as `.fa-star{--fa:"\f005"}` (the code is on the icon's page at fontawesome.com), then rebuild the files in `fonts/` from the free Font Awesome 6.7.2 download with the icon's code included, for example with fontTools: `pyftsubset fa-solid-900.woff2 --unicodes=U+F005,... --flavor=woff2`.

---

## Customization

All visual customization is done through the **Admin** dashboard. No code editing needed:

| Admin tab | What you can change |
|---|---|
| **New post** | Write captions (Markdown works), add tags, pin posts, upload images/video/audio |
| **Posts** | Find, edit, pin and delete existing posts |
| **Comics** | Create comics, reorder pages by dragging, add new pages later |
| **Commissions** | The open/closed switch, status badge, tiers (example art, price, notes, color), terms, request link, hazard-tape words and poster colors |
| **Site info** | Site name, tagline, profile picture, About page cover design, bio, age check, comments, reactions, featured posts, recommended comic, Art of Today pop-up, search engine description |
| **Colors & style** | Dark and light palettes, presets, color generator, reaction button colors, profile ring |
| **Home banner** | Header images (latest posts or your own picks) and the scrolling text band |
| **Social links** | Links shown on the header, About page, Commissions page and footer |

For deeper edits:
- **Custom CSS** → Admin → Site info → Advanced
- **Page background image** → Admin → Site info → Advanced
- **Nav tab labels** → change the link text in `index.html` (it appears in the top bar, the mobile menu and the footer; search `href="#/`)

---

## Features (inherited from LBM)

- 📝 Post editor with Markdown support
- 🖼️ Multi-image uploads per post
- 🗂️ Image boards auto-generated from post tags
- 📚 Comics / long-form reader
- ❤️ Likes, dislikes, and comments
- 🔍 Search and tag filtering
- 🌙 Dark / light mode toggle
- 📱 Fully responsive, mobile first
- 🔒 Password-protected admin panel
- 🎨 Customizable accent colors and gradients

---

## Credits

- **Original engine:** [LBM by applesaucy](https://lbm-test.neocities.org)
- **This fork:** NEERG 7.0.12 by [Neerg18](https://github.com/Neerg18)
- **Previous version:** [NEERG 5.0](https://github.com/Neerg18/lbm/tree/219467fa6bcdc0d06dc786a3bc935ef99e58cf8f)
- **Icons:** [Font Awesome Free 6.7.2](https://fontawesome.com) (icons CC BY 4.0, fonts SIL OFL 1.1, code MIT), trimmed to the icons this site uses
- **Markdown:** [marked 15.0.12](https://github.com/markedjs/marked) (MIT)
- **About cover picture effects:** [VFX-JS 1.1.0](https://github.com/fand/vfx-js) by AMAGI (MIT; bundled as `vfx.min.js` with its notice at the top). The shaders are written for this site, after VFX-JS's glitch, halftone and slit-scan presets
- **Hold button, tooltip, glass shine and staggered menu ideas:** [React Bits](https://reactbits.dev) by David Haz (written fresh in plain JavaScript for this site)

---

## License

MIT. See [LICENSE](LICENSE).

*NEERG 7 is a community fork. All core functionality belongs to the original LBM project.*
