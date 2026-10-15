import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { AppError } from '../../../core/models/api-error';
import { IconComponent } from '../icon/icon';
import { IconName } from '../icon/icon-registry';

/**
 * The one component every failed request renders.
 *
 * It shows a plain-language message, offers Retry only when retrying could
 * actually help, and exposes the correlation id so a problem can be traced back
 * to a backend log line. No screen in this app is allowed to fail silently or
 * render blank.
 */
@Component({
  selector: 'aq-error-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <div class="state" [class.state--compact]="compact()" role="alert">
      <span class="badge" [class.badge--offline]="isOffline()">
        <aq-icon [name]="icon()" [size]="compact() ? 20 : 26" />
      </span>

      <div class="body">
        <p class="title">{{ heading() }}</p>
        <p class="message">{{ error()?.message ?? 'Something went wrong.' }}</p>

        @if (error()?.service; as service) {
          <p class="hint">Source: {{ service }}</p>
        }

        @if (error()?.correlationId; as id) {
          <p class="hint">
            Reference: <code>{{ id }}</code>
          </p>
        }
      </div>

      @if (error()?.retryable !== false) {
        <button type="button" class="aq-btn aq-btn--secondary aq-btn--sm" (click)="retry.emit()">
          <aq-icon name="refresh" [size]="16" />
          Retry
        </button>
      }
    </div>
  `,
  styles: `
    @use 'mixins' as m;

    .state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.875rem;
      padding: 2rem 1.25rem;
      text-align: center;
      background: var(--aq-surface);
      border: 1px solid var(--aq-border);
      border-radius: var(--aq-radius-lg);
    }

    .state--compact {
      flex-direction: row;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0.875rem 1rem;
      text-align: left;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 3rem;
      height: 3rem;
      border-radius: 50%;
      background: var(--aq-danger-soft);
      color: var(--aq-danger);
      flex: 0 0 auto;
    }

    .state--compact .badge {
      width: 2.25rem;
      height: 2.25rem;
    }

    .badge--offline {
      background: var(--aq-surface-2);
      color: var(--aq-text-muted);
    }

    .body {
      flex: 1 1 auto;
      min-width: 0;
    }

    .title {
      margin: 0 0 0.25rem;
      font-weight: 650;
      color: var(--aq-text);
    }

    .message {
      margin: 0;
      color: var(--aq-text-muted);
      font-size: 0.9375rem;
      text-wrap: pretty;
    }

    .hint {
      margin: 0.5rem 0 0;
      font-size: 0.75rem;
      color: var(--aq-text-subtle);
    }

    code {
      font-family: ui-monospace, 'SFMono-Regular', 'Cascadia Mono', monospace;
      font-size: 0.72rem;
      word-break: break-all;
    }

    @include m.up(sm) {
      .state {
        padding: 2.5rem 1.5rem;
      }
    }
  `,
})
export class ErrorStateComponent {
  /** The failure to describe. */
  readonly error = input<AppError | null>(null);

  /** Overrides the generated heading. */
  readonly title = input<string>('');

  /** Inline row layout, for errors inside a card rather than a whole page. */
  readonly compact = input(false);

  /** Emitted when the user presses Retry. */
  readonly retry = output<void>();

  protected readonly isOffline = computed(() => this.error()?.code === 'offline');

  protected readonly icon = computed<IconName>(() => (this.isOffline() ? 'wifiOff' : 'alert'));

  protected readonly heading = computed(() => {
    if (this.title()) {
      return this.title();
    }

    switch (this.error()?.code) {
      case 'offline':
        return 'No connection';
      case 'not_found':
        return 'Not found';
      case 'rate_limited':
        return 'Slow down a moment';
      case 'upstream_timeout':
      case 'timeout':
        return 'This is taking too long';
      case 'upstream_unavailable':
        return 'Service temporarily unavailable';
      default:
        return 'Unable to load';
    }
  });
}
