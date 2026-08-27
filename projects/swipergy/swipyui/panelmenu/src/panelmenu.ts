import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  inject,
  input,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { MenuItem, uniqueId } from '@swipergy/swipyui/core';

/**
 * Vertical accordion of nested {@link MenuItem}s. Root items with children expand and collapse as panels; nested
 * levels indent and expand inline. Only one root panel is open at a time
 * unless `multiple` is set.
 *
 * Keyboard: Up/Down move through all visible items, Right expands, Left
 * collapses, Home/End jump, Enter and Space activate or toggle.
 *
 * ```html
 * <syui-panel-menu [items]="items" />
 * <syui-panel-menu [items]="items" multiple />
 * ```
 */
@Component({
  selector: 'syui-panel-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './panelmenu.css',
  imports: [NgTemplateOutlet, RouterLink],
  host: {
    class: 'syui-panelmenu',
    '(keydown)': 'onKeydown($event)',
    '(focusout)': 'onFocusOut($event)',
  },
  template: `
    @for (item of visibleItems(items()); track $index) {
      @let key = '' + $index;
      @if (item.separator) {
        <div class="syui-panelmenu-separator" role="separator"></div>
      } @else {
        <div class="syui-panelmenu-panel" [class.syui-panelmenu-panel-expanded]="isExpanded(key)">
          <ng-container
            [ngTemplateOutlet]="linkTpl"
            [ngTemplateOutletContext]="{ $implicit: item, key, header: true }"
          />
          @if (hasSubmenu(item)) {
            <div
              class="syui-panelmenu-content"
              role="region"
              [id]="contentId(key)"
              [attr.aria-labelledby]="itemId(key)"
            >
              @if (isExpanded(key)) {
                <ng-container
                  [ngTemplateOutlet]="listTpl"
                  [ngTemplateOutletContext]="{ $implicit: visibleItems(item.items), parentKey: key }"
                />
              }
            </div>
          }
        </div>
      }
    }

    <!-- Disclosure pattern: the focusable links carry aria-expanded/aria-controls;
         the list keeps native ul/li semantics. -->
    <ng-template #listTpl let-list let-parentKey="parentKey">
      <ul class="syui-panelmenu-list">
        @for (item of list; track $index) {
          @let key = parentKey + '-' + $index;
          @if (item.separator) {
            <li class="syui-panelmenu-separator" role="separator"></li>
          } @else {
            <li class="syui-panelmenu-node">
              <ng-container
                [ngTemplateOutlet]="linkTpl"
                [ngTemplateOutletContext]="{ $implicit: item, key, header: false }"
              />
              @if (hasSubmenu(item) && isExpanded(key)) {
                <ng-container
                  [ngTemplateOutlet]="listTpl"
                  [ngTemplateOutletContext]="{ $implicit: visibleItems(item.items), parentKey: key }"
                />
              }
            </li>
          }
        }
      </ul>
    </ng-template>

    <ng-template #linkTpl let-item let-key="key" let-header="header">
      @if (item.routerLink != null && !item.disabled) {
        <a
          [class]="header ? 'syui-panelmenu-header' : 'syui-panelmenu-link'"
          [id]="itemId(key)"
          [routerLink]="item.routerLink"
          [tabindex]="tabIndexFor(key, item)"
          [attr.aria-expanded]="hasSubmenu(item) ? isExpanded(key) : null"
          [attr.aria-controls]="header && hasSubmenu(item) ? contentId(key) : null"
          (click)="onItemClick($event, item, key)"
        >
          <ng-container
            [ngTemplateOutlet]="contentTpl"
            [ngTemplateOutletContext]="{ $implicit: item, expanded: isExpanded(key) }"
          />
        </a>
      } @else if (item.url && !item.disabled) {
        <a
          [class]="header ? 'syui-panelmenu-header' : 'syui-panelmenu-link'"
          [id]="itemId(key)"
          [attr.href]="item.url"
          [attr.target]="item.target || null"
          [tabindex]="tabIndexFor(key, item)"
          [attr.aria-expanded]="hasSubmenu(item) ? isExpanded(key) : null"
          [attr.aria-controls]="header && hasSubmenu(item) ? contentId(key) : null"
          (click)="onItemClick($event, item, key)"
        >
          <ng-container
            [ngTemplateOutlet]="contentTpl"
            [ngTemplateOutletContext]="{ $implicit: item, expanded: isExpanded(key) }"
          />
        </a>
      } @else {
        <a
          [class]="header ? 'syui-panelmenu-header' : 'syui-panelmenu-link'"
          [id]="itemId(key)"
          role="button"
          [tabindex]="tabIndexFor(key, item)"
          [attr.aria-expanded]="hasSubmenu(item) ? isExpanded(key) : null"
          [attr.aria-controls]="header && hasSubmenu(item) ? contentId(key) : null"
          [attr.aria-disabled]="item.disabled || null"
          (click)="onItemClick($event, item, key)"
        >
          <ng-container
            [ngTemplateOutlet]="contentTpl"
            [ngTemplateOutletContext]="{ $implicit: item, expanded: isExpanded(key) }"
          />
        </a>
      }
    </ng-template>

    <ng-template #contentTpl let-item let-expanded="expanded">
      @if (hasSubmenu(item)) {
        <svg
          class="syui-panelmenu-chevron"
          [class.syui-panelmenu-chevron-expanded]="expanded"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4.5 2.5L8 6L4.5 9.5"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      }
      @if (item.icon) {
        <i class="syui-panelmenu-icon" [class]="item.icon" aria-hidden="true"></i>
      }
      <span class="syui-panelmenu-label">{{ item.label }}</span>
    </ng-template>
  `,
})
export class PanelMenu {
  /** Menu model; root items with `items` become collapsible panels. */
  readonly items = input<MenuItem[]>([]);
  /** Allows several root panels to be expanded at the same time. */
  readonly multiple = input(false, { transform: booleanAttribute });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly menuId = uniqueId('syui-panelmenu');

  /** Keys of the expanded items, e.g. `'0'` for a root, `'0-2'` for a node. */
  protected readonly expandedKeys = signal<ReadonlySet<string>>(new Set());
  protected readonly focusedKey = signal<string | null>(null);

  protected visibleItems(items: MenuItem[] | undefined): MenuItem[] {
    return items?.filter((item) => item.visible !== false) ?? [];
  }

  protected hasSubmenu(item: MenuItem): boolean {
    return !!item.items?.length;
  }

  protected itemId(key: string): string {
    return `${this.menuId}-${key}`;
  }

  protected contentId(key: string): string {
    return `${this.menuId}-content-${key}`;
  }

  protected isExpanded(key: string): boolean {
    return this.expandedKeys().has(key);
  }

  protected tabIndexFor(key: string, item: MenuItem): number {
    if (item.disabled) {
      return -1;
    }
    const focused = this.focusedKey() ?? this.navigableKeys()[0];
    return key === focused ? 0 : -1;
  }

  protected onItemClick(event: Event, item: MenuItem, key: string): void {
    if (item.disabled) {
      event.preventDefault();
      return;
    }
    this.focusedKey.set(key);
    item.command?.({ originalEvent: event, item });
    if (this.hasSubmenu(item)) {
      event.preventDefault();
      this.toggleKey(key);
    }
  }

  protected onFocusOut(event: FocusEvent): void {
    if (!this.host.nativeElement.contains(event.relatedTarget as Node)) {
      this.focusedKey.set(null);
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    const keys = this.navigableKeys();
    const focused = this.focusedKey();
    const index = focused ? keys.indexOf(focused) : -1;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.focusItem(keys[Math.min(index + 1, keys.length - 1)]);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.focusItem(keys[Math.max(index - 1, 0)]);
        break;
      case 'Home':
        event.preventDefault();
        this.focusItem(keys[0]);
        break;
      case 'End':
        event.preventDefault();
        this.focusItem(keys[keys.length - 1]);
        break;
      case 'ArrowRight': {
        event.preventDefault();
        const item = focused ? this.itemAt(focused) : null;
        if (focused && item && this.hasSubmenu(item)) {
          this.isExpanded(focused)
            ? this.focusItem(keys[Math.min(index + 1, keys.length - 1)])
            : this.toggleKey(focused);
        }
        break;
      }
      case 'ArrowLeft': {
        event.preventDefault();
        if (!focused) {
          break;
        }
        const item = this.itemAt(focused);
        if (item && this.hasSubmenu(item) && this.isExpanded(focused)) {
          this.toggleKey(focused);
        } else {
          const parent = this.parentKeyOf(focused);
          if (parent !== null) {
            this.focusItem(parent);
          }
        }
        break;
      }
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (focused) {
          document.getElementById(this.itemId(focused))?.click();
        }
        break;
    }
  }

  private toggleKey(key: string): void {
    const expanded = new Set(this.expandedKeys());
    if (expanded.has(key)) {
      expanded.delete(key);
    } else {
      if (!this.multiple() && !key.includes('-')) {
        for (const other of [...expanded]) {
          if (!other.includes('-')) {
            expanded.delete(other);
          }
        }
      }
      expanded.add(key);
    }
    this.expandedKeys.set(expanded);
  }

  /** Keys of all visible, enabled items in document order. */
  private navigableKeys(): string[] {
    const keys: string[] = [];
    const walk = (list: MenuItem[], parentKey: string | null) => {
      list.forEach((item, index) => {
        if (item.separator) {
          return;
        }
        const key = parentKey === null ? `${index}` : `${parentKey}-${index}`;
        if (!item.disabled) {
          keys.push(key);
        }
        if (this.hasSubmenu(item) && this.isExpanded(key)) {
          walk(this.visibleItems(item.items), key);
        }
      });
    };
    walk(this.visibleItems(this.items()), null);
    return keys;
  }

  private itemAt(key: string): MenuItem | null {
    let list = this.visibleItems(this.items());
    let item: MenuItem | null = null;
    for (const part of key.split('-')) {
      item = list[Number(part)] ?? null;
      if (!item) {
        return null;
      }
      list = this.visibleItems(item.items);
    }
    return item;
  }

  private parentKeyOf(key: string): string | null {
    const index = key.lastIndexOf('-');
    return index < 0 ? null : key.slice(0, index);
  }

  private focusItem(key: string | undefined): void {
    if (!key) {
      return;
    }
    this.focusedKey.set(key);
    document.getElementById(this.itemId(key))?.focus();
  }
}
