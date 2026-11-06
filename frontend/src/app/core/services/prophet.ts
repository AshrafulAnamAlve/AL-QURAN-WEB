import { Injectable, computed, inject, signal } from '@angular/core';
import { PROPHETS_DATA, Prophet } from '../models/prophet';
import { StorageService } from './storage';
import { LanguageService } from './language';
import { looseIncludes } from '../utils/text';

const STORAGE_KEY_PROPHET_BOOKMARKS = 'prophet_bookmarks';

export type ProphetFilterEra = 'all' | 'early' | 'abrahamic' | 'israelite' | 'final';

@Injectable({
  providedIn: 'root',
})
export class ProphetService {
  private readonly storage = inject(StorageService);
  private readonly lang = inject(LanguageService);

  readonly allProphets = PROPHETS_DATA;

  // Search, filter & navigation state
  readonly searchQuery = signal<string>('');
  readonly selectedEra = signal<ProphetFilterEra>('all');
  readonly selectedProphetId = signal<string | null>(null);

  // Bookmarks (persisted in localStorage)
  private readonly _bookmarkedNumbers = signal<number[]>(
    this.storage.read<number[]>(STORAGE_KEY_PROPHET_BOOKMARKS, []),
  );
  readonly bookmarkedNumbers = this._bookmarkedNumbers.asReadonly();

  // Active selected Prophet (if any)
  readonly activeProphet = computed(() => {
    const id = this.selectedProphetId();
    if (!id) return null;
    return this.allProphets.find((p) => p.id === id) || null;
  });

  // Filtered Prophets list
  readonly filteredProphets = computed(() => {
    let list = this.allProphets;

    // Filter by Era
    const era = this.selectedEra();
    if (era === 'early') {
      // Adam, Idris, Nuh, Hud, Salih
      list = list.filter((p) => p.number <= 5);
    } else if (era === 'abrahamic') {
      // Ibrahim, Lut, Ismail, Ishaq, Yaqub, Yusuf, Ayyub, Shu'aib
      list = list.filter((p) => p.number >= 6 && p.number <= 13);
    } else if (era === 'israelite') {
      // Musa to Isa (14 to 24)
      list = list.filter((p) => p.number >= 14 && p.number <= 24);
    } else if (era === 'final') {
      // Muhammad (ﷺ)
      list = list.filter((p) => p.number === 25);
    }

    // Search query
    const q = this.searchQuery().trim();
    if (!q) return list;

    return list.filter(
      (p) =>
        looseIncludes(p.nameBn, q) ||
        looseIncludes(p.nameEn, q) ||
        looseIncludes(p.titleBn, q) ||
        looseIncludes(p.titleEn, q) ||
        looseIncludes(p.eraBn, q) ||
        looseIncludes(p.eraEn, q) ||
        looseIncludes(p.locationBn, q) ||
        looseIncludes(p.locationEn, q) ||
        p.nameAr.includes(q) ||
        String(p.number) === q,
    );
  });

  // -----------------------------------------------------------------------
  // Audio Narrator Engine (SpeechSynthesis + Sentence Highlighting)
  // -----------------------------------------------------------------------
  readonly isAudioPlaying = signal<boolean>(false);
  readonly isAudioPaused = signal<boolean>(false);
  readonly audioSpeed = signal<number>(1.0);
  readonly audioLang = signal<'bn' | 'en'>(this.lang.isBn() ? 'bn' : 'en');
  readonly currentSentenceIndex = signal<number>(0);
  readonly sentences = signal<string[]>([]);
  readonly currentSentenceText = computed(() => {
    const list = this.sentences();
    const idx = this.currentSentenceIndex();
    return list[idx] || '';
  });

  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.stopAudio());
    }
  }

  selectProphet(id: string | null): void {
    if (this.selectedProphetId() !== id) {
      this.stopAudio();
    }
    this.selectedProphetId.set(id);
  }

  toggleBookmark(num: number): void {
    this._bookmarkedNumbers.update((list) => {
      const next = list.includes(num) ? list.filter((n) => n !== num) : [...list, num];
      this.storage.write(STORAGE_KEY_PROPHET_BOOKMARKS, next);
      return next;
    });
  }

  isBookmarked(num: number): boolean {
    return this._bookmarkedNumbers().includes(num);
  }

  // --- Audio Narration Methods ---

  startAudio(prophet: Prophet, lang: 'bn' | 'en'): void {
    this.stopAudio();
    this.audioLang.set(lang);

    // Prepare all sentences from summary and sections
    const textParts: string[] = [];
    if (lang === 'bn') {
      textParts.push(prophet.nameBn);
      textParts.push(prophet.titleBn);
      textParts.push(prophet.summaryBn);
      for (const s of prophet.sections) {
        textParts.push(s.titleBn);
        textParts.push(s.contentBn);
      }
    } else {
      textParts.push(prophet.nameEn);
      textParts.push(prophet.titleEn);
      textParts.push(prophet.summaryEn);
      for (const s of prophet.sections) {
        textParts.push(s.titleEn);
        textParts.push(s.contentEn);
      }
    }

    const rawFullText = textParts.join('। ');
    const splitSentences = this.splitIntoSentences(rawFullText);
    this.sentences.set(splitSentences);
    this.currentSentenceIndex.set(0);

    if (splitSentences.length > 0) {
      this.isAudioPlaying.set(true);
      this.isAudioPaused.set(false);
      this.speakSentence(0);
    }
  }

  private speakSentence(index: number): void {
    const list = this.sentences();
    if (index >= list.length || !this.isSpeechSupported) {
      this.stopAudio();
      return;
    }

    this.currentSentenceIndex.set(index);
    const text = list[index];

    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const lang = this.audioLang();
    utterance.lang = lang === 'bn' ? 'bn-BD' : 'en-US';
    utterance.rate = this.audioSpeed();

    // Select suitable voice if available
    const voices = window.speechSynthesis.getVoices?.() || [];
    if (lang === 'bn') {
      const bnVoice = voices.find((v) => v.lang.startsWith('bn'));
      if (bnVoice) utterance.voice = bnVoice;
    } else {
      const enVoice = voices.find((v) => v.lang.startsWith('en'));
      if (enVoice) utterance.voice = enVoice;
    }

    utterance.onend = () => {
      if (this.isAudioPlaying() && !this.isAudioPaused()) {
        const next = this.currentSentenceIndex() + 1;
        if (next < this.sentences().length) {
          this.speakSentence(next);
        } else {
          this.stopAudio();
        }
      }
    };

    utterance.onerror = () => {
      if (this.isAudioPlaying()) {
        const next = this.currentSentenceIndex() + 1;
        if (next < this.sentences().length) {
          this.speakSentence(next);
        } else {
          this.stopAudio();
        }
      }
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  pauseAudio(): void {
    if (this.isSpeechSupported && window.speechSynthesis) {
      window.speechSynthesis.pause();
      this.isAudioPaused.set(true);
    }
  }

  resumeAudio(): void {
    if (this.isSpeechSupported && window.speechSynthesis) {
      window.speechSynthesis.resume();
      this.isAudioPaused.set(false);
    }
  }

  stopAudio(): void {
    if (this.isSpeechSupported && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    this.isAudioPlaying.set(false);
    this.isAudioPaused.set(false);
    this.currentSentenceIndex.set(0);
  }

  nextSentence(): void {
    const next = this.currentSentenceIndex() + 1;
    if (next < this.sentences().length) {
      this.speakSentence(next);
    } else {
      this.stopAudio();
    }
  }

  prevSentence(): void {
    const prev = Math.max(0, this.currentSentenceIndex() - 1);
    this.speakSentence(prev);
  }

  setSpeed(speed: number): void {
    this.audioSpeed.set(speed);
    if (this.isAudioPlaying() && !this.isAudioPaused()) {
      // Re-trigger current sentence with new rate
      this.speakSentence(this.currentSentenceIndex());
    }
  }

  private splitIntoSentences(text: string): string[] {
    // Split by Bengali Dari (।), exclamation, question mark, or period
    return text
      .split(/(?<=[।!?.\n])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 2);
  }
}
