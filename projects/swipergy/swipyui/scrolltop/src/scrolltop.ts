import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ViewEncapsulation,
  inject,
  input,
  numberAttribute,
  signal,
} from '@angular/core';

/**
 * Floating circular button that fades in after the window is scrolled past
 * `threshold` pixels and smooth-scrolls back to the top when clicked
 * (instantly when the user prefers reduced motion).
 * Listens to window scroll only (a passive listener, removed on destroy);
 * scrollable child containers are not supported.
 *
 * ```html
 * <syui-scroll-top [threshold]="200" />
 * ```
 */
@Component({
  selector: 'syui-scroll-top',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './scrolltop.css',
  template: `
    <button
      type="button"
      class="syui-scrolltop"
      [class.syui-scrolltop-visible]="visible()"
      [attr.aria-label]="ariaLabel()"
      (click)="scrollToTop()"
    >
      <svg viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path
          d="M2.5 8.5L7 4L11.5 8.5"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
  `,
})
export class ScrollTop {
  /** Window scroll offset in pixels after which the button appears. */
  readonly threshold = input(400, { transform: numberAttribute });
  readonly ariaLabel = input('Scroll to top');

  protected readonly visible = signal(false);

  constructor() {
    const onScroll = () => this.visible.set(window.scrollY > this.threshold());
    window.addEventListener('scroll', onScroll, { passive: true });
    inject(DestroyRef).onDestroy(() => window.removeEventListener('scroll', onScroll));
    onScroll();
  }

  protected scrollToTop(): void {
    const reduceMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  }
}
