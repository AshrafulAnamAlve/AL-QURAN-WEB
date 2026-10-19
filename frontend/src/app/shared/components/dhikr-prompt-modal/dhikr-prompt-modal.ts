import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DhikrService } from '../../../core/services/dhikr';
import { IconComponent } from '../icon/icon';

@Component({
  selector: 'aq-dhikr-prompt-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, IconComponent],
  templateUrl: './dhikr-prompt-modal.html',
  styleUrl: './dhikr-prompt-modal.scss',
})
export class DhikrPromptModalComponent {
  protected readonly dhikrService = inject(DhikrService);

  readonly prompt = this.dhikrService.activePrompt;
  readonly count = this.dhikrService.promptCount;
  readonly isVisible = this.dhikrService.isPromptVisible;
  readonly isBn = this.dhikrService.isBn;

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isVisible()) {
      this.skip();
    }
  }

  increment(): void {
    this.dhikrService.incrementPromptCount();
  }

  complete(): void {
    this.dhikrService.completePrompt();
  }

  skip(): void {
    this.dhikrService.skipPrompt();
  }

  dismissToday(): void {
    this.dhikrService.dismissPromptForToday();
  }

  toBnDigits(num: number): string {
    const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(num).replace(/\d/g, (d) => bn[Number(d)] ?? d);
  }
}
