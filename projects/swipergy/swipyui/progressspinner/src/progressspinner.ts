import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from '@angular/core';

/**
 * Indeterminate circular loading indicator. Sized via CSS on the host
 * (defaults to 100px × 100px):
 *
 * ```html
 * <syui-progress-spinner />
 * <syui-progress-spinner strokeWidth="4" style="width: 2rem; height: 2rem" />
 * ```
 */
@Component({
  selector: 'syui-progress-spinner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './progressspinner.css',
  host: {
    class: 'syui-progressspinner',
    role: 'progressbar',
    '[attr.aria-label]': 'ariaLabel()',
  },
  template: `
    <svg class="syui-progressspinner-svg" viewBox="25 25 50 50" aria-hidden="true">
      <circle
        class="syui-progressspinner-circle"
        cx="50"
        cy="50"
        r="20"
        fill="none"
        [attr.stroke-width]="strokeWidth()"
        stroke-miterlimit="10"
      />
    </svg>
  `,
})
export class ProgressSpinner {
  /** Stroke width of the spinner circle, in SVG units. */
  readonly strokeWidth = input('2');
  /** Accessible name announced for the spinner. */
  readonly ariaLabel = input('Loading');
}
