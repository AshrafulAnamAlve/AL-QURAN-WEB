import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AudioPlayerComponent } from './audio-player';
import { AudioPlayerService } from '../../../core/services/audio-player';

describe('AudioPlayerComponent', () => {
  let fixture: ComponentFixture<AudioPlayerComponent>;
  let component: AudioPlayerComponent;

  beforeEach(async () => {
    HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
    HTMLMediaElement.prototype.pause = vi.fn();
    HTMLMediaElement.prototype.load = vi.fn();

    await TestBed.configureTestingModule({
      imports: [AudioPlayerComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        AudioPlayerService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AudioPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders audio player controls and defaults panel to closed', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.player')).toBeTruthy();
    expect(el.querySelector('#audio-player-panel')?.hasAttribute('hidden')).toBe(true);
  });

  it('toggles playback options panel', () => {
    component.togglePanel();
    fixture.detectChanges();

    const panel = fixture.nativeElement.querySelector('#audio-player-panel');
    expect(panel?.hasAttribute('hidden')).toBe(false);

    component.togglePanel();
    fixture.detectChanges();
    expect(panel?.hasAttribute('hidden')).toBe(true);
  });

  it('closes playback options panel on Escape key', () => {
    component.togglePanel();
    fixture.detectChanges();

    const panel = fixture.nativeElement.querySelector('#audio-player-panel');
    expect(panel?.hasAttribute('hidden')).toBe(false);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(panel?.hasAttribute('hidden')).toBe(true);
  });
});
