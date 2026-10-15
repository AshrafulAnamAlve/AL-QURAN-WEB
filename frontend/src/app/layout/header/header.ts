import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { LanguageService } from '../../core/services/language';
import { PwaService } from '../../core/services/pwa';
import { ThemeService } from '../../core/services/theme';
import { IconComponent } from '../../shared/components/icon/icon';
import { NAV_ITEMS } from '../nav-items';

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
})
export class HeaderComponent {
  private readonly theme = inject(ThemeService);
  private readonly router = inject(Router);
  protected readonly language = inject(LanguageService);
  protected readonly pwa = inject(PwaService);

  protected readonly navItems = NAV_ITEMS;
  protected readonly drawerOpen = signal(false);

  readonly isBn = this.language.isBn;
  readonly currentLang = this.language.language;

  protected readonly isDark = this.theme.isDark;
  protected readonly themeLabel = computed(() => {
    if (this.isBn()) {
      return this.isDark() ? 'লাইট মোড চালু করুন' : 'ডার্ক মোড চালু করুন';
    }
    return this.isDark() ? 'Switch to light mode' : 'Switch to dark mode';
  });

  @HostListener('window:keydown.escape')
  onEscape(): void {
    if (this.drawerOpen()) {
      this.closeDrawer();
    }
  }

  toggleTheme(): void {
    this.theme.toggle();
  }

  toggleLanguage(): void {
    this.language.toggleLanguage();
  }

  toggleDrawer(): void {
    this.drawerOpen.update((open) => !open);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
  }

  openSearch(): void {
    this.closeDrawer();
    void this.router.navigate(['/search']);
  }

  async installApp(): Promise<void> {
    await this.pwa.promptInstall();
  }
}
