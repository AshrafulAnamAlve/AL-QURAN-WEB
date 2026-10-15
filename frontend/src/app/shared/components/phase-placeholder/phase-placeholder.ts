import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconComponent } from '../icon/icon';
import { IconName } from '../icon/icon-registry';

/**
 * Scaffolding for a section whose feature work belongs to a later phase.
 *
 * It states plainly which phase builds the section and what it will contain, so
 * the route is navigable and the layout is verifiable now, without pretending
 * the feature already exists. Each of these is replaced by the real screen when
 * its phase is built.
 */
@Component({
  selector: 'aq-phase-placeholder',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <section class="panel aq-pattern">
      <span class="badge">
        <aq-icon [name]="icon()" [size]="28" />
      </span>

      <p class="aq-eyebrow">Phase {{ phase() }}</p>
      <h1>{{ title() }}</h1>
      <p class="lead">{{ description() }}</p>

      @if (features().length) {
        <ul class="features">
          @for (feature of features(); track feature) {
            <li>
              <aq-icon name="check" [size]="16" />
              <span>{{ feature }}</span>
            </li>
          }
        </ul>
      }
    </section>
  `,
  styles: `
    @use 'mixins' as m;

    .panel {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 0.5rem;
      max-width: 640px;
      margin: 2.5rem auto;
      padding: 2.5rem 1.5rem;
      background: var(--aq-surface);
      border: 1px solid var(--aq-border);
      border-radius: var(--aq-radius-xl);
      box-shadow: var(--aq-shadow-sm);
    }

    .badge {
      display: grid;
      place-items: center;
      width: 4rem;
      height: 4rem;
      margin-bottom: 0.5rem;
      border-radius: var(--aq-radius-lg);
      background: var(--aq-primary-soft);
      border: 1px solid var(--aq-primary-border);
      color: var(--aq-primary);
    }

    h1 {
      margin: 0.125rem 0 0;
    }

    .lead {
      margin: 0;
      max-width: 46ch;
      color: var(--aq-text-muted);
      text-wrap: pretty;
    }

    .features {
      display: grid;
      gap: 0.5rem;
      width: 100%;
      margin: 1.5rem 0 0;
      padding-top: 1.25rem;
      border-top: 1px solid var(--aq-border);
      text-align: left;

      @include m.up(sm) {
        grid-template-columns: 1fr 1fr;
      }
    }

    li {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: var(--aq-text-muted);

      aq-icon {
        margin-top: 0.15rem;
        color: var(--aq-primary);
      }
    }
  `,
})
export class PhasePlaceholderComponent {
  readonly phase = input.required<number>();
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly icon = input<IconName>('info');
  readonly features = input<readonly string[]>([]);
}
