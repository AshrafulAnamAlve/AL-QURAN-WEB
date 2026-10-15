import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { DEFAULT_RECITER, Reciter } from '../models/quran';
import { ReciterService, reciterLabel } from './reciter';
import { STORAGE_KEYS, StorageService } from './storage';

const husary: Reciter = {
  identifier: 'ar.husary',
  name: 'محمود خليل الحصري',
  englishName: 'Mahmoud Khalil Al-Husary',
  style: '',
  bitrate: 128,
};

const husaryMujawwad: Reciter = { ...husary, identifier: 'ar.husarymujawwad', style: 'Mujawwad' };

describe('ReciterService', () => {
  let service: ReciterService;
  let http: HttpTestingController;

  const create = () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(ReciterService);
    http = TestBed.inject(HttpTestingController);
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
    create();
  });

  it('starts on the default reciter, matching the backend default', () => {
    expect(service.selected().identifier).toBe(DEFAULT_RECITER.identifier);
    expect(service.selected().bitrate).toBe(128);
  });

  it('offers the current reciter as the only option until the list loads', () => {
    expect(service.options()).toEqual([DEFAULT_RECITER]);
    expect(service.status()).toBe('idle');
  });

  it('fetches nothing until the picker asks for the list', () => {
    http.expectNone('/api/quran/reciters');
  });

  it('persists a selection and restores it in a new instance', () => {
    service.select(husary);
    TestBed.tick();

    TestBed.resetTestingModule();
    create();

    expect(service.selected().identifier).toBe('ar.husary');
    expect(service.selected().bitrate).toBe(128);
  });

  it('falls back to the default when the stored reciter has no bitrate', () => {
    // A value written by an older build could not build a working URL.
    TestBed.inject(StorageService).write(STORAGE_KEYS.reciter, {
      identifier: 'ar.husary',
      englishName: 'Mahmoud Khalil Al-Husary',
    });

    TestBed.resetTestingModule();
    create();

    expect(service.selected()).toEqual(DEFAULT_RECITER);
  });

  it('loads the list once and refreshes the stored copy from it', () => {
    service.select({ ...husary, englishName: 'Stale name', bitrate: 999 });
    service.loadList();

    http.expectOne('/api/quran/reciters').flush([DEFAULT_RECITER, husary, husaryMujawwad]);

    expect(service.status()).toBe('ready');
    expect(service.options().length).toBe(3);
    // The server's copy wins over whatever was on the device.
    expect(service.selected().englishName).toBe('Mahmoud Khalil Al-Husary');
    expect(service.selected().bitrate).toBe(128);

    service.loadList();
    http.expectNone('/api/quran/reciters');
  });

  it('reports a failed list and allows a retry', () => {
    service.loadList();
    http.expectOne('/api/quran/reciters').error(new ProgressEvent('error'));

    expect(service.status()).toBe('failed');
    // The player still works: the stored reciter is still selectable.
    expect(service.options()).toEqual([DEFAULT_RECITER]);

    service.loadList();
    http.expectOne('/api/quran/reciters').flush([DEFAULT_RECITER]);
    expect(service.status()).toBe('ready');
  });

  it('treats an empty list as a failure rather than emptying the picker', () => {
    service.loadList();
    http.expectOne('/api/quran/reciters').flush([]);

    expect(service.status()).toBe('failed');
    expect(service.options()).toEqual([DEFAULT_RECITER]);
  });

  it('ignores an identifier that is not in the list', () => {
    service.selectById('ar.notareciter');
    expect(service.selected().identifier).toBe(DEFAULT_RECITER.identifier);
  });

  it('selects by identifier once the list is loaded', () => {
    service.loadList();
    http.expectOne('/api/quran/reciters').flush([DEFAULT_RECITER, husary]);

    service.selectById('ar.husary');
    expect(service.selected().identifier).toBe('ar.husary');
  });

  it('names a reciter with their style only when there is one', () => {
    expect(reciterLabel(husary)).toBe('Mahmoud Khalil Al-Husary');
    expect(reciterLabel(husaryMujawwad)).toBe('Mahmoud Khalil Al-Husary (Mujawwad)');
  });
});
