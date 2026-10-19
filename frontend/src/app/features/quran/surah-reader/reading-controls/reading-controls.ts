import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { READING_LIMITS, TRANSLATION_MODES, TranslationMode } from '../../../../core/models/reading-settings';
import { ReadingSettingsService } from '../../../../core/services/reading-settings';
import { LanguageService } from '../../../../core/services/language';
import { IconComponent } from '../../../../shared/components/icon/icon';

/**
 * The reading preferences panel: text sizes, line spacing, column width and
 * which translations to show.
 *
 * Collapsed by default. Reading the Quran should be the thing on screen, not a
 * row of sliders - but they are one tap away and every change applies live.
 */
@Component({
  selector: 'aq-reading-controls',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  templateUrl: './reading-controls.html',
  styleUrl: './reading-controls.scss',
})
export class ReadingControlsComponent {
  private readonly settings = inject(ReadingSettingsService);
  protected readonly lang = inject(LanguageService);

  protected readonly isBn = this.lang.isBn;
  protected readonly limits = READING_LIMITS;
  protected readonly modes = TRANSLATION_MODES;

  protected readonly open = signal(false);

  protected readonly arabicSize = this.settings.arabicSize;
  protected readonly translationSize = this.settings.translationSize;
  protected readonly lineHeight = this.settings.lineHeight;
  protected readonly readingWidth = this.settings.readingWidth;
  protected readonly translationMode = this.settings.translationMode;
  protected readonly showPronunciation = this.settings.showBanglaPronunciation;
  protected readonly isDefault = this.settings.isDefault;

  toggle(): void {
    this.open.update((value) => !value);
  }

  setMode(mode: TranslationMode): void {
    this.settings.setTranslationMode(mode);
  }

  togglePronunciation(): void {
    this.settings.toggleBanglaPronunciation();
  }

  onArabicSize(event: Event): void {
    this.settings.setArabicSize(readNumber(event));
  }

  onTranslationSize(event: Event): void {
    this.settings.setTranslationSize(readNumber(event));
  }

  onLineHeight(event: Event): void {
    this.settings.setLineHeight(readNumber(event));
  }

  onReadingWidth(event: Event): void {
    this.settings.setReadingWidth(readNumber(event));
  }

  reset(): void {
    this.settings.resetLayout();
  }
}

function readNumber(event: Event): number {
  return Number((event.target as HTMLInputElement).value);
}
