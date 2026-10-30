import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DesktopService } from '../../core/services/desktop';
import { LanguageService } from '../../core/services/language';
import { MobileHardwareService } from '../../core/services/mobile-hardware.service';
import { SeoService } from '../../core/services/seo';
import { ShieldPage } from './shield';

describe('ShieldPage', () => {
  let component: ShieldPage;
  let fixture: ComponentFixture<ShieldPage>;
  let mobileHardware: MobileHardwareService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShieldPage],
      providers: [
        provideRouter([]),
        DesktopService,
        LanguageService,
        MobileHardwareService,
        SeoService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ShieldPage);
    component = fixture.componentInstance;
    mobileHardware = TestBed.inject(MobileHardwareService);
    fixture.detectChanges();
  });

  it('should create the ShieldPage component', () => {
    expect(component).toBeTruthy();
  });

  it('should have initial shield status reflected', () => {
    expect(component.isShieldActive()).toBe(false);
  });

  it('should copy DNS hostname and set copiedDns signal', async () => {
    const copySpy = vi.spyOn(mobileHardware, 'copyDnsHostname').mockResolvedValue(true);
    await component.copyDns('family.cloudflare-dns.com');
    expect(copySpy).toHaveBeenCalledWith('family.cloudflare-dns.com');
    expect(component.copiedDns()).toBe('family.cloudflare-dns.com');
  });

  it('should trigger openAndroidDnsSettings when openDnsSettings is invoked', async () => {
    const openSpy = vi.spyOn(mobileHardware, 'openAndroidDnsSettings').mockImplementation(() => {});
    await component.openDnsSettings();
    expect(openSpy).toHaveBeenCalled();
  });

  it('should handle testMobileProtection flow gracefully', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
    await component.testMobileProtection();
    expect(component.isTestingMobileDns()).toBe(false);
    expect(component.mobileTestResult()).not.toBeNull();
    expect(component.mobileTestResult()?.status).toBe('success');
    vi.unstubAllGlobals();
  });
});
