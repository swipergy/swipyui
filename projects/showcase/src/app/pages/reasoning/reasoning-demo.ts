import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Reasoning, ThinkingIndicator } from '@swipergy/swipyui/reasoning';
import { Button } from '@swipergy/swipyui/button';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `<syui-reasoning [duration]="12.4">
  The user is asking about two things at once…
</syui-reasoning>`;

const ACTIVE = `<syui-reasoning [active]="thinking()" autoCollapse>
  {{ reasoningText() }}
</syui-reasoning>`;

const INDICATOR = `<syui-thinking-indicator />
<syui-thinking-indicator label="Searching the docs" />
<syui-thinking-indicator label="Working" [showLabel]="false" />`;

const REASONING_PROPS: PropRow[] = [
  {
    name: 'label',
    type: 'string',
    default: "'Reasoning'",
    description: 'Header text once the reasoning is complete.',
  },
  {
    name: 'activeLabel',
    type: 'string',
    default: "'Thinking…'",
    description: 'Header text while active.',
  },
  {
    name: 'active',
    type: 'boolean',
    default: 'false',
    description: 'True while reasoning tokens are still streaming in; shimmers and reports busy.',
  },
  {
    name: 'duration',
    type: 'number',
    description: 'How long the model reasoned, in seconds. Shown once active turns false.',
  },
  {
    name: 'collapsed',
    type: 'boolean',
    default: 'true',
    description: 'Whether the reasoning is hidden; supports two-way binding.',
  },
  {
    name: 'autoCollapse',
    type: 'boolean',
    default: 'false',
    description: 'Collapses the block automatically when active turns false.',
  },
];

const INDICATOR_PROPS: PropRow[] = [
  {
    name: 'label',
    type: 'string',
    default: "'Thinking…'",
    description: 'Text announced, and shown unless showLabel is false.',
  },
  {
    name: 'showLabel',
    type: 'boolean',
    default: 'true',
    description: 'Renders the label next to the dots; when false it is only announced.',
  },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Reasoning, ThinkingIndicator, Button, DocsSection, DocsPropTable],
  template: `
    <h1>Reasoning</h1>
    <p class="docs-lead">
      A collapsible block for an agent's intermediate reasoning, plus a standalone
      <code>&lt;syui-thinking-indicator&gt;</code> for the moments where there is nothing to show
      yet.
      <code>import {{ '{' }} Reasoning {{ '}' }} from '&#64;swipergy/swipyui/reasoning';</code>
    </p>

    <docs-section title="Basic" [code]="basic" language="html">
      <syui-reasoning [duration]="12.4">
        The user is asking about two things at once: how signals differ from RxJS, and what to use
        for HTTP. I will answer both, starting with the consistency guarantee, because it is the
        part the follow-up depends on.
      </syui-reasoning>
    </docs-section>

    <docs-section
      title="While thinking"
      [code]="active"
      language="html"
      description="The header shimmers while active and the block reports aria-busy. With autoCollapse it folds itself away when the model moves on."
    >
      <syui-reasoning [active]="thinking()" [duration]="8.2" autoCollapse>
        Checking whether the table already exists before proposing the migration…
      </syui-reasoning>
      <syui-button
        [label]="thinking() ? 'Finish thinking' : 'Start thinking'"
        severity="secondary"
        size="small"
        (onClick)="thinking.set(!thinking())"
      />
    </docs-section>

    <docs-section
      title="Thinking indicator"
      [code]="indicator"
      language="html"
      description="A polite status region: the dots are decorative, the label is what gets announced."
    >
      <div class="docs-stack">
        <syui-thinking-indicator />
        <syui-thinking-indicator label="Searching the docs" />
        <syui-thinking-indicator label="Working" [showLabel]="false" />
      </div>
    </docs-section>

    <docs-prop-table title="Reasoning API" [props]="reasoningProps" />
    <docs-prop-table title="ThinkingIndicator API" [props]="indicatorProps" />
  `,
})
export class ReasoningDemo {
  readonly basic = BASIC;
  readonly active = ACTIVE;
  readonly indicator = INDICATOR;
  readonly reasoningProps = REASONING_PROPS;
  readonly indicatorProps = INDICATOR_PROPS;

  readonly thinking = signal(false);
}
