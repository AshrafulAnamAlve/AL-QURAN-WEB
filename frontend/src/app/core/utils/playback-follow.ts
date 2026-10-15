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

    untracked(() => scrollAyahIntoView(document, elementId(ayah)));
  });
}

/**
 * Brings an ayah into view, unless it is comfortably on screen already.
 *
 * The check matters: auto-advance moves an ayah at a time, and scrolling on
 * every one would yank the page away from a reader who is following along
 * perfectly well where they are.
 */
function scrollAyahIntoView(document: Document, id: string): void {
  const target = document.getElementById(id);

  if (!target) {
    return;
  }

  const view = document.defaultView;
  const box = target.getBoundingClientRect();
  const height = view?.innerHeight ?? 0;

  // Fully visible with a little room to breathe: leave the page alone.
  if (box.top >= 80 && box.bottom <= height - 80) {
    return;
  }

  const reducedMotion = view?.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

  target.scrollIntoView({
    behavior: reducedMotion ? 'auto' : 'smooth',
    block: 'center',
  });
}
