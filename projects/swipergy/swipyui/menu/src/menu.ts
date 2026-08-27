import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  TemplateRef,
  ViewContainerRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
  input,
  linkedSignal,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { MenuItem, uniqueId } from '@swipergy/swipyui/core';

interface MenuEntry {
  type: 'item' | 'header' | 'separator';
  item: MenuItem;
}

/**
 * Vertical menu of `MenuItem`s following the WAI-ARIA menu pattern with a
 * roving tabindex: arrow keys move, Home/End jump, Enter/Space activate.
 * Items with `items` render as non-interactive group headers with their
 * children listed below.
 *
 * Renders inline by default; with `popup` it stays hidden and is opened
 * from the public `toggle(event)` / `show(event)` / `hide()` methods,
 * anchored to the event target and closed on outside click, Escape or
 * item click.
 *
 * ```html
 * <syui-menu [model]="items" />
 *
 * <syui-button label="Options" (onClick)="menu.toggle($event)" />
 * <syui-menu #menu [model]="items" popup />
 * ```
 */
@Component({
  selector: 'syui-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './menu.css',
  imports: [NgTemplateOutlet, RouterLink],
  host: { class: 'syui-menu' },
  template: `
    <ng-template #itemContent let-item>
      @if (item.icon) {
        <i class="syui-menu-item-icon" [class]="item.icon" aria-hidden="true"></i>
      }
      <span class="syui-menu-item-label">{{ item.label }}</span>
    </ng-template>

    <ng-template #list>
      <ul
        class="syui-menu-list"
        role="menu"
        [id]="menuId"
        [class.syui-menu-popup]="popup()"
        [attr.aria-label]="ariaLabel() || null"
        (keydown)="onListKeydown($event)"
      >
        @for (entry of entries(); track $index) {
          @switch (entry.type) {
            @case ('separator') {
              <li class="syui-menu-separator" role="separator"></li>
            }
            @case ('header') {
              <li class="syui-menu-header" role="presentation">
                @if (entry.item.icon) {
                  <i class="syui-menu-item-icon" [class]="entry.item.icon" aria-hidden="true"></i>
                }
                <span>{{ entry.item.label }}</span>
              </li>
            }
            @default {
              <li class="syui-menu-item" role="none">
                @if (entry.item.routerLink && !entry.item.disabled) {
                  <a
                    class="syui-menu-item-link"
                    role="menuitem"
                    [routerLink]="entry.item.routerLink"
                    [tabindex]="$index === activeIndex() ? 0 : -1"
                    (click)="onItemClick($event, entry.item)"
                    (focus)="activeIndex.set($index)"
                  >
                    <ng-container *ngTemplateOutlet="itemContent; context: { $implicit: entry.item }" />
                  </a>
                } @else if (entry.item.url && !entry.item.disabled) {
                  <a
                    class="syui-menu-item-link"
                    role="menuitem"
                    [attr.href]="entry.item.url"
                    [attr.target]="entry.item.target || null"
                    [tabindex]="$index === activeIndex() ? 0 : -1"
                    (click)="onItemClick($event, entry.item)"
                    (focus)="activeIndex.set($index)"
                  >
                    <ng-container *ngTemplateOutlet="itemContent; context: { $implicit: entry.item }" />
                  </a>
                } @else {
                  <a
                    class="syui-menu-item-link"
                    role="menuitem"
                    [class.syui-menu-item-disabled]="entry.item.disabled"
                    [attr.aria-disabled]="entry.item.disabled || null"
                    [tabindex]="!entry.item.disabled && $index === activeIndex() ? 0 : -1"
                    (click)="onItemClick($event, entry.item)"
                    (focus)="activeIndex.set($index)"
                  >
                    <ng-container *ngTemplateOutlet="itemContent; context: { $implicit: entry.item }" />
                  </a>
                }
              </li>
            }
          }
        }
      </ul>
    </ng-template>

    @if (!popup()) {
      <ng-container *ngTemplateOutlet="list" />
    }
  `,
})
export class Menu {
  /** Items to render; items with `items` become group headers. */
  readonly model = input<MenuItem[]>([]);
  /** Hides the menu until it is opened with `toggle()` / `show()`. */
  readonly popup = input(false, { transform: booleanAttribute });
  readonly ariaLabel = input<string>();

  readonly onShow = output<void>();
  readonly onHide = output<void>();

  protected readonly menuId = uniqueId('syui-menu');

  private readonly listTemplate = viewChild.required<TemplateRef<unknown>>('list');
  private readonly overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private overlayRef?: OverlayRef;
  private target?: HTMLElement;

  protected readonly open = signal(false);

  /** Model flattened to renderable entries, `visible === false` skipped. */
  protected readonly entries = computed<MenuEntry[]>(() => {
    const entries: MenuEntry[] = [];
    const push = (item: MenuItem, group: boolean) => {
      if (item.visible === false) {
        return;
      }
      if (item.separator) {
        entries.push({ type: 'separator', item });
      } else if (!group && item.items) {
        entries.push({ type: 'header', item });
        for (const child of item.items) {
          push(child, true);
        }
      } else {
        entries.push({ type: 'item', item });
      }
    };
    for (const item of this.model()) {
      push(item, false);
    }
    return entries;
  });

  /** Entry index holding tabindex 0; defaults to the first enabled item. */
  protected readonly activeIndex = linkedSignal(() =>
    this.entries().findIndex((entry) => entry.type === 'item' && !entry.item.disabled),
  );

  constructor() {
    inject(DestroyRef).onDestroy(() => this.overlayRef?.dispose());
  }

  /** Opens the popup menu when closed, closes it otherwise. */
  toggle(event: Event): void {
    this.open() ? this.hide() : this.show(event);
  }

  /** Opens the popup menu anchored to `event.currentTarget`. */
  show(event: Event): void {
    if (!this.popup() || this.open()) {
      return;
    }
    this.target = (event.currentTarget ?? event.target) as HTMLElement;
    this.overlayRef?.dispose();
    this.overlayRef = this.createOverlay(this.target);
    this.overlayRef.attach(new TemplatePortal(this.listTemplate(), this.viewContainerRef));
    this.open.set(true);
    this.focusActiveLink();
    this.onShow.emit();
  }

  /** Closes the popup menu. */
  hide(): void {
    if (!this.open()) {
      return;
    }
    this.overlayRef?.detach();
    this.open.set(false);
    this.onHide.emit();
  }

  protected onItemClick(event: Event, item: MenuItem): void {
    if (item.disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    item.command?.({ originalEvent: event, item });
    if (this.popup()) {
      this.hide();
    }
  }

  protected onListKeydown(event: KeyboardEvent): void {
    const list = event.currentTarget as HTMLElement;
    const links = Array.from(
      list.querySelectorAll<HTMLElement>('a.syui-menu-item-link:not(.syui-menu-item-disabled)'),
    );
    if (!links.length) {
      return;
    }
    const current = links.indexOf(event.target as HTMLElement);
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        links[(current + 1) % links.length].focus();
        break;
      case 'ArrowUp':
        event.preventDefault();
        links[(current - 1 + links.length) % links.length].focus();
        break;
      case 'Home':
        event.preventDefault();
        links[0].focus();
        break;
      case 'End':
        event.preventDefault();
        links[links.length - 1].focus();
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        (event.target as HTMLElement).click();
        break;
      case 'Escape':
        if (this.popup()) {
          event.preventDefault();
          this.hide();
          this.target?.focus();
        }
        break;
    }
  }

  private focusActiveLink(): void {
    const link = this.overlayRef?.overlayElement.querySelector<HTMLElement>(
      'a.syui-menu-item-link:not(.syui-menu-item-disabled)',
    );
    link?.focus();
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
      if (!this.target?.contains(event.target as Node)) {
        this.hide();
      }
    });
    overlayRef.keydownEvents().subscribe((event) => {
      if (event.key === 'Escape') {
        this.hide();
        this.target?.focus();
      }
    });
    return overlayRef;
  }
}
