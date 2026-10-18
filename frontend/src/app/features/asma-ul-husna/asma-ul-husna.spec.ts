import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AsmaUlHusnaPage } from './asma-ul-husna';
import { AsmaUlHusnaService } from '../../core/services/asma-ul-husna';
import { LanguageService } from '../../core/services/language';
import { StorageService } from '../../core/services/storage';

describe('AsmaUlHusnaPage', () => {
  let component: AsmaUlHusnaPage;
  let fixture: ComponentFixture<AsmaUlHusnaPage>;
  let namesService: AsmaUlHusnaService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsmaUlHusnaPage],
      providers: [
        provideRouter([]),
        AsmaUlHusnaService,
        LanguageService,
        StorageService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AsmaUlHusnaPage);
    component = fixture.componentInstance;
    namesService = TestBed.inject(AsmaUlHusnaService);
    fixture.detectChanges();
  });

  it('should create the Asma-ul-Husna page component', () => {
    expect(component).toBeTruthy();
  });

  it('should display the Supreme Name in the hero section', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const heroArabic = compiled.querySelector('.hero-supreme__arabic');
    expect(heroArabic?.textContent?.trim()).toBe('اللَّهُ');
  });

  it('should render all 99 name cards initially', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll('.name-card');
    expect(cards.length).toBe(99);
  });

  it('should filter cards when search input changes', () => {
    const event = {
      target: { value: 'Rahman' },
    } as unknown as Event;

    component.onSearchChange(event);
    fixture.detectChanges();

    expect(component.filteredNames().length).toBeGreaterThan(0);
    expect(component.filteredNames().length).toBeLessThan(99);

    component.clearSearch();
    fixture.detectChanges();
    expect(component.filteredNames().length).toBe(99);
  });

  it('should convert digits to Bengali accurately', () => {
    expect(component.toBnDigits(1)).toBe('১');
    expect(component.toBnDigits(99)).toBe('৯৯');
  });

  it('should open and close the modal on user action or escape key', () => {
    const first = namesService.allNames[0];
    component.openDetail(first);
    fixture.detectChanges();

    expect(component.selectedName()).toEqual(first);

    component.onEscape();
    fixture.detectChanges();

    expect(component.selectedName()).toBeNull();
  });
});
