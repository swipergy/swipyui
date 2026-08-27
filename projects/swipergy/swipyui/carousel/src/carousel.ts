import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChild,
  effect,
  input,
  model,
  numberAttribute,
  output,
  signal,
} from '@angular/core';

/**
 * Content slider that shows `numVisible` items at a time and scrolls
 * `numScroll` items per step on a CSS-transformed flex track. Supports
 * circular wrapping and autoplay (off by default; paused while hovered or
 * focused, and stoppable through a visible play/pause control).
 * Items are rendered through a projected `ng-template`
 * (context: `$implicit` item, `index`).
 *
 * ```html
 * <syui-carousel [value]="products" [numVisible]="3" [numScroll]="1" circular>
 *   <ng-template let-product let-i="index">{{ product.name }}</ng-template>
 * </syui-carousel>
 * ```
 */
@Component({
  selector: 'syui-carousel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './carousel.css',
  imports: [NgTemplateOutlet],
  host: {
    class: 'syui-carousel',
    role: 'region',
    'aria-roledescription': 'carousel',
    '[attr.aria-label]': 'ariaLabel() || null',
    '(mouseenter)': 'paused.set(true)',
    '(mouseleave)': 'paused.set(false)',
    '(focusin)': 'paused.set(true)',
    '(focusout)': 'paused.set(false)',
  },
  template: `
    <div class="syui-carousel-content">
      <button
        type="button"
        class="syui-carousel-nav syui-carousel-prev"
        aria-label="Previous page"
        [disabled]="!circular() && currentPage() === 0"
        (click)="prev()"
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
      <div class="syui-carousel-viewport">
        <div class="syui-carousel-track" [style.transform]="trackTransform()">
          @for (item of value(); track $index) {
            <div
              class="syui-carousel-item"
              role="group"
              aria-roledescription="slide"
              [attr.aria-label]="$index + 1 + ' of ' + value().length"
              [attr.aria-hidden]="isItemHidden($index) || null"
              [attr.inert]="isItemHidden($index) ? '' : null"
              [style.flex]="'0 0 ' + itemWidth() + '%'"
            >
              @if (itemTemplate(); as template) {
                <ng-container
                  [ngTemplateOutlet]="template"
                  [ngTemplateOutletContext]="{ $implicit: item, index: $index }"
                />
              }
            </div>
          }
        </div>
      </div>
      <button
        type="button"
        class="syui-carousel-nav syui-carousel-next"
        aria-label="Next page"
        [disabled]="!circular() && currentPage() >= pageCount() - 1"
        (click)="next()"
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
    </div>
    <!-- Announces page changes; silent while slides advance on their own. -->
    <span class="syui-carousel-status" aria-live="polite">
      @if (!autoplayRunning()) {
        Page {{ currentPage() + 1 }} of {{ pageCount() }}
      }
    </span>
    <div class="syui-carousel-indicators">
      @if (autoplayInterval() > 0) {
        <button
          type="button"
          class="syui-carousel-play-toggle"
          [attr.aria-label]="
            userPaused() ? 'Start automatic slide show' : 'Stop automatic slide show'
          "
          (click)="userPaused.set(!userPaused())"
        >
          @if (userPaused()) {
            <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M3.5 2.5L9.5 6L3.5 9.5V2.5Z" fill="currentColor" />
            </svg>
          } @else {
            <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M3.5 2.5V9.5M8.5 2.5V9.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
          }
        </button>
      }
      @for (dot of pages(); track dot) {
        <button
          type="button"
          class="syui-carousel-dot"
          [class.syui-carousel-dot-active]="dot === currentPage()"
          [attr.aria-label]="'Page ' + (dot + 1) + ' of ' + pageCount()"
          [attr.aria-current]="dot === currentPage() ? 'true' : null"
          (click)="goToPage(dot)"
        ></button>
      }
    </div>
  `,
})
export class Carousel<T = any> {
  /** Items to display. */
  readonly value = input<T[]>([]);
  /** Number of items visible at a time. */
  readonly numVisible = input(1, { transform: numberAttribute });
  /** Number of items scrolled per prev/next step. */
  readonly numScroll = input(1, { transform: numberAttribute });
  /** Wraps from the last page back to the first (and vice versa). */
  readonly circular = input(false, { transform: booleanAttribute });
  /**
   * Advances to the next page every n milliseconds; `0` disables autoplay.
   * Autoplay wraps around and pauses while the carousel is hovered or focused.
   */
  readonly autoplayInterval = input(0, { transform: numberAttribute });
  /** Accessible name of the carousel region. */
  readonly ariaLabel = input('Carousel');

  /** Index of the active page; supports two-way binding. */
  readonly page = model(0);

  readonly onPage = output<number>();

  /** Item template; context: `$implicit` item, `index`. */
  protected readonly itemTemplate = contentChild(TemplateRef);

  /** True while autoplay is suspended (hover/focus). */
  protected readonly paused = signal(false);
  /** True while autoplay is stopped through the play/pause control. */
  protected readonly userPaused = signal(false);

  protected readonly pageCount = computed(() => {
    const total = this.value().length;
    const visible = Math.max(1, this.numVisible());
    const scroll = Math.max(1, this.numScroll());
    if (total <= visible) {
      return 1;
    }
    return Math.ceil((total - visible) / scroll) + 1;
  });

  protected readonly currentPage = computed(() =>
    Math.min(Math.max(0, this.page()), this.pageCount() - 1),
  );

  protected readonly pages = computed(() =>
    Array.from({ length: this.pageCount() }, (_, i) => i),
  );

  protected readonly itemWidth = computed(() => 100 / Math.max(1, this.numVisible()));

  /** True while slides advance on their own; the track is aria-live otherwise. */
  protected readonly autoplayRunning = computed(
    () =>
      this.autoplayInterval() > 0 && !this.paused() && !this.userPaused() && this.pageCount() > 1,
  );

  /** Index of the first item currently in the viewport. */
  private readonly firstVisible = computed(() => {
    const total = this.value().length;
    const visible = Math.max(1, this.numVisible());
    const maxFirst = Math.max(0, total - visible);
    return Math.min(this.currentPage() * Math.max(1, this.numScroll()), maxFirst);
  });

  protected readonly trackTransform = computed(
    () => `translateX(-${this.firstVisible() * this.itemWidth()}%)`,
  );

  /** Items outside the viewport are hidden from AT and removed from the tab order. */
  protected isItemHidden(index: number): boolean {
    const first = this.firstVisible();
    return index < first || index >= first + Math.max(1, this.numVisible());
  }

  constructor() {
    effect((onCleanup) => {
      if (this.autoplayRunning()) {
        const id = setInterval(() => this.next(true), this.autoplayInterval());
        onCleanup(() => clearInterval(id));
      }
    });
  }

  protected prev(): void {
    const current = this.currentPage();
    if (current === 0) {
      if (this.circular()) {
        this.goToPage(this.pageCount() - 1);
      }
      return;
    }
    this.goToPage(current - 1);
  }

  protected next(wrap = this.circular()): void {
    const current = this.currentPage();
    if (current >= this.pageCount() - 1) {
      if (wrap) {
        this.goToPage(0);
      }
      return;
    }
    this.goToPage(current + 1);
  }

  protected goToPage(page: number): void {
    if (page === this.currentPage()) {
      return;
    }
    this.page.set(page);
    this.onPage.emit(page);
  }
}
