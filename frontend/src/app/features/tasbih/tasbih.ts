import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DhikrService } from '../../core/services/dhikr';
import { DhikrCategory, DhikrItem } from '../../core/models/dhikr';
import { MobileHardwareService } from '../../core/services/mobile-hardware.service';
import { IconComponent } from '../../shared/components/icon/icon';
import { IconName } from '../../shared/components/icon/icon-registry';

@Component({
  selector: 'aq-tasbih',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IconComponent],
  templateUrl: './tasbih.html',
  styleUrl: './tasbih.scss',
})
export class TasbihPage {
  protected readonly dhikrService = inject(DhikrService);
  protected readonly mobileHardware = inject(MobileHardwareService);

  readonly isBn = this.dhikrService.isBn;
  readonly activeDhikr = this.dhikrService.activeDhikr;
  readonly count = this.dhikrService.count;
  readonly laps = this.dhikrService.laps;
  readonly target = this.dhikrService.target;
  readonly settings = this.dhikrService.settings;
  readonly streak = this.dhikrService.dailyStreak;
  readonly todayRecord = this.dhikrService.todayRecord;
  readonly filteredItems = this.dhikrService.filteredItems;
  readonly currentCategory = this.dhikrService.categoryFilter;
  readonly searchQuery = this.dhikrService.searchQuery;
  readonly toastMessage = this.dhikrService.toastMessage;

  customTargetInput = '';

  setTargetNumber(num: number): void {
    if (num > 0) {
      this.dhikrService.setTarget(num);
      this.dhikrService.showToast(
        this.isBn()
          ? `লক্ষ্য নির্ধারণ করা হয়েছে: ${this.toBnDigits(num)} বার`
          : `Target set to: ${num}`,
      );
    }
  }

  onCustomTargetSubmit(val: string): void {
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed > 0) {
      this.setTargetNumber(parsed);
    }
  }

  readonly categories: { id: DhikrCategory; nameBn: string; nameEn: string; icon: IconName }[] = [
    { id: 'all', nameBn: 'সকল জিকির', nameEn: 'All Adhkar', icon: 'sparkles' },
    { id: 'morning', nameBn: 'সকালের জিকির', nameEn: 'Morning', icon: 'sun' },
    { id: 'evening', nameBn: 'সন্ধ্যার জিকির', nameEn: 'Evening', icon: 'moon' },
    { id: 'post_prayer', nameBn: 'নামাজের পরের জিকির', nameEn: 'Post-Prayer', icon: 'clock' },
    { id: 'sleep', nameBn: 'ঘুমানোর জিকির', nameEn: 'Bedtime', icon: 'bookOpen' },
  ];

  onTap(): void {
    const currentCount = this.count();
    const currentTarget = this.target();
    this.dhikrService.incrementCount();
    
    if (currentCount + 1 >= currentTarget && currentTarget > 0) {
      this.mobileHardware.hapticSuccess();
    } else {
      this.mobileHardware.hapticTap();
    }
  }

  onReset(): void {
    this.dhikrService.resetCount();
    this.mobileHardware.hapticTap();
  }

  onDecrement(): void {
    this.dhikrService.decrementCount();
  }

  setPreset(preset: number): void {
    this.dhikrService.setTarget(preset);
  }

  selectDhikr(item: DhikrItem): void {
    this.dhikrService.setActiveDhikr(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.dhikrService.showToast(
      this.isBn()
        ? `“${item.nameBn}” তসবিহতে নির্ধারণ করা হয়েছে`
        : `"${item.nameEn}" set to Tasbih counter`,
    );
  }

  setCategory(cat: DhikrCategory): void {
    this.dhikrService.setCategoryFilter(cat);
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.dhikrService.setSearchQuery(input.value);
  }

  clearSearch(): void {
    this.dhikrService.setSearchQuery('');
  }

  toggleSound(): void {
    this.dhikrService.toggleSound();
  }

  toggleVibration(): void {
    this.dhikrService.toggleVibration();
  }

  toBnDigits(num: number): string {
    const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(num).replace(/\d/g, (d) => bn[Number(d)] ?? d);
  }
}
