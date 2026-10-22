import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';
import { DesktopService } from '../../core/services/desktop';
import { LanguageService } from '../../core/services/language';
import { SeoService } from '../../core/services/seo';
import { ShieldPage } from './shield';

describe('ShieldPage', () => {
  let component: ShieldPage;
  let fixture: ComponentFixture<ShieldPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShieldPage],
      providers: [
        provideRouter([]),
        DesktopService,
        LanguageService,
        SeoService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ShieldPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the ShieldPage component', () => {
    expect(component).toBeTruthy();
  });

  it('should have initial shield status reflected', () => {
    expect(component.isShieldActive()).toBe(false);
  });
});
