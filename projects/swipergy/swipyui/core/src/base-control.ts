import {
  DestroyRef,
  Directive,
  Injector,
  Signal,
  afterNextRender,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import type { FormCheckboxControl, FormValueControl } from '@angular/forms/signals';

/**
 * Tracks the invalid and touched state of the `NgControl` attached to the
 * host element (`formControl`, `formControlName` or `ngModel`), so validators
 * of reactive and template-driven forms — built-in and custom — drive the
 * invalid styling of SwipyUI controls without any extra wiring.
 *
 * Both signals stay `false` when the host has no NgControl. Must be called in
 * an injection context. The NgControl is resolved after the first render
 * because resolving it during construction would be circular for controls
 * that provide NG_VALUE_ACCESSOR.
 */
export function ngControlInvalidState(): { invalid: Signal<boolean>; touched: Signal<boolean> } {
  const injector = inject(Injector);
  const destroyRef = inject(DestroyRef);
  const invalid = signal(false);
  const touched = signal(false);
  afterNextRender(() => {
    const control = injector.get(NgControl, null, { self: true, optional: true })?.control;
    if (!control) {
      return;
    }
    const sync = () => {
      invalid.set(control.invalid);
      touched.set(control.touched);
    };
    sync();
    const subscription = control.events.subscribe(sync);
    destroyRef.onDestroy(() => subscription.unsubscribe());
  });
  return { invalid, touched };
}

/**
 * Shared state and ControlValueAccessor plumbing for all SwipyUI form
 * controls. Subclasses must provide NG_VALUE_ACCESSOR themselves:
 *
 * ```ts
 * providers: [{
 *   provide: NG_VALUE_ACCESSOR,
 *   useExisting: forwardRef(() => Checkbox),
 *   multi: true,
 * }]
 * ```
 */
@Directive()
export abstract class ControlBase implements ControlValueAccessor {
  /** Disables the control (independent of the form API's disabled state). */
  readonly disabled = input(false, { transform: booleanAttribute });

  /**
   * Marks the control as invalid. Bound automatically when the control is
   * attached to a signal form via `[formField]`.
   */
  readonly invalid = input(false, { transform: booleanAttribute });

  /**
   * Touched state, bound automatically by `[formField]`, used to gate invalid
   * styling so required fields don't render red before the first interaction.
   * Defaults to true so a manually set `invalid` shows immediately.
   */
  readonly touched = input(true, { transform: booleanAttribute });

  /**
   * Accessible name for the control. Use when no visible
   * label is associated; a visible `<label>` or `ariaLabelledby` is preferred.
   * Subclasses bind it to the focusable element via `[attr.aria-label]`.
   */
  readonly ariaLabel = input<string>();

  /**
   * Space-separated id(s) of the element(s) that label the control.
   * Subclasses bind it via `[attr.aria-labelledby]`.
   */
  readonly ariaLabelledby = input<string>();

  /**
   * Space-separated id(s) of help or error text describing the control.
   * Subclasses bind it via `[attr.aria-describedby]`, merging any internal
   * ids of their own.
   */
  readonly ariaDescribedby = input<string>();

  private readonly formDisabled = signal(false);
  private readonly ngState = ngControlInvalidState();

  /** True when disabled via input or via the forms API. */
  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  /**
   * True when the control should render its invalid state: either the
   * `invalid`/`touched` inputs (set manually or bound by signal forms'
   * `[formField]`) or the validator state of an attached reactive or
   * template-driven form control.
   */
  protected readonly showInvalid = computed(
    () => (this.invalid() && this.touched()) || (this.ngState.invalid() && this.ngState.touched()),
  );

  /**
   * Value for `[attr.aria-invalid]` on the focusable element: `'true'` while
   * {@link showInvalid} is set, `null` otherwise so the attribute is removed
   * while the control is valid.
   */
  protected readonly ariaInvalid = computed(() => (this.showInvalid() ? 'true' : null));

  protected onChange: (value: any) => void = () => {};
  protected onTouched: () => void = () => {};

  abstract writeValue(value: any): void;

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }
}

/**
 * Base class for controls that edit a single value, e.g. Select.
 *
 * Natively implements the signal forms `FormValueControl` contract through
 * the `value` model, so `[formField]` two-way binds the field value and keeps
 * `disabled`, `invalid` and `touched` in sync. The inherited
 * ControlValueAccessor keeps reactive and template-driven forms working, and
 * plain `[(value)]` binding needs no form at all.
 */
@Directive()
export abstract class BaseValueControl<T>
  extends ControlBase
  implements FormValueControl<T | null>
{
  /** Current value, kept in sync with the form model. */
  readonly value = model<T | null>(null);

  writeValue(value: T | null): void {
    this.value.set(value);
  }

  /** Set a new value from user interaction and propagate it to the form. */
  protected updateValue(value: T | null): void {
    this.value.set(value);
    this.onChange(value);
  }
}

/**
 * Base class for boolean controls, e.g. Checkbox and ToggleSwitch.
 *
 * Natively implements the signal forms `FormCheckboxControl` contract through
 * the `checked` model; otherwise identical to {@link BaseValueControl}.
 */
@Directive()
export abstract class BaseCheckboxControl extends ControlBase implements FormCheckboxControl {
  /** Checked state, kept in sync with the form model. */
  readonly checked = model(false);

  writeValue(value: any): void {
    this.checked.set(value === true);
  }

  /** Set the checked state from user interaction and propagate it to the form. */
  protected updateChecked(checked: boolean): void {
    this.checked.set(checked);
    this.onChange(checked);
  }
}

/**
 * Base class for controls that hold a value but cannot expose it as a
 * `value` model, e.g. RadioButton, where `value` is the option's own value.
 * These controls work with signal forms through the `[formField]`
 * ControlValueAccessor interop.
 */
@Directive()
export abstract class BaseControl<T> extends ControlBase {
  /** Current value, kept in sync with the form model. */
  protected readonly modelValue = signal<T | null>(null);

  writeValue(value: T | null): void {
    this.modelValue.set(value);
  }

  /** Set a new value from user interaction and propagate it to the form. */
  protected updateModel(value: T | null): void {
    this.modelValue.set(value);
    this.onChange(value);
  }
}
