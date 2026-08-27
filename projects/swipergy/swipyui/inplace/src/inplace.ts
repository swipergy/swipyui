import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  inject,
  input,
  model,
  output,
} from '@angular/core';

/**
 * Swaps inline display content for edit content on demand: the display slot
 * renders inside a button (activated by click or Enter/Space) until `active`
 * becomes true, then the content slot shows. Escape — or the close button
 * rendered with `closable` — reverts to display mode; focus follows the
 * switch in both directions. Slots are attribute-selected projections.
 *
 * ```html
 * <syui-inplace closable>
 *   <span syui-inplace-display>Click to edit</span>
 *   <span syui-inplace-content><input syuiInputText /></span>
 * </syui-inplace>
 * ```
 */
@Component({
  selector: 'syui-inplace',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './inplace.css',
  host: { class: 'syui-inplace' },
  template: `
    @if (!active()) {
      <button
        type="button"
        class="syui-inplace-display"
        [disabled]="disabled()"
        (click)="activate()"
      >
        <ng-content select="[syui-inplace-display]" />
      </button>
    } @else {
      <div class="syui-inplace-content" (keydown.escape)="deactivate()">
        <ng-content select="[syui-inplace-content]" />
        @if (closable()) {
          <button
            type="button"
            class="syui-inplace-close"
            aria-label="Close"
            (click)="deactivate()"
          >
            <svg viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path
                d="M3 3L11 11M11 3L3 11"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            </svg>
          </button>
        }
      </div>
    }
  `,
})
export class Inplace {
  /** Whether the content slot is shown; supports two-way binding. */
  readonly active = model(false);
  /** Renders a close button next to the content that deactivates it. */
  readonly closable = input(false, { transform: booleanAttribute });
  /** Prevents activation. */
  readonly disabled = input(false, { transform: booleanAttribute });

  readonly onActivate = output<void>();
  readonly onDeactivate = output<void>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected activate(): void {
    if (this.disabled() || this.active()) {
      return;
    }
    this.active.set(true);
    this.onActivate.emit();
    // move focus into the revealed content once it has rendered
    setTimeout(() => {
      this.host.nativeElement
        .querySelector<HTMLElement>(
          '.syui-inplace-content :is(input, select, textarea, button, [href], [tabindex])',
        )
        ?.focus();
    });
  }

  protected deactivate(): void {
    if (!this.active()) {
      return;
    }
    this.active.set(false);
    this.onDeactivate.emit();
    // return focus to the display button that reappears
    setTimeout(() => {
      this.host.nativeElement.querySelector<HTMLElement>('.syui-inplace-display')?.focus();
    });
  }
}
