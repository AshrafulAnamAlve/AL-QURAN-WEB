import { TestBed } from '@angular/core/testing';
import { ReadingPositionService } from './reading-position';

describe('ReadingPositionService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  const create = () => {
    TestBed.configureTestingModule({});
    return TestBed.inject(ReadingPositionService);
  };

  it('starts null when no position is stored', () => {
    const service = create();
    expect(service.position()).toBeNull();
    expect(service.hasPosition()).toBe(false);
  });

  it('saves and remembers the last read position', () => {
    const service = create();
    service.save({
      surahNumber: 2,
      surahEnglishName: 'Al-Baqarah',
      surahBanglaName: 'আল-বাকারা',
      ayahNumber: 255,
    });

    TestBed.flushEffects();

    expect(service.hasPosition()).toBe(true);
    expect(service.position()?.surahNumber).toBe(2);
    expect(service.position()?.surahEnglishName).toBe('Al-Baqarah');
    expect(service.position()?.ayahNumber).toBe(255);
  });

  it('clears stored position', () => {
    const service = create();
    service.save({
      surahNumber: 1,
      surahEnglishName: 'Al-Fatihah',
      ayahNumber: 1,
    });
    TestBed.flushEffects();

    expect(service.hasPosition()).toBe(true);

    service.clear();
    TestBed.flushEffects();

    expect(service.hasPosition()).toBe(false);
    expect(service.position()).toBeNull();
  });

  it('restores position from localStorage on startup', () => {
    const first = create();
    first.save({
      surahNumber: 18,
      surahEnglishName: 'Al-Kahf',
      surahBanglaName: 'আল-কাহফ',
      ayahNumber: 10,
    });
    TestBed.flushEffects();

    TestBed.resetTestingModule();
    const second = create();

    expect(second.hasPosition()).toBe(true);
    expect(second.position()?.surahNumber).toBe(18);
    expect(second.position()?.ayahNumber).toBe(10);
  });
});
