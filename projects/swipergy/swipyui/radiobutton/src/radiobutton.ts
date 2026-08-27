import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  forwardRef,
  input,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { BaseControl, uniqueId } from '@swipergy/swipyui/core';

/**
 * Single radio option. Bind several to the same field or form control and
 * give each its own `value`. With signal forms the field's name is bound to
 * the `name` input automatically, grouping the radios for keyboard
 * navigation:
 *
 * ```html
 * <syui-radiobutton value="s" label="Small" [formField]="f.size" />
 * <syui-radiobutton value="m" label="Medium" [formField]="f.size" />
 * ```
 */
@Component({
  selector: 'syui-radiobutton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './radiobutton.css',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => RadioButton), multi: true },
  ],
  template: `
    <label
      class="syui-radiobutton"
      [class.syui-radiobutton-disabled]="isDisabled()"
      [class.syui-radiobutton-invalid]="showInvalid()"
      [for]="inputId"
    >
      <input
        type="radio"
        class="syui-radiobutton-input"
        [id]="inputId"
        [name]="name() || null"
        [checked]="checked()"
        [disabled]="isDisabled()"
        [attr.aria-label]="ariaLabel() || null"
        [attr.aria-labelledby]="ariaLabelledby() || null"
        [attr.aria-describedby]="ariaDescribedby() || null"
        [attr.aria-invalid]="ariaInvalid()"
        (change)="select()"
        (blur)="onTouched()"
      />
      <span class="syui-radiobutton-box" aria-hidden="true">
        <span class="syui-radiobutton-dot"></span>
      </span>
      @if (label()) {
        <span class="syui-radiobutton-label">{{ label() }}</span>
      }
    </label>
  `,
})
export class RadioButton extends BaseControl<unknown> {
  /** Value this option contributes to the form control. */
  readonly value = input.required<unknown>();
  /** Native input name, groups radios for keyboard navigation. */
  readonly name = input<string>();
  /** Text rendered next to the radio. */
  readonly label = input<string>();
  protected readonly inputId = uniqueId('syui-radiobutton');

  protected readonly checked = computed(() => this.modelValue() === this.value());

  protected select(): void {
    this.updateModel(this.value());
  }
}
