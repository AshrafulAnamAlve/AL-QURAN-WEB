import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DesktopService } from '../../core/services/desktop';
import { LanguageService } from '../../core/services/language';
import { PwaService } from '../../core/services/pwa';
import { SeoService } from '../../core/services/seo';
import { IconComponent } from '../../shared/components/icon/icon';

export type DownloadFilterTab = 'all' | 'desktop' | 'extension' | 'mobile';

@Component({
  selector: 'aq-download-page',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './download.html',
  styleUrls: ['./download.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DownloadPage implements OnInit {
  protected readonly desktop = inject(DesktopService);
  protected readonly lang = inject(LanguageService);
  protected readonly pwa = inject(PwaService);
  private readonly seo = inject(SeoService);

  readonly isBn = this.lang.isBn;
  readonly activeTab = signal<DownloadFilterTab>('all');
  readonly downloadLinks = this.desktop.downloadLinks;
  readonly canInstallPwa = this.pwa.canInstall;
  readonly isPwaInstalled = this.pwa.isInstalled;

  readonly pwaInstallOutcome = signal<string | null>(null);

  ngOnInit(): void {
    this.seo.apply({
      title: this.isBn()
        ? 'অ্যাপ ও এক্সটেনশন ডাউনলোড — Al-Quran Apps'
        : 'Download Al-Quran Apps & Halal Shield',
      description:
        'Download Al-Quran for Windows Desktop (Standalone & Setup), Chrome & Edge Browser Extension (Halal Web Shield), and Mobile Apps.',
    });
  }

  setTab(tab: DownloadFilterTab): void {
    this.activeTab.set(tab);
  }

  async installPwa(): Promise<void> {
    const accepted = await this.pwa.promptInstall();
    if (accepted) {
      this.pwaInstallOutcome.set(
        this.isBn() ? 'আল-কুরআন ওয়েব অ্যাপ সফলভাবে ইনস্টল হয়েছে!' : 'Al-Quran Web App installed successfully!'
      );
    }
  }
}
