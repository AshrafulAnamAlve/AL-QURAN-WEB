import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Surah } from '../../core/models/quran';
import { QuranApiService } from '../../core/services/quran-api';
import { QuranPage } from './quran';

const make = (
  number: number,
  englishName: string,
  englishMeaning: string,
  banglaName: string,
  banglaMeaning: string,
): Surah => ({
  number,
  arabicName: `سُورَةُ ${englishName}`,
  englishName,
  englishMeaning,
  banglaName,
  banglaMeaning,
  ayahCount: number * 7,
  revelationType: number % 2 === 0 ? 'Medinan' : 'Meccan',
  hasBismillah: number !== 1 && number !== 9,
});

const SURAHS: Surah[] = [
  make(1, 'Al-Fatihah', 'The Opening', 'আল-ফাতিহা', 'সূচনা'),
  make(2, 'Al-Baqarah', 'The Cow', 'আল-বাকারা', 'বকনা-বাছুর'),
  make(18, 'Al-Kahf', 'The Cave', 'আল-কাহফ', 'গুহা'),
  make(114, 'An-Nas', 'Mankind', 'আন-নাস', 'মানুষ জাতি'),
];

function cards(fixture: ComponentFixture<QuranPage>): Element[] {
  return Array.from(fixture.nativeElement.querySelectorAll('aq-surah-card'));
}

async function setup(stub: Partial<QuranApiService>): Promise<ComponentFixture<QuranPage>> {
  await TestBed.configureTestingModule({
    imports: [QuranPage],
    providers: [
      provideZonelessChangeDetection(),
      provideRouter([]),
      { provide: QuranApiService, useValue: stub as QuranApiService },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(QuranPage);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  return fixture;
}

describe('QuranPage', () => {
  it('renders a card for every surah returned', async () => {
    const fixture = await setup({ getSurahs: () => of(SURAHS) });
    expect(cards(fixture).length).toBe(SURAHS.length);
  });

  it('shows how many surahs are listed', async () => {
    const fixture = await setup({ getSurahs: () => of(SURAHS) });
    const count = fixture.nativeElement.querySelector('#surah-count') as HTMLElement;
    expect(count.textContent?.trim()).toContain('4 surahs');
  });

  it('filters by English name', async () => {
    const fixture = await setup({ getSurahs: () => of(SURAHS) });
    fixture.componentInstance['filter'].set('kahf');
    fixture.detectChanges();

    const rendered = cards(fixture);
    expect(rendered.length).toBe(1);
    expect(rendered[0].textContent).toContain('Al-Kahf');
  });

  it('filters by English meaning', async () => {
    const fixture = await setup({ getSurahs: () => of(SURAHS) });
    fixture.componentInstance['filter'].set('cave');
    fixture.detectChanges();
    expect(cards(fixture).length).toBe(1);
  });

  it('filters by Bangla name', async () => {
    const fixture = await setup({ getSurahs: () => of(SURAHS) });
    fixture.componentInstance['filter'].set('কাহফ');
    fixture.detectChanges();

    const rendered = cards(fixture);
    expect(rendered.length).toBe(1);
    expect(rendered[0].textContent).toContain('আল-কাহফ');
  });

  it('filters by Bangla meaning', async () => {
    const fixture = await setup({ getSurahs: () => of(SURAHS) });
    fixture.componentInstance['filter'].set('গুহা');
    fixture.detectChanges();
    expect(cards(fixture).length).toBe(1);
  });

  it('filters by surah number, matching exactly rather than by substring', async () => {
    const fixture = await setup({ getSurahs: () => of(SURAHS) });
    fixture.componentInstance['filter'].set('1');
    fixture.detectChanges();

    // "1" must match surah 1 only - not 18 and 114, which merely contain a 1.
    const rendered = cards(fixture);
    expect(rendered.length).toBe(1);
    expect(rendered[0].textContent).toContain('Al-Fatihah');
  });

  it('is case insensitive', async () => {
    const fixture = await setup({ getSurahs: () => of(SURAHS) });
    fixture.componentInstance['filter'].set('AL-KAHF');
    fixture.detectChanges();
    expect(cards(fixture).length).toBe(1);
  });

  it('ignores punctuation and spacing, so "al fatihah" finds Al-Fatihah', async () => {
    const fixture = await setup({ getSurahs: () => of(SURAHS) });
    fixture.componentInstance['filter'].set('al fatihah');
    fixture.detectChanges();

    const rendered = cards(fixture);
    expect(rendered.length).toBe(1);
    expect(rendered[0].textContent).toContain('Al-Fatihah');
  });

  it('matches a name written with an apostrophe when typed without one', async () => {
    const withApostrophe = [make(3, "Ali 'Imran", 'Family of Imran', 'আলে-ইমরান', 'ইমরানের পরিবার')];
    const fixture = await setup({ getSurahs: () => of(withApostrophe) });

    fixture.componentInstance['filter'].set('ali imran');
    fixture.detectChanges();
    expect(cards(fixture).length).toBe(1);
  });

  it('shows an empty state when nothing matches', async () => {
    const fixture = await setup({ getSurahs: () => of(SURAHS) });
    fixture.componentInstance['filter'].set('zzzz');
    fixture.detectChanges();

    expect(cards(fixture).length).toBe(0);
    expect(fixture.nativeElement.querySelector('aq-empty-state')).toBeTruthy();
  });

  it('shows an error state with a retry when the request fails', async () => {
    const fixture = await setup({
      getSurahs: () => throwError(() => ({
        code: 'upstream_unavailable',
        message: 'The Quran service is unavailable.',
        status: 502,
        retryable: true,
      })),
    });

    const errorState = fixture.nativeElement.querySelector('aq-error-state');
    expect(errorState).toBeTruthy();
    expect(errorState.textContent).toContain('The Quran service is unavailable.');
    expect(cards(fixture).length).toBe(0);
  });

  it('re-requests when retry is pressed', async () => {
    let calls = 0;
    const fixture = await setup({
      getSurahs: () => {
        calls += 1;
        return calls === 1
          ? throwError(() => ({ code: 'offline', message: 'Offline', status: 0, retryable: true }))
          : of(SURAHS);
      },
    });

    expect(calls).toBe(1);
    fixture.componentInstance.retry();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(calls).toBe(2);
    expect(cards(fixture).length).toBe(SURAHS.length);
  });
});
