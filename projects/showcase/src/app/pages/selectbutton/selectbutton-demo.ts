import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SelectButton, SelectButtonOption } from '@swipergy/swipyui/selectbutton';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `sizes: SelectButtonOption[] = [
  { label: 'Small', value: 'S' },
  { label: 'Medium', value: 'M' },
  { label: 'Large', value: 'L' },
];

<syui-select-button [options]="sizes" [formControl]="size" />`;

const MULTIPLE = `<syui-select-button [options]="toppings" multiple [formControl]="selection" />`;

const ALLOW_EMPTY = `<syui-select-button [options]="alignments" [allowEmpty]="false" [formControl]="alignment" />`;

const PROPS: PropRow[] = [
  {
    name: 'options',
    type: 'SelectButtonOption[]',
    default: '[]',
    description: 'Options as { label, value, disabled? } objects.',
  },
  {
    name: 'multiple',
    type: 'boolean',
    default: 'false',
    description: 'Allows selecting several options; the value becomes an array.',
  },
  {
    name: 'allowEmpty',
    type: 'boolean',
    default: 'true',
    description: 'Whether the last selected option can be deselected.',
  },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables all options.' },
  { name: 'ariaLabel', type: 'string', description: 'Accessible name of the button group.' },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SelectButton, ReactiveFormsModule, JsonPipe, DocsSection, DocsPropTable],
  template: `
    <h1>SelectButton</h1>
    <p class="docs-lead">
      Segmented group of toggle buttons for picking one or several values from a small set. Each
      option exposes <code>aria-pressed</code>; arrow keys move focus within the group.
      <code>import {{ '{' }} SelectButton {{ '}' }} from '&#64;swipergy/swipyui/selectbutton';</code>
    </p>

    <docs-section title="Basic" [code]="basic" language="typescript">
      <syui-select-button [options]="sizes" [formControl]="size" ariaLabel="Size" />
      <span class="docs-muted">value: {{ size.value }}</span>
    </docs-section>

    <docs-section
      title="Multiple"
      [code]="multipleCode"
      description="With multiple, options toggle independently and the value is an array."
    >
      <syui-select-button [options]="toppings" multiple [formControl]="selection" ariaLabel="Toppings" />
      <span class="docs-muted">value: {{ selection.value | json }}</span>
    </docs-section>

    <docs-section
      title="Always one selection"
      [code]="allowEmptyCode"
      description="With allowEmpty=false, clicking the selected option keeps it selected."
    >
      <syui-select-button
        [options]="alignments"
        [allowEmpty]="false"
        [formControl]="alignment"
        ariaLabel="Alignment"
      />
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
})
export class SelectButtonDemo {
  readonly basic = BASIC;
  readonly multipleCode = MULTIPLE;
  readonly allowEmptyCode = ALLOW_EMPTY;
  readonly props = PROPS;

  readonly sizes: SelectButtonOption[] = [
    { label: 'Small', value: 'S' },
    { label: 'Medium', value: 'M' },
    { label: 'Large', value: 'L' },
  ];
  readonly toppings: SelectButtonOption[] = [
    { label: 'Cheese', value: 'cheese' },
    { label: 'Mushrooms', value: 'mushrooms' },
    { label: 'Olives', value: 'olives' },
    { label: 'Pineapple', value: 'pineapple', disabled: true },
  ];
  readonly alignments: SelectButtonOption[] = [
    { label: 'Left', value: 'left' },
    { label: 'Center', value: 'center' },
    { label: 'Right', value: 'right' },
  ];
  readonly size = new FormControl<string | null>('M');
  readonly selection = new FormControl<string[] | null>(null);
  readonly alignment = new FormControl<string | null>('left');
}
