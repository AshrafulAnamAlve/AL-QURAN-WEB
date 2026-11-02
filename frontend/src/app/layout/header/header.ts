import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnDestroy,
  computed,
  inject,
  signal,
} from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { DesktopService } from '../../core/services/desktop';
import { LanguageService } from '../../core/services/language';
import { MobileHardwareService } from '../../core/services/mobile-hardware.service';
import { PwaService } from '../../core/services/pwa';
import { ThemeService } from '../../core/services/theme';
import { TaskService } from '../../core/services/task';
import { IconComponent } from '../../shared/components/icon/icon';
import { NAV_ITEMS, PRIMARY_NAV_ITEMS, SECONDARY_NAV_ITEMS } from '../nav-items';

/**
 * Application header: brand, desktop navigation, language toggle (EN/বাং),
 * search shortcut, theme toggle and mobile drawer.
 */
@Component({
  selector: 'aq-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, IconComponent],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  host: {
    '[class.is-drawer-open]': 'drawerOpen()',
  },
})
export class HeaderComponent implements OnDestroy {
  private readonly theme = inject(ThemeService);
  private readonly router = inject(Router);
  protected readonly language = inject(LanguageService);
  protected readonly pwa = inject(PwaService);
  protected readonly taskService = inject(TaskService);
  protected readonly desktop = inject(DesktopService);
  protected readonly mobileHardware = inject(MobileHardwareService);

  private readonly routerSub = this.router.events
    .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
    .subscribe(() => {
      this.closeDrawer();
      this.closeMoreDropdown();
    });

  readonly isDesktopApp = this.desktop.isDesktop;
  readonly isNativeMobile = this.mobileHardware.isNativeMobile;

  protected readonly navItems = NAV_ITEMS;
  protected readonly primaryNavItems = PRIMARY_NAV_ITEMS;
  protected readonly secondaryNavItems = SECONDARY_NAV_ITEMS;
  protected readonly drawerOpen = signal(false);
  protected readonly moreDropdownOpen = signal(false);

  readonly isBn = this.language.isBn;
  readonly currentLang = this.language.language;

  protected readonly isDark = this.theme.isDark;
  protected readonly themeLabel = computed(() => {
    if (this.isBn()) {
      return this.isDark() ? 'লাইট মোড চালু করুন' : 'ডার্ক মোড চালু করুন';
    }
    return this.isDark() ? 'Switch to light mode' : 'Switch to dark mode';
  });

  protected readonly isSecondaryActive = computed<boolean>(() => {
    const current = this.router.url;
    return this.secondaryNavItems.some((item) => current === item.path || (item.path !== '/' && current.startsWith(item.path)));
  });

  @HostListener('window:keydown.escape')
  onEscape(): void {
    if (this.drawerOpen()) {
      this.closeDrawer();
    }
    if (this.moreDropdownOpen()) {
      this.closeMoreDropdown();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target || !target.closest || !target.closest('.nav-dropdown')) {
      this.closeMoreDropdown();
    }
  }

  toggleMoreDropdown(event?: Event): void {
    event?.stopPropagation();
    event?.preventDefault();
    this.moreDropdownOpen.update((v) => !v);
  }

  closeMoreDropdown(): void {
    this.moreDropdownOpen.set(false);
  }

  toggleTheme(): void {
    this.theme.toggle();
  }

  toggleLanguage(): void {
    this.language.toggleLanguage();
  }

  toggleDrawer(): void {
    this.drawerOpen.update((open) => {
      const next = !open;
      this.updateBodyScroll(next);
      return next;
    });
  }

  closeDrawer(): void {
    if (this.drawerOpen()) {
      this.drawerOpen.set(false);
      this.updateBodyScroll(false);
    }
  }

  private updateBodyScroll(locked: boolean): void {
    if (typeof document !== 'undefined') {
      if (locked) {
        document.body.classList.add('aq-drawer-open');
      } else {
        document.body.classList.remove('aq-drawer-open');
      }
    }
  }

  ngOnDestroy(): void {
    this.routerSub.unsubscribe();
    this.updateBodyScroll(false);
  }

  openSearch(): void {
    this.closeDrawer();
    void this.router.navigate(['/search']);
  }

  async installApp(): Promise<void> {
    await this.pwa.promptInstall();
  }

  openDesktopModal(): void {
    this.closeDrawer();
    this.closeMoreDropdown();
    this.desktop.openDownloadModal();
  }

  toBnDigits(val: string | number): string {
    return String(val).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[parseInt(d, 10)]);
  }
}
