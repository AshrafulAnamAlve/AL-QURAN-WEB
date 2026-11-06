import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProphetService } from '../../core/services/prophet';
import { ProphetsPage } from './prophets';

describe('ProphetsPage', () => {
  let fixture: ComponentFixture<ProphetsPage>;
  let component: ProphetsPage;
  let prophetService: ProphetService;

  beforeEach(async () => {
    localStorage.clear();
    if (!('speechSynthesis' in window)) {
      (window as any).speechSynthesis = {
        speak: vi.fn(),
        cancel: vi.fn(),
        pause: vi.fn(),
        resume: vi.fn(),
        getVoices: vi.fn().mockReturnValue([]),
      };
    }
    if (!('SpeechSynthesisUtterance' in window)) {
      (window as any).SpeechSynthesisUtterance = class {
        text: string;
        lang = 'en-US';
        rate = 1;
        pitch = 1;
        onend: any;
        onerror: any;
        onboundary: any;
        constructor(text?: string) {
          this.text = text || '';
        }
      };
    }

    await TestBed.configureTestingModule({
      imports: [ProphetsPage],
      providers: [
        provideRouter([]),
        ProphetService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProphetsPage);
    component = fixture.componentInstance;
    prophetService = TestBed.inject(ProphetService);
    fixture.detectChanges();
  });

  it('should render page title and all 25 Prophet cards in grid view', () => {
    const el: HTMLElement = fixture.nativeElement;
    const cards = el.querySelectorAll('.prophet-card');
    expect(cards.length).toBe(25);
  });

  it('should filter cards when searching', () => {
    prophetService.searchQuery.set('মুহাম্মদ');
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    const cards = el.querySelectorAll('.prophet-card');
    expect(cards.length).toBe(1);
    expect(cards[0].textContent).toContain('মুহাম্মদ');
  });

  it('should open reader view when a prophet is selected', () => {
    component.openProphet(prophetService.allProphets[24]);
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    const reader = el.querySelector('.prophet-reader');
    expect(reader).not.toBeNull();
    expect(reader?.textContent).toContain('মুহাম্মদ');

    // Test back button
    component.backToList();
    fixture.detectChanges();
    expect(el.querySelector('.prophet-reader')).toBeNull();
  });

  it('should toggle reading language and font size', () => {
    expect(component.activeLang()).toBe('bn');
    component.setLang('en');
    expect(component.activeLang()).toBe('en');

    expect(component.fontSize()).toBe('md');
    component.setFontSize('lg');
    expect(component.fontSize()).toBe('lg');
  });
});
