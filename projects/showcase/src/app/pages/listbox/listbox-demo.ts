import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Listbox } from '@swipergy/swipyui/listbox';
import { SelectOption } from '@swipergy/swipyui/select';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `cities: SelectOption[] = [
  { label: 'Berlin', value: 'BER' },
  { label: 'Hamburg', value: 'HAM' },
  { label: 'Munich', value: 'MUC' },
  { label: 'Cologne', value: 'CGN' },
];

<syui-listbox [options]="cities" [formControl]="city" />`;

const MULTIPLE = `<syui-listbox [options]="cities" multiple [formControl]="cities" />`;

const FILTER = `<syui-listbox [options]="cities" filter [formControl]="filteredCity" />`;

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
  {
    name: 'multiple',
    type: 'boolean',
    default: 'false',
    description: 'Allows several selections; the value becomes an array.',
  },
  {
    name: 'filter',
    type: 'boolean',
    default: 'false',
    description: 'Shows a search box above the list.',
  },
  {
    name: 'filterPlaceholder',
    type: 'string',
    default: "'Search…'",
    description: 'Placeholder of the filter search box.',
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
    description: 'Stretches the list to the container width.',
  },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the listbox.' },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Listbox, ReactiveFormsModule, JsonPipe, DocsSection, DocsPropTable],
  template: `
    <h1>Listbox</h1>
    <p class="docs-lead">
      Inline option list with the ARIA listbox pattern: arrow keys navigate, Home/End jump,
      Space/Enter toggles, and typing a letter jumps to the next matching option.
      <code>import {{ '{' }} Listbox {{ '}' }} from '&#64;swipergy/swipyui/listbox';</code>
    </p>

    <docs-section title="Basic" [code]="basic" language="typescript">
      <syui-listbox [options]="cityOptions" [formControl]="city" />
      <span class="docs-muted">value: {{ city.value }}</span>
    </docs-section>

    <docs-section
      title="Multiple"
      [code]="multiple"
      language="html"
      description="With multiple, options toggle independently and the value is an array."
    >
      <syui-listbox [options]="cityOptions" multiple [formControl]="cities" />
      <span class="docs-muted">value: {{ cities.value | json }}</span>
    </docs-section>

    <docs-section
      title="Filter"
      [code]="filterCode"
      language="html"
      description="A search box above the list narrows the options."
    >
      <syui-listbox [options]="cityOptions" filter [formControl]="filteredCity" />
    </docs-section>

    <docs-section
      title="Disabled options"
      [code]="disabledOptions"
      language="typescript"
      description="Disabled options are skipped by keyboard navigation and ignore clicks."
    >
      <syui-listbox [options]="availability" [formControl]="choice" />
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
})
export class ListboxDemo {
  readonly basic = BASIC;
  readonly multiple = MULTIPLE;
  readonly filterCode = FILTER;
  readonly disabledOptions = DISABLED_OPTIONS;
  readonly props = PROPS;

  readonly cityOptions: SelectOption[] = [
    { label: 'Berlin', value: 'BER' },
    { label: 'Hamburg', value: 'HAM' },
    { label: 'Munich', value: 'MUC' },
    { label: 'Cologne', value: 'CGN' },
  ];
  readonly availability: SelectOption[] = [
    { label: 'Available', value: 'a' },
    { label: 'Sold out', value: 'b', disabled: true },
    { label: 'Back-order', value: 'c' },
  ];
  readonly city = new FormControl<string | null>(null);
  readonly cities = new FormControl<string[] | null>(null);
  readonly filteredCity = new FormControl<string | null>(null);
  readonly choice = new FormControl<string | null>(null);
}
