import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { DesktopService } from '../../../core/services/desktop';
import { LanguageService } from '../../../core/services/language';
import { IconComponent } from '../icon/icon';

@Component({
  selector: 'aq-desktop-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  templateUrl: './desktop-modal.html',
  styleUrl: './desktop-modal.scss',
})
export class DesktopModalComponent {
  protected readonly desktop = inject(DesktopService);
  protected readonly lang = inject(LanguageService);

  readonly isBn = this.lang.isBn;
  readonly activeTab = this.desktop.modalTab;

  readonly copiedKey = signal<string | null>(null);

  @HostListener('window:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.close();
    }
  }

  setTab(tab: 'download' | 'extension' | 'shortcuts'): void {
    this.desktop.modalTab.set(tab);
  }

  close(): void {
    this.desktop.closeDownloadModal();
  }

  copyShortcut(key: string): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(key).then(() => {
        this.copiedKey.set(key);
        setTimeout(() => this.copiedKey.set(null), 2000);
      });
    }
  }
}
