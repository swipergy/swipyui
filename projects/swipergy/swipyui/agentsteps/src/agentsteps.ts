import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  TemplateRef,
  ViewEncapsulation,
  booleanAttribute,
  contentChild,
  inject,
  input,
} from '@angular/core';

export type AgentStepStatus = 'pending' | 'active' | 'done' | 'error' | 'skipped';

export interface AgentStep {
  /** Short name of the step. */
  label: string;
  /** Supporting line below the label, e.g. what the step produced. */
  description?: string;
  /** Progress of the step; defaults to `pending`. */
  status?: AgentStepStatus;
}

const STATUS_TEXT: Record<AgentStepStatus, string> = {
  pending: 'Not started',
  active: 'In progress',
  done: 'Completed',
  error: 'Failed',
  skipped: 'Skipped',
};

/**
 * Marks the `ng-template` rendered as the body of each `<syui-agent-steps>`
 * step, below its label. Context: `$implicit` step, `index`.
 */
@Directive({ selector: 'ng-template[syuiAgentStepContent]' })
export class AgentStepContent {
  readonly template = inject(TemplateRef);
}

/**
 * The plan an agent is working through, as an ordered list of steps with a
 * marker per status. Updates are announced politely, so the user hears the
 * agent advance without watching the screen.
 *
 * ```html
 * <syui-agent-steps [steps]="plan()">
 *   <ng-template syuiAgentStepContent let-step>
 *     <syui-tool-call [name]="step.tool" [status]="step.toolStatus" />
 *   </ng-template>
 * </syui-agent-steps>
 * ```
 */
@Component({
  selector: 'syui-agent-steps',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './agentsteps.css',
  imports: [NgTemplateOutlet],
  host: {
    class: 'syui-agent-steps',
  },
  template: `
    <ol
      class="syui-agent-steps-list"
      [attr.aria-label]="ariaLabel()"
      [attr.aria-live]="live()"
      [attr.aria-busy]="busy() || null"
    >
      @for (step of steps(); track $index; let last = $last) {
        <li
          class="syui-agent-steps-step"
          [class.syui-agent-steps-pending]="statusOf(step) === 'pending'"
          [class.syui-agent-steps-active]="statusOf(step) === 'active'"
          [class.syui-agent-steps-done]="statusOf(step) === 'done'"
          [class.syui-agent-steps-error]="statusOf(step) === 'error'"
          [class.syui-agent-steps-skipped]="statusOf(step) === 'skipped'"
        >
          <div class="syui-agent-steps-separator">
            <span class="syui-agent-steps-marker" aria-hidden="true">
              @switch (statusOf(step)) {
                @case ('active') {
                  <svg class="syui-agent-steps-spinner" viewBox="0 0 16 16" fill="none">
                    <circle
                      cx="8"
                      cy="8"
                      r="6"
                      stroke="currentColor"
                      stroke-width="2"
                      opacity="0.25"
                    />
                    <path
                      d="M14 8a6 6 0 0 0-6-6"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                    />
                  </svg>
                }
                @case ('done') {
                  <svg viewBox="0 0 16 16" fill="none">
                    <path
                      d="M3.5 8.5L6.5 11.5L12.5 5"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                }
                @case ('error') {
                  <svg viewBox="0 0 16 16" fill="none">
                    <path
                      d="M4.5 4.5L11.5 11.5M11.5 4.5L4.5 11.5"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                    />
                  </svg>
                }
                @case ('skipped') {
                  <svg viewBox="0 0 16 16" fill="none">
                    <path
                      d="M4 8h8"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                    />
                  </svg>
                }
                @default {
                  <svg viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="4" stroke="currentColor" stroke-width="1.75" />
                  </svg>
                }
              }
            </span>
            @if (!last) {
              <span class="syui-agent-steps-connector" aria-hidden="true"></span>
            }
          </div>
          <div class="syui-agent-steps-content">
            <span class="syui-agent-steps-label">
              {{ step.label }}
              <span class="syui-sr-only">— {{ statusText(step) }}</span>
            </span>
            @if (step.description) {
              <span class="syui-agent-steps-description">{{ step.description }}</span>
            }
            @if (contentTemplate()?.template; as template) {
              <div class="syui-agent-steps-detail">
                <ng-container
                  [ngTemplateOutlet]="template"
                  [ngTemplateOutletContext]="{ $implicit: step, index: $index }"
                />
              </div>
            }
          </div>
        </li>
      }
    </ol>
  `,
})
export class AgentSteps {
  /** The plan, in execution order. */
  readonly steps = input.required<readonly AgentStep[]>();
  /** Accessible name of the step list. */
  readonly ariaLabel = input('Agent progress');
  /**
   * Politeness of the step list. Set to `off` when progress is announced
   * elsewhere, e.g. by the surrounding chat log.
   */
  readonly live = input<'polite' | 'off'>('polite');
  /** Marks the list busy while the agent is still working through it. */
  readonly busy = input(false, { transform: booleanAttribute });

  protected readonly contentTemplate = contentChild(AgentStepContent);

  protected statusOf(step: AgentStep): AgentStepStatus {
    return step.status ?? 'pending';
  }

  protected statusText(step: AgentStep): string {
    return STATUS_TEXT[this.statusOf(step)];
  }
}
