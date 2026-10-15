import { computed, effect, Injectable, signal, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ResolvedTheme, THEME_COLORS, ThemePreference } from '../models/theme';
import { STORAGE_KEYS, StorageService } from './storage';

/**
 * Light / dark / system theming.
 *
 * The preference is stored as a bare string (not JSON) under `alquran.theme`,
 * because the inline script in index.html reads the same key before Angular
 * boots to prevent a flash of the wrong theme. Keep both sides in step.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storage = inject(StorageService);
  private readonly document = inject(DOCUMENT);

  /** Tracks the OS setting so 'system' stays live without a reload. */
  private readonly systemPrefersDark = signal(this.readSystemPreference());

  private readonly preferenceSignal = signal<ThemePreference>(this.readStoredPreference());

  /** What the user chose: 'light', 'dark' or 'system'. */
  readonly preference = this.preferenceSignal.asReadonly();

  /** What is actually painted, after resolving 'system' against the OS. */
  readonly resolved = computed<ResolvedTheme>(() => {
    const preference = this.preferenceSignal();
    if (preference === 'system') {
      return this.systemPrefersDark() ? 'dark' : 'light';
    }
    return preference;
  });

  readonly isDark = computed(() => this.resolved() === 'dark');

  constructor() {
    this.watchSystemPreference();

    // One effect owns every DOM side effect of theming.
    effect(() => {
      const preference = this.preferenceSignal();
      const resolved = this.resolved();
      const root = this.document.documentElement;

      // 'system' removes the attribute so the CSS media query takes over.
      if (preference === 'system') {
        root.removeAttribute('data-theme');
      } else {
        root.setAttribute('data-theme', preference);
      }

      this.applyBrowserChromeColor(resolved);
    });
  }

  set(preference: ThemePreference): void {
    this.preferenceSignal.set(preference);
    this.storage.writeRaw(STORAGE_KEYS.theme, preference);
  }

  /** Toggle used by the header button: light <-> dark, resolving 'system' first. */
  toggle(): void {
    this.set(this.resolved() === 'dark' ? 'light' : 'dark');
  }

  private readStoredPreference(): ThemePreference {
    const stored = this.storage.readRaw(STORAGE_KEYS.theme);
    return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
  }

  private readSystemPreference(): boolean {
    const view = this.document.defaultView;
    return view?.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  }

  private watchSystemPreference(): void {
    const media = this.document.defaultView?.matchMedia?.('(prefers-color-scheme: dark)');
    if (!media) {
      return;
    }

    media.addEventListener('change', (event) => this.systemPrefersDark.set(event.matches));
  }

  /** Keeps the browser/OS UI colour in step with the page. */
  private applyBrowserChromeColor(theme: ResolvedTheme): void {
    const color = THEME_COLORS[theme];

    // index.html ships two media-scoped tags; replace them with a single
    // unconditional one so an explicit choice always wins.
    this.document
      .querySelectorAll('meta[name="theme-color"]')
      .forEach((tag) => tag.parentElement?.removeChild(tag));

    const meta = this.document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    meta.setAttribute('content', color);
    this.document.head.appendChild(meta);

    this.document.documentElement.style.colorScheme = theme;
  }
}
