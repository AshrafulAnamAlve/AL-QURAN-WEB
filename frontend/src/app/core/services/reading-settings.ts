import { DOCUMENT } from '@angular/common';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import {
  DEFAULT_READING_SETTINGS,
  READING_LIMITS,
  ReadingSettings,
  TranslationMode,
} from '../models/reading-settings';
import { STORAGE_KEYS, StorageService } from './storage';

/**
 * How the Quran is displayed: text sizes, line spacing, column width and which
 * translations to show.
 *
 * The values are written to CSS custom properties on the document root rather
 * than bound into each ayah, so changing a slider restyles thousands of lines in
 * one repaint instead of re-rendering 286 components.
 *
 * Phase 10 builds the Settings page on top of this service; the reading view
 * already writes to it.
 */
@Injectable({ providedIn: 'root' })
export class ReadingSettingsService {
  private readonly storage = inject(StorageService);
  private readonly document = inject(DOCUMENT);

  private readonly state = signal<ReadingSettings>(this.load());

  readonly settings = this.state.asReadonly();

  readonly arabicSize = computed(() => this.state().arabicSize);
  readonly translationSize = computed(() => this.state().translationSize);
  readonly lineHeight = computed(() => this.state().lineHeight);
  readonly readingWidth = computed(() => this.state().readingWidth);
  readonly translationMode = computed(() => this.state().translationMode);

  readonly showsBangla = computed(() => {
    const mode = this.translationMode();
    return mode === 'bangla' || mode === 'both';
  });

  readonly showsEnglish = computed(() => {
    const mode = this.translationMode();
    return mode === 'english' || mode === 'both';
  });

  readonly isDefault = computed(() => {
    const current = this.state();
    return (
      current.arabicSize === DEFAULT_READING_SETTINGS.arabicSize
      && current.translationSize === DEFAULT_READING_SETTINGS.translationSize
      && current.lineHeight === DEFAULT_READING_SETTINGS.lineHeight
      && current.readingWidth === DEFAULT_READING_SETTINGS.readingWidth
    );
  });

  constructor() {
    // One effect owns every DOM side effect and the persistence.
    effect(() => {
      const current = this.state();
      this.applyToDocument(current);
      this.storage.write(STORAGE_KEYS.settings, current);
    });
  }

  setArabicSize(value: number): void {
    this.patch({ arabicSize: clamp(value, READING_LIMITS.arabicSize) });
  }

  setTranslationSize(value: number): void {
    this.patch({ translationSize: clamp(value, READING_LIMITS.translationSize) });
  }

  setLineHeight(value: number): void {
    this.patch({ lineHeight: clamp(value, READING_LIMITS.lineHeight) });
  }

  setReadingWidth(value: number): void {
    this.patch({ readingWidth: clamp(value, READING_LIMITS.readingWidth) });
  }

  setTranslationMode(mode: TranslationMode): void {
    this.patch({ translationMode: mode });
  }

  /** Restores the text and layout defaults, leaving the translation choice alone. */
  resetLayout(): void {
    this.patch({
      arabicSize: DEFAULT_READING_SETTINGS.arabicSize,
      translationSize: DEFAULT_READING_SETTINGS.translationSize,
      lineHeight: DEFAULT_READING_SETTINGS.lineHeight,
      readingWidth: DEFAULT_READING_SETTINGS.readingWidth,
    });
  }

  /** Used by the Settings page in Phase 10 to clear everything. */
  resetAll(): void {
    this.state.set({ ...DEFAULT_READING_SETTINGS });
  }

  private patch(change: Partial<ReadingSettings>): void {
    this.state.update((current) => ({ ...current, ...change }));
  }

  private applyToDocument(settings: ReadingSettings): void {
    const root = this.document.documentElement;

    root.style.setProperty('--aq-arabic-size', `${settings.arabicSize}rem`);
    root.style.setProperty('--aq-arabic-line-height', String(settings.lineHeight));
    root.style.setProperty('--aq-translation-size', `${settings.translationSize}rem`);
    root.style.setProperty('--aq-reading-width', `${settings.readingWidth}px`);

    // Translation lines sit closer together than Arabic, but still move with it,
    // so the two never end up visually mismatched.
    const translationLineHeight = Math.max(1.5, settings.lineHeight - 0.35);
    root.style.setProperty('--aq-translation-line-height', String(translationLineHeight));
  }

  /** Reads stored settings, repairing anything missing or out of range. */
  private load(): ReadingSettings {
    const stored = this.storage.read<Partial<ReadingSettings>>(STORAGE_KEYS.settings, {});

    return {
      arabicSize: sanitise(stored.arabicSize, READING_LIMITS.arabicSize),
      translationSize: sanitise(stored.translationSize, READING_LIMITS.translationSize),
      lineHeight: sanitise(stored.lineHeight, READING_LIMITS.lineHeight),
      readingWidth: sanitise(stored.readingWidth, READING_LIMITS.readingWidth),
      translationMode: isTranslationMode(stored.translationMode)
        ? stored.translationMode
        : DEFAULT_READING_SETTINGS.translationMode,
    };
  }
}

interface Range {
  readonly min: number;
  readonly max: number;
  readonly default: number;
}

function clamp(value: number, range: Range): number {
  if (!Number.isFinite(value)) {
    return range.default;
  }

  return Math.min(range.max, Math.max(range.min, value));
}

/** A stored value that is missing, corrupt or out of range falls back to the default. */
function sanitise(value: unknown, range: Range): number {
  return typeof value === 'number' && Number.isFinite(value) ? clamp(value, range) : range.default;
}

function isTranslationMode(value: unknown): value is TranslationMode {
  return value === 'bangla' || value === 'english' || value === 'both' || value === 'arabic';
}
