import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EMPTY } from 'rxjs';
import { PlaybackQueue } from '../../../core/models/audio';
import { dataOf, errorOf } from '../../../core/models/async-state';
import { QURAN_TOTALS } from '../../../core/models/quran';
import { QuranApiService } from '../../../core/services/quran-api';
import { ReadingPositionService } from '../../../core/services/reading-position';
import { ReadingProgressService } from '../../../core/services/reading-progress';
import { AudioPlayerService } from '../../../core/services/audio-player';
import { SurahHistoryItem, SurahHistoryService } from '../../../core/services/surah-history';
import { LanguageService } from '../../../core/services/language';
import { SeoService } from '../../../core/services/seo';
import { createDependentAsyncResource } from '../../../core/utils/async-resource';
import { followPlayback } from '../../../core/utils/playback-follow';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state';
import { IconComponent } from '../../../shared/components/icon/icon';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton';
import { AyahViewComponent } from './ayah-view/ayah-view';
import { ReadingControlsComponent } from './reading-controls/reading-controls';

/** Ayahs rendered before the first paint. Enough to fill any screen. */
const INITIAL_CHUNK = 15;

/** Ayahs added per animation frame afterwards. */
const CHUNK_SIZE = 40;

/**
 * Reading view for one surah.
 *
 * Long surahs are rendered progressively: the first {@link INITIAL_CHUNK} ayahs
 * paint immediately, then the rest are appended a frame at a time. Al-Baqarah is
 * 286 ayahs with two translations each - building all of that before the first
 * paint would stall the page on a phone. The whole surah is still in the DOM a
 * few frames later, so browser find-in-page and #ayah-N links keep working,
 * which virtual scrolling would have broken.
 */
@Component({
  selector: 'aq-surah-reader',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    IconComponent,
    SkeletonComponent,
    ErrorStateComponent,
    AyahViewComponent,
    ReadingControlsComponent,
  ],
  templateUrl: './surah-reader.html',
  styleUrl: './surah-reader.scss',
})
export class SurahReaderPage {
  private readonly quranApi = inject(QuranApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly document = inject(DOCUMENT);
  private readonly seo = inject(SeoService);
  private readonly readingPosition = inject(ReadingPositionService);
  private readonly readingProgress = inject(ReadingProgressService);
  private readonly history = inject(SurahHistoryService);
  private readonly audio = inject(AudioPlayerService);
  private readonly lang = inject(LanguageService);

  protected readonly isBn = this.lang.isBn;
  readonly resumePrompt = signal<SurahHistoryItem | null>(null);

  /** Bound from the :surahNumber route parameter. */
  readonly surahNumber = input.required<string>();

  /** The parameter as a number, or null when it is not a real surah. */
  protected readonly parsed = computed(() => {
    const raw = Number(this.surahNumber());
    return Number.isInteger(raw) && raw >= 1 && raw <= QURAN_TOTALS.surahs ? raw : null;
  });

  // Both translations are always fetched. The largest surah is 130 kB gzipped
  // with both, and holding them means switching between Bangla, English and
  // both is instant instead of a fresh request in the middle of reading.
  //
  // An unusable route parameter makes no request at all - fetching surah 1
  // because someone typed /quran/200 would be wasted work and a confusing page.
  private readonly resource = createDependentAsyncResource(this.parsed, (number) =>
    number === null ? EMPTY : this.quranApi.getSurah(number, ['bn.bengali', 'en.sahih']),
  );

  protected readonly busy = computed(() => {
    if (this.parsed() === null) {
      return false;
    }

    const status = this.resource.state().status;
    return status === 'idle' || status === 'loading';
  });

  protected readonly error = computed(() =>
    this.parsed() === null ? null : errorOf(this.resource.state()),
  );

  protected readonly detail = computed(() =>
    this.parsed() === null ? null : dataOf(this.resource.state()),
  );

  protected readonly surah = computed(() => this.detail()?.surah ?? null);
  protected readonly ayahCount = computed(() => this.detail()?.ayahs.length ?? 0);

  /** How many ayahs are currently in the DOM. */
  private readonly renderCount = signal(INITIAL_CHUNK);

  /** The slice actually rendered. */
  protected readonly visibleAyahs = computed(
    () => this.detail()?.ayahs.slice(0, this.renderCount()) ?? [],
  );

  protected readonly isFullyRendered = computed(
    () => this.ayahCount() > 0 && this.renderCount() >= this.ayahCount(),
  );

  protected readonly skeletons = Array.from({ length: 6 }, (_, index) => index);

  /**
   * What the player should recite when someone presses play on this page.
   *
   * Built from the whole surah, not from the ayahs rendered so far, so pressing
   * play on ayah 3 still auto-advances to the end of Al-Baqarah.
   */
  private readonly playbackQueue = computed<PlaybackQueue | null>(() => {
    const data = this.detail();

    if (!data) {
      return null;
    }

    return {
      id: `surah:${data.surah.number}`,
      kind: 'surah',
      title: `Surah ${data.surah.englishName}`,
      ayahs: data.ayahs.map((ayah) => ({
        globalNumber: ayah.globalNumber,
        surahNumber: ayah.surahNumber,
        numberInSurah: ayah.numberInSurah,
        surahEnglishName: data.surah.englishName,
        surahArabicName: data.surah.arabicName,
      })),
    };
  });

  private frame = 0;
  private pendingFragment: string | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => cancelAnimationFrame(this.frame));

    // Leaving the page does NOT stop the recitation: the mini player lives in
    // the app shell so listening continues while the reader browses elsewhere.
    followPlayback(this.playbackQueue, (ayah) => `ayah-${ayah.numberInSurah}`);

    // Progressive rendering restarts whenever a different surah loads.
    effect(() => {
      const total = this.ayahCount();
      untracked(() => this.startProgressiveRender(total));
    });

    // Route metadata is generic; fill in the real surah name once it is known.
    effect(() => {
      const surah = this.surah();

      if (surah) {
        untracked(() =>
          this.seo.apply({
            title: `Surah ${surah.englishName} — ${surah.arabicName}`,
            description:
              `Read Surah ${surah.englishName} (${surah.englishMeaning}) in Arabic with `
              + `Bangla translation. ${surah.ayahCount} ayahs, revealed in `
              + `${surah.revelationType === 'Meccan' ? 'Makkah' : 'Madinah'}.`,
            path: `/quran/${surah.number}`,
          }),
        );
      }
    });

    // Record reading position and progress
    effect(() => {
      const detail = this.detail();
      if (detail) {
        untracked(() => {
          let ayahNum = 1;
          const frag = this.route.snapshot.fragment;
          if (frag && frag.startsWith('ayah-')) {
            const parsed = parseInt(frag.substring(5), 10);
            if (!isNaN(parsed) && parsed >= 1 && parsed <= detail.ayahs.length) {
              ayahNum = parsed;
            }
          }
          this.readingPosition.save({
            surahNumber: detail.surah.number,
            surahEnglishName: detail.surah.englishName,
            surahBanglaName: detail.surah.banglaName,
            ayahNumber: ayahNum,
          });
          this.readingProgress.markMany(detail.ayahs.map((a) => a.globalNumber));
        });
      }
    });

    // Check for previous reading or listening progress to offer resume prompt
    effect(() => {
      const detail = this.detail();
      if (!detail) return;

      untracked(() => {
        const frag = this.route.snapshot.fragment;
        // Do not prompt if arrived with an explicit deep link fragment
        if (frag && frag.startsWith('ayah-')) {
          return;
        }

        const saved = this.history.getHistory(detail.surah.number);
        if (saved && saved.lastAyahNumber > 1 && saved.lastAyahNumber <= detail.surah.ayahCount) {
          this.resumePrompt.set(saved);
        }
      });
    });

    // Automatically track audio recitation playback into history
    effect(() => {
      const current = this.audio.current();
      const detail = this.detail();
      if (current && detail && current.surahNumber === detail.surah.number) {
        untracked(() => {
          this.history.record(
            detail.surah.number,
            detail.surah.englishName,
            detail.surah.banglaName,
            current.numberInSurah,
            detail.surah.ayahCount,
            'listen',
          );
        });
      }
    });
  }

  async continueFromHistory(): Promise<void> {
    const prompt = this.resumePrompt();
    if (!prompt) return;

    const ayahNum = prompt.lastAyahNumber;
    const isListen = prompt.lastMode === 'listen';
    this.resumePrompt.set(null);

    requestAnimationFrame(() => {
      const target = this.document.getElementById(`ayah-${ayahNum}`);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        target.classList.add('ayah--resumed');
        setTimeout(() => target.classList.remove('ayah--resumed'), 2500);
      }
    });

    if (isListen) {
      const globalNumber = this.detail()?.ayahs.find((a) => a.numberInSurah === ayahNum)?.globalNumber;
      if (globalNumber) {
        await this.audio.toggleAyah(globalNumber);
      }
    }
  }

  startFromBeginning(): void {
    const detail = this.detail();
    this.resumePrompt.set(null);
    if (detail) {
      this.history.record(
        detail.surah.number,
        detail.surah.englishName,
        detail.surah.banglaName,
        1,
        detail.surah.ayahCount,
        'read',
      );
    }
    this.document.getElementById('ayah-1')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  dismissResumePrompt(): void {
    this.resumePrompt.set(null);
  }

  toBnDigits(val: string | number): string {
    return String(val).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[parseInt(d, 10)]);
  }

  retry(): void {
    this.resource.reload();
  }

  /**
   * Renders the first chunk immediately, then appends the rest one frame at a
   * time so the browser can paint and stay responsive in between.
   */
  private startProgressiveRender(total: number): void {
    cancelAnimationFrame(this.frame);
    this.pendingFragment = this.route.snapshot.fragment;

    if (total === 0) {
      this.renderCount.set(INITIAL_CHUNK);
      return;
    }

    this.renderCount.set(Math.min(INITIAL_CHUNK, total));

    if (this.renderCount() >= total) {
      this.afterFullRender();
      return;
    }

    const step = (): void => {
      const next = Math.min(this.renderCount() + CHUNK_SIZE, total);
      this.renderCount.set(next);

      if (next < total) {
        this.frame = requestAnimationFrame(step);
      } else {
        this.afterFullRender();
      }
    };

    this.frame = requestAnimationFrame(step);
  }

  /**
   * Scrolls to a #ayah-N deep link.
   *
   * This has to wait for the full render: Angular's own anchor scrolling runs on
   * navigation, long before the surah has been fetched, so the element it is
   * looking for does not exist yet.
   */
  private afterFullRender(): void {
    const fragment = this.pendingFragment;
    this.pendingFragment = null;

    if (!fragment) {
      return;
    }

    requestAnimationFrame(() => {
      const target = this.document.getElementById(fragment);
      target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }
}
