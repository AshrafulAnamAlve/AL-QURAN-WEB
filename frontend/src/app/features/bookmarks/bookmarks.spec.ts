import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BookmarkService } from '../../core/services/bookmarks';
import { BookmarksPage } from './bookmarks';

describe('BookmarksPage', () => {
  let fixture: ComponentFixture<BookmarksPage>;
  let component: BookmarksPage;
  let bookmarkService: BookmarkService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [BookmarksPage],
      providers: [provideRouter([])],
    }).compileComponents();

    bookmarkService = TestBed.inject(BookmarkService);
    fixture = TestBed.createComponent(BookmarksPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders empty state when there are no bookmarks', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('No saved bookmarks');
  });

  it('renders bookmark cards when bookmarks exist', () => {
    bookmarkService.add({
      globalNumber: 1,
      surahNumber: 1,
      ayahNumber: 1,
      surahEnglishName: 'Al-Fatihah',
      surahBanglaName: 'আল-ফাতিহা',
      arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
      translation: 'পরম করুণাময় অসীম দয়ালু আল্লাহর নামে',
      savedAt: new Date().toISOString(),
    });

    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Al-Fatihah');
    expect(el.textContent).toContain('1:1');
    expect(el.textContent).toContain('পরম করুণাময়');
  });

  it('filters bookmarks by query', () => {
    bookmarkService.add({
      globalNumber: 1,
      surahNumber: 1,
      ayahNumber: 1,
      surahEnglishName: 'Al-Fatihah',
      surahBanglaName: 'আল-ফাতিহা',
      arabic: 'بِسْمِ اللَّهِ',
      translation: 'আল্লাহর নামে',
      savedAt: new Date().toISOString(),
    });
    bookmarkService.add({
      globalNumber: 262,
      surahNumber: 2,
      ayahNumber: 255,
      surahEnglishName: 'Al-Baqarah',
      surahBanglaName: 'আল-বাকারা',
      arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ',
      translation: 'আল্লাহ ছাড়া কোন উপাস্য নেই',
      savedAt: new Date().toISOString(),
    });

    fixture.detectChanges();
    expect(component.filteredBookmarks().length).toBe(2);

    component.query.set('kursi');
    fixture.detectChanges();
    expect(component.filteredBookmarks().length).toBe(0);

    component.query.set('baqarah');
    fixture.detectChanges();
    expect(component.filteredBookmarks().length).toBe(1);
    expect(component.filteredBookmarks()[0].surahEnglishName).toBe('Al-Baqarah');
  });

  it('removes a bookmark when remove button is clicked', () => {
    bookmarkService.add({
      globalNumber: 1,
      surahNumber: 1,
      ayahNumber: 1,
      surahEnglishName: 'Al-Fatihah',
      surahBanglaName: 'আল-ফাতিহা',
      arabic: 'بِسْمِ اللَّهِ',
      translation: 'আল্লাহর নামে',
      savedAt: new Date().toISOString(),
    });

    fixture.detectChanges();
    expect(bookmarkService.count()).toBe(1);

    component.remove(1);
    fixture.detectChanges();

    expect(bookmarkService.count()).toBe(0);
    expect(fixture.nativeElement.textContent).toContain('No saved bookmarks');
  });
});
