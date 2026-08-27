import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from '@angular/core';

/**
 * Shimmering placeholder block shown while real content loads. Compose
 * several skeletons to sketch the layout of the loading content:
 *
 * ```html
 * <syui-skeleton shape="circle" width="3rem" height="3rem" />
 * <syui-skeleton width="12rem" height="1rem" />
 * <syui-skeleton height="8rem" borderRadius="12px" />
 * ```
 *
 * Skeletons are purely decorative and hidden from assistive technology;
 * mark the surrounding region with `aria-busy="true"` (and announce
 * completion, e.g. via a live region) so the loading state is conveyed
 * to screen reader users as well.
 */
@Component({
  selector: 'syui-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './skeleton.css',
  host: {
    class: 'syui-skeleton',
    'aria-hidden': 'true',
    '[class.syui-skeleton-circle]': "shape() === 'circle'",
    '[style.width]': 'width()',
    '[style.height]': 'height()',
    '[style.border-radius]': 'borderRadius() || null',
  },
  template: '',
})
export class Skeleton {
  /** `circle` renders a fully rounded placeholder (e.g. for avatars). */
  readonly shape = input<'rectangle' | 'circle'>('rectangle');
  /** CSS width of the placeholder. */
  readonly width = input('100%');
  /** CSS height of the placeholder. */
  readonly height = input('1rem');
  /** Overrides the default border radius (ignored for circles). */
  readonly borderRadius = input<string>();
}
