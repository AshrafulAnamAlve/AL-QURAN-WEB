import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Place, UserLocation } from '../../core/models/location';
import { READING_LIMITS, TranslationMode } from '../../core/models/reading-settings';
import { ThemePreference } from '../../core/models/theme';
import { LanguageService } from '../../core/services/language';
import { LocationService } from '../../core/services/location';
import { ReciterService } from '../../core/services/reciter';
import { SettingsService } from '../../core/services/settings';
import { POPULAR_CITIES } from '../prayer/prayer';
import { FilterFieldComponent } from '../../shared/components/filter-field/filter-field';
import { IconComponent } from '../../shared/components/icon/icon';
import { SeoService } from '../../core/services/seo';

export type DestructiveAction = 'bookmarks' | 'progress' | 'settings' | 'all';

interface ConfirmDialogState {
  open: boolean;
  action: DestructiveAction | null;
  title: string;
  message: string;
}

@Component({
  selector: 'aq-settings-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, FilterFieldComponent],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class SettingsPage implements OnInit {
  protected readonly settings = inject(SettingsService);
  protected readonly language = inject(LanguageService);
  protected readonly locationService = inject(LocationService);
  protected readonly reciterService = inject(ReciterService);
  private readonly seo = inject(SeoService);

  // Constants
  protected readonly limits = READING_LIMITS;
  protected readonly popularCities = POPULAR_CITIES;
  protected readonly playbackSpeeds = [0.75, 1.0, 1.25, 1.5, 2.0];

  // Modals & City Switcher State
  protected readonly showCityModal = signal(false);
  protected readonly citySearchQuery = signal('');
  protected readonly searchResults = signal<Place[]>([]);
  protected readonly isSearchingCities = signal(false);

  // Status Notification Toast
  protected readonly toastMessage = signal<string | null>(null);
  protected readonly toastType = signal<'success' | 'error'>('success');

  // Confirmation Modal
  protected readonly confirmDialog = signal<ConfirmDialogState>({
    open: false,
    action: null,
    title: '',
    message: '',
  });

  // Derived signals
  readonly isBn = this.language.isBn;

  readonly lastReadLabel = computed(() => {
    const pos = this.settings.lastReadingPosition();
    if (!pos) {
      return this.language.translate('settings.data.noLastRead');
    }
    const surahName = this.isBn() && pos.surahBanglaName ? pos.surahBanglaName : pos.surahEnglishName;
    return `${surahName}, ${this.isBn() ? 'আয়াত' : 'Ayah'} ${pos.ayahNumber}`;
  });

  readonly formattedStorageSize = computed(() => {
    const bytes = this.settings.storageUsage().totalBytes;
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  });

  ngOnInit(): void {
    this.reciterService.loadList();
    this.seo.apply({
      title: this.isBn() ? 'সেটিংস' : 'Settings',
      description:
        'Adjust reading preferences, font sizes, theme, language, reciter, and manage your local data.',
    });
  }

  // --- Reading Handlers ---
  onArabicSizeInput(event: Event): void {
    const val = parseFloat((event.target as HTMLInputElement).value);
    if (!isNaN(val)) this.settings.setArabicSize(val);
  }

  onTranslationSizeInput(event: Event): void {
    const val = parseFloat((event.target as HTMLInputElement).value);
    if (!isNaN(val)) this.settings.setTranslationSize(val);
  }

  onLineHeightInput(event: Event): void {
    const val = parseFloat((event.target as HTMLInputElement).value);
    if (!isNaN(val)) this.settings.setLineHeight(val);
  }

  onReadingWidthInput(event: Event): void {
    const val = parseInt((event.target as HTMLInputElement).value, 10);
    if (!isNaN(val)) this.settings.setReadingWidth(val);
  }

  setTranslationMode(mode: TranslationMode): void {
    this.settings.setTranslationMode(mode);
  }

  resetReadingLayout(): void {
    this.settings.resetReadingLayout();
  }

  // --- Appearance Handlers ---
  setTheme(theme: ThemePreference): void {
    this.settings.setTheme(theme);
  }

  // --- Language Handlers ---
  setLanguage(lang: 'en' | 'bn'): void {
    this.settings.setLanguage(lang);
  }

  // --- Audio Handlers ---
  onReciterSelected(event: Event): void {
    const identifier = (event.target as HTMLSelectElement).value;
    const match = this.settings.reciters().find((r) => r.identifier === identifier);
    if (match) this.settings.selectReciter(match);
  }

  setPlaybackSpeed(speed: number): void {
    this.settings.setPlaybackRate(speed);
  }

  // --- Location & Prayer Handlers ---
  openCityModal(): void {
    this.citySearchQuery.set('');
    this.searchResults.set([]);
    this.showCityModal.set(true);
  }

  closeCityModal(): void {
    this.showCityModal.set(false);
  }

  onCitySearchChange(query: string): void {
    this.citySearchQuery.set(query);
    if (query.trim().length < 2) {
      this.searchResults.set([]);
      this.isSearchingCities.set(false);
      return;
    }

    this.isSearchingCities.set(true);
    this.locationService.searchCities(query).subscribe({
      next: (places) => {
        this.searchResults.set(places);
        this.isSearchingCities.set(false);
      },
      error: () => {
        this.searchResults.set([]);
        this.isSearchingCities.set(false);
      },
    });
  }

  selectPlace(place: Place): void {
    this.locationService.setManualLocation(place);
    this.closeCityModal();
    this.settings.refreshStorageUsage();
  }

  async useGps(): Promise<void> {
    const success = await this.settings.requestGpsLocation();
    if (!success) {
      this.showToast(
        this.isBn()
          ? 'জিপিএস অবস্থান শনাক্ত করা যায়নি। অনুমতি পরীক্ষা করুন।'
          : 'Could not access GPS location. Please check browser permissions.',
        'error',
      );
    }
  }

  setAsrSchool(school: 0 | 1): void {
    this.settings.setSchool(school);
  }

  onCalculationMethodChange(event: Event): void {
    const methodId = parseInt((event.target as HTMLSelectElement).value, 10);
    if (!isNaN(methodId)) this.settings.setCalculationMethod(methodId);
  }

  // --- Backup & Restore Handlers ---
  exportBackup(): void {
    this.settings.exportBackupFile();
    this.showToast(
      this.isBn() ? 'ব্যাকআপ ফাইল সফলভাবে ডাউনলোড হয়েছে।' : 'Backup file exported successfully.',
      'success',
    );
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      const content = reader.result as string;
      const success = this.settings.importBackupJson(content);

      if (success) {
        this.showToast(this.language.translate('settings.data.importSuccess'), 'success');
      } else {
        this.showToast(this.language.translate('settings.data.importError'), 'error');
      }
      // Reset input so re-selecting the same file fires change
      input.value = '';
    };

    reader.onerror = () => {
      this.showToast(this.language.translate('settings.data.importError'), 'error');
      input.value = '';
    };

    reader.readAsText(file);
  }

  // --- Destructive Confirmations ---
  promptClearBookmarks(): void {
    this.confirmDialog.set({
      open: true,
      action: 'bookmarks',
      title: this.language.translate('settings.data.clearBookmarks'),
      message: this.language.translate('settings.data.clearBookmarksConfirm'),
    });
  }

  promptClearProgress(): void {
    this.confirmDialog.set({
      open: true,
      action: 'progress',
      title: this.language.translate('settings.data.clearProgress'),
      message: this.language.translate('settings.data.clearProgressConfirm'),
    });
  }

  promptResetSettings(): void {
    this.confirmDialog.set({
      open: true,
      action: 'settings',
      title: this.language.translate('settings.data.resetSettings'),
      message: this.language.translate('settings.data.resetSettingsConfirm'),
    });
  }

  promptResetAll(): void {
    this.confirmDialog.set({
      open: true,
      action: 'all',
      title: this.language.translate('settings.data.resetAll'),
      message: this.language.translate('settings.data.resetAllConfirm'),
    });
  }

  closeConfirmDialog(): void {
    this.confirmDialog.set({ open: false, action: null, title: '', message: '' });
  }

  executeConfirmedAction(): void {
    const action = this.confirmDialog().action;
    this.closeConfirmDialog();

    switch (action) {
      case 'bookmarks':
        this.settings.clearBookmarks();
        this.showToast(
          this.isBn() ? 'সকল বুকমার্ক মুছে ফেলা হয়েছে।' : 'All bookmarks have been cleared.',
          'success',
        );
        break;
      case 'progress':
        this.settings.clearReadingProgress();
        this.showToast(
          this.isBn() ? 'পড়ার ইতিহাস ও অগ্রগতি রিসেট করা হয়েছে।' : 'Reading progress has been reset.',
          'success',
        );
        break;
      case 'settings':
        this.settings.resetAllSettings();
        this.showToast(
          this.isBn() ? 'সকল সেটিংস ডিফল্টে ফিরিয়ে নেওয়া হয়েছে।' : 'All settings reset to defaults.',
          'success',
        );
        break;
      case 'all':
        this.settings.resetAllData();
        this.showToast(
          this.isBn() ? 'সকল লোকাল ডাটা সম্পূর্ণ মুছে ফেলা হয়েছে।' : 'All app data wiped clean.',
          'success',
        );
        break;
    }
  }

  private showToast(message: string, type: 'success' | 'error'): void {
    this.toastMessage.set(message);
    this.toastType.set(type);
    setTimeout(() => {
      if (this.toastMessage() === message) {
        this.toastMessage.set(null);
      }
    }, 4000);
  }
}
