import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { IslamicChatService } from './islamic-chat';
import { StorageService } from './storage';
import { LanguageService } from './language';

describe('IslamicChatService', () => {
  let service: IslamicChatService;
  let storage: StorageService;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [IslamicChatService, StorageService, LanguageService],
    });

    service = TestBed.inject(IslamicChatService);
    storage = TestBed.inject(StorageService);
  });

  it('starts with widget closed and empty messages if no history in storage', () => {
    expect(service.isOpen()).toBe(false);
    expect(service.messages().length).toBe(0);
    expect(service.isBanned()).toBe(false);
    expect(service.strikes()).toBe(0);
  });

  it('toggles open/close state', () => {
    service.toggle();
    expect(service.isOpen()).toBe(true);

    service.toggle();
    expect(service.isOpen()).toBe(false);
  });

  it('clears chat history', () => {
    service['appendMessage']({
      id: 'm1',
      role: 'user',
      content: 'Hello',
      timestamp: Date.now(),
    });
    expect(service.messages().length).toBe(1);

    service.clearHistory();
    expect(service.messages().length).toBe(0);
  });

  it('registers off-topic strikes and bans after 3 strikes', () => {
    expect(service.strikes()).toBe(0);
    expect(service.isBanned()).toBe(false);

    // 1st off-topic strike
    service['handleAssistantResponse']('[OFF_TOPIC] This is not related to Quran.');
    expect(service.strikes()).toBe(1);
    expect(service.isBanned()).toBe(false);

    // 2nd off-topic strike
    service['handleAssistantResponse']('[OFF_TOPIC] Please ask an Islamic question.');
    expect(service.strikes()).toBe(2);
    expect(service.isBanned()).toBe(false);

    // 3rd off-topic strike -> triggers ban
    service['handleAssistantResponse']('[OFF_TOPIC] Another off-topic question.');
    expect(service.strikes()).toBe(3);
    expect(service.isBanned()).toBe(true);
    expect(service.banRemainingSeconds()).toBeGreaterThan(0);
  });

  it('enforces 15 messages rate-limit sliding window', () => {
    const now = Date.now();
    for (let i = 0; i < 15; i++) {
      service['requestTimestamps'].push(now - (15 - i) * 1000);
    }

    expect(service['requestTimestamps'].length).toBe(15);
    service.sendMessage('Test message beyond limit');

    expect(service.isRateLimited()).toBe(true);
    expect(service.rateLimitCountdown()).toBeGreaterThan(0);
  });
});
