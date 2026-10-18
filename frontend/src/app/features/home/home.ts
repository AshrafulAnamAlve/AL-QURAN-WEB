import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LocationService } from '../../core/services/location';
import { PrayerTimesService } from '../../core/services/prayer';
import { DailyAyahService } from '../../core/services/daily-ayah';
import { LanguageService } from '../../core/services/language';
import { ReadingPositionService } from '../../core/services/reading-position';
import { ReadingProgressService } from '../../core/services/reading-progress';
import { TaskService } from '../../core/services/task';
import { IconComponent } from '../../shared/components/icon/icon';
import { TaskGoalModalComponent } from '../../shared/components/task-goal-modal/task-goal-modal';

/**
 * Landing page.
 *
 * Displays the greeting, today's date, quick action links, next prayer countdown,
 * resume reading progress, Ayah of the Day, and the full Islamic features showcase.
 */
@Component({
  selector: 'aq-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, TaskGoalModalComponent],
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
  protected readonly taskService = inject(TaskService);

  readonly isBn = this.lang.isBn;
  readonly showGoalModal = signal<boolean>(false);

  readonly lastRead = this.readingPosition.position;
  readonly hasLastRead = this.readingPosition.hasPosition;
  readonly readCount = this.readingProgress.count;
  readonly totalAyahs = this.readingProgress.total;
  readonly progressPercentage = this.readingProgress.percentage;

  readonly nextPrayer = this.prayerTimes.nextPrayer;
  readonly currentPrayer = this.prayerTimes.currentPrayer;
  readonly currentLocation = this.locationService.location;

  /** Current active waqt (or Duha/Ishraq between sunrise and dhuhr). */
  readonly currentWaqt = computed<{
    name: string;
    banglaName: string;
    time: string;
    isDuha?: boolean;
  } | null>(() => {
    const current = this.currentPrayer();
    if (current) {
      return {
        name: current.name,
        banglaName: current.banglaName,
        time: current.time,
      };
    }

    const table = this.prayerTimes.timetable();
    if (!table) return null;

    const now = this.prayerTimes.currentTime().getTime();
    const sunrise = table.times.find((t) => t.key.toLowerCase() === 'sunrise');
    const dhuhr = table.times.find((t) => t.key.toLowerCase() === 'dhuhr');

    if (sunrise?.at && dhuhr?.at) {
      const sunriseAt = new Date(sunrise.at).getTime();
      const dhuhrAt = new Date(dhuhr.at).getTime();
      if (now >= sunriseAt && now < dhuhrAt) {
        return {
          name: 'Duha / Ishraq',
          banglaName: 'ইশরাক / দুহা',
          time: sunrise.time,
          isDuha: true,
        };
      }
    }

    return null;
  });

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

  formatRemaining(hours: number, minutes: number): string {
    if (this.isBn()) {
      if (hours > 0 && minutes > 0) {
        return `বাকি ${this.toBnDigits(hours)} ঘণ্টা ${this.toBnDigits(minutes)} মি.`;
      }
      if (hours > 0) {
        return `বাকি ${this.toBnDigits(hours)} ঘণ্টা`;
      }
      if (minutes > 0) {
        return `বাকি ${this.toBnDigits(minutes)} মিনিট`;
      }
      return '১ মিনিটের কম বাকি';
    } else {
      if (hours > 0 && minutes > 0) {
        return `${hours}h ${minutes}m left`;
      }
      if (hours > 0) {
        return `${hours}h left`;
      }
      if (minutes > 0) {
        return `${minutes}m left`;
      }
      return 'Less than 1m left';
    }
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

  openGoalModal(): void {
    this.showGoalModal.set(true);
  }

  closeGoalModal(): void {
    this.showGoalModal.set(false);
  }
}
