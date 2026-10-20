import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { QiblaPage } from './qibla';
import { QiblaService } from '../../core/services/qibla';
import { SettingsService } from '../../core/services/settings';
import { LocationService } from '../../core/services/location';
import { LanguageService } from '../../core/services/language';
import { SeoService } from '../../core/services/seo';

describe('QiblaPage Component', () => {
  let component: QiblaPage;
  let fixture: ComponentFixture<QiblaPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QiblaPage],
      providers: [
        QiblaService,
        SettingsService,
        LocationService,
        LanguageService,
        SeoService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QiblaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates QiblaPage and displays header title', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.qibla-header__title')).toBeTruthy();
  });

  it('defaults to compass view mode and switches to map mode', () => {
    expect(component.viewMode()).toBe('compass');
    component.setViewMode('map');
    expect(component.viewMode()).toBe('map');
    component.setViewMode('compass');
    expect(component.viewMode()).toBe('compass');
  });

  it('manages city selection modal open/close states', () => {
    expect(component.showCityModal()).toBe(false);
    component.openCityModal();
    expect(component.showCityModal()).toBe(true);
    component.closeCityModal();
    expect(component.showCityModal()).toBe(false);
  });

  it('computes accurate dial rotation and kaaba pointer angle', () => {
    expect(typeof component.dialRotation()).toBe('number');
    expect(typeof component.kaabaPointerAngle()).toBe('number');
    expect(component.kaabaPointerAngle()).toBeGreaterThan(0);
    expect(component.kaabaPointerAngle()).toBeLessThan(360);
  });
});
