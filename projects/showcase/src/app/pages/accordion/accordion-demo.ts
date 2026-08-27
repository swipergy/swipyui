import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Accordion, AccordionPanel } from '@swipergy/swipyui/accordion';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `<syui-accordion [(value)]="open">
  <syui-accordion-panel value="shipping" header="Shipping">
    Orders ship within 2 business days.
  </syui-accordion-panel>
  <syui-accordion-panel value="billing" header="Billing">
    We accept all major credit cards.
  </syui-accordion-panel>
  <syui-accordion-panel value="returns" header="Returns" disabled>
    Returns are accepted within 30 days.
  </syui-accordion-panel>
</syui-accordion>`;

const MULTIPLE = `<syui-accordion multiple [(value)]="openPanels">
  <syui-accordion-panel value="a" header="First">…</syui-accordion-panel>
  <syui-accordion-panel value="b" header="Second">…</syui-accordion-panel>
  <syui-accordion-panel value="c" header="Third">…</syui-accordion-panel>
</syui-accordion>`;

const PROPS: PropRow[] = [
  {
    name: 'value',
    type: 'unknown | unknown[]',
    description: 'Value(s) of the expanded panel(s); supports two-way binding.',
  },
  {
    name: 'multiple',
    type: 'boolean',
    default: 'false',
    description: 'Allows several panels to be open at once; value becomes an array.',
  },
  {
    name: 'syui-accordion-panel value',
    type: 'unknown',
    description: 'Identifies the panel within the accordion value.',
  },
  {
    name: 'syui-accordion-panel header',
    type: 'string',
    description: 'Text shown in the panel header button.',
  },
  {
    name: 'syui-accordion-panel disabled',
    type: 'boolean',
    default: 'false',
    description: 'Prevents toggling and skips the header in keyboard navigation.',
  },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Accordion, AccordionPanel, DocsSection, DocsPropTable],
  template: `
    <h1>Accordion</h1>
    <p class="docs-lead">
      Vertically stacked collapsible panels with the ARIA accordion pattern: Enter/Space toggles,
      ArrowUp/ArrowDown move between headers, Home/End jump.
      <code>
        import {{ '{' }} Accordion, AccordionPanel {{ '}' }} from '&#64;swipergy/swipyui/accordion';
      </code>
    </p>

    <docs-section title="Basic" [code]="basic" language="html">
      <syui-accordion [(value)]="open">
        <syui-accordion-panel value="shipping" header="Shipping">
          Orders ship within 2 business days.
        </syui-accordion-panel>
        <syui-accordion-panel value="billing" header="Billing">
          We accept all major credit cards.
        </syui-accordion-panel>
        <syui-accordion-panel value="returns" header="Returns" disabled>
          Returns are accepted within 30 days.
        </syui-accordion-panel>
      </syui-accordion>
      <span class="docs-muted">value: {{ open() }}</span>
    </docs-section>

    <docs-section
      title="Multiple"
      [code]="multiple"
      language="html"
      description="With multiple, toggling a panel does not close the others and value is an array."
    >
      <syui-accordion multiple [(value)]="openPanels">
        <syui-accordion-panel value="a" header="First">First panel content.</syui-accordion-panel>
        <syui-accordion-panel value="b" header="Second">Second panel content.</syui-accordion-panel>
        <syui-accordion-panel value="c" header="Third">Third panel content.</syui-accordion-panel>
      </syui-accordion>
      <span class="docs-muted">value: {{ openPanels() }}</span>
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
})
export class AccordionDemo {
  readonly basic = BASIC;
  readonly multiple = MULTIPLE;
  readonly props = PROPS;

  readonly open = signal<unknown>('shipping');
  readonly openPanels = signal<unknown>(['a']);
}
