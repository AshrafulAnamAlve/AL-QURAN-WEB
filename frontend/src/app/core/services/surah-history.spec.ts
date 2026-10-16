import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { SurahHistoryService } from './surah-history';
import { StorageService } from './storage';
import { ReadingPositionService } from './reading-position';

describe('SurahHistoryService', () => {
  let service: SurahHistoryService;
  let storage: StorageService;
  let readingPosition: ReadingPositionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    storage = TestBed.inject(StorageService);
    storage.clearAll();
    readingPosition = TestBed.inject(ReadingPositionService);
    service = TestBed.inject(SurahHistoryService);
  });

  it('starts with empty history', () => {
    expect(service.hasHistory()).toBe(false);
    expect(service.historyList()).toEqual([]);
    expect(service.getHistory(1)).toBeNull();
  });

  it('records reading and listening progress for a surah', () => {
    service.record(2, 'Al-Baqarah', 'আল-বাকারা', 45, 286, 'read');

    expect(service.hasHistory()).toBe(true);
    const item = service.getHistory(2);
    expect(item).not.toBeNull();
    expect(item?.surahNumber).toBe(2);
    expect(item?.lastAyahNumber).toBe(45);
    expect(item?.totalAyahs).toBe(286);
    expect(item?.lastMode).toBe('read');

    // Global reading position is also updated
    expect(readingPosition.position()?.surahNumber).toBe(2);
    expect(readingPosition.position()?.ayahNumber).toBe(45);

    // Update with listening mode
    service.record(2, 'Al-Baqarah', 'আল-বাকারা', 50, 286, 'listen');
    const updated = service.getHistory(2);
    expect(updated?.lastAyahNumber).toBe(50);
    expect(updated?.lastMode).toBe('listen');
  });

  it('orders history by most recent updated date', () => {
    service.record(1, 'Al-Fatihah', 'আল-ফাতিহা', 3, 7, 'read', '2026-10-15T10:00:00Z');
    service.record(112, 'Al-Ikhlas', 'আল-ইখলাস', 2, 4, 'listen', '2026-10-16T12:00:00Z');

    const list = service.historyList();
    expect(list.length).toBe(2);
    expect(list[0].surahNumber).toBe(112);
    expect(list[1].surahNumber).toBe(1);
  });

  it('clears history for a specific surah', () => {
    service.record(2, 'Al-Baqarah', 'আল-বাকারা', 45, 286, 'read');
    expect(service.getHistory(2)).not.toBeNull();

    service.clearSurah(2);
    expect(service.getHistory(2)).toBeNull();
  });

  it('clears all history', () => {
    service.record(1, 'Al-Fatihah', 'আল-ফাতিহা', 3, 7, 'read');
    service.record(2, 'Al-Baqarah', 'আল-বাকারা', 10, 286, 'read');
    expect(service.count()).toBe(2);

    service.clearAll();
    expect(service.count()).toBe(0);
    expect(service.hasHistory()).toBe(false);
  });
});
