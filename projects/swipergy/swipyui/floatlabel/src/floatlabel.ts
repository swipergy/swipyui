import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from '@angular/core';

/**
 * Floats a `<label>` over its input: the label rests inside the field and
 * moves up while the input is focused or non-empty. Purely CSS-driven via
 * `:focus-within` and `:placeholder-shown` — give the input a blank
 * placeholder (`placeholder=" "`) so the filled state is detectable without
 * focus, and wire `for`/`id` as usual:
 *
 * ```html
 * <syui-float-label>
 *   <input syuiInputText id="email" placeholder=" " [formField]="f.email" />
 *   <label for="email">Email</label>
 * </syui-float-label>
 * ```
 *
 * `variant="over"` (default) floats the label onto the input's top border;
 * `variant="in"` keeps it inside a taller field above the value.
 */
@Component({
  selector: 'syui-float-label',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './floatlabel.css',
  host: {
    class: 'syui-floatlabel',
    '[class.syui-floatlabel-in]': "variant() === 'in'",
  },
  template: `<ng-content />`,
})
export class FloatLabel {
  /** Where the floated label ends up: over the top border, or inside the field. */
  readonly variant = input<'over' | 'in'>('over');
}
