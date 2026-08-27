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
 * Boolean checkbox backed by a hidden native input.
 *
 * Implements the signal forms checkbox contract, so it binds directly to a
 * field, and stays compatible with reactive and template-driven forms:
 *
 * ```html
 * <syui-checkbox label="Accept terms" [formField]="f.accepted" />
 * <syui-checkbox label="Accept terms" [formControl]="accepted" />
 * <syui-checkbox label="Accept terms" [(checked)]="accepted" />
 * ```
 */
@Component({
  selector: 'syui-checkbox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './checkbox.css',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => Checkbox), multi: true },
  ],
  template: `
    <label
      class="syui-checkbox"
      [class.syui-checkbox-disabled]="isDisabled()"
      [class.syui-checkbox-invalid]="showInvalid()"
      [for]="inputId"
    >
      <input
        type="checkbox"
        class="syui-checkbox-input"
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
      <span class="syui-checkbox-box" aria-hidden="true">
        <svg class="syui-checkbox-icon" viewBox="0 0 14 14" fill="none">
          <path
            d="M2.5 7.5L5.5 10.5L11.5 3.5"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
      @if (label()) {
        <span class="syui-checkbox-label">{{ label() }}</span>
      }
    </label>
  `,
})
export class Checkbox extends BaseCheckboxControl {
  /** Text rendered next to the box. */
  readonly label = input<string>();
  protected readonly inputId = uniqueId('syui-checkbox');

  protected toggle(event: Event): void {
    this.updateChecked((event.target as HTMLInputElement).checked);
  }
}
