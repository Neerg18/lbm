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
- **Zine Gallery:** The Gallery is a collage of colored paper cards, one per board with "All media" first, and each board opens into taped-on polaroids
- **Wide-Screen Layout:** Home, Gallery and Comics fill big monitors edge to edge, with two or three featured posts side by side and more work per row
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
| **Site info** | Site name, tagline, profile picture, bio, age check, comments, reactions, search engine description |
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
