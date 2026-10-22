import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { IslamicChatWidgetComponent } from './islamic-chat-widget';
import { IslamicChatService } from '../../../core/services/islamic-chat';
import { LanguageService } from '../../../core/services/language';
import { StorageService } from '../../../core/services/storage';

describe('IslamicChatWidgetComponent', () => {
  let fixture: ComponentFixture<IslamicChatWidgetComponent>;
  let component: IslamicChatWidgetComponent;
  let chatService: IslamicChatService;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [IslamicChatWidgetComponent],
      providers: [IslamicChatService, LanguageService, StorageService],
    }).compileComponents();

    chatService = TestBed.inject(IslamicChatService);
    fixture = TestBed.createComponent(IslamicChatWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders the floating launcher button on initial load', () => {
    const launcher = fixture.nativeElement.querySelector('.chat-launcher');
    expect(launcher).not.toBeNull();
    expect(launcher.textContent).toContain('নূর AI');
  });

  it('opens and closes the chat window when launcher is clicked', () => {
    expect(component.isOpen()).toBe(false);
    expect(fixture.nativeElement.querySelector('.chat-window')).toBeNull();

    component.toggle();
    fixture.detectChanges();

    expect(component.isOpen()).toBe(true);
    expect(fixture.nativeElement.querySelector('.chat-window')).not.toBeNull();

    component.close();
    fixture.detectChanges();

    expect(component.isOpen()).toBe(false);
    expect(fixture.nativeElement.querySelector('.chat-window')).toBeNull();
  });

  it('renders quick prompts on empty chat', () => {
    component.toggle();
    fixture.detectChanges();

    const promptButtons = fixture.nativeElement.querySelectorAll('.chat-prompt-pill');
    expect(promptButtons.length).toBeGreaterThan(0);
  });

  it('shows ban screen when user is banned', () => {
    chatService.banState.set({
      strikes: 3,
      isBanned: true,
      bannedUntil: Date.now() + 600000,
    });
    chatService.banRemainingSeconds.set(600);
    component.toggle();
    fixture.detectChanges();

    const banScreen = fixture.nativeElement.querySelector('.chat-ban-screen');
    expect(banScreen).not.toBeNull();
    expect(banScreen.textContent).toContain('চ্যাট সুবিধা সাময়িকভাবে স্থগিত');
  });
});
