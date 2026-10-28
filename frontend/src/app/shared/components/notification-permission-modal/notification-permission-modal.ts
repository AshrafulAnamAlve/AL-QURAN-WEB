import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon';
import { PrayerNotificationService } from '../../../core/services/prayer-notification';
import { LanguageService } from '../../../core/services/language';
import { MobileHardwareService } from '../../../core/services/mobile-hardware.service';

/**
 * In-app permission modal explaining the benefits of granting notification
 * permissions (exact-time Adhan playback, lock-screen alarms, offline multi-day alarms).
 */
@Component({
  selector: 'aq-notification-permission-modal',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './notification-permission-modal.html',
  styleUrl: './notification-permission-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationPermissionModalComponent {
  protected readonly notificationService = inject(PrayerNotificationService);
  protected readonly language = inject(LanguageService);
  protected readonly mobileHardware = inject(MobileHardwareService);

  readonly isBn = computed(() => this.language.isBn());
  readonly isVisible = this.notificationService.showPermissionModal;

  readonly isLoading = signal<boolean>(false);
  readonly isSuccess = signal<boolean>(false);

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isVisible() && !this.isLoading()) {
      this.dismiss();
    }
  }

  async allowPermission(): Promise<void> {
    if (this.isLoading() || this.isSuccess()) return;

    this.isLoading.set(true);

    try {
      const granted = await this.notificationService.requestPermission();
      if (granted) {
        this.isSuccess.set(true);
        this.notificationService.toggleMaster(true);
        void this.mobileHardware.hapticSuccess();

        // Brief delay to display joyful confirmation feedback
        setTimeout(() => {
          this.notificationService.closePermissionModal();
          this.isSuccess.set(false);
          this.isLoading.set(false);
        }, 900);
        return;
      }
    } catch (err) {
      console.warn('Error during permission request:', err);
    }

    this.isLoading.set(false);
    this.notificationService.closePermissionModal();
  }

  dismiss(): void {
    if (this.isLoading()) return;
    this.notificationService.dismissPermissionModal();
  }
}
