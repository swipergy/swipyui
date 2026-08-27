import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from '@angular/core';

/**
 * Layout wrapper that places an icon inside a text input. Project an
 * `<syui-input-icon>` next to an `input[syuiInputText]`; the input gets extra
 * padding on the icon side and the icon is centered vertically:
 *
 * ```html
 * <syui-icon-field>
 *   <syui-input-icon><svg …></svg></syui-input-icon>
 *   <input syuiInputText placeholder="Search" />
 * </syui-icon-field>
 *
 * <syui-icon-field iconPosition="right">
 *   <input syuiInputText placeholder="Search" />
 *   <syui-input-icon><i class="icon-spinner"></i></syui-input-icon>
 * </syui-icon-field>
 * ```
 */
@Component({
  selector: 'syui-icon-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './iconfield.css',
  host: {
    class: 'syui-iconfield',
    '[class.syui-iconfield-right]': "iconPosition() === 'right'",
  },
  template: `<ng-content />`,
})
export class IconField {
  /** Side of the input the icon is rendered on. */
  readonly iconPosition = input<'left' | 'right'>('left');
}

/**
 * Icon slot of `<syui-icon-field>`; projects any content (inline `<svg>` or an
 * `<i>` icon-font element) and positions it over the input.
 */
@Component({
  selector: 'syui-input-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'syui-inputicon',
    'aria-hidden': 'true',
  },
  template: `<ng-content />`,
})
export class InputIcon {}
