import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  forwardRef,
  input,
  numberAttribute,
  viewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { BaseValueControl } from '@swipergy/swipyui/core';

/** Start of the dial, 240° in math coordinates (bottom-left). */
const MIN_RADIANS = (4 * Math.PI) / 3;
/** End of the dial, -60° in math coordinates (bottom-right). */
const MAX_RADIANS = -Math.PI / 3;
/** Angles below this (bottom gap) are outside the dial. */
const GAP_START = -Math.PI / 2 - Math.PI / 6;
const RADIUS = 40;
const MID = 50;

/**
 * Circular dial for picking a number from a range. Drag the arc with the
 * pointer or use the keyboard (arrows step, PageUp/PageDown jump, Home/End
 * go to the ends). Follows the WAI-ARIA slider pattern.
 *
 * ```html
 * <syui-knob [min]="0" [max]="100" [formField]="f.volume" />
 * <syui-knob valueTemplate="{value}%" [size]="140" [(value)]="volume" />
 * ```
 */
@Component({
  selector: 'syui-knob',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './knob.css',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => Knob), multi: true }],
  host: {
    class: 'syui-knob',
    '[class.syui-knob-disabled]': 'isDisabled()',
    '[class.syui-knob-readonly]': 'readonly()',
  },
  template: `
    <svg
      #dial
      viewBox="0 0 100 100"
      role="slider"
      [attr.width]="size()"
      [attr.height]="size()"
      [attr.tabindex]="isDisabled() ? -1 : 0"
      [attr.aria-valuemin]="min()"
      [attr.aria-valuemax]="max()"
      [attr.aria-valuenow]="currentValue()"
      [attr.aria-valuetext]="displayValue()"
      [attr.aria-label]="ariaLabel() || null"
      [attr.aria-labelledby]="ariaLabelledby() || null"
      [attr.aria-describedby]="ariaDescribedby() || null"
      [attr.aria-invalid]="ariaInvalid()"
      [attr.aria-disabled]="isDisabled() || null"
      [attr.aria-readonly]="readonly() || null"
      (pointerdown)="onPointerDown($event)"
      (pointermove)="onPointerMove($event)"
      (pointerup)="onPointerUp()"
      (pointercancel)="onPointerUp()"
      (keydown)="onKeydown($event)"
      (blur)="onTouched()"
    >
      <path class="syui-knob-range" [attr.d]="rangePath" fill="none" stroke-linecap="round" />
      <path class="syui-knob-value" [attr.d]="valuePath()" fill="none" stroke-linecap="round" />
      @if (showValue()) {
        <text class="syui-knob-text" x="50" y="50" text-anchor="middle" dominant-baseline="central">
          {{ displayValue() }}
        </text>
      }
    </svg>
  `,
})
export class Knob extends BaseValueControl<number> {
  /** Lowest selectable value. */
  readonly min = input(0, { transform: numberAttribute });
  /** Highest selectable value. */
  readonly max = input(100, { transform: numberAttribute });
  /** Granularity of values; arrows move by one step. */
  readonly step = input(1, { transform: numberAttribute });
  /** Rendered width and height in pixels. */
  readonly size = input(100, { transform: numberAttribute });
  /** Label template; '{value}' is replaced with the current value. */
  readonly valueTemplate = input('{value}');
  /** Shows the value but blocks pointer and keyboard editing. */
  readonly readonly = input(false, { transform: booleanAttribute });
  /** Renders the value text in the middle of the dial. */
  readonly showValue = input(true, { transform: booleanAttribute });
  private readonly dial = viewChild.required<ElementRef<SVGSVGElement>>('dial');

  private dragging = false;

  /** Value coerced into the [min, max] range, treating null as min. */
  protected readonly currentValue = computed(() =>
    Math.min(this.max(), Math.max(this.min(), this.value() ?? this.min())),
  );

  protected readonly displayValue = computed(() =>
    this.valueTemplate().replace('{value}', String(this.currentValue())),
  );

  /** Background arc from the dial start to the dial end. */
  protected readonly rangePath =
    `M ${point(MIN_RADIANS).x} ${point(MIN_RADIANS).y} ` +
    `A ${RADIUS} ${RADIUS} 0 1 1 ${point(MAX_RADIANS).x} ${point(MAX_RADIANS).y}`;

  /** Filled arc from the dial start to the current value. */
  protected readonly valuePath = computed(() => {
    const span = this.max() - this.min();
    const ratio = span > 0 ? (this.currentValue() - this.min()) / span : 0;
    const valueRadians = MIN_RADIANS + ratio * (MAX_RADIANS - MIN_RADIANS);
    const start = point(MIN_RADIANS);
    const end = point(valueRadians);
    const largeArc = MIN_RADIANS - valueRadians > Math.PI ? 1 : 0;
    return `M ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${end.x} ${end.y}`;
  });

  protected onPointerDown(event: PointerEvent): void {
    if (this.isDisabled() || this.readonly()) {
      return;
    }
    event.preventDefault();
    this.dragging = true;
    const dial = this.dial().nativeElement;
    try {
      dial.setPointerCapture(event.pointerId);
    } catch {
      /* pointer capture unsupported (tests) */
    }
    this.setValueFromPointer(event);
    dial.focus();
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
    if (this.isDisabled() || this.readonly()) {
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

  /** Map the pointer position to an angle around the dial center. */
  private setValueFromPointer(event: PointerEvent): void {
    const rect = this.dial().nativeElement.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      return;
    }
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = rect.top + rect.height / 2 - event.clientY;
    const angle = Math.atan2(dy, dx);
    let radians: number;
    if (angle > MAX_RADIANS) {
      radians = angle;
    } else if (angle < GAP_START) {
      radians = angle + 2 * Math.PI;
    } else {
      return; // bottom gap, outside the dial
    }
    const ratio = (radians - MIN_RADIANS) / (MAX_RADIANS - MIN_RADIANS);
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

function point(radians: number): { x: number; y: number } {
  return {
    x: Number((MID + RADIUS * Math.cos(radians)).toFixed(3)),
    y: Number((MID - RADIUS * Math.sin(radians)).toFixed(3)),
  };
}
