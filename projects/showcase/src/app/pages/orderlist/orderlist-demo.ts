import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { OrderList } from '@swipergy/swipyui/orderlist';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `cities = signal(['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt']);

<syui-order-list [(value)]="cities" header="Cities" />`;

const TEMPLATE = `products = signal([
  { name: 'Keyboard', price: 89 },
  { name: 'Mouse', price: 49 },
  { name: 'Monitor', price: 329 },
  { name: 'Webcam', price: 119 },
]);

<syui-order-list [(value)]="products" header="Products">
  <ng-template let-product let-index="index">
    {{ index + 1 }}. <strong>{{ product.name }}</strong> — {{ product.price }} €
  </ng-template>
</syui-order-list>`;

const PROPS: PropRow[] = [
  {
    name: 'value',
    type: 'any[]',
    default: '[]',
    description: 'Items to order; two-way bindable, every reorder emits the updated array.',
  },
  {
    name: 'header',
    type: 'string',
    default: "''",
    description: 'Title shown above the list, also labels the listbox.',
  },
  {
    name: 'emptyMessage',
    type: 'string',
    default: "'No items'",
    description: 'Text shown when value is empty.',
  },
  {
    name: 'ng-template',
    type: 'TemplateRef',
    description: 'Projected item template; context: $implicit item, index, selected.',
  },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [OrderList, DocsSection, DocsPropTable],
  template: `
    <h1>OrderList</h1>
    <p class="docs-lead">
      Reorderable listbox: click selects, ctrl/cmd-click toggles, shift-click selects a range;
      the buttons or ctrl+arrow keys move the selection, Space toggles it.
      <code>import {{ '{' }} OrderList {{ '}' }} from '&#64;swipergy/swipyui/orderlist';</code>
    </p>

    <docs-section title="Basic" [code]="basic" language="typescript">
      <syui-order-list [(value)]="cities" header="Cities" />
      <span class="docs-muted">value: {{ cities().join(', ') }}</span>
    </docs-section>

    <docs-section
      title="Item template"
      [code]="template"
      language="typescript"
      description="A projected ng-template renders each item; the context provides the item, its index and its selected state."
    >
      <syui-order-list [(value)]="products" header="Products">
        <ng-template let-product let-index="index">
          {{ index + 1 }}. <strong>{{ product.name }}</strong> — {{ product.price }} €
        </ng-template>
      </syui-order-list>
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
})
export class OrderListDemo {
  readonly basic = BASIC;
  readonly template = TEMPLATE;
  readonly props = PROPS;

  readonly cities = signal(['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt']);
  readonly products = signal([
    { name: 'Keyboard', price: 89 },
    { name: 'Mouse', price: 49 },
    { name: 'Monitor', price: 329 },
    { name: 'Webcam', price: 119 },
  ]);
}
