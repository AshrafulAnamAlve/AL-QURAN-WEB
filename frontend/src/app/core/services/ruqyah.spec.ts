import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { RuqyahService } from './ruqyah';
import { StorageService } from './storage';

describe('RuqyahService', () => {
  let service: RuqyahService;
  let storage: StorageService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [RuqyahService, StorageService],
    });
    service = TestBed.inject(RuqyahService);
    storage = TestBed.inject(StorageService);
  });

  it('initializes with all items and categories', () => {
    expect(service.allItems.length).toBeGreaterThan(10);
    expect(service.categories.length).toBe(6);
    expect(service.audioTracks.length).toBeGreaterThan(4);
    expect(service.selectedCategory()).toBe('all');
    expect(service.filteredItems().length).toBe(service.allItems.length);
  });

  it('filters items by category', () => {
    service.setCategory('shifa');
    expect(service.selectedCategory()).toBe('shifa');
    expect(service.filteredItems().every((item) => item.category === 'shifa')).toBe(true);
  });

  it('filters items by search query', () => {
    service.setSearchQuery('ফাতিহা');
    expect(service.filteredItems().some((item) => item.titleBn.includes('ফাতিহা'))).toBe(true);

    service.setSearchQuery('non-existent-ruqyah-query');
    expect(service.filteredItems().length).toBe(0);

    service.resetFilters();
    expect(service.filteredItems().length).toBe(service.allItems.length);
  });

  it('toggles bookmarks and persists in storage', () => {
    const itemId = service.allItems[0].id;
    expect(service.isBookmarked(itemId)).toBe(false);

    service.toggleBookmark(itemId);
    expect(service.isBookmarked(itemId)).toBe(true);
    expect(service.bookmarksCount()).toBe(1);

    // Filter bookmarks only
    service.toggleBookmarksOnly();
    expect(service.filteredItems().length).toBe(1);
    expect(service.filteredItems()[0].id).toBe(itemId);

    // Toggle off
    service.toggleBookmark(itemId);
    expect(service.isBookmarked(itemId)).toBe(false);
  });

  it('increments and resets counter for an item', () => {
    const item = service.allItems[0];
    expect(service.getItemCount(item.id)).toBe(0);

    service.incrementCounter(item.id, item.targetCount);
    expect(service.getItemCount(item.id)).toBe(1);

    service.resetCounter(item.id);
    expect(service.getItemCount(item.id)).toBe(0);
  });

  it('handles audio playback state and sleep timer', () => {
    const track = service.audioTracks[0];
    service.playTrack(track);
    expect(service.activeTrack()?.id).toBe(track.id);

    service.toggleLoop();
    expect(service.isLooping()).toBe(true);

    service.setPlaybackRate(1.25);
    expect(service.playbackRate()).toBe(1.25);

    service.setSleepTimer(15);
    expect(service.sleepTimerMinutes()).toBe(15);
    expect(service.sleepTimerRemainingSeconds()).toBe(900);

    service.setSleepTimer(null);
    expect(service.sleepTimerMinutes()).toBeNull();
    expect(service.sleepTimerRemainingSeconds()).toBeNull();

    service.stopAudio();
    expect(service.isPlaying()).toBe(false);
  });
});
