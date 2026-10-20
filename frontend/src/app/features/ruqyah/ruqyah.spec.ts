import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageService } from '../../core/services/language';
import { RuqyahService } from '../../core/services/ruqyah';
import { SeoService } from '../../core/services/seo';
import { ShareService } from '../../core/services/share';
import { StorageService } from '../../core/services/storage';
import { RuqyahPage } from './ruqyah';

describe('RuqyahPage', () => {
  let fixture: ComponentFixture<RuqyahPage>;
  let component: RuqyahPage;
  let ruqyahService: RuqyahService;
  let shareService: ShareService;

  beforeEach(async () => {
    localStorage.clear();

    const shareMock = {
      copy: vi.fn().mockResolvedValue(true),
    };

    await TestBed.configureTestingModule({
      imports: [RuqyahPage],
      providers: [
        provideRouter([]),
        RuqyahService,
        LanguageService,
        StorageService,
        SeoService,
        { provide: ShareService, useValue: shareMock },
      ],
    }).compileComponents();

    ruqyahService = TestBed.inject(RuqyahService);
    shareService = TestBed.inject(ShareService);
    const lang = TestBed.inject(LanguageService);
    lang.setLanguage('bn');

    fixture = TestBed.createComponent(RuqyahPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders page header and breadcrumbs', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('রুকইয়াহ আশ-শারইয়াহ');
    expect(el.textContent).toContain('الرُّقْيَةُ الشَّرْعِيَّةُ');
  });

  it('switches between reading, audio, and guide tabs', () => {
    expect(component.activeTab()).toBe('reading');

    component.setTab('audio');
    fixture.detectChanges();
    expect(component.activeTab()).toBe('audio');
    expect(fixture.nativeElement.querySelector('.audio-tracks-grid')).not.toBeNull();

    component.setTab('guide');
    fixture.detectChanges();
    expect(component.activeTab()).toBe('guide');
    expect(fixture.nativeElement.querySelector('.guide-cards-grid')).not.toBeNull();

    component.setTab('reading');
    fixture.detectChanges();
    expect(component.activeTab()).toBe('reading');
    expect(fixture.nativeElement.querySelector('.ruqyah-cards-grid')).not.toBeNull();
  });

  it('filters ruqyah verses by category', () => {
    component.selectCategory('shifa');
    fixture.detectChanges();

    expect(component.selectedCategory()).toBe('shifa');
    expect(component.filteredItems().every((i) => i.category === 'shifa')).toBe(true);
  });

  it('filters ruqyah verses by search query and allows clear', () => {
    const event = { target: { value: 'ফাতিহা' } } as unknown as Event;
    component.onSearchInput(event);
    fixture.detectChanges();

    expect(component.searchInput()).toBe('ফাতিহা');
    expect(component.filteredItems().length).toBeGreaterThan(0);

    component.clearSearch();
    fixture.detectChanges();
    expect(component.searchInput()).toBe('');
  });

  it('increments tap repetition counter on card click', () => {
    const firstItem = component.filteredItems()[0];
    const initialCount = component.getItemCount(firstItem.id);
    expect(initialCount).toBe(0);

    component.onCardTap(firstItem);
    fixture.detectChanges();

    expect(component.getItemCount(firstItem.id)).toBe(1);

    const dummyEvent = { stopPropagation: vi.fn() } as unknown as Event;
    component.resetCounter(dummyEvent, firstItem.id);
    fixture.detectChanges();

    expect(component.getItemCount(firstItem.id)).toBe(0);
  });

  it('toggles bookmarks and copies verse text', async () => {
    const firstItem = component.filteredItems()[0];
    const dummyEvent = { stopPropagation: vi.fn() } as unknown as Event;

    component.toggleBookmark(dummyEvent, firstItem.id);
    fixture.detectChanges();

    expect(ruqyahService.isBookmarked(firstItem.id)).toBe(true);

    component.copyItem(dummyEvent, firstItem);
    expect(shareService.copy).toHaveBeenCalled();
  });

  it('plays audio track and interacts with player controls', () => {
    const track = component.audioTracks[0];
    component.playTrack(track);
    fixture.detectChanges();

    expect(component.activeTrack()?.id).toBe(track.id);

    component.toggleLoop();
    expect(component.isLooping()).toBe(true);

    component.setSleepTimer(30);
    expect(component.sleepTimerMinutes()).toBe(30);
  });
});
