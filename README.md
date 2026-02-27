# NEERG 5.0
### A fork of [LBM — Leaflet Blog Manager](https://lbm-test.neocities.org) by applesaucy

> Self-hosted digital art archive for Neocities. New look, new features.

---

## What's New in 5.0

- **New Header Design** — Redesigned navigation with a cleaner, more polished look
- **Mobile Improvements** — Better layout and spacing across all mobile screen sizes
- **Popular Posts** — Featured Works now highlights your most popular content instead of newest
- **Improved Image Boards** — New Pinterest-style board layout for a more modern browsing experience
- **General UI Polish** — Various visual tweaks and improvements throughout the site

---

## Getting Started

1. Upload `index.html`, `style.css`, and `logic.js` to your Neocities site
2. Open your site — a **Setup Wizard** will appear automatically
3. Enter a password + your Neocities API key → you're live

No code editing required. Everything is managed from the **Admin Login** tab.

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
```

---

## Customization

All visual customization is done through the **Admin panel** — no code editing needed:

- **Site name / tagline / colors / fonts** → Admin → Site Settings
- **Profile picture** → Admin → Site Settings
- **Social links** → Admin → Social Links
- **Banner text and colors** → Admin → Banner
- **Post tags / board names** → applied when creating posts

For deeper edits:
- Nav tab labels → search `nav-link` in `index.html`
- Tag filter pills → search `tags-bar` in `index.html`
- Page zoom scale → search `style.zoom` in `index.html`

---

## Features (inherited from LBM)

- 📝 Post editor with Markdown support
- 🖼️ Multi-image uploads per post
- 🗂️ Image boards auto-generated from post tags
- 📚 Comics / long-form reader
- ❤️ Likes, dislikes, and comments
- 🔍 Search and tag filtering
- 🌙 Dark / light mode toggle
- 📱 Fully responsive — mobile first
- 🔒 Password-protected admin panel
- 🎨 Customizable accent colors and gradients

---

## Credits

- **Original engine:** [LBM by applesaucy](https://lbm-test.neocities.org)
- **This fork:** NEERG 5.0

---

*NEERG 5.0 is a community fork. All core functionality belongs to the original LBM project.*
