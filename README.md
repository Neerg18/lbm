# NWWEG LBM Template V4.1

A customized frontend skin built on top of [LBM (Leaflet Blog Manager)](https://lbm-test.neocities.org) by applesaucyy. Adds modern UI features like pill navigation, a scrolling marquee, featured cards carousel, gallery viewer, theme toggle, and more — all in vanilla HTML/CSS/JS with no frameworks required.

Designed for hosting on [Neocities](https://neocities.org).

---

## Quick Start

1. **Fork or download** this repo
2. **Upload all files** to your Neocities site
3. **Visit your site** — the LBM setup wizard will guide you through initial configuration (admin password, API key, branding)
4. That's it. Start posting.

### Important Notes

- **Run setup from your live site**, not from a local `file://` path. The LBM bridge requires HTTPS to authenticate with the Neocities API.
- **`system.js`** is auto-generated during setup. It stores your posts, settings, and encrypted auth token. Don't edit it by hand.
- **`interactions.js`** is auto-generated on first visitor interaction (like, dislike, or comment). A starter file is included to avoid a 404 on first load.

---

## File Structure

```
├── index.html           # Main application (HTML + JS engine)
├── style.css            # All styling (dark/light mode, responsive)
├── interactions.js      # Auto-generated — stores likes, dislikes, comments
├── system.js            # Auto-generated on setup — stores posts & config
├── img/                 # Your uploaded images go here
└── README.md
```

### About `interactions.js`

This file is **created and updated automatically** by the LBM system whenever a visitor likes, dislikes, or comments on a post. You don't need to create or edit it — the included starter file just prevents a console error on first load. Once your site is live and someone interacts with it, the system will overwrite it with real data.

### About `system.js`

This file is **created during the setup wizard** and updated every time you create a post or change settings. It contains all your posts, site configuration, and an encrypted auth token for syncing to Neocities. **Never share this file publicly** — it contains your encrypted API credentials.

---

## Features

### UI Components
- **Pill Navigation** — Horizontal nav bar with active state indicators
- **Scroll Velocity Marquee** — Scrolling text banner that speeds up as you scroll the page
- **Featured Cards Carousel** — Swipeable card section with dot indicators for showcasing posts
- **Gallery Viewer** — Grid layout with arrow-key navigation and fullscreen media viewer
- **Staggered Mobile Menu** — Animated slide-in menu for mobile screens
- **Theme Toggle** — Dark/light mode switch with accessible color overrides
- **Tag Filtering** — Click tags to filter posts; tag cloud in the sidebar

### Admin Features
- **Single & Bulk Upload** — Upload one image or batch-upload many, each as its own post. Files upload directly to your `img/` folder on Neocities (not embedded as base64), keeping `system.js` lean.
- **Media URL Support** — Paste paths like `img/filename.png` or external URLs
- **Post Management** — Edit, pin, delete posts from the admin panel
- **Markdown Support** — Posts support `**bold**`, `*italic*`, `[links](url)`, and HTML
- **Reactions & Comments** — Configurable like/dislike buttons with threaded comments
- **Force Sync** — Manual sync button for pushing changes immediately
- **Clean Tool** — Strips any legacy base64-embedded images from `system.js` to reduce file size
- **Backup Downloads** — Download `system.js` or a static HTML snapshot anytime

### Customization (via Admin Panel)
- Site name, tagline, copyright
- Profile picture and header banner
- Full color theme (background, text, accent, borders, nav, reaction buttons)
- Marquee banner text (one item per line)
- Social links (displayed in sidebar/footer)
- About section with bio text
- Toggle reactions, comments, and reaction icon styles
- Custom CSS injection

---

## Customizing the Template

### Branding

After running the setup wizard, all branding is controlled from **Site Settings** in the admin panel. You can change:

- Site name, tagline, and copyright
- Profile picture and banner image URLs
- All theme colors
- Marquee text and social links

### Adding Your Own Tags

Tag buttons in the "New Post" form are defined in the HTML. Search for `tag-toggle` buttons and edit the `data-tag` values:

```html
<button type="button" class="tag-toggle" data-tag="YourTag" ...>YourTag</button>
```

### localStorage Keys

If you're running multiple LBM sites from the same domain, the template uses `LBMC_` prefixed localStorage keys to avoid conflicts. You can change this prefix in the JS if needed.

---

## How Media Upload Works

When you upload an image through the admin panel:

1. The actual image file is sent to Neocities via the LBM bridge and saved to your `img/` folder
2. Only the **file path** (e.g., `img/myart.png`) is stored in `system.js`
3. This keeps `system.js` small — even with hundreds of posts

If you have old posts with embedded base64 images (from a previous version), use the **CLEAN** button in the admin toolbar to strip them out. After cleaning, re-upload those images to your `img/` folder and update the posts to use `img/filename.png` paths.

---

## Credits

- **LBM Engine** by [applesaucyy](https://lbm-test.neocities.org) — the core blog system (setup wizard, bridge sync, post management, encryption)
- **Custom UI Layer** — pill nav, marquee, featured cards, gallery, theme toggle, tag filtering, bulk upload, cleanup tools
- Hosted on [Neocities](https://neocities.org)
- Icons by [Font Awesome](https://fontawesome.com) (free tier)
- Fonts: Space Grotesk, Bebas Neue, JetBrains Mono via Google Fonts

---

## License

MIT — the LBM engine and this custom template are both MIT licensed. Fork it, skin it, make it yours.
