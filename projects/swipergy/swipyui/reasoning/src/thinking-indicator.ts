import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  input,
} from '@angular/core';

/**
 * Standalone "the agent is working" indicator: three pulsing dots with an
 * accessible status message. Use it between sending a prompt and the first
 * streamed token, or next to a long-running step.
 *
 * ```html
 * <syui-thinking-indicator label="Searching the docs" />
 * ```
 */
@Component({
  selector: 'syui-thinking-indicator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './thinking-indicator.css',
  host: {
    class: 'syui-thinking-indicator',
    role: 'status',
    'aria-live': 'polite',
  },
  template: `
    <span class="syui-thinking-indicator-dots" aria-hidden="true">
      <span class="syui-thinking-indicator-dot"></span>
      <span class="syui-thinking-indicator-dot"></span>
      <span class="syui-thinking-indicator-dot"></span>
    </span>
    @if (showLabel()) {
      <span class="syui-thinking-indicator-label">{{ label() }}</span>
    } @else {
      <span class="syui-sr-only">{{ label() }}</span>
    }
  `,
})
export class ThinkingIndicator {
  /** Text announced (and shown, unless `showLabel` is false). */
  readonly label = input('Thinking…');
  /** Renders the label next to the dots; when false it is only announced. */
  readonly showLabel = input(true, { transform: booleanAttribute });
}
