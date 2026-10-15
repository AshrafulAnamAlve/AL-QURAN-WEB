import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { App } from './app';

describe('App shell', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();
  });

  it('creates the shell', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the header, a main landmark and the footer', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('aq-header')).toBeTruthy();
    expect(root.querySelector('main#main-content')).toBeTruthy();
    expect(root.querySelector('aq-footer')).toBeTruthy();
  });

  it('offers a skip link for keyboard users', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const skip = fixture.nativeElement.querySelector('.aq-skip-link') as HTMLAnchorElement | null;
    expect(skip?.getAttribute('href')).toBe('#main-content');
  });
});
