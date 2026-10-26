/**
 * Al-Quran Halal Web Shield — Reels & Shorts Interceptor & Remover
 */

(function () {
  'use strict';

  let config = {
    blockReels: true,
    blockShorts: true,
  };

  // Load preferences from storage
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['blockReels', 'blockShorts'], (items) => {
      if (typeof items.blockReels === 'boolean') config.blockReels = items.blockReels;
      if (typeof items.blockShorts === 'boolean') config.blockShorts = items.blockShorts;
      init();
    });
  } else {
    init();
  }

  function incrementBlockStat() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['reelsBlockedCount'], (res) => {
        const count = (res.reelsBlockedCount || 0) + 1;
        chrome.storage.local.set({ reelsBlockedCount: count });
      });
    }
  }

  function init() {
    const host = window.location.hostname;

    // --- 1. TikTok Redirect ---
    if (config.blockReels && host.includes('tiktok.com')) {
      incrementBlockStat();
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
        window.location.replace(chrome.runtime.getURL('blocked/blocked.html'));
      }
      return;
    }

    // --- 2. YouTube Shorts Redirection & Cleanup ---
    if (config.blockShorts && host.includes('youtube.com')) {
      handleYouTubeShorts();

      // Listen for Single Page App (SPA) URL changes on YouTube
      window.addEventListener('yt-navigate-start', handleYouTubeShorts);
      window.addEventListener('popstate', handleYouTubeShorts);

      // DOM Observer for cleaning dynamic shorts elements
      cleanYouTubeDOM();
    }

    // --- 3. Facebook Reels Clean-up ---
    if (config.blockReels && host.includes('facebook.com')) {
      cleanFacebookDOM();
    }

    // --- 4. Instagram Reels Clean-up ---
    if (config.blockReels && host.includes('instagram.com')) {
      cleanInstagramDOM();
    }
  }

  function handleYouTubeShorts() {
    const path = window.location.pathname;
    const match = path.match(/^\/shorts\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      incrementBlockStat();
      const videoId = match[1];
      const targetUrl = '/watch?v=' + videoId + window.location.search;
      window.location.replace(targetUrl);
    }
  }

  function cleanYouTubeDOM() {
    const observer = new MutationObserver(() => {
      const shortsShelf = document.querySelectorAll(
        'ytd-rich-shelf-renderer[is-shorts], ytd-reel-shelf-renderer, ytd-rich-section-renderer:has(ytd-rich-shelf-renderer[is-shorts])'
      );
      shortsShelf.forEach((shelf) => {
        shelf.remove();
        incrementBlockStat();
      });
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }

  function cleanFacebookDOM() {
    const observer = new MutationObserver(() => {
      // Find reels units by aria-labels or specific test IDs
      const reelsElements = document.querySelectorAll(
        'div[aria-label*="Reels and short videos" i], div[data-pagelet*="Reels" i], div[aria-label*="Reels" i]:not([role="dialog"])'
      );
      reelsElements.forEach((el) => {
        el.remove();
        incrementBlockStat();
      });
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }

  function cleanInstagramDOM() {
    const observer = new MutationObserver(() => {
      const reelsNav = document.querySelectorAll('a[href="/reels/"], a[href^="/reels/"], svg[aria-label="Reels"]');
      reelsNav.forEach((el) => {
        const container = el.closest('div[role="none"], div[role="listitem"]') || el;
        container.style.display = 'none';
      });

      // If user directly visits /reels/ on Instagram
      if (window.location.pathname.startsWith('/reels')) {
        window.location.replace('https://www.instagram.com/');
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }
})();
