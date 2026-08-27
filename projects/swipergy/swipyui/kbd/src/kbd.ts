import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
} from '@angular/core';

/**
 * Inline keycaps for documenting keyboard shortcuts in docs, menus and
 * tooltips. `value` is split on `+` into individual keys joined by a
 * separator; projected content renders a single custom keycap instead.
 *
 * ```html
 * <syui-kbd value="Ctrl+Shift+P" />
 * <syui-kbd>⌘</syui-kbd>
 * ```
 */
@Component({
  selector: 'syui-kbd',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './kbd.css',
  host: {
    class: 'syui-kbd',
  },
  template: `
    @if (keys().length) {
      @for (key of keys(); track $index; let last = $last) {
        <kbd class="syui-kbd-key">{{ key }}</kbd>
        @if (!last) {
          <span class="syui-kbd-separator" aria-hidden="true">{{ separator() }}</span>
        }
      }
    } @else {
      <kbd class="syui-kbd-key"><ng-content /></kbd>
    }
  `,
})
export class Kbd {
  /** Shortcut to display; `+` splits it into individual keycaps. */
  readonly value = input<string>();
  /** Character rendered between keycaps. */
  readonly separator = input('+');

  protected readonly keys = computed(
    () =>
      this.value()
        ?.split('+')
        .map((key) => key.trim())
        .filter(Boolean) ?? [],
  );
}
