import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LanguageService } from '../../core/services/language';
import { MobileHardwareService } from '../../core/services/mobile-hardware.service';
import { IconComponent } from '../../shared/components/icon/icon';
import { PRIMARY_NAV_ITEMS } from '../nav-items';

/**
 * World-class, extraordinary Floating Island Bottom Navigation Dock.
 * Features an elevated centerpiece Al-Quran Sanctuary Hub with breathing halo,
 * frosted acrylic glassmorphism, illuminated micro-pill indicators, and native
 * haptic vibration feedback.
 */
@Component({
  selector: 'aq-bottom-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, IconComponent],
  template: `
    <nav class="floating-island" aria-label="Primary Navigation">
      <ul class="dock-list">
        @for (item of items; track item.path; let idx = $index) {
          @if (idx === 2) {
            <!-- CENTERPIECE: Elevated Al-Quran Sanctuary Hub -->
            <li class="dock-item dock-item--center">
              <a
                [routerLink]="item.path"
                routerLinkActive="is-active"
                (click)="onTabClick()"
                class="center-hub-btn"
                [attr.aria-label]="isBn() ? item.labelBn : item.label"
              >
                <div class="center-hub-glow" aria-hidden="true"></div>
                <div class="center-hub-orb">
                  <aq-icon [name]="item.icon" [size]="24" />
                </div>
                <span class="center-hub-label">{{ isBn() ? item.labelBn : item.label }}</span>
              </a>
            </li>
          } @else {
            <!-- SIDE DOCK ITEM -->
            <li class="dock-item">
              <a
                [routerLink]="item.path"
                routerLinkActive="is-active"
                [routerLinkActiveOptions]="{ exact: item.path === '/' }"
                (click)="onTabClick()"
                class="side-dock-btn"
              >
                <div class="side-icon-wrap">
                  <aq-icon [name]="item.icon" [size]="20" />
                </div>
                <span class="dock-label">{{ isBn() ? item.labelBn : item.label }}</span>
                <span class="active-pill-dot" aria-hidden="true"></span>
              </a>
            </li>
          }
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

    // --- Floating Island Capsule Dock ----------------------------------------
    .floating-island {
      position: fixed;
      bottom: max(14px, env(safe-area-inset-bottom, 14px));
      left: max(12px, env(safe-area-inset-left, 12px));
      right: max(12px, env(safe-area-inset-right, 12px));
      margin-inline: auto;
      width: auto;
      max-width: 440px;
      height: 66px;
      border-radius: 33px;
      z-index: 850;
      background: rgba(6, 26, 20, 0.88);
      backdrop-filter: blur(28px) saturate(210%);
      -webkit-backdrop-filter: blur(28px) saturate(210%);
      border: 1.5px solid rgba(16, 185, 129, 0.28);
      box-shadow: 0 16px 40px -4px rgba(0, 0, 0, 0.55),
                  0 0 0 1px rgba(255, 255, 255, 0.08),
                  0 6px 22px rgba(16, 185, 129, 0.2);
      pointer-events: auto;
      user-select: none;
      -webkit-user-select: none;
      touch-action: pan-y;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }

    :host-context([data-theme='light']) .floating-island {
      background: rgba(255, 255, 255, 0.92);
      border-color: rgba(16, 185, 129, 0.35);
      box-shadow: 0 16px 36px -4px rgba(0, 0, 0, 0.14),
                  0 4px 16px rgba(16, 185, 129, 0.14);
    }

    .dock-list {
      display: grid;
      grid-template-columns: 1fr 1fr 1.15fr 1fr 1fr;
      align-items: center;
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0 6px;
      list-style: none;
      box-sizing: border-box;
    }

    .dock-item {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      min-width: 0;

      &--center {
        position: relative;
        overflow: visible;
      }
    }

    // --- Side Dock Buttons ----------------------------------------------------
    .side-dock-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      width: 100%;
      height: 100%;
      padding: 4px 2px;
      box-sizing: border-box;
      color: var(--aq-text-subtle);
      text-decoration: none;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
      cursor: pointer;
      position: relative;
      transition: transform 0.14s cubic-bezier(0.2, 0.8, 0.2, 1),
                  color 0.15s ease;

      &:hover {
        color: var(--aq-text);
        text-decoration: none;
      }

      &:active {
        transform: scale(0.88);
      }

      &.is-active {
        color: var(--aq-primary);

        .side-icon-wrap {
          background: color-mix(in srgb, var(--aq-primary) 20%, transparent);
          color: var(--aq-primary);
          box-shadow: 0 2px 10px color-mix(in srgb, var(--aq-primary) 30%, transparent);
          transform: translateY(-2px);
        }

        .dock-label {
          color: var(--aq-primary);
          font-weight: 700;
        }

        .active-pill-dot {
          opacity: 1;
          width: 14px;
          background: var(--aq-primary);
          box-shadow: 0 0 8px var(--aq-primary);
        }
      }
    }

    .side-icon-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 26px;
      border-radius: 13px;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .dock-label {
      font-size: 0.65rem;
      font-weight: 600;
      line-height: 1.1;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      text-align: center;
      letter-spacing: -0.01em;
      transition: color 0.15s ease;
    }

    .active-pill-dot {
      display: block;
      width: 4px;
      height: 3px;
      border-radius: 2px;
      background: transparent;
      opacity: 0;
      margin-top: 1px;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }

    // --- Centerpiece Elevated Quran Sanctuary Hub -----------------------------
    .center-hub-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-decoration: none;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
      cursor: pointer;
      position: relative;
      top: -16px;
      transition: transform 0.18s cubic-bezier(0.2, 0.8, 0.2, 1);

      &:hover {
        text-decoration: none;
      }

      &:active {
        transform: translateY(-12px) scale(0.92);
      }

      &.is-active {
        .center-hub-orb {
          transform: scale(1.08);
          box-shadow: 0 10px 28px rgba(16, 185, 129, 0.55),
                      0 0 24px rgba(245, 158, 11, 0.5);
          border-color: #f59e0b;
        }

        .center-hub-glow {
          opacity: 0.9;
          filter: blur(14px);
        }

        .center-hub-label {
          color: #f59e0b;
          font-weight: 800;
        }
      }
    }

    .center-hub-glow {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: radial-gradient(circle, #10b981 0%, #f59e0b 80%);
      filter: blur(10px);
      opacity: 0.5;
      z-index: -1;
      animation: hub-glow-breathe 3.5s infinite ease-in-out;
      pointer-events: none;
    }

    .center-hub-orb {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: linear-gradient(135deg, #10b981 0%, #059669 40%, #d97706 100%);
      border: 3px solid rgba(6, 26, 20, 0.95);
      color: #ffffff;
      box-shadow: 0 8px 24px rgba(16, 185, 129, 0.45),
                  0 2px 8px rgba(0, 0, 0, 0.35);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

      :host-context([data-theme='light']) & {
        border-color: #ffffff;
        box-shadow: 0 8px 22px rgba(16, 185, 129, 0.35),
                    0 2px 8px rgba(0, 0, 0, 0.15);
      }
    }

    .center-hub-label {
      font-size: 0.65rem;
      font-weight: 700;
      color: var(--aq-primary);
      margin-top: 3px;
      line-height: 1;
      letter-spacing: -0.01em;
      transition: color 0.15s ease;
    }

    @keyframes hub-glow-breathe {
      0%, 100% {
        transform: translateX(-50%) scale(0.95);
        opacity: 0.4;
      }
      50% {
        transform: translateX(-50%) scale(1.18);
        opacity: 0.75;
      }
    }

    // --- Screen Adaptations ---------------------------------------------------
    @media (max-width: 380px) {
      .floating-island {
        height: 62px;
        border-radius: 31px;
        width: calc(100% - 16px);
      }

      .center-hub-btn {
        top: -14px;
      }

      .center-hub-orb {
        width: 48px;
        height: 48px;

        aq-icon {
          transform: scale(0.92);
        }
      }

      .side-icon-wrap {
        width: 36px;
        height: 24px;

        aq-icon {
          transform: scale(0.9);
        }
      }

      .dock-label,
      .center-hub-label {
        font-size: 0.5875rem;
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
