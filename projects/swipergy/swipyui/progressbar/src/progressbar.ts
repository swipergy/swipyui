import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  numberAttribute,
} from '@angular/core';

/**
 * Horizontal progress indicator. Determinate mode fills the track to
 * `value` percent; indeterminate mode loops a sweeping animation for
 * operations of unknown duration.
 *
 * ```html
 * <syui-progress-bar [value]="upload.percent" />
 * <syui-progress-bar mode="indeterminate" />
 * ```
 */
@Component({
  selector: 'syui-progress-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './progressbar.css',
  host: {
    class: 'syui-progressbar',
    role: 'progressbar',
    '[class.syui-progressbar-indeterminate]': "mode() === 'indeterminate'",
    'aria-valuemin': '0',
    'aria-valuemax': '100',
    '[attr.aria-valuenow]': "mode() === 'determinate' ? clampedValue() : null",
    '[attr.aria-label]': 'ariaLabel() ?? null',
  },
  template: `
    @if (mode() === 'determinate') {
      <div class="syui-progressbar-value" [style.width.%]="clampedValue()">
        @if (showValue()) {
          <span class="syui-progressbar-label">{{ clampedValue() }}%</span>
        }
      </div>
    } @else {
      <div class="syui-progressbar-value"></div>
    }
  `,
})
export class ProgressBar {
  /** Progress in percent, clamped to 0–100. */
  readonly value = input(0, { transform: numberAttribute });
  /** `indeterminate` loops an animation instead of showing `value`. */
  readonly mode = input<'determinate' | 'indeterminate'>('determinate');
  /** Shows the percentage label inside the bar. */
  readonly showValue = input(true, { transform: booleanAttribute });
  /** Accessible name of the progress bar, e.g. "Upload progress". */
  readonly ariaLabel = input<string>();

  protected readonly clampedValue = computed(() => Math.min(100, Math.max(0, this.value())));
}
