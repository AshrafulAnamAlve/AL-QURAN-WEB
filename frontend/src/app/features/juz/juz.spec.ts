import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Juz } from '../../core/models/quran';
import { QuranApiService } from '../../core/services/quran-api';
import { JuzPage } from './juz';

const JUZ: Juz[] = Array.from({ length: 30 }, (_, index) => ({
  number: index + 1,
  startSurahNumber: index + 1,
  startSurahName: `Surah ${index + 1}`,
  startSurahBanglaName: 'সূরা',
  startAyah: 1,
  endSurahNumber: index + 2,
  endSurahName: `Surah ${index + 2}`,
  endAyah: 10,
  ayahCount: 200,
}));

async function setup(stub: Partial<QuranApiService>): Promise<ComponentFixture<JuzPage>> {
  await TestBed.configureTestingModule({
    imports: [JuzPage],
    providers: [
      provideZonelessChangeDetection(),
      provideRouter([]),
      { provide: QuranApiService, useValue: stub as QuranApiService },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(JuzPage);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  return fixture;
}

describe('JuzPage', () => {
  it('renders all 30 juz', async () => {
    const fixture = await setup({ getJuzList: () => of(JUZ) });
    expect(fixture.nativeElement.querySelectorAll('aq-juz-card').length).toBe(30);
  });

  it('links each juz to its reading route', async () => {
    const fixture = await setup({ getJuzList: () => of(JUZ) });
    const first = fixture.nativeElement.querySelector('aq-juz-card a') as HTMLAnchorElement;
    expect(first.getAttribute('href')).toBe('/juz/1');
  });

  it('gives each card a single spoken label', async () => {
    const fixture = await setup({ getJuzList: () => of(JUZ) });
    const first = fixture.nativeElement.querySelector('aq-juz-card a') as HTMLAnchorElement;
    expect(first.getAttribute('aria-label')).toContain('Juz 1');
    expect(first.getAttribute('aria-label')).toContain('200 ayahs');
  });

  it('shows an error state when the request fails', async () => {
    const fixture = await setup({
      getJuzList: () => throwError(() => ({
        code: 'offline',
        message: 'You appear to be offline.',
        status: 0,
        retryable: true,
      })),
    });

    expect(fixture.nativeElement.querySelector('aq-error-state')).toBeTruthy();
    expect(fixture.nativeElement.querySelectorAll('aq-juz-card').length).toBe(0);
  });
});
