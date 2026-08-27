import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  model,
} from '@angular/core';
import { uniqueId } from '@swipergy/swipyui/core';

export type ToolCallStatus = 'pending' | 'running' | 'success' | 'error';

const STATUS_TEXT: Record<ToolCallStatus, string> = {
  pending: 'Queued',
  running: 'Running',
  success: 'Completed',
  error: 'Failed',
};

/**
 * Disclosure for a single tool invocation made by an agent: the tool name and
 * its status in the header, arguments and result in the collapsible body.
 * The status is carried by an icon and by text, never by color alone.
 *
 * ```html
 * <syui-tool-call name="search_docs" status="success" [duration]="820">
 *   <pre>{{ call.result }}</pre>
 *   <syui-button slot="actions" label="Retry" variant="text" size="small" />
 * </syui-tool-call>
 * ```
 */
@Component({
  selector: 'syui-tool-call',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './toolcall.css',
  imports: [NgTemplateOutlet],
  host: {
    class: 'syui-tool-call',
    '[class.syui-tool-call-collapsed]': 'collapsible() && collapsed()',
    '[class.syui-tool-call-pending]': "status() === 'pending'",
    '[class.syui-tool-call-running]': "status() === 'running'",
    '[class.syui-tool-call-success]': "status() === 'success'",
    '[class.syui-tool-call-error]': "status() === 'error'",
    '[attr.aria-busy]': "status() === 'running' || null",
  },
  template: `
    <div class="syui-tool-call-header">
      @if (collapsible()) {
        <button
          type="button"
          class="syui-tool-call-toggle"
          [attr.aria-expanded]="!collapsed()"
          [attr.aria-controls]="collapsed() ? null : bodyId"
          (click)="collapsed.set(!collapsed())"
        >
          <ng-container [ngTemplateOutlet]="summary" />
          <svg class="syui-tool-call-chevron" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path
              d="M2.5 4.5L6 8L9.5 4.5"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      } @else {
        <div class="syui-tool-call-toggle syui-tool-call-static">
          <ng-container [ngTemplateOutlet]="summary" />
        </div>
      }
      <div class="syui-tool-call-actions">
        <ng-content select="[slot=actions]" />
      </div>
    </div>

    @if (!collapsible() || !collapsed()) {
      <div class="syui-tool-call-body" [id]="bodyId">
        <ng-content />
      </div>
    }

    <ng-template #summary>
      <span class="syui-tool-call-icon" aria-hidden="true">
        @switch (status()) {
          @case ('running') {
            <svg class="syui-tool-call-spinner" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="2" opacity="0.25" />
              <path
                d="M14 8a6 6 0 0 0-6-6"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          }
          @case ('success') {
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
          @default {
            <svg viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="5.5" stroke="currentColor" stroke-width="1.75" />
            </svg>
          }
        }
      </span>
      <span class="syui-tool-call-name">{{ name() }}</span>
      @if (description()) {
        <span class="syui-tool-call-description">{{ description() }}</span>
      }
      <span class="syui-sr-only">{{ statusText() }}</span>
      @if (formattedDuration(); as duration) {
        <span class="syui-tool-call-duration">{{ duration }}</span>
      }
    </ng-template>
  `,
})
export class ToolCall {
  /** Name of the invoked tool, shown in the header. */
  readonly name = input.required<string>();
  /** Lifecycle of the call; drives the icon, the color and the announced status. */
  readonly status = input<ToolCallStatus>('pending');
  /** Short summary of the call, e.g. its primary argument. */
  readonly description = input<string>();
  /** Wall-clock duration of the call in milliseconds. */
  readonly duration = input<number>();
  /** Whether the body is hidden; supports two-way binding. */
  readonly collapsed = model(true);
  /** Renders the header as a disclosure button. When false the body is always shown. */
  readonly collapsible = input(true, { transform: booleanAttribute });
  /** Overrides the text announced for the current status. */
  readonly statusLabel = input<string>();

  protected readonly bodyId = uniqueId('syui-tool-call-body');

  /** Status wording announced to assistive technology next to the tool name. */
  protected readonly statusText = computed(() => this.statusLabel() ?? STATUS_TEXT[this.status()]);

  protected readonly formattedDuration = computed(() => {
    const ms = this.duration();
    if (ms === undefined || Number.isNaN(ms)) {
      return null;
    }
    return ms < 1000 ? `${Math.round(ms)} ms` : `${(ms / 1000).toFixed(1)} s`;
  });
}
