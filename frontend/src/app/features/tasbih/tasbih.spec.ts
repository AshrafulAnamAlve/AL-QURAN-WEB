import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TasbihPage } from './tasbih';
import { DhikrService } from '../../core/services/dhikr';
import { StorageService } from '../../core/services/storage';
import { LanguageService } from '../../core/services/language';

describe('TasbihPage', () => {
  let component: TasbihPage;
  let fixture: ComponentFixture<TasbihPage>;
  let dhikrService: DhikrService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TasbihPage],
      providers: [
        provideRouter([]),
        DhikrService,
        StorageService,
        LanguageService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TasbihPage);
    component = fixture.componentInstance;
    dhikrService = TestBed.inject(DhikrService);
    fixture.detectChanges();
  });

  it('should create the Tasbih page component', () => {
    expect(component).toBeTruthy();
  });

  it('should render active Dhikr card and counter disc', () => {
    const el = fixture.nativeElement as HTMLElement;
    const arabicEl = el.querySelector('.active-dhikr-card__arabic');
    expect(arabicEl).not.toBeNull();
    expect(arabicEl?.textContent?.trim().length).toBeGreaterThan(0);

    const counterDisc = el.querySelector('.counter-disc');
    expect(counterDisc).not.toBeNull();
  });

  it('should increment count on disc tap', () => {
    expect(component.count()).toBe(0);
    component.onTap();
    fixture.detectChanges();

    expect(component.count()).toBe(1);
    const numEl = fixture.nativeElement.querySelector('.counter-disc__num');
    expect(numEl?.textContent?.trim()).toMatch(/1|১/);
  });

  it('should reset count when reset button clicked', () => {
    component.onTap();
    component.onTap();
    expect(component.count()).toBe(2);

    component.onReset();
    fixture.detectChanges();
    expect(component.count()).toBe(0);
  });

  it('should switch preset targets', () => {
    component.setPreset(100);
    fixture.detectChanges();
    expect(component.target()).toBe(100);

    component.setPreset(0);
    fixture.detectChanges();
    expect(component.target()).toBe(0);
  });

  it('should select a dhikr item from the library and set it active', () => {
    const secondItem = dhikrService.allItems[1];
    component.selectDhikr(secondItem);
    fixture.detectChanges();

    expect(component.activeDhikr().id).toBe(secondItem.id);
  });

  it('should filter items by category', () => {
    component.setCategory('morning');
    fixture.detectChanges();

    expect(component.currentCategory()).toBe('morning');
    const items = component.filteredItems();
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((i) => i.category === 'morning')).toBe(true);
  });
});
