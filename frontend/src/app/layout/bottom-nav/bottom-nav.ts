import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LanguageService } from '../../core/services/language';
import { MobileHardwareService } from '../../core/services/mobile-hardware.service';
import { IconComponent } from '../../shared/components/icon/icon';
import { PRIMARY_NAV_ITEMS } from '../nav-items';

/**
 * High-performance, tactile bottom navigation bar for mobile devices.
 * Provides frosted glassmorphic styling, safe-area clearance, animated active
 * pill indicators, and native haptic feedback.
 */
@Component({
  selector: 'aq-bottom-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, IconComponent],
  template: `
    <nav class="bar" aria-label="Primary Navigation">
      <ul>
        @for (item of items; track item.path) {
          <li>
            <a
              [routerLink]="item.path"
              routerLinkActive="is-active"
              [routerLinkActiveOptions]="{ exact: item.path === '/' }"
              (click)="onTabClick()"
            >
              <div class="nav-icon-wrap">
                <aq-icon [name]="item.icon" [size]="20" />
              </div>
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
      background: color-mix(in srgb, var(--aq-surface) 94%, transparent);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border-top: 1px solid color-mix(in srgb, var(--aq-border) 80%, transparent);
      box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
      // Clears safe areas including iPhone home indicator & landscape notches
      padding-left: env(safe-area-inset-left, 0);
      padding-right: env(safe-area-inset-right, 0);
      padding-bottom: env(safe-area-inset-bottom, 0);
      pointer-events: auto;
      overflow: hidden;
      user-select: none;
      -webkit-user-select: none;
    }

    :host-context([data-theme='dark']) .bar {
      background: rgba(6, 26, 20, 0.94);
      border-top-color: color-mix(in srgb, var(--aq-primary) 22%, transparent);
      box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.45);
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
      gap: 0.15rem;
      width: 100%;
      min-width: 0;
      min-height: 3.85rem;
      padding: 0.35rem 0.125rem 0.45rem;
      box-sizing: border-box;
      color: var(--aq-text-subtle);
      font-size: 0.6875rem;
      font-weight: 600;
      text-decoration: none;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
      pointer-events: auto;
      cursor: pointer;
      transition: transform 0.12s cubic-bezier(0.4, 0, 0.2, 1),
                  color 0.15s ease;

      @include m.focus-visible(-2px);

      &:active {
        transform: scale(0.92);
      }

      &:hover {
        color: var(--aq-text);
        text-decoration: none;
      }

      &.is-active {
        color: var(--aq-primary);

        .nav-icon-wrap {
          background: color-mix(in srgb, var(--aq-primary) 18%, transparent);
          color: var(--aq-primary);
          box-shadow: 0 2px 10px color-mix(in srgb, var(--aq-primary) 24%, transparent);
          transform: translateY(-1px);
        }

        span {
          color: var(--aq-primary);
          font-weight: 700;
        }
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
        letter-spacing: -0.01em;
      }
    }

    .nav-icon-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 42px;
      height: 26px;
      border-radius: 13px;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    @media (max-width: 380px) {
      a {
        padding: 0.3rem 0.05rem 0.4rem;
        font-size: 0.625rem;

        .nav-icon-wrap {
          width: 36px;
          height: 24px;
        }

        aq-icon {
          transform: scale(0.92);
        }
      }
    }

    @media (max-width: 330px) {
      a {
        font-size: 0.5625rem;

        .nav-icon-wrap {
          width: 32px;
          height: 22px;
        }

        aq-icon {
          transform: scale(0.85);
        }
      }
    }
  `,
})
export class BottomNavComponent {
  private readonly lang = inject(LanguageService);
  private readonly mobileHardware = inject(MobileHardwareService);

  protected readonly isBn = this.lang.isBn;
  protected readonly items = PRIMARY_NAV_ITEMS;

  protected onTabClick(): void {
    this.mobileHardware.hapticTap();
  }
}
