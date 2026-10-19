import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { LoggerService } from './logger';

/** What to put on the clipboard or into a share sheet. */
export interface AyahShareContent {
  readonly surahEnglishName: string;
  readonly surahNumber: number;
  readonly ayahNumber: number;
  readonly arabic: string;
  readonly pronunciation?: string;
  readonly translations: readonly string[];
}

/** What actually happened, so the UI can say the right thing. */
export type ShareOutcome = 'shared' | 'copied' | 'failed';

/**
 * Copying and sharing an ayah.
 *
 * Uses the Web Share API where the browser has it - on a phone that opens the
 * native share sheet - and falls back to the clipboard everywhere else, which is
 * what desktop browsers need.
 */
@Injectable({ providedIn: 'root' })
export class ShareService {
  private readonly document = inject(DOCUMENT);
  private readonly logger = inject(LoggerService);

  /** Builds the text used for both copying and sharing. */
  format(content: AyahShareContent): string {
    const reference = `${content.surahEnglishName} — ${content.surahNumber}:${content.ayahNumber}`;
    const translations = content.translations.filter((text) => text.trim().length > 0);
    const pronunciationBlock = content.pronunciation?.trim()
      ? [`উচ্চারণ: ${content.pronunciation.trim()}`]
      : [];

    return [
      reference,
      '',
      content.arabic,
      ...pronunciationBlock.flatMap((text) => ['', text]),
      ...translations.flatMap((text) => ['', text]),
      '',
      'Al-Quran',
    ]
      .join('\n')
      .replace(/\n{3,}/g, '\n\n');
  }

  /** Link straight to this ayah. */
  buildUrl(surahNumber: number, ayahNumber: number): string {
    const base = this.document.defaultView?.location.origin ?? environment.appUrl;
    return `${base}/quran/${surahNumber}#ayah-${ayahNumber}`;
  }

  /**
   * Shares the ayah, falling back to the clipboard.
   * Returns what happened so the caller can show "Shared" or "Copied".
   */
  async shareAyah(content: AyahShareContent): Promise<ShareOutcome> {
    const text = this.format(content);
    const url = this.buildUrl(content.surahNumber, content.ayahNumber);
    const view = this.document.defaultView;

    if (view?.navigator.share) {
      try {
        await view.navigator.share({
          title: `${content.surahEnglishName} ${content.surahNumber}:${content.ayahNumber}`,
          text,
          url,
        });
        return 'shared';
      } catch (cause) {
        // Dismissing the share sheet raises AbortError. That is a choice, not a
        // failure, so do not fall through to copying.
        if (cause instanceof DOMException && cause.name === 'AbortError') {
          return 'failed';
        }

        this.logger.debug('Web Share failed, falling back to the clipboard', cause);
      }
    }

    return (await this.copy(`${text}\n${url}`)) ? 'copied' : 'failed';
  }

  /** Copies the ayah as formatted text. */
  async copyAyah(content: AyahShareContent): Promise<boolean> {
    return this.copy(this.format(content));
  }

  /** Writes text to the clipboard, reporting whether it worked. */
  async copy(text: string): Promise<boolean> {
    const view = this.document.defaultView;

    if (view?.navigator.clipboard) {
      try {
        await view.navigator.clipboard.writeText(text);
        return true;
      } catch (cause) {
        this.logger.debug('Clipboard API refused, trying the legacy path', cause);
      }
    }

    return this.legacyCopy(text);
  }

  /**
   * Fallback for browsers without the async clipboard API, and for pages served
   * over plain http where it is unavailable.
   */
  private legacyCopy(text: string): boolean {
    try {
      const area = this.document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';

      this.document.body.appendChild(area);
      area.select();

      const copied = this.document.execCommand('copy');
      this.document.body.removeChild(area);

      return copied;
    } catch (cause) {
      this.logger.warn('Could not copy to the clipboard', cause);
      return false;
    }
  }
}
