import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TaskService } from './task';
import { StorageService, STORAGE_KEYS } from './storage';
import { LanguageService } from './language';

describe('TaskService', () => {
  let service: TaskService;
  let storage: StorageService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TaskService,
        StorageService,
        LanguageService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    storage = TestBed.inject(StorageService);
    httpTesting = TestBed.inject(HttpTestingController);
    storage.clearAll();
    service = TestBed.inject(TaskService);
  });

  afterEach(() => {
    httpTesting.verify();
    storage.clearAll();
  });

  it('initializes with default settings and empty progress', () => {
    const s = service.settings();
    expect(s.readingGoalAyahs).toBe(10);
    expect(s.listeningGoalMinutes).toBe(15);
    expect(s.reminderEnabled).toBe(true);
    expect(service.isTodayGoalCompleted()).toBe(false);
    expect(service.readingProgressPercent()).toBe(0);
  });

  it('updates settings and persists to storage', () => {
    service.updateSettings({ readingGoalAyahs: 20, reminderTime: '07:00' });
    expect(service.settings().readingGoalAyahs).toBe(20);
    expect(service.settings().reminderTime).toBe('07:00');

    const stored = storage.read<any>(STORAGE_KEYS.dailyTasks, {});
    expect(stored.readingGoalAyahs).toBe(20);
  });

  it('records ayahs read, updates percentage and completes goal at target', () => {
    expect(service.isReadingGoalMet()).toBe(false);

    service.recordAyahRead(1, 5);
    expect(service.todayRecord().ayahsRead).toBe(5);
    expect(service.readingProgressPercent()).toBe(50);
    expect(service.isReadingGoalMet()).toBe(false);
    expect(service.celebrationActive()).toBe(false);

    service.recordAyahRead(1, 5);
    expect(service.todayRecord().ayahsRead).toBe(10);
    expect(service.readingProgressPercent()).toBe(100);
    expect(service.isReadingGoalMet()).toBe(true);
    expect(service.celebrationActive()).toBe(true);

    // Backend sync call was triggered on completion
    const req = httpTesting.expectOne((r) => r.url.includes('/tasks/daily-log'));
    expect(req.request.method).toBe('POST');
    req.flush({ success: true });
  });

  it('supports manual completion toggle for paper Mushaf readers', () => {
    service.toggleManualReading(true);
    expect(service.isReadingGoalMet()).toBe(true);
    expect(service.readingProgressPercent()).toBe(100);
    expect(service.celebrationActive()).toBe(true);

    const req = httpTesting.expectOne((r) => r.url.includes('/tasks/daily-log'));
    req.flush({ success: true });

    service.toggleManualReading(false);
    expect(service.isReadingGoalMet()).toBe(false);
    expect(service.readingProgressPercent()).toBe(0);
  });

  it('tracks audio listening minutes', () => {
    service.recordAudioListening(120); // 2 minutes
    expect(service.todayRecord().minutesListened).toBe(2);
    expect(service.listeningProgressPercent()).toBe(Math.round((2 / 15) * 100));
  });

  it('calculates streaks correctly across consecutive days', () => {
    const today = service.todayDate();
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const y1 = d.toISOString().split('T')[0];
    d.setDate(d.getDate() - 1);
    const y2 = d.toISOString().split('T')[0];

    const historyMock = {
      [y2]: {
        date: y2,
        ayahsRead: 10,
        minutesListened: 15,
        manualReadingCompleted: false,
        manualListeningCompleted: false,
        goalMet: true,
      },
      [y1]: {
        date: y1,
        ayahsRead: 10,
        minutesListened: 15,
        manualReadingCompleted: false,
        manualListeningCompleted: false,
        goalMet: true,
      },
    };

    service.history.set(historyMock);

    // Yesterday and day before were completed, today not yet: streak is 2
    expect(service.metrics().currentStreak).toBe(2);

    // Complete today: streak becomes 3
    service.toggleManualReading(true);
    expect(service.metrics().currentStreak).toBe(3);

    const req = httpTesting.expectOne((r) => r.url.includes('/tasks/daily-log'));
    req.flush({ success: true });
  });

  it('allows dismissing celebration and reminders', () => {
    service.celebrationActive.set(true);
    service.dismissCelebration();
    expect(service.celebrationActive()).toBe(false);

    service.inAppReminderActive.set(true);
    service.dismissReminder();
    expect(service.inAppReminderActive()).toBe(false);
  });
});
