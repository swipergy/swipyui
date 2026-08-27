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
  output,
  signal,
  viewChild,
} from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { MenuItem, uniqueId } from '@swipergy/swipyui/core';
import { Button, ButtonSeverity } from '@swipergy/swipyui/button';

/**
 * Split button: a primary action button glued to a chevron button that opens
 * a menu of secondary `MenuItem` actions. The menu follows the WAI-ARIA menu
 * button pattern: focus stays on the chevron trigger, the active item is
 * tracked with aria-activedescendant, arrow keys navigate, Enter activates,
 * Escape closes.
 *
 * ```html
 * <syui-split-button label="Save" [model]="items" (onClick)="save()" />
 * <syui-split-button label="Delete" severity="danger" outlined [model]="items" />
 * ```
 */
@Component({
  selector: 'syui-split-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './splitbutton.css',
  imports: [Button],
  host: { class: 'syui-split-button' },
  template: `
    <syui-button
      [label]="label()"
      [severity]="severity()"
      [variant]="outlined() ? 'outlined' : 'filled'"
      [disabled]="disabled()"
      [ariaLabel]="ariaLabel()"
      (onClick)="onClick.emit($event)"
    />
    <button
      #menuTrigger
      type="button"
      class="syui-button syui-split-button-menu-button"
      aria-haspopup="menu"
      [class]="menuButtonClass()"
      [attr.aria-expanded]="open()"
      [attr.aria-controls]="open() ? menuId : null"
      [attr.aria-activedescendant]="open() && activeIndex() >= 0 ? itemId(activeIndex()) : null"
      [attr.aria-label]="dropdownAriaLabel()"
      [disabled]="disabled()"
      (click)="toggle()"
      (keydown)="onKeydown($event)"
    >
      <svg class="syui-split-button-chevron" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path
          d="M2.5 4.5L6 8L9.5 4.5"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>

    <ng-template #panel>
      <ul class="syui-split-button-menu" role="menu" [id]="menuId" [attr.aria-label]="dropdownAriaLabel()">
        @for (item of visibleItems(); track $index) {
          @if (item.separator) {
            <li class="syui-split-button-separator" role="separator"></li>
          } @else {
            <li
              class="syui-split-button-item"
              role="menuitem"
              [id]="itemId($index)"
              [class.syui-split-button-item-active]="$index === activeIndex()"
              [class.syui-split-button-item-disabled]="item.disabled"
              [attr.aria-disabled]="item.disabled || null"
              (click)="activate(item, $event)"
              (mouseenter)="activeIndex.set($index)"
            >
              @if (item.icon) {
                <i class="syui-split-button-item-icon" [class]="item.icon" aria-hidden="true"></i>
              }
              <span class="syui-split-button-item-label">{{ item.label }}</span>
            </li>
          }
        }
      </ul>
    </ng-template>
  `,
})
export class SplitButton {
  /** Text of the primary action button. */
  readonly label = input<string>();
  /** Menu items shown in the dropdown. */
  readonly model = input<MenuItem[]>([]);
  readonly severity = input<ButtonSeverity>('primary');
  /** Renders both halves in the outlined button variant. */
  readonly outlined = input(false, { transform: booleanAttribute });
  /** Disables both the primary button and the menu trigger. */
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly ariaLabel = input<string>();
  /** Accessible name of the chevron trigger and its menu. */
  readonly dropdownAriaLabel = input('More actions');

  /** Emitted when the primary action button is clicked. */
  readonly onClick = output<MouseEvent>();
  readonly onShow = output<void>();
  readonly onHide = output<void>();

  private readonly menuTrigger = viewChild.required<ElementRef<HTMLButtonElement>>('menuTrigger');
  private readonly panelTemplate = viewChild.required<TemplateRef<unknown>>('panel');

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private overlayRef?: OverlayRef;

  protected readonly menuId = uniqueId('syui-split-button-menu');
  protected readonly open = signal(false);
  protected readonly activeIndex = signal(-1);

  protected readonly visibleItems = computed(() =>
    this.model().filter((item) => item.visible !== false),
  );

  protected readonly menuButtonClass = computed(() =>
    [
      `syui-button-${this.severity()}`,
      this.outlined() ? 'syui-button-outlined' : 'syui-button-filled',
    ].join(' '),
  );

  constructor() {
    inject(DestroyRef).onDestroy(() => this.overlayRef?.dispose());
  }

  protected itemId(index: number): string {
    return `${this.menuId}-item-${index}`;
  }

  protected toggle(): void {
    this.open() ? this.hide() : this.show();
  }

  protected show(): void {
    if (this.open()) {
      return;
    }
    this.overlayRef ??= this.createOverlay();
    this.overlayRef.attach(new TemplatePortal(this.panelTemplate(), this.viewContainerRef));
    this.open.set(true);
    this.activeIndex.set(this.firstNavigable(0, 1));
    this.onShow.emit();
  }

  protected hide(): void {
    if (!this.open()) {
      return;
    }
    this.overlayRef?.detach();
    this.open.set(false);
    this.onHide.emit();
  }

  protected activate(item: MenuItem, event: Event): void {
    if (item.disabled) {
      return;
    }
    item.command?.({ originalEvent: event, item });
    if (item.url) {
      window.open(item.url, item.target ?? '_self');
    }
    this.hide();
    this.menuTrigger().nativeElement.focus();
  }

  protected onKeydown(event: KeyboardEvent): void {
    const { key } = event;
    if (!this.open()) {
      if (key === 'ArrowDown' || key === 'ArrowUp' || key === 'Enter' || key === ' ') {
        event.preventDefault();
        this.show();
      }
      return;
    }
    switch (key) {
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
        this.activeIndex.set(this.firstNavigable(0, 1));
        break;
      case 'End':
        event.preventDefault();
        this.activeIndex.set(this.firstNavigable(this.visibleItems().length - 1, -1));
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (this.activeIndex() >= 0) {
          this.activate(this.visibleItems()[this.activeIndex()], event);
        }
        break;
      case 'Escape':
      case 'Tab':
        this.hide();
        break;
    }
  }

  private isNavigable(item: MenuItem): boolean {
    return !item.disabled && !item.separator;
  }

  private moveActive(delta: number): void {
    const items = this.visibleItems();
    let index = this.activeIndex();
    for (let step = 0; step < items.length; step++) {
      index = (index + delta + items.length) % items.length;
      if (this.isNavigable(items[index])) {
        this.activeIndex.set(index);
        return;
      }
    }
  }

  private firstNavigable(start: number, delta: number): number {
    const items = this.visibleItems();
    for (let i = start; i >= 0 && i < items.length; i += delta) {
      if (this.isNavigable(items[i])) {
        return i;
      }
    }
    return -1;
  }

  private createOverlay(): OverlayRef {
    const host = this.host.nativeElement;
    const overlayRef = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(host)
        .withPositions([
          { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
          { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
        ]),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      minWidth: host.offsetWidth,
    });
    overlayRef.outsidePointerEvents().subscribe((event) => {
      if (!host.contains(event.target as Node)) {
        this.hide();
      }
    });
    return overlayRef;
  }
}
