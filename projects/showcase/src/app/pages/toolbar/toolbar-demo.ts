import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Toolbar } from '@swipergy/swipyui/toolbar';
import { Button } from '@swipergy/swipyui/button';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `<syui-toolbar ariaLabel="Editor actions">
  <div syui-toolbar-start>
    <syui-button label="New" />
    <syui-button label="Open" severity="secondary" />
  </div>
  <div syui-toolbar-center>Untitled document</div>
  <div syui-toolbar-end>
    <syui-button label="Save" />
  </div>
</syui-toolbar>`;

const TWO_SLOTS = `<syui-toolbar ariaLabel="List actions">
  <div syui-toolbar-start>
    <syui-button label="Add" />
    <syui-button label="Delete" severity="danger" />
  </div>
  <div syui-toolbar-end>
    <syui-button label="Export" severity="secondary" />
  </div>
</syui-toolbar>`;

const PROPS: PropRow[] = [
  { name: 'ariaLabel', type: 'string', description: 'Accessible name for the toolbar.' },
  {
    name: 'syui-toolbar-start',
    type: 'attribute slot',
    description: 'Projects the element into the start (left) section.',
  },
  {
    name: 'syui-toolbar-center',
    type: 'attribute slot',
    description: 'Projects the element into the center section.',
  },
  {
    name: 'syui-toolbar-end',
    type: 'attribute slot',
    description: 'Projects the element into the end (right) section.',
  },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Toolbar, Button, DocsSection, DocsPropTable],
  template: `
    <h1>Toolbar</h1>
    <p class="docs-lead">
      Pure layout container that groups actions into start, center, and end slots inside a
      bordered, rounded bar.
      <code>import {{ '{' }} Toolbar {{ '}' }} from '&#64;swipergy/swipyui/toolbar';</code>
    </p>

    <docs-section title="Basic" [code]="basic" language="html">
      <syui-toolbar ariaLabel="Editor actions">
        <div syui-toolbar-start>
          <syui-button label="New" />
          <syui-button label="Open" severity="secondary" />
        </div>
        <div syui-toolbar-center>Untitled document</div>
        <div syui-toolbar-end>
          <syui-button label="Save" />
        </div>
      </syui-toolbar>
    </docs-section>

    <docs-section
      title="Start and end only"
      [code]="twoSlots"
      language="html"
      description="Unused slots collapse, so start and end sit at the opposite edges."
    >
      <syui-toolbar ariaLabel="List actions">
        <div syui-toolbar-start>
          <syui-button label="Add" />
          <syui-button label="Delete" severity="danger" />
        </div>
        <div syui-toolbar-end>
          <syui-button label="Export" severity="secondary" />
        </div>
      </syui-toolbar>
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
})
export class ToolbarDemo {
  readonly basic = BASIC;
  readonly twoSlots = TWO_SLOTS;
  readonly props = PROPS;
}
