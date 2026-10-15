import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Surah } from '../models/quran';
import { QuranApiService } from './quran-api';

const surah = (number: number, englishName: string): Surah => ({
  number,
  arabicName: 'سُورَةُ',
  englishName,
  englishMeaning: 'Meaning',
  banglaName: 'বাংলা',
  banglaMeaning: 'অর্থ',
  ayahCount: 7,
  revelationType: 'Meccan',
  hasBismillah: false,
});

describe('QuranApiService', () => {
  let service: QuranApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(QuranApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('requests the surah list from the backend', () => {
    let received: readonly Surah[] | undefined;
    service.getSurahs().subscribe((value) => (received = value));

    const request = http.expectOne('/api/quran/surahs');
    expect(request.request.method).toBe('GET');
    request.flush([surah(1, 'Al-Fatihah')]);

    expect(received?.length).toBe(1);
  });

  it('caches the surah list so a second subscriber makes no second request', () => {
    service.getSurahs().subscribe();
    http.expectOne('/api/quran/surahs').flush([surah(1, 'Al-Fatihah')]);

    let second: readonly Surah[] | undefined;
    service.getSurahs().subscribe((value) => (second = value));

    // No new request: expectNone throws if one was made.
    http.expectNone('/api/quran/surahs');
    expect(second?.length).toBe(1);
  });

  it('does not cache a failure, so Retry actually retries', () => {
    let firstError: unknown;
    service.getSurahs().subscribe({ error: (error) => (firstError = error) });
    http.expectOne('/api/quran/surahs').flush('boom', { status: 502, statusText: 'Bad Gateway' });
    expect(firstError).toBeTruthy();

    // The retry must reach the network again rather than replaying the error.
    let retried: readonly Surah[] | undefined;
    service.getSurahs().subscribe((value) => (retried = value));
    http.expectOne('/api/quran/surahs').flush([surah(1, 'Al-Fatihah')]);

    expect(retried?.length).toBe(1);
  });

  it('caches the juz list separately from the surah list', () => {
    service.getJuzList().subscribe();
    http.expectOne('/api/quran/juz').flush([]);

    service.getJuzList().subscribe();
    http.expectNone('/api/quran/juz');
  });

  it('sends the requested translations and reciter as query parameters', () => {
    service.getSurah(18, ['bn.bengali', 'en.sahih'], 'ar.husary').subscribe();

    const request = http.expectOne(
      (candidate) => candidate.url === '/api/quran/surahs/18',
    );

    expect(request.request.params.get('translations')).toBe('bn.bengali,en.sahih');
    expect(request.request.params.get('reciter')).toBe('ar.husary');
    request.flush({});
  });

  it('omits an empty reciter rather than sending "undefined"', () => {
    service.getSurah(1).subscribe();

    const request = http.expectOne((candidate) => candidate.url === '/api/quran/surahs/1');
    expect(request.request.params.has('reciter')).toBe(false);
    expect(request.request.params.get('translations')).toBe('bn.bengali');
    request.flush({});
  });
});
