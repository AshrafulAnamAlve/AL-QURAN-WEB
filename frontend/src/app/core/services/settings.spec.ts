import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { SettingsService } from './settings';
import { StorageService } from './storage';
import { BookmarkService } from './bookmarks';
import { ReadingProgressService } from './reading-progress';
import { ReadingPositionService } from './reading-position';

describe('SettingsService', () => {
  let service: SettingsService;
  let storage: StorageService;
  let bookmarks: BookmarkService;
  let progress: ReadingProgressService;
  let position: ReadingPositionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        SettingsService,
        StorageService,
        BookmarkService,
        ReadingProgressService,
        ReadingPositionService,
      ],
    });

    service = TestBed.inject(SettingsService);
    storage = TestBed.inject(StorageService);
    bookmarks = TestBed.inject(BookmarkService);
    progress = TestBed.inject(ReadingProgressService);
    position = TestBed.inject(ReadingPositionService);

    storage.clearAll();
  });

  afterEach(() => {
    storage.clearAll();
  });

  it('initializes with default reading settings and signals', () => {
    expect(service.arabicSize()).toBeGreaterThan(1);
    expect(service.translationSize()).toBeGreaterThan(0.5);
    expect(service.themePreference()).toBeDefined();
    expect(service.language()).toBeDefined();
  });

  it('updates reading settings through setters', () => {
    service.setArabicSize(2.5);
    expect(service.arabicSize()).toBe(2.5);

    service.setTranslationSize(1.25);
    expect(service.translationSize()).toBe(1.25);

    service.setLineHeight(2.3);
    expect(service.lineHeight()).toBe(2.3);

    service.setReadingWidth(800);
    expect(service.readingWidth()).toBe(800);

    service.setTranslationMode('both');
    expect(service.translationMode()).toBe('both');
  });

  it('updates appearance and theme', () => {
    service.setTheme('dark');
    expect(service.themePreference()).toBe('dark');

    service.setTheme('light');
    expect(service.themePreference()).toBe('light');
  });

  it('updates language', () => {
    service.setLanguage('bn');
    expect(service.language()).toBe('bn');
    expect(service.isBn()).toBe(true);

    service.setLanguage('en');
    expect(service.language()).toBe('en');
    expect(service.isBn()).toBe(false);
  });

  it('clears bookmarks and updates count', () => {
    bookmarks.add({
      globalNumber: 1,
      surahNumber: 1,
      ayahNumber: 1,
      surahEnglishName: 'Al-Fatihah',
      surahBanglaName: 'আল-ফাতিহা',
      arabic: 'بِسْمِ ٱللَّهِ',
      translation: 'In the name of Allah',
      savedAt: new Date().toISOString(),
    });

    expect(service.bookmarksCount()).toBe(1);

    service.clearBookmarks();
    expect(service.bookmarksCount()).toBe(0);
  });

  it('clears reading progress and reading position', () => {
    progress.markRead(1);
    progress.markRead(2);
    position.save({
      surahNumber: 1,
      ayahNumber: 2,
      surahEnglishName: 'Al-Fatihah',
    });

    expect(service.ayahsReadCount()).toBe(2);
    expect(service.lastReadingPosition()).not.toBeNull();

    service.clearReadingProgress();
    expect(service.ayahsReadCount()).toBe(0);
    expect(service.lastReadingPosition()).toBeNull();
  });

  it('imports valid backup and rejects invalid backup', () => {
    const validJson = JSON.stringify({
      version: 1,
      app: 'Al-Quran',
      exportedAt: new Date().toISOString(),
      data: {
        theme: 'dark',
        language: 'bn',
      },
    });

    const result = service.importBackupJson(validJson);
    expect(result).toBe(true);

    const invalidJson = JSON.stringify({
      version: 2,
      app: 'WrongApp',
      data: {},
    });

    const badResult = service.importBackupJson(invalidJson);
    expect(badResult).toBe(false);

    const corruptResult = service.importBackupJson('{corrupted json');
    expect(badResult).toBe(false);
  });
});
