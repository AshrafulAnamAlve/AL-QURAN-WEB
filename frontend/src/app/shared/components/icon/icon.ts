import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ICONS, IconName } from './icon-registry';

/**
 * Renders one icon from the registry.
 *
 * Decorative by default (`aria-hidden`), because an icon next to a visible
 * label would otherwise be announced twice by a screen reader. Pass a `label`
 * only when the icon is the *only* content of a control.
 */
@Component({
  selector: 'aq-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      [attr.width]="size()"
      [attr.height]="size()"
      [attr.fill]="definition().filled ? 'currentColor' : 'none'"
      [attr.stroke]="definition().filled ? 'none' : 'currentColor'"
      [attr.stroke-width]="strokeWidth()"
      stroke-linecap="round"
      stroke-linejoin="round"
      [attr.role]="label() ? 'img' : 'presentation'"
      [attr.aria-label]="label() || null"
      [attr.aria-hidden]="label() ? null : 'true'"
      focusable="false"
    >
      @for (path of definition().paths; track $index) {
        <path [attr.d]="path" />
      }
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      flex: 0 0 auto;
      line-height: 0;
      color: inherit;
    }
  `,
})
export class IconComponent {
  /** Which icon to draw. */
  readonly name = input.required<IconName>();

  /** Rendered width and height in pixels. */
  readonly size = input(20);

  /** Stroke weight; thinner reads better at large sizes. */
  readonly strokeWidth = input(1.75);

  /** Accessible name. Set this when the icon has no visible text beside it. */
  readonly label = input<string>('');

  protected readonly definition = computed(() => ICONS[this.name()]);
}
