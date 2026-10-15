import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { DEFAULT_RECITER, Reciter } from '../models/quran';
import { LoggerService } from './logger';
import { QuranApiService } from './quran-api';
import { STORAGE_KEYS, StorageService } from './storage';

/** Whether the reciter list has been fetched yet. */
export type ReciterListStatus = 'idle' | 'loading' | 'ready' | 'failed';

/**
 * Which reciter the app plays, and the list to choose from.
 *
 * The *selected* reciter is stored whole, not as an identifier. The player needs
 * the bitrate to build a URL and the name to put on the lock screen, and storing
 * both means pressing play never has to wait for - or depend on - the list
 * request. Nothing is fetched until the reader actually opens the picker.
 */
@Injectable({ providedIn: 'root' })
export class ReciterService {
  private readonly api = inject(QuranApiService);
  private readonly storage = inject(StorageService);
  private readonly logger = inject(LoggerService);

  private readonly selectedState = signal<Reciter>(this.restore());

  /** The reciter currently in use. Never null. */
  readonly selected = this.selectedState.asReadonly();

  private readonly listState = signal<readonly Reciter[]>([]);

  /** Every reciter the API offers, once loaded. Empty until then. */
  readonly reciters = this.listState.asReadonly();

  private readonly statusState = signal<ReciterListStatus>('idle');

  readonly status = this.statusState.asReadonly();

  /** What a picker should show: the API's list, or just the current one so far. */
  readonly options = computed(() => {
    const list = this.listState();
    return list.length > 0 ? list : [this.selectedState()];
  });

  /** True when a reciter has a style worth showing beside the name. */
  readonly selectedLabel = computed(() => reciterLabel(this.selectedState()));

  constructor() {
    effect(() => {
      this.storage.write(STORAGE_KEYS.reciter, this.selectedState());
    });
  }

  select(reciter: Reciter): void {
    this.selectedState.set(reciter);
  }

  /** Selects by identifier, ignoring one that is not in the list. */
  selectById(identifier: string): void {
    const match = this.options().find((reciter) => reciter.identifier === identifier);

    if (match) {
      this.selectedState.set(match);
    }
  }

  /**
   * Fetches the reciter list the first time a picker is opened, and again after
   * a failure so the picker can retry. A loaded list is never refetched: it is
   * twenty fixed entries.
   */
  loadList(): void {
    const status = this.statusState();

    if (status === 'loading' || status === 'ready') {
      return;
    }

    this.statusState.set('loading');

    this.api.getReciters().subscribe({
      next: (reciters) => {
        if (reciters.length === 0) {
          // An empty list would leave the picker with nothing to choose.
          this.statusState.set('failed');
          return;
        }

        this.listState.set(reciters);
        this.statusState.set('ready');

        // The stored copy can predate a name or bitrate correction on the server.
        const fresh = reciters.find(
          (reciter) => reciter.identifier === this.selectedState().identifier,
        );

        this.selectedState.set(fresh ?? reciters[0]);
      },
      error: (cause: unknown) => {
        this.statusState.set('failed');
        this.logger.warn('Could not load the reciter list', cause);
      },
    });
  }

  /** Reads the stored reciter, falling back to the default if it is unusable. */
  private restore(): Reciter {
    const stored = this.storage.read<unknown>(STORAGE_KEYS.reciter, null);
    return isReciter(stored) ? stored : DEFAULT_RECITER;
  }
}

/** Name plus style, e.g. "Mahmoud Khalil Al-Husary (Mujawwad)". */
export function reciterLabel(reciter: Reciter): string {
  return reciter.style ? `${reciter.englishName} (${reciter.style})` : reciter.englishName;
}

/**
 * A stored reciter is only usable if it carries a bitrate: without one the URL
 * it builds would 404 on every ayah.
 */
function isReciter(value: unknown): value is Reciter {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Partial<Reciter>;

  return (
    typeof candidate.identifier === 'string'
    && candidate.identifier.length > 0
    && typeof candidate.englishName === 'string'
    && typeof candidate.bitrate === 'number'
    && Number.isFinite(candidate.bitrate)
    && candidate.bitrate > 0
  );
}
