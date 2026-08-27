import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  forwardRef,
  input,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { BaseCheckboxControl } from '@swipergy/swipyui/core';

/**
 * Two-state button toggling between `onLabel` and `offLabel`, exposed to
 * assistive technology via `aria-pressed`.
 *
 * Implements the signal forms checkbox contract, so it binds directly to a
 * field, and stays compatible with reactive and template-driven forms:
 *
 * ```html
 * <syui-toggle-button onLabel="Muted" offLabel="Unmuted" [formField]="f.muted" />
 * <syui-toggle-button onLabel="Muted" offLabel="Unmuted" [formControl]="muted" />
 * <syui-toggle-button onLabel="Muted" offLabel="Unmuted" [(checked)]="muted" />
 * ```
 */
@Component({
  selector: 'syui-toggle-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './togglebutton.css',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ToggleButton), multi: true },
  ],
  template: `
    <button
      type="button"
      class="syui-togglebutton"
      [class.syui-togglebutton-checked]="checked()"
      [class.syui-invalid]="showInvalid()"
      [attr.aria-pressed]="checked()"
      [attr.aria-label]="ariaLabel() || null"
      [attr.aria-labelledby]="ariaLabelledby() || null"
      [attr.aria-describedby]="ariaDescribedby() || null"
      [attr.aria-invalid]="showInvalid() || null"
      [disabled]="isDisabled()"
      (click)="toggle()"
      (blur)="onTouched()"
    >
      {{ checked() ? onLabel() : offLabel() }}
    </button>
  `,
})
export class ToggleButton extends BaseCheckboxControl {
  /** Label shown while checked. */
  readonly onLabel = input('Yes');
  /** Label shown while unchecked. */
  readonly offLabel = input('No');
  protected toggle(): void {
    this.updateChecked(!this.checked());
  }
}
