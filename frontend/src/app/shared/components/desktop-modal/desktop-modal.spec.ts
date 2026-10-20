import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DesktopService } from '../../../core/services/desktop';
import { LanguageService } from '../../../core/services/language';
import { DesktopModalComponent } from './desktop-modal';

describe('DesktopModalComponent', () => {
  let component: DesktopModalComponent;
  let fixture: ComponentFixture<DesktopModalComponent>;
  let desktopService: DesktopService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DesktopModalComponent],
      providers: [DesktopService, LanguageService],
    });

    desktopService = TestBed.inject(DesktopService);
    fixture = TestBed.createComponent(DesktopModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders modal header and tabs', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.desktop-modal__title')).toBeTruthy();
    expect(component.activeTab()).toBe('download');
  });

  it('switches between download and shortcuts tabs', () => {
    component.setTab('shortcuts');
    fixture.detectChanges();
    expect(component.activeTab()).toBe('shortcuts');

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.shortcuts-list')).toBeTruthy();

    component.setTab('download');
    fixture.detectChanges();
    expect(component.activeTab()).toBe('download');
    expect(el.querySelector('.download-card')).toBeTruthy();
  });

  it('closes modal on close button or escape key', () => {
    const closeSpy = vi.spyOn(desktopService, 'closeDownloadModal');
    component.close();
    expect(closeSpy).toHaveBeenCalled();

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(closeSpy).toHaveBeenCalledTimes(2);
  });
});
