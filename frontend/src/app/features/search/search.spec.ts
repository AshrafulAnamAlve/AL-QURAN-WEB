import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { SearchResponse } from '../../core/models/quran';
import { QuranApiService } from '../../core/services/quran-api';
import { SearchPage } from './search';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const mockResponse: SearchResponse = {
  query: 'kursi',
  edition: 'bn.bengali',
  totalMatches: 1,
  matches: [
    {
      surahNumber: 2,
      surahEnglishName: 'Al-Baqarah',
      surahBanglaName: 'আল-বাকারা',
      numberInSurah: 255,
      globalNumber: 262,
      text: 'আল্লাহ ছাড়া কোন উপাস্য নেই, তিনি চিরঞ্জীব...',
      edition: 'bn.bengali',
      language: 'bn',
    },
  ],
  directReference: {
    surahNumber: 2,
    ayahNumber: 255,
    surahEnglishName: 'Al-Baqarah',
  },
  surahMatches: [
    {
      number: 2,
      englishName: 'Al-Baqarah',
      banglaName: 'আল-বাকারা',
    },
  ],
};

describe('SearchPage', () => {
  let fixture: ComponentFixture<SearchPage>;
  let component: SearchPage;
  let quranApi: { search: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    quranApi = {
      search: vi.fn().mockReturnValue(of(mockResponse)),
    };

    await TestBed.configureTestingModule({
      imports: [SearchPage],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: QuranApiService, useValue: quranApi },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders search tips when query is empty', () => {
    expect(component.isIdle()).toBe(true);
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Search tips');
    expect(el.textContent).toContain('Direct verse references');
  });

  it('calls search API after debounce and renders results', async () => {
    component.query.set('kursi');
    fixture.detectChanges();
    await delay(450);
    fixture.detectChanges();

    expect(quranApi.search).toHaveBeenCalledWith('kursi', { edition: 'bn.bengali', limit: 40 });
    expect(component.matches().length).toBe(1);

    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Direct Reference');
    expect(el.textContent).toContain('Al-Baqarah');
    expect(el.textContent).toContain('2:255');
    expect(el.textContent).toContain('আল্লাহ ছাড়া কোন উপাস্য নেই');
  });

  it('shows empty state when no results match', async () => {
    quranApi.search.mockReturnValue(
      of({
        query: 'zzzz',
        edition: 'bn.bengali',
        totalMatches: 0,
        matches: [],
        directReference: null,
        surahMatches: [],
      }),
    );

    component.query.set('zzzz');
    fixture.detectChanges();
    await delay(450);
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('No results found');
  });

  it('shows error state on search failure and allows retry', async () => {
    quranApi.search.mockReturnValue(throwError(() => new Error('Network error')));

    component.query.set('error');
    fixture.detectChanges();
    await delay(450);
    fixture.detectChanges();

    expect(component.hasError()).toBe(true);
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Search failed');

    // Test retry
    quranApi.search.mockReturnValue(of(mockResponse));
    component.retry();
    await delay(450);
    fixture.detectChanges();

    expect(component.hasError()).toBe(false);
  });
});
