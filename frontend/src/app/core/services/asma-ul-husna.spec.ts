import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { AsmaUlHusnaService } from './asma-ul-husna';
import { STORAGE_KEYS, StorageService } from './storage';

describe('AsmaUlHusnaService', () => {
  let service: AsmaUlHusnaService;
  let storage: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AsmaUlHusnaService, StorageService],
    });

    storage = TestBed.inject(StorageService);
    storage.remove(STORAGE_KEYS.bookmarkedNames);
    service = TestBed.inject(AsmaUlHusnaService);
  });

  it('should initialize with all 99 names and the supreme name', () => {
    expect(service.allNames.length).toBe(99);
    expect(service.supremeName.number).toBe(0);
    expect(service.supremeName.transliteration).toBe('Allah');
    expect(service.allNames[0].number).toBe(1);
    expect(service.allNames[98].number).toBe(99);
  });

  it('should filter names by English transliteration and Bengali meaning', () => {
    service.setSearchQuery('Rahman');
    let results = service.filteredNames();
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].transliteration.toLowerCase()).toContain('rahman');

    service.setSearchQuery('করুণাময়');
    results = service.filteredNames();
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].meaningBn).toContain('করুণাময়');

    service.setSearchQuery('');
    expect(service.filteredNames().length).toBe(99);
  });

  it('should toggle and persist bookmarks', () => {
    expect(service.isBookmarked(1)).toBe(false);
    expect(service.bookmarkedCount()).toBe(0);

    service.toggleBookmark(1);
    expect(service.isBookmarked(1)).toBe(true);
    expect(service.bookmarkedCount()).toBe(1);

    service.setFilterTab('bookmarked');
    expect(service.filteredNames().length).toBe(1);
    expect(service.filteredNames()[0].number).toBe(1);

    service.toggleBookmark(1);
    expect(service.isBookmarked(1)).toBe(false);
    expect(service.bookmarkedCount()).toBe(0);
    expect(service.filteredNames().length).toBe(0);
  });

  it('should open and close name details', () => {
    const first = service.allNames[0];
    expect(service.selectedName()).toBeNull();

    service.openDetail(first);
    expect(service.selectedName()).toEqual(first);

    service.closeDetail();
    expect(service.selectedName()).toBeNull();
  });

  it('should handle sequential navigation', () => {
    service.stop();
    expect(service.activePlayingNumber()).toBeNull();
    expect(service.isPlayingAll()).toBe(false);

    service.playName(service.allNames[0]);
    expect(service.activePlayingNumber()).toBe(1);

    service.next();
    expect(service.activePlayingNumber()).toBe(2);

    service.previous();
    expect(service.activePlayingNumber()).toBe(1);

    service.stop();
    expect(service.activePlayingNumber()).toBeNull();
  });
});
