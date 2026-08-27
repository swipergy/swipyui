import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  ElementRef,
  TemplateRef,
  ViewEncapsulation,
  afterNextRender,
  computed,
  contentChild,
  inject,
  input,
  numberAttribute,
  output,
  signal,
} from '@angular/core';

/**
 * Marks the `ng-template` rendered per item in `<syui-virtual-scroller>`.
 * Context: `$implicit` item, `index`.
 */
@Directive({ selector: 'ng-template[syuiVirtualScrollerItem]' })
export class VirtualScrollerItem {
  readonly template = inject(TemplateRef);
}

/** Range of item indexes currently rendered, emitted by `onScrollIndexChange`. */
export interface VirtualScrollerRange {
  /** Index of the first rendered item. */
  first: number;
  /** Index after the last rendered item. */
  last: number;
}

/**
 * Renders only the visible slice of a large list, so tens of thousands of
 * items scroll smoothly. Items must have a fixed size along the scroll axis
 * (`itemSize`); scrolling stays fully native. Give the scroller a height
 * (or a width when `orientation="horizontal"`) via style or class:
 *
 * ```html
 * <syui-virtual-scroller [items]="rows" [itemSize]="40" style="height: 20rem" ariaLabel="Rows">
 *   <ng-template syuiVirtualScrollerItem let-row let-i="index">{{ i }} — {{ row }}</ng-template>
 * </syui-virtual-scroller>
 * ```
 */
@Component({
  selector: 'syui-virtual-scroller',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './virtualscroller.css',
  imports: [NgTemplateOutlet],
  host: {
    class: 'syui-virtual-scroller',
    '[class.syui-virtual-scroller-horizontal]': 'orientation() === "horizontal"',
    // focusable so keyboard users can scroll; a region landmark only when named
    tabindex: '0',
    '[attr.role]': "ariaLabel() ? 'region' : null",
    '[attr.aria-label]': 'ariaLabel() || null',
    '(scroll)': 'onScroll()',
  },
  template: `
    <div
      class="syui-virtual-scroller-spacer"
      aria-hidden="true"
      [style.height.px]="orientation() === 'vertical' ? totalSize() : null"
      [style.width.px]="orientation() === 'horizontal' ? totalSize() : null"
    ></div>
    <div
      class="syui-virtual-scroller-content"
      role="list"
      [style.transform]="contentTransform()"
    >
      @for (item of visibleItems(); track first() + $index) {
        <div
          class="syui-virtual-scroller-item"
          role="listitem"
          [style.height.px]="orientation() === 'vertical' ? itemSize() : null"
          [style.width.px]="orientation() === 'horizontal' ? itemSize() : null"
        >
          @if (itemTemplate(); as itemTemplate) {
            <ng-container
              [ngTemplateOutlet]="itemTemplate.template"
              [ngTemplateOutletContext]="{ $implicit: item, index: first() + $index }"
            />
          }
        </div>
      }
    </div>
  `,
})
export class VirtualScroller<T = any> {
  /** Items backing the list; only the visible slice is rendered. */
  readonly items = input<T[]>([]);
  /** Fixed size of one item along the scroll axis, in pixels. */
  readonly itemSize = input.required({ transform: numberAttribute });
  /** Scroll axis; the cross axis fills the scroller. */
  readonly orientation = input<'vertical' | 'horizontal'>('vertical');
  /** Extra items rendered on each side of the viewport to reduce blanking. */
  readonly overscan = input(3, { transform: numberAttribute });
  /** Accessible name announced for the scrollable region. */
  readonly ariaLabel = input<string>();

  /** Emits the rendered index range whenever the user scrolls. */
  readonly onScrollIndexChange = output<VirtualScrollerRange>();

  protected readonly itemTemplate = contentChild(VirtualScrollerItem);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly scrollPos = signal(0);
  private readonly viewportSize = signal(0);

  /** Full length of the list along the scroll axis, held open by the spacer. */
  protected readonly totalSize = computed(() => this.items().length * this.itemSize());

  /** Index of the first rendered item, including the overscan. */
  protected readonly first = computed(() => {
    const size = Math.max(1, this.itemSize());
    return Math.max(0, Math.floor(this.scrollPos() / size) - this.overscan());
  });

  /** Index after the last rendered item, including the overscan. */
  protected readonly last = computed(() => {
    const size = Math.max(1, this.itemSize());
    const visible = Math.ceil(this.viewportSize() / size) + 1 + 2 * this.overscan();
    return Math.min(this.items().length, this.first() + visible);
  });

  protected readonly visibleItems = computed(() => this.items().slice(this.first(), this.last()));

  /** Shifts the rendered slice to where it would sit in the full list. */
  protected readonly contentTransform = computed(() => {
    const offset = this.first() * this.itemSize();
    return this.orientation() === 'vertical'
      ? `translateY(${offset}px)`
      : `translateX(${offset}px)`;
  });

  constructor() {
    const destroyRef = inject(DestroyRef);
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(() => this.measureViewport());
      afterNextRender(() => observer.observe(this.host.nativeElement));
      destroyRef.onDestroy(() => observer.disconnect());
    }
    afterNextRender(() => this.measureViewport());
  }

  /** Scrolls so the item at `index` sits at the start of the viewport. */
  scrollToIndex(index: number, behavior: ScrollBehavior = 'auto'): void {
    const offset = Math.max(0, index) * this.itemSize();
    this.host.nativeElement.scrollTo(
      this.orientation() === 'vertical'
        ? { top: offset, behavior }
        : { left: offset, behavior },
    );
  }

  protected onScroll(): void {
    const element = this.host.nativeElement;
    this.measureViewport();
    this.scrollPos.set(
      this.orientation() === 'vertical' ? element.scrollTop : element.scrollLeft,
    );
    this.onScrollIndexChange.emit({ first: this.first(), last: this.last() });
  }

  private measureViewport(): void {
    const element = this.host.nativeElement;
    this.viewportSize.set(
      this.orientation() === 'vertical' ? element.clientHeight : element.clientWidth,
    );
  }
}
