import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { DhikrService } from './dhikr';
import { StorageService } from './storage';
import { LanguageService } from './language';

describe('DhikrService', () => {
  let service: DhikrService;
  let storage: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DhikrService, StorageService, LanguageService],
    });

    storage = TestBed.inject(StorageService);
    storage.clearAll();
    service = TestBed.inject(DhikrService);
  });

  afterEach(() => {
    storage.clearAll();
  });

  it('should initialize with default settings and items', () => {
    expect(service).toBeTruthy();
    expect(service.allItems.length).toBeGreaterThan(10);
    expect(service.advicePrompts.length).toBeGreaterThan(3);
    expect(service.count()).toBe(0);
    expect(service.laps()).toBe(0);
    expect(service.target()).toBe(33);
  });

  it('should increment count and auto-advance lap when target reached', () => {
    service.setTarget(3);
    expect(service.count()).toBe(0);
    expect(service.laps()).toBe(0);

    service.incrementCount();
    expect(service.count()).toBe(1);

    service.incrementCount();
    expect(service.count()).toBe(2);

    service.incrementCount(); // Reaches target 3: count resets to 0, lap increments to 1
    expect(service.count()).toBe(0);
    expect(service.laps()).toBe(1);
    expect(service.todayRecord().totalCountToday).toBe(3);
  });

  it('should allow decrement and reset', () => {
    service.setTarget(10);
    service.incrementCount();
    service.incrementCount();
    expect(service.count()).toBe(2);

    service.decrementCount();
    expect(service.count()).toBe(1);

    service.resetCount();
    expect(service.count()).toBe(0);
    expect(service.laps()).toBe(0);
  });

  it('should filter items by category and search query', () => {
    service.setCategoryFilter('morning');
    const morningItems = service.filteredItems();
    expect(morningItems.length).toBeGreaterThan(0);
    expect(morningItems.every((item) => item.category === 'morning')).toBe(true);

    service.setCategoryFilter('all');
    service.setSearchQuery('istighfar');
    const queryResults = service.filteredItems();
    expect(queryResults.length).toBeGreaterThan(0);

    service.setSearchQuery('nonexistentquery123');
    expect(service.filteredItems().length).toBe(0);
  });

  it('should calculate daily streak across consecutive days', () => {
    const d1 = new Date();
    d1.setDate(d1.getDate() - 1);
    const y1 = `${d1.getFullYear()}-${String(d1.getMonth() + 1).padStart(2, '0')}-${String(d1.getDate()).padStart(2, '0')}`;

    const d2 = new Date();
    d2.setDate(d2.getDate() - 2);
    const y2 = `${d2.getFullYear()}-${String(d2.getMonth() + 1).padStart(2, '0')}-${String(d2.getDate()).padStart(2, '0')}`;

    const mockHistory = {
      [y2]: {
        date: y2,
        completedDhikrIds: ['durood_sharif'],
        totalCountToday: 33,
        adviceCompleted: true,
      },
      [y1]: {
        date: y1,
        completedDhikrIds: ['sayyidul_istighfar'],
        totalCountToday: 33,
        adviceCompleted: true,
      },
    };

    service.history.set(mockHistory);
    expect(service.dailyStreak()).toBe(2);

    // Increment today's count
    service.incrementCount();
    expect(service.dailyStreak()).toBe(3);
  });

  it('should manage home advice prompt lifecycle (increment, complete, skip)', () => {
    service.initHomePrompt();
    expect(service.activePrompt()).not.toBeNull();
    expect(service.isPromptVisible()).toBe(true);

    service.incrementPromptCount();
    expect(service.promptCount()).toBe(1);

    service.completePrompt();
    expect(service.isPromptVisible()).toBe(false);
    expect(service.todayRecord().adviceCompleted).toBe(true);

    // Skipping suppresses in session
    service.skipPrompt();
    expect(service.isPromptVisible()).toBe(false);
  });
});
