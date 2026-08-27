import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  forwardRef,
  input,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { BaseCheckboxControl, uniqueId } from '@swipergy/swipyui/core';

/**
 * On/off switch, semantically a native checkbox with role="switch".
 *
 * Implements the signal forms checkbox contract, so it binds directly to a
 * field, and stays compatible with reactive and template-driven forms:
 *
 * ```html
 * <syui-toggleswitch label="Notifications" [formField]="f.notify" />
 * <syui-toggleswitch label="Notifications" [formControl]="notify" />
 * <syui-toggleswitch label="Notifications" [(checked)]="notify" />
 * ```
 */
@Component({
  selector: 'syui-toggleswitch',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './toggleswitch.css',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ToggleSwitch), multi: true },
  ],
  template: `
    <label
      class="syui-toggleswitch"
      [class.syui-toggleswitch-disabled]="isDisabled()"
      [class.syui-toggleswitch-invalid]="showInvalid()"
      [for]="inputId"
    >
      <input
        type="checkbox"
        role="switch"
        class="syui-toggleswitch-input"
        [id]="inputId"
        [checked]="checked()"
        [disabled]="isDisabled()"
        [attr.aria-label]="ariaLabel() || null"
        [attr.aria-labelledby]="ariaLabelledby() || null"
        [attr.aria-describedby]="ariaDescribedby() || null"
        [attr.aria-invalid]="ariaInvalid()"
        (change)="toggle($event)"
        (blur)="onTouched()"
      />
      <span class="syui-toggleswitch-track" aria-hidden="true">
        <span class="syui-toggleswitch-handle"></span>
      </span>
      @if (label()) {
        <span class="syui-toggleswitch-label">{{ label() }}</span>
      }
    </label>
  `,
})
export class ToggleSwitch extends BaseCheckboxControl {
  /** Text rendered next to the switch. */
  readonly label = input<string>();
  protected readonly inputId = uniqueId('syui-toggleswitch');

  protected toggle(event: Event): void {
    this.updateChecked((event.target as HTMLInputElement).checked);
  }
}
