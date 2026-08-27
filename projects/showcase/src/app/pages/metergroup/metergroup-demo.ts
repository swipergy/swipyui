import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MeterGroup, MeterItem } from '@swipergy/swipyui/metergroup';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `storage: MeterItem[] = [
  { label: 'Apps', value: 16 },
  { label: 'Photos', value: 24 },
  { label: 'System', value: 10 },
  { label: 'Other', value: 6 },
];

<syui-meter-group [value]="storage" />`;

const CUSTOM = `bandwidth: MeterItem[] = [
  { label: 'Streaming', value: 320, color: 'var(--syui-blue-500)' },
  { label: 'Downloads', value: 180, color: 'var(--syui-primary)' },
];

<syui-meter-group [value]="bandwidth" [max]="1000" />`;

const LABEL_POSITION = `<syui-meter-group [value]="storage" labelPosition="start" />`;

const PROPS: PropRow[] = [
  {
    name: 'value',
    type: 'MeterItem[]',
    default: '[]',
    description: 'Entries as { label, value, color? }; each becomes a segment plus a legend item.',
  },
  {
    name: 'max',
    type: 'number',
    default: '100',
    description: 'Value corresponding to a completely full track.',
  },
  {
    name: 'labelPosition',
    type: "'end' | 'start'",
    default: "'end'",
    description: 'Renders the legend after or before the track.',
  },
  {
    name: 'ariaLabel',
    type: 'string',
    default: "'Meter group'",
    description: 'Accessible name of the meter.',
  },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MeterGroup, DocsSection, DocsPropTable],
  template: `
    <h1>MeterGroup</h1>
    <p class="docs-lead">
      Stacked horizontal meter visualizing how multiple values share a total, with a legend of
      color dots, labels and percentages.
      <code>import {{ '{' }} MeterGroup {{ '}' }} from '&#64;swipergy/swipyui/metergroup';</code>
    </p>

    <docs-section
      title="Basic"
      [code]="basic"
      language="typescript"
      description="Segments without an explicit color cycle through the theme palette."
    >
      <syui-meter-group class="demo-meter" [value]="storage" />
    </docs-section>

    <docs-section
      title="Custom colors and max"
      [code]="custom"
      language="typescript"
      description="Percentages are computed against max; any CSS color works per segment."
    >
      <syui-meter-group class="demo-meter" [value]="bandwidth" [max]="1000" />
    </docs-section>

    <docs-section title="Label position" [code]="labelPosition">
      <syui-meter-group class="demo-meter" [value]="storage" labelPosition="start" />
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
  styles: `
    .demo-meter {
      width: 100%;
    }
  `,
})
export class MeterGroupDemo {
  readonly basic = BASIC;
  readonly custom = CUSTOM;
  readonly labelPosition = LABEL_POSITION;
  readonly props = PROPS;

  readonly storage: MeterItem[] = [
    { label: 'Apps', value: 16 },
    { label: 'Photos', value: 24 },
    { label: 'System', value: 10 },
    { label: 'Other', value: 6 },
  ];
  readonly bandwidth: MeterItem[] = [
    { label: 'Streaming', value: 320, color: 'var(--syui-blue-500)' },
    { label: 'Downloads', value: 180, color: 'var(--syui-primary)' },
  ];
}
