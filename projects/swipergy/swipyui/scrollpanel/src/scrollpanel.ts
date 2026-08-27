import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from '@angular/core';

/**
 * Scrollable container with slim, theme-aware scrollbars. Scrolling stays
 * fully native — the bars are styled via `::-webkit-scrollbar` and the
 * standard `scrollbar-width` / `scrollbar-color` properties — so wheel,
 * touch and keyboard behavior are untouched. The panel is a focusable,
 * labelled region so keyboard users can reach and scroll it. Give it a
 * height (or max-height) via style or class:
 *
 * ```html
 * <syui-scroll-panel ariaLabel="Release notes" style="height: 12rem">
 *   …long content…
 * </syui-scroll-panel>
 * ```
 */
@Component({
  selector: 'syui-scroll-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './scrollpanel.css',
  host: {
    class: 'syui-scroll-panel',
    // focusable so keyboard users can scroll; a region landmark only when named
    tabindex: '0',
    '[attr.role]': "ariaLabel() ? 'region' : null",
    '[attr.aria-label]': 'ariaLabel() || null',
  },
  template: `<ng-content />`,
})
export class ScrollPanel {
  /** Accessible name announced for the scrollable region. */
  readonly ariaLabel = input<string>();
}
