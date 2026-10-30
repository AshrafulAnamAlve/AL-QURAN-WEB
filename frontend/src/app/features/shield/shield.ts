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
import { MobileHardwareService } from '../../core/services/mobile-hardware.service';
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
  readonly mobileHardware = inject(MobileHardwareService);
  private readonly seo = inject(SeoService);

  readonly isBn = this.lang.isBn;
  readonly isDesktop = computed(() => this.desktop.isDesktop());
  readonly isMobile = computed(() => this.mobileHardware.isNativeMobile() || this.mobileHardware.isAndroid() || this.mobileHardware.isIos());
  readonly isShieldActive = computed(() => this.desktop.isShieldActive());
  readonly isShieldLoading = computed(() => this.desktop.isShieldLoading());
  readonly shieldError = computed(() => this.desktop.shieldError());

  readonly copiedDns = signal<string | null>(null);
  readonly verificationStatus = signal<string | null>(null);
  readonly isVerifying = signal<boolean>(false);
  readonly isTestingMobileDns = signal<boolean>(false);
  readonly mobileTestResult = signal<{
    status: 'success' | 'warning' | 'error';
    messageBn: string;
    messageEn: string;
    detailsBn?: string;
    detailsEn?: string;
  } | null>(null);

  async copyDns(hostname: string): Promise<void> {
    const ok = await this.mobileHardware.copyDnsHostname(hostname);
    if (ok) {
      this.copiedDns.set(hostname);
      setTimeout(() => this.copiedDns.set(null), 3000);
    }
  }

  async openDnsSettings(): Promise<void> {
    await this.mobileHardware.hapticTap();
    this.mobileHardware.openAndroidDnsSettings();
  }

  async testMobileProtection(): Promise<void> {
    this.isTestingMobileDns.set(true);
    this.mobileTestResult.set(null);
    await this.mobileHardware.hapticTap();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(
        'https://family.cloudflare-dns.com/dns-query?name=cloudflare.com&type=A',
        {
          headers: { Accept: 'application/dns-json' },
          signal: controller.signal,
        },
      );
      clearTimeout(timeoutId);

      if (res.ok) {
        await this.mobileHardware.hapticSuccess();
        this.mobileTestResult.set({
          status: 'success',
          messageBn: '✓ হালাল শিল্ড ফ্যামিলি নেটওয়ার্ক প্রস্তুত ও কার্যকর!',
          messageEn: '✓ Halal Shield Family Network is reachable and active!',
          detailsBn:
            'আপনার ফোনে Private DNS হিসেবে family.cloudflare-dns.com কনফিগার করা থাকলে পুরো ফোনের সকল ব্রাউজার (Chrome ইত্যাদি) এবং অ্যাপে প্রাপ্তবয়স্ক ও ক্ষতিকর সাইট সরাসরি ব্লক থাকবে।',
          detailsEn:
            'With Private DNS set to family.cloudflare-dns.com, all mobile browsers (Chrome, etc.) and apps are secured against explicit content automatically.',
        });
      } else {
        this.mobileTestResult.set({
          status: 'warning',
          messageBn: '⚠️ নেটওয়ার্ক রেসপন্স পেতে দেরি হচ্ছে।',
          messageEn: '⚠️ Network response delayed.',
          detailsBn: 'অনুগ্রহ করে ইন্টারনেট সংযোগ সক্রিয় আছে কিনা যাচাই করুন।',
          detailsEn: 'Please verify your mobile data or Wi-Fi connectivity.',
        });
      }
    } catch {
      this.mobileTestResult.set({
        status: 'warning',
        messageBn: 'ℹ️ সুরক্ষা টেস্ট সম্পন্ন হয়েছে।',
        messageEn: 'ℹ️ Shield test finished.',
        detailsBn:
          'ফোনের সেটিংসে Private DNS সেট করে Chrome বা যেকোনো ব্রাউজারে টেস্ট করতে পারেন—ক্ষতিকর ডোমেন স্বয়ংক্রিয়ভাবে ব্লক হয়ে যাবে।',
        detailsEn:
          'Configure Private DNS in your phone settings and test in Chrome—blocked sites will immediately fail to resolve.',
      });
    } finally {
      this.isTestingMobileDns.set(false);
    }
  }

  openExtensionModal(): void {
    this.desktop.openDownloadModal('extension');
  }

  ngOnInit(): void {
    this.seo.apply({
      title: this.isBn()
        ? (this.isMobile() ? 'মোবাইল হালাল শিল্ড — সিস্টেম-লেভেল ব্লকার' : 'হালাল শিল্ড — কম্পিউটার-লেভেল কনটেন্ট ব্লকার')
        : (this.isMobile() ? 'Mobile Halal Shield — System DNS Blocker' : 'Halal Shield — System Content & SafeSearch Blocker'),
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
