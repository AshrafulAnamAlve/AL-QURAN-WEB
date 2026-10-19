import { TestBed } from '@angular/core/testing';
import { QuranPronunciationService } from './quran-pronunciation';

describe('QuranPronunciationService', () => {
  let service: QuranPronunciationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuranPronunciationService);
  });

  it('provides authentic canonical pronunciation for Surah Al-Fatihah', () => {
    expect(service.getPronunciation(1, 1)).toBe('বিসমিল্লাহির রাহমানির রাহিম');
    expect(service.getPronunciation(1, 2)).toBe("আলহামদু লিল্লাহি রাব্বিল আ'লামীন");
    expect(service.getPronunciation(1, 3)).toBe('আর-রাহমানির রাহিম');
    expect(service.getPronunciation(1, 4)).toBe('মালিকি ইয়াওমিদ্দীন');
    expect(service.getPronunciation(1, 5)).toBe("ইয়্যাকা না'বুদু ওয়া ইয়্যাকা নাসতাঈন");
    expect(service.getPronunciation(1, 6)).toBe('ইহদিনাস সিরাতাল মুসতাকীম');
    expect(service.getPronunciation(1, 7)).toContain('সিরাতাল্লাযীনা');
  });

  it('provides canonical pronunciation for Surah Al-Ikhlas', () => {
    expect(service.getPronunciation(112, 1)).toBe('কুল হুওয়াল্লাহু আহাদ');
    expect(service.getPronunciation(112, 2)).toBe('আল্লাহুস সামাদ');
    expect(service.getPronunciation(112, 3)).toBe('লাম ইয়ালিদ ওয়া লাম ইউলাদ');
    expect(service.getPronunciation(112, 4)).toBe('ওয়া লাম ইয়াকুল্লাহু কুফুওয়ান আহাদ');
  });

  it('provides canonical pronunciation for Surah Al-Falaq and An-Nas', () => {
    expect(service.getPronunciation(113, 1)).toBe('কুল আউযু বিরাব্বিল ফালাক');
    expect(service.getPronunciation(114, 1)).toBe('কুল আউযু বিরাব্বিন নাস');
    expect(service.getPronunciation(114, 6)).toBe('মিনাল জিন্নাতি ওয়ান নাস');
  });

  it('provides Ayatul Kursi pronunciation', () => {
    const kursi = service.getPronunciation(2, 255);
    expect(kursi).toContain('আল্লাহু লা ইলাহা ইল্লা হুওয়াল হাইয়্যুল ক্বাইয়্যুম');
    expect(kursi).toContain("ওয়াহুওয়াল 'আলিয়্যুল 'আজীম");
  });

  it('returns Bismillah pronunciation', () => {
    expect(service.getBismillahPronunciation()).toBe('বিসমিল্লাহির রাহমানির রাহিম');
  });

  it('identifies whether an ayah has a verified canonical entry', () => {
    expect(service.hasCanonical(1, 1)).toBe(true);
    expect(service.hasCanonical(114, 1)).toBe(true);
    expect(service.hasCanonical(2, 1)).toBe(false);
  });

  it('transliterates general Arabic Quranic text dynamically', () => {
    const arabic = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';
    const result = service.transliterate(arabic);
    expect(result).toBe('বিসমিল্লাহির রাহমানির রাহিম');
  });
});
