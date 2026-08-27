import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { AgentStep, AgentStepContent, AgentSteps } from '@swipergy/swipyui/agentsteps';
import { ToolCall } from '@swipergy/swipyui/toolcall';
import { Button } from '@swipergy/swipyui/button';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `steps = [
  { label: 'Read the issue', status: 'done' },
  { label: 'Search the codebase', status: 'active', description: 'grep for the assertion' },
  { label: 'Write the fix' },
];

<syui-agent-steps [steps]="steps" />`;

const STATUS = `<syui-agent-steps [steps]="[
  { label: 'Clone the repo', status: 'done' },
  { label: 'Install dependencies', status: 'skipped', description: 'cache hit' },
  { label: 'Run the suite', status: 'error', description: '2 specs failing' },
  { label: 'Open a pull request', status: 'pending' },
]" />`;

const TEMPLATE = `<syui-agent-steps [steps]="steps">
  <ng-template syuiAgentStepContent let-step>
    @if (step.tool) {
      <syui-tool-call [name]="step.tool" [status]="step.toolStatus" />
    }
  </ng-template>
</syui-agent-steps>`;

const PROPS: PropRow[] = [
  { name: 'steps', type: 'AgentStep[]', description: 'The plan, in execution order.' },
  {
    name: 'ariaLabel',
    type: 'string',
    default: "'Agent progress'",
    description: 'Accessible name of the step list.',
  },
  {
    name: 'live',
    type: "'polite' | 'off'",
    default: "'polite'",
    description: 'Politeness of the step list; set to off when progress is announced elsewhere.',
  },
  {
    name: 'busy',
    type: 'boolean',
    default: 'false',
    description: 'Marks the list busy while the agent is still working through it.',
  },
  {
    name: 'syuiAgentStepContent',
    type: 'ng-template',
    description: 'Body rendered below each step label. Context: $implicit step, index.',
  },
];

interface PlanStep extends AgentStep {
  tool?: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AgentSteps, AgentStepContent, ToolCall, Button, DocsSection, DocsPropTable],
  template: `
    <h1>AgentSteps</h1>
    <p class="docs-lead">
      The plan an agent is working through, as an ordered list with a marker per status. Updates are
      announced politely, so progress is audible without watching the screen.
      <code>import {{ '{' }} AgentSteps {{ '}' }} from '&#64;swipergy/swipyui/agentsteps';</code>
    </p>

    <docs-section title="Basic" [code]="basic" language="html">
      <syui-agent-steps [steps]="steps()" [busy]="running()" />
      <syui-button
        [label]="running() ? 'Reset' : 'Advance'"
        severity="secondary"
        size="small"
        (onClick)="advance()"
      />
    </docs-section>

    <docs-section
      title="Statuses"
      [code]="status"
      language="html"
      description="Done, skipped, failed and not-yet-started each get their own marker, plus wording that screen readers announce."
    >
      <syui-agent-steps [steps]="allStatuses" live="off" />
    </docs-section>

    <docs-section
      title="Step content"
      [code]="template"
      language="html"
      description="The syuiAgentStepContent template renders below each label — tool calls, diffs, whatever the step produced."
    >
      <syui-agent-steps [steps]="planSteps" live="off">
        <ng-template syuiAgentStepContent let-step>
          @if (step.tool) {
            <syui-tool-call [name]="step.tool" status="success" [duration]="640" />
          }
        </ng-template>
      </syui-agent-steps>
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
})
export class AgentStepsDemo {
  readonly basic = BASIC;
  readonly status = STATUS;
  readonly template = TEMPLATE;
  readonly props = PROPS;

  readonly allStatuses: AgentStep[] = [
    { label: 'Clone the repo', status: 'done' },
    { label: 'Install dependencies', status: 'skipped', description: 'cache hit' },
    { label: 'Run the suite', status: 'error', description: '2 specs failing' },
    { label: 'Open a pull request', status: 'pending' },
  ];

  readonly planSteps: PlanStep[] = [
    { label: 'Locate the component', status: 'done', tool: 'search_files' },
    { label: 'Apply the patch', status: 'done', tool: 'apply_patch' },
    { label: 'Re-run the specs', status: 'active' },
  ];

  private readonly plan: AgentStep[] = [
    { label: 'Read the issue' },
    { label: 'Search the codebase', description: 'grep for the failing assertion' },
    { label: 'Write the fix' },
  ];

  private readonly activeIndex = signal(1);
  readonly running = signal(false);

  readonly steps = signal<AgentStep[]>(this.withProgress(1));

  advance(): void {
    const next = this.activeIndex() + 1;
    const wrapped = next > this.plan.length;
    this.activeIndex.set(wrapped ? 1 : next);
    this.running.set(!wrapped);
    this.steps.set(this.withProgress(this.activeIndex()));
  }

  private withProgress(active: number): AgentStep[] {
    return this.plan.map((step, i) => ({
      ...step,
      status: i + 1 < active ? 'done' : i + 1 === active ? 'active' : 'pending',
    }));
  }
}
