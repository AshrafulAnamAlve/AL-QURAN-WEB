import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HadithService } from '../../../core/services/hadith';
import { LanguageService } from '../../../core/services/language';
import { ShareService } from '../../../core/services/share';
import { IconComponent } from '../icon/icon';

@Component({
  selector: 'aq-daily-hadith-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  templateUrl: './daily-hadith-modal.html',
  styleUrl: './daily-hadith-modal.scss',
})
export class DailyHadithModalComponent {
  protected readonly hadithService = inject(HadithService);
  protected readonly lang = inject(LanguageService);
  private readonly router = inject(Router);
  private readonly share = inject(ShareService);

  protected readonly isBn = this.lang.isBn;
  protected readonly hadith = this.hadithService.dailyHadith;
  protected readonly isDismissed = this.hadithService.isDailyModalDismissed;

  protected readonly isVisible = computed(() => !this.isDismissed());
  protected readonly copied = signal(false);
  protected readonly dontShowAgain = signal(true);

  close(): void {
    this.hadithService.dismissDailyModal(this.dontShowAgain());
  }

  readMore(): void {
    this.close();
    this.router.navigate(['/hadith']);
  }

  async copyHadith(): Promise<void> {
    const h = this.hadith();
    const narrator = this.isBn() ? h.narratorBn : h.narratorEn;
    const book = this.isBn() ? h.bookBn : h.book;
    const text = [
      `[${book} - ${h.hadithNumber}]`,
      narrator,
      '',
      h.arabic,
      '',
      this.isBn() ? h.bangla : h.english,
      '',
      'Al-Quran App',
    ].join('\n');

    const success = await this.share.copy(text);
    if (success) {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    }
  }

  toggleDontShowAgain(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.dontShowAgain.set(checked);
  }

  toBnDigits(val: string | number): string {
    return String(val).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[parseInt(d, 10)]);
  }
}
