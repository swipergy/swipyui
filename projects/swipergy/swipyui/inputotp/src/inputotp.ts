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
  viewChildren,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { BaseValueControl } from '@swipergy/swipyui/core';

/**
 * One-time-passcode input: one single-character box per position. Typing
 * advances focus, Backspace moves back, arrow keys navigate and pasting
 * distributes the characters across the boxes. The value is the concatenated
 * string of all filled boxes.
 *
 * ```html
 * <syui-input-otp [length]="6" integerOnly [formField]="f.code" />
 * <syui-input-otp masked [(value)]="pin" />
 * ```
 */
@Component({
  selector: 'syui-input-otp',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './inputotp.css',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => InputOtp), multi: true },
  ],
  host: {
    class: 'syui-inputotp',
    role: 'group',
    '[attr.aria-label]': 'ariaLabel() || null',
    '[attr.aria-labelledby]': 'ariaLabelledby() || null',
  },
  template: `
    @for (char of chars(); track $index) {
      <input
        #slot
        class="syui-inputtext syui-inputotp-input"
        maxlength="1"
        autocomplete="one-time-code"
        [type]="masked() ? 'password' : 'text'"
        [attr.inputmode]="integerOnly() ? 'numeric' : 'text'"
        [class.syui-invalid]="showInvalid()"
        [value]="char"
        [disabled]="isDisabled()"
        [attr.aria-invalid]="showInvalid() ? true : null"
        [attr.aria-label]="'Character ' + ($index + 1) + ' of ' + length()"
        (input)="onInput($event, $index)"
        (keydown)="onKeydown($event, $index)"
        (paste)="onPaste($event)"
        (blur)="onTouched()"
      />
    }
  `,
})
export class InputOtp extends BaseValueControl<string> {
  /** Number of character boxes. */
  readonly length = input(4, { transform: numberAttribute });
  /** Accepts digits only. */
  readonly integerOnly = input(false, { transform: booleanAttribute });
  /** Renders password inputs so the entered code is hidden. */
  readonly masked = input(false, { transform: booleanAttribute });
  private readonly slots = viewChildren<ElementRef<HTMLInputElement>>('slot');

  /** Per-box characters derived from the concatenated value. */
  protected readonly chars = computed(() => {
    const value = this.value() ?? '';
    return Array.from({ length: this.length() }, (_, i) => value[i] ?? '');
  });

  protected onInput(event: Event, index: number): void {
    const element = event.target as HTMLInputElement;
    const char = this.sanitize(element.value).slice(-1);
    element.value = char;
    const chars = [...this.chars()];
    chars[index] = char;
    this.commit(chars);
    if (char && index < this.length() - 1) {
      this.focusSlot(index + 1);
    }
  }

  protected onKeydown(event: KeyboardEvent, index: number): void {
    const element = event.target as HTMLInputElement;
    switch (event.key) {
      case 'Backspace':
        if (element.value === '' && index > 0) {
          event.preventDefault();
          const chars = [...this.chars()];
          chars[index - 1] = '';
          this.commit(chars);
          this.focusSlot(index - 1);
        }
        return;
      case 'ArrowLeft':
        event.preventDefault();
        this.focusSlot(index - 1);
        return;
      case 'ArrowRight':
        event.preventDefault();
        this.focusSlot(index + 1);
        return;
    }
    if (
      this.integerOnly() &&
      event.key.length === 1 &&
      !/\d/.test(event.key) &&
      !event.ctrlKey &&
      !event.metaKey
    ) {
      event.preventDefault();
    }
  }

  protected onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pasted = this.sanitize(event.clipboardData?.getData('text') ?? '').slice(
      0,
      this.length(),
    );
    if (!pasted) {
      return;
    }
    const chars = Array.from({ length: this.length() }, (_, i) => pasted[i] ?? '');
    this.commit(chars);
    this.focusSlot(Math.min(pasted.length, this.length() - 1));
  }

  private sanitize(text: string): string {
    return this.integerOnly() ? text.replace(/\D/g, '') : text;
  }

  private commit(chars: string[]): void {
    this.updateValue(chars.join(''));
  }

  private focusSlot(index: number): void {
    const slot = this.slots()[Math.max(0, Math.min(index, this.length() - 1))];
    slot?.nativeElement.focus();
    slot?.nativeElement.select();
  }
}
