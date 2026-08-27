import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { PickList } from '@swipergy/swipyui/picklist';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `available = signal(['Keyboard', 'Mouse', 'Monitor', 'Webcam', 'Headset']);
chosen = signal<string[]>([]);

<syui-pick-list
  [(source)]="available"
  [(target)]="chosen"
  sourceHeader="Available"
  targetHeader="Chosen"
/>`;

const TEMPLATE = `<syui-pick-list
  [(source)]="availableProducts"
  [(target)]="cart"
  sourceHeader="Products"
  targetHeader="Cart"
  showSourceControls="false"
  showTargetControls="false"
>
  <ng-template let-product>
    <strong>{{ product.name }}</strong> — {{ product.price }} €
  </ng-template>
</syui-pick-list>`;

const PROPS: PropRow[] = [
  {
    name: 'source',
    type: 'any[]',
    default: '[]',
    description: 'Items of the left list; two-way bindable, transfers emit the updated array.',
  },
  {
    name: 'target',
    type: 'any[]',
    default: '[]',
    description: 'Items of the right list; two-way bindable, transfers emit the updated array.',
  },
  {
    name: 'sourceHeader',
    type: 'string',
    default: "''",
    description: 'Title above the source list, also labels its listbox.',
  },
  {
    name: 'targetHeader',
    type: 'string',
    default: "''",
    description: 'Title above the target list, also labels its listbox.',
  },
  {
    name: 'showSourceControls',
    type: 'boolean',
    default: 'true',
    description: 'Shows the reorder buttons next to the source list.',
  },
  {
    name: 'showTargetControls',
    type: 'boolean',
    default: 'true',
    description: 'Shows the reorder buttons next to the target list.',
  },
  {
    name: 'emptyMessage',
    type: 'string',
    default: "'No items'",
    description: 'Text shown in an empty list.',
  },
  {
    name: 'ng-template',
    type: 'TemplateRef',
    description: 'Projected item template for both lists; context: $implicit item, index, selected.',
  },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PickList, DocsSection, DocsPropTable],
  template: `
    <h1>PickList</h1>
    <p class="docs-lead">
      Dual listbox that moves items between a source and a target list. Click selects,
      ctrl/cmd-click toggles, shift-click selects a range; the middle buttons transfer the
      selection or all items, ctrl+arrow keys reorder within a list.
      <code>import {{ '{' }} PickList {{ '}' }} from '&#64;swipergy/swipyui/picklist';</code>
    </p>

    <docs-section title="Basic" [code]="basic" language="typescript">
      <syui-pick-list
        [(source)]="available"
        [(target)]="chosen"
        sourceHeader="Available"
        targetHeader="Chosen"
      />
      <span class="docs-muted">chosen: {{ chosen().join(', ') }}</span>
    </docs-section>

    <docs-section
      title="Item template, without reorder controls"
      [code]="template"
      language="typescript"
      description="A single projected ng-template renders the items of both lists; showSourceControls / showTargetControls hide the per-list reorder buttons."
    >
      <syui-pick-list
        [(source)]="availableProducts"
        [(target)]="cart"
        sourceHeader="Products"
        targetHeader="Cart"
        showSourceControls="false"
        showTargetControls="false"
      >
        <ng-template let-product>
          <strong>{{ product.name }}</strong> — {{ product.price }} €
        </ng-template>
      </syui-pick-list>
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
})
export class PickListDemo {
  readonly basic = BASIC;
  readonly template = TEMPLATE;
  readonly props = PROPS;

  readonly available = signal(['Keyboard', 'Mouse', 'Monitor', 'Webcam', 'Headset']);
  readonly chosen = signal<string[]>([]);

  readonly availableProducts = signal([
    { name: 'Keyboard', price: 89 },
    { name: 'Mouse', price: 49 },
    { name: 'Monitor', price: 329 },
  ]);
  readonly cart = signal([{ name: 'Webcam', price: 119 }]);
}
