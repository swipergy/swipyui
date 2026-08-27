import { Directive, booleanAttribute, computed, input } from '@angular/core';
import { ngControlInvalidState } from '@swipergy/swipyui/core';

/**
 * Styles a native text input. Works directly with signal forms' formField,
 * ngModel and formControl since the host stays a plain input element.
 *
 * With `[formField]`, the `invalid` and `touched` inputs are bound
 * automatically from the field state, so invalid styling appears after the
 * first blur without any wiring. With reactive or template-driven forms the
 * validator state (built-in and custom validators alike) is picked up from
 * the attached control:
 *
 * ```html
 * <input syuiInputText placeholder="Name" [formField]="f.name" />
 * <input syuiInputText [formControl]="name" />  <!-- red after touch when invalid -->
 * ```
 */
@Directive({
  selector: 'input[syuiInputText]',
  host: {
    '[class]': 'hostClass()',
    '[attr.aria-invalid]': 'showInvalid() ? true : null',
  },
})
export class InputText {
  /** Stretches the input to the width of its container. */
  readonly fluid = input(false, { transform: booleanAttribute });
  /** Marks the field as invalid (red border), e.g. after failed validation. */
  readonly invalid = input(false, { transform: booleanAttribute });
  /**
   * Touched state, bound automatically by `[formField]`, used to gate invalid
   * styling. Defaults to true so a manually set `invalid` shows immediately.
   */
  readonly touched = input(true, { transform: booleanAttribute });

  private readonly ngState = ngControlInvalidState();

  /** True when the invalid state should show, mirrored to `aria-invalid`. */
  protected readonly showInvalid = computed(
    () => (this.invalid() && this.touched()) || (this.ngState.invalid() && this.ngState.touched()),
  );

  protected readonly hostClass = computed(() =>
    ['syui-inputtext', this.fluid() ? 'syui-fluid' : '', this.showInvalid() ? 'syui-invalid' : '']
      .filter(Boolean)
      .join(' '),
  );
}
