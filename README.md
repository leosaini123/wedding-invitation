# Lovepreet & Arohi — Wedding Invitation

A single-page, scroll-driven wedding invitation (plain HTML / CSS / JS + GSAP).
**23 – 25 November 2026 · Kanha Paradise, Jaipur, Rajasthan.**

Open `index.html` in any browser, or view the deployed site on GitHub Pages.

## Structure
- `index.html` — page markup, chapters 00–07
- `styles.css` — styling; mobile fallback first, cinematic desktop layer at the bottom
- `app.js` — countdown, chapter rail, scroll animations. The countdown target is the
  only value worth editing: `CONTENT.countdownTo` at the top of the file.
- `assets/` — event photos, the two portraits, and the background track

## Photos
Every event has two files: `assets/<event>-desktop.webp` (landscape, 1536×1024) and
`assets/<event>-mobile.webp` (portrait). Event slugs: `haldi-carneval`, `jaggo`,
`sangeet`, `gurudwara`, `barat`, `vermala`, `pooja`, `vidai`.

Chapter III (the swipe-through day slider) is mobile-only and uses the `-mobile`
files; Chapter IV (the pinned ceremony reel) is desktop-only and uses the `-desktop`
files. To replace a photo, overwrite the file and update the `width` / `height`
attributes on its `<img>` to the new pixel size.
