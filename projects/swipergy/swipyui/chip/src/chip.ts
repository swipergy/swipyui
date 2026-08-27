import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  output,
  signal,
} from '@angular/core';

/**
 * Compact pill representing an entity — a filter value, a person, a tag
 * selection. Optionally removable; removing hides the chip and emits
 * `onRemove`. Projected content overrides the `label`.
 *
 * ```html
 * <syui-chip label="Angular" removable (onRemove)="removed()" />
 * <syui-chip image="frank.png" label="Frank Kuhn" />
 * ```
 */
@Component({
  selector: 'syui-chip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './chip.css',
  host: {
    class: 'syui-chip',
    '[class.syui-chip-hidden]': '!visible()',
  },
  template: `
    @if (image()) {
      <!-- The adjacent label is the chip's text; a non-empty alt would be read twice. -->
      <img class="syui-chip-image" [src]="image()" alt="" />
    } @else if (icon()) {
      <i class="syui-chip-icon" [class]="icon()" aria-hidden="true"></i>
    }
    <ng-content>
      <span class="syui-chip-label">{{ label() }}</span>
    </ng-content>
    @if (removable()) {
      <button
        type="button"
        class="syui-chip-remove"
        [attr.aria-label]="removeLabel()"
        (click)="remove($event)"
      >
        <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path
            d="M3 3L9 9M9 3L3 9"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
        </svg>
      </button>
    }
  `,
})
export class Chip {
  readonly label = input<string>();
  /** CSS class of a user-supplied icon font glyph, shown before the label. */
  readonly icon = input<string>();
  /** Image URL shown before the label; takes precedence over `icon`. */
  readonly image = input<string>();
  /** Shows an X button that hides the chip and emits `onRemove`. */
  readonly removable = input(false, { transform: booleanAttribute });

  /** Emitted when the remove button is clicked. */
  readonly onRemove = output<MouseEvent>();

  protected readonly visible = signal(true);

  /** Accessible name of the remove button, e.g. "Remove Angular". */
  protected readonly removeLabel = computed(() => {
    const label = this.label();
    return label ? `Remove ${label}` : 'Remove';
  });

  protected remove(event: MouseEvent): void {
    this.visible.set(false);
    this.onRemove.emit(event);
  }
}
