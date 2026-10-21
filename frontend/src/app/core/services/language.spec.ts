import { TestBed } from '@angular/core/testing';
import { LanguageService, TRANSLATIONS } from './language';
import { STORAGE_KEYS } from './storage';

describe('LanguageService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  const create = () => {
    TestBed.configureTestingModule({});
    return TestBed.inject(LanguageService);
  };

  it('defaults to Bangla when no preference is stored', () => {
    const service = create();
    expect(service.language()).toBe('bn');
    expect(service.isBn()).toBe(true);
    expect(document.documentElement.lang).toBe('bn');
  });

  it('restores English when stored in localStorage', () => {
    localStorage.setItem('alquran.' + STORAGE_KEYS.language, JSON.stringify('en'));
    const service = create();
    expect(service.language()).toBe('en');
    expect(service.isBn()).toBe(false);
  });

  it('toggles language back and forth and saves to storage', () => {
    const service = create();
    expect(service.language()).toBe('bn');

    service.toggleLanguage();
    expect(service.language()).toBe('en');
    expect(service.isBn()).toBe(false);
    expect(localStorage.getItem('alquran.' + STORAGE_KEYS.language)).toBe(JSON.stringify('en'));

    service.toggleLanguage();
    expect(service.language()).toBe('bn');
    expect(service.isBn()).toBe(true);
    expect(localStorage.getItem('alquran.' + STORAGE_KEYS.language)).toBe(JSON.stringify('bn'));
  });

  it('sets language directly and updates document.documentElement.lang', () => {
    const service = create();
    service.setLanguage('bn');
    expect(service.language()).toBe('bn');
    expect(document.documentElement.lang).toBe('bn');

    service.setLanguage('en');
    expect(service.language()).toBe('en');
    expect(document.documentElement.lang).toBe('en');
  });

  it('translates authentic Islamic terminology accurately', () => {
    const service = create();
    expect(service.translate('nav.prayer')).toBe('নামাজের সময়সূচি');
    expect(service.translate('prayer.currentPrayer')).toBe('বর্তমান ওয়াক্ত');

    service.setLanguage('en');
    expect(service.translate('nav.prayer')).toBe('Prayer Times');
    expect(service.translate('prayer.currentPrayer')).toBe('Current Prayer');

    service.setLanguage('bn');
    expect(service.translate('nav.prayer')).toBe('নামাজের সময়সূচি');
    expect(service.translate('prayer.currentPrayer')).toBe('বর্তমান ওয়াক্ত');
    expect(service.translate('reader.meccan')).toBe('মাক্কী');
    expect(service.translate('reader.medinan')).toBe('মাদানী');
    expect(service.translate('prayer.shafi')).toBe('শাফেঈ (প্রমিত)');
    expect(service.translate('prayer.hanafi')).toBe('হানাফী');
  });
});
