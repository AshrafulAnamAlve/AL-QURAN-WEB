import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LanguageService } from '../../core/services/language';
import { IconComponent } from '../../shared/components/icon/icon';
import { PRIMARY_NAV_ITEMS } from '../nav-items';

/**
 * Thumb-reachable navigation for phones. Hidden from large screens, where the
 * header navigation takes over.
 *
 * Only four destinations: a bottom bar with more than five entries becomes hard
 * to hit accurately. Everything else lives in the header menu.
 */
@Component({
  selector: 'aq-bottom-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, IconComponent],
  template: `
    <nav class="bar" aria-label="Primary">
      <ul>
        @for (item of items; track item.path) {
          <li>
            <a
              [routerLink]="item.path"
              routerLinkActive="is-active"
              [routerLinkActiveOptions]="{ exact: item.path === '/' }"
            >
              <aq-icon [name]="item.icon" [size]="21" />
              <span>{{ isBn() ? item.labelBn : item.label }}</span>
            </a>
          </li>
        }
      </ul>
    </nav>
  `,
  styles: `
    @use 'mixins' as m;

    :host {
      @include m.up(lg) {
        display: none;
      }
    }

    .bar {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 500;
      background: color-mix(in srgb, var(--aq-surface) 96%, transparent);
      backdrop-filter: blur(12px);
      border-top: 1px solid var(--aq-border);
      // Clears the iPhone home indicator.
      padding-bottom: env(safe-area-inset-bottom, 0);
      pointer-events: auto;
    }

    ul {
      display: grid;
      grid-auto-flow: column;
      grid-auto-columns: 1fr;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    a {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.2rem;
      min-height: var(--aq-bottom-nav-height);
      padding: 0.4rem 0.25rem;
      color: var(--aq-text-subtle);
      font-size: 0.6875rem;
      font-weight: 600;
      text-decoration: none;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
      pointer-events: auto;
      cursor: pointer;
      transition: color var(--aq-duration-fast) var(--aq-ease);

      @include m.focus-visible(-2px);

      &:hover {
        color: var(--aq-text-muted);
        text-decoration: none;
      }

      &.is-active {
        color: var(--aq-primary);
      }
    }
  `,
})
export class BottomNavComponent {
  private readonly lang = inject(LanguageService);
  protected readonly isBn = this.lang.isBn;
  protected readonly items = PRIMARY_NAV_ITEMS;
}
