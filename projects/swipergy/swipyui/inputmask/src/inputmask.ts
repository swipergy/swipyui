import {
  Directive,
  ElementRef,
  booleanAttribute,
  computed,
  effect,
  forwardRef,
  inject,
  input,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { BaseValueControl } from '@swipergy/swipyui/core';

/** A single mask position: either a matchable token or a literal character. */
interface MaskEntry {
  pattern: RegExp | null;
  literal: string;
}

const TOKEN_PATTERNS: Record<string, RegExp> = {
  '9': /\d/,
  a: /[a-zA-Z]/,
  '*': /[a-zA-Z0-9]/,
};

/**
 * Masks a native text input against a fixed pattern. Mask tokens:
 * `9` = digit, `a` = letter, `*` = alphanumeric; any other character is a
 * literal that is inserted automatically. While focused, unfilled positions
 * render as `slotChar`. Incomplete values are cleared on blur (`autoClear`).
 *
 * ```html
 * <input syuiInputMask mask="99/99/9999" placeholder="dd/mm/yyyy" [formField]="f.date" />
 * <input syuiInputMask mask="(999) 999-9999" unmask [(value)]="phoneDigits" />
 * ```
 */
@Directive({
  selector: 'input[syuiInputMask]',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => InputMask), multi: true },
  ],
  host: {
    '[class]': 'hostClass()',
    '[attr.aria-invalid]': 'showInvalid() ? true : null',
    '[attr.placeholder]': 'placeholder() ?? null',
    '[disabled]': 'isDisabled()',
    autocomplete: 'off',
    '(focus)': 'onFocus()',
    '(input)': 'onInput()',
    '(keydown)': 'onKeydown($event)',
    '(paste)': 'onPaste($event)',
    '(blur)': 'onBlur()',
  },
})
export class InputMask extends BaseValueControl<string> {
  /** Mask pattern, e.g. `99/99/9999` or `(999) 999-9999`. */
  readonly mask = input.required<string>();
  /** Placeholder character shown for unfilled positions while focused. */
  readonly slotChar = input('_');
  /** Stores the value stripped of mask literals, e.g. `1234567890`. */
  readonly unmask = input(false, { transform: booleanAttribute });
  /** Clears the value on blur when the mask is not completely filled. */
  readonly autoClear = input(true, { transform: booleanAttribute });
  readonly placeholder = input<string>();
  /** Stretches the input to the width of its container. */
  readonly fluid = input(false, { transform: booleanAttribute });

  private readonly el = inject<ElementRef<HTMLInputElement>>(ElementRef).nativeElement;
  private focused = false;

  protected readonly hostClass = computed(() =>
    ['syui-inputtext', 'syui-inputmask', this.fluid() ? 'syui-fluid' : '', this.showInvalid() ? 'syui-invalid' : '']
      .filter(Boolean)
      .join(' '),
  );

  private readonly entries = computed<MaskEntry[]>(() =>
    this.mask()
      .split('')
      .map((char) => ({ pattern: TOKEN_PATTERNS[char] ?? null, literal: char })),
  );

  private readonly tokenCount = computed(
    () => this.entries().filter((entry) => entry.pattern).length,
  );

  constructor() {
    super();
    // Reflect external value changes (writeValue, [(value)]) into the element.
    effect(() => {
      const extracted = this.extract(this.value() ?? '');
      const text = this.render(extracted, this.focused);
      if (this.el.value !== text) {
        this.el.value = text;
      }
    });
  }

  protected onFocus(): void {
    this.focused = true;
    this.write(this.extract(this.el.value));
  }

  protected onInput(): void {
    this.apply(this.extract(this.el.value));
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Backspace') {
      event.preventDefault();
      this.apply(this.extract(this.el.value).slice(0, -1));
    }
  }

  protected onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pasted = event.clipboardData?.getData('text') ?? '';
    this.apply(this.extract(this.extract(this.el.value) + pasted));
  }

  protected onBlur(): void {
    this.focused = false;
    const extracted = this.extract(this.el.value);
    if (this.autoClear() && extracted.length > 0 && extracted.length < this.tokenCount()) {
      this.updateValue(null);
      this.el.value = '';
    } else {
      this.write(extracted);
    }
    this.onTouched();
  }

  /** Updates the model from the accepted characters, then re-renders. */
  private apply(extracted: string): void {
    const stored =
      extracted.length === 0 ? null : this.unmask() ? extracted : this.render(extracted, false);
    this.updateValue(stored);
    this.write(extracted);
  }

  /** Rewrites the element text and puts the caret on the first empty slot. */
  private write(extracted: string): void {
    this.el.value = this.render(extracted, this.focused);
    if (this.focused) {
      const caret = this.caretPosition(extracted);
      this.el.setSelectionRange(caret, caret);
    }
  }

  /** Pulls the characters that match the mask tokens, in order. */
  private extract(text: string): string {
    const tokens = this.entries().filter((entry) => entry.pattern);
    let accepted = '';
    for (const char of text) {
      if (accepted.length >= tokens.length) {
        break;
      }
      if (tokens[accepted.length].pattern!.test(char)) {
        accepted += char;
      }
    }
    return accepted;
  }

  /**
   * Builds the display text: literals are inserted automatically, tokens are
   * filled from `extracted`. With `withSlots`, unfilled tokens render as
   * `slotChar`; otherwise the text stops at the first unfilled token.
   */
  private render(extracted: string, withSlots: boolean): string {
    if (extracted.length === 0 && !withSlots) {
      return '';
    }
    let output = '';
    let used = 0;
    for (const entry of this.entries()) {
      if (!entry.pattern) {
        output += entry.literal;
      } else if (used < extracted.length) {
        output += extracted[used++];
      } else if (withSlots) {
        output += this.slotChar();
      } else {
        break;
      }
    }
    return output;
  }

  /** Index of the first unfilled token in the rendered text. */
  private caretPosition(extracted: string): number {
    let position = 0;
    let used = 0;
    for (const entry of this.entries()) {
      if (entry.pattern && used >= extracted.length) {
        return position;
      }
      if (entry.pattern) {
        used++;
      }
      position++;
    }
    return position;
  }
}
