import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { HadithService } from './hadith';
import { StorageService } from './storage';

describe('HadithService', () => {
  let service: HadithService;
  let storage: StorageService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [HadithService, StorageService],
    });
    service = TestBed.inject(HadithService);
    storage = TestBed.inject(StorageService);
  });

  it('initializes with authentic Hadith dataset', () => {
    expect(service.allHadiths().length).toBeGreaterThanOrEqual(20);
    expect(service.dailyHadith()).toBeDefined();
    expect(service.dailyHadith().arabic.length).toBeGreaterThan(0);
    expect(service.dailyHadith().bangla.length).toBeGreaterThan(0);
  });

  it('provides list of distinct books including "সকল গ্রন্থ"', () => {
    const books = service.books();
    expect(books).toContain('সকল গ্রন্থ');
    expect(books).toContain('সহিহ বুখারী');
    expect(books).toContain('সহিহ মুসলিম');
  });

  it('filters by category accurately', () => {
    service.setCategory('iman');
    const imanHadiths = service.filteredHadiths();
    expect(imanHadiths.length).toBeGreaterThan(0);
    expect(imanHadiths.every((h) => h.category === 'iman')).toBe(true);

    service.setCategory('salah');
    const salahHadiths = service.filteredHadiths();
    expect(salahHadiths.length).toBeGreaterThan(0);
    expect(salahHadiths.every((h) => h.category === 'salah')).toBe(true);

    service.setCategory('all');
    expect(service.filteredHadiths().length).toBe(service.allHadiths().length);
  });

  it('filters by book', () => {
    service.setBook('সহিহ বুখারী');
    const bukhariHadiths = service.filteredHadiths();
    expect(bukhariHadiths.length).toBeGreaterThan(0);
    expect(bukhariHadiths.every((h) => h.bookBn === 'সহিহ বুখারী' || h.book === 'Sahih al-Bukhari')).toBe(true);
  });

  it('searches across bangla, english, narrator, and arabic', () => {
    // Search by bangla keyword "নিয়ত"
    service.setSearchQuery('নিয়ত');
    let results = service.filteredHadiths();
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((h) => h.bangla.includes('নিয়ত'))).toBe(true);

    // Search by narrator
    service.setSearchQuery('উমর');
    results = service.filteredHadiths();
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((h) => h.narratorBn.includes('উমর'))).toBe(true);

    // Search by hadith number
    service.setSearchQuery('1');
    results = service.filteredHadiths();
    expect(results.length).toBeGreaterThan(0);
  });

  it('manages bookmarks and persists them to storage', () => {
    expect(service.bookmarksCount()).toBe(0);
    expect(service.isBookmarked(1)).toBe(false);

    service.toggleBookmark(1);
    expect(service.isBookmarked(1)).toBe(true);
    expect(service.bookmarksCount()).toBe(1);

    // Toggle again removes bookmark
    service.toggleBookmark(1);
    expect(service.isBookmarked(1)).toBe(false);
    expect(service.bookmarksCount()).toBe(0);
  });

  it('handles daily modal dismissal with persistence', () => {
    expect(service.isDailyModalDismissed()).toBe(false);

    service.dismissDailyModal(true);
    expect(service.isDailyModalDismissed()).toBe(true);

    // Verify stored date
    const storedDate = storage.read<string>('alquran.daily_hadith_dismissed', '');
    expect(storedDate).toBe(new Date().toDateString());
  });

  it('handles daily modal dismissal without persistence for today', () => {
    service.dismissDailyModal(false);
    expect(service.isDailyModalDismissed()).toBe(true);
    const storedDate = storage.read<string>('alquran.daily_hadith_dismissed', '');
    expect(storedDate).toBe('');
  });
});
