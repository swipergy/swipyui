import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Slider } from '@swipergy/swipyui/slider';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `<syui-slider [formControl]="volume" ariaLabel="Volume" />`;

const STEP = `<syui-slider [min]="0" [max]="1000" [step]="50" [formControl]="budget" ariaLabel="Budget" />`;

const VERTICAL = `<syui-slider orientation="vertical" [formControl]="gain" ariaLabel="Gain" />`;

const PROPS: PropRow[] = [
  { name: 'min', type: 'number', default: '0', description: 'Lowest selectable value.' },
  { name: 'max', type: 'number', default: '100', description: 'Highest selectable value.' },
  {
    name: 'step',
    type: 'number',
    default: '1',
    description: 'Granularity; arrow keys move by one step, PageUp/PageDown by ten.',
  },
  {
    name: 'orientation',
    type: "'horizontal' | 'vertical'",
    default: "'horizontal'",
    description: 'Direction of the track.',
  },
  { name: 'value', type: 'model<number | null>', default: 'null', description: 'Current value.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the slider.' },
  { name: 'ariaLabel', type: 'string', description: 'Accessible name of the handle.' },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Slider, ReactiveFormsModule, DocsSection, DocsPropTable],
  template: `
    <h1>Slider</h1>
    <p class="docs-lead">
      Pick a number from a range by dragging the handle, clicking the track, or with the keyboard
      (arrows step, PageUp/PageDown jump, Home/End go to the ends).
      <code>import {{ '{' }} Slider {{ '}' }} from '&#64;swipergy/swipyui/slider';</code>
    </p>

    <docs-section title="Basic" [code]="basic" language="html">
      <syui-slider [formControl]="volume" ariaLabel="Volume" />
      <span class="docs-muted">value: {{ volume.value }}</span>
    </docs-section>

    <docs-section
      title="Min, max and step"
      [code]="step"
      language="html"
      description="Values snap to the step grid; clicking the track jumps to the nearest step."
    >
      <syui-slider [min]="0" [max]="1000" [step]="50" [formControl]="budget" ariaLabel="Budget" />
      <span class="docs-muted">value: {{ budget.value }}</span>
    </docs-section>

    <docs-section title="Vertical" [code]="vertical" language="html">
      <syui-slider orientation="vertical" [formControl]="gain" ariaLabel="Gain" />
      <span class="docs-muted">value: {{ gain.value }}</span>
    </docs-section>

    <docs-section title="Disabled" code='<syui-slider [value]="40" disabled />' language="html">
      <syui-slider [value]="40" disabled ariaLabel="Disabled slider" />
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
})
export class SliderDemo {
  readonly basic = BASIC;
  readonly step = STEP;
  readonly vertical = VERTICAL;
  readonly props = PROPS;

  readonly volume = new FormControl(40);
  readonly budget = new FormControl(350);
  readonly gain = new FormControl(60);
}
