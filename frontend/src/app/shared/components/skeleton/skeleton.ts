import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Grey placeholder block shown while real content loads.
 *
 * Skeletons are preferred over spinners for content that has a predictable
 * shape (a list of surahs, a prayer timetable) because the layout does not jump
 * once the data arrives.
 */
@Component({
  selector: 'aq-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="aq-skeleton block"
      [style.width]="width()"
      [style.height]="height()"
      [style.border-radius]="radius()"
      aria-hidden="true"
    ></span>
  `,
  styles: `
    :host {
      display: block;
    }

    .block {
      display: block;
    }
  `,
})
export class SkeletonComponent {
  readonly width = input('100%');
  readonly height = input('1rem');
  readonly radius = input('var(--aq-radius-sm)');
}
