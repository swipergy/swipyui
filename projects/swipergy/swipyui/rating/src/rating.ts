import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  forwardRef,
  input,
  numberAttribute,
  signal,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { BaseValueControl, uniqueId } from '@swipergy/swipyui/core';

/**
 * Star rating input. Each star is a visually hidden native radio input, so
 * the group follows the WAI-ARIA radio group pattern out of the box: Tab
 * focuses the group, arrow keys move the selection. Clicking the currently
 * selected star clears the value; hovering previews the fill.
 *
 * ```html
 * <syui-rating [formField]="f.score" />
 * <syui-rating [stars]="10" [(value)]="score" />
 * <syui-rating [value]="4" readonly />
 * ```
 */
@Component({
  selector: 'syui-rating',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './rating.css',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => Rating), multi: true }],
  host: {
    class: 'syui-rating',
    role: 'radiogroup',
    '[attr.aria-label]': "ariaLabel() || 'Rating'",
    '[attr.aria-labelledby]': 'ariaLabelledby() || null',
    '[attr.aria-describedby]': 'ariaDescribedby() || null',
    '[attr.aria-invalid]': 'ariaInvalid()',
    '[attr.aria-readonly]': 'readonly() || null',
    '[class.syui-rating-readonly]': 'readonly()',
    '[class.syui-rating-disabled]': 'isDisabled()',
    '(mouseleave)': 'hovered.set(null)',
    '(keydown)': 'onKeydown($event)',
  },
  template: `
    @for (star of starList(); track star) {
      <label
        class="syui-rating-option"
        [class.syui-rating-option-filled]="star <= displayValue()"
        (mouseenter)="onHover(star)"
      >
        <input
          #radio
          type="radio"
          class="syui-rating-input"
          [name]="groupName"
          [value]="star"
          [checked]="value() === star"
          [disabled]="isDisabled()"
          [attr.aria-label]="star + ' of ' + starList().length + ' stars'"
          (change)="onSelect(star, radio)"
          (click)="onStarClick(star, radio)"
          (blur)="onTouched()"
        />
        <svg class="syui-rating-star" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 3.1l2.51 5.09 5.62.82-4.07 3.96.96 5.6L12 15.93l-5.02 2.64.96-5.6-4.07-3.96 5.62-.82L12 3.1z"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linejoin="round"
          />
        </svg>
      </label>
    }
  `,
})
export class Rating extends BaseValueControl<number> {
  /** Number of stars to render. */
  readonly stars = input(5, { transform: numberAttribute });
  /** Shows the value but blocks pointer and keyboard editing. */
  readonly readonly = input(false, { transform: booleanAttribute });
  protected readonly groupName = uniqueId('syui-rating');
  protected readonly hovered = signal<number | null>(null);

  protected readonly starList = computed(() =>
    Array.from({ length: Math.max(0, this.stars()) }, (_, i) => i + 1),
  );

  /** Fill up to the hover preview, falling back to the committed value. */
  protected readonly displayValue = computed(() => this.hovered() ?? this.value() ?? 0);

  protected onHover(star: number): void {
    if (!this.readonly() && !this.isDisabled()) {
      this.hovered.set(star);
    }
  }

  /** Fired by keyboard arrows and by clicks that check a new star. */
  protected onSelect(star: number, radio: HTMLInputElement): void {
    if (this.readonly()) {
      radio.checked = this.value() === star;
      return;
    }
    this.updateValue(star);
  }

  /** Clicking the star that is already selected clears the rating. */
  protected onStarClick(star: number, radio: HTMLInputElement): void {
    if (this.readonly() || this.isDisabled()) {
      return;
    }
    if (this.value() === star && radio.checked) {
      radio.checked = false;
      this.updateValue(null);
    }
  }

  /** Block the native radio group navigation while readonly. */
  protected onKeydown(event: KeyboardEvent): void {
    const navKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '];
    if (this.readonly() && navKeys.includes(event.key)) {
      event.preventDefault();
    }
  }
}
