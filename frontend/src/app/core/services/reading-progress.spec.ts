import { TestBed } from '@angular/core/testing';
import { ReadingProgressService } from './reading-progress';

describe('ReadingProgressService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  const create = () => {
    TestBed.configureTestingModule({});
    return TestBed.inject(ReadingProgressService);
  };

  it('starts at 0 ayahs read', () => {
    const service = create();
    expect(service.count()).toBe(0);
    expect(service.percentage()).toBe(0);
    expect(service.total).toBe(6236);
  });

  it('marks single ayah as read without duplicates', () => {
    const service = create();
    service.markRead(1);
    service.markRead(1);

    expect(service.count()).toBe(1);
    expect(service.isRead(1)).toBe(true);
    expect(service.isRead(2)).toBe(false);
  });

  it('marks multiple ayahs as read', () => {
    const service = create();
    service.markMany([1, 2, 3, 4, 5]);

    expect(service.count()).toBe(5);
    expect(service.isRead(3)).toBe(true);
  });

  it('calculates percentage correctly', () => {
    const service = create();
    // 6236 / 2 = 3118
    const half = Array.from({ length: 3118 }, (_, i) => i + 1);
    service.markMany(half);

    expect(service.percentage()).toBeCloseTo(50, 0);
  });

  it('unmarks an ayah', () => {
    const service = create();
    service.markRead(10);
    expect(service.isRead(10)).toBe(true);

    service.unmark(10);
    expect(service.isRead(10)).toBe(false);
    expect(service.count()).toBe(0);
  });

  it('resets progress', () => {
    const service = create();
    service.markMany([1, 2, 3]);
    expect(service.count()).toBe(3);

    service.reset();
    expect(service.count()).toBe(0);
    expect(service.percentage()).toBe(0);
  });
});
