import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  ViewEncapsulation,
  booleanAttribute,
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
 * Selection and reorder engine for one PickList listbox. Both panes share
 * this logic instead of duplicating it per list: click selects, ctrl/cmd-click
 * toggles, shift-click ranges; arrow keys move the active option, Space
 * toggles selection and ctrl+arrow reorders the selected items.
 */
class PickListPane {
  readonly selection = signal<any[]>([]);
  readonly activeIndex = signal(-1);
  readonly hasSelection = computed(() => this.selection().length > 0);
  readonly listId: string;
  private anchorIndex = -1;

  constructor(
    idPrefix: string,
    private readonly items: () => any[],
    private readonly setItems: (items: any[]) => void,
  ) {
    this.listId = uniqueId(idPrefix);
  }

  optionId(index: number): string {
    return `${this.listId}-option-${index}`;
  }

  isSelected(item: any): boolean {
    return this.selection().includes(item);
  }

  onOptionClick(event: MouseEvent, index: number): void {
    const items = this.items();
    if (event.shiftKey && this.anchorIndex >= 0) {
      const start = Math.min(this.anchorIndex, index);
      const end = Math.max(this.anchorIndex, index);
      this.selection.set(items.slice(start, end + 1));
    } else if (event.ctrlKey || event.metaKey) {
      this.toggleSelection(index);
      this.anchorIndex = index;
    } else {
      this.selection.set([items[index]]);
      this.anchorIndex = index;
    }
    this.activeIndex.set(index);
  }

  onKeydown(event: KeyboardEvent): void {
    const count = this.items().length;
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

  /** Move the selected items within the list and emit the updated array. */
  move(op: 'top' | 'up' | 'down' | 'bottom'): void {
    if (!this.hasSelection()) {
      return;
    }
    const items = this.items();
    const activeItem = this.activeIndex() >= 0 ? items[this.activeIndex()] : undefined;
    const next = this.computeOrder([...items], op);
    this.setItems(next);
    if (activeItem !== undefined) {
      this.activeIndex.set(next.indexOf(activeItem));
    }
  }

  /** Remove and return the selected items in list order (for transfers). */
  takeSelected(): any[] {
    const moved = this.items().filter((item) => this.isSelected(item));
    this.setItems(this.items().filter((item) => !this.isSelected(item)));
    this.clear();
    return moved;
  }

  /** Remove and return all items (for move-all transfers). */
  takeAll(): any[] {
    const moved = this.items();
    this.setItems([]);
    this.clear();
    return moved;
  }

  private clear(): void {
    this.selection.set([]);
    this.activeIndex.set(-1);
    this.anchorIndex = -1;
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
    const item = this.items()[index];
    this.selection.set(
      this.isSelected(item)
        ? this.selection().filter((selected) => selected !== item)
        : [...this.selection(), item],
    );
  }
}

/**
 * Dual listbox for moving items between a source and a target list. Both lists are multi-selectable (click,
 * ctrl/cmd-click, shift-click) with the four transfer buttons in between and
 * optional per-list reorder buttons. Every transfer or reorder emits the
 * updated arrays through the `source` / `target` models.
 *
 * Custom item rendering via a projected template with `$implicit` item,
 * `index` and `selected` in the context:
 *
 * ```html
 * <syui-pick-list [(source)]="available" [(target)]="chosen"
 *               sourceHeader="Available" targetHeader="Chosen">
 *   <ng-template let-product>{{ product.name }}</ng-template>
 * </syui-pick-list>
 * ```
 */
@Component({
  selector: 'syui-pick-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './picklist.css',
  imports: [NgTemplateOutlet],
  host: { class: 'syui-pick-list' },
  template: `
    @if (showSourceControls()) {
      <div class="syui-pick-list-controls">
        @for (control of reorderControls; track control.op) {
          <button
            type="button"
            class="syui-pick-list-button"
            [attr.aria-label]="control.label"
            [disabled]="!sourcePane.hasSelection()"
            (click)="sourcePane.move(control.op)"
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
    }

    <div class="syui-pick-list-container">
      @if (sourceHeader()) {
        <div class="syui-pick-list-header" [id]="sourcePane.listId + '-header'">
          {{ sourceHeader() }}
        </div>
      }
      <ul
        class="syui-pick-list-list"
        role="listbox"
        aria-multiselectable="true"
        tabindex="0"
        [id]="sourcePane.listId"
        [attr.aria-label]="sourceHeader() ? null : 'Source'"
        [attr.aria-labelledby]="sourceHeader() ? sourcePane.listId + '-header' : null"
        [attr.aria-activedescendant]="
          sourcePane.activeIndex() >= 0 ? sourcePane.optionId(sourcePane.activeIndex()) : null
        "
        (keydown)="sourcePane.onKeydown($event)"
      >
        @for (item of source(); track $index) {
          <li
            class="syui-pick-list-option"
            role="option"
            [id]="sourcePane.optionId($index)"
            [class.syui-pick-list-option-selected]="sourcePane.isSelected(item)"
            [class.syui-pick-list-option-active]="$index === sourcePane.activeIndex()"
            [attr.aria-selected]="sourcePane.isSelected(item)"
            (click)="sourcePane.onOptionClick($event, $index)"
          >
            @if (itemTemplate(); as template) {
              <ng-container
                [ngTemplateOutlet]="template"
                [ngTemplateOutletContext]="{
                  $implicit: item,
                  index: $index,
                  selected: sourcePane.isSelected(item),
                }"
              />
            } @else {
              {{ item }}
            }
          </li>
        } @empty {
          <li class="syui-pick-list-empty">{{ emptyMessage() }}</li>
        }
      </ul>
    </div>

    <div class="syui-pick-list-transfer-controls">
      <button
        type="button"
        class="syui-pick-list-button"
        aria-label="Move to target"
        [disabled]="!sourcePane.hasSelection()"
        (click)="moveToTarget()"
      >
        <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path
            d="M4.5 2.5L8 6L4.5 9.5"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <button
        type="button"
        class="syui-pick-list-button"
        aria-label="Move all to target"
        [disabled]="!source().length"
        (click)="moveAllToTarget()"
      >
        <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path
            d="M2.5 2.5L6 6L2.5 9.5M6.5 2.5L10 6L6.5 9.5"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <button
        type="button"
        class="syui-pick-list-button"
        aria-label="Move to source"
        [disabled]="!targetPane.hasSelection()"
        (click)="moveToSource()"
      >
        <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path
            d="M7.5 2.5L4 6L7.5 9.5"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <button
        type="button"
        class="syui-pick-list-button"
        aria-label="Move all to source"
        [disabled]="!target().length"
        (click)="moveAllToSource()"
      >
        <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path
            d="M9.5 2.5L6 6L9.5 9.5M5.5 2.5L2 6L5.5 9.5"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>

    <div class="syui-pick-list-container">
      @if (targetHeader()) {
        <div class="syui-pick-list-header" [id]="targetPane.listId + '-header'">
          {{ targetHeader() }}
        </div>
      }
      <ul
        class="syui-pick-list-list"
        role="listbox"
        aria-multiselectable="true"
        tabindex="0"
        [id]="targetPane.listId"
        [attr.aria-label]="targetHeader() ? null : 'Target'"
        [attr.aria-labelledby]="targetHeader() ? targetPane.listId + '-header' : null"
        [attr.aria-activedescendant]="
          targetPane.activeIndex() >= 0 ? targetPane.optionId(targetPane.activeIndex()) : null
        "
        (keydown)="targetPane.onKeydown($event)"
      >
        @for (item of target(); track $index) {
          <li
            class="syui-pick-list-option"
            role="option"
            [id]="targetPane.optionId($index)"
            [class.syui-pick-list-option-selected]="targetPane.isSelected(item)"
            [class.syui-pick-list-option-active]="$index === targetPane.activeIndex()"
            [attr.aria-selected]="targetPane.isSelected(item)"
            (click)="targetPane.onOptionClick($event, $index)"
          >
            @if (itemTemplate(); as template) {
              <ng-container
                [ngTemplateOutlet]="template"
                [ngTemplateOutletContext]="{
                  $implicit: item,
                  index: $index,
                  selected: targetPane.isSelected(item),
                }"
              />
            } @else {
              {{ item }}
            }
          </li>
        } @empty {
          <li class="syui-pick-list-empty">{{ emptyMessage() }}</li>
        }
      </ul>
    </div>

    @if (showTargetControls()) {
      <div class="syui-pick-list-controls">
        @for (control of reorderControls; track control.op) {
          <button
            type="button"
            class="syui-pick-list-button"
            [attr.aria-label]="control.label"
            [disabled]="!targetPane.hasSelection()"
            (click)="targetPane.move(control.op)"
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
    }
  `,
})
export class PickList {
  /** Items of the left (source) list; transfers emit the updated array. */
  readonly source = model<any[]>([]);
  /** Items of the right (target) list; transfers emit the updated array. */
  readonly target = model<any[]>([]);
  /** Title above the source list, also labels its listbox. */
  readonly sourceHeader = input('');
  /** Title above the target list, also labels its listbox. */
  readonly targetHeader = input('');
  /** Shows the reorder buttons next to the source list. */
  readonly showSourceControls = input(true, { transform: booleanAttribute });
  /** Shows the reorder buttons next to the target list. */
  readonly showTargetControls = input(true, { transform: booleanAttribute });
  readonly emptyMessage = input('No items');

  /** Custom item template for both lists; context: `$implicit` item, `index`, `selected`. */
  readonly itemTemplate = contentChild(TemplateRef);

  protected readonly reorderControls = REORDER_CONTROLS;

  protected readonly sourcePane = new PickListPane(
    'syui-pick-list-source',
    () => this.source(),
    (items) => this.source.set(items),
  );
  protected readonly targetPane = new PickListPane(
    'syui-pick-list-target',
    () => this.target(),
    (items) => this.target.set(items),
  );

  protected moveToTarget(): void {
    if (this.sourcePane.hasSelection()) {
      this.target.set([...this.target(), ...this.sourcePane.takeSelected()]);
    }
  }

  protected moveAllToTarget(): void {
    if (this.source().length) {
      this.target.set([...this.target(), ...this.sourcePane.takeAll()]);
    }
  }

  protected moveToSource(): void {
    if (this.targetPane.hasSelection()) {
      this.source.set([...this.source(), ...this.targetPane.takeSelected()]);
    }
  }

  protected moveAllToSource(): void {
    if (this.target().length) {
      this.source.set([...this.source(), ...this.targetPane.takeAll()]);
    }
  }
}
