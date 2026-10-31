# CTV News Dark Mode

A [Tampermonkey](https://www.tampermonkey.net/) userscript that gives
[ctvnews.ca](https://www.ctvnews.ca) a full dark theme.

## Install

1. Install the Tampermonkey extension for your browser (Safari, Chrome, Firefox, Edge).
2. Open the Tampermonkey dashboard → **Utilities** → **Import from file** and select
   `ctvnews-dark-mode.user.js` — or drag the file onto a browser tab.

The script matches `https://www.ctvnews.ca/*` and `https://ctvnews.ca/*`, runs at
`document-start` (no white flash), and requires no special permissions (`@grant none`).

## What it covers

- **Homepage** — header, breaking bar, article grid, sidebar, video sections, recipes,
  shopping trends, weather widget, app promos, newsletter, footer
- **Article pages** — headline, byline, body, photos/captions, related stories
- **Video pages** — player area, Top Videos, Latest Videos, channel pages
- **Search overlay** (Queryly) and the **Sections flyout menu**
- **Weather widgets** — including the Bell Media Weather (`bmw-*`) custom elements

## How it works

The site is built on a design-token system (`--global-neutral-*`, `--global-blue-*`, …)
plus a partially wired-in native dark branch via CSS `light-dark()`. Three mechanisms do
the heavy lifting:

1. **Token inversion** — the neutral/blue scales are remapped at `:root` with
   `!important` on every custom property. `!important` matters: at `document-start`
   our stylesheet is first in `<head>`, and the site's own `:root` block would
   otherwise win the cascade.
2. **`light-dark()` re-pinning** — flipping `color-scheme: dark` activates the site's
   dark branch, but some of those variables resolve through the (now inverted) tokens
   to *light* values and paint light boxes (e.g. the video player's offset box-shadow
   behind card titles, the footer links bar, the nav drawer). Those variables are
   re-pinned to dark values, and all list sections are forced to the page background.
3. **Shadow-DOM injection** — the Bell Media Weather widgets (`<bmw-summarised-weather>`
   and friends) render inside shadow roots with their own light palette
   (`--font-color: #000`), which page CSS cannot reach. The script injects a stylesheet
   into each widget's shadow root and watches for late-mounted widgets (sections on
   this site are lazy-rendered while scrolling) via a `MutationObserver` plus retry
   sweeps after custom-element upgrade.

## Files

- `ctvnews-dark-mode.user.js` — the userscript
- `before.png`, `v2.png` — homepage before/after
- `v4-article.png`, `v4-video.png`, `v4-search.png`, `v4-flyout.png` — page types
- `final-*.png` — regression fixes: video sections, footer links bar, weather widget

## Notes

- Sections lazy-render while scrolling; because the theme is plain CSS in `<head>`,
  newly mounted sections are styled as soon as they paint. The BMW watcher handles
  the shadow-DOM widgets the same way.
- The CTV red (`#EB0401`) is kept as the accent color — it reads well on dark.
