import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Footer with data attribution.
 *
 * The attribution is not decoration: OpenStreetMap data is licensed under the
 * ODbL and requires credit, and naming the Quran text and translation sources
 * is the honest thing to do for religious content.
 */
@Component({
  selector: 'aq-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <footer class="footer">
      <div class="aq-container">
        <hr class="aq-rule-gold" />

        <div class="grid">
          <div>
            <p class="title">Al-Quran</p>
            <p class="text">
              Read the Quran in Arabic with Bangla translation, listen to recitation, follow
              prayer times and find mosques nearby.
            </p>
          </div>

          <div>
            <p class="title">Sections</p>
            <ul class="links">
              <li><a routerLink="/quran">Quran</a></li>
              <li><a routerLink="/prayer">Prayer times</a></li>
              <li><a routerLink="/calendar">Islamic calendar</a></li>
              <li><a routerLink="/mosques">Nearby mosques</a></li>
            </ul>
          </div>

          <div>
            <p class="title">Data sources</p>
            <ul class="links">
              <li>
                <a href="https://alquran.cloud/api" target="_blank" rel="noopener noreferrer">
                  Quran text — AlQuran.cloud
                </a>
              </li>
              <li>
                <a href="https://aladhan.com" target="_blank" rel="noopener noreferrer">
                  Prayer times &amp; Hijri dates — Aladhan
                </a>
              </li>
              <li>
                <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">
                  Map &amp; mosque data — &copy; OpenStreetMap contributors
                </a>
              </li>
            </ul>
          </div>
        </div>

        <p class="note">
          Hijri dates and prayer times are calculated. Local moon sighting and your mosque's
          announced times may differ — always follow your local authority.
        </p>
      </div>
    </footer>
  `,
  styles: `
    @use 'mixins' as m;

    .footer {
      margin-top: 3rem;
      padding-bottom: calc(var(--aq-bottom-nav-height) + 1.5rem);
      background: var(--aq-bg-subtle);
      border-top: 1px solid var(--aq-border);

      @include m.up(lg) {
        padding-bottom: 1.5rem;
      }
    }

    hr {
      margin: 0 0 1.75rem;
    }

    .grid {
      display: grid;
      gap: 1.75rem;
      padding-block: 0.5rem 1.5rem;

      @include m.up(md) {
        grid-template-columns: 1.4fr 1fr 1.3fr;
        gap: 2.5rem;
      }
    }

    .title {
      margin: 0 0 0.625rem;
      font-size: 0.8125rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--aq-text);
    }

    .text {
      margin: 0;
      font-size: 0.875rem;
      color: var(--aq-text-muted);
      max-width: 42ch;
    }

    .links {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin: 0;

      a {
        font-size: 0.875rem;
        color: var(--aq-text-muted);

        &:hover {
          color: var(--aq-primary);
        }
      }
    }

    .note {
      margin: 0;
      padding: 1rem 0 1.5rem;
      border-top: 1px solid var(--aq-border);
      font-size: 0.8125rem;
      color: var(--aq-text-subtle);
      text-wrap: pretty;
    }
  `,
})
export class FooterComponent {}
