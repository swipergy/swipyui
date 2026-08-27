import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MultiSelect } from '@swipergy/swipyui/multiselect';
import { SelectOption } from '@swipergy/swipyui/select';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `cities: SelectOption[] = [
  { label: 'Berlin', value: 'BER' },
  { label: 'Hamburg', value: 'HAM' },
  { label: 'Munich', value: 'MUC' },
  { label: 'Cologne', value: 'CGN' },
  { label: 'Frankfurt', value: 'FRA' },
];

<syui-multiselect [options]="cities" placeholder="Select cities" [formControl]="cities" />`;

const CHIPS = `<syui-multiselect
  [options]="cities"
  display="chip"
  placeholder="Select cities"
  [formControl]="chipCities"
/>`;

const FILTER = `<syui-multiselect
  [options]="cities"
  filter
  placeholder="Select cities"
  [formControl]="filteredCities"
/>`;

const PROPS: PropRow[] = [
  {
    name: 'options',
    type: 'SelectOption[]',
    default: '[]',
    description: 'Options as { label, value, disabled? } objects.',
  },
  {
    name: 'placeholder',
    type: 'string',
    default: "'Select…'",
    description: 'Text shown while empty.',
  },
  {
    name: 'display',
    type: "'comma' | 'chip'",
    default: "'comma'",
    description: 'Renders selections as joined labels or removable chips.',
  },
  {
    name: 'maxSelectedLabels',
    type: 'number',
    default: '3',
    description: 'Above this count the trigger shows "n items selected".',
  },
  {
    name: 'filter',
    type: 'boolean',
    default: 'false',
    description: 'Shows a search box at the top of the panel.',
  },
  {
    name: 'filterPlaceholder',
    type: 'string',
    default: "'Search…'",
    description: 'Placeholder of the filter search box.',
  },
  {
    name: 'showToggleAll',
    type: 'boolean',
    default: 'true',
    description: 'Shows a select-all checkbox in the panel header.',
  },
  {
    name: 'emptyMessage',
    type: 'string',
    default: "'No options'",
    description: 'Text shown when no options match.',
  },
  {
    name: 'fluid',
    type: 'boolean',
    default: 'false',
    description: 'Stretches the trigger to the container width.',
  },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the multiselect.' },
  { name: 'onShow', type: 'output<void>', description: 'Emitted when the panel opens.' },
  { name: 'onHide', type: 'output<void>', description: 'Emitted when the panel closes.' },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MultiSelect, ReactiveFormsModule, JsonPipe, DocsSection, DocsPropTable],
  template: `
    <h1>MultiSelect</h1>
    <p class="docs-lead">
      Multi-select dropdown with checkbox options and the ARIA combobox pattern: arrow keys
      navigate, Space/Enter toggles while the panel stays open, Escape closes.
      <code>import {{ '{' }} MultiSelect {{ '}' }} from '&#64;swipergy/swipyui/multiselect';</code>
    </p>

    <docs-section title="Basic" [code]="basic" language="typescript">
      <syui-multiselect [options]="cityOptions" placeholder="Select cities" [formControl]="cities" />
      <span class="docs-muted">value: {{ cities.value | json }}</span>
    </docs-section>

    <docs-section
      title="Chips"
      [code]="chips"
      language="html"
      description="Selected options render as chips with remove buttons. Chips never widen the control — the ones that don't fit collapse into a +n chip whose tooltip lists the hidden selections."
    >
      <syui-multiselect
        [options]="cityOptions"
        display="chip"
        placeholder="Select cities"
        [formControl]="chipCities"
      />
    </docs-section>

    <docs-section
      title="Filter"
      [code]="filterCode"
      language="html"
      description="A search box at the top of the panel narrows the options; the header checkbox toggles all matches."
    >
      <syui-multiselect
        [options]="cityOptions"
        filter
        placeholder="Select cities"
        [formControl]="filteredCities"
      />
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
})
export class MultiSelectDemo {
  readonly basic = BASIC;
  readonly chips = CHIPS;
  readonly filterCode = FILTER;
  readonly props = PROPS;

  readonly cityOptions: SelectOption[] = [
    { label: 'Berlin', value: 'BER' },
    { label: 'Hamburg', value: 'HAM' },
    { label: 'Munich', value: 'MUC' },
    { label: 'Cologne', value: 'CGN' },
    { label: 'Frankfurt', value: 'FRA' },
  ];
  readonly cities = new FormControl<string[] | null>(null);
  readonly chipCities = new FormControl<string[] | null>(['BER', 'MUC']);
  readonly filteredCities = new FormControl<string[] | null>(null);
}
