import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Select, SelectOption } from '@swipergy/swipyui/select';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `cities: SelectOption[] = [
  { label: 'Berlin', value: 'BER' },
  { label: 'Hamburg', value: 'HAM' },
  { label: 'Munich', value: 'MUC' },
];

<syui-select [options]="cities" placeholder="Select a city" [formControl]="city" />`;

const DISABLED_OPTIONS = `options: SelectOption[] = [
  { label: 'Available', value: 'a' },
  { label: 'Sold out', value: 'b', disabled: true },
];`;

const PROPS: PropRow[] = [
  {
    name: 'options',
    type: 'SelectOption[]',
    default: '[]',
    description: 'Options as { label, value, disabled? } objects.',
  },
  { name: 'placeholder', type: 'string', default: "'Select…'", description: 'Text shown while empty.' },
  { name: 'emptyMessage', type: 'string', default: "'No options'", description: 'Text shown when options is empty.' },
  { name: 'fluid', type: 'boolean', default: 'false', description: 'Stretches the trigger to the container width.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the select.' },
  { name: 'onShow', type: 'output<void>', description: 'Emitted when the panel opens.' },
  { name: 'onHide', type: 'output<void>', description: 'Emitted when the panel closes.' },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Select, ReactiveFormsModule, DocsSection, DocsPropTable],
  template: `
    <h1>Select</h1>
    <p class="docs-lead">
      Single-select dropdown with the ARIA combobox pattern: arrow keys navigate, Enter selects,
      Escape closes.
      <code>import {{ '{' }} Select {{ '}' }} from '&#64;swipergy/swipyui/select';</code>
    </p>

    <docs-section title="Basic" [code]="basic" language="typescript">
      <syui-select [options]="cities" placeholder="Select a city" [formControl]="city" />
      <span class="docs-muted">value: {{ city.value }}</span>
    </docs-section>

    <docs-section
      title="Disabled options"
      [code]="disabledOptions"
      language="typescript"
      description="Disabled options are skipped by keyboard navigation and ignore clicks."
    >
      <syui-select [options]="availability" placeholder="Choose" [formControl]="choice" />
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
})
export class SelectDemo {
  readonly basic = BASIC;
  readonly disabledOptions = DISABLED_OPTIONS;
  readonly props = PROPS;

  readonly cities: SelectOption[] = [
    { label: 'Berlin', value: 'BER' },
    { label: 'Hamburg', value: 'HAM' },
    { label: 'Munich', value: 'MUC' },
  ];
  readonly availability: SelectOption[] = [
    { label: 'Available', value: 'a' },
    { label: 'Sold out', value: 'b', disabled: true },
    { label: 'Back-order', value: 'c' },
  ];
  readonly city = new FormControl<string | null>(null);
  readonly choice = new FormControl<string | null>(null);
}
