import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarService } from '../../core/services/calendar';
import { LanguageService } from '../../core/services/language';
import { LocationService } from '../../core/services/location';
import { PrayerTimesService } from '../../core/services/prayer';
import { SeoService } from '../../core/services/seo';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state';
import { IconComponent } from '../../shared/components/icon/icon';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton';

export const WEEKDAY_NAMES = [
  { en: 'Sun', bn: 'রবি', ar: 'الأحد' },
  { en: 'Mon', bn: 'সোম', ar: 'الإثنين' },
  { en: 'Tue', bn: 'মঙ্গল', ar: 'الثلاثاء' },
  { en: 'Wed', bn: 'বুধ', ar: 'الأربعاء' },
  { en: 'Thu', bn: 'বৃহঃ', ar: 'الخميس' },
  { en: 'Fri', bn: 'শুক্র', ar: 'الجمعة' },
  { en: 'Sat', bn: 'শনি', ar: 'السبت' },
] as const;

@Component({
  selector: 'aq-calendar-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    IconComponent,
    SkeletonComponent,
    ErrorStateComponent,
  ],
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss',
})
export class CalendarPage implements OnInit {
  private readonly seo = inject(SeoService);
  protected readonly calendar = inject(CalendarService);
  protected readonly language = inject(LanguageService);
  protected readonly prayerTimes = inject(PrayerTimesService);
  protected readonly locationService = inject(LocationService);

  readonly isBn = this.language.isBn;
  readonly weekdays = WEEKDAY_NAMES;

  // Calendar state signals
  readonly today = this.calendar.todayConversion;
  readonly monthData = this.calendar.monthData;
  readonly months = this.calendar.months;
  readonly events = this.calendar.events;
  readonly loading = this.calendar.loading;
  readonly error = this.calendar.error;
  readonly selectedYear = this.calendar.selectedYear;
  readonly selectedMonth = this.calendar.selectedMonth;
  readonly selectedMonthName = this.calendar.selectedMonthName;
  readonly isCurrentMonth = this.calendar.isCurrentMonthSelected;
  readonly isRamadan = this.calendar.isRamadan;
  readonly isRamadanSelected = this.calendar.isRamadanSelected;
  readonly ramadanProgress = this.calendar.ramadanProgress;
  readonly daysUntilRamadan = this.calendar.daysUntilRamadan;

  // Prayer times for Suhoor / Iftar in Ramadan section
  readonly timetable = this.prayerTimes.timetable;
  readonly nextPrayer = this.prayerTimes.nextPrayer;

  // Grid alignment
  readonly leadingBlanks = computed(() => {
    const days = this.monthData()?.days;
    if (!days || days.length === 0) return [];
    const firstDate = new Date(days[0].gregorianDate);
    const dayOfWeek = firstDate.getDay(); // 0: Sun, 1: Mon, ...
    return Array.from({ length: dayOfWeek });
  });

  ngOnInit(): void {
    this.seo.apply({
      title: 'Islamic Calendar — Hijri Dates & Ramadan View',
      description:
        "Astronomically calculated Hijri calendar, today's Islamic date, significant Islamic events, and Ramadan dashboard.",
      path: '/calendar',
    });
  }

  // Navigation handlers
  nextMonth(): void {
    this.calendar.nextMonth();
  }

  prevMonth(): void {
    this.calendar.prevMonth();
  }

  goToToday(): void {
    this.calendar.goToToday();
  }

  selectMonth(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.calendar.setMonth(parseInt(select.value, 10));
  }

  selectYear(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.calendar.setYear(parseInt(select.value, 10));
  }

  // Formatting helpers
  toBnDigits(val: string | number): string {
    return this.prayerTimes.toBnDigits(val);
  }

  formatDate(gregorianStr: string): string {
    try {
      const d = new Date(gregorianStr);
      const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthsBn = ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'];
      const day = d.getDate();
      const monthIdx = d.getMonth();
      if (this.isBn()) {
        return `${this.toBnDigits(day)} ${monthsBn[monthIdx]}`;
      }
      return `${day} ${monthsEn[monthIdx]}`;
    } catch {
      return gregorianStr;
    }
  }

  formatTime(time24: string | undefined): string {
    return this.prayerTimes.format12h(time24, this.isBn());
  }

  retry(): void {
    this.calendar.init();
  }
}
