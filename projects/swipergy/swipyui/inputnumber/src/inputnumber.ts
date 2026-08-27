import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  forwardRef,
  input,
  numberAttribute,
  signal,
  viewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { BaseValueControl } from '@swipergy/swipyui/core';

/**
 * Numeric input with locale-aware display formatting (Intl.NumberFormat),
 * optional increment/decrement buttons and min/max clamping. ArrowUp and
 * ArrowDown step the value by `step`; the input exposes the spinbutton
 * ARIA pattern (aria-valuemin/max/now). The spin buttons are pointer-only
 * affordances hidden from assistive technology — keyboard and screen-reader
 * users step through the input itself.
 *
 * ```html
 * <syui-input-number [(value)]="quantity" [min]="0" [max]="99" showButtons />
 * <syui-input-number mode="currency" currency="EUR" locale="de-DE" [formField]="f.price" />
 * ```
 */
@Component({
  selector: 'syui-input-number',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './inputnumber.css',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => InputNumber), multi: true },
  ],
  host: {
    class: 'syui-inputnumber',
    '[class.syui-fluid]': 'fluid()',
    '[class.syui-inputnumber-buttons]': 'showButtons()',
  },
  template: `
    <input
      #inputEl
      type="text"
      class="syui-inputtext syui-inputnumber-input"
      role="spinbutton"
      inputmode="decimal"
      autocomplete="off"
      [class.syui-fluid]="fluid()"
      [class.syui-invalid]="showInvalid()"
      [value]="displayText()"
      [placeholder]="placeholder() ?? ''"
      [disabled]="isDisabled()"
      [attr.aria-valuemin]="min() ?? null"
      [attr.aria-valuemax]="max() ?? null"
      [attr.aria-valuenow]="value()"
      [attr.aria-valuetext]="displayText() || null"
      [attr.aria-invalid]="showInvalid() ? true : null"
      [attr.aria-label]="ariaLabel() || null"
      [attr.aria-labelledby]="ariaLabelledby() || null"
      (focus)="onFocus()"
      (input)="onInput($event)"
      (keydown)="onKeydown($event)"
      (blur)="onBlur()"
    />
    @if (showButtons()) {
      <span class="syui-inputnumber-button-group" aria-hidden="true">
        <button
          type="button"
          class="syui-inputnumber-button"
          tabindex="-1"
          [disabled]="isDisabled() || atMax()"
          (click)="spin(1)"
        >
          <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path
              d="M2.5 7.5L6 4L9.5 7.5"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <button
          type="button"
          class="syui-inputnumber-button"
          tabindex="-1"
          [disabled]="isDisabled() || atMin()"
          (click)="spin(-1)"
        >
          <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path
              d="M2.5 4.5L6 8L9.5 4.5"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </span>
    }
  `,
})
export class InputNumber extends BaseValueControl<number> {
  /** Shows stacked increment/decrement buttons next to the input. */
  readonly showButtons = input(false, { transform: booleanAttribute });
  /** Smallest accepted value; the value is clamped on blur and spin. */
  readonly min = input<number>();
  /** Largest accepted value; the value is clamped on blur and spin. */
  readonly max = input<number>();
  /** Amount added/subtracted per spin or arrow-key press. */
  readonly step = input(1, { transform: numberAttribute });
  /** Display format: plain decimal or currency. */
  readonly mode = input<'decimal' | 'currency'>('decimal');
  /** ISO 4217 currency code used when `mode` is 'currency'. */
  readonly currency = input('USD');
  /** BCP 47 locale for Intl.NumberFormat; defaults to the browser locale. */
  readonly locale = input<string>();
  /** Static text rendered before the formatted number. */
  readonly prefix = input('');
  /** Static text rendered after the formatted number. */
  readonly suffix = input('');
  /** Stretches the input to the width of its container. */
  readonly fluid = input(false, { transform: booleanAttribute });
  readonly placeholder = input<string>();
  private readonly inputEl = viewChild.required<ElementRef<HTMLInputElement>>('inputEl');

  private readonly focused = signal(false);
  /** Exact text the user is editing, so the value binding never fights the caret. */
  private readonly editText = signal('');

  private readonly formatter = computed(() =>
    this.mode() === 'currency'
      ? new Intl.NumberFormat(this.locale(), { style: 'currency', currency: this.currency() })
      : new Intl.NumberFormat(this.locale(), { maximumFractionDigits: 20 }),
  );

  /** The locale's decimal separator, e.g. ',' for de-DE. */
  private readonly decimalSeparator = computed(
    () =>
      new Intl.NumberFormat(this.locale())
        .formatToParts(1.1)
        .find((part) => part.type === 'decimal')?.value ?? '.',
  );

  protected readonly displayText = computed(() => {
    if (this.focused()) {
      return this.editText();
    }
    const value = this.value();
    return value == null ? '' : `${this.prefix()}${this.formatter().format(value)}${this.suffix()}`;
  });

  protected readonly atMin = computed(() => {
    const min = this.min();
    return min != null && this.value() != null && this.value()! <= min;
  });

  protected readonly atMax = computed(() => {
    const max = this.max();
    return max != null && this.value() != null && this.value()! >= max;
  });

  protected onFocus(): void {
    const value = this.value();
    this.editText.set(value == null ? '' : String(value).replace('.', this.decimalSeparator()));
    this.focused.set(true);
  }

  protected onInput(event: Event): void {
    const element = event.target as HTMLInputElement;
    this.editText.set(element.value);
    this.updateValue(this.parse(element.value));
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      this.spin(event.key === 'ArrowUp' ? 1 : -1);
    }
  }

  protected onBlur(): void {
    this.focused.set(false);
    const value = this.value();
    if (value != null) {
      this.updateValue(this.clamp(value));
    }
    this.onTouched();
  }

  /** Steps the value by `direction * step`, clamped to min/max. */
  protected spin(direction: number): void {
    if (this.isDisabled()) {
      return;
    }
    const base = this.value() ?? this.clamp(0);
    const next = this.clamp(this.round(base + direction * this.step()));
    this.updateValue(next);
    if (this.focused()) {
      this.editText.set(String(next).replace('.', this.decimalSeparator()));
    }
    this.inputEl().nativeElement.focus();
  }

  /** Extracts digits, sign and the locale decimal separator; NaN → null. */
  private parse(text: string): number | null {
    const separator = this.decimalSeparator();
    const cleaned = text
      .split('')
      .filter((char) => /[0-9-]/.test(char) || char === separator)
      .join('')
      .replace(separator, '.');
    const parsed = parseFloat(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private clamp(value: number): number {
    const min = this.min();
    const max = this.max();
    if (min != null && value < min) {
      return min;
    }
    if (max != null && value > max) {
      return max;
    }
    return value;
  }

  /** Kills float noise like 0.30000000000000004 after stepping. */
  private round(value: number): number {
    return parseFloat(value.toFixed(10));
  }
}
