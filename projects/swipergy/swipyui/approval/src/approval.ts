import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  model,
  output,
} from '@angular/core';
import { Button } from '@swipergy/swipyui/button';
import { uniqueId } from '@swipergy/swipyui/core';

export type ApprovalDecision = 'approved' | 'rejected';
export type ApprovalSeverity = 'info' | 'warn' | 'danger';

/**
 * Human-in-the-loop gate for an action an agent wants to take: what it plans
 * to do in the body, approve and reject buttons below. Once a decision is
 * made the buttons are replaced by a status line announcing the outcome, so
 * the card stays in the transcript as a record.
 *
 * ```html
 * <syui-approval
 *   header="Run migration script?"
 *   description="This drops and recreates the orders table."
 *   severity="danger"
 *   [(decision)]="decision"
 *   (onApprove)="run()"
 * >
 *   <pre>npm run db:migrate -- --force</pre>
 * </syui-approval>
 * ```
 */
@Component({
  selector: 'syui-approval',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './approval.css',
  imports: [Button],
  host: {
    class: 'syui-approval',
    role: 'group',
    '[attr.aria-labelledby]': 'headerId',
    '[class.syui-approval-info]': "severity() === 'info'",
    '[class.syui-approval-warn]': "severity() === 'warn'",
    '[class.syui-approval-danger]': "severity() === 'danger'",
    '[class.syui-approval-resolved]': 'decision() !== null',
  },
  template: `
    <div class="syui-approval-header">
      <span class="syui-approval-icon" aria-hidden="true">
        <svg viewBox="0 0 16 16" fill="none">
          <path
            d="M8 2.5L14.5 13.5H1.5L8 2.5Z"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linejoin="round"
          />
          <path d="M8 6.5V9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          <circle cx="8" cy="11.5" r="0.85" fill="currentColor" />
        </svg>
      </span>
      <div class="syui-approval-headings">
        <span class="syui-approval-title" [id]="headerId">{{ header() }}</span>
        @if (description()) {
          <p class="syui-approval-description">{{ description() }}</p>
        }
      </div>
    </div>

    <div class="syui-approval-body">
      <ng-content />
    </div>

    <div class="syui-approval-footer">
      @if (decision(); as resolved) {
        <p class="syui-approval-decision" role="status">
          <span class="syui-approval-decision-icon" aria-hidden="true">
            @if (resolved === 'approved') {
              <svg viewBox="0 0 16 16" fill="none">
                <path
                  d="M3.5 8.5L6.5 11.5L12.5 5"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            } @else {
              <svg viewBox="0 0 16 16" fill="none">
                <path
                  d="M4.5 4.5L11.5 11.5M11.5 4.5L4.5 11.5"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            }
          </span>
          {{ decisionLabel() }}
        </p>
      } @else {
        <ng-content select="[slot=actions]" />
        <syui-button
          severity="secondary"
          variant="outlined"
          size="small"
          [label]="rejectLabel()"
          [disabled]="disabled() || pending()"
          (onClick)="reject()"
        />
        <syui-button
          [severity]="approveSeverity()"
          size="small"
          [label]="approveLabel()"
          [disabled]="disabled()"
          [loading]="pending()"
          (onClick)="approve()"
        />
      }
    </div>
  `,
})
export class Approval {
  /** What the agent is asking permission for. */
  readonly header = input('Action requires approval');
  /** Consequences of approving, in one or two sentences. */
  readonly description = input<string>();
  /** How risky the action is; drives the accent color of the card. */
  readonly severity = input<ApprovalSeverity>('warn');
  /** Label of the approve button. */
  readonly approveLabel = input('Approve');
  /** Label of the reject button. */
  readonly rejectLabel = input('Reject');
  /** Shows a spinner on the approve button while the action is being carried out. */
  readonly pending = input(false, { transform: booleanAttribute });
  /** Disables both buttons, e.g. while the request is no longer actionable. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** The decision taken, or `null` while the request is open; supports two-way binding. */
  readonly decision = model<ApprovalDecision | null>(null);
  /** Status line shown after approving. */
  readonly approvedLabel = input('Approved');
  /** Status line shown after rejecting. */
  readonly rejectedLabel = input('Rejected');

  readonly onApprove = output<void>();
  readonly onReject = output<void>();

  protected readonly headerId = uniqueId('syui-approval-header');

  protected readonly approveSeverity = computed(() =>
    this.severity() === 'danger' ? ('danger' as const) : ('primary' as const),
  );

  protected readonly decisionLabel = computed(() =>
    this.decision() === 'approved' ? this.approvedLabel() : this.rejectedLabel(),
  );

  protected approve(): void {
    if (this.disabled()) {
      return;
    }
    this.decision.set('approved');
    this.onApprove.emit();
  }

  protected reject(): void {
    if (this.disabled() || this.pending()) {
      return;
    }
    this.decision.set('rejected');
    this.onReject.emit();
  }
}
