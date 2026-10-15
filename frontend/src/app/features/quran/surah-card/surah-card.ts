import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Surah } from '../../../core/models/quran';

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
        <span class="card__badge-inner">{{ surah().number }}</span>
      </span>

      <span class="card__names">
        <span class="card__english">{{ surah().englishName }}</span>
        <span class="card__bangla">{{ surah().banglaName }}</span>
        <span class="card__meaning">{{ surah().englishMeaning }}</span>
      </span>

      <span class="card__arabic aq-arabic" aria-hidden="true">{{ shortArabicName() }}</span>

      <span class="card__meta">
        <span class="card__ayahs aq-numeral">{{ surah().ayahCount }} ayahs</span>
        <span class="aq-chip" [class.aq-chip--gold]="isMeccan()">{{ surah().revelationType }}</span>
      </span>
    </a>
  `,
  styleUrl: './surah-card.scss',
})
export class SurahCardComponent {
  readonly surah = input.required<Surah>();

  protected readonly isMeccan = computed(() => this.surah().revelationType === 'Meccan');

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
    return `Surah ${surah.number}, ${surah.englishName}, ${surah.englishMeaning}, `
      + `${surah.ayahCount} ayahs, ${surah.revelationType}`;
  });
}
