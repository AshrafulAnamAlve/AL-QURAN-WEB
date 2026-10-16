import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { AudioPlayerService } from '../../core/services/audio-player';
import { AudioPlayerComponent } from '../../shared/components/audio-player/audio-player';
import { IconComponent } from '../../shared/components/icon/icon';

/**
 * The recitation bar pinned above the bottom navigation.
 *
 * It lives in the app shell rather than in the reader, which is the whole point:
 * the shell is not re-created when the route changes, so a recitation started in
 * Surah Al-Baqarah keeps playing while the reader browses the juz list or opens
 * the prayer times. Closing it is the only thing that stops playback.
 *
 * It appears only once something is loaded, so a reader who never presses play
 * never sees it and never loses screen height to it.
 */
@Component({
  selector: 'aq-mini-player',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AudioPlayerComponent, IconComponent],
  template: `
    @if (isActive()) {
      <div class="mini" role="region" aria-label="Recitation player">
        <div class="mini__inner">
          <!-- The controls are a lazy chunk: they are downloaded the first time
               a recitation starts, so a reader who never presses play does not
               carry them in the initial bundle. -->
          @defer (when isActive()) {
            <aq-audio-player />
          } @placeholder {
            <p class="mini__loading">Loading the player…</p>
          }

          <button
            type="button"
            class="aq-icon-btn mini__close"
            aria-label="Close the player and stop the recitation"
            (click)="close()"
          >
            <aq-icon name="close" [size]="16" />
          </button>
        </div>
      </div>
    }
  `,
  styles: `
    @use 'mixins' as m;

    :host {
      display: contents;
    }

    .mini {
      position: fixed;
      left: 0;
      right: 0;
      bottom: calc(var(--aq-bottom-nav-height) + env(safe-area-inset-bottom, 0));
      z-index: 520;
      background: color-mix(in srgb, var(--aq-surface) 97%, transparent);
      backdrop-filter: blur(14px);
      border-top: 1px solid var(--aq-border);
      box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.12);

      @include m.up(lg) {
        bottom: 0;
        padding-bottom: env(safe-area-inset-bottom, 0);
      }
    }

    .mini__inner {
      @include m.container;
      position: relative;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding-block: 0.5rem;
      padding-right: 3rem; // Always reserves space for the close button on phones

      @include m.up(md) {
        padding-right: 1.5rem;
      }

      aq-audio-player {
        flex: 1 1 auto;
        min-width: 0;
      }
    }

    .mini__close {
      position: absolute;
      top: 0.5rem;
      right: 0.625rem;
      z-index: 10;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      min-width: 32px;
      min-height: 32px;
      border-radius: var(--aq-radius-pill);
      background: color-mix(in srgb, var(--aq-surface-2) 90%, transparent);
      border: 1px solid var(--aq-border);
      color: var(--aq-text);
      cursor: pointer;
      touch-action: manipulation;
      transition: all var(--aq-duration-fast) var(--aq-ease);

      &:hover,
      &:focus-visible {
        background: var(--aq-danger-soft);
        color: var(--aq-danger);
        border-color: var(--aq-danger);
      }
    }

    // Holds the bar's height for the moment the controls take to arrive, so the
    // page does not jump when they do.
    .mini__loading {
      flex: 1 1 auto;
      display: flex;
      align-items: center;
      min-height: 44px;
      margin: 0;
      font-size: 0.8125rem;
      color: var(--aq-text-subtle);
    }
  `,
})
export class MiniPlayerComponent {
  private readonly player = inject(AudioPlayerService);
  private readonly document = inject(DOCUMENT);

  protected readonly isActive = this.player.isActive;

  constructor() {
    const updateHeight = (active: boolean) => {
      if (active) {
        this.document.documentElement.setAttribute('data-player-active', 'true');
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 992;
        this.document.documentElement.style.setProperty(
          '--aq-player-height',
          isMobile ? '5.75rem' : '4.5rem',
        );
      } else {
        this.document.documentElement.removeAttribute('data-player-active');
        this.document.documentElement.style.setProperty('--aq-player-height', '0px');
      }
    };

    effect(() => {
      updateHeight(this.isActive());
    });

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', () => {
        if (this.isActive()) {
          updateHeight(true);
        }
      });
    }
  }

  close(): void {
    this.player.stop();
  }
}
