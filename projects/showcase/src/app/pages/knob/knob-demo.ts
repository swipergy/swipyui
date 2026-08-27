import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Knob } from '@swipergy/swipyui/knob';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `<syui-knob [formControl]="volume" ariaLabel="Volume" />`;

const TEMPLATE = `<syui-knob valueTemplate="{value}%" [formControl]="load" ariaLabel="Load" />`;

const SIZE = `<syui-knob [size]="60" [(value)]="small" />
<syui-knob [size]="140" [(value)]="large" />`;

const READONLY = `<syui-knob [value]="65" readonly ariaLabel="Score" />`;

const PROPS: PropRow[] = [
  { name: 'min', type: 'number', default: '0', description: 'Lowest selectable value.' },
  { name: 'max', type: 'number', default: '100', description: 'Highest selectable value.' },
  {
    name: 'step',
    type: 'number',
    default: '1',
    description: 'Granularity; arrow keys move by one step, PageUp/PageDown by ten.',
  },
  { name: 'size', type: 'number', default: '100', description: 'Rendered width and height in pixels.' },
  {
    name: 'valueTemplate',
    type: 'string',
    default: "'{value}'",
    description: "Label template; '{value}' is replaced with the current value.",
  },
  {
    name: 'readonly',
    type: 'boolean',
    default: 'false',
    description: 'Shows the value but blocks pointer and keyboard editing.',
  },
  {
    name: 'showValue',
    type: 'boolean',
    default: 'true',
    description: 'Renders the value text in the middle of the dial.',
  },
  { name: 'value', type: 'model<number | null>', default: 'null', description: 'Current value.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the knob.' },
  { name: 'ariaLabel', type: 'string', description: 'Accessible name of the dial.' },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Knob, ReactiveFormsModule, DocsSection, DocsPropTable],
  template: `
    <h1>Knob</h1>
    <p class="docs-lead">
      Circular dial for picking a number from a range: drag the arc with the pointer or use the
      keyboard (arrows step, Home/End go to the ends).
      <code>import {{ '{' }} Knob {{ '}' }} from '&#64;swipergy/swipyui/knob';</code>
    </p>

    <docs-section title="Basic" [code]="basic" language="html">
      <syui-knob [formControl]="volume" ariaLabel="Volume" />
      <span class="docs-muted">value: {{ volume.value }}</span>
    </docs-section>

    <docs-section
      title="Value template"
      [code]="template"
      language="html"
      description="The '{value}' placeholder is replaced with the current value."
    >
      <syui-knob valueTemplate="{value}%" [formControl]="load" ariaLabel="Load" />
    </docs-section>

    <docs-section title="Size" [code]="size" language="html">
      <syui-knob [size]="60" [(value)]="small" ariaLabel="Small knob" />
      <syui-knob [size]="140" [(value)]="large" ariaLabel="Large knob" />
    </docs-section>

    <docs-section
      title="Readonly"
      [code]="readonly"
      language="html"
      description="Readonly knobs display a value without allowing edits."
    >
      <syui-knob [value]="65" readonly ariaLabel="Score" />
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
})
export class KnobDemo {
  readonly basic = BASIC;
  readonly template = TEMPLATE;
  readonly size = SIZE;
  readonly readonly = READONLY;
  readonly props = PROPS;

  readonly volume = new FormControl(40);
  readonly load = new FormControl(72);
  small = 25;
  large = 60;
}
