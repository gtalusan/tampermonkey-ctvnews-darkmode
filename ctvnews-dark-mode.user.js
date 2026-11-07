// ==UserScript==
// @name         CTV News & CP24 Dark Mode
// @namespace    https://github.com/gtalusan/tampermonkey-ctvnews-darkmode
// @version      0.2.0
// @description  Dark mode for ctvnews.ca and cp24.com (same Bell Media platform) — rethemes the site's design tokens and fixes hard-coded light surfaces.
// @author       George
// @match        https://www.ctvnews.ca/*
// @match        https://ctvnews.ca/*
// @match        https://www.cp24.com/*
// @match        https://cp24.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
  'use strict';

  const CSS = `
/* ============ Token remap: neutral scale inverted ============ */
/* !important on every custom property: at document-start our sheet is
   first in <head>, and the site's own :root block would otherwise win. */
:root {
  --global-neutral-1: #17191c !important;
  --global-neutral-2: #1c1f23 !important;
  --global-neutral-3: #23272c !important;
  --global-neutral-4: #2b3035 !important;
  --global-neutral-5: #3c4249 !important;
  --global-neutral-6: #565d66 !important;
  --global-neutral-7: #78818b !important;
  --global-neutral-8: #9aa3ac !important;
  --global-neutral-9: #dfe3e7 !important;   /* body text */
  --global-neutral-10: #8ab8f0 !important;  /* links & headings */
  --global-blue-1: #1b2531 !important;
  --global-blue-2: #24344d !important;
  --global-blue-3: #2e4a72 !important;
  --global-blue-4: #3f6ba6 !important;
  --global-blue-5: #5a8fd9 !important;
  --global-blue-6: #7fb0e8 !important;
  --global-blue-7: #a3c8f2 !important;
  --global-blue-8: #c2dbf8 !important;
  --global-blue-9: #dbe9fb !important;
  --global-blue-10: #eef5fd !important;
  --global-red-1: #3a1c1c !important;
  --global-red-2: #5c2626 !important;
  --color-primary: #5a8fd9 !important;
  --global-gradient-2: linear-gradient(175deg, #1c2026 -0.78%, #16181c 89.7%) !important;
  --global-box-shadow-3: 0 var(--global-border-width-2) var(--global-border-width-4) rgba(0, 0, 0, 0.5) !important;

  /* Site's own light-dark() dark-branch vars expect dark surfaces,
     but they resolve through our inverted neutral tokens (now light).
     Re-pin them to dark values. */
  --ct-background-shadow-color: #121417 !important;
  --bt-footer-links-bar__background-color: #14171a !important;
  --b-header-nav-chain-custom-drawer-background-color: #1c1f23 !important;
  --bt-media-icon__background-color: #1a1d21 !important;
}

/* ============ Base ============ */
html {
  background: #121417 !important;
  color-scheme: dark;
}
body {
  background: #121417 !important;
  color: #dfe3e7 !important;
}

/* ============ Header ============ */
nav.b-header-nav-chain-custom {
  background: #1a1d21 !important;
}
.b-header-nav-chain-custom__flyout-nav-wrapper,
.b-header-nav-chain-custom-hamburger__subsection-menu {
  background: #1c1f23 !important;
}
a.skip-main {
  background: #1a1d21 !important;
  color: #8ab8f0 !important;
}

/* ============ Footer (site uses neutral-9 as its bg) ============ */
footer.b-single-column-regular__footer,
div.b-footer-custom {
  background: #14171a !important;
}

/* ============ Section titles / card chips ============ */
div.b-section-title-custom {
  background: #1a1d21 !important;
}
/* All list sections (--dark "Top Videos", --trends "Recipes"/"Shopping
   Trends", --gray, --standard, --picks): keep the page background */
.b-standard-list-custom {
  background: #121417 !important;
}
/* Icon chips on section headers: white icon needs a dark surface */
.c-label-custom__icon-label {
  background: #1b2531 !important;
}
div.b-top-table-list-xl__icon_label,
div.b-top-table-list-large__icon_label {
  background: #262a2f !important;
  color: #dfe3e7 !important;
}

/* ============ Forms ============ */
input[type="email"],
input[type="text"],
input[type="search"] {
  background: #22262b !important;
  color: #dfe3e7 !important;
  border-color: #3c4249 !important;
}
input::placeholder {
  color: #78818b !important;
}

/* ============ Search overlay (Queryly) ============ */
.queryly_overlay {
  background: #121417 !important;
  color: #dfe3e7 !important;
}
.queryly_search_header {
  background: #1a1d21 !important;
}
.queryly_overlay input,
.queryly_search_header input {
  background: #22262b !important;
  color: #dfe3e7 !important;
  border-color: #3c4249 !important;
}
.queryly_item_title,
.queryly_item_description,
.queryly_item_pubdate {
  color: #dfe3e7 !important;
}
.queryly_item_contentcontainer {
  color: #dfe3e7 !important;
}
.queryly_item_imagecontainer {
  background: #2a2f35 !important;
}
.queryly_advanced_search,
.queryly_advanced_search a {
  color: #8ab8f0 !important;
}
.queryly_searchcontainer,
#queryly_searchcontainer {
  background: #121417 !important;
}
#advanced_searchbutton {
  background: #22262b !important;
}

/* ============ Generic safety net ============ */
/* Light text forced onto dark surfaces */
main a, article a, .b-body a {
  color: #8ab8f0 !important;
}
/* Kill leftover light gray text on dark */
p, li, span, h1, h2, h3, h4, h5, h6 {
  color: inherit;
}

/* ============ Polish ============ */
::selection {
  background: #2e4a72;
  color: #eef5fd;
}
`;

  const IS_CP24 = /(^|\.)cp24\.com$/.test(location.hostname);

  /* CP24 brand rules: the CP24 red (#be0a0a) is the site's accent color.
     It reads better slightly brightened on dark surfaces. Scoped per host
     so ctvnews.ca keeps its blue accent exactly as before. */
  const CP24_CSS = `
/* ============ CP24 brand accent (red on dark) ============ */
:root {
  --color-primary: #d42b2b !important;
}
`;

  const style = document.createElement('style');
  style.id = 'ctv-dark-mode-style';
  style.textContent = CSS + (IS_CP24 ? CP24_CSS : '');

  function inject() {
    const target = document.head || document.documentElement;
    if (!document.getElementById('ctv-dark-mode-style')) {
      target.appendChild(style);
    }
  }

  /* =====================================================================
     BMW weather widgets (<bmw-summarised-weather> etc.) render inside
     shadow DOM with their own light palette (--font-color: #000).
     Page CSS can't pierce the shadow boundary, so inject a style into
     each widget's shadow root. Watches for late-mounted widgets and
     async shadow-root attachment.
     ===================================================================== */
  const BMW_SHADOW_CSS = `
[class^="bmw-"] {
  --black: #dfe3e7 !important;
  --font-color: #dfe3e7 !important;
  --grey-color: #9aa3ac !important;
  --title-color: #ff6b6b !important;
  --border-color: rgba(223, 227, 231, 0.25) !important;
  --alert-background: #40340a !important;
  --alert-description-background: #2e2608 !important;
}
.bmw-alert { background-color: #1a1d21 !important; border: 1px solid #3c4249 !important; }
.bmw-alert__message { color: #e6e3d0 !important; }
.bmw-sponsor__message { color: #dfe3e7 !important; }
.bmw-cities-dropdown { background-color: #1c1f23 !important; border-color: #3c4249 !important; }
.bmw-cities-dropdown__list { background-color: #1c1f23 !important; }
.bmw-search__input { background-color: #22262b !important; border-color: #3c4249 !important; }
.bmw-summarised-weather--border { border-color: #2b3035 !important; }
.bmw-weather-alert__title-container:before { border-color: #dfe3e7 !important; color: #dfe3e7 !important; }
.bmw-tabs__list__item__button { background-color: #1c1f23 !important; }
.bmw-tabs__list__item__button--active {
  background-color: #23272c !important;
  border-color: #ff6b6b !important;
  color: #ff6b6b !important;
}
`;

  function fixBmwShadow(el) {
    if (!el.shadowRoot || el.dataset.ctvDark === '1') return false;
    const s = document.createElement('style');
    s.textContent = BMW_SHADOW_CSS;
    el.shadowRoot.appendChild(s);
    el.dataset.ctvDark = '1';
    return true;
  }

  function sweepBmw() {
    const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_ELEMENT, {
      acceptNode: (n) => /^bmw-/i.test(n.nodeName) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
    });
    let node;
    while ((node = walker.nextNode())) fixBmwShadow(node);
  }

  function startBmwWatcher() {
    sweepBmw();
    // shadow roots attach asynchronously after custom-element upgrade
    [500, 1500, 4000].forEach((ms) => setTimeout(sweepBmw, ms));
    new MutationObserver(sweepBmw).observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.head) {
    inject();
    startBmwWatcher();
  } else {
    new MutationObserver((_, obs) => {
      if (document.head) {
        inject();
        startBmwWatcher();
        obs.disconnect();
      }
    }).observe(document.documentElement, { childList: true });
  }
})();
