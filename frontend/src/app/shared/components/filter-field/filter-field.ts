import { ChangeDetectionStrategy, Component, ElementRef, input, model, viewChild } from '@angular/core';
import { IconComponent } from '../icon/icon';

/**
 * A labelled text input for filtering a list.
 *
 * Uses `model()` so a parent can two-way bind with `[(value)]`. The filtering
 * itself belongs to the parent - this component only collects the text and
 * offers a way to clear it.
 */
@Component({
  selector: 'aq-filter-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <div class="field">
      <label class="aq-visually-hidden" [attr.for]="inputId()">{{ label() }}</label>

      <span class="field__icon" aria-hidden="true">
        <aq-icon name="search" [size]="18" />
      </span>

      <input
        #input
        class="field__input"
        type="search"
        [id]="inputId()"
        [attr.placeholder]="placeholder()"
        [value]="value()"
        [attr.aria-describedby]="describedBy() || null"
        autocomplete="off"
        spellcheck="false"
        (input)="onInput($event)"
      />

      @if (value()) {
        <button
          type="button"
          class="field__clear"
          (click)="clear()"
          aria-label="Clear the filter"
        >
          <aq-icon name="close" [size]="16" />
        </button>
      }
    </div>
  `,
  styles: `
    @use 'mixins' as m;

    :host {
      display: block;
    }

    .field {
      position: relative;
      display: flex;
      align-items: center;
    }

    .field__icon {
      position: absolute;
      left: 0.875rem;
      display: inline-flex;
      color: var(--aq-text-subtle);
      pointer-events: none;
    }

    .field__input {
      width: 100%;
      padding: 0.75rem 2.75rem;
      min-height: 48px;
      border: 1px solid var(--aq-border-strong);
      border-radius: var(--aq-radius-md);
      background: var(--aq-surface);
      color: var(--aq-text);
      font-size: 0.9375rem;
      transition:
        border-color var(--aq-duration-fast) var(--aq-ease),
        box-shadow var(--aq-duration-fast) var(--aq-ease);

      &::placeholder {
        color: var(--aq-text-subtle);
      }

      &:focus {
        outline: none;
        border-color: var(--aq-primary);
        box-shadow: var(--aq-ring);
      }

      /* The browser's own clear button would duplicate ours. */
      &::-webkit-search-cancel-button {
        appearance: none;
      }
    }

    .field__clear {
      position: absolute;
      right: 0.5rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      @include m.touch-target(36px);
      border-radius: var(--aq-radius-sm);
      color: var(--aq-text-subtle);

      @include m.focus-visible;

      &:hover {
        color: var(--aq-text);
        background: var(--aq-surface-2);
      }
    }
  `,
})
export class FilterFieldComponent {
  /** Two-way bound filter text. */
  readonly value = model<string>('');

  /** Accessible label. Visually hidden, but read by screen readers. */
  readonly label = input<string>('Filter');

  readonly placeholder = input<string>('Filter...');

  /** id of an element describing the field, e.g. a live result count. */
  readonly describedBy = input<string>('');

  /** id given to the input, so the label can point at it. */
  readonly inputId = input<string>('aq-filter');

  private readonly inputRef = viewChild<ElementRef<HTMLInputElement>>('input');

  protected onInput(event: Event): void {
    this.value.set((event.target as HTMLInputElement).value);
  }

  clear(): void {
    this.value.set('');
    this.inputRef()?.nativeElement.focus();
  }
}
