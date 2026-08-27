import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
} from '@angular/core';

export type ChatRole = 'user' | 'assistant' | 'system';
export type ChatMessageVariant = 'bubble' | 'plain';

const DEFAULT_AUTHOR: Record<ChatRole, string> = {
  user: 'You',
  assistant: 'Assistant',
  system: 'System',
};

/**
 * A single turn in a `<syui-chat>` transcript: avatar, author, timestamp and
 * the message body. While `pending` is set the body shows an animated typing
 * indicator instead of its content, for the gap between sending a prompt and
 * the first streamed token.
 *
 * The `avatar` slot replaces the built-in initials, the `actions` slot renders
 * controls (copy, retry, …) below the body:
 *
 * ```html
 * <syui-chat-message role="assistant" [timestamp]="message.at">
 *   {{ message.text }}
 *   <syui-button slot="actions" label="Copy" variant="text" size="small" />
 * </syui-chat-message>
 * ```
 */
@Component({
  selector: 'syui-chat-message',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './chat-message.css',
  host: {
    class: 'syui-chat-message',
    '[class.syui-chat-message-user]': "role() === 'user'",
    '[class.syui-chat-message-assistant]': "role() === 'assistant'",
    '[class.syui-chat-message-system]': "role() === 'system'",
    '[class.syui-chat-message-bubble]': "variant() === 'bubble'",
    '[attr.aria-busy]': 'pending() || null',
  },
  template: `
    <div class="syui-chat-message-avatar" aria-hidden="true">
      <ng-content select="[slot=avatar]">
        @if (avatarImage()) {
          <img class="syui-chat-message-avatar-image" [src]="avatarImage()" alt="" />
        } @else {
          <span class="syui-chat-message-avatar-label">{{ initials() }}</span>
        }
      </ng-content>
    </div>
    <div class="syui-chat-message-body">
      @if (showHeader()) {
        <div class="syui-chat-message-header">
          <span class="syui-chat-message-author">{{ authorName() }}</span>
          @if (formattedTimestamp(); as time) {
            <time class="syui-chat-message-time" [attr.datetime]="isoTimestamp()">{{ time }}</time>
          }
        </div>
      } @else {
        <span class="syui-sr-only">{{ authorName() }}</span>
      }
      <div class="syui-chat-message-content">
        @if (pending()) {
          <span class="syui-chat-message-typing" role="status">
            <span class="syui-sr-only">{{ pendingLabel() }}</span>
            <span class="syui-chat-message-dot" aria-hidden="true"></span>
            <span class="syui-chat-message-dot" aria-hidden="true"></span>
            <span class="syui-chat-message-dot" aria-hidden="true"></span>
          </span>
        } @else {
          <ng-content />
        }
      </div>
      <div class="syui-chat-message-actions">
        <ng-content select="[slot=actions]" />
      </div>
    </div>
  `,
})
export class ChatMessage {
  /** Who produced the turn; drives alignment, colors and the default author. */
  readonly role = input<ChatRole>('assistant');
  /** Display name of the speaker; defaults to "You" / "Assistant" / "System". */
  readonly author = input<string>();
  /** Image URL for the avatar; falls back to the initials of the author. */
  readonly avatarImage = input<string>();
  /** When the turn was produced; rendered as a local time next to the author. */
  readonly timestamp = input<Date | string | number>();
  /** Shows the typing indicator instead of the body, e.g. while waiting for the first token. */
  readonly pending = input(false, { transform: booleanAttribute });
  /** Announced in place of the typing indicator. */
  readonly pendingLabel = input('Assistant is replying');
  /** Renders the author line; when false the author is still announced. */
  readonly showHeader = input(true, { transform: booleanAttribute });
  /** `bubble` wraps the body in a filled bubble, `plain` renders it flush. */
  readonly variant = input<ChatMessageVariant>('bubble');

  /** Author name shown in the header and announced to assistive technology. */
  protected readonly authorName = computed(() => this.author() || DEFAULT_AUTHOR[this.role()]);

  /** Up to two initials of the author, used when no avatar image is set. */
  protected readonly initials = computed(() =>
    this.authorName()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]!.toUpperCase())
      .join(''),
  );

  private readonly date = computed(() => {
    const value = this.timestamp();
    if (value === undefined) {
      return null;
    }
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  });

  protected readonly formattedTimestamp = computed(() => {
    const date = this.date();
    if (!date) {
      // Strings that aren't parseable dates are shown verbatim, e.g. "just now".
      const value = this.timestamp();
      return typeof value === 'string' ? value : null;
    }
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  });

  protected readonly isoTimestamp = computed(() => this.date()?.toISOString() ?? null);
}
