import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LanguageService } from '../../core/services/language';
import { HeaderComponent } from './header';

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;
  let component: HeaderComponent;
  let languageService: LanguageService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    languageService = TestBed.inject(LanguageService);
    fixture.detectChanges();
  });

  it('renders the brand and language toggle button', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.brand__name')?.textContent).toContain('Al-Quran');

    const toggleBtn = el.querySelector('.lang-pill-btn') as HTMLButtonElement;
    expect(toggleBtn).toBeTruthy();
    expect(el.querySelector('.lang-pill--active')?.textContent).toBe('বাং');
  });

  it('toggles language when toggleLanguage is called', () => {
    const el = fixture.nativeElement as HTMLElement;
    const toggleBtn = el.querySelector('.lang-pill-btn') as HTMLButtonElement;

    toggleBtn.click();
    fixture.detectChanges();

    expect(languageService.language()).toBe('en');
    expect(languageService.isBn()).toBe(false);
    expect(el.querySelector('.lang-pill--active')?.textContent).toBe('EN');
    expect(el.querySelector('.brand__tag')?.textContent).toContain('Read · Listen · Reflect');
  });

  it('closes mobile drawer when escape key is pressed', () => {
    component.toggleDrawer();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.drawer--open')).toBeTruthy();

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.drawer--open')).toBeFalsy();
  });
});

