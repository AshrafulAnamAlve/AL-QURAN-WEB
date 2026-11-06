import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PROPHETS_DATA } from '../models/prophet';
import { ProphetService } from './prophet';

describe('ProphetService', () => {
  let service: ProphetService;

  beforeEach(() => {
    localStorage.clear();
    if (!('speechSynthesis' in window)) {
      (window as any).speechSynthesis = {
        speak: vi.fn(),
        cancel: vi.fn(),
        pause: vi.fn(),
        resume: vi.fn(),
        getVoices: vi.fn().mockReturnValue([]),
      };
    }
    if (!('SpeechSynthesisUtterance' in window)) {
      (window as any).SpeechSynthesisUtterance = class {
        text: string;
        lang = 'en-US';
        rate = 1;
        pitch = 1;
        onend: any;
        onerror: any;
        onboundary: any;
        constructor(text?: string) {
          this.text = text || '';
        }
      };
    }

    TestBed.configureTestingModule({
      providers: [ProphetService],
    });
    service = TestBed.inject(ProphetService);
  });

  it('should load all 25 Prophets mentioned in the Quran', () => {
    expect(PROPHETS_DATA.length).toBe(25);
    expect(service.allProphets.length).toBe(25);
  });

  it('should ensure each Prophet has complete bilingual details and lessons', () => {
    for (const prophet of PROPHETS_DATA) {
      expect(prophet.number).toBeGreaterThanOrEqual(1);
      expect(prophet.number).toBeLessThanOrEqual(25);
      expect(prophet.nameAr.trim().length).toBeGreaterThan(0);
      expect(prophet.nameEn.trim().length).toBeGreaterThan(0);
      expect(prophet.nameBn.trim().length).toBeGreaterThan(0);
      expect(prophet.summaryBn.trim().length).toBeGreaterThan(0);
      expect(prophet.summaryEn.trim().length).toBeGreaterThan(0);
      expect(prophet.sections.length).toBeGreaterThan(0);
      expect(prophet.lessonsBn.length).toBeGreaterThan(0);
      expect(prophet.lessonsEn.length).toBeGreaterThan(0);
    }
  });

  it('should filter prophets by search query in Bangla or English', () => {
    service.searchQuery.set('মুহাম্মদ');
    expect(service.filteredProphets().length).toBe(1);
    expect(service.filteredProphets()[0].number).toBe(25);

    service.searchQuery.set('Idris');
    expect(service.filteredProphets().length).toBe(1);
    expect(service.filteredProphets()[0].number).toBe(2);

    service.searchQuery.set('');
    expect(service.filteredProphets().length).toBe(25);
  });

  it('should filter prophets by historical era', () => {
    service.selectedEra.set('early');
    const earlyProphets = service.filteredProphets();
    expect(earlyProphets.length).toBe(5);
    expect(earlyProphets.every((p) => p.number <= 5)).toBe(true);

    service.selectedEra.set('all');
    expect(service.filteredProphets().length).toBe(25);
  });

  it('should toggle bookmark and persist state', () => {
    expect(service.isBookmarked(1)).toBe(false);
    service.toggleBookmark(1);
    expect(service.isBookmarked(1)).toBe(true);
    expect(service.bookmarkedNumbers().length).toBe(1);

    service.toggleBookmark(1);
    expect(service.isBookmarked(1)).toBe(false);
    expect(service.bookmarkedNumbers().length).toBe(0);
  });

  it('should manage audio narrator controls', () => {
    const prophet = PROPHETS_DATA[0];
    service.selectProphet(prophet.id);

    service.setSpeed(1.25);
    expect(service.audioSpeed()).toBe(1.25);

    service.startAudio(prophet, 'bn');
    expect(service.isAudioPlaying()).toBe(true);

    service.pauseAudio();
    expect(service.isAudioPaused()).toBe(true);

    service.resumeAudio();
    expect(service.isAudioPaused()).toBe(false);

    service.stopAudio();
    expect(service.isAudioPlaying()).toBe(false);
  });
});
