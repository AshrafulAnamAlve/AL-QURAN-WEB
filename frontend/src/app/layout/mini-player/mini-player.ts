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
      // Clears the bottom navigation on phones; sits on the floor from lg up,
      // where the bottom navigation is hidden.
      bottom: var(--aq-bottom-nav-height);
      @include m.z(player);
      background: color-mix(in srgb, var(--aq-surface) 96%, transparent);
      backdrop-filter: blur(12px);
      border-top: 1px solid var(--aq-border);
      box-shadow: var(--aq-shadow-lg);
      padding-bottom: env(safe-area-inset-bottom, 0);

      @include m.up(lg) {
        bottom: 0;
      }
    }

    .mini__inner {
      @include m.container;
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      padding-block: 0.5rem;

      aq-audio-player {
        flex: 1 1 auto;
        min-width: 0;
      }
    }

    .mini__close {
      flex: 0 0 auto;
      margin-top: 0.125rem;
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
    // The bar is fixed, so the page needs matching padding or the last ayah and
    // the footer end up underneath it. A custom property lets the shell reserve
    // the space without this component knowing anything about the layout.
    effect(() => {
      this.document.documentElement.style.setProperty(
        '--aq-player-height',
        this.isActive() ? '4.5rem' : '0px',
      );
    });
  }

  close(): void {
    this.player.stop();
  }
}
