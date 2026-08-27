import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  inject,
  input,
  linkedSignal,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { MenuItem, uniqueId } from '@swipergy/swipyui/core';

/**
 * Horizontal menubar following the WAI-ARIA menubar pattern. Root items with
 * `items` open a dropdown submenu; nested submenus flow to the right.
 * Left/Right move across root items, Down/Enter opens a submenu, Up/Down move
 * within it, Right opens a nested submenu, Left closes it, Escape closes all.
 *
 * Content can be projected before and after the items with the `start` / `end`
 * slots:
 *
 * ```html
 * <syui-menubar [model]="items">
 *   <div syui-menubar-start><img src="logo.svg" alt="" /></div>
 *   <div syui-menubar-end><syui-button label="Sign in" /></div>
 * </syui-menubar>
 * ```
 */
@Component({
  selector: 'syui-menubar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './menubar.css',
  imports: [NgTemplateOutlet, RouterLink],
  host: { class: 'syui-menubar', '(document:click)': 'onDocumentClick($event)' },
  template: `
    <ng-template #itemContent let-item>
      @if (item.icon) {
        <i class="syui-menubar-icon" [class]="item.icon" aria-hidden="true"></i>
      }
      <span class="syui-menubar-label">{{ item.label }}</span>
    </ng-template>

    <ng-template #submenuTpl let-items let-level="level" let-label="label">
      <ul
        [class.syui-menubar-root-list]="level === 0"
        [class.syui-menubar-submenu]="level > 0"
        [class.syui-menubar-submenu-nested]="level > 1"
        [attr.role]="level === 0 ? 'menubar' : 'menu'"
        [attr.aria-label]="level === 0 ? ariaLabel() || null : label || null"
      >
        @for (item of items; track $index) {
          @if (item.separator) {
            <li class="syui-menubar-separator" role="separator"></li>
          } @else {
            <li
              class="syui-menubar-item"
              role="none"
              [class.syui-menubar-item-active]="isOpen(item)"
              (mouseenter)="onItemEnter(item, level)"
            >
              @if (item.items?.length) {
                <a
                  class="syui-menubar-link"
                  role="menuitem"
                  aria-haspopup="menu"
                  [id]="linkId(level, $index)"
                  [attr.aria-expanded]="isOpen(item)"
                  [class.syui-menubar-link-disabled]="item.disabled"
                  [attr.aria-disabled]="item.disabled || null"
                  [tabindex]="tabIndexFor(item, level, $index)"
                  (click)="onItemClick($event, item, level)"
                  (keydown)="onKeydown($event, item, items, level, $index)"
                  (focus)="onLinkFocus(level, $index)"
                >
                  <ng-container *ngTemplateOutlet="itemContent; context: { $implicit: item }" />
                  <svg
                    class="syui-menubar-chevron"
                    [class.syui-menubar-chevron-right]="level > 0"
                    viewBox="0 0 12 12"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2.5 4.5L6 8L9.5 4.5"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </a>
                @if (isOpen(item)) {
                  <ng-container
                    *ngTemplateOutlet="
                      submenuTpl;
                      context: {
                        $implicit: visible(item.items),
                        level: level + 1,
                        label: item.label,
                      }
                    "
                  />
                }
              } @else if (item.routerLink && !item.disabled) {
                <a
                  class="syui-menubar-link"
                  role="menuitem"
                  [id]="linkId(level, $index)"
                  [routerLink]="item.routerLink"
                  [tabindex]="tabIndexFor(item, level, $index)"
                  (click)="onItemClick($event, item, level)"
                  (keydown)="onKeydown($event, item, items, level, $index)"
                  (focus)="onLinkFocus(level, $index)"
                >
                  <ng-container *ngTemplateOutlet="itemContent; context: { $implicit: item }" />
                </a>
              } @else if (item.url && !item.disabled) {
                <a
                  class="syui-menubar-link"
                  role="menuitem"
                  [id]="linkId(level, $index)"
                  [attr.href]="item.url"
                  [attr.target]="item.target || null"
                  [tabindex]="tabIndexFor(item, level, $index)"
                  (click)="onItemClick($event, item, level)"
                  (keydown)="onKeydown($event, item, items, level, $index)"
                  (focus)="onLinkFocus(level, $index)"
                >
                  <ng-container *ngTemplateOutlet="itemContent; context: { $implicit: item }" />
                </a>
              } @else {
                <a
                  class="syui-menubar-link"
                  role="menuitem"
                  [id]="linkId(level, $index)"
                  [class.syui-menubar-link-disabled]="item.disabled"
                  [attr.aria-disabled]="item.disabled || null"
                  [tabindex]="tabIndexFor(item, level, $index)"
                  (click)="onItemClick($event, item, level)"
                  (keydown)="onKeydown($event, item, items, level, $index)"
                  (focus)="onLinkFocus(level, $index)"
                >
                  <ng-container *ngTemplateOutlet="itemContent; context: { $implicit: item }" />
                </a>
              }
            </li>
          }
        }
      </ul>
    </ng-template>

    <div class="syui-menubar-start">
      <ng-content select="[syui-menubar-start]" />
    </div>
    <ng-container
      *ngTemplateOutlet="submenuTpl; context: { $implicit: visible(model()), level: 0 }"
    />
    <div class="syui-menubar-end">
      <ng-content select="[syui-menubar-end]" />
    </div>
  `,
})
export class Menubar {
  /** Root items; items with `items` open a dropdown submenu. */
  readonly model = input<MenuItem[]>([]);
  readonly ariaLabel = input<string>();

  private readonly id = uniqueId('syui-menubar');
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /**
   * Chain of open items: `openPath()[k]` is the open item at level `k`, so
   * the submenu rendered at level `k + 1` shows its children. Only one chain
   * is open at a time, which keeps the rendered link ids unique.
   */
  protected readonly openPath = signal<MenuItem[]>([]);

  /** Root index holding tabindex 0 (roving tabindex). */
  protected readonly rootActive = linkedSignal(() =>
    Math.max(this.findEnabled(this.visible(this.model()), -1, 1), 0),
  );

  protected visible(items: MenuItem[] | undefined): MenuItem[] {
    return (items ?? []).filter((item) => item.visible !== false);
  }

  protected isOpen(item: MenuItem): boolean {
    return this.openPath().includes(item);
  }

  protected linkId(level: number, index: number): string {
    return `${this.id}-${level}-${index}`;
  }

  protected tabIndexFor(item: MenuItem, level: number, index: number): number {
    return level === 0 && !item.disabled && index === this.rootActive() ? 0 : -1;
  }

  protected onLinkFocus(level: number, index: number): void {
    if (level === 0) {
      this.rootActive.set(index);
    }
  }

  protected onDocumentClick(event: MouseEvent): void {
    if (this.openPath().length && !this.host.nativeElement.contains(event.target as Node)) {
      this.closeAll();
    }
  }

  protected onItemEnter(item: MenuItem, level: number): void {
    if (item.disabled) {
      return;
    }
    if (level > 0) {
      item.items?.length ? this.openAt(level, item) : this.closeBelow(level);
    } else if (this.openPath().length && !this.isOpen(item)) {
      item.items?.length ? this.openAt(0, item) : this.closeAll();
    }
  }

  protected onItemClick(event: Event, item: MenuItem, level: number): void {
    if (item.disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (item.items?.length) {
      event.preventDefault();
      this.isOpen(item) ? this.closeBelow(level) : this.openAt(level, item);
      return;
    }
    item.command?.({ originalEvent: event, item });
    this.closeAll();
  }

  protected onKeydown(
    event: KeyboardEvent,
    item: MenuItem,
    items: MenuItem[],
    level: number,
    index: number,
  ): void {
    const key = event.key;
    if (key === 'Tab') {
      this.closeAll();
      return;
    }
    const activate = () => {
      event.preventDefault();
      (event.target as HTMLElement).click();
    };
    const openSubmenu = () => {
      this.openAt(level, item);
      this.focusFirstChild(item, level + 1);
    };

    if (level === 0) {
      switch (key) {
        case 'ArrowRight':
          event.preventDefault();
          this.moveRoot(items, index, 1);
          break;
        case 'ArrowLeft':
          event.preventDefault();
          this.moveRoot(items, index, -1);
          break;
        case 'ArrowDown':
        case 'Enter':
        case ' ':
          if (item.items?.length) {
            event.preventDefault();
            openSubmenu();
          } else if (key !== 'ArrowDown') {
            activate();
          }
          break;
        case 'Home':
          event.preventDefault();
          this.focusLink(0, this.findEnabled(items, -1, 1));
          break;
        case 'End':
          event.preventDefault();
          this.focusLink(0, this.findEnabled(items, items.length, -1));
          break;
        case 'Escape':
          this.closeAll();
          break;
      }
      return;
    }

    switch (key) {
      case 'ArrowDown':
        event.preventDefault();
        this.focusLink(level, this.findEnabled(items, index, 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.focusLink(level, this.findEnabled(items, index, -1));
        break;
      case 'Home':
        event.preventDefault();
        this.focusLink(level, this.findEnabled(items, -1, 1));
        break;
      case 'End':
        event.preventDefault();
        this.focusLink(level, this.findEnabled(items, items.length, -1));
        break;
      case 'ArrowRight':
        event.preventDefault();
        item.items?.length ? openSubmenu() : this.moveRootFromSubmenu(1);
        break;
      case 'ArrowLeft': {
        event.preventDefault();
        if (level > 1) {
          const parent = this.openPath()[level - 1];
          const siblings = this.visible(this.openPath()[level - 2].items);
          this.closeBelow(level - 1);
          this.focusLink(level - 1, siblings.indexOf(parent));
        } else {
          this.moveRootFromSubmenu(-1);
        }
        break;
      }
      case 'Enter':
      case ' ':
        activate();
        break;
      case 'Escape': {
        event.preventDefault();
        const rootIndex = this.visible(this.model()).indexOf(this.openPath()[0]);
        this.closeAll();
        this.focusLink(0, rootIndex);
        break;
      }
    }
  }

  private openAt(level: number, item: MenuItem): void {
    this.openPath.update((path) => [...path.slice(0, level), item]);
  }

  private closeBelow(level: number): void {
    this.openPath.update((path) => path.slice(0, level));
  }

  private closeAll(): void {
    this.openPath.set([]);
  }

  /** Move focus across root items; when the menubar is open, follow along. */
  private moveRoot(items: MenuItem[], index: number, delta: number): void {
    const next = this.findEnabled(items, index, delta);
    if (next < 0) {
      return;
    }
    if (this.openPath().length) {
      const target = items[next];
      target.items?.length ? this.openAt(0, target) : this.closeAll();
    }
    this.focusLink(0, next);
  }

  /** Left/Right at a submenu leaf wraps to the neighbouring root item. */
  private moveRootFromSubmenu(delta: number): void {
    const roots = this.visible(this.model());
    const next = this.findEnabled(roots, roots.indexOf(this.openPath()[0]), delta);
    if (next < 0) {
      return;
    }
    const target = roots[next];
    if (target.items?.length) {
      this.openAt(0, target);
      this.focusFirstChild(target, 1);
    } else {
      this.closeAll();
    }
    this.focusLink(0, next);
  }

  private focusFirstChild(item: MenuItem, level: number): void {
    const children = this.visible(item.items);
    const index = children.findIndex((child) => !child.separator && !child.disabled);
    if (index >= 0) {
      // the submenu renders on the next change-detection pass
      setTimeout(() => this.focusLink(level, index));
    }
  }

  private focusLink(level: number, index: number): void {
    if (index < 0) {
      return;
    }
    document.getElementById(this.linkId(level, index))?.focus();
    if (level === 0) {
      this.rootActive.set(index);
    }
  }

  private findEnabled(items: MenuItem[], index: number, delta: number): number {
    for (let step = 0; step < items.length; step++) {
      index = (index + delta + items.length) % items.length;
      const item = items[index];
      if (!item.separator && !item.disabled) {
        return index;
      }
    }
    return -1;
  }
}
