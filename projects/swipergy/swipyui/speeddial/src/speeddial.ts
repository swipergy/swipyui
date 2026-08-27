import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  numberAttribute,
  output,
  viewChild,
} from '@angular/core';
import { MenuItem, uniqueId } from '@swipergy/swipyui/core';

export type SpeedDialDirection = 'up' | 'down' | 'left' | 'right';

/**
 * Floating action button that fans out a set of `MenuItem` actions when
 * toggled. Actions animate in with a staggered delay along the configured
 * direction, each rendered as a circular icon button named by its label.
 * Enter, Space, and the arrow keys open the fan and focus the first action,
 * arrow keys move focus between actions, Escape and outside clicks close.
 *
 * ```html
 * <syui-speed-dial [model]="items" direction="up" ariaLabel="Quick actions" />
 * ```
 */
@Component({
  selector: 'syui-speed-dial',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './speeddial.css',
  host: {
    class: 'syui-speed-dial',
    '[class]': "'syui-speed-dial-' + direction()",
    '[class.syui-speed-dial-open]': 'visible()',
    '(document:click)': 'onDocumentClick($event)',
  },
  template: `
    @if (mask() && visible()) {
      <div class="syui-speed-dial-mask" aria-hidden="true" (click)="hide()"></div>
    }
    <button
      #trigger
      type="button"
      class="syui-speed-dial-button"
      aria-haspopup="menu"
      [attr.aria-expanded]="visible()"
      [attr.aria-controls]="menuId"
      [attr.aria-label]="ariaLabel()"
      [disabled]="disabled()"
      (click)="toggle()"
      (keydown)="onTriggerKeydown($event)"
    >
      <svg class="syui-speed-dial-icon" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path
          d="M7 1.5V12.5M1.5 7H12.5"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
        />
      </svg>
    </button>
    <ul class="syui-speed-dial-list" role="menu" [id]="menuId" [attr.aria-hidden]="!visible()">
      @for (item of items(); track $index) {
        <li class="syui-speed-dial-item" role="none">
          <button
            type="button"
            class="syui-speed-dial-action"
            role="menuitem"
            tabindex="-1"
            [style.transition-delay.ms]="itemDelay($index)"
            [attr.aria-label]="item.label || null"
            [attr.title]="item.label || null"
            [disabled]="item.disabled ?? false"
            (click)="activate(item, $event)"
            (keydown)="onItemKeydown($event, $index)"
          >
            @if (item.icon) {
              <i [class]="item.icon" aria-hidden="true"></i>
            } @else if (item.label) {
              <span class="syui-speed-dial-action-label" aria-hidden="true">
                {{ item.label.charAt(0) }}
              </span>
            }
          </button>
        </li>
      }
    </ul>
  `,
})
export class SpeedDial {
  /** Action items fanned out around the trigger. */
  readonly model = input<MenuItem[]>([]);
  /** Direction the actions fan out towards. */
  readonly direction = input<SpeedDialDirection>('up');
  /** Layout of the fan-out; only 'linear' is supported. */
  readonly type = input<'linear'>('linear');
  /** Renders a full-screen mask behind the actions while open. */
  readonly mask = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Stagger between consecutive action animations, in milliseconds. */
  readonly transitionDelay = input(40, { transform: numberAttribute });
  /** Accessible name of the trigger button. */
  readonly ariaLabel = input('Show actions');

  /** Open state; two-way bindable via [(visible)]. */
  readonly visible = model(false);

  readonly onShow = output<void>();
  readonly onHide = output<void>();

  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  protected readonly menuId = uniqueId('syui-speed-dial-menu');

  protected readonly items = computed(() =>
    this.model().filter((item) => item.visible !== false && !item.separator),
  );

  /** Staggers actions outwards on open and inwards on close. */
  protected itemDelay(index: number): number {
    const position = this.visible() ? index : this.items().length - 1 - index;
    return position * this.transitionDelay();
  }

  protected toggle(): void {
    this.visible() ? this.hide() : this.show();
  }

  protected show(): void {
    if (this.visible() || this.disabled()) {
      return;
    }
    this.visible.set(true);
    this.onShow.emit();
  }

  protected hide(): void {
    if (!this.visible()) {
      return;
    }
    this.visible.set(false);
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
    this.trigger().nativeElement.focus();
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (this.visible()) {
          this.hide();
        } else {
          this.show();
          this.focusItem(this.firstEnabled(0, 1));
        }
        break;
      case 'ArrowDown':
      case 'ArrowUp':
        event.preventDefault();
        this.show();
        this.focusItem(this.firstEnabled(0, 1));
        break;
      case 'Escape':
        this.hide();
        break;
    }
  }

  protected onItemKeydown(event: KeyboardEvent, index: number): void {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        this.focusItem(this.nextEnabled(index, 1));
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        this.focusItem(this.nextEnabled(index, -1));
        break;
      case 'Home':
        event.preventDefault();
        this.focusItem(this.firstEnabled(0, 1));
        break;
      case 'End':
        event.preventDefault();
        this.focusItem(this.firstEnabled(this.items().length - 1, -1));
        break;
      case 'Escape':
        this.hide();
        this.trigger().nativeElement.focus();
        break;
      case 'Tab':
        this.hide();
        break;
    }
  }

  protected onDocumentClick(event: Event): void {
    if (this.visible() && !this.host.nativeElement.contains(event.target as Node)) {
      this.hide();
    }
  }

  private focusItem(index: number): void {
    if (index < 0) {
      return;
    }
    const action =
      this.host.nativeElement.querySelectorAll<HTMLButtonElement>('.syui-speed-dial-action')[index];
    if (!action) {
      return;
    }
    action.focus();
    if (document.activeElement !== action) {
      // The action is still hidden until the open state has rendered.
      afterNextRender(() => action.focus(), { injector: this.injector });
    }
  }

  private nextEnabled(index: number, delta: number): number {
    const items = this.items();
    for (let step = 0; step < items.length; step++) {
      index = (index + delta + items.length) % items.length;
      if (!items[index].disabled) {
        return index;
      }
    }
    return -1;
  }

  private firstEnabled(start: number, delta: number): number {
    const items = this.items();
    for (let i = start; i >= 0 && i < items.length; i += delta) {
      if (!items[i].disabled) {
        return i;
      }
    }
    return -1;
  }
}
