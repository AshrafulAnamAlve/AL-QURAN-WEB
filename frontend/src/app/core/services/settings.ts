import { Injectable, computed, inject, signal } from '@angular/core';
import { AppLanguage, LanguageService } from './language';
import { ThemeService } from './theme';
import { ReadingSettingsService } from './reading-settings';
import { ReciterService } from './reciter';
import { AudioPlayerService } from './audio-player';
import { PrayerTimesService } from './prayer';
import { LocationService } from './location';
import { BookmarkService } from './bookmarks';
import { ReadingProgressService } from './reading-progress';
import { ReadingPositionService } from './reading-position';
import { StorageService, StorageUsage } from './storage';
import { ThemePreference } from '../models/theme';
import { ReadingSettings, TranslationMode } from '../models/reading-settings';
import { Reciter } from '../models/quran';

/**
 * Single consolidated facade and source of truth for application preferences,
 * reading configuration, theme, language, audio, location, and data management.
 */
@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly readingSettingsService = inject(ReadingSettingsService);
  private readonly themeService = inject(ThemeService);
  private readonly languageService = inject(LanguageService);
  private readonly reciterService = inject(ReciterService);
  private readonly audioPlayerService = inject(AudioPlayerService);
  private readonly prayerTimesService = inject(PrayerTimesService);
  private readonly locationService = inject(LocationService);
  private readonly bookmarkService = inject(BookmarkService);
  private readonly readingProgressService = inject(ReadingProgressService);
  private readonly readingPositionService = inject(ReadingPositionService);
  private readonly storage = inject(StorageService);

  // --- Reading Settings ---
  readonly readingSettings = this.readingSettingsService.settings;
  readonly arabicSize = this.readingSettingsService.arabicSize;
  readonly translationSize = this.readingSettingsService.translationSize;
  readonly lineHeight = this.readingSettingsService.lineHeight;
  readonly readingWidth = this.readingSettingsService.readingWidth;
  readonly translationMode = this.readingSettingsService.translationMode;
  readonly showBanglaPronunciation = this.readingSettingsService.showBanglaPronunciation;
  readonly isDefaultReadingSettings = this.readingSettingsService.isDefault;

  // --- Appearance ---
  readonly themePreference = this.themeService.preference;
  readonly isDark = this.themeService.isDark;

  // --- Language ---
  readonly language = this.languageService.language;
  readonly isBn = this.languageService.isBn;

  // --- Audio ---
  readonly selectedReciter = this.reciterService.selected;
  readonly reciters = this.reciterService.options;
  readonly playbackRate = this.audioPlayerService.rate;

  // --- Location & Prayer ---
  readonly location = this.locationService.location;
  readonly calculationSettings = this.prayerTimesService.calculationSettings;
  readonly prayerMethods = this.prayerTimesService.methods;

  // --- Data Statistics & Usage ---
  private readonly _storageUsage = signal<StorageUsage>(this.storage.getUsage());
  readonly storageUsage = this._storageUsage.asReadonly();

  readonly bookmarksCount = this.bookmarkService.count;
  readonly ayahsReadCount = this.readingProgressService.count;
  readonly readingProgressPercentage = this.readingProgressService.percentage;
  readonly lastReadingPosition = this.readingPositionService.position;

  // --- Reading Actions ---
  setArabicSize(size: number): void {
    this.readingSettingsService.setArabicSize(size);
    this.refreshStorageUsage();
  }

  setTranslationSize(size: number): void {
    this.readingSettingsService.setTranslationSize(size);
    this.refreshStorageUsage();
  }

  setLineHeight(height: number): void {
    this.readingSettingsService.setLineHeight(height);
    this.refreshStorageUsage();
  }

  setReadingWidth(width: number): void {
    this.readingSettingsService.setReadingWidth(width);
    this.refreshStorageUsage();
  }

  setTranslationMode(mode: TranslationMode): void {
    this.readingSettingsService.setTranslationMode(mode);
    this.refreshStorageUsage();
  }

  setShowBanglaPronunciation(show: boolean): void {
    this.readingSettingsService.setShowBanglaPronunciation(show);
    this.refreshStorageUsage();
  }

  toggleBanglaPronunciation(): void {
    this.readingSettingsService.toggleBanglaPronunciation();
    this.refreshStorageUsage();
  }

  resetReadingLayout(): void {
    this.readingSettingsService.resetLayout();
    this.refreshStorageUsage();
  }

  // --- Appearance Actions ---
  setTheme(theme: ThemePreference): void {
    this.themeService.set(theme);
    this.refreshStorageUsage();
  }

  // --- Language Actions ---
  setLanguage(lang: AppLanguage): void {
    this.languageService.setLanguage(lang);
    this.refreshStorageUsage();
  }

  // --- Audio Actions ---
  selectReciter(reciter: Reciter): void {
    this.reciterService.select(reciter);
    this.refreshStorageUsage();
  }

  setPlaybackRate(rate: number): void {
    this.audioPlayerService.setRate(rate);
    this.refreshStorageUsage();
  }

  // --- Location & Prayer Actions ---
  setSchool(school: 0 | 1): void {
    this.prayerTimesService.setSchool(school);
    this.refreshStorageUsage();
  }

  setCalculationMethod(methodId: number): void {
    this.prayerTimesService.setCalculationMethod(methodId);
    this.refreshStorageUsage();
  }

  requestGpsLocation(): Promise<boolean> {
    return this.locationService.requestGeolocation().then((success: boolean) => {
      this.refreshStorageUsage();
      return success;
    });
  }

  // --- Data & Storage Actions ---
  refreshStorageUsage(): void {
    this._storageUsage.set(this.storage.getUsage());
  }

  clearBookmarks(): void {
    this.bookmarkService.clear();
    this.refreshStorageUsage();
  }

  clearReadingProgress(): void {
    this.readingProgressService.reset();
    this.readingPositionService.clear();
    this.refreshStorageUsage();
  }

  resetAllSettings(): void {
    this.readingSettingsService.resetAll();
    this.themeService.set('system');
    this.audioPlayerService.setRate(1);
    this.prayerTimesService.setSchool(0);
    this.refreshStorageUsage();
  }

  resetAllData(): void {
    this.bookmarkService.clear();
    this.readingProgressService.reset();
    this.readingPositionService.clear();
    this.readingSettingsService.resetAll();
    this.storage.clearAll();
    this.refreshStorageUsage();
  }

  /**
   * Generates a JSON backup file and initiates browser download.
   */
  exportBackupFile(): void {
    const backup = this.storage.exportBackup();
    const json = JSON.stringify(backup, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const dateStr = new Date().toISOString().slice(0, 10);
    const link = document.createElement('a');
    link.href = url;
    link.download = `alquran-backup-${dateStr}.json`;
    link.click();

    URL.revokeObjectURL(url);
  }

  /**
   * Restores data from a backup JSON string.
   */
  importBackupJson(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      const success = this.storage.importBackup(parsed);
      if (success) {
        this.refreshStorageUsage();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}
