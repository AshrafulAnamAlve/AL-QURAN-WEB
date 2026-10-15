import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { dataOf, errorOf } from '../../core/models/async-state';
import { QURAN_TOTALS } from '../../core/models/quran';
import { QuranApiService } from '../../core/services/quran-api';
import { createAsyncResource } from '../../core/utils/async-resource';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton';
import { JuzCardComponent } from './juz-card/juz-card';

/**
 * Browse the Quran by juz (para).
 *
 * The same 30 divisions the Quran is traditionally read in, one per day of
 * Ramadan. Each card shows exactly where its juz starts and ends.
 */
@Component({
  selector: 'aq-juz-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    RouterLinkActive,
    JuzCardComponent,
    SkeletonComponent,
    ErrorStateComponent,
  ],
  templateUrl: './juz.html',
  styleUrl: './juz.scss',
})
export class JuzPage {
  private readonly quranApi = inject(QuranApiService);

  private readonly resource = createAsyncResource(() => this.quranApi.getJuzList());

  protected readonly busy = computed(() => {
    const status = this.resource.state().status;
    return status === 'idle' || status === 'loading';
  });

  protected readonly error = computed(() => errorOf(this.resource.state()));
  protected readonly juzList = computed(() => dataOf(this.resource.state()) ?? []);

  protected readonly skeletons = Array.from({ length: 8 }, (_, index) => index);
  protected readonly totalJuz = QURAN_TOTALS.juz;

  retry(): void {
    this.resource.reload();
  }
}
