import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Indeterminate loading indicator.
 *
 * Announced politely so screen reader users are told that content is loading
 * rather than being met with silence.
 */
@Component({
  selector: 'aq-spinner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="wrap" role="status" [attr.aria-live]="'polite'">
      <span class="ring" [style.--size.px]="size()" [style.--thickness.px]="thickness()"></span>
      @if (label()) {
        <span class="label">{{ label() }}</span>
      } @else {
        <span class="sr">Loading</span>
      }
    </div>
  `,
  styles: `
    @use 'mixins' as m;

    .wrap {
      display: inline-flex;
      align-items: center;
      gap: 0.625rem;
    }

    .ring {
      width: var(--size, 24px);
      height: var(--size, 24px);
      border-radius: 50%;
      border: var(--thickness, 2px) solid var(--aq-border-strong);
      border-top-color: var(--aq-primary);
      animation: spin 720ms linear infinite;
    }

    .label {
      font-size: 0.875rem;
      color: var(--aq-text-muted);
    }

    .sr {
      @include m.visually-hidden;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `,
})
export class SpinnerComponent {
  readonly size = input(24);
  readonly thickness = input(2);
  /** Visible text next to the spinner. Leave empty for an icon-only spinner. */
  readonly label = input<string>('');
}
