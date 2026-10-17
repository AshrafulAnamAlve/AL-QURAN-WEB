import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Surah } from '../../../core/models/quran';
import { SurahHistoryService } from '../../../core/services/surah-history';
import { LanguageService } from '../../../core/services/language';
import { toBanglaDigits } from '../../../core/services/prayer';

/**
 * One surah in the browse grid.
 *
 * The whole card is a single link rather than a div with a link inside it, so
 * keyboard and screen-reader users get one focus stop with a complete accessible
 * name instead of a card they have to tab through.
 */
@Component({
  selector: 'aq-surah-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <a class="card" [routerLink]="['/quran', surah().number]" [attr.aria-label]="ariaLabel()">
      <span class="card__badge" aria-hidden="true">
        <span class="card__badge-inner">{{ isBn() ? toBn(surah().number) : surah().number }}</span>
      </span>

      <span class="card__names">
        <span class="card__english">{{ surah().englishName }}</span>
        <span class="card__bangla">{{ surah().banglaName }}</span>
        <span class="card__meaning">{{ surah().englishMeaning }}</span>
      </span>

      <span class="card__arabic aq-arabic" aria-hidden="true">{{ shortArabicName() }}</span>

      <span class="card__meta">
        <span class="card__ayahs aq-numeral">{{ isBn() ? toBn(surah().ayahCount) + ' আয়াত' : surah().ayahCount + ' ayahs' }}</span>
        <span class="aq-chip" [class.aq-chip--gold]="isMeccan()">
          {{ isMeccan() ? (isBn() ? 'মাক্কী' : 'Meccan') : (isBn() ? 'মাদানী' : 'Medinan') }}
        </span>
      </span>

      @if (progress(); as p) {
        @if (p.percentage > 0) {
          <div class="card__progress" role="progressbar" [attr.aria-valuenow]="p.percentage" aria-valuemin="0" aria-valuemax="100">
            <div class="card__progress-track">
              <div class="card__progress-fill" [style.width.%]="p.percentage" [class.is-completed]="p.isCompleted"></div>
            </div>
            <div class="card__progress-meta">
              @if (p.isCompleted) {
                <span class="card__progress-badge is-completed">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>{{ isBn() ? 'সম্পূর্ণ' : 'Completed' }}</span>
                </span>
              } @else {
                <span class="card__progress-label">
                  <span class="card__progress-icon" aria-hidden="true">{{ p.mode === 'listen' ? '🎧' : '📖' }}</span>
                  <span>{{ isBn() ? toBn(p.percentage) : p.percentage }}%</span>
                </span>
                <span class="card__progress-count">
                  {{ isBn() ? toBn(p.highestAyah) + '/' + toBn(p.totalAyahs) : p.highestAyah + '/' + p.totalAyahs }}
                </span>
              }
            </div>
          </div>
        }
      }
    </a>
  `,
  styleUrl: './surah-card.scss',
})
export class SurahCardComponent {
  private readonly history = inject(SurahHistoryService);
  private readonly lang = inject(LanguageService);

  readonly surah = input.required<Surah>();

  protected readonly isBn = this.lang.isBn;
  protected readonly isMeccan = computed(() => this.surah().revelationType === 'Meccan');
  protected readonly progress = computed(() => this.history.getProgress(this.surah().number, this.surah().ayahCount));

  protected toBn(val: string | number): string {
    return toBanglaDigits(val);
  }

  /**
   * The provider prefixes every Arabic name with "سُورَةُ" ("Surah of"), which is
   * the same on all 114 cards and only takes space. The heading on the reading
   * page keeps the full form.
   */
  protected readonly shortArabicName = computed(() => {
    const name = this.surah().arabicName;
    const firstSpace = name.indexOf(' ');
    return firstSpace > 0 ? name.slice(firstSpace + 1) : name;
  });

  /**
   * A single spoken label for the card. Without this a screen reader would read
   * the Arabic, the Bangla and the English names in three different languages
   * one after another.
   */
  protected readonly ariaLabel = computed(() => {
    const surah = this.surah();
    const p = this.progress();
    const progText = p ? `, ${p.percentage}% ${p.isCompleted ? 'completed' : (p.mode === 'listen' ? 'listened' : 'read')}` : '';
    return `Surah ${surah.number}, ${surah.englishName}, ${surah.englishMeaning}, `
      + `${surah.ayahCount} ayahs, ${surah.revelationType}${progText}`;
  });
}
