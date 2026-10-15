import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BottomNavComponent } from './layout/bottom-nav/bottom-nav';
import { FooterComponent } from './layout/footer/footer';
import { HeaderComponent } from './layout/header/header';
import { MiniPlayerComponent } from './layout/mini-player/mini-player';

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
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
