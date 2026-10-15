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
import { RouterLink } from '@angular/router';
import { EMPTY } from 'rxjs';
import { PlaybackQueue } from '../../../core/models/audio';
import { dataOf, errorOf } from '../../../core/models/async-state';
import { Ayah, QURAN_TOTALS, SurahLink } from '../../../core/models/quran';
import { QuranApiService } from '../../../core/services/quran-api';
import { LanguageService } from '../../../core/services/language';
import { createDependentAsyncResource } from '../../../core/utils/async-resource';
import { followPlayback } from '../../../core/utils/playback-follow';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state';
import { IconComponent } from '../../../shared/components/icon/icon';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton';
import { AyahViewComponent } from '../../quran/surah-reader/ayah-view/ayah-view';
import { ReadingControlsComponent } from '../../quran/surah-reader/reading-controls/reading-controls';

const INITIAL_CHUNK = 15;
const CHUNK_SIZE = 40;

/** A juz is a run of ayahs interrupted by a heading each time a new surah begins. */
type ReaderItem =
  | { readonly kind: 'heading'; readonly surah: SurahLink }
  | { readonly kind: 'ayah'; readonly ayah: Ayah; readonly surah: SurahLink };

/**
 * Reading view for one juz.
 *
 * Reuses the ayah component and the reading controls from the surah reader - the
 * only real difference is that a juz crosses surah boundaries, so it inserts a
 * heading whenever the surah changes.
 */
@Component({
  selector: 'aq-juz-reader',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    IconComponent,
    SkeletonComponent,
    ErrorStateComponent,
    AyahViewComponent,
    ReadingControlsComponent,
  ],
  templateUrl: './juz-reader.html',
  styleUrl: './juz-reader.scss',
})
export class JuzReaderPage {
  private readonly quranApi = inject(QuranApiService);
  private readonly lang = inject(LanguageService);
  protected readonly isBn = this.lang.isBn;

  /** Bound from the :juzNumber route parameter. */
  readonly juzNumber = input.required<string>();

  protected readonly parsed = computed(() => {
    const raw = Number(this.juzNumber());
    return Number.isInteger(raw) && raw >= 1 && raw <= QURAN_TOTALS.juz ? raw : null;
  });

  // An unusable route parameter makes no request at all.
  private readonly resource = createDependentAsyncResource(this.parsed, (number) =>
    number === null ? EMPTY : this.quranApi.getJuz(number, ['bn.bengali', 'en.sahih']),
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

  protected readonly previousJuz = computed(() => {
    const current = this.parsed();
    return current && current > 1 ? current - 1 : null;
  });

  protected readonly nextJuz = computed(() => {
    const current = this.parsed();
    return current && current < QURAN_TOTALS.juz ? current + 1 : null;
  });

  /** Ayahs interleaved with a heading wherever the surah changes. */
  private readonly items = computed<readonly ReaderItem[]>(() => {
    const data = this.detail();

    if (!data) {
      return [];
    }

    const names = new Map(data.surahs.map((surah) => [surah.number, surah]));
    const fallback: SurahLink = { number: 0, englishName: '', banglaName: '' };

    const built: ReaderItem[] = [];
    let previousSurah = -1;

    for (const ayah of data.ayahs) {
      const surah = names.get(ayah.surahNumber) ?? fallback;

      if (ayah.surahNumber !== previousSurah) {
        built.push({ kind: 'heading', surah });
        previousSurah = ayah.surahNumber;
      }

      built.push({ kind: 'ayah', ayah, surah });
    }

    return built;
  });

  protected readonly totalItems = computed(() => this.items().length);

  private readonly renderCount = signal(INITIAL_CHUNK);

  protected readonly visibleItems = computed(() => this.items().slice(0, this.renderCount()));

  protected readonly isFullyRendered = computed(
    () => this.totalItems() > 0 && this.renderCount() >= this.totalItems(),
  );

  protected readonly ayahCount = computed(() => this.detail()?.ayahs.length ?? 0);
  protected readonly skeletons = Array.from({ length: 6 }, (_, index) => index);

  /** What the player recites when someone presses play: the whole juz, in order. */
  private readonly playbackQueue = computed<PlaybackQueue | null>(() => {
    const data = this.detail();
    const number = this.parsed();

    if (!data || number === null) {
      return null;
    }

    const names = new Map(data.surahs.map((surah) => [surah.number, surah]));

    return {
      id: `juz:${number}`,
      kind: 'juz',
      title: `Juz ${number}`,
      ayahs: data.ayahs.map((ayah) => ({
        globalNumber: ayah.globalNumber,
        surahNumber: ayah.surahNumber,
        numberInSurah: ayah.numberInSurah,
        surahEnglishName: names.get(ayah.surahNumber)?.englishName ?? '',
        surahArabicName: '',
      })),
    };
  });

  private frame = 0;

  constructor() {
    inject(DestroyRef).onDestroy(() => cancelAnimationFrame(this.frame));

    // A juz spans several surahs, so ayah elements are keyed by surah as well -
    // numbering by position within the surah alone would put two `ayah-1`
    // elements on the same page and send the scroll to the wrong one.
    followPlayback(
      this.playbackQueue,
      (ayah) => `ayah-${ayah.surahNumber}-${ayah.numberInSurah}`,
    );

    effect(() => {
      const total = this.totalItems();
      untracked(() => this.startProgressiveRender(total));
    });
  }

  retry(): void {
    this.resource.reload();
  }

  /** Same progressive rendering as the surah reader; a juz can be 564 ayahs. */
  private startProgressiveRender(total: number): void {
    cancelAnimationFrame(this.frame);

    if (total === 0) {
      this.renderCount.set(INITIAL_CHUNK);
      return;
    }

    this.renderCount.set(Math.min(INITIAL_CHUNK, total));

    if (this.renderCount() >= total) {
      return;
    }

    const step = (): void => {
      const next = Math.min(this.renderCount() + CHUNK_SIZE, total);
      this.renderCount.set(next);

      if (next < total) {
        this.frame = requestAnimationFrame(step);
      }
    };

    this.frame = requestAnimationFrame(step);
  }
}
