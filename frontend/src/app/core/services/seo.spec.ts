import { TestBed } from '@angular/core/testing';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { SeoService } from './seo';

describe('SeoService', () => {
  let service: SeoService;
  let titleService: Title;
  let metaService: Meta;
  let doc: Document;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SeoService],
    });
    service = TestBed.inject(SeoService);
    titleService = TestBed.inject(Title);
    metaService = TestBed.inject(Meta);
    doc = TestBed.inject(DOCUMENT);
  });

  afterEach(() => {
    const script = doc.querySelector('script#schema-json-ld');
    if (script) script.remove();
  });

  it('applies title and meta tags correctly', () => {
    service.apply({
      title: 'Surah Al-Fatihah',
      description: 'Read Surah Al-Fatihah with Bangla translation and audio',
      path: '/quran/1',
    });

    expect(titleService.getTitle()).toContain('Surah Al-Fatihah');
    expect(metaService.getTag('name="description"')?.content).toBe(
      'Read Surah Al-Fatihah with Bangla translation and audio',
    );
    expect(metaService.getTag('property="og:title"')?.content).toContain('Surah Al-Fatihah');
    expect(metaService.getTag('name="robots"')?.content).toBe('index, follow');
  });

  it('sets noindex for pages that opt out', () => {
    service.apply({
      title: 'Search',
      noIndex: true,
    });
    expect(metaService.getTag('name="robots"')?.content).toBe('noindex, nofollow');
  });

  it('injects schema.org JSON-LD structured data', () => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Chapter',
      name: 'Al-Fatihah',
      position: 1,
    };

    service.setJsonLd(schema);

    const script = doc.querySelector<HTMLScriptElement>('script#schema-json-ld');
    expect(script).toBeTruthy();
    expect(script?.type).toBe('application/ld+json');
    expect(JSON.parse(script?.textContent || '{}')).toEqual(schema);
  });
});
