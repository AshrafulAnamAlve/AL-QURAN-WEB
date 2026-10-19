import { TestBed } from '@angular/core/testing';
import { ShareService } from './share';

describe('ShareService', () => {
  let service: ShareService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShareService);
  });

  const content = {
    surahEnglishName: 'Al-Fatihah',
    surahNumber: 1,
    ayahNumber: 2,
    arabic: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ',
    translations: ['সকল প্রশংসা আল্লাহর, যিনি সকল জগতের প্রতিপালক।'],
  };

  it('formats an ayah with its reference, text and attribution', () => {
    const text = service.format(content);

    expect(text).toContain('Al-Fatihah — 1:2');
    expect(text).toContain(content.arabic);
    expect(text).toContain(content.translations[0]);
    expect(text).toContain('Al-Quran');
  });

  it('includes every translation that was passed', () => {
    const text = service.format({
      ...content,
      translations: ['Bangla text', 'English text'],
    });

    expect(text).toContain('Bangla text');
    expect(text).toContain('English text');
  });

  it('leaves no blank gaps when there is no translation', () => {
    const text = service.format({ ...content, translations: [] });

    expect(text).not.toMatch(/\n\n\n/);
    expect(text).toContain('Al-Fatihah — 1:2');
  });

  it('builds a deep link to the exact ayah', () => {
    expect(service.buildUrl(18, 10)).toContain('/quran/18#ayah-10');
  });

  it('formats an ayah with pronunciation when provided', () => {
    const text = service.format({
      ...content,
      pronunciation: "আলহামদু লিল্লাহি রাব্বিল আ'লামীন",
    });

    expect(text).toContain("উচ্চারণ: আলহামদু লিল্লাহি রাব্বিল আ'লামীন");
    expect(text).toContain(content.arabic);
    expect(text).toContain(content.translations[0]);
  });
});
