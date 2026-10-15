import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconComponent } from '../icon/icon';
import { IconName } from '../icon/icon-registry';

/**
 * Shown when a request succeeded but there is nothing to display -
 * no bookmarks yet, no search results, no mosques within the radius.
 *
 * An empty result is not an error, so it never shows a Retry button; it
 * explains what happened and, where useful, what to do next (projected content).
 */
@Component({
  selector: 'aq-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <div class="state">
      <span class="badge">
        <aq-icon [name]="icon()" [size]="26" />
      </span>

      <p class="title">{{ title() }}</p>

      @if (message()) {
        <p class="message">{{ message() }}</p>
      }

      <div class="actions">
        <ng-content />
      </div>
    </div>
  `,
  styles: `
    .state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 2.75rem 1.25rem;
      text-align: center;
      color: var(--aq-text-muted);
    }

    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 3.25rem;
      height: 3.25rem;
      margin-bottom: 0.25rem;
      border-radius: 50%;
      background: var(--aq-surface-2);
      border: 1px solid var(--aq-border);
      color: var(--aq-text-subtle);
    }

    .title {
      margin: 0;
      font-weight: 650;
      color: var(--aq-text);
    }

    .message {
      margin: 0;
      max-width: 42ch;
      font-size: 0.9375rem;
      text-wrap: pretty;
    }

    .actions:empty {
      display: none;
    }

    .actions {
      margin-top: 0.75rem;
    }
  `,
})
export class EmptyStateComponent {
  readonly icon = input<IconName>('inbox');
  readonly title = input.required<string>();
  readonly message = input<string>('');
}
