import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  TemplateRef,
  ViewContainerRef,
  ViewEncapsulation,
  booleanAttribute,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { MenuItem, uniqueId } from '@swipergy/swipyui/core';

/**
 * Menu of nested {@link MenuItem}s where items with children open a submenu
 * flowing to the right. Renders inline
 * by default, or as a popup attached to any trigger when `popup` is set.
 *
 * Follows the WAI-ARIA menu pattern: Up/Down move, Right opens a submenu,
 * Left closes it, Home/End jump, Enter activates and Escape closes all.
 *
 * ```html
 * <syui-tiered-menu [items]="items" />
 *
 * <syui-button label="Options" (onClick)="menu.toggle($event)" />
 * <syui-tiered-menu #menu [items]="items" popup />
 * ```
 */
@Component({
  selector: 'syui-tiered-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './tieredmenu.css',
  imports: [NgTemplateOutlet, RouterLink],
  template: `
    @if (!popup()) {
      <ng-container [ngTemplateOutlet]="menuTpl" />
    }

    <ng-template #menuTpl>
      <div
        class="syui-tieredmenu"
        [class.syui-tieredmenu-popup]="popup()"
        (keydown)="onKeydown($event)"
        (focusout)="onFocusOut($event)"
      >
        <ng-container
          [ngTemplateOutlet]="listTpl"
          [ngTemplateOutletContext]="{ $implicit: visibleItems(items()), parentKey: null }"
        />
      </div>
    </ng-template>

    <ng-template #listTpl let-list let-parentKey="parentKey">
      <ul
        class="syui-tieredmenu-list"
        role="menu"
        [class.syui-tieredmenu-submenu]="parentKey !== null"
        [attr.aria-label]="parentKey === null ? ariaLabel() || null : null"
      >
        @for (item of list; track $index) {
          @let key = parentKey === null ? '' + $index : parentKey + '-' + $index;
          @if (item.separator) {
            <li class="syui-tieredmenu-separator" role="separator"></li>
          } @else {
            <li
              role="none"
              class="syui-tieredmenu-item"
              [class.syui-tieredmenu-item-active]="isOpen(key)"
              [class.syui-tieredmenu-item-disabled]="item.disabled"
              (mouseenter)="onItemEnter(item, key, parentKey)"
            >
              @if (item.routerLink != null && !item.disabled) {
                <a
                  class="syui-tieredmenu-link"
                  role="menuitem"
                  [id]="itemId(key)"
                  [routerLink]="item.routerLink"
                  [tabindex]="tabIndexFor(key, item)"
                  [attr.aria-haspopup]="hasSubmenu(item) ? 'menu' : null"
                  [attr.aria-expanded]="hasSubmenu(item) ? isOpen(key) : null"
                  (click)="onItemClick($event, item, key, parentKey)"
                >
                  <ng-container
                    [ngTemplateOutlet]="contentTpl"
                    [ngTemplateOutletContext]="{ $implicit: item }"
                  />
                </a>
              } @else if (item.url && !item.disabled) {
                <a
                  class="syui-tieredmenu-link"
                  role="menuitem"
                  [id]="itemId(key)"
                  [attr.href]="item.url"
                  [attr.target]="item.target || null"
                  [tabindex]="tabIndexFor(key, item)"
                  [attr.aria-haspopup]="hasSubmenu(item) ? 'menu' : null"
                  [attr.aria-expanded]="hasSubmenu(item) ? isOpen(key) : null"
                  (click)="onItemClick($event, item, key, parentKey)"
                >
                  <ng-container
                    [ngTemplateOutlet]="contentTpl"
                    [ngTemplateOutletContext]="{ $implicit: item }"
                  />
                </a>
              } @else {
                <a
                  class="syui-tieredmenu-link"
                  role="menuitem"
                  [id]="itemId(key)"
                  [tabindex]="tabIndexFor(key, item)"
                  [attr.aria-haspopup]="hasSubmenu(item) ? 'menu' : null"
                  [attr.aria-expanded]="hasSubmenu(item) ? isOpen(key) : null"
                  [attr.aria-disabled]="item.disabled || null"
                  (click)="onItemClick($event, item, key, parentKey)"
                >
                  <ng-container
                    [ngTemplateOutlet]="contentTpl"
                    [ngTemplateOutletContext]="{ $implicit: item }"
                  />
                </a>
              }
              @if (hasSubmenu(item) && isOpen(key)) {
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

    <ng-template #contentTpl let-item>
      @if (item.icon) {
        <i class="syui-tieredmenu-icon" [class]="item.icon" aria-hidden="true"></i>
      }
      <span class="syui-tieredmenu-label">{{ item.label }}</span>
      @if (hasSubmenu(item)) {
        <svg class="syui-tieredmenu-chevron" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path
            d="M4.5 2.5L8 6L4.5 9.5"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      }
    </ng-template>
  `,
})
export class TieredMenu {
  /** Menu model; items with `items` open a nested submenu. */
  readonly items = input<MenuItem[]>([]);
  /** Renders the menu in an overlay controlled with `toggle`/`show`/`hide`. */
  readonly popup = input(false, { transform: booleanAttribute });
  readonly ariaLabel = input<string>();

  /** Emitted when the popup opens. */
  readonly onShow = output<void>();
  /** Emitted when the popup closes. */
  readonly onHide = output<void>();

  private readonly menuTemplate = viewChild.required<TemplateRef<unknown>>('menuTpl');
  private readonly overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private overlayRef?: OverlayRef;
  private target?: HTMLElement;

  private readonly menuId = uniqueId('syui-tieredmenu');
  protected readonly open = signal(false);
  /** Key of the deepest item whose submenu is open, e.g. `'0-2'`. */
  protected readonly openKey = signal<string | null>(null);
  protected readonly focusedKey = signal<string | null>(null);

  constructor() {
    inject(DestroyRef).onDestroy(() => this.overlayRef?.dispose());
  }

  /** Opens the popup when closed, closes it otherwise (popup mode only). */
  toggle(event: Event): void {
    this.open() ? this.hide() : this.show(event);
  }

  /** Opens the popup attached to the event's current target (popup mode only). */
  show(event: Event): void {
    if (!this.popup() || this.open()) {
      return;
    }
    this.target = event.currentTarget as HTMLElement;
    this.overlayRef?.dispose();
    this.overlayRef = this.createOverlay(this.target);
    this.overlayRef.attach(new TemplatePortal(this.menuTemplate(), this.viewContainerRef));
    this.open.set(true);
    this.onShow.emit();
    const first = this.navigableKeys(null)[0];
    if (first) {
      this.focusItem(first);
    }
  }

  /** Closes the popup (popup mode only). */
  hide(): void {
    if (!this.open()) {
      return;
    }
    this.overlayRef?.dispose();
    this.overlayRef = undefined;
    this.open.set(false);
    this.openKey.set(null);
    this.focusedKey.set(null);
    this.onHide.emit();
  }

  protected visibleItems(items: MenuItem[] | undefined): MenuItem[] {
    return items?.filter((item) => item.visible !== false) ?? [];
  }

  protected hasSubmenu(item: MenuItem): boolean {
    return !!item.items?.length;
  }

  protected itemId(key: string): string {
    return `${this.menuId}-${key}`;
  }

  /** True when the submenu of the item at `key` is open. */
  protected isOpen(key: string): boolean {
    const open = this.openKey();
    return open !== null && (open === key || open.startsWith(key + '-'));
  }

  protected tabIndexFor(key: string, item: MenuItem): number {
    if (item.disabled) {
      return -1;
    }
    const focused = this.focusedKey() ?? this.navigableKeys(null)[0];
    return key === focused ? 0 : -1;
  }

  protected onItemEnter(item: MenuItem, key: string, parentKey: string | null): void {
    if (item.disabled) {
      this.openKey.set(parentKey);
      return;
    }
    this.openKey.set(this.hasSubmenu(item) ? key : parentKey);
  }

  protected onItemClick(event: Event, item: MenuItem, key: string, parentKey: string | null): void {
    if (item.disabled) {
      event.preventDefault();
      return;
    }
    item.command?.({ originalEvent: event, item });
    if (this.hasSubmenu(item)) {
      event.preventDefault();
      const willOpen = !this.isOpen(key);
      this.openKey.set(willOpen ? key : parentKey);
      this.focusedKey.set(key);
    } else {
      this.openKey.set(null);
      if (this.popup()) {
        this.hide();
      }
    }
  }

  protected onFocusOut(event: FocusEvent): void {
    const container = event.currentTarget as HTMLElement;
    if (!container.contains(event.relatedTarget as Node)) {
      this.focusedKey.set(null);
      if (!this.popup()) {
        this.openKey.set(null);
      }
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    const focused = this.focusedKey();
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.moveFocus(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.moveFocus(-1);
        break;
      case 'Home':
      case 'End': {
        event.preventDefault();
        const keys = this.navigableKeys(focused ? this.parentKeyOf(focused) : null);
        const next = event.key === 'Home' ? keys[0] : keys[keys.length - 1];
        if (next) {
          this.focusItem(next);
        }
        break;
      }
      case 'ArrowRight': {
        event.preventDefault();
        const item = focused ? this.itemAt(focused) : null;
        if (focused && item && this.hasSubmenu(item)) {
          this.openKey.set(focused);
          const child = this.navigableKeys(focused)[0];
          if (child) {
            this.focusItem(child);
          }
        }
        break;
      }
      case 'ArrowLeft': {
        event.preventDefault();
        const parent = focused ? this.parentKeyOf(focused) : null;
        if (parent !== null) {
          this.openKey.set(this.parentKeyOf(parent));
          this.focusItem(parent);
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
      case 'Escape':
        event.preventDefault();
        if (this.popup()) {
          const target = this.target;
          this.hide();
          target?.focus();
        } else {
          this.openKey.set(null);
          if (focused) {
            this.focusItem(focused.split('-')[0]);
          }
        }
        break;
    }
  }

  private moveFocus(delta: number): void {
    const focused = this.focusedKey();
    if (!focused) {
      const first = this.navigableKeys(null)[0];
      if (first) {
        this.focusItem(first);
      }
      return;
    }
    const keys = this.navigableKeys(this.parentKeyOf(focused));
    const index = keys.indexOf(focused);
    const next = keys[(index + delta + keys.length) % keys.length];
    if (next) {
      this.focusItem(next);
    }
  }

  /** Keys of the focusable siblings below `parentKey` (root when null). */
  private navigableKeys(parentKey: string | null): string[] {
    const list =
      parentKey === null
        ? this.visibleItems(this.items())
        : this.visibleItems(this.itemAt(parentKey)?.items);
    return list
      .map((item, index) => ({
        item,
        key: parentKey === null ? `${index}` : `${parentKey}-${index}`,
      }))
      .filter(({ item }) => !item.separator && !item.disabled)
      .map(({ key }) => key);
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

  private focusItem(key: string): void {
    this.focusedKey.set(key);
    document.getElementById(this.itemId(key))?.focus();
  }

  private createOverlay(target: HTMLElement): OverlayRef {
    const overlayRef = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(target)
        .withPositions([
          { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
          { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
        ]),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
    });
    overlayRef.outsidePointerEvents().subscribe((event) => {
      if (!target.contains(event.target as Node)) {
        this.hide();
      }
    });
    return overlayRef;
  }
}
