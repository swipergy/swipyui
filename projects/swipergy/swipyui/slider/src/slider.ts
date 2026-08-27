import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  computed,
  forwardRef,
  input,
  numberAttribute,
  viewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { BaseValueControl } from '@swipergy/swipyui/core';

/**
 * Slider for picking a number from a range by dragging a handle, clicking
 * the track, or using the keyboard (arrows step, PageUp/PageDown jump,
 * Home/End go to the ends). Follows the WAI-ARIA slider pattern.
 *
 * ```html
 * <syui-slider [min]="0" [max]="100" [formField]="f.volume" />
 * <syui-slider orientation="vertical" [(value)]="volume" />
 * ```
 */
@Component({
  selector: 'syui-slider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './slider.css',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => Slider), multi: true }],
  host: {
    class: 'syui-slider',
    '[class.syui-slider-horizontal]': 'horizontal()',
    '[class.syui-slider-vertical]': '!horizontal()',
    '[class.syui-slider-disabled]': 'isDisabled()',
  },
  template: `
    <div
      #track
      class="syui-slider-track"
      (pointerdown)="onPointerDown($event)"
      (pointermove)="onPointerMove($event)"
      (pointerup)="onPointerUp()"
      (pointercancel)="onPointerUp()"
    >
      <div
        class="syui-slider-range"
        [style.width.%]="horizontal() ? percent() : null"
        [style.height.%]="horizontal() ? null : percent()"
      ></div>
      <span
        #handle
        class="syui-slider-handle"
        role="slider"
        [style.left.%]="horizontal() ? percent() : null"
        [style.bottom.%]="horizontal() ? null : percent()"
        [attr.tabindex]="isDisabled() ? -1 : 0"
        [attr.aria-valuemin]="min()"
        [attr.aria-valuemax]="max()"
        [attr.aria-valuenow]="currentValue()"
        [attr.aria-orientation]="orientation()"
        [attr.aria-label]="ariaLabel() || null"
        [attr.aria-labelledby]="ariaLabelledby() || null"
        [attr.aria-describedby]="ariaDescribedby() || null"
        [attr.aria-invalid]="ariaInvalid()"
        [attr.aria-disabled]="isDisabled() || null"
        (keydown)="onKeydown($event)"
        (blur)="onTouched()"
      ></span>
    </div>
  `,
})
export class Slider extends BaseValueControl<number> {
  /** Lowest selectable value. */
  readonly min = input(0, { transform: numberAttribute });
  /** Highest selectable value. */
  readonly max = input(100, { transform: numberAttribute });
  /** Granularity of values; arrows move by one step. */
  readonly step = input(1, { transform: numberAttribute });
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
  private readonly track = viewChild.required<ElementRef<HTMLElement>>('track');
  private readonly handle = viewChild.required<ElementRef<HTMLElement>>('handle');

  private dragging = false;

  protected readonly horizontal = computed(() => this.orientation() !== 'vertical');

  /** Value coerced into the [min, max] range, treating null as min. */
  protected readonly currentValue = computed(() =>
    Math.min(this.max(), Math.max(this.min(), this.value() ?? this.min())),
  );

  protected readonly percent = computed(() => {
    const span = this.max() - this.min();
    return span > 0 ? ((this.currentValue() - this.min()) / span) * 100 : 0;
  });

  protected onPointerDown(event: PointerEvent): void {
    if (this.isDisabled()) {
      return;
    }
    event.preventDefault();
    this.dragging = true;
    try {
      this.track().nativeElement.setPointerCapture(event.pointerId);
    } catch {
      /* pointer capture unsupported (tests) */
    }
    this.setValueFromPointer(event);
    this.handle().nativeElement.focus();
  }

  protected onPointerMove(event: PointerEvent): void {
    if (this.dragging) {
      this.setValueFromPointer(event);
    }
  }

  protected onPointerUp(): void {
    this.dragging = false;
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (this.isDisabled()) {
      return;
    }
    const step = this.step() || 1;
    let next: number | undefined;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        next = this.currentValue() + step;
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        next = this.currentValue() - step;
        break;
      case 'PageUp':
        next = this.currentValue() + step * 10;
        break;
      case 'PageDown':
        next = this.currentValue() - step * 10;
        break;
      case 'Home':
        next = this.min();
        break;
      case 'End':
        next = this.max();
        break;
      default:
        return;
    }
    event.preventDefault();
    this.setValue(next);
  }

  private setValueFromPointer(event: PointerEvent): void {
    const rect = this.track().nativeElement.getBoundingClientRect();
    const ratio = this.horizontal()
      ? (event.clientX - rect.left) / rect.width
      : (rect.bottom - event.clientY) / rect.height;
    if (!Number.isFinite(ratio)) {
      return;
    }
    this.setValue(this.min() + ratio * (this.max() - this.min()));
  }

  /** Snap to the step grid, clamp into range and propagate to the form. */
  private setValue(raw: number): void {
    const step = this.step() || 1;
    const stepped = this.min() + Math.round((raw - this.min()) / step) * step;
    const clamped = Math.min(this.max(), Math.max(this.min(), stepped));
    const next = Number(clamped.toFixed(10));
    if (next !== this.value()) {
      this.updateValue(next);
    }
  }
}
