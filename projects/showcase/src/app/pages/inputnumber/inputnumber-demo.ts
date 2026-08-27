import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { InputNumber } from '@swipergy/swipyui/inputnumber';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `<syui-input-number placeholder="Enter a number" [formControl]="quantity" />`;

const BUTTONS = `<syui-input-number showButtons [min]="0" [max]="20" [formControl]="stock" />`;

const CURRENCY = `<syui-input-number mode="currency" currency="EUR" locale="de-DE" [formControl]="price" />
<syui-input-number mode="currency" currency="USD" locale="en-US" [formControl]="price" />`;

const PREFIX_SUFFIX = `<syui-input-number suffix=" %" [min]="0" [max]="100" [formControl]="percent" />
<syui-input-number prefix="≈ " suffix=" km" [formControl]="distance" />`;

const PROPS: PropRow[] = [
  { name: 'showButtons', type: 'boolean', default: 'false', description: 'Shows increment/decrement buttons.' },
  { name: 'min', type: 'number', description: 'Smallest accepted value; clamped on blur and spin.' },
  { name: 'max', type: 'number', description: 'Largest accepted value; clamped on blur and spin.' },
  { name: 'step', type: 'number', default: '1', description: 'Amount added per spin or arrow-key press.' },
  { name: 'mode', type: "'decimal' | 'currency'", default: "'decimal'", description: 'Display format.' },
  { name: 'currency', type: 'string', default: "'USD'", description: 'ISO 4217 code used in currency mode.' },
  { name: 'locale', type: 'string', description: 'BCP 47 locale for formatting; defaults to the browser locale.' },
  { name: 'prefix', type: 'string', default: "''", description: 'Static text before the formatted number.' },
  { name: 'suffix', type: 'string', default: "''", description: 'Static text after the formatted number.' },
  { name: 'placeholder', type: 'string', description: 'Text shown while empty.' },
  { name: 'fluid', type: 'boolean', default: 'false', description: 'Stretches the input to the container width.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the control.' },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputNumber, ReactiveFormsModule, DocsSection, DocsPropTable],
  template: `
    <h1>InputNumber</h1>
    <p class="docs-lead">
      Numeric input with locale-aware formatting, optional spin buttons and min/max clamping.
      ArrowUp/ArrowDown step the value.
      <code>import {{ '{' }} InputNumber {{ '}' }} from '&#64;swipergy/swipyui/inputnumber';</code>
    </p>

    <docs-section title="Basic" [code]="basic" language="html">
      <syui-input-number placeholder="Enter a number" [formControl]="quantity" />
      <span class="docs-muted">value: {{ quantity.value }}</span>
    </docs-section>

    <docs-section
      title="Buttons"
      [code]="buttons"
      language="html"
      description="Stacked increment/decrement buttons; the value is clamped to min/max."
    >
      <syui-input-number showButtons [min]="0" [max]="20" [formControl]="stock" />
    </docs-section>

    <docs-section
      title="Currency"
      [code]="currency"
      language="html"
      description="Intl.NumberFormat drives the display, so currency symbol and separators follow the locale."
    >
      <syui-input-number mode="currency" currency="EUR" locale="de-DE" [formControl]="price" />
      <syui-input-number mode="currency" currency="USD" locale="en-US" [formControl]="price" />
    </docs-section>

    <docs-section title="Prefix & suffix" [code]="prefixSuffix" language="html">
      <syui-input-number suffix=" %" [min]="0" [max]="100" [formControl]="percent" />
      <syui-input-number prefix="≈ " suffix=" km" [formControl]="distance" />
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
})
export class InputNumberDemo {
  readonly basic = BASIC;
  readonly buttons = BUTTONS;
  readonly currency = CURRENCY;
  readonly prefixSuffix = PREFIX_SUFFIX;
  readonly props = PROPS;

  readonly quantity = new FormControl<number | null>(null);
  readonly stock = new FormControl<number | null>(5);
  readonly price = new FormControl<number | null>(1999.99);
  readonly percent = new FormControl<number | null>(25);
  readonly distance = new FormControl<number | null>(null);
}
