import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Tag } from '@swipergy/swipyui/tag';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `<syui-tag value="Primary" />
<syui-tag value="Secondary" severity="secondary" />
<syui-tag value="Success" severity="success" />
<syui-tag value="Info" severity="info" />
<syui-tag value="Warn" severity="warn" />
<syui-tag value="Danger" severity="danger" />`;

const ROUNDED = `<syui-tag value="In stock" severity="success" rounded />
<syui-tag value="Out of stock" severity="danger" rounded />`;

const PROJECTED = `<syui-tag severity="info">v2.4.0</syui-tag>`;

const PROPS: PropRow[] = [
  { name: 'value', type: 'string', description: 'Text shown in the tag; overridden by projected content.' },
  {
    name: 'severity',
    type: "'secondary' | 'success' | 'info' | 'warn' | 'danger' | null",
    default: 'null',
    description: 'Color scheme; null uses the primary highlight colors.',
  },
  { name: 'rounded', type: 'boolean', default: 'false', description: 'Renders the tag as a pill.' },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Tag, DocsSection, DocsPropTable],
  template: `
    <h1>Tag</h1>
    <p class="docs-lead">
      Small colored label for categorizing content, e.g. statuses in a table.
      <code>import {{ '{' }} Tag {{ '}' }} from '&#64;swipergy/swipyui/tag';</code>
    </p>

    <docs-section title="Severities" [code]="basic" language="html">
      <syui-tag value="Primary" />
      <syui-tag value="Secondary" severity="secondary" />
      <syui-tag value="Success" severity="success" />
      <syui-tag value="Info" severity="info" />
      <syui-tag value="Warn" severity="warn" />
      <syui-tag value="Danger" severity="danger" />
    </docs-section>

    <docs-section title="Rounded" [code]="rounded" language="html">
      <syui-tag value="In stock" severity="success" rounded />
      <syui-tag value="Out of stock" severity="danger" rounded />
    </docs-section>

    <docs-section
      title="Custom content"
      [code]="projected"
      language="html"
      description="Projected content replaces the value."
    >
      <syui-tag severity="info">v2.4.0</syui-tag>
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
})
export class TagDemo {
  readonly basic = BASIC;
  readonly rounded = ROUNDED;
  readonly projected = PROJECTED;
  readonly props = PROPS;
}
