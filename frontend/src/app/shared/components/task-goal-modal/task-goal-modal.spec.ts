import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TaskGoalModalComponent } from './task-goal-modal';
import { TaskService } from '../../../core/services/task';
import { StorageService } from '../../../core/services/storage';

describe('TaskGoalModalComponent', () => {
  let component: TaskGoalModalComponent;
  let fixture: ComponentFixture<TaskGoalModalComponent>;
  let taskService: TaskService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskGoalModalComponent],
      providers: [
        TaskService,
        StorageService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskGoalModalComponent);
    component = fixture.componentInstance;
    taskService = TestBed.inject(TaskService);
    fixture.detectChanges();
  });

  it('creates the goal modal and initializes values from service', () => {
    expect(component).toBeTruthy();
    expect(component.readingGoal()).toBe(taskService.settings().readingGoalAyahs);
    expect(component.listeningGoal()).toBe(taskService.settings().listeningGoalMinutes);
  });

  it('updates reading goal preset when clicked', () => {
    component.setReadingGoal(20);
    expect(component.readingGoal()).toBe(20);
  });

  it('saves settings to service and emits closed event', () => {
    const closedSpy = vi.spyOn(component.closed, 'emit');
    const updateSpy = vi.spyOn(taskService, 'updateSettings');

    component.setReadingGoal(30);
    component.save();

    expect(updateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        readingGoalAyahs: 30,
      }),
    );
    expect(closedSpy).toHaveBeenCalled();
  });

  it('resets today progress when reset button clicked', () => {
    const resetSpy = vi.spyOn(taskService, 'resetTodayProgress');
    component.resetToday();
    expect(resetSpy).toHaveBeenCalled();
  });
});
