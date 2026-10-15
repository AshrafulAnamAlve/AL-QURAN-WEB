import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../shared/components/icon/icon';

/** 404 page. Kept friendly and always offers a way back. */
@Component({
  selector: 'aq-not-found-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent],
  template: `
    <div class="aq-container">
      <section class="panel aq-pattern">
        <p class="code">404</p>
        <h1>This page could not be found</h1>
        <p class="lead">
          The link may be out of date, or the page may have moved. You can head back to the
          home page or open the Quran.
        </p>

        <div class="actions">
          <a routerLink="/" class="aq-btn aq-btn--primary">
            <aq-icon name="home" [size]="18" />
            Go home
          </a>
          <a routerLink="/quran" class="aq-btn aq-btn--secondary">
            <aq-icon name="bookOpen" [size]="18" />
            Read Quran
          </a>
        </div>
      </section>
    </div>
  `,
  styles: `
    .panel {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.625rem;
      max-width: 560px;
      margin: 3rem auto;
      padding: 3rem 1.5rem;
      text-align: center;
      background: var(--aq-surface);
      border: 1px solid var(--aq-border);
      border-radius: var(--aq-radius-xl);
      box-shadow: var(--aq-shadow-sm);
    }

    .code {
      margin: 0;
      font-size: 3rem;
      font-weight: 700;
      line-height: 1;
      color: var(--aq-primary);
      opacity: 0.35;
    }

    h1 {
      margin: 0;
      font-size: 1.5rem;
    }

    .lead {
      margin: 0;
      max-width: 42ch;
      color: var(--aq-text-muted);
      text-wrap: pretty;
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.625rem;
      margin-top: 1rem;
    }
  `,
})
export class NotFoundPage {}
