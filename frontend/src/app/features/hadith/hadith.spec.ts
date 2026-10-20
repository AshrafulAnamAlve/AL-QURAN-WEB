import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HadithService } from '../../core/services/hadith';
import { LanguageService } from '../../core/services/language';
import { ShareService } from '../../core/services/share';
import { StorageService } from '../../core/services/storage';
import { HadithPage } from './hadith';

describe('HadithPage', () => {
  let fixture: ComponentFixture<HadithPage>;
  let component: HadithPage;
  let hadithService: HadithService;
  let shareService: ShareService;

  beforeEach(async () => {
    localStorage.clear();

    const shareMock = {
      copy: vi.fn().mockResolvedValue(true),
    };

    await TestBed.configureTestingModule({
      imports: [HadithPage],
      providers: [
        provideRouter([]),
        HadithService,
        LanguageService,
        StorageService,
        { provide: ShareService, useValue: shareMock },
      ],
    }).compileComponents();

    hadithService = TestBed.inject(HadithService);
    shareService = TestBed.inject(ShareService);
    const lang = TestBed.inject(LanguageService);
    lang.setLanguage('bn');

    fixture = TestBed.createComponent(HadithPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders page header with titles and breadcrumbs', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('হাদিস শরীফ');
    expect(el.textContent).toContain('الحديث النبوي');
  });

  it('renders daily featured hadith card when search is empty', () => {
    const el: HTMLElement = fixture.nativeElement;
    const heroCard = el.querySelector('.daily-hero-card');
    expect(heroCard).not.toBeNull();
    expect(heroCard?.textContent).toContain('আজকের নির্বাচিত হাদিস');
  });

  it('renders category filter chips and switches category', () => {
    const el: HTMLElement = fixture.nativeElement;
    const chips = el.querySelectorAll('.chip[role="tab"]');
    expect(chips.length).toBeGreaterThan(5);

    // Select 'salah' category
    component.selectCategory('salah');
    fixture.detectChanges();

    expect(component.selectedCategory()).toBe('salah');
    const list = component.displayedHadiths();
    expect(list.every((h) => h.category === 'salah')).toBe(true);
  });

  it('filters hadiths based on search query', () => {
    const event = { target: { value: 'নিয়ত' } } as unknown as Event;
    component.onSearchChange(event);
    fixture.detectChanges();

    expect(component.searchInput()).toBe('নিয়ত');
    expect(component.displayedHadiths().length).toBeGreaterThan(0);
    expect(component.displayedHadiths().some((h) => h.bangla.includes('নিয়ত'))).toBe(true);

    // Daily hero card should be hidden when search is active
    expect(fixture.nativeElement.querySelector('.daily-hero-card')).toBeNull();

    // Clear search
    component.clearSearch();
    fixture.detectChanges();
    expect(component.searchInput()).toBe('');
    expect(fixture.nativeElement.querySelector('.daily-hero-card')).not.toBeNull();
  });

  it('allows toggling bookmarks and filtering bookmarked hadiths', () => {
    const firstHadithId = component.displayedHadiths()[0].id;
    component.toggleBookmark(firstHadithId);
    fixture.detectChanges();

    expect(hadithService.isBookmarked(firstHadithId)).toBe(true);
    expect(component.bookmarksCount()).toBe(1);

    // Toggle bookmarks-only filter
    component.toggleBookmarksFilter();
    fixture.detectChanges();

    expect(component.showBookmarksOnly()).toBe(true);
    expect(component.displayedHadiths().length).toBe(1);
    expect(component.displayedHadiths()[0].id).toBe(firstHadithId);
  });

  it('shows empty state when no hadiths match filters and allows reset', () => {
    const event = { target: { value: 'xyznonexistentquery999' } } as unknown as Event;
    component.onSearchChange(event);
    fixture.detectChanges();

    expect(component.displayedHadiths().length).toBe(0);
    const emptyState = fixture.nativeElement.querySelector('.empty-state');
    expect(emptyState).not.toBeNull();

    component.resetFilters();
    fixture.detectChanges();
    expect(component.displayedHadiths().length).toBe(hadithService.allHadiths().length);
  });

  it('copies hadith to clipboard and shows toast', async () => {
    const hadith = component.displayedHadiths()[0];
    await component.copyHadith(hadith);
    expect(shareService.copy).toHaveBeenCalled();
    expect(component.toastMessage()).toContain('অনুলিপি করা হয়েছে');
  });

  it('switches between curated and canonical library tabs', () => {
    expect(component.activeTab()).toBe('curated');

    // Switch to library
    component.switchTab('library');
    fixture.detectChanges();

    expect(component.activeTab()).toBe('library');
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.canonical-library')).not.toBeNull();
    expect(el.querySelectorAll('.book-pill').length).toBe(8);

    // Switch back to curated
    component.switchTab('curated');
    fixture.detectChanges();
    expect(component.activeTab()).toBe('curated');
    expect(el.querySelector('.daily-hero-card')).not.toBeNull();
  });

  it('allows marking hadith as read and hides read hadiths when unread filter is active', () => {
    const totalHadiths = component.displayedHadiths().length;
    const firstHadithId = component.displayedHadiths()[0].id;

    expect(component.isRead(firstHadithId)).toBe(false);
    expect(component.readCount()).toBe(0);

    // Mark as read
    component.toggleRead(firstHadithId);
    fixture.detectChanges();

    expect(component.isRead(firstHadithId)).toBe(true);
    expect(component.readCount()).toBe(1);

    // Toggle unread filter ON
    component.toggleUnreadFilter();
    fixture.detectChanges();

    expect(component.showUnreadOnly()).toBe(true);
    expect(component.displayedHadiths().length).toBe(totalHadiths - 1);
    expect(component.displayedHadiths().some((h) => h.id === firstHadithId)).toBe(false);

    // Toggle unread filter OFF
    component.toggleUnreadFilter();
    fixture.detectChanges();
    expect(component.displayedHadiths().length).toBe(totalHadiths);
  });
});

