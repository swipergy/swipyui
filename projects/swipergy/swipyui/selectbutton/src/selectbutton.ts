import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  forwardRef,
  input,
  signal,
  viewChildren,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { BaseValueControl } from '@swipergy/swipyui/core';

export interface SelectButtonOption<T = unknown> {
  label: string;
  value: T;
  disabled?: boolean;
}

/**
 * Segmented group of toggle buttons for picking one value (or several with
 * `multiple`) from a small set of options. Each option is a button with
 * `aria-pressed`; arrow keys move focus within the group (roving tabindex),
 * Home/End jump to the edges.
 *
 * Implements the signal forms value contract, so it binds directly to a
 * field, and stays compatible with reactive and template-driven forms:
 *
 * ```html
 * <syui-select-button [options]="sizes" [formField]="f.size" />
 * <syui-select-button [options]="sizes" [formControl]="size" />
 * <syui-select-button [options]="sizes" [(value)]="size" multiple />
 * ```
 */
@Component({
  selector: 'syui-select-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './selectbutton.css',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SelectButton), multi: true },
  ],
  host: {
    class: 'syui-selectbutton',
    // Single-choice groups are a radiogroup; only multiple keeps toggle-button semantics.
    '[attr.role]': "multiple() ? 'group' : 'radiogroup'",
    '[class.syui-invalid]': 'showInvalid()',
    '[attr.aria-label]': 'ariaLabel() || null',
    '(keydown)': 'onKeydown($event)',
  },
  template: `
    @for (option of options(); track $index) {
      <button
        #btn
        type="button"
        class="syui-selectbutton-option"
        [class.syui-selectbutton-option-selected]="isSelected(option)"
        [attr.role]="multiple() ? null : 'radio'"
        [attr.aria-pressed]="multiple() ? isSelected(option) : null"
        [attr.aria-checked]="multiple() ? null : isSelected(option)"
        [tabindex]="$index === tabbableIndex() ? 0 : -1"
        [disabled]="isDisabled() || option.disabled"
        (click)="toggleOption(option)"
        (focus)="focusedIndex.set($index)"
        (blur)="onTouched()"
      >
        {{ option.label }}
      </button>
    }
  `,
})
export class SelectButton extends BaseValueControl<unknown> {
  /** Options as `{ label, value, disabled? }` objects. */
  readonly options = input<SelectButtonOption[]>([]);
  /** Allows selecting several options; `value` becomes an array. */
  readonly multiple = input(false, { transform: booleanAttribute });
  /** When false, the last selected option cannot be deselected. */
  readonly allowEmpty = input(true, { transform: booleanAttribute });
  private readonly buttons = viewChildren<ElementRef<HTMLButtonElement>>('btn');

  protected readonly focusedIndex = signal(-1);

  /** Index of the single button reachable via Tab (roving tabindex). */
  protected readonly tabbableIndex = computed(() => {
    const options = this.options();
    const focused = this.focusedIndex();
    if (focused >= 0 && focused < options.length && !options[focused].disabled) {
      return focused;
    }
    const selected = options.findIndex((option) => !option.disabled && this.isSelected(option));
    return selected >= 0 ? selected : options.findIndex((option) => !option.disabled);
  });

  protected isSelected(option: SelectButtonOption): boolean {
    const value = this.value();
    return this.multiple()
      ? Array.isArray(value) && value.includes(option.value)
      : value === option.value;
  }

  protected toggleOption(option: SelectButtonOption): void {
    if (option.disabled || this.isDisabled()) {
      return;
    }
    if (this.multiple()) {
      const current = Array.isArray(this.value()) ? [...(this.value() as unknown[])] : [];
      const index = current.indexOf(option.value);
      if (index >= 0) {
        if (!this.allowEmpty() && current.length === 1) {
          return;
        }
        current.splice(index, 1);
      } else {
        current.push(option.value);
      }
      this.updateValue(current);
    } else if (this.isSelected(option)) {
      if (this.allowEmpty()) {
        this.updateValue(null);
      }
    } else {
      this.updateValue(option.value);
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    const options = this.options();
    let index: number;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        index = this.nextEnabled(this.focusedIndex(), 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        index = this.nextEnabled(this.focusedIndex(), -1);
        break;
      case 'Home':
        index = options.findIndex((option) => !option.disabled);
        break;
      case 'End':
        index = this.nextEnabled(0, -1);
        break;
      default:
        return;
    }
    event.preventDefault();
    if (index >= 0) {
      this.focusedIndex.set(index);
      this.buttons()[index]?.nativeElement.focus();
    }
  }

  private nextEnabled(from: number, delta: number): number {
    const options = this.options();
    let index = from < 0 ? this.tabbableIndex() : from;
    for (let step = 0; step < options.length; step++) {
      index = (index + delta + options.length) % options.length;
      if (!options[index].disabled) {
        return index;
      }
    }
    return -1;
  }
}
