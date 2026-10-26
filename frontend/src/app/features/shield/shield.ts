import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { DesktopService } from '../../core/services/desktop';
import { LanguageService } from '../../core/services/language';
import { SeoService } from '../../core/services/seo';
import { IconComponent } from '../../shared/components/icon/icon';

@Component({
  selector: 'aq-shield',
  standalone: true,
  imports: [RouterLink, IconComponent],
  templateUrl: './shield.html',
  styleUrls: ['./shield.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShieldPage implements OnInit {
  readonly desktop = inject(DesktopService);
  readonly lang = inject(LanguageService);
  private readonly seo = inject(SeoService);

  readonly isBn = this.lang.isBn;
  readonly isDesktop = computed(() => this.desktop.isDesktop());
  readonly isShieldActive = computed(() => this.desktop.isShieldActive());
  readonly isShieldLoading = computed(() => this.desktop.isShieldLoading());
  readonly shieldError = computed(() => this.desktop.shieldError());

  readonly verificationStatus = signal<string | null>(null);
  readonly isVerifying = signal<boolean>(false);

  openExtensionModal(): void {
    this.desktop.openDownloadModal('extension');
  }

  ngOnInit(): void {
    this.seo.apply({
      title: this.isBn()
        ? 'হালাল শিল্ড — কম্পিউটার-লেভেল কনটেন্ট ব্লকার'
        : 'Halal Shield — System Content & SafeSearch Blocker',
      description:
        'Free system-wide blocker protecting your family and PC from adult content, harmful websites, and enforcing SafeSearch across all browsers.',
    });

    if (this.isDesktop()) {
      void this.desktop.checkShieldStatus();
    }
  }

  async toggleShield(): Promise<void> {
    this.verificationStatus.set(null);
    await this.desktop.toggleShield();
  }

  async verifyProtection(): Promise<void> {
    this.isVerifying.set(true);
    this.verificationStatus.set(null);

    try {
      const active = await this.desktop.checkShieldStatus();
      if (active) {
        this.verificationStatus.set(
          this.isBn()
            ? '✓ হালাল শিল্ড সঠিকভাবে সক্রিয় রয়েছে। আপনার ব্রাউজার ও সিস্টেম সুরক্ষিত।'
            : '✓ Halal Shield is active. Your browsers and network are protected.',
        );
      } else {
        this.verificationStatus.set(
          this.isBn()
            ? '✕ হালাল শিল্ড বর্তমানে নিষ্ক্রিয় রয়েছে। সুরক্ষা চালু করতে নিচের বোতামে চাপুন।'
            : '✕ Halal Shield is currently inactive. Click Enable Shield to protect.',
        );
      }
    } finally {
      this.isVerifying.set(false);
    }
  }
}
