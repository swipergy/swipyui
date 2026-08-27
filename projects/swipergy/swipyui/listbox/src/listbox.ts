import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { BaseValueControl, uniqueId } from '@swipergy/swipyui/core';
import type { SelectOption } from '@swipergy/swipyui/select';

/**
 * Inline option list following the WAI-ARIA listbox pattern: the list is a
 * single tab stop, the active option is tracked with aria-activedescendant,
 * arrow keys navigate, Home/End jump, Space/Enter toggles, and typing a
 * letter jumps to the next matching option. With `multiple` the value is an
 * array and options toggle independently; otherwise it is the selected
 * option's value.
 *
 * Implements the signal forms value contract, so it binds directly to a
 * field, and stays compatible with reactive and template-driven forms:
 *
 * ```html
 * <syui-listbox [options]="cities" [formField]="f.city" />
 * <syui-listbox [options]="cities" multiple filter [formControl]="cities" />
 * <syui-listbox [options]="cities" [(value)]="city" />
 * ```
 */
@Component({
  selector: 'syui-listbox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './listbox.css',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => Listbox), multi: true }],
  host: {
    class: 'syui-listbox',
    '[class.syui-fluid]': 'fluid()',
    '[class.syui-invalid]': 'showInvalid()',
    '[class.syui-listbox-disabled]': 'isDisabled()',
  },
  template: `
    @if (filter()) {
      <div class="syui-listbox-header">
        <input
          type="text"
          class="syui-listbox-filter"
          role="searchbox"
          aria-label="Filter options"
          [placeholder]="filterPlaceholder()"
          [value]="filterValue()"
          [disabled]="isDisabled()"
          (input)="onFilterInput($event)"
        />
      </div>
    }
    <ul
      class="syui-listbox-list"
      role="listbox"
      [id]="listId"
      [attr.tabindex]="isDisabled() ? null : 0"
      [attr.aria-multiselectable]="multiple() || null"
      [attr.aria-activedescendant]="activeIndex() >= 0 ? optionId(activeIndex()) : null"
      [attr.aria-label]="ariaLabel() || null"
      [attr.aria-disabled]="isDisabled() || null"
      (keydown)="onKeydown($event)"
      (blur)="onTouched()"
    >
      @for (option of visibleOptions(); track $index) {
        <li
          class="syui-listbox-option"
          role="option"
          [id]="optionId($index)"
          [class.syui-listbox-option-active]="$index === activeIndex()"
          [class.syui-listbox-option-selected]="isSelected(option)"
          [class.syui-listbox-option-disabled]="option.disabled"
          [attr.aria-selected]="isSelected(option)"
          [attr.aria-disabled]="option.disabled || null"
          (click)="toggleOption(option, $index)"
        >
          {{ option.label }}
        </li>
      } @empty {
        <li class="syui-listbox-empty">{{ emptyMessage() }}</li>
      }
    </ul>
    @if (filter()) {
      <span class="syui-sr-only" role="status">{{ filterStatus() }}</span>
    }
  `,
})
export class Listbox extends BaseValueControl<unknown> {
  readonly options = input<SelectOption[]>([]);
  /** Allows selecting several options; the value becomes an array. */
  readonly multiple = input(false, { transform: booleanAttribute });
  /** Shows a search box above the list that filters the options. */
  readonly filter = input(false, { transform: booleanAttribute });
  readonly filterPlaceholder = input('Search…');
  readonly emptyMessage = input('No options');
  /** Stretches the list to the width of its container. */
  readonly fluid = input(false, { transform: booleanAttribute });
  protected readonly listId = uniqueId('syui-listbox');
  protected readonly activeIndex = signal(-1);
  protected readonly filterValue = signal('');

  /** Options currently shown, narrowed by the filter query. */
  protected readonly visibleOptions = computed(() => {
    const query = this.filterValue().trim().toLowerCase();
    const options = this.options();
    return query ? options.filter((o) => o.label.toLowerCase().includes(query)) : options;
  });

  /** Politely announced so screen readers hear how many options the filter left. */
  protected readonly filterStatus = computed(() => {
    const count = this.visibleOptions().length;
    return count === 1 ? '1 result available' : `${count} results available`;
  });

  protected optionId(index: number): string {
    return `${this.listId}-option-${index}`;
  }

  protected isSelected(option: SelectOption): boolean {
    const value = this.value();
    return this.multiple()
      ? Array.isArray(value) && value.includes(option.value)
      : value === option.value;
  }

  protected toggleOption(option: SelectOption, index: number): void {
    if (option.disabled || this.isDisabled()) {
      return;
    }
    this.activeIndex.set(index);
    if (this.multiple()) {
      const current = Array.isArray(this.value()) ? (this.value() as unknown[]) : [];
      this.updateValue(
        current.includes(option.value)
          ? current.filter((value) => value !== option.value)
          : [...current, option.value],
      );
    } else {
      this.updateValue(option.value);
    }
  }

  protected onFilterInput(event: Event): void {
    this.filterValue.set((event.target as HTMLInputElement).value);
    this.activeIndex.set(this.firstEnabled(0, 1));
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (this.isDisabled()) {
      return;
    }
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.moveActive(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.moveActive(-1);
        break;
      case 'Home':
        event.preventDefault();
        this.activeIndex.set(this.firstEnabled(0, 1));
        break;
      case 'End':
        event.preventDefault();
        this.activeIndex.set(this.firstEnabled(this.visibleOptions().length - 1, -1));
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (this.activeIndex() >= 0) {
          this.toggleOption(this.visibleOptions()[this.activeIndex()], this.activeIndex());
        }
        break;
      default:
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          this.typeahead(event.key);
        }
    }
  }

  /** Moves the active option to the next enabled option starting with the letter. */
  private typeahead(letter: string): void {
    const options = this.visibleOptions();
    const query = letter.toLowerCase();
    const start = this.activeIndex() + 1;
    for (let step = 0; step < options.length; step++) {
      const index = (start + step) % options.length;
      const option = options[index];
      if (!option.disabled && option.label.toLowerCase().startsWith(query)) {
        this.activeIndex.set(index);
        return;
      }
    }
  }

  private moveActive(delta: number): void {
    const options = this.visibleOptions();
    let index = this.activeIndex();
    for (let step = 0; step < options.length; step++) {
      index = (index + delta + options.length) % options.length;
      if (!options[index].disabled) {
        this.activeIndex.set(index);
        return;
      }
    }
  }

  private firstEnabled(start: number, delta: number): number {
    const options = this.visibleOptions();
    for (let i = start; i >= 0 && i < options.length; i += delta) {
      if (!options[i].disabled) {
        return i;
      }
    }
    return -1;
  }
}
