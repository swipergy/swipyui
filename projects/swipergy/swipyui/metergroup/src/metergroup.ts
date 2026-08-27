import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
  numberAttribute,
} from '@angular/core';

export interface MeterItem {
  label: string;
  value: number;
  /** CSS color of the segment; defaults cycle through the theme palette. */
  color?: string;
}

/**
 * Stacked horizontal meter visualizing how multiple values share a total,
 * with a legend of color dots, labels and percentages:
 *
 * ```html
 * <syui-meter-group
 *   [value]="[
 *     { label: 'Apps', value: 16 },
 *     { label: 'Media', value: 24, color: 'teal' },
 *   ]"
 * />
 * ```
 */
@Component({
  selector: 'syui-meter-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './metergroup.css',
  host: { class: 'syui-metergroup' },
  template: `
    @if (labelPosition() === 'start') {
      <ng-container *ngTemplateOutlet="legend" />
    }
    <div
      class="syui-metergroup-track"
      role="meter"
      [attr.aria-valuemin]="0"
      [attr.aria-valuemax]="max()"
      [attr.aria-valuenow]="total()"
      [attr.aria-label]="ariaLabel()"
    >
      @for (meter of meters(); track $index) {
        <div
          class="syui-metergroup-meter"
          [style.width.%]="meter.percent"
          [style.background]="meter.color"
        ></div>
      }
    </div>
    @if (labelPosition() === 'end') {
      <ng-container *ngTemplateOutlet="legend" />
    }

    <ng-template #legend>
      <ol class="syui-metergroup-labels">
        @for (meter of meters(); track $index) {
          <li class="syui-metergroup-label">
            <span class="syui-metergroup-label-marker" [style.background]="meter.color"></span>
            {{ meter.label }} ({{ meter.percent }}%)
          </li>
        }
      </ol>
    </ng-template>
  `,
  imports: [NgTemplateOutlet],
})
export class MeterGroup {
  /** Meter entries; each becomes one colored segment plus a legend item. */
  readonly value = input<MeterItem[]>([]);
  /** Value corresponding to a completely full track. */
  readonly max = input(100, { transform: numberAttribute });
  /** Renders the legend after (`end`) or before (`start`) the track. */
  readonly labelPosition = input<'end' | 'start'>('end');
  /** Accessible name of the meter. */
  readonly ariaLabel = input('Meter group');

  protected readonly total = computed(() =>
    this.value().reduce((sum, item) => sum + item.value, 0),
  );

  protected readonly meters = computed(() => {
    const max = this.max() || 100;
    return this.value().map((item, index) => ({
      ...item,
      color: item.color ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length],
      percent: Math.round((Math.min(Math.max(item.value, 0), max) / max) * 1000) / 10,
    }));
  });
}

/* Falls back to the semantic status colors, which keep at least 3:1
   contrast against the track in both light and dark mode. */
const DEFAULT_COLORS = [
  'var(--syui-metergroup-color-1, var(--syui-primary))',
  'var(--syui-metergroup-color-2, var(--syui-success-color))',
  'var(--syui-metergroup-color-3, var(--syui-warn-color))',
  'var(--syui-metergroup-color-4, var(--syui-danger-color))',
];
