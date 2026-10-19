import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DhikrService } from '../../core/services/dhikr';
import { DhikrCategory, DhikrItem } from '../../core/models/dhikr';
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

  readonly presetTargets = [33, 99, 100, 0];

  readonly trinitySteps = [
    { id: 'tasbih_subhanallah', target: 33, labelBn: 'সুবহানাল্লাহ (৩৩)', labelEn: 'SubhanAllah (33)' },
    { id: 'tasbih_alhamdulillah', target: 33, labelBn: 'আলহামদুলিল্লাহ (৩৩)', labelEn: 'Alhamdulillah (33)' },
    { id: 'tasbih_allahuakbar', target: 34, labelBn: 'আল্লাহু আকবার (৩৪)', labelEn: 'Allahu Akbar (34)' },
    { id: 'tahlil_complete', target: 1, labelBn: 'তাহলিল (১)', labelEn: 'Tahlil (1)' },
  ];

  isTrinityActive(): boolean {
    const id = this.activeDhikr().id;
    return this.trinitySteps.some((s) => s.id === id);
  }

  currentTrinityStepIndex(): number {
    const id = this.activeDhikr().id;
    return this.trinitySteps.findIndex((s) => s.id === id);
  }

  startTrinitySequence(): void {
    const subhanAllah = this.dhikrService.allItems.find((i) => i.id === 'tasbih_subhanallah');
    if (subhanAllah) {
      this.dhikrService.setActiveDhikr(subhanAllah);
      this.dhikrService.setTarget(33);
      this.dhikrService.updateSettings({ autoAdvanceTrinity: true });
      this.dhikrService.showToast(
        this.isBn()
          ? 'সুন্নাহ ১০০ তসবিহ মোড চালু হয়েছে (৩৩+৩৩+৩৪+১)'
          : 'Sunnah 100-Tasbih mode active (33+33+34+1)',
      );
    }
  }

  toggleAutoAdvance(): void {
    this.dhikrService.toggleAutoAdvanceTrinity();
  }

  jumpToTrinityStep(stepId: string): void {
    const item = this.dhikrService.allItems.find((i) => i.id === stepId);
    const step = this.trinitySteps.find((s) => s.id === stepId);
    if (item && step) {
      this.dhikrService.setActiveDhikr(item);
      this.dhikrService.setTarget(step.target);
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
    this.dhikrService.incrementCount();
  }

  onReset(): void {
    this.dhikrService.resetCount();
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
