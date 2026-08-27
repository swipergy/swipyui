import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Fieldset } from '@swipergy/swipyui/fieldset';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `<syui-fieldset legend="Address">
  Street, city, and zip fields go here.
</syui-fieldset>`;

const TOGGLEABLE = `<syui-fieldset legend="Optional details" toggleable [(collapsed)]="collapsed">
  Collapsible content…
</syui-fieldset>`;

const PROPS: PropRow[] = [
  { name: 'legend', type: 'string', description: 'Text shown in the legend.' },
  {
    name: 'toggleable',
    type: 'boolean',
    default: 'false',
    description: 'Turns the legend into a button that collapses the content.',
  },
  {
    name: 'collapsed',
    type: 'boolean',
    default: 'false',
    description: 'Whether the content is collapsed; supports two-way binding.',
  },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Fieldset, DocsSection, DocsPropTable],
  template: `
    <h1>Fieldset</h1>
    <p class="docs-lead">
      Grouping container built on the native fieldset and legend elements, optionally collapsible
      through the legend.
      <code>import {{ '{' }} Fieldset {{ '}' }} from '&#64;swipergy/swipyui/fieldset';</code>
    </p>

    <docs-section title="Basic" [code]="basic" language="html">
      <syui-fieldset legend="Address">Street, city, and zip fields go here.</syui-fieldset>
    </docs-section>

    <docs-section
      title="Toggleable"
      [code]="toggleable"
      language="html"
      description="When toggleable, the legend becomes a button that collapses the content."
    >
      <syui-fieldset legend="Optional details" toggleable [(collapsed)]="collapsed">
        Only fill these in if they apply to you.
      </syui-fieldset>
      <span class="docs-muted">collapsed: {{ collapsed() }}</span>
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
})
export class FieldsetDemo {
  readonly basic = BASIC;
  readonly toggleable = TOGGLEABLE;
  readonly props = PROPS;

  readonly collapsed = signal(false);
}
