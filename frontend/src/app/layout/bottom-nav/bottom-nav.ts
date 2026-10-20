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
      display: block;
      @include m.up(lg) {
        display: none;
      }
    }

    .bar {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      width: 100%;
      max-width: 100vw;
      box-sizing: border-box;
      z-index: 500;
      background: color-mix(in srgb, var(--aq-surface) 96%, transparent);
      backdrop-filter: blur(12px);
      border-top: 1px solid var(--aq-border);
      // Clears safe areas including iPhone home indicator & landscape notches
      padding-left: env(safe-area-inset-left, 0);
      padding-right: env(safe-area-inset-right, 0);
      padding-bottom: env(safe-area-inset-bottom, 0);
      pointer-events: auto;
      overflow: hidden;
    }

    ul {
      display: grid;
      grid-template-columns: repeat(5, minmax(0, 1fr));
      width: 100%;
      margin: 0;
      padding: 0;
      list-style: none;
      box-sizing: border-box;
    }

    li {
      min-width: 0;
      width: 100%;
      overflow: hidden;
      display: flex;
    }

    a {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.2rem;
      width: 100%;
      min-width: 0;
      min-height: var(--aq-bottom-nav-height);
      padding: 0.4rem 0.125rem;
      box-sizing: border-box;
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

      span {
        display: block;
        width: 100%;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        text-align: center;
        line-height: 1.15;
      }
    }

    @media (max-width: 380px) {
      a {
        padding: 0.35rem 0.05rem;
        font-size: 0.625rem;
        gap: 0.15rem;

        aq-icon {
          transform: scale(0.95);
        }
      }
    }

    @media (max-width: 330px) {
      a {
        font-size: 0.5625rem;

        aq-icon {
          transform: scale(0.9);
        }
      }
    }
  `,
})
export class BottomNavComponent {
  private readonly lang = inject(LanguageService);
  protected readonly isBn = this.lang.isBn;
  protected readonly items = PRIMARY_NAV_ITEMS;
}
