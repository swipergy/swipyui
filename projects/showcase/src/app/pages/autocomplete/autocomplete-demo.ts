import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Autocomplete, AutocompleteCompleteEvent } from '@swipergy/swipyui/autocomplete';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `countries = ['Austria', 'Belgium', 'Denmark', /* … */];
filtered = signal<string[]>([]);

search(event: AutocompleteCompleteEvent) {
  this.filtered.set(
    this.countries.filter((c) => c.toLowerCase().includes(event.query.toLowerCase())),
  );
}

<syui-autocomplete
  [suggestions]="filtered()"
  (completeMethod)="search($event)"
  placeholder="Search a country"
  [formControl]="country"
/>`;

const OBJECTS = `interface City { name: string; code: string; }
cities: City[] = [{ name: 'Berlin', code: 'BER' }, /* … */];

<syui-autocomplete
  [suggestions]="filteredCities()"
  optionLabel="name"
  dropdown
  forceSelection
  (completeMethod)="searchCities($event)"
  placeholder="Pick a city"
  [formControl]="city"
/>`;

const PROPS: PropRow[] = [
  {
    name: 'suggestions',
    type: 'unknown[]',
    default: '[]',
    description: 'Suggestions supplied by the parent in response to completeMethod.',
  },
  {
    name: 'optionLabel',
    type: 'string',
    description: 'Field name used as the display label when suggestions are objects.',
  },
  { name: 'placeholder', type: 'string', default: "''", description: 'Text shown while empty.' },
  {
    name: 'emptyMessage',
    type: 'string',
    default: "'No results'",
    description: 'Text shown when suggestions is empty.',
  },
  {
    name: 'minLength',
    type: 'number',
    default: '1',
    description: 'Minimum number of characters before completeMethod fires.',
  },
  {
    name: 'dropdown',
    type: 'boolean',
    default: 'false',
    description: 'Shows a chevron button that requests all suggestions (empty query).',
  },
  {
    name: 'forceSelection',
    type: 'boolean',
    default: 'false',
    description: 'Clears free text on blur unless it matches a suggestion.',
  },
  {
    name: 'fluid',
    type: 'boolean',
    default: 'false',
    description: 'Stretches the control to the container width.',
  },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the control.' },
  {
    name: 'completeMethod',
    type: 'output<AutocompleteCompleteEvent>',
    description: 'Emitted (debounced ~250ms) with { query } whenever suggestions should be computed.',
  },
  { name: 'onShow', type: 'output<void>', description: 'Emitted when the panel opens.' },
  { name: 'onHide', type: 'output<void>', description: 'Emitted when the panel closes.' },
];

interface City {
  name: string;
  code: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Autocomplete, ReactiveFormsModule, DocsSection, DocsPropTable],
  template: `
    <h1>AutoComplete</h1>
    <p class="docs-lead">
      Text input with a suggestion overlay following the ARIA combobox pattern. It emits
      <code>completeMethod</code> as the user types and renders whatever suggestions the parent
      supplies — filtering stays in your hands.
      <code>import {{ '{' }} Autocomplete {{ '}' }} from '&#64;swipergy/swipyui/autocomplete';</code>
    </p>

    <docs-section title="Basic" [code]="basic" language="typescript">
      <syui-autocomplete
        [suggestions]="filtered()"
        (completeMethod)="search($event)"
        placeholder="Search a country"
        [formControl]="country"
      />
      <span class="docs-muted">value: {{ country.value }}</span>
    </docs-section>

    <docs-section
      title="Objects, dropdown and forceSelection"
      [code]="objects"
      language="typescript"
      description="Object suggestions use optionLabel for display. The dropdown button requests all suggestions with an empty query, and forceSelection clears free text that matches no suggestion on blur."
    >
      <syui-autocomplete
        [suggestions]="filteredCities()"
        optionLabel="name"
        dropdown
        forceSelection
        (completeMethod)="searchCities($event)"
        placeholder="Pick a city"
        [formControl]="city"
      />
      <span class="docs-muted">value: {{ cityLabel() }}</span>
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
})
export class AutocompleteDemo {
  readonly basic = BASIC;
  readonly objects = OBJECTS;
  readonly props = PROPS;

  readonly countries = [
    'Austria',
    'Belgium',
    'Denmark',
    'Finland',
    'France',
    'Germany',
    'Italy',
    'Netherlands',
    'Norway',
    'Spain',
    'Sweden',
    'Switzerland',
  ];
  readonly filtered = signal<string[]>([]);
  readonly country = new FormControl<string | null>(null);

  readonly cities: City[] = [
    { name: 'Berlin', code: 'BER' },
    { name: 'Hamburg', code: 'HAM' },
    { name: 'Munich', code: 'MUC' },
    { name: 'Cologne', code: 'CGN' },
    { name: 'Frankfurt', code: 'FRA' },
  ];
  readonly filteredCities = signal<City[]>([]);
  readonly city = new FormControl<City | null>(null);

  search(event: AutocompleteCompleteEvent): void {
    const query = event.query.toLowerCase();
    this.filtered.set(this.countries.filter((c) => c.toLowerCase().includes(query)));
  }

  searchCities(event: AutocompleteCompleteEvent): void {
    const query = event.query.toLowerCase();
    this.filteredCities.set(this.cities.filter((c) => c.name.toLowerCase().includes(query)));
  }

  cityLabel(): string {
    const value = this.city.value;
    return value && typeof value === 'object' ? `${value.name} (${value.code})` : String(value ?? '');
  }
}
