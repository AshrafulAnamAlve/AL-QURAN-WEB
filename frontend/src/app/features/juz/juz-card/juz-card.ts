import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Juz } from '../../../core/models/quran';
import { IconComponent } from '../../../shared/components/icon/icon';

/** One juz (para) in the browse list. */
@Component({
  selector: 'aq-juz-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent],
  template: `
    <a class="card" [routerLink]="['/juz', juz().number]" [attr.aria-label]="ariaLabel()">
      <span class="card__badge" aria-hidden="true">
        <span class="card__badge-inner">{{ juz().number }}</span>
      </span>

      <span class="card__body">
        <span class="card__title">Juz {{ juz().number }}</span>

        <span class="card__range">
          <span class="card__ref">{{ juz().startSurahName }} {{ juz().startSurahNumber }}:{{ juz().startAyah }}</span>
          <aq-icon name="chevronRight" [size]="14" />
          <span class="card__ref">{{ juz().endSurahName }} {{ juz().endSurahNumber }}:{{ juz().endAyah }}</span>
        </span>

        <span class="card__bangla">{{ juz().startSurahBanglaName }} থেকে</span>
      </span>

      <span class="card__count aq-numeral">{{ juz().ayahCount }}<span class="card__count-label">ayahs</span></span>
    </a>
  `,
  styleUrl: './juz-card.scss',
})
export class JuzCardComponent {
  readonly juz = input.required<Juz>();

  /** One spoken label, so the reference arrows are not read as punctuation. */
  protected readonly ariaLabel = computed(() => {
    const juz = this.juz();
    return `Juz ${juz.number}, from ${juz.startSurahName} ayah ${juz.startAyah} `
      + `to ${juz.endSurahName} ayah ${juz.endAyah}, ${juz.ayahCount} ayahs`;
  });
}
