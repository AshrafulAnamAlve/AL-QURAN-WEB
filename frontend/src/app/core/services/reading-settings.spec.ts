import { TestBed } from '@angular/core/testing';
import { DEFAULT_READING_SETTINGS, READING_LIMITS } from '../models/reading-settings';
import { ReadingSettingsService } from './reading-settings';
import { STORAGE_KEYS, StorageService } from './storage';

describe('ReadingSettingsService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  const create = () => {
    TestBed.configureTestingModule({});
    return TestBed.inject(ReadingSettingsService);
  };

  it('starts from the defaults when nothing is stored', () => {
    const service = create();
    expect(service.arabicSize()).toBe(DEFAULT_READING_SETTINGS.arabicSize);
    expect(service.translationMode()).toBe('bangla');
  });

  it('writes the sizes to CSS custom properties', () => {
    const service = create();
    service.setArabicSize(2.5);
    TestBed.tick();

    expect(document.documentElement.style.getPropertyValue('--aq-arabic-size')).toBe('2.5rem');
  });

  it('clamps a value above the maximum', () => {
    const service = create();
    service.setArabicSize(99);
    expect(service.arabicSize()).toBe(READING_LIMITS.arabicSize.max);
  });

  it('clamps a value below the minimum, so Arabic never becomes unreadable', () => {
    const service = create();
    service.setArabicSize(0.1);
    expect(service.arabicSize()).toBe(READING_LIMITS.arabicSize.min);
  });

  it('persists a change and restores it in a new instance', () => {
    const service = create();
    service.setArabicSize(2.75);
    service.setTranslationMode('both');
    TestBed.tick();

    TestBed.resetTestingModule();
    const restored = create();

    expect(restored.arabicSize()).toBe(2.75);
    expect(restored.translationMode()).toBe('both');
  });

  it('repairs a stored value that is out of range', () => {
    TestBed.configureTestingModule({});
    TestBed.inject(StorageService).write(STORAGE_KEYS.settings, { arabicSize: 500 });
    TestBed.resetTestingModule();

    expect(create().arabicSize()).toBe(READING_LIMITS.arabicSize.max);
  });

  it('falls back to defaults when the stored value is not a number', () => {
    TestBed.configureTestingModule({});
    TestBed.inject(StorageService).write(STORAGE_KEYS.settings, { arabicSize: 'huge' });
    TestBed.resetTestingModule();

    expect(create().arabicSize()).toBe(DEFAULT_READING_SETTINGS.arabicSize);
  });

  it('derives which translations to show from the mode', () => {
    const service = create();

    service.setTranslationMode('bangla');
    expect(service.showsBangla()).toBe(true);
    expect(service.showsEnglish()).toBe(false);

    service.setTranslationMode('both');
    expect(service.showsBangla()).toBe(true);
    expect(service.showsEnglish()).toBe(true);

    service.setTranslationMode('arabic');
    expect(service.showsBangla()).toBe(false);
    expect(service.showsEnglish()).toBe(false);
  });

  it('resets the layout without discarding the translation choice', () => {
    const service = create();
    service.setTranslationMode('english');
    service.setArabicSize(3.5);

    service.resetLayout();

    expect(service.arabicSize()).toBe(DEFAULT_READING_SETTINGS.arabicSize);
    expect(service.translationMode()).toBe('english');
  });
});
