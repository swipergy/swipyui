import { Directive, ElementRef, booleanAttribute, computed, inject, input } from '@angular/core';
import { ngControlInvalidState } from '@swipergy/swipyui/core';

/**
 * Styles a native textarea, with optional auto-resizing to fit content.
 *
 * With `[formField]`, the `invalid` and `touched` inputs are bound
 * automatically from the field state, so invalid styling appears after the
 * first blur without any wiring:
 *
 * ```html
 * <textarea syuiTextarea autoResize [formField]="f.bio"></textarea>
 * ```
 */
@Directive({
  selector: 'textarea[syuiTextarea]',
  host: {
    '[class]': 'hostClass()',
    '[attr.aria-invalid]': 'showInvalid() ? true : null',
    '(input)': 'resize()',
  },
})
export class Textarea {
  /** Stretches the textarea to the width of its container. */
  readonly fluid = input(false, { transform: booleanAttribute });
  /** Marks the field as invalid (red border). */
  readonly invalid = input(false, { transform: booleanAttribute });
  /**
   * Touched state, bound automatically by `[formField]`, used to gate invalid
   * styling. Defaults to true so a manually set `invalid` shows immediately.
   */
  readonly touched = input(true, { transform: booleanAttribute });
  /** Grows the textarea with its content instead of scrolling. */
  readonly autoResize = input(false, { transform: booleanAttribute });

  private readonly host = inject<ElementRef<HTMLTextAreaElement>>(ElementRef);
  private readonly ngState = ngControlInvalidState();

  /** True when the invalid state should show, mirrored to `aria-invalid`. */
  protected readonly showInvalid = computed(
    () => (this.invalid() && this.touched()) || (this.ngState.invalid() && this.ngState.touched()),
  );

  protected readonly hostClass = computed(() =>
    [
      'syui-inputtext',
      'syui-textarea',
      this.fluid() ? 'syui-fluid' : '',
      this.showInvalid() ? 'syui-invalid' : '',
    ]
      .filter(Boolean)
      .join(' '),
  );

  protected resize(): void {
    if (!this.autoResize()) {
      return;
    }
    const el = this.host.nativeElement;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }
}
