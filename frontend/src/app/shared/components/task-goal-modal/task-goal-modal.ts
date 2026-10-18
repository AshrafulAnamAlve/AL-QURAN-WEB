import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../../core/services/task';
import { LanguageService } from '../../../core/services/language';
import { IconComponent } from '../icon/icon';

@Component({
  selector: 'aq-task-goal-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './task-goal-modal.html',
  styleUrl: './task-goal-modal.scss',
})
export class TaskGoalModalComponent {
  protected readonly taskService = inject(TaskService);
  protected readonly lang = inject(LanguageService);

  readonly isBn = this.lang.isBn;

  @Output() readonly closed = new EventEmitter<void>();

  // Local editable form state initialized from current settings
  readonly readingGoal = signal<number>(this.taskService.settings().readingGoalAyahs);
  readonly listeningGoal = signal<number>(this.taskService.settings().listeningGoalMinutes);
  readonly reminderEnabled = signal<boolean>(this.taskService.settings().reminderEnabled);
  readonly reminderTime = signal<string>(this.taskService.settings().reminderTime);
  readonly reminderSound = signal<boolean>(this.taskService.settings().reminderSound);

  readonly notificationStatus = this.taskService.notificationPermission;

  // Preset quick buttons for reading goal
  readonly readingPresets = [5, 10, 20, 30, 50];
  readonly listeningPresets = [10, 15, 20, 30, 45];

  close(): void {
    this.closed.emit();
  }

  setReadingGoal(val: number): void {
    this.readingGoal.set(val);
  }

  setListeningGoal(val: number): void {
    this.listeningGoal.set(val);
  }

  async requestPermission(): Promise<void> {
    await this.taskService.requestNotificationPermission();
  }

  sendTestReminder(): void {
    this.taskService.triggerTestNotification();
  }

  save(): void {
    this.taskService.updateSettings({
      readingGoalAyahs: Math.max(1, Math.min(1000, this.readingGoal())),
      listeningGoalMinutes: Math.max(1, Math.min(300, this.listeningGoal())),
      reminderEnabled: this.reminderEnabled(),
      reminderTime: this.reminderTime(),
      reminderSound: this.reminderSound(),
    });
    this.close();
  }

  resetToday(): void {
    this.taskService.resetTodayProgress();
  }

  toBnDigits(val: string | number): string {
    return String(val).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[parseInt(d, 10)]);
  }
}
