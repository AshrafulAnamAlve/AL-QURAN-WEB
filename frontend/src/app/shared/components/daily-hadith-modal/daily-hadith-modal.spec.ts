import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HadithService } from '../../../core/services/hadith';
import { LanguageService } from '../../../core/services/language';
import { ShareService } from '../../../core/services/share';
import { StorageService } from '../../../core/services/storage';
import { DailyHadithModalComponent } from './daily-hadith-modal';

describe('DailyHadithModalComponent', () => {
  let fixture: ComponentFixture<DailyHadithModalComponent>;
  let component: DailyHadithModalComponent;
  let hadithService: HadithService;
  let router: Router;
  let shareService: ShareService;

  beforeEach(async () => {
    localStorage.clear();
    const routerMock = {
      navigate: vi.fn(),
    };

    const shareMock = {
      copy: vi.fn().mockResolvedValue(true),
    };

    await TestBed.configureTestingModule({
      imports: [DailyHadithModalComponent],
      providers: [
        HadithService,
        LanguageService,
        StorageService,
        { provide: Router, useValue: routerMock },
        { provide: ShareService, useValue: shareMock },
      ],
    }).compileComponents();

    hadithService = TestBed.inject(HadithService);
    router = TestBed.inject(Router);
    shareService = TestBed.inject(ShareService);
    const lang = TestBed.inject(LanguageService);
    lang.setLanguage('bn');

    fixture = TestBed.createComponent(DailyHadithModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders modal when not dismissed', () => {
    const el: HTMLElement = fixture.nativeElement;
    const modal = el.querySelector('.hadith-modal-sheet');
    expect(modal).not.toBeNull();
    expect(el.textContent).toContain('আজকের নির্বাচিত হাদিস');
  });

  it('displays authentic arabic text, narrator and translation', () => {
    const el: HTMLElement = fixture.nativeElement;
    const arabic = el.querySelector('.hadith-modal-sheet__arabic');
    expect(arabic).not.toBeNull();
    expect(arabic?.textContent?.trim().length).toBeGreaterThan(0);

    const bangla = el.querySelector('.hadith-modal-sheet__bangla');
    expect(bangla).not.toBeNull();
    expect(bangla?.textContent?.trim().length).toBeGreaterThan(0);
  });

  it('dismisses modal on close button click', () => {
    const closeBtn = fixture.nativeElement.querySelector('.hadith-modal-sheet__close') as HTMLButtonElement;
    expect(closeBtn).not.toBeNull();

    closeBtn.click();
    fixture.detectChanges();

    expect(hadithService.isDailyModalDismissed()).toBe(true);
    expect(fixture.nativeElement.querySelector('.hadith-modal-sheet')).toBeNull();
  });

  it('navigates to /hadith and closes modal on "Read More" click', () => {
    const readMoreBtn = fixture.nativeElement.querySelector('.hadith-modal-sheet__read-more-btn') as HTMLButtonElement;
    expect(readMoreBtn).not.toBeNull();

    readMoreBtn.click();
    fixture.detectChanges();

    expect(router.navigate).toHaveBeenCalledWith(['/hadith']);
    expect(hadithService.isDailyModalDismissed()).toBe(true);
  });

  it('copies hadith text when copy button is clicked', async () => {
    const copyBtn = fixture.nativeElement.querySelector('.aq-btn--secondary') as HTMLButtonElement;
    expect(copyBtn).not.toBeNull();

    await component.copyHadith();
    expect(shareService.copy).toHaveBeenCalled();
  });
});
