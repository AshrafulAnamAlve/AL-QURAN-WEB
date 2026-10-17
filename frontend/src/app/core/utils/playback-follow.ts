import { DOCUMENT } from '@angular/common';
import { DestroyRef, Signal, effect, inject, untracked } from '@angular/core';
import { PlayableAyah, PlaybackQueue } from '../models/audio';
import { AudioPlayerService } from '../services/audio-player';

/** Turns an ayah into the id of the element rendering it. */
export type AyahElementId = (ayah: PlayableAyah) => string;

/**
 * Wires a reading page to the player: registers what it contains, and scrolls
 * along as the recitation moves.
 *
 * Both readers need exactly this, so it lives here rather than being written
 * twice. Call it from a component constructor.
 *
 * Registering a queue never interrupts anything: opening a surah while listening
 * to a different one only changes what the *next* press of play will use.
 *
 * @param queue The ayahs on this page, or null while they are still loading.
 * @param elementId How this page ids its ayah elements.
 */
export function followPlayback(
  queue: Signal<PlaybackQueue | null>,
  elementId: AyahElementId,
): void {
  const player = inject(AudioPlayerService);
  const document = inject(DOCUMENT);

  effect(() => {
    const pageQueue = queue();
    untracked(() => player.setPageQueue(pageQueue));
  });

  // Leaving the page must not leave a stale queue behind: the player would
  // otherwise start a surah the reader has navigated away from.
  inject(DestroyRef).onDestroy(() => player.setPageQueue(null));

  effect(() => {
    const ayah = player.current();
    const pageQueue = queue();

    // Only follow a recitation that is actually coming from this page.
    if (!ayah || !pageQueue || player.queue()?.id !== pageQueue.id) {
      return;
    }

    untracked(() => {
      const elId = elementId(ayah);
      scrollAyahIntoView(document, elId, player.isActive());
      // Re-verify after layout transitions so the translation is never occluded
      setTimeout(() => {
        scrollAyahIntoView(document, elId, player.isActive());
      }, 200);
    });
  });
}

/**
 * Brings an ayah into view, positioning it within the unobstructed visible area
 * between top sticky chrome (header + reader controls) and bottom fixed chrome
 * (mobile bottom nav + floating audio player), ensuring the Arabic, Bengali translation
 * ("ortho"), and action buttons remain 100% visible and unclipped.
 */
function scrollAyahIntoView(document: Document, id: string, isPlaying = false): void {
  const target = document.getElementById(id);

  if (!target) {
    return;
  }

  const view = document.defaultView;
  if (!view) return;

  const viewportHeight = view.innerHeight;
  const isMobile = view.innerWidth < 992;

  // Read actual CSS custom properties for layout occlusion
  const style = view.getComputedStyle(document.documentElement);
  const bottomNavHeight = isMobile
    ? parseFloat(style.getPropertyValue('--aq-bottom-nav-height')) || 62
    : 0;

  let playerHeight = parseFloat(style.getPropertyValue('--aq-player-height')) || 0;
  if (isPlaying && playerHeight === 0) {
    playerHeight = isMobile ? 92 : 72;
  }

  // Top occlusion: sticky header (64px) + sticky reader controls (~52px) + cushion (16px)
  const topOcclusion = 64 + 52 + 16; // ~132px

  // Bottom occlusion: fixed bottom nav + floating mini-player + safe margin (24px)
  const bottomOcclusion = bottomNavHeight + playerHeight + 24;

  const box = target.getBoundingClientRect();
  const visibleTop = topOcclusion;
  const visibleBottom = viewportHeight - bottomOcclusion;
  const availableHeight = visibleBottom - visibleTop;

  // Fully visible with comfortable breathing room above and below: leave page alone.
  if (box.top >= visibleTop && box.bottom <= visibleBottom) {
    return;
  }

  const reducedMotion = view.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const behavior = reducedMotion ? 'auto' : 'smooth';

  // If the ayah fits within the available visible window, center it inside the visible window.
  // This gives equal breathing room to the Arabic at the top and the translation at the bottom.
  if (box.height <= availableHeight) {
    const targetCenterY = visibleTop + availableHeight / 2;
    const currentCenterY = box.top + box.height / 2;
    const deltaY = currentCenterY - targetCenterY;
    view.scrollBy({ top: deltaY, behavior });
  } else {
    // If the ayah is very long (taller than the phone screen's available height),
    // align its top comfortably below the sticky reader controls.
    const deltaY = box.top - (visibleTop + 8);
    view.scrollBy({ top: deltaY, behavior });
  }
}
