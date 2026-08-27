import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Chart, ChartData } from '@swipergy/swipyui/chart';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const LINE = `<syui-chart type="line" ariaLabel="Monthly signups" [data]="signups" />`;

const AREA = `<syui-chart type="area" ariaLabel="Monthly signups" [data]="signups" />`;

const BAR = `<syui-chart
  type="bar"
  ariaLabel="Revenue by quarter"
  [data]="{
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    series: [
      { label: '2025', data: [540, 620, 580, 690] },
      { label: '2026', data: [610, 680, 720, 810] },
    ],
  }"
/>`;

const PIE = `<syui-chart type="pie" ariaLabel="Traffic sources" [data]="traffic" />
<syui-chart type="donut" ariaLabel="Traffic sources" [data]="traffic" />`;

const COLOR = `<syui-chart
  type="line"
  ariaLabel="Error rate"
  [data]="{
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    series: [{ label: 'Errors', data: [12, 19, 8, 24, 15], color: 'var(--syui-danger-color)' }],
  }"
/>`;

const PROPS: PropRow[] = [
  {
    name: 'type',
    type: "'line' | 'area' | 'bar' | 'pie' | 'donut'",
    default: "'line'",
    description: 'Chart form.',
  },
  {
    name: 'data',
    type: 'ChartData',
    description:
      'Labels plus series ({ label, data, color? }); pie and donut read the first series.',
  },
  {
    name: 'showLegend',
    type: 'boolean',
    default: 'true',
    description:
      'Legend below the plot; shown for multiple series and for pie/donut categories.',
  },
  { name: 'ariaLabel', type: 'string', description: 'Accessible name of the chart image.' },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Chart, DocsSection, DocsPropTable],
  template: `
    <h1>Chart</h1>
    <p class="docs-lead">
      Dependency-free SVG charts — line, area, grouped bar, pie and donut. Series colors come
      from the theme's categorical palette and adapt to dark mode; every mark carries a tooltip
      with its exact value.
      <code>import {{ '{' }} Chart {{ '}' }} from '&#64;swipergy/swipyui/chart';</code>
    </p>

    <docs-section title="Line" [code]="line" language="html">
      <div class="demo-chart"><syui-chart type="line" ariaLabel="Monthly signups" [data]="signups" /></div>
    </docs-section>

    <docs-section
      title="Area"
      [code]="area"
      language="html"
      description="Same data as the line form with the region to the zero baseline filled."
    >
      <div class="demo-chart"><syui-chart type="area" ariaLabel="Monthly signups" [data]="signups" /></div>
    </docs-section>

    <docs-section
      title="Bar"
      [code]="bar"
      language="html"
      description="Multiple series render as grouped bars; the legend identifies them."
    >
      <div class="demo-chart"><syui-chart type="bar" ariaLabel="Revenue by quarter" [data]="revenue" /></div>
    </docs-section>

    <docs-section
      title="Pie & donut"
      [code]="pie"
      language="html"
      description="Slices come from the first series; tooltips show the value and its share."
    >
      <div class="demo-pies">
        <syui-chart type="pie" ariaLabel="Traffic sources" [data]="traffic" />
        <syui-chart type="donut" ariaLabel="Traffic sources" [data]="traffic" />
      </div>
    </docs-section>

    <docs-section
      title="Custom series color"
      [code]="color"
      language="html"
      description="A series can override its palette slot with any CSS color, including theme tokens."
    >
      <div class="demo-chart"><syui-chart type="line" ariaLabel="Error rate" [data]="errors" /></div>
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
  styles: `
    .demo-chart { width: min(100%, 40rem); }
    .demo-pies { display: flex; flex-wrap: wrap; gap: 2rem; }
    .demo-pies syui-chart { width: 14rem; }
  `,
})
export class ChartDemo {
  readonly line = LINE;
  readonly area = AREA;
  readonly bar = BAR;
  readonly pie = PIE;
  readonly color = COLOR;
  readonly props = PROPS;

  readonly signups: ChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    series: [
      { label: 'Organic', data: [120, 180, 150, 260, 320, 390] },
      { label: 'Referral', data: [80, 90, 140, 160, 150, 210] },
    ],
  };

  readonly revenue: ChartData = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    series: [
      { label: '2025', data: [540, 620, 580, 690] },
      { label: '2026', data: [610, 680, 720, 810] },
    ],
  };

  readonly traffic: ChartData = {
    labels: ['Search', 'Direct', 'Social', 'Email'],
    series: [{ label: 'Sessions', data: [4400, 2800, 1600, 900] }],
  };

  readonly errors: ChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    series: [{ label: 'Errors', data: [12, 19, 8, 24, 15], color: 'var(--syui-danger-color)' }],
  };
}
