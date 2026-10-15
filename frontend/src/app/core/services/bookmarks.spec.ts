import { TestBed } from '@angular/core/testing';
import { Bookmark } from '../models/bookmark';
import { BookmarkService } from './bookmarks';
import { STORAGE_KEYS, StorageService } from './storage';

const bookmark = (globalNumber: number, savedAt = '2026-09-05T10:00:00.000Z'): Bookmark => ({
  globalNumber,
  surahNumber: 2,
  ayahNumber: globalNumber - 7,
  surahEnglishName: 'Al-Baqarah',
  surahBanglaName: 'আল-বাকারা',
  arabic: 'ٱلْحَمْدُ لِلَّهِ',
  translation: 'সকল প্রশংসা আল্লাহর',
  savedAt,
});

describe('BookmarkService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  const create = () => {
    TestBed.configureTestingModule({});
    return TestBed.inject(BookmarkService);
  };

  it('starts empty', () => {
    expect(create().count()).toBe(0);
  });

  it('adds a bookmark and reports it as saved', () => {
    const service = create();
    service.add(bookmark(262));

    expect(service.count()).toBe(1);
    expect(service.has(262)).toBe(true);
    expect(service.has(263)).toBe(false);
  });

  it('toggles on and off, returning the new state', () => {
    const service = create();

    expect(service.toggle(bookmark(262))).toBe(true);
    expect(service.has(262)).toBe(true);

    expect(service.toggle(bookmark(262))).toBe(false);
    expect(service.has(262)).toBe(false);
  });

  it('never stores the same ayah twice', () => {
    const service = create();
    service.add(bookmark(262));
    service.add(bookmark(262));

    expect(service.count()).toBe(1);
  });

  it('lists the newest first', () => {
    const service = create();
    service.add(bookmark(10, '2026-01-01T00:00:00.000Z'));
    service.add(bookmark(20, '2026-06-01T00:00:00.000Z'));
    service.add(bookmark(30, '2026-03-01T00:00:00.000Z'));

    expect(service.bookmarks().map((item) => item.globalNumber)).toEqual([20, 30, 10]);
  });

  it('survives a reload', () => {
    const service = create();
    service.add(bookmark(262));
    TestBed.tick();

    TestBed.resetTestingModule();
    expect(create().has(262)).toBe(true);
  });

  it('ignores corrupt entries rather than failing to start', () => {
    TestBed.configureTestingModule({});
    TestBed.inject(StorageService).write(STORAGE_KEYS.bookmarks, [
      bookmark(262),
      { nonsense: true },
      null,
      'not an object',
    ]);
    TestBed.resetTestingModule();

    const service = create();
    expect(service.count()).toBe(1);
    expect(service.has(262)).toBe(true);
  });

  it('clears everything', () => {
    const service = create();
    service.add(bookmark(1));
    service.add(bookmark(2));

    service.clear();
    expect(service.count()).toBe(0);
  });
});
