import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Chat, ChatMessage } from '@swipergy/swipyui/chat';
import { Button } from '@swipergy/swipyui/button';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `<syui-chat style="max-height: 20rem">
  <syui-chat-message role="user">How do signals differ from RxJS?</syui-chat-message>
  <syui-chat-message role="assistant">
    Signals are synchronous and glitch-free…
  </syui-chat-message>
</syui-chat>`;

const PENDING = `<syui-chat-message role="assistant" pending />`;

const PLAIN = `<syui-chat-message role="assistant" variant="plain" author="Agent">
  Full-width answers read better without a bubble around them.
</syui-chat-message>`;

const ACTIONS = `<syui-chat-message role="assistant" [timestamp]="message.at">
  Here is the migration plan.
  <syui-button slot="actions" label="Copy" severity="secondary" variant="text" size="small" />
  <syui-button slot="actions" label="Retry" severity="secondary" variant="text" size="small" />
</syui-chat-message>`;

const AVATAR = `<syui-chat-message role="assistant" author="Swipy">
  <img slot="avatar" src="/logo.svg" alt="" />
  Custom avatars go in the avatar slot.
</syui-chat-message>`;

const SCROLL = `chat = viewChild.required(Chat);

// After appending a message, or when the user clicks "Jump to latest":
this.chat().scrollToBottom();`;

const CHAT_PROPS: PropRow[] = [
  {
    name: 'autoScroll',
    type: 'boolean',
    default: 'true',
    description:
      'Keeps the transcript pinned to the newest content while the user is at the bottom; scrolling up pauses it.',
  },
  {
    name: 'live',
    type: "'polite' | 'off'",
    default: "'polite'",
    description: 'Politeness of the log region wrapping the messages.',
  },
  {
    name: 'ariaLabel',
    type: 'string',
    default: "'Conversation'",
    description: 'Accessible name of the transcript region.',
  },
  {
    name: 'threshold',
    type: 'number',
    default: '48',
    description: 'Distance from the bottom edge, in pixels, still counted as "at bottom".',
  },
  {
    name: 'atBottom',
    type: 'Signal<boolean>',
    description: 'Read-only signal: true while the transcript is scrolled to the bottom.',
  },
  {
    name: 'scrollToBottom()',
    type: '(behavior?: ScrollBehavior) => void',
    description: 'Scrolls the transcript to the newest message and re-pins it.',
  },
];

const MESSAGE_PROPS: PropRow[] = [
  {
    name: 'role',
    type: "'user' | 'assistant' | 'system'",
    default: "'assistant'",
    description: 'Who produced the turn; drives alignment, colors and the default author.',
  },
  {
    name: 'author',
    type: 'string',
    description: 'Display name of the speaker; defaults to "You" / "Assistant" / "System".',
  },
  {
    name: 'avatarImage',
    type: 'string',
    description: 'Image URL for the avatar; falls back to the initials of the author.',
  },
  {
    name: 'timestamp',
    type: 'Date | string | number',
    description: 'When the turn was produced; dates render as a local time, strings verbatim.',
  },
  {
    name: 'pending',
    type: 'boolean',
    default: 'false',
    description: 'Replaces the body with an animated typing indicator.',
  },
  {
    name: 'pendingLabel',
    type: 'string',
    default: "'Assistant is replying'",
    description: 'Announced in place of the typing indicator.',
  },
  {
    name: 'showHeader',
    type: 'boolean',
    default: 'true',
    description: 'Renders the author line; when false the author is still announced.',
  },
  {
    name: 'variant',
    type: "'bubble' | 'plain'",
    default: "'bubble'",
    description: 'Wraps the body in a filled bubble, or renders it flush.',
  },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Chat, ChatMessage, Button, DocsSection, DocsPropTable],
  template: `
    <h1>Chat</h1>
    <p class="docs-lead">
      Scrolling transcript of a conversation with an agent. The messages sit in a live region, so
      streamed replies are announced, and the view stays pinned to the newest turn while the user is
      at the bottom.
      <code>import {{ '{' }} Chat, ChatMessage {{ '}' }} from '&#64;swipergy/swipyui/chat';</code>
    </p>

    <docs-section title="Basic" [code]="basic" language="html">
      <syui-chat style="max-height: 20rem">
        <syui-chat-message role="user">How do signals differ from RxJS?</syui-chat-message>
        <syui-chat-message role="assistant">
          Signals are synchronous and glitch-free: reading one always gives you a value that is
          consistent with every other signal in the graph.
        </syui-chat-message>
        <syui-chat-message role="user">And for HTTP?</syui-chat-message>
        <syui-chat-message role="assistant">
          Keep RxJS for streams over time — <code>httpResource</code> bridges the two.
        </syui-chat-message>
      </syui-chat>
    </docs-section>

    <docs-section
      title="Waiting for a reply"
      [code]="pending"
      language="html"
      description="Between sending the prompt and the first streamed token, the message shows a typing indicator."
    >
      <syui-chat>
        <syui-chat-message role="user">Summarize the release notes.</syui-chat-message>
        <syui-chat-message role="assistant" pending />
      </syui-chat>
    </docs-section>

    <docs-section
      title="Plain variant"
      [code]="plain"
      language="html"
      description="Long answers usually read better without a bubble; user turns keep theirs."
    >
      <syui-chat>
        <syui-chat-message role="user" variant="plain">What changed in 1.5?</syui-chat-message>
        <syui-chat-message role="assistant" variant="plain" author="Agent">
          Eight new entry points for agent interfaces: chat, prompt input, tool calls, reasoning,
          suggestions, steps, approvals and citations.
        </syui-chat-message>
      </syui-chat>
    </docs-section>

    <docs-section
      title="Timestamps and actions"
      [code]="actions"
      language="html"
      description="Content in the actions slot renders below the message body."
    >
      <syui-chat>
        <syui-chat-message role="assistant" [timestamp]="sentAt">
          Here is the migration plan.
          <syui-button
            slot="actions"
            label="Copy"
            severity="secondary"
            variant="text"
            size="small"
          />
          <syui-button
            slot="actions"
            label="Retry"
            severity="secondary"
            variant="text"
            size="small"
          />
        </syui-chat-message>
      </syui-chat>
    </docs-section>

    <docs-section
      title="Custom avatar"
      [code]="avatar"
      language="html"
      description="The avatar slot replaces the generated initials — an image, an icon or a <syui-avatar>."
    >
      <syui-chat>
        <syui-chat-message role="assistant" author="Swipy">
          <span slot="avatar" style="font-size: 1rem">🤖</span>
          Custom avatars go in the avatar slot.
        </syui-chat-message>
      </syui-chat>
    </docs-section>

    <docs-section
      title="Scrolling"
      [code]="scroll"
      language="typescript"
      description="Auto-scrolling pauses as soon as the user scrolls up to read. Read atBottom() to offer a jump-to-latest button, and call scrollToBottom() to return."
    >
      <p class="docs-muted">See the code tab.</p>
    </docs-section>

    <docs-prop-table title="Chat API" [props]="chatProps" />
    <docs-prop-table title="ChatMessage API" [props]="messageProps" />
  `,
})
export class ChatDemo {
  readonly basic = BASIC;
  readonly pending = PENDING;
  readonly plain = PLAIN;
  readonly actions = ACTIONS;
  readonly avatar = AVATAR;
  readonly scroll = SCROLL;
  readonly chatProps = CHAT_PROPS;
  readonly messageProps = MESSAGE_PROPS;
  readonly sentAt = new Date();
}
