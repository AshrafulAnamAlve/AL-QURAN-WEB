import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon';
import { IslamicChatService } from '../../../core/services/islamic-chat';
import { LanguageService } from '../../../core/services/language';
import { ISLAMIC_QUICK_PROMPTS, QuickPrompt } from '../../../core/models/islamic-chat';

@Component({
  selector: 'aq-islamic-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './islamic-chat-widget.html',
  styleUrl: './islamic-chat-widget.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IslamicChatWidgetComponent implements OnDestroy {
  protected readonly chatService = inject(IslamicChatService);
  protected readonly lang = inject(LanguageService);

  @ViewChild('messagesContainer') private messagesContainer?: ElementRef<HTMLDivElement>;
  @ViewChild('chatInput') private chatInput?: ElementRef<HTMLTextAreaElement>;

  readonly userInput = signal<string>('');
  readonly copyFeedback = signal<string | null>(null);

  readonly isOpen = this.chatService.isOpen;
  readonly messages = this.chatService.messages;
  readonly isLoading = this.chatService.isLoading;
  readonly isBanned = this.chatService.isBanned;
  readonly strikes = this.chatService.strikes;
  readonly banRemainingFormatted = this.chatService.banRemainingFormatted;
  readonly isRateLimited = this.chatService.isRateLimited;
  readonly rateLimitCountdown = this.chatService.rateLimitCountdown;

  readonly isBn = this.lang.isBn;
  readonly quickPrompts = ISLAMIC_QUICK_PROMPTS;

  constructor() {
    // Auto-scroll on new messages
    effect(() => {
      this.messages();
      this.scrollToBottom();
    });

    // Handle open/close side effects (focus and background scroll locking)
    effect(() => {
      const open = this.isOpen();
      if (typeof document !== 'undefined') {
        if (open) {
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = '';
        }
      }

      if (open) {
        setTimeout(() => {
          this.chatInput?.nativeElement.focus();
          this.scrollToBottom();
        }, 150);
      }
    });
  }

  ngOnDestroy(): void {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }

  toggle(): void {
    this.chatService.toggle();
  }

  close(): void {
    this.chatService.close();
  }

  clearHistory(): void {
    this.chatService.clearHistory();
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  send(): void {
    const text = this.userInput().trim();
    if (!text || this.isLoading() || this.isBanned() || this.isRateLimited()) return;

    this.chatService.sendMessage(text);
    this.userInput.set('');

    if (this.chatInput?.nativeElement) {
      this.chatInput.nativeElement.style.height = 'auto';
    }
  }

  selectPrompt(prompt: QuickPrompt): void {
    if (this.isLoading() || this.isBanned() || this.isRateLimited()) return;
    const text = this.isBn() ? prompt.textBn : prompt.textEn;
    this.chatService.sendMessage(text);
  }

  async copyMessage(content: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(content);
      this.copyFeedback.set(this.isBn() ? 'অনুলিপি করা হয়েছে!' : 'Copied to clipboard!');
      setTimeout(() => this.copyFeedback.set(null), 2000);
    } catch {
      // ignore
    }
  }

  autoResize(textarea: HTMLTextAreaElement): void {
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  }

  toBanglaDigits(val: string | number): string {
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(val).replace(/[0-9]/g, (d) => bnDigits[parseInt(d, 10)]);
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.messagesContainer?.nativeElement) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      }
    }, 60);
  }
}
