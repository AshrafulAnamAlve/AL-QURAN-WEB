import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LocationService } from '../../core/services/location';
import { PrayerTimesService } from '../../core/services/prayer';
import { DailyAyahService } from '../../core/services/daily-ayah';
import { LanguageService } from '../../core/services/language';
import { ReadingPositionService } from '../../core/services/reading-position';
import { ReadingProgressService } from '../../core/services/reading-progress';
import { TaskService } from '../../core/services/task';
import { PrayerNotificationService } from '../../core/services/prayer-notification';
import { CorePrayerAlertKey } from '../../core/models/prayer-notification';
import { HadithService } from '../../core/services/hadith';
import { DesktopService } from '../../core/services/desktop';
import { MobileHardwareService } from '../../core/services/mobile-hardware.service';
import { ShareService } from '../../core/services/share';
import { IconComponent } from '../../shared/components/icon/icon';
import { TaskGoalModalComponent } from '../../shared/components/task-goal-modal/task-goal-modal';
import { DailyHadithModalComponent } from '../../shared/components/daily-hadith-modal/daily-hadith-modal';

export interface TimelineWaqtItem {
  key: string;
  name: string;
  banglaName: string;
  time: string;
  isPrayer: boolean;
  status: 'passed' | 'active' | 'upcoming';
  progressPercent: number;
}

/**
 * Landing page.
 *
 * Displays the greeting, today's date, quick action links, next prayer countdown,
 * resume reading progress, Ayah of the Day, and the full Islamic features showcase.
 */
@Component({
  selector: 'aq-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, TaskGoalModalComponent, DailyHadithModalComponent],
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
  protected readonly notificationService = inject(PrayerNotificationService);
  protected readonly hadithService = inject(HadithService);
  protected readonly desktop = inject(DesktopService);
  protected readonly mobileHardware = inject(MobileHardwareService);
  private readonly shareService = inject(ShareService);

  readonly downloadLinks = this.desktop.downloadLinks;

  readonly quickActions = [
    { path: '/quran', icon: 'bookOpen' as const, label: 'Quran', labelBn: 'কুরআন', color: '#10b981' },
    { path: '/hadith', icon: 'sparkles' as const, label: 'Hadith', labelBn: 'হাদিস', color: '#f59e0b', badge: '৩৬k+' },
    { path: '/prayer', icon: 'clock' as const, label: 'Prayer', labelBn: 'নামাজ', color: '#3b82f6' },
    { path: '/qibla', icon: 'compass' as const, label: 'Qibla', labelBn: 'কিবলা', color: '#8b5cf6' },
    { path: '/tasbih', icon: 'repeat' as const, label: 'Tasbih', labelBn: 'তাসবিহ', color: '#ec4899' },
    { path: '/calendar', queryParams: { tab: 'habit' }, icon: 'calendar' as const, label: 'Habits', labelBn: 'আমল', color: '#f97316' },
    { path: '/ruqyah', icon: 'shield' as const, label: 'Ruqyah', labelBn: 'রুকইয়াহ', color: '#06b6d4' },
    { path: '/mosques', icon: 'mapPin' as const, label: 'Mosques', labelBn: 'মসজিদ', color: '#14b8a6' },
  ];

  onQuickActionTap(): void {
    this.mobileHardware.hapticTap();
  }

  readonly dailyHadith = this.hadithService.dailyHadith;
  readonly hadithShareOutcome = signal<string | null>(null);
  readonly isDesktopApp = this.desktop.isDesktop;

  openDesktopModal(): void {
    this.desktop.openDownloadModal('download');
  }

  openExtensionModal(): void {
    this.desktop.openDownloadModal('extension');
  }

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

  readonly isNextAdhanActive = computed<boolean>(() => {
    const next = this.nextPrayer();
    if (!next) return false;
    return this.notificationService.isPrayerAlertActive(next.prayer.key);
  });

  /** 6-Waqt Connected Day-Timeline with active waqt progress calculations */
  readonly dayTimeline = computed<TimelineWaqtItem[]>(() => {
    const table = this.prayerTimes.timetable();
    if (!table || table.times.length === 0) return [];

    const now = this.prayerTimes.currentTime().getTime();
    const parse = (key: string) => {
      const item = table.times.find((t) => t.key.toLowerCase() === key);
      return item?.at ? new Date(item.at).getTime() : null;
    };

    const fajrAt = parse('fajr');
    const sunriseAt = parse('sunrise');
    const dhuhrAt = parse('dhuhr');
    const asrAt = parse('asr');
    const maghribAt = parse('maghrib');
    const ishaAt = parse('isha');

    if (!fajrAt || !sunriseAt || !dhuhrAt || !asrAt || !maghribAt || !ishaAt) {
      return this.prayerTimes.coreTimings().map((t) => ({
        key: t.key,
        name: t.name,
        banglaName: t.banglaName,
        time: t.time,
        isPrayer: t.isPrayer,
        status: 'upcoming' as const,
        progressPercent: 0,
      }));
    }

    // Determine current active interval
    let activeKey = 'fajr';
    let intervalStart = fajrAt;
    let intervalEnd = sunriseAt;

    if (now >= fajrAt && now < sunriseAt) {
      activeKey = 'fajr';
      intervalStart = fajrAt;
      intervalEnd = sunriseAt;
    } else if (now >= sunriseAt && now < dhuhrAt) {
      activeKey = 'sunrise';
      intervalStart = sunriseAt;
      intervalEnd = dhuhrAt;
    } else if (now >= dhuhrAt && now < asrAt) {
      activeKey = 'dhuhr';
      intervalStart = dhuhrAt;
      intervalEnd = asrAt;
    } else if (now >= asrAt && now < maghribAt) {
      activeKey = 'asr';
      intervalStart = asrAt;
      intervalEnd = maghribAt;
    } else if (now >= maghribAt && now < ishaAt) {
      activeKey = 'maghrib';
      intervalStart = maghribAt;
      intervalEnd = ishaAt;
    } else if (now >= ishaAt) {
      activeKey = 'isha';
      intervalStart = ishaAt;
      intervalEnd = fajrAt + 24 * 60 * 60 * 1000;
    } else {
      // Early morning before today's Fajr
      activeKey = 'isha';
      intervalStart = ishaAt - 24 * 60 * 60 * 1000;
      intervalEnd = fajrAt;
    }

    const order = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
    const activeIndex = order.indexOf(activeKey);
    const isEarlyMorningBeforeFajr = now < fajrAt;

    const elapsed = Math.max(0, now - intervalStart);
    const total = Math.max(1, intervalEnd - intervalStart);
    const activeProgress = Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));

    return this.prayerTimes.coreTimings().map((t) => {
      const idx = order.indexOf(t.key.toLowerCase());
      let status: 'passed' | 'active' | 'upcoming' = 'upcoming';
      let progressPercent = 0;

      if (isEarlyMorningBeforeFajr) {
        if (t.key.toLowerCase() === 'isha') {
          status = 'active';
          progressPercent = activeProgress;
        } else {
          status = 'upcoming';
          progressPercent = 0;
        }
      } else {
        if (idx < activeIndex) {
          status = 'passed';
          progressPercent = 100;
        } else if (idx === activeIndex) {
          status = 'active';
          progressPercent = activeProgress;
        } else {
          status = 'upcoming';
          progressPercent = 0;
        }
      }

      return {
        key: t.key,
        name: t.name,
        banglaName: t.banglaName,
        time: t.time,
        isPrayer: t.isPrayer,
        status,
        progressPercent,
      };
    });
  });

  /** Summary details for the currently active waqt span */
  readonly activeWaqtSummary = computed<{
    name: string;
    banglaName: string;
    startTime: string;
    endTime: string;
    nextName: string;
    nextBanglaName: string;
    progressPercent: number;
  } | null>(() => {
    const timeline = this.dayTimeline();
    const active = timeline.find((t) => t.status === 'active');
    if (!active) return null;
    const activeIndex = timeline.indexOf(active);
    const nextItem = timeline[(activeIndex + 1) % timeline.length];
    return {
      name: active.name,
      banglaName: active.banglaName,
      startTime: active.time,
      endTime: nextItem.time,
      nextName: nextItem.name,
      nextBanglaName: nextItem.banglaName,
      progressPercent: active.progressPercent,
    };
  });

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

  openAdhanPlayer(): void {
    const current = this.currentPrayer() ?? this.nextPrayer()?.prayer;
    if (current) {
      this.notificationService.openAdhanModal(current, false, false, true);
    } else {
      this.notificationService.triggerTestAlert('asr');
    }
  }

  isPrayerAlertOn(key: string): boolean {
    return this.notificationService.isPrayerAlertActive(key);
  }

  async toggleNextPrayerAlert(): Promise<void> {
    const next = this.nextPrayer();
    if (!next) return;
    const key = next.prayer.key.toLowerCase() as CorePrayerAlertKey;
    const settings = this.notificationService.settings();
    if (!settings.enabled) {
      await this.notificationService.toggleMasterAlerts();
      this.notificationService.togglePrayer(key, true);
    } else {
      const currentlyActive = settings[key] ?? false;
      this.notificationService.togglePrayer(key, !currentlyActive);
    }
  }

  openGoalModal(): void {
    this.showGoalModal.set(true);
  }

  closeGoalModal(): void {
    this.showGoalModal.set(false);
  }

  toggleHadithBookmark(): void {
    const h = this.dailyHadith();
    this.hadithService.toggleBookmark(h.id);
  }

  isHadithBookmarked(): boolean {
    return this.hadithService.isBookmarked(this.dailyHadith().id);
  }

  async copyDailyHadith(): Promise<void> {
    const h = this.dailyHadith();
    const reference = `${this.isBn() ? h.bookBn : h.book} (${this.isBn() ? this.toBnDigits(h.hadithNumber) : h.hadithNumber})`;
    const text = [
      `【 ${reference} — ${this.isBn() ? h.gradeBn : h.gradeEn} 】`,
      '',
      h.arabic,
      '',
      `বাংলা অনুবাদ: ${h.bangla}`,
      '',
      `বর্ণনাকারী: ${this.isBn() ? h.narratorBn : h.narratorEn}`,
      '',
      'Al-Quran App',
    ].join('\n');
    const ok = await this.shareService.copy(text);
    if (ok) {
      this.hadithShareOutcome.set(this.isBn() ? 'হাদিস অনুলিপি করা হয়েছে!' : 'Hadith copied!');
      setTimeout(() => this.hadithShareOutcome.set(null), 2500);
    }
  }
}
