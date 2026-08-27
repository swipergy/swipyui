import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

/**
 * Flex row that glues text inputs and addons into one visual control:
 * neighbouring borders collapse and inner corner radii are removed, so only
 * the outermost corners stay rounded. Pure CSS composition — project any mix
 * of `<syui-input-group-addon>` and `input[syuiInputText]` children:
 *
 * ```html
 * <syui-input-group>
 *   <syui-input-group-addon>https://</syui-input-group-addon>
 *   <input syuiInputText placeholder="example.com" />
 *   <syui-input-group-addon>.com</syui-input-group-addon>
 * </syui-input-group>
 * ```
 */
@Component({
  selector: 'syui-input-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './inputgroup.css',
  host: { class: 'syui-inputgroup' },
  template: `<ng-content />`,
})
export class InputGroup {}

/**
 * Static prefix/suffix segment of `<syui-input-group>`, e.g. a currency sign,
 * protocol, unit or inline icon.
 */
@Component({
  selector: 'syui-input-group-addon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'syui-inputgroup-addon' },
  template: `<ng-content />`,
})
export class InputGroupAddon {}
