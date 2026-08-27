import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
} from '@angular/core';

/** One plotted series of a cartesian chart. */
export interface ChartSeries {
  /** Name shown in the legend and in value tooltips. */
  label: string;
  /** One value per entry in `ChartData.labels`. */
  data: number[];
  /** Overrides the palette slot for this series (any CSS color). */
  color?: string;
}

/** Data displayed by `<syui-chart>`. */
export interface ChartData {
  /** Category labels along the x axis; the slices of a pie/donut. */
  labels: string[];
  /** Plotted series; pie and donut charts read only the first one. */
  series: ChartSeries[];
}

export type ChartType = 'line' | 'area' | 'bar' | 'pie' | 'donut';

const W = 600;
const H = 300;
const PAD = { left: 46, right: 10, top: 12, bottom: 30 } as const;
const PIE = { size: 300, c: 150, r: 118, inner: 70 } as const;
/** Corner radius of the value end of a bar. */
const BAR_RADIUS = 3;

interface Tick {
  y: number;
  label: string;
  value: number;
}

interface Mark {
  d: string;
  title: string;
  slot: number;
  color?: string;
}

interface SliceMark extends Mark {
  /** Direct label so slices are identifiable without color (SC 1.4.1). */
  label?: { x: number; y: number; text: string };
}

/** Fraction of the circle a slice needs before it gets a direct label. */
const SLICE_LABEL_MIN = 0.12;

/**
 * Dependency-free SVG chart for lines, areas, grouped bars and pie/donut
 * breakdowns. Series take their colors from the theme's categorical palette
 * (`--syui-chart-color-1…8`, assigned in slot order); every mark carries a
 * native tooltip with its exact value, and a legend identifies multiple
 * series. The SVG scales to the width of its container.
 *
 * ```html
 * <syui-chart
 *   type="bar"
 *   ariaLabel="Revenue by quarter"
 *   [data]="{
 *     labels: ['Q1', 'Q2', 'Q3', 'Q4'],
 *     series: [
 *       { label: '2025', data: [540, 620, 580, 690] },
 *       { label: '2026', data: [610, 680, 720, 810] },
 *     ],
 *   }"
 * />
 * ```
 */
@Component({
  selector: 'syui-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './chart.css',
  host: { class: 'syui-chart' },
  template: `
    <svg
      class="syui-chart-svg"
      role="img"
      [attr.viewBox]="viewBox()"
      [attr.aria-label]="computedAriaLabel()"
    >
      @if (isCartesian()) {
        @for (tick of yTicks(); track tick.value) {
          <line
            class="syui-chart-grid"
            [attr.x1]="plotLeft"
            [attr.x2]="plotRight"
            [attr.y1]="tick.y"
            [attr.y2]="tick.y"
          />
          <text
            class="syui-chart-tick"
            text-anchor="end"
            dominant-baseline="central"
            [attr.x]="plotLeft - 8"
            [attr.y]="tick.y"
          >
            {{ tick.label }}
          </text>
        }
        <line
          class="syui-chart-axis"
          [attr.x1]="plotLeft"
          [attr.x2]="plotRight"
          [attr.y1]="baselineY()"
          [attr.y2]="baselineY()"
        />
        @for (tick of xTicks(); track tick.x) {
          <text class="syui-chart-tick" text-anchor="middle" [attr.x]="tick.x" [attr.y]="xLabelY">
            {{ tick.label }}
          </text>
        }
        @if (type() === 'bar') {
          @for (bar of bars(); track $index) {
            <path
              class="syui-chart-bar syui-chart-series-{{ bar.slot }}"
              [attr.d]="bar.d"
              [style.fill]="bar.color || null"
            >
              <title>{{ bar.title }}</title>
            </path>
          }
        } @else {
          @for (series of lineSeries(); track $index) {
            @if (type() === 'area') {
              <path
                class="syui-chart-area syui-chart-series-{{ series.slot }}"
                [attr.d]="series.areaPath"
                [style.fill]="series.color || null"
              />
            }
            <polyline
              class="syui-chart-line syui-chart-series-{{ series.slot }}"
              [attr.points]="series.points"
              [attr.stroke-dasharray]="dashFor(series.slot)"
              [style.stroke]="series.color || null"
            />
            @for (marker of series.markers; track $index) {
              <circle
                class="syui-chart-marker syui-chart-series-{{ series.slot }}"
                r="4"
                [attr.cx]="marker.cx"
                [attr.cy]="marker.cy"
                [style.fill]="series.color || null"
              >
                <title>{{ marker.title }}</title>
              </circle>
            }
          }
        }
      } @else {
        @for (slice of slices(); track $index) {
          <path
            class="syui-chart-slice syui-chart-series-{{ slice.slot }}"
            [attr.d]="slice.d"
            [style.fill]="slice.color || null"
          >
            <title>{{ slice.title }}</title>
          </path>
        }
        @for (slice of slices(); track $index) {
          @if (slice.label; as label) {
            <text
              class="syui-chart-slice-label"
              text-anchor="middle"
              dominant-baseline="central"
              [attr.x]="label.x"
              [attr.y]="label.y"
            >
              {{ label.text }}
            </text>
          }
        }
      }
    </svg>
    @if (legendItems().length) {
      <ul class="syui-chart-legend">
        @for (item of legendItems(); track item.label) {
          <li class="syui-chart-legend-item">
            @if (isCartesian() && type() !== 'bar') {
              <svg
                class="syui-chart-swatch-line syui-chart-series-{{ item.slot }}"
                viewBox="0 0 28 8"
                aria-hidden="true"
              >
                <line
                  x1="1"
                  y1="4"
                  x2="27"
                  y2="4"
                  [attr.stroke-dasharray]="dashFor(item.slot)"
                  [style.stroke]="item.color || null"
                />
              </svg>
            } @else {
              <span
                class="syui-chart-swatch syui-chart-series-{{ item.slot }}"
                [style.background]="item.color || null"
              ></span>
            }
            {{ item.label }}
          </li>
        }
      </ul>
    }
  `,
})
export class Chart {
  /** Chart form. */
  readonly type = input<ChartType>('line');
  /** Labels and series to plot. */
  readonly data = input.required<ChartData>();
  /** Hides the legend when set to false. */
  readonly showLegend = input(true, { transform: booleanAttribute });
  /** Accessible name of the chart image. */
  readonly ariaLabel = input<string>();

  protected readonly plotLeft = PAD.left;
  protected readonly plotRight = W - PAD.right;
  protected readonly xLabelY = H - PAD.bottom + 18;

  protected readonly isCartesian = computed(() => !['pie', 'donut'].includes(this.type()));

  protected readonly viewBox = computed(() =>
    this.isCartesian() ? `0 0 ${W} ${H}` : `0 0 ${PIE.size} ${PIE.size}`,
  );

  protected readonly computedAriaLabel = computed(() => {
    if (this.ariaLabel()) {
      return this.ariaLabel();
    }
    const { labels, series } = this.data();
    return this.isCartesian()
      ? `${this.type()} chart of ${series.length} series across ${labels.length} categories`
      : `${this.type()} chart of ${labels.length} categories`;
  });

  /** Value domain expanded to whole multiples of a nice tick step. */
  private readonly domain = computed(() => {
    const values = this.data().series.flatMap((series) => series.data);
    const rawMin = Math.min(0, ...values);
    const rawMax = Math.max(0, ...values);
    const step = niceStep((rawMax - rawMin || 1) / 4);
    return {
      min: Math.floor(rawMin / step) * step,
      max: Math.ceil((rawMax || 1) / step) * step,
      step,
    };
  });

  protected readonly yTicks = computed<Tick[]>(() => {
    const { min, max, step } = this.domain();
    const ticks: Tick[] = [];
    for (let value = min; value <= max + step / 2; value += step) {
      const rounded = Number(value.toFixed(10));
      ticks.push({ value: rounded, y: this.y(rounded), label: formatTick(rounded) });
    }
    return ticks;
  });

  protected readonly baselineY = computed(() => this.y(0));

  /** X labels, sampled so at most ~8 are printed; bars center on their band. */
  protected readonly xTicks = computed(() => {
    const labels = this.data().labels;
    const every = Math.max(1, Math.ceil(labels.length / 8));
    const band = (this.plotRight - this.plotLeft) / (labels.length || 1);
    return labels
      .map((label, index) => ({
        label,
        x:
          this.type() === 'bar'
            ? round(this.plotLeft + band * (index + 0.5))
            : this.x(index),
      }))
      .filter((_, index) => index % every === 0);
  });

  protected readonly bars = computed<Mark[]>(() => {
    const { labels, series } = this.data();
    if (!labels.length || !series.length) {
      return [];
    }
    const band = (this.plotRight - this.plotLeft) / labels.length;
    const gap = 2;
    const groupWidth = band * 0.72;
    const barWidth = Math.max(1, (groupWidth - gap * (series.length - 1)) / series.length);
    const baseline = this.baselineY();
    const marks: Mark[] = [];
    series.forEach((oneSeries, seriesIndex) => {
      labels.forEach((label, labelIndex) => {
        const value = oneSeries.data[labelIndex] ?? 0;
        const x = this.plotLeft + band * labelIndex + (band - groupWidth) / 2 +
          seriesIndex * (barWidth + gap);
        marks.push({
          d: barPath(x, baseline, this.y(value), barWidth),
          title: `${oneSeries.label} · ${label}: ${value.toLocaleString()}`,
          slot: slot(seriesIndex),
          color: oneSeries.color,
        });
      });
    });
    return marks;
  });

  protected readonly lineSeries = computed(() => {
    const { labels, series } = this.data();
    const baseline = this.baselineY();
    return series.map((oneSeries, seriesIndex) => {
      const points = labels.map((label, labelIndex) => ({
        cx: this.x(labelIndex),
        cy: round(this.y(oneSeries.data[labelIndex] ?? 0)),
        title: `${oneSeries.label} · ${label}: ${(oneSeries.data[labelIndex] ?? 0).toLocaleString()}`,
      }));
      const line = points.map((point) => `${point.cx},${point.cy}`).join(' ');
      const areaPath = points.length
        ? `M ${points[0].cx},${baseline} L ` +
          points.map((point) => `${point.cx},${point.cy}`).join(' L ') +
          ` L ${points[points.length - 1].cx},${baseline} Z`
        : '';
      return {
        points: line,
        areaPath,
        markers: points,
        slot: slot(seriesIndex),
        color: oneSeries.color,
      };
    });
  });

  protected readonly slices = computed<SliceMark[]>(() => {
    const { labels, series } = this.data();
    const values = labels.map((_, index) => Math.max(0, series[0]?.data[index] ?? 0));
    const total = values.reduce((sum, value) => sum + value, 0);
    if (!total) {
      return [];
    }
    const inner = this.type() === 'donut' ? PIE.inner : 0;
    const labelRadius = inner ? (PIE.r + inner) / 2 : PIE.r * 0.62;
    let start = 0;
    const marks: SliceMark[] = [];
    values.forEach((value, index) => {
      if (!value) {
        return;
      }
      const fraction = value / total;
      const mid = (((start + fraction / 2) * 360 - 90) * Math.PI) / 180;
      marks.push({
        d: slicePath(start, fraction, inner),
        title: `${labels[index]}: ${value.toLocaleString()} (${Math.round(fraction * 100)}%)`,
        slot: slot(index),
        label:
          fraction >= SLICE_LABEL_MIN
            ? {
                x: round(PIE.c + labelRadius * Math.cos(mid)),
                y: round(PIE.c + labelRadius * Math.sin(mid)),
                text: labels[index],
              }
            : undefined,
      });
      start += fraction;
    });
    return marks;
  });

  /** Legend entries: the series for cartesian forms, the slices for pie/donut. */
  protected readonly legendItems = computed(() => {
    if (!this.showLegend()) {
      return [];
    }
    const { labels, series } = this.data();
    if (this.isCartesian()) {
      return series.length > 1
        ? series.map((oneSeries, index) => ({
            label: oneSeries.label,
            slot: slot(index),
            color: oneSeries.color,
          }))
        : [];
    }
    return labels.map((label, index) => ({ label, slot: slot(index), color: undefined }));
  });

  /** Dash patterns so overlapping line series stay apart without color (SC 1.4.1). */
  private static readonly DASH_PATTERNS = ['', '7 3', '2 3', '9 3 2 3', '4 4', '12 4 2 4', '1 3', '6 2 1 2'];

  protected dashFor(slotNumber: number): string | null {
    return Chart.DASH_PATTERNS[(slotNumber - 1) % Chart.DASH_PATTERNS.length] || null;
  }

  /** Maps a value to a y coordinate inside the plot area. */
  private y(value: number): number {
    const { min, max } = this.domain();
    const plotHeight = H - PAD.top - PAD.bottom;
    return round(PAD.top + (plotHeight * (max - value)) / (max - min || 1));
  }

  /** Maps a label index to the x coordinate of its point. */
  private x(index: number): number {
    const count = this.data().labels.length;
    const plotWidth = this.plotRight - this.plotLeft;
    return round(
      count > 1 ? this.plotLeft + (plotWidth * index) / (count - 1) : this.plotLeft + plotWidth / 2,
    );
  }
}

/** Palette slot (1-based) for a series/slice index, cycling after 8. */
function slot(index: number): number {
  return (index % 8) + 1;
}

/** Rounds a rough tick step up to 1, 2 or 5 times a power of ten. */
function niceStep(rough: number): number {
  const power = Math.pow(10, Math.floor(Math.log10(rough)));
  const fraction = rough / power;
  return (fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10) * power;
}

function formatTick(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `${trimZeros(value / 1_000_000)}M`;
  }
  if (Math.abs(value) >= 1000) {
    return `${trimZeros(value / 1000)}k`;
  }
  return trimZeros(value);
}

function trimZeros(value: number): string {
  return String(Number(value.toFixed(2)));
}

function round(value: number): number {
  return Number(value.toFixed(2));
}

/** Bar from the baseline to `yValue` with the value end's corners rounded. */
function barPath(x: number, baseline: number, yValue: number, width: number): string {
  const up = yValue <= baseline; // positive values grow upward
  const radius = Math.min(BAR_RADIUS, width / 2, Math.abs(baseline - yValue));
  const sign = up ? 1 : -1;
  const [x0, x1] = [round(x), round(x + width)];
  const [y0, y1] = [round(baseline), round(yValue)];
  return (
    `M ${x0},${y0} L ${x0},${round(y1 + sign * radius)} ` +
    `Q ${x0},${y1} ${round(x0 + radius)},${y1} L ${round(x1 - radius)},${y1} ` +
    `Q ${x1},${y1} ${x1},${round(y1 + sign * radius)} L ${x1},${y0} Z`
  );
}

/** Pie/donut sector starting at `start` (fraction of the circle) spanning `fraction`. */
function slicePath(start: number, fraction: number, inner: number): string {
  const a0 = start * 360 - 90;
  // a hair under a full sweep keeps the arc from collapsing when there is one slice
  const a1 = a0 + Math.min(fraction, 0.99999) * 360;
  const large = fraction > 0.5 ? 1 : 0;
  const [o0, o1] = [polar(PIE.r, a0), polar(PIE.r, a1)];
  if (!inner) {
    return `M ${PIE.c},${PIE.c} L ${o0} A ${PIE.r} ${PIE.r} 0 ${large} 1 ${o1} Z`;
  }
  const [i0, i1] = [polar(inner, a0), polar(inner, a1)];
  return (
    `M ${o0} A ${PIE.r} ${PIE.r} 0 ${large} 1 ${o1} ` +
    `L ${i1} A ${inner} ${inner} 0 ${large} 0 ${i0} Z`
  );
}

function polar(radius: number, degrees: number): string {
  const radians = (degrees * Math.PI) / 180;
  return `${round(PIE.c + radius * Math.cos(radians))},${round(PIE.c + radius * Math.sin(radians))}`;
}
