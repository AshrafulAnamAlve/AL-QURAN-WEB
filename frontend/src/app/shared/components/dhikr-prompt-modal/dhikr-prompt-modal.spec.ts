import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DhikrPromptModalComponent } from './dhikr-prompt-modal';
import { DhikrService } from '../../../core/services/dhikr';
import { StorageService } from '../../../core/services/storage';
import { LanguageService } from '../../../core/services/language';

describe('DhikrPromptModalComponent', () => {
  let component: DhikrPromptModalComponent;
  let fixture: ComponentFixture<DhikrPromptModalComponent>;
  let dhikrService: DhikrService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DhikrPromptModalComponent],
      providers: [
        provideRouter([]),
        DhikrService,
        StorageService,
        LanguageService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DhikrPromptModalComponent);
    component = fixture.componentInstance;
    dhikrService = TestBed.inject(DhikrService);

    // Ensure prompt is visible for testing
    dhikrService.initHomePrompt();
    fixture.detectChanges();
  });

  it('should create the prompt modal component', () => {
    expect(component).toBeTruthy();
  });

  it('should display prompt sheet with Arabic text when visible', () => {
    const el = fixture.nativeElement as HTMLElement;
    const sheet = el.querySelector('.dhikr-prompt-sheet');
    expect(sheet).not.toBeNull();

    const arabic = el.querySelector('.dhikr-prompt-sheet__arabic');
    expect(arabic).not.toBeNull();
  });

  it('should increment prompt count on tap button click', () => {
    expect(component.count()).toBe(0);
    component.increment();
    fixture.detectChanges();

    expect(component.count()).toBe(1);
  });

  it('should dismiss modal on skip', () => {
    component.skip();
    fixture.detectChanges();

    expect(component.isVisible()).toBe(false);
  });

  it('should dismiss modal on escape key', () => {
    component.onEscape();
    fixture.detectChanges();

    expect(component.isVisible()).toBe(false);
  });
});
