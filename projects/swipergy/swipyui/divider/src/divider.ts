import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from '@angular/core';

export type DividerLayout = 'horizontal' | 'vertical';
export type DividerType = 'solid' | 'dashed' | 'dotted';
export type DividerAlign = 'left' | 'center' | 'right' | 'top' | 'bottom';

/**
 * Separates content with a horizontal or vertical rule. Projected content
 * (e.g. a short label) is rendered on the line:
 *
 * ```html
 * <syui-divider />
 * <syui-divider align="left">OR</syui-divider>
 * <syui-divider layout="vertical" type="dashed" />
 * ```
 */
@Component({
  selector: 'syui-divider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './divider.css',
  host: {
    class: 'syui-divider',
    role: 'separator',
    '[attr.aria-orientation]': 'layout()',
    '[class.syui-divider-horizontal]': "layout() === 'horizontal'",
    '[class.syui-divider-vertical]': "layout() === 'vertical'",
    '[class.syui-divider-dashed]': "type() === 'dashed'",
    '[class.syui-divider-dotted]': "type() === 'dotted'",
    '[class.syui-divider-align-start]': "align() === 'left' || align() === 'top'",
    '[class.syui-divider-align-end]': "align() === 'right' || align() === 'bottom'",
  },
  template: `<div class="syui-divider-content"><ng-content /></div>`,
})
export class Divider {
  /** Direction of the rule. */
  readonly layout = input<DividerLayout>('horizontal');
  /** Line style of the rule. */
  readonly type = input<DividerType>('solid');
  /**
   * Position of the projected content on the line: 'left' | 'center' | 'right'
   * for horizontal layout, 'top' | 'center' | 'bottom' for vertical layout.
   */
  readonly align = input<DividerAlign>('center');
}
