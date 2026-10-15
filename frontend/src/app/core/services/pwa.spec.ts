import { TestBed } from '@angular/core/testing';
import { PwaService } from './pwa';

describe('PwaService', () => {
  let service: PwaService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PwaService],
    });
    service = TestBed.inject(PwaService);
  });

  it('initializes with online network status', () => {
    expect(service.isOnline()).toBe(true);
    expect(service.isOffline()).toBe(false);
  });

  it('updates online/offline state when window events fire', () => {
    window.dispatchEvent(new Event('offline'));
    expect(service.isOnline()).toBe(false);
    expect(service.isOffline()).toBe(true);

    window.dispatchEvent(new Event('online'));
    expect(service.isOnline()).toBe(true);
    expect(service.isOffline()).toBe(false);
  });

  it('returns false when promptInstall called with no deferred prompt', async () => {
    const installed = await service.promptInstall();
    expect(installed).toBe(false);
  });
});
