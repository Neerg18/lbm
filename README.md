# NEERG 7.0
### A fork of [LBM — Leaflet Blog Manager](https://lbm-test.neocities.org) by applesaucy

> Self-hosted digital art archive for Neocities. Post your art, comics and commission info, all managed from your browser. No code editing needed.

Looking for the old version? [NEERG 5.0](https://github.com/Neerg18/lbm/tree/219467fa6bcdc0d06dc786a3bc935ef99e58cf8f) is still in this repository's history.

---

## What's New Since 5.0

- **Full Light & Dark Palettes:** Edit a separate dark and light palette, with a live preview and a contrast check
- **Color Generator:** Pick one color and a harmony (analogous, complementary, triadic and more) to build a whole palette
- **Profile Ring Editor:** Gradient ring around your profile picture with presets, direction, thickness and glow
- **18+ Age Check:** Optional content warning for first-time visitors, remembered for 30 days
- **NSFW Blur:** Posts tagged NSFW stay blurred until a visitor taps to reveal
- **Reaction Styles:** Thumbs, arrows, or your own custom like/dislike text
- **Better Sorting:** Sort the feed by newest, oldest, most liked, least liked or most discussed
- **Featured Carousel:** Show your newest, most liked or pinned posts on Home, or hide it
- **Paper Home & About:** Below your banner, Home and About sit on a paper sheet with bold outlined cards: cream in light mode, night blue with cream outlines in dark mode. Recent work shows as postage stamps, Featured gets a details card and a commissions card, and About adds live counts, your links and your latest work
- **Recommended Comic:** A ticket at the bottom of Home (side by side on computers, upright on phones) points visitors to a comic, picking up where they left off. It's the newest comic unless you choose one in **Admin → Site info**
- **Art of Today:** Once a day, visitors are greeted by a pop-up with one piece from your archive, in one of ten designs (Botanical, Cinema, Calligraphy, Magazine, Caption strip, Editorial, Award band, Chapter frame, Tabloid, Calendar), each with its own entrance and exit and a phone version. Everyone gets the same piece and design on the same day, and it waits until after the age check. In **Admin → Site info** you choose a different design every day or one design always, which designs are in the rotation and their colors, where the art comes from (any post, one board, or a piece you pick), whether NSFW posts are skipped, the headline and message, how long it waits, the animation, and whether phones get it, with a preview for each design
- **Both Themes Everywhere:** Home, About, Gallery and Comics all switch with the light/dark button
- **Zine Gallery:** The Gallery is a collage of colored paper cards, one per board with "All media" first, and each board opens into taped-on polaroids
- **Zine Comics:** The Comics page matches the Gallery: a paper card for each comic with its cover stuck on, a reading progress bar, a "Continue" shortcut back to where you left off, and each comic's page list has a header in that comic's color
- **Wide-Screen Layout:** Home, Gallery and Comics fill big monitors edge to edge, with more work per row
- **Commissions Poster:** A zine-style Commissions page with a tier card for each kind of commission (example art, price badge, notes) and a terms box, plus a one-click switch that tapes the whole page off with hazard tape when you're closed
- **One-Click Backup:** Download all four data files from the dashboard
- **Clean Up Tool:** Storage overview plus tools to trim, de-duplicate and compact your data
- **Smaller Images:** PNG and JPG uploads are saved as WebP automatically, and **Clean up → Shrink images** converts the ones already on your site (then lists the old files to delete on Neocities)
- **Faster Posting:** Paste an image straight into the post editor, or bulk upload many images as separate posts
- **Accessibility:** Keyboard navigation, screen reader labels and a skip-to-content link
- **No Flash on Load:** Your saved theme and colors appear instantly for returning visitors

---

## Getting Started

1. Upload `index.html`, `style.css`, and `logic.js` to your Neocities site
2. Open your site. A **Setup Wizard** appears automatically
3. Enter a password (8+ characters) and your Neocities API key (Neocities → Settings → API). That's it, you're live

No code editing required. Everything is managed from the **Admin** page (the ⚙️ gear icon).

### Upgrading from an earlier NEERG

NEERG 7.0 stores your content in the same format as 6.0, so just replace `index.html`, `style.css` and `logic.js`. Your posts, comics, likes and settings stay where they are.

> Tip: hit **Back up** in the dashboard before upgrading, just in case.

---

## File Structure

```
your-neocities-site/
├── index.html          ← main page
├── style.css           ← all styles
├── logic.js            ← all backend logic
├── system.js           ← auto-generated on first setup
├── posts.js            ← auto-generated when you post
├── comics.js           ← auto-generated when you add a comic
├── interactions.js     ← auto-generated on first like/comment
└── img/                ← uploaded images stored here
    └── comics/         ← comic pages stored here
```

Only the first three files live in this repository. The rest are created on your Neocities site by the Admin page.

---

## Customization

All visual customization is done through the **Admin** dashboard. No code editing needed:

| Admin tab | What you can change |
|---|---|
| **New post** | Write captions (Markdown works), add tags, pin posts, upload images/video/audio |
| **Posts** | Find, edit, pin and delete existing posts |
| **Comics** | Create comics, reorder pages by dragging, add new pages later |
| **Commissions** | The open/closed switch, status badge, tiers (example art, price, notes, color), terms, request link, hazard-tape words and poster colors |
| **Site info** | Site name, tagline, profile picture, bio, age check, comments, reactions, featured posts, recommended comic, Art of Today pop-up, search engine description |
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
- **This fork:** NEERG 7.0 by [Neerg18](https://github.com/Neerg18)
- **Previous version:** [NEERG 5.0](https://github.com/Neerg18/lbm/tree/219467fa6bcdc0d06dc786a3bc935ef99e58cf8f)

---

## License

MIT. See [LICENSE](LICENSE).

*NEERG 7.0 is a community fork. All core functionality belongs to the original LBM project.*
