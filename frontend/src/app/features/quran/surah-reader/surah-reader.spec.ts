import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Ayah, Surah, SurahDetail } from '../../../core/models/quran';
import { AudioPlayerService } from '../../../core/services/audio-player';
import { QuranApiService } from '../../../core/services/quran-api';
import { ReadingSettingsService } from '../../../core/services/reading-settings';
import { SurahHistoryService } from '../../../core/services/surah-history';
import { SurahReaderPage } from './surah-reader';

const BISMILLAH = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';

function makeAyah(surahNumber: number, numberInSurah: number): Ayah {
  return {
    globalNumber: surahNumber * 1000 + numberInSurah,
    numberInSurah,
    surahNumber,
    arabic: `آية ${numberInSurah}`,
    translations: [
      {
        edition: 'bn.bengali', language: 'bn', translator: 'খান',
        translatorEnglish: 'Khan', text: `বাংলা ${numberInSurah}`, direction: 'ltr',
      },
      {
        edition: 'en.sahih', language: 'en', translator: 'Saheeh',
        translatorEnglish: 'Saheeh', text: `English ${numberInSurah}`, direction: 'ltr',
      },
    ],
    juz: 1,
    page: 1,
    ruku: 1,
    hizbQuarter: 1,
    isSajda: numberInSurah === 3,
    audioUrl: `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${numberInSurah}.mp3`,
  };
}

function makeDetail(
  surahNumber: number,
  englishName: string,
  ayahCount: number,
  bismillah: string | null,
): SurahDetail {
  const surah: Surah = {
    number: surahNumber,
    arabicName: `سُورَةُ ${englishName}`,
    englishName,
    englishMeaning: 'Meaning',
    banglaName: 'বাংলা নাম',
    banglaMeaning: 'অর্থ',
    ayahCount,
    revelationType: 'Meccan',
    hasBismillah: bismillah !== null,
  };

  return {
    surah,
    ayahs: Array.from({ length: ayahCount }, (_, index) => makeAyah(surahNumber, index + 1)),
    previous: surahNumber > 1
      ? { number: surahNumber - 1, englishName: 'Previous', banglaName: 'আগের' }
      : null,
    next: surahNumber < 114
      ? { number: surahNumber + 1, englishName: 'Next', banglaName: 'পরের' }
      : null,
    bismillahArabic: bismillah,
  };
}

/** Lets the progressive renderer run: each frame appends another chunk. */
async function flushFrames(fixture: ComponentFixture<SurahReaderPage>, frames = 12): Promise<void> {
  for (let index = 0; index < frames; index++) {
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    fixture.detectChanges();
  }

  await fixture.whenStable();
  fixture.detectChanges();
}

async function setup(
  surahNumber: string,
  stub: Partial<QuranApiService>,
): Promise<ComponentFixture<SurahReaderPage>> {
  await TestBed.configureTestingModule({
    imports: [SurahReaderPage],
    providers: [
      provideZonelessChangeDetection(),
      provideRouter([]),
      { provide: QuranApiService, useValue: stub as QuranApiService },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(SurahReaderPage);
  fixture.componentRef.setInput('surahNumber', surahNumber);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  return fixture;
}

const ayahs = (fixture: ComponentFixture<SurahReaderPage>): Element[] =>
  Array.from(fixture.nativeElement.querySelectorAll('aq-ayah-view'));

describe('SurahReaderPage', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  it('renders the surah header', async () => {
    const fixture = await setup('1', { getSurah: () => of(makeDetail(1, 'Al-Fatihah', 7, null)) });
    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('Al-Fatihah');
    expect(text).toContain('Surah 1');
    expect(text).toContain('7 ayahs');
  });

  it('renders every ayah of a short surah', async () => {
    const fixture = await setup('1', { getSurah: () => of(makeDetail(1, 'Al-Fatihah', 7, null)) });
    expect(ayahs(fixture).length).toBe(7);
  });

  it('does not show a separate Bismillah for Al-Fatihah', async () => {
    const fixture = await setup('1', { getSurah: () => of(makeDetail(1, 'Al-Fatihah', 7, null)) });
    expect(fixture.nativeElement.querySelector('.reader__bismillah')).toBeNull();
  });

  it('shows the Bismillah for Al-Baqarah', async () => {
    const fixture = await setup('2', { getSurah: () => of(makeDetail(2, 'Al-Baqarah', 5, BISMILLAH)) });
    const element = fixture.nativeElement.querySelector('.reader__bismillah') as HTMLElement;

    expect(element).toBeTruthy();
    expect(element.textContent?.trim()).toBe(BISMILLAH);
  });

  it('does not show a Bismillah for At-Tawbah', async () => {
    const fixture = await setup('9', { getSurah: () => of(makeDetail(9, 'At-Tawbah', 5, null)) });
    expect(fixture.nativeElement.querySelector('.reader__bismillah')).toBeNull();
  });

  it('marks the Arabic as right-to-left Arabic text', async () => {
    const fixture = await setup('1', { getSurah: () => of(makeDetail(1, 'Al-Fatihah', 7, null)) });
    const arabic = fixture.nativeElement.querySelector('.ayah__arabic') as HTMLElement;

    expect(arabic.getAttribute('dir')).toBe('rtl');
    expect(arabic.getAttribute('lang')).toBe('ar');
  });

  it('renders long surahs progressively, then completes', async () => {
    const fixture = await setup('2', {
      getSurah: () => of(makeDetail(2, 'Al-Baqarah', 286, BISMILLAH)),
    });

    // The first paint is a small chunk, not all 286 ayahs.
    const initial = ayahs(fixture).length;
    expect(initial).toBeGreaterThan(0);
    expect(initial).toBeLessThan(286);

    await flushFrames(fixture);
    expect(ayahs(fixture).length).toBe(286);
  });

  it('links to the previous and next surah', async () => {
    const fixture = await setup('2', {
      getSurah: () => of(makeDetail(2, 'Al-Baqarah', 5, BISMILLAH)),
    });

    const links = Array.from(
      fixture.nativeElement.querySelectorAll('.reader__nav-link'),
    ) as HTMLAnchorElement[];

    expect(links.map((link) => link.getAttribute('href'))).toEqual(['/quran/1', '/quran/3']);
  });

  it('rejects a surah number outside 1-114 without calling the API', async () => {
    let called = false;
    const fixture = await setup('200', {
      getSurah: () => {
        called = true;
        return of(makeDetail(1, 'Al-Fatihah', 7, null));
      },
    });

    expect(called).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('Surah not found');
  });

  it('rejects a non-numeric surah parameter', async () => {
    const fixture = await setup('abc', {
      getSurah: () => of(makeDetail(1, 'Al-Fatihah', 7, null)),
    });

    expect(fixture.nativeElement.textContent).toContain('Surah not found');
  });

  it('shows an error state when the request fails', async () => {
    const fixture = await setup('1', {
      getSurah: () => throwError(() => ({
        code: 'upstream_unavailable',
        message: 'The Quran service is unavailable.',
        status: 502,
        retryable: true,
      })),
    });

    expect(fixture.nativeElement.querySelector('aq-error-state')).toBeTruthy();
    expect(ayahs(fixture).length).toBe(0);
  });

  it('shows only Bangla by default, and both when the mode changes', async () => {
    const fixture = await setup('1', {
      getSurah: () => of(makeDetail(1, 'Al-Fatihah', 3, null)),
    });

    expect(fixture.nativeElement.textContent).toContain('বাংলা 1');
    expect(fixture.nativeElement.textContent).not.toContain('English 1');

    TestBed.inject(ReadingSettingsService).setTranslationMode('both');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('বাংলা 1');
    expect(fixture.nativeElement.textContent).toContain('English 1');
  });

  it('hides every translation in Arabic-only mode, keeping the ayahs', async () => {
    const fixture = await setup('1', {
      getSurah: () => of(makeDetail(1, 'Al-Fatihah', 3, null)),
    });

    TestBed.inject(ReadingSettingsService).setTranslationMode('arabic');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('বাংলা 1');
    expect(fixture.nativeElement.textContent).not.toContain('English 1');
    expect(ayahs(fixture).length).toBe(3);
  });

  it('gives each ayah an id so #ayah-N deep links resolve', async () => {
    const fixture = await setup('1', {
      getSurah: () => of(makeDetail(1, 'Al-Fatihah', 7, null)),
    });

    expect(fixture.nativeElement.querySelector('#ayah-1')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('#ayah-7')).toBeTruthy();
  });

  it('flags a sajda ayah', async () => {
    const fixture = await setup('1', {
      getSurah: () => of(makeDetail(1, 'Al-Fatihah', 7, null)),
    });

    expect(fixture.nativeElement.textContent).toContain('Sajda');
  });

  it('shows resume prompt when returning to a surah with existing progress', async () => {
    localStorage.setItem(
      'alquran.surahHistory',
      JSON.stringify({
        1: {
          surahNumber: 1,
          surahEnglishName: 'Al-Fatihah',
          surahBanglaName: 'আল-ফাতিহা',
          lastAyahNumber: 5,
          totalAyahs: 7,
          lastMode: 'listen',
          updatedAt: new Date().toISOString(),
        },
      }),
    );

    const fixture = await setup('1', {
      getSurah: () => of(makeDetail(1, 'Al-Fatihah', 7, null)),
    });

    const modal = fixture.nativeElement.querySelector('.resume-dialog');
    expect(modal).not.toBeNull();
    expect(modal.textContent).toContain('5');

    // Click continue button
    const continueBtn = modal.querySelector('.aq-btn--primary') as HTMLButtonElement;
    expect(continueBtn).not.toBeNull();
    continueBtn.click();
    fixture.detectChanges();

    // Modal is dismissed
    expect(fixture.nativeElement.querySelector('.resume-dialog')).toBeNull();
  });

  it('renders a prominent audio play button and toggles playback', async () => {
    localStorage.clear();
    const playStub = vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(function (this: HTMLMediaElement) {
      this.dispatchEvent(new Event('playing'));
      return Promise.resolve();
    });

    const fixture = await setup('1', {
      getSurah: () => of(makeDetail(1, 'Al-Fatihah', 7, null)),
    });

    const playBtn = fixture.nativeElement.querySelector('.reader__listen-btn') as HTMLButtonElement;
    expect(playBtn).toBeTruthy();
    expect(playBtn.textContent?.trim()).toContain('Play');

    // Click play button
    playBtn.click();
    await fixture.whenStable();
    fixture.detectChanges();

    const audio = TestBed.inject(AudioPlayerService);
    expect(audio.current()?.surahNumber).toBe(1);
    expect(playBtn.textContent?.trim()).toContain('Pause');

    playStub.mockRestore();
  });
});
