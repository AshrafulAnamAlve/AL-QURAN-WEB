import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Ayah } from '../../../../core/models/quran';
import { AudioPlayerService } from '../../../../core/services/audio-player';
import { BookmarkService } from '../../../../core/services/bookmarks';
import { ReadingPositionService } from '../../../../core/services/reading-position';
import { ReadingProgressService } from '../../../../core/services/reading-progress';
import { ReadingSettingsService } from '../../../../core/services/reading-settings';
import { ShareService } from '../../../../core/services/share';
import { IconComponent } from '../../../../shared/components/icon/icon';

/**
 * One ayah: the Arabic, its translations, and the four actions.
 *
 * The Arabic is never given `user-select: none` and never split into spans - it
 * has to stay selectable and copyable as a single run of text, which is both an
 * accessibility requirement and the only way copy behaves correctly for Arabic.
 */
@Component({
  selector: 'aq-ayah-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  templateUrl: './ayah-view.html',
  styleUrl: './ayah-view.scss',
})
export class AyahViewComponent {
  private readonly settings = inject(ReadingSettingsService);
  private readonly bookmarks = inject(BookmarkService);
  private readonly audio = inject(AudioPlayerService);
  private readonly share = inject(ShareService);
  private readonly readingPosition = inject(ReadingPositionService);
  private readonly readingProgress = inject(ReadingProgressService);

  readonly ayah = input.required<Ayah>();
  readonly surahEnglishName = input.required<string>();
  readonly surahBanglaName = input<string>('');

  /**
   * Element id, so the page can address this ayah.
   *
   * Defaults to `ayah-N` within a surah, which is what the #ayah-N deep links
   * use. A juz has to override it: it spans several surahs, so numbering by
   * position within the surah alone would put two `ayah-1` elements on one page.
   */
  readonly elementId = input<string>('');

  protected readonly domId = computed(
    () => this.elementId() || `ayah-${this.ayah().numberInSurah}`,
  );

  /** Transient confirmation shown on the Copy or Share button. */
  protected readonly feedback = signal<'' | 'copied' | 'shared' | 'failed'>('');

  protected readonly showsBangla = this.settings.showsBangla;
  protected readonly showsEnglish = this.settings.showsEnglish;

  protected readonly banglaText = computed(
    () => this.ayah().translations.find((item) => item.language === 'bn')?.text ?? '',
  );

  protected readonly englishText = computed(
    () => this.ayah().translations.find((item) => item.language === 'en')?.text ?? '',
  );

  protected readonly reference = computed(
    () => `${this.ayah().surahNumber}:${this.ayah().numberInSurah}`,
  );

  protected readonly isBookmarked = computed(() => this.bookmarks.has(this.ayah().globalNumber));

  protected readonly isPlaying = computed(() => this.audio.isPlayingAyah(this.ayah().globalNumber));

  /** Loaded in the player, whether or not it is playing right now. */
  protected readonly isCurrent = computed(() =>
    this.audio.isCurrentAyah(this.ayah().globalNumber),
  );

  protected readonly isBuffering = computed(
    () => this.audio.isBuffering() && this.audio.currentAyah() === this.ayah().globalNumber,
  );

  protected readonly playLabel = computed(() =>
    this.isPlaying()
      ? `Pause the recitation of ayah ${this.reference()}`
      : `Play the recitation of ayah ${this.reference()}`,
  );

  protected readonly bookmarkLabel = computed(() =>
    this.isBookmarked()
      ? `Remove the bookmark on ayah ${this.reference()}`
      : `Bookmark ayah ${this.reference()}`,
  );

  recordPosition(): void {
    const a = this.ayah();
    this.readingPosition.save({
      surahNumber: a.surahNumber,
      surahEnglishName: this.surahEnglishName(),
      surahBanglaName: this.surahBanglaName(),
      ayahNumber: a.numberInSurah,
    });
    this.readingProgress.markRead(a.globalNumber);
  }

  async togglePlay(): Promise<void> {
    this.recordPosition();
    // The player works on the page's queue, so playing one ayah also sets up
    // auto-advance through the rest of the surah.
    await this.audio.toggleAyah(this.ayah().globalNumber);
  }

  toggleBookmark(): void {
    this.recordPosition();
    const ayah = this.ayah();

    this.bookmarks.toggle({
      globalNumber: ayah.globalNumber,
      surahNumber: ayah.surahNumber,
      ayahNumber: ayah.numberInSurah,
      surahEnglishName: this.surahEnglishName(),
      surahBanglaName: this.surahBanglaName(),
      arabic: ayah.arabic,
      // Save whichever translation is on screen, so the bookmarks page has text.
      translation: this.banglaText() || this.englishText(),
      savedAt: new Date().toISOString(),
    });
  }

  async copy(): Promise<void> {
    this.recordPosition();
    const copied = await this.share.copyAyah(this.shareContent());
    this.flash(copied ? 'copied' : 'failed');
  }

  async shareAyah(): Promise<void> {
    this.recordPosition();
    const outcome = await this.share.shareAyah(this.shareContent());

    // A dismissed share sheet returns 'failed'; saying so would be wrong.
    if (outcome !== 'failed') {
      this.flash(outcome);
    }
  }

  private shareContent() {
    return {
      surahEnglishName: this.surahEnglishName(),
      surahNumber: this.ayah().surahNumber,
      ayahNumber: this.ayah().numberInSurah,
      arabic: this.ayah().arabic,
      translations: [this.banglaText(), this.englishText()].filter(Boolean),
    };
  }

  private flash(state: 'copied' | 'shared' | 'failed'): void {
    this.feedback.set(state);
    setTimeout(() => this.feedback.set(''), 2000);
  }
}
