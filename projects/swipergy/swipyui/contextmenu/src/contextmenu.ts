import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  TemplateRef,
  ViewContainerRef,
  ViewEncapsulation,
  booleanAttribute,
  effect,
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
 * Right-click menu of nested {@link MenuItem}s. Opens at the cursor position in a CDK overlay; items with
 * children open submenus flowing to the right. Closes on outside click and
 * Escape, which returns focus to the element the menu was opened on. Attach
 * it to an element by calling `show($event)` from its `(contextmenu)` event —
 * fired by right-click as well as Shift+F10 and the ContextMenu key, in which
 * case the menu is anchored to the element instead of the pointer — or set
 * `global` to bind the whole document.
 *
 * ```html
 * <img src="logo.png" tabindex="0" (contextmenu)="cm.show($event)" />
 * <syui-context-menu #cm [items]="items" />
 *
 * <syui-context-menu [items]="items" global />
 * ```
 */
@Component({
  selector: 'syui-context-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './contextmenu.css',
  imports: [NgTemplateOutlet, RouterLink],
  template: `
    <ng-template #menuTpl>
      <div class="syui-contextmenu" (keydown)="onKeydown($event)">
        <ng-container
          [ngTemplateOutlet]="listTpl"
          [ngTemplateOutletContext]="{ $implicit: visibleItems(items()), parentKey: null }"
        />
      </div>
    </ng-template>

    <ng-template #listTpl let-list let-parentKey="parentKey">
      <ul
        class="syui-contextmenu-list"
        role="menu"
        [class.syui-contextmenu-submenu]="parentKey !== null"
        [attr.aria-label]="parentKey === null ? ariaLabel() || null : null"
      >
        @for (item of list; track $index) {
          @let key = parentKey === null ? '' + $index : parentKey + '-' + $index;
          @if (item.separator) {
            <li class="syui-contextmenu-separator" role="separator"></li>
          } @else {
            <li
              role="none"
              class="syui-contextmenu-item"
              [class.syui-contextmenu-item-active]="isOpen(key)"
              [class.syui-contextmenu-item-disabled]="item.disabled"
              (mouseenter)="onItemEnter(item, key, parentKey)"
            >
              @if (item.routerLink != null && !item.disabled) {
                <a
                  class="syui-contextmenu-link"
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
                  class="syui-contextmenu-link"
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
                  class="syui-contextmenu-link"
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
        <i class="syui-contextmenu-icon" [class]="item.icon" aria-hidden="true"></i>
      }
      <span class="syui-contextmenu-label">{{ item.label }}</span>
      @if (hasSubmenu(item)) {
        <svg class="syui-contextmenu-chevron" viewBox="0 0 12 12" fill="none" aria-hidden="true">
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
export class ContextMenu {
  /** Menu model; items with `items` open a nested submenu. */
  readonly items = input<MenuItem[]>([]);
  /** Attaches the menu to the document's `contextmenu` event. */
  readonly global = input(false, { transform: booleanAttribute });
  readonly ariaLabel = input<string>();

  /** Emitted when the menu opens. */
  readonly onShow = output<void>();
  /** Emitted when the menu closes. */
  readonly onHide = output<void>();

  private readonly menuTemplate = viewChild.required<TemplateRef<unknown>>('menuTpl');
  private readonly overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private overlayRef?: OverlayRef;
  /** Element the menu was opened on; focus returns to it on Escape. */
  private trigger?: HTMLElement;

  private readonly menuId = uniqueId('syui-contextmenu');
  protected readonly open = signal(false);
  /** Key of the deepest item whose submenu is open, e.g. `'0-2'`. */
  protected readonly openKey = signal<string | null>(null);
  protected readonly focusedKey = signal<string | null>(null);

  constructor() {
    inject(DestroyRef).onDestroy(() => this.overlayRef?.dispose());
    effect((onCleanup) => {
      if (!this.global()) {
        return;
      }
      const listener = (event: MouseEvent) => this.show(event);
      document.addEventListener('contextmenu', listener);
      onCleanup(() => document.removeEventListener('contextmenu', listener));
    });
  }

  /**
   * Opens the menu and suppresses the native one. Anchors at the cursor for
   * pointer events; keyboard-initiated events (Shift+F10, the ContextMenu key
   * or a manually wired keydown) anchor at the target element instead.
   */
  show(event: MouseEvent | KeyboardEvent): void {
    event.preventDefault();
    this.hide();
    this.trigger = event.target instanceof HTMLElement ? event.target : undefined;
    const { x, y } = this.anchorPoint(event);
    this.overlayRef = this.createOverlay(x, y);
    this.overlayRef.attach(new TemplatePortal(this.menuTemplate(), this.viewContainerRef));
    this.open.set(true);
    this.onShow.emit();
    const first = this.navigableKeys(null)[0];
    if (first) {
      this.focusItem(first);
    }
  }

  /** Closes the menu and all open submenus. */
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
      this.hide();
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
      case 'Escape': {
        event.preventDefault();
        const trigger = this.trigger;
        this.hide();
        trigger?.focus();
        break;
      }
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

  /** Cursor position for pointer events, target rect for keyboard events. */
  private anchorPoint(event: MouseEvent | KeyboardEvent): { x: number; y: number } {
    if (event instanceof MouseEvent && (event.clientX || event.clientY)) {
      return { x: event.clientX, y: event.clientY };
    }
    const rect = this.trigger?.getBoundingClientRect();
    return rect ? { x: rect.left, y: rect.bottom } : { x: 0, y: 0 };
  }

  private createOverlay(x: number, y: number): OverlayRef {
    const overlayRef = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo({ x, y })
        .withPositions([
          { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'top' },
          { originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'top' },
          { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' },
          { originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'bottom' },
        ]),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
    });
    overlayRef.outsidePointerEvents().subscribe((event) => {
      // ignore the auxclick fired by the release of the opening right-click
      if (event.type !== 'auxclick') {
        this.hide();
      }
    });
    return overlayRef;
  }
}
