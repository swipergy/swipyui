import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Approval, ApprovalDecision } from '@swipergy/swipyui/approval';
import { Button } from '@swipergy/swipyui/button';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `<syui-approval
  header="Run the migration script?"
  description="This drops and recreates the orders table."
  severity="danger"
  [(decision)]="decision"
  (onApprove)="run()"
  (onReject)="skip()"
>
  <pre>npm run db:migrate -- --force</pre>
</syui-approval>`;

const SEVERITY = `<syui-approval severity="info" header="Read package.json?" />
<syui-approval severity="warn" header="Write to src/app.ts?" />
<syui-approval severity="danger" header="Delete the staging database?" />`;

const PENDING = `<syui-approval header="Deploy to production?" [pending]="deploying()" (onApprove)="deploy()" />`;

const RESOLVED = `<syui-approval header="Send the summary email?" decision="approved" />`;

const PROPS: PropRow[] = [
  {
    name: 'header',
    type: 'string',
    default: "'Action requires approval'",
    description: 'What the agent is asking permission for.',
  },
  {
    name: 'description',
    type: 'string',
    description: 'Consequences of approving, in one or two sentences.',
  },
  {
    name: 'severity',
    type: "'info' | 'warn' | 'danger'",
    default: "'warn'",
    description: 'How risky the action is; accents the card and escalates the approve button.',
  },
  {
    name: 'approveLabel',
    type: 'string',
    default: "'Approve'",
    description: 'Approve button label.',
  },
  { name: 'rejectLabel', type: 'string', default: "'Reject'", description: 'Reject button label.' },
  {
    name: 'pending',
    type: 'boolean',
    default: 'false',
    description: 'Shows a spinner on the approve button while the action is carried out.',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Disables both buttons, e.g. once the request is no longer actionable.',
  },
  {
    name: 'decision',
    type: "'approved' | 'rejected' | null",
    default: 'null',
    description:
      'The decision taken; supports two-way binding. Once set, the buttons give way to a status line.',
  },
  {
    name: 'approvedLabel',
    type: 'string',
    default: "'Approved'",
    description: 'Status line shown after approving.',
  },
  {
    name: 'rejectedLabel',
    type: 'string',
    default: "'Rejected'",
    description: 'Status line shown after rejecting.',
  },
  { name: 'onApprove', type: 'EventEmitter<void>', description: 'Emits when the user approves.' },
  { name: 'onReject', type: 'EventEmitter<void>', description: 'Emits when the user rejects.' },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Approval, Button, DocsSection, DocsPropTable],
  template: `
    <h1>Approval</h1>
    <p class="docs-lead">
      Human-in-the-loop gate for an action an agent wants to take. Once a decision is made the
      buttons give way to a status line, so the card stays in the transcript as a record of what was
      agreed.
      <code>import {{ '{' }} Approval {{ '}' }} from '&#64;swipergy/swipyui/approval';</code>
    </p>

    <docs-section title="Basic" [code]="basic" language="html">
      <syui-approval
        header="Run the migration script?"
        description="This drops and recreates the orders table."
        severity="danger"
        [(decision)]="decision"
      >
        <pre>npm run db:migrate -- --force</pre>
      </syui-approval>
      <syui-button
        label="Reset"
        severity="secondary"
        variant="text"
        size="small"
        (onClick)="decision.set(null)"
      />
    </docs-section>

    <docs-section
      title="Severity"
      [code]="severity"
      language="html"
      description="The accent tracks the risk; danger also turns the approve button red."
    >
      <div class="docs-stack">
        <syui-approval severity="info" header="Read package.json?" />
        <syui-approval severity="warn" header="Write to src/app.ts?" />
        <syui-approval severity="danger" header="Delete the staging database?" />
      </div>
    </docs-section>

    <docs-section
      title="While the action runs"
      [code]="pending"
      language="html"
      description="Approving here starts a two-second fake deploy: the approve button spins and rejecting is blocked."
    >
      <syui-approval
        header="Deploy to production?"
        description="Publishes the current build to www.swipergy.com."
        [pending]="deploying()"
        [(decision)]="deployDecision"
        (onApprove)="deploy()"
      />
    </docs-section>

    <docs-section
      title="Already decided"
      [code]="resolved"
      language="html"
      description="Passing a decision up front renders the record without ever showing the buttons."
    >
      <syui-approval header="Send the summary email?" decision="approved" />
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
})
export class ApprovalDemo {
  readonly basic = BASIC;
  readonly severity = SEVERITY;
  readonly pending = PENDING;
  readonly resolved = RESOLVED;
  readonly props = PROPS;

  readonly decision = signal<ApprovalDecision | null>(null);
  readonly deployDecision = signal<ApprovalDecision | null>(null);
  readonly deploying = signal(false);

  deploy(): void {
    this.deploying.set(true);
    setTimeout(() => this.deploying.set(false), 2000);
  }
}
