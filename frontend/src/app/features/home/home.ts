import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LocationService } from '../../core/services/location';
import { PrayerTimesService } from '../../core/services/prayer';
import { DailyAyahService } from '../../core/services/daily-ayah';
import { LanguageService } from '../../core/services/language';
import { ReadingPositionService } from '../../core/services/reading-position';
import { ReadingProgressService } from '../../core/services/reading-progress';
import { IconComponent } from '../../shared/components/icon/icon';

/**
 * Landing page.
 *
 * Displays the greeting, today's date, quick action links, next prayer countdown,
 * resume reading progress, Ayah of the Day, and the full Islamic features showcase.
 */
@Component({
  selector: 'aq-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomePage {
  private readonly readingPosition = inject(ReadingPositionService);
  private readonly readingProgress = inject(ReadingProgressService);
  protected readonly prayerTimes = inject(PrayerTimesService);
  protected readonly locationService = inject(LocationService);
  protected readonly lang = inject(LanguageService);
  protected readonly dailyAyahService = inject(DailyAyahService);

  readonly isBn = this.lang.isBn;

  readonly lastRead = this.readingPosition.position;
  readonly hasLastRead = this.readingPosition.hasPosition;
  readonly readCount = this.readingProgress.count;
  readonly totalAyahs = this.readingProgress.total;
  readonly progressPercentage = this.readingProgress.percentage;

  readonly nextPrayer = this.prayerTimes.nextPrayer;
  readonly currentLocation = this.locationService.location;

  readonly dailyAyah = this.dailyAyahService.ayah;
  readonly dailySurah = this.dailyAyahService.surah;
  readonly dailyLoading = this.dailyAyahService.loading;
  readonly dailyError = this.dailyAyahService.error;
  readonly isDailyPlaying = this.dailyAyahService.isPlaying;
  readonly isDailyBookmarked = this.dailyAyahService.isBookmarked;
  readonly shareOutcome = signal<string | null>(null);

  /** Today's date, formatted in the browser's own locale. */
  protected readonly today = computed(() =>
    new Intl.DateTimeFormat(undefined, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date()),
  );

  formatTime12h(time24: string | undefined): string {
    return this.prayerTimes.format12h(time24, this.isBn());
  }

  toBnDigits(val: string | number): string {
    return this.prayerTimes.toBnDigits(val);
  }

  playDailyAyah(): void {
    void this.dailyAyahService.toggleAudio();
  }

  toggleDailyBookmark(): void {
    this.dailyAyahService.toggleBookmark();
  }

  async shareDailyAyah(): Promise<void> {
    const outcome = await this.dailyAyahService.share();
    if (outcome === 'copied') {
      this.shareOutcome.set(this.isBn() ? 'অনুলিপি করা হয়েছে!' : 'Copied to clipboard!');
      setTimeout(() => this.shareOutcome.set(null), 3000);
    } else if (outcome === 'shared') {
      this.shareOutcome.set(this.isBn() ? 'শেয়ার করা হয়েছে!' : 'Shared!');
      setTimeout(() => this.shareOutcome.set(null), 3000);
    }
  }
}
