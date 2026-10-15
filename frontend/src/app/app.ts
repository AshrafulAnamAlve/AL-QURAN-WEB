import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BottomNavComponent } from './layout/bottom-nav/bottom-nav';
import { FooterComponent } from './layout/footer/footer';
import { HeaderComponent } from './layout/header/header';
import { MiniPlayerComponent } from './layout/mini-player/mini-player';
import { IconComponent } from './shared/components/icon/icon';
import { PwaService } from './core/services/pwa';
import { LanguageService } from './core/services/language';

/**
 * Application shell: the chrome that stays put while routes change.
 * Page content is rendered into the router outlet inside <main>.
 *
 * The mini player is mounted here, not in the reader, so recitation survives
 * navigation - the shell is never re-created when the route changes.
 */
@Component({
  selector: 'aq-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    BottomNavComponent,
    MiniPlayerComponent,
    IconComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly pwa = inject(PwaService);
  protected readonly language = inject(LanguageService);

  readonly isOffline = this.pwa.isOffline;
  readonly hasUpdate = this.pwa.hasUpdate;

  async updateApp(): Promise<void> {
    await this.pwa.activateUpdate();
  }
}
