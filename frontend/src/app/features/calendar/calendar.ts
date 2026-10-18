import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CalendarService } from '../../core/services/calendar';
import { LanguageService } from '../../core/services/language';
import { LocationService } from '../../core/services/location';
import { PrayerTimesService } from '../../core/services/prayer';
import { SeoService } from '../../core/services/seo';
import { TaskService } from '../../core/services/task';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state';
import { IconComponent } from '../../shared/components/icon/icon';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton';
import { TaskGoalModalComponent } from '../../shared/components/task-goal-modal/task-goal-modal';

export const WEEKDAY_NAMES = [
  { en: 'Sun', bn: 'রবি', ar: 'الأحد' },
  { en: 'Mon', bn: 'সোম', ar: 'الإثنين' },
  { en: 'Tue', bn: 'মঙ্গল', ar: 'الثلاثاء' },
  { en: 'Wed', bn: 'বুধ', ar: 'الأربعاء' },
  { en: 'Thu', bn: 'বৃহঃ', ar: 'الخميس' },
  { en: 'Fri', bn: 'শুক্র', ar: 'الجمعة' },
  { en: 'Sat', bn: 'শনি', ar: 'السبত' },
] as const;

export interface HabitDayCell {
  readonly dateKey: string;
  readonly dayNumber: number;
  readonly weekdayIndex: number;
  readonly isToday: boolean;
  readonly status: 'completed' | 'partial' | 'missed' | 'today';
  readonly ayahsRead: number;
  readonly minutesListened: number;
  readonly goalMet: boolean;
}

@Component({
  selector: 'aq-calendar-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    IconComponent,
    SkeletonComponent,
    ErrorStateComponent,
    TaskGoalModalComponent,
  ],
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss',
})
export class CalendarPage implements OnInit {
  private readonly seo = inject(SeoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly calendar = inject(CalendarService);
  protected readonly language = inject(LanguageService);
  protected readonly prayerTimes = inject(PrayerTimesService);
  protected readonly locationService = inject(LocationService);
  protected readonly taskService = inject(TaskService);

  readonly isBn = this.language.isBn;
  readonly weekdays = WEEKDAY_NAMES;

  // Active view tab: 'hijri' for Islamic Calendar, 'habit' for Daily Habit Tracker
  readonly activeTab = signal<'hijri' | 'habit'>('hijri');
  readonly showGoalModal = signal<boolean>(false);
  readonly selectedHabitDay = signal<HabitDayCell | null>(null);

  // Month navigation for Habit Tracker
  readonly habitViewDate = signal<Date>(new Date());

  readonly habitMonthName = computed(() => {
    const d = this.habitViewDate();
    const monthsEn = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    const monthsBn = [
      'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
      'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর',
    ];
    const m = d.getMonth();
    const y = d.getFullYear();
    return this.isBn() ? `${monthsBn[m]} ${this.toBnDigits(y)}` : `${monthsEn[m]} ${y}`;
  });

  readonly habitLeadingBlanks = computed(() => {
    const d = this.habitViewDate();
    const firstDay = new Date(d.getFullYear(), d.getMonth(), 1).getDay();
    return Array.from({ length: firstDay });
  });

  readonly habitMonthCells = computed<HabitDayCell[]>(() => {
    const d = this.habitViewDate();
    const year = d.getFullYear();
    const month = d.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const history = this.taskService.history();
    const todayStr = this.taskService.todayDate();

    const cells: HabitDayCell[] = [];
    for (let day = 1; day <= totalDays; day++) {
      const monthStr = String(month + 1).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      const key = `${year}-${monthStr}-${dayStr}`;
      const isToday = key === todayStr;
      const rec = history[key];

      const ayahsRead = rec?.ayahsRead ?? 0;
      const minutesListened = rec?.minutesListened ?? 0;
      const goalMet = rec?.goalMet ?? (isToday ? this.taskService.isReadingGoalMet() : false);

      let status: 'completed' | 'partial' | 'missed' | 'today';
      if (isToday) {
        status = goalMet ? 'completed' : 'today';
      } else if (goalMet) {
        status = 'completed';
      } else if (ayahsRead > 0 || minutesListened > 0) {
        status = 'partial';
      } else {
        const checkDate = new Date(year, month, day);
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);
        status = checkDate < todayDate ? 'missed' : 'partial';
      }

      cells.push({
        dateKey: key,
        dayNumber: day,
        weekdayIndex: new Date(year, month, day).getDay(),
        isToday,
        status,
        ayahsRead,
        minutesListened,
        goalMet,
      });
    }

    return cells;
  });

  // Calendar state signals (Hijri)
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
    this.route.queryParamMap.subscribe((params) => {
      const tabParam = params.get('tab');
      if (tabParam === 'habit') {
        this.activeTab.set('habit');
      } else if (tabParam === 'hijri') {
        this.activeTab.set('hijri');
      }
    });

    if (this.route.snapshot.fragment === 'habit-tracker') {
      this.activeTab.set('habit');
    }

    this.seo.apply({
      title: 'Islamic Calendar & Quran Habit Tracker',
      description:
        "Astronomically calculated Hijri calendar, today's Islamic date, significant Islamic events, and daily Quran habit calendar.",
      path: '/calendar',
    });
  }

  // Tab switching
  switchTab(tab: 'hijri' | 'habit'): void {
    this.activeTab.set(tab);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  // Habit Calendar navigation
  prevHabitMonth(): void {
    const d = new Date(this.habitViewDate());
    d.setMonth(d.getMonth() - 1);
    this.habitViewDate.set(d);
  }

  nextHabitMonth(): void {
    const d = new Date(this.habitViewDate());
    d.setMonth(d.getMonth() + 1);
    this.habitViewDate.set(d);
  }

  goToCurrentHabitMonth(): void {
    this.habitViewDate.set(new Date());
  }

  selectHabitDay(day: HabitDayCell): void {
    this.selectedHabitDay.set(day);
  }

  closeHabitDayDetails(): void {
    this.selectedHabitDay.set(null);
  }

  openGoalModal(): void {
    this.showGoalModal.set(true);
  }

  closeGoalModal(): void {
    this.showGoalModal.set(false);
  }

  // Navigation handlers (Hijri)
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
