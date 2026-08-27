import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  output,
  signal,
} from '@angular/core';

export type MessageSeverity = 'success' | 'info' | 'warn' | 'error' | 'secondary';

/**
 * Inline static message with a severity icon and colored background.
 * Announced as `role="alert"` for error/warn severities and `role="status"`
 * otherwise. Content comes from the `text` input or projection:
 *
 * ```html
 * <syui-message severity="success" text="Profile saved." />
 * <syui-message severity="error" closable (onClose)="dismissed()">
 *   Something went <strong>wrong</strong>.
 * </syui-message>
 * ```
 */
@Component({
  selector: 'syui-message',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './message.css',
  host: {
    class: 'syui-message',
    '[class.syui-message-success]': "severity() === 'success'",
    '[class.syui-message-info]': "severity() === 'info'",
    '[class.syui-message-warn]': "severity() === 'warn'",
    '[class.syui-message-error]': "severity() === 'error'",
    '[class.syui-message-secondary]': "severity() === 'secondary'",
    '[class.syui-message-small]': "size() === 'small'",
    '[class.syui-message-large]': "size() === 'large'",
    '[class.syui-message-hidden]': '!visible()',
    '[attr.role]': 'role()',
  },
  template: `
    @if (visible()) {
      <svg
        class="syui-message-icon"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        @switch (severity()) {
          @case ('success') {
            <path d="M3 8.5L6.5 12L13 4.5" />
          }
          @case ('warn') {
            <path d="M8 2.5L14.75 13.5H1.25L8 2.5Z" />
            <path d="M8 6.5V9.5" />
            <path d="M8 11.75V11.751" />
          }
          @case ('error') {
            <circle cx="8" cy="8" r="6.25" />
            <path d="M5.75 5.75L10.25 10.25M10.25 5.75L5.75 10.25" />
          }
          @default {
            <circle cx="8" cy="8" r="6.25" />
            <path d="M8 7.25V11" />
            <path d="M8 5V5.001" />
          }
        }
      </svg>
      <div class="syui-message-text">
        @if (text()) {
          {{ text() }}
        }
        <ng-content />
      </div>
      @if (closable()) {
        <button type="button" class="syui-message-close" aria-label="Close" (click)="close()">
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            aria-hidden="true"
          >
            <path d="M4 4L12 12M12 4L4 12" />
          </svg>
        </button>
      }
    }
  `,
})
export class Message {
  /** Visual and semantic tone of the message. */
  readonly severity = input<MessageSeverity>('info');
  /** Message text; alternatively project arbitrary content. */
  readonly text = input<string>();
  /** Shows a close button that hides the message. */
  readonly closable = input(false, { transform: booleanAttribute });
  /** Density variant; `null` is the default size. */
  readonly size = input<'small' | 'large' | null>(null);

  /** Emitted when the message is dismissed via the close button. */
  readonly onClose = output<void>();

  protected readonly visible = signal(true);

  protected readonly role = computed(() =>
    this.severity() === 'error' || this.severity() === 'warn' ? 'alert' : 'status',
  );

  protected close(): void {
    this.visible.set(false);
    this.onClose.emit();
  }
}
