import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ToolCall } from '@swipergy/swipyui/toolcall';
import { Button } from '@swipergy/swipyui/button';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `<syui-tool-call name="search_docs" status="success" [duration]="820">
  <pre>{{ result }}</pre>
</syui-tool-call>`;

const STATUS = `<syui-tool-call name="read_file" status="pending" />
<syui-tool-call name="read_file" status="running" description="src/app/app.ts" />
<syui-tool-call name="read_file" status="success" [duration]="120" />
<syui-tool-call name="read_file" status="error" description="ENOENT" />`;

const ACTIONS = `<syui-tool-call name="run_tests" status="error" [duration]="9400">
  <syui-button slot="actions" label="Retry" severity="secondary" variant="text" size="small" />
  <pre>2 failing: table.spec.ts</pre>
</syui-tool-call>`;

const STATIC = `<syui-tool-call name="apply_patch" status="success" [collapsible]="false">
  <pre>3 files changed, 41 insertions(+)</pre>
</syui-tool-call>`;

const PROPS: PropRow[] = [
  { name: 'name', type: 'string', description: 'Name of the invoked tool, shown in the header.' },
  {
    name: 'status',
    type: "'pending' | 'running' | 'success' | 'error'",
    default: "'pending'",
    description: 'Lifecycle of the call; drives the icon, the color and the announced status.',
  },
  {
    name: 'description',
    type: 'string',
    description: 'Short summary of the call, e.g. its primary argument.',
  },
  {
    name: 'duration',
    type: 'number',
    description:
      'Wall-clock duration in milliseconds; rendered as ms below a second, else seconds.',
  },
  {
    name: 'collapsed',
    type: 'boolean',
    default: 'true',
    description: 'Whether the body is hidden; supports two-way binding.',
  },
  {
    name: 'collapsible',
    type: 'boolean',
    default: 'true',
    description: 'Renders the header as a disclosure button. When false the body is always shown.',
  },
  {
    name: 'statusLabel',
    type: 'string',
    description: 'Overrides the text announced for the current status.',
  },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ToolCall, Button, DocsSection, DocsPropTable],
  template: `
    <h1>ToolCall</h1>
    <p class="docs-lead">
      A single tool invocation made by an agent — name and status in the header, arguments and
      result in the collapsible body. The status is carried by an icon <em>and</em> by text, never
      by color alone.
      <code>import {{ '{' }} ToolCall {{ '}' }} from '&#64;swipergy/swipyui/toolcall';</code>
    </p>

    <docs-section title="Basic" [code]="basic" language="html">
      <syui-tool-call
        name="search_docs"
        status="success"
        [duration]="820"
        [(collapsed)]="collapsed"
      >
        <pre>{{ result }}</pre>
      </syui-tool-call>
    </docs-section>

    <docs-section
      title="Status"
      [code]="status"
      language="html"
      description="Queued, running, completed and failed. The running call spins and reports aria-busy."
    >
      <div class="docs-stack">
        <syui-tool-call name="read_file" status="pending" />
        <syui-tool-call name="read_file" status="running" description="src/app/app.ts" />
        <syui-tool-call name="read_file" status="success" [duration]="120" />
        <syui-tool-call name="read_file" status="error" description="ENOENT" />
      </div>
    </docs-section>

    <docs-section
      title="Actions"
      [code]="actions"
      language="html"
      description="The actions slot sits next to the disclosure button — outside it, so the controls stay operable."
    >
      <syui-tool-call name="run_tests" status="error" [duration]="9400">
        <syui-button
          slot="actions"
          label="Retry"
          severity="secondary"
          variant="text"
          size="small"
        />
        <pre>2 failing: table.spec.ts</pre>
      </syui-tool-call>
    </docs-section>

    <docs-section
      title="Always expanded"
      [code]="static"
      language="html"
      description="With collapsible off the header is plain text and the body is always visible."
    >
      <syui-tool-call name="apply_patch" status="success" [collapsible]="false">
        <pre>3 files changed, 41 insertions(+)</pre>
      </syui-tool-call>
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
})
export class ToolCallDemo {
  readonly basic = BASIC;
  readonly status = STATUS;
  readonly actions = ACTIONS;
  readonly static = STATIC;
  readonly props = PROPS;

  readonly collapsed = signal(false);
  readonly result = '{\n  "hits": 3,\n  "top": "guide/signals"\n}';
}
