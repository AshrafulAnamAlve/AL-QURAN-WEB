import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProphetService, ProphetFilterEra } from '../../core/services/prophet';
import { LanguageService } from '../../core/services/language';
import { MobileHardwareService } from '../../core/services/mobile-hardware.service';
import { IconComponent } from '../../shared/components/icon/icon';
import { Prophet } from '../../core/models/prophet';

@Component({
  selector: 'aq-prophets',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, IconComponent],
  templateUrl: './prophets.html',
  styleUrl: './prophets.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProphetsPage implements OnInit, OnDestroy {
  protected readonly prophetService = inject(ProphetService);
  protected readonly lang = inject(LanguageService);
  private readonly mobile = inject(MobileHardwareService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  @ViewChild('detailContent') detailContentRef?: ElementRef<HTMLElement>;

  // Reading view font size
  readonly fontSize = signal<'sm' | 'md' | 'lg'>('md');

  // Local language toggle (allows overriding for just this page if user wishes)
  readonly activeLang = signal<'bn' | 'en'>(this.lang.isBn() ? 'bn' : 'en');
  readonly isBn = computed(() => this.activeLang() === 'bn');

  // Filter eras
  readonly filterEras: { id: ProphetFilterEra; labelBn: string; labelEn: string }[] = [
    { id: 'all', labelBn: 'সকল ২৫ জন নবী', labelEn: 'All 25 Prophets' },
    { id: 'early', labelBn: 'আদি নবীগণ (১-৫)', labelEn: 'Early Era (1-5)' },
    { id: 'abrahamic', labelBn: 'ইবরাহীমী ধারা (৬-১৩)', labelEn: 'Abrahamic Era (6-13)' },
    { id: 'israelite', labelBn: 'বনী ইসরাঈল (১৪-২৪)', labelEn: 'Bani Israel (14-24)' },
    { id: 'final', labelBn: 'মুহাম্মদ (ﷺ)', labelEn: 'Final Prophet (25)' },
  ];

  ngOnInit(): void {
    // Check if query param or path param requested a specific prophet
    this.route.queryParams.subscribe((params) => {
      if (params['id']) {
        this.prophetService.selectProphet(params['id']);
      }
    });
  }

  ngOnDestroy(): void {
    this.prophetService.stopAudio();
  }

  setLang(l: 'bn' | 'en'): void {
    this.activeLang.set(l);
    this.mobile.hapticTap();
    // If audio is playing, switch language for audio too
    const current = this.prophetService.activeProphet();
    if (current && this.prophetService.isAudioPlaying()) {
      this.prophetService.startAudio(current, l);
    }
  }

  setFontSize(size: 'sm' | 'md' | 'lg'): void {
    this.fontSize.set(size);
    this.mobile.hapticTap();
  }

  selectEra(era: ProphetFilterEra): void {
    this.prophetService.selectedEra.set(era);
    this.mobile.hapticTap();
  }

  openProphet(prophet: Prophet): void {
    this.prophetService.selectProphet(prophet.id);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { id: prophet.id },
      queryParamsHandling: 'merge',
    });
    this.mobile.hapticTap();
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  backToList(): void {
    this.prophetService.stopAudio();
    this.prophetService.selectProphet(null);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { id: null },
      queryParamsHandling: 'merge',
    });
    this.mobile.hapticTap();
  }

  toggleBookmark(num: number, event?: Event): void {
    event?.stopPropagation();
    this.prophetService.toggleBookmark(num);
    this.mobile.hapticTap();
  }

  playAudio(): void {
    const prophet = this.prophetService.activeProphet();
    if (!prophet) return;

    if (this.prophetService.isAudioPaused()) {
      this.prophetService.resumeAudio();
    } else {
      this.prophetService.startAudio(prophet, this.activeLang());
    }
    this.mobile.hapticTap();
  }

  pauseAudio(): void {
    this.prophetService.pauseAudio();
    this.mobile.hapticTap();
  }

  stopAudio(): void {
    this.prophetService.stopAudio();
    this.mobile.hapticTap();
  }

  setSpeed(speed: number): void {
    this.prophetService.setSpeed(speed);
    this.mobile.hapticTap();
  }

  toBanglaDigits(val: number | string): string {
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(val).replace(/[0-9]/g, (d) => bnDigits[parseInt(d, 10)]);
  }
}
