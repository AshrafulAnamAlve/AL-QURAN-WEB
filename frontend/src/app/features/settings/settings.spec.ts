import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { SettingsPage } from './settings';
import { SettingsService } from '../../core/services/settings';
import { StorageService } from '../../core/services/storage';

describe('SettingsPage', () => {
  let fixture: ComponentFixture<SettingsPage>;
  let component: SettingsPage;
  let settingsService: SettingsService;
  let storage: StorageService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        SettingsService,
        StorageService,
      ],
    }).compileComponents();

    storage = TestBed.inject(StorageService);
    storage.clearAll();

    settingsService = TestBed.inject(SettingsService);
    fixture = TestBed.createComponent(SettingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    storage.clearAll();
  });

  it('renders settings sections and headings', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('#reading')).toBeTruthy();
    expect(el.querySelector('#appearance')).toBeTruthy();
    expect(el.querySelector('#language')).toBeTruthy();
    expect(el.querySelector('#audio')).toBeTruthy();
    expect(el.querySelector('#location')).toBeTruthy();
    expect(el.querySelector('#data')).toBeTruthy();
  });

  it('changes theme when clicking appearance cards', () => {
    component.setTheme('dark');
    expect(settingsService.themePreference()).toBe('dark');

    component.setTheme('light');
    expect(settingsService.themePreference()).toBe('light');
  });

  it('changes language when clicking language cards', () => {
    component.setLanguage('bn');
    expect(settingsService.language()).toBe('bn');
    expect(settingsService.isBn()).toBe(true);

    component.setLanguage('en');
    expect(settingsService.language()).toBe('en');
    expect(settingsService.isBn()).toBe(false);
  });

  it('updates translation mode', () => {
    component.setTranslationMode('both');
    expect(settingsService.translationMode()).toBe('both');

    component.setTranslationMode('arabic');
    expect(settingsService.translationMode()).toBe('arabic');
  });

  it('opens confirmation modal before clearing bookmarks and executes on confirm', () => {
    // Open prompt
    component.promptClearBookmarks();
    fixture.detectChanges();

    const dialog = (fixture.nativeElement as HTMLElement).querySelector('.modal-dialog');
    expect(dialog).toBeTruthy();

    // Confirm execution
    component.executeConfirmedAction();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).querySelector('.modal-dialog')).toBeNull();
    expect(component['toastMessage']()).toContain('bookmark');
  });

  it('cancels confirmation modal without changes', () => {
    component.promptClearBookmarks();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).querySelector('.modal-dialog')).toBeTruthy();

    component.closeConfirmDialog();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).querySelector('.modal-dialog')).toBeNull();
  });

  it('opens and closes city selection modal', () => {
    component.openCityModal();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).querySelector('.city-modal')).toBeTruthy();

    component.closeCityModal();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).querySelector('.city-modal')).toBeNull();
  });
});
