# RANDY FISH — Author Site

Black & gold author website for Randy Fish, matching the approved design comp.
Static, fast, and fully responsive — no WebGL, no animation framework, no runtime
dependencies (1.9 kB of JavaScript).

## Run it

```bash
npm install
npm run dev      # local dev server
npm run build    # production build → dist/
npm run preview  # serve the production build
```

## Sections

- **Nav** — monogram brand, full menu, EXPLORE BOOKS button; collapses to a burger
  dropdown below 1280px.
- **Hero** — full-bleed space background, glowing Earth, author portrait blended in
  with a soft mask, quote with script signature, social rail, FEATURED IN press row,
  four book covers on a glowing pedestal.
- **About the Author** — writing-desk photography, bio, four feature icons,
  DISCOVER HIS JOURNEY.
- **Stats bar** — 4 books · 50K+ readers · 100+ articles · 10+ years.
- **The Philosophy** — "Beyond The Visible. Beyond The Known." with spiral-galaxy art.
- **The Books** — four titles with covers, blurbs and VIEW BOOK links.
- **Stay Inspired** — newsletter signup with the network-sphere art.
- **Footer** — brand, centered epigraph, policy links, back-to-top.

## Interactions (all lightweight)

- Sticky nav with scroll-spy active state
- Mobile burger menu
- Subtle reveal-on-scroll for cards (IntersectionObserver + CSS,
  disabled under `prefers-reduced-motion`)
- Book covers tilt in 3D perspective and straighten on hover
- Newsletter form confirmation, smooth back-to-top

## Responsive breakpoints

1280px (nav collapses) · 1120px (columns stack, quote reflows) ·
720px (single column, portrait-first hero, swipeable book shelf, 2×2 stats) ·
420px (single-column feature list, full-width buttons)

## Assets

`src/assets/` — art from the provided asset pack (portrait, desk photo, space
backgrounds, network sphere, Earth) plus the four book covers. All bundled and
hashed by Vite.

## Structure

```
index.html      the whole page
src/style.css   design system + responsive rules
src/main.js     menu, scroll-spy, reveals, form (vanilla, ~60 lines)
src/assets/     imagery
```
