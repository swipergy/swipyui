import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Panel } from '@swipergy/swipyui/panel';
import { Button } from '@swipergy/swipyui/button';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `<syui-panel header="Details">
  Panels wrap arbitrary content in a bordered container with a header bar.
</syui-panel>`;

const TOGGLEABLE = `<syui-panel header="Advanced settings" toggleable [(collapsed)]="collapsed">
  Collapsible content…
</syui-panel>`;

const FOOTER = `<syui-panel header="Profile">
  Name, email, avatar…
  <div syui-panel-footer>
    <syui-button label="Save" />
    <syui-button label="Cancel" severity="secondary" />
  </div>
</syui-panel>`;

const PROPS: PropRow[] = [
  { name: 'header', type: 'string', description: 'Text shown in the header bar.' },
  {
    name: 'toggleable',
    type: 'boolean',
    default: 'false',
    description: 'Shows a chevron button in the header that collapses the content.',
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
  imports: [Panel, Button, DocsSection, DocsPropTable],
  template: `
    <h1>Panel</h1>
    <p class="docs-lead">
      Bordered content container with a header bar, optional collapse toggle, and a projected
      footer.
      <code>import {{ '{' }} Panel {{ '}' }} from '&#64;swipergy/swipyui/panel';</code>
    </p>

    <docs-section title="Basic" [code]="basic" language="html">
      <syui-panel header="Details">
        Panels wrap arbitrary content in a bordered container with a header bar.
      </syui-panel>
    </docs-section>

    <docs-section
      title="Toggleable"
      [code]="toggleable"
      language="html"
      description="The chevron button collapses the content; collapsed supports two-way binding."
    >
      <syui-panel header="Advanced settings" toggleable [(collapsed)]="collapsed">
        These options are only for power users.
      </syui-panel>
      <span class="docs-muted">collapsed: {{ collapsed() }}</span>
    </docs-section>

    <docs-section
      title="Footer"
      [code]="footer"
      language="html"
      description="Content marked with the syui-panel-footer attribute is projected into the footer."
    >
      <syui-panel header="Profile">
        Name, email, avatar…
        <div syui-panel-footer>
          <syui-button label="Save" />
          <syui-button label="Cancel" severity="secondary" />
        </div>
      </syui-panel>
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
})
export class PanelDemo {
  readonly basic = BASIC;
  readonly toggleable = TOGGLEABLE;
  readonly footer = FOOTER;
  readonly props = PROPS;

  readonly collapsed = signal(false);
}
