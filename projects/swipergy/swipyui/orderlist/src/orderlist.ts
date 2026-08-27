import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  ViewEncapsulation,
  computed,
  contentChild,
  input,
  model,
  signal,
} from '@angular/core';
import { uniqueId } from '@swipergy/swipyui/core';

/** One reorder button: which operation it runs, its label and its icon path. */
interface ReorderControl {
  op: 'top' | 'up' | 'down' | 'bottom';
  label: string;
  icon: string;
}

const REORDER_CONTROLS: ReorderControl[] = [
  { op: 'top', label: 'Move to top', icon: 'M2.5 2.5H9.5M2.5 9L6 5.5L9.5 9' },
  { op: 'up', label: 'Move up', icon: 'M2.5 8L6 4.5L9.5 8' },
  { op: 'down', label: 'Move down', icon: 'M2.5 4L6 7.5L9.5 4' },
  { op: 'bottom', label: 'Move to bottom', icon: 'M2.5 3L6 6.5L9.5 3M2.5 9.5H9.5' },
];

/**
 * Reorderable listbox. Items are
 * multi-selectable (click selects, ctrl/cmd-click toggles, shift-click
 * ranges) and moved with the top/up/down/bottom buttons; every reorder
 * emits the updated array through the `value` model. Keyboard: arrow keys
 * move the active option, Space toggles selection, ctrl+arrow reorders.
 *
 * Custom item rendering via a projected template with `$implicit` item,
 * `index` and `selected` in the context:
 *
 * ```html
 * <syui-order-list [(value)]="products" header="Products">
 *   <ng-template let-product let-selected="selected">{{ product.name }}</ng-template>
 * </syui-order-list>
 * ```
 */
@Component({
  selector: 'syui-order-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './orderlist.css',
  imports: [NgTemplateOutlet],
  host: { class: 'syui-order-list' },
  template: `
    <div class="syui-order-list-controls">
      @for (control of reorderControls; track control.op) {
        <button
          type="button"
          class="syui-order-list-button"
          [attr.aria-label]="control.label"
          [disabled]="!hasSelection()"
          (click)="move(control.op)"
        >
          <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path
              [attr.d]="control.icon"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      }
    </div>
    <div class="syui-order-list-container">
      @if (header()) {
        <div class="syui-order-list-header" [id]="headerId">{{ header() }}</div>
      }
      <ul
        class="syui-order-list-list"
        role="listbox"
        aria-multiselectable="true"
        tabindex="0"
        [id]="listId"
        [attr.aria-label]="header() ? null : ariaLabel()"
        [attr.aria-labelledby]="header() ? headerId : null"
        [attr.aria-activedescendant]="activeIndex() >= 0 ? optionId(activeIndex()) : null"
        (keydown)="onKeydown($event)"
      >
        @for (item of value(); track $index) {
          <li
            class="syui-order-list-option"
            role="option"
            [id]="optionId($index)"
            [class.syui-order-list-option-selected]="isSelected(item)"
            [class.syui-order-list-option-active]="$index === activeIndex()"
            [attr.aria-selected]="isSelected(item)"
            (click)="onOptionClick($event, $index)"
          >
            @if (itemTemplate(); as template) {
              <ng-container
                [ngTemplateOutlet]="template"
                [ngTemplateOutletContext]="{
                  $implicit: item,
                  index: $index,
                  selected: isSelected(item),
                }"
              />
            } @else {
              {{ item }}
            }
          </li>
        } @empty {
          <li class="syui-order-list-empty">{{ emptyMessage() }}</li>
        }
      </ul>
    </div>
  `,
})
export class OrderList {
  /** Items to order; reorders emit the updated array through this model. */
  readonly value = model<any[]>([]);
  /** Title shown above the list, also labels the listbox. */
  readonly header = input('');
  /** Accessible name of the listbox when no `header` is set. */
  readonly ariaLabel = input('Items');
  readonly emptyMessage = input('No items');

  /** Custom item template; context: `$implicit` item, `index`, `selected`. */
  readonly itemTemplate = contentChild(TemplateRef);

  protected readonly reorderControls = REORDER_CONTROLS;
  protected readonly listId = uniqueId('syui-order-list');
  protected readonly headerId = uniqueId('syui-order-list-header');

  /** Currently selected items, tracked by reference. */
  protected readonly selectedItems = signal<any[]>([]);
  protected readonly activeIndex = signal(-1);
  private anchorIndex = -1;

  protected readonly hasSelection = computed(() => this.selectedItems().length > 0);

  protected optionId(index: number): string {
    return `${this.listId}-option-${index}`;
  }

  protected isSelected(item: any): boolean {
    return this.selectedItems().includes(item);
  }

  protected onOptionClick(event: MouseEvent, index: number): void {
    const items = this.value();
    if (event.shiftKey && this.anchorIndex >= 0) {
      const start = Math.min(this.anchorIndex, index);
      const end = Math.max(this.anchorIndex, index);
      this.selectedItems.set(items.slice(start, end + 1));
    } else if (event.ctrlKey || event.metaKey) {
      this.toggleSelection(index);
      this.anchorIndex = index;
    } else {
      this.selectedItems.set([items[index]]);
      this.anchorIndex = index;
    }
    this.activeIndex.set(index);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const count = this.value().length;
    if (!count) {
      return;
    }
    const reorder = event.ctrlKey || event.metaKey;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (reorder) {
          this.move('down');
        } else {
          this.activeIndex.set(Math.min(this.activeIndex() + 1, count - 1));
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (reorder) {
          this.move('up');
        } else {
          this.activeIndex.set(Math.max(this.activeIndex() - 1, 0));
        }
        break;
      case 'Home':
        event.preventDefault();
        if (reorder) {
          this.move('top');
        } else {
          this.activeIndex.set(0);
        }
        break;
      case 'End':
        event.preventDefault();
        if (reorder) {
          this.move('bottom');
        } else {
          this.activeIndex.set(count - 1);
        }
        break;
      case ' ':
        event.preventDefault();
        if (this.activeIndex() >= 0) {
          this.toggleSelection(this.activeIndex());
          this.anchorIndex = this.activeIndex();
        }
        break;
    }
  }

  /** Move the selected items within `value` and emit the updated array. */
  protected move(op: 'top' | 'up' | 'down' | 'bottom'): void {
    if (!this.hasSelection()) {
      return;
    }
    const items = this.value();
    const activeItem = this.activeIndex() >= 0 ? items[this.activeIndex()] : undefined;
    const next = this.computeOrder([...items], op);
    this.value.set(next);
    if (activeItem !== undefined) {
      this.activeIndex.set(next.indexOf(activeItem));
    }
  }

  private computeOrder(items: any[], op: 'top' | 'up' | 'down' | 'bottom'): any[] {
    switch (op) {
      case 'up':
        // Swap each selected item with its unselected predecessor so
        // contiguous selections move as a block and stop at the edge.
        for (let i = 1; i < items.length; i++) {
          if (this.isSelected(items[i]) && !this.isSelected(items[i - 1])) {
            [items[i - 1], items[i]] = [items[i], items[i - 1]];
          }
        }
        return items;
      case 'down':
        for (let i = items.length - 2; i >= 0; i--) {
          if (this.isSelected(items[i]) && !this.isSelected(items[i + 1])) {
            [items[i], items[i + 1]] = [items[i + 1], items[i]];
          }
        }
        return items;
      case 'top':
        return [
          ...items.filter((item) => this.isSelected(item)),
          ...items.filter((item) => !this.isSelected(item)),
        ];
      case 'bottom':
        return [
          ...items.filter((item) => !this.isSelected(item)),
          ...items.filter((item) => this.isSelected(item)),
        ];
    }
  }

  private toggleSelection(index: number): void {
    const item = this.value()[index];
    this.selectedItems.set(
      this.isSelected(item)
        ? this.selectedItems().filter((selected) => selected !== item)
        : [...this.selectedItems(), item],
    );
  }
}
