import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { PromptInput } from '@swipergy/swipyui/promptinput';
import { Button } from '@swipergy/swipyui/button';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `<syui-prompt-input [(value)]="draft" (onSubmit)="send($event)" />`;

const STREAMING = `<syui-prompt-input
  [(value)]="draft"
  [loading]="streaming()"
  (onSubmit)="send($event)"
  (onStop)="abort()"
/>`;

const TOOLBAR = `<syui-prompt-input [(value)]="draft" placeholder="Describe the change…">
  <syui-button slot="toolbar" label="Attach" severity="secondary" variant="text" size="small" />
  <syui-button slot="toolbar" label="Model: Opus" severity="secondary" variant="text" size="small" />
</syui-prompt-input>`;

const COUNTER = `<syui-prompt-input [(value)]="draft" [maxLength]="200" showCounter />`;

const PROPS: PropRow[] = [
  {
    name: 'value',
    type: 'string',
    default: "''",
    description: 'Current draft; supports two-way binding.',
  },
  {
    name: 'placeholder',
    type: 'string',
    default: "'Ask anything…'",
    description: 'Placeholder of the textarea.',
  },
  {
    name: 'loading',
    type: 'boolean',
    default: 'false',
    description: 'Swaps the send button for a stop button while a reply streams in.',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Disables the composer.',
  },
  {
    name: 'minRows',
    type: 'number',
    default: '1',
    description: 'Rows the empty textarea starts at.',
  },
  {
    name: 'maxRows',
    type: 'number',
    default: '8',
    description: 'Rows the textarea grows to before it starts scrolling.',
  },
  {
    name: 'submitOnEnter',
    type: 'boolean',
    default: 'true',
    description: 'Enter submits; Shift+Enter always inserts a newline.',
  },
  {
    name: 'clearOnSubmit',
    type: 'boolean',
    default: 'true',
    description: 'Clears the draft after a successful submit.',
  },
  {
    name: 'maxLength',
    type: 'number',
    description: "Hard limit on the draft length, mirrored to the textarea's maxlength.",
  },
  {
    name: 'showCounter',
    type: 'boolean',
    default: 'false',
    description: 'Shows a character counter; requires maxLength.',
  },
  {
    name: 'sendLabel',
    type: 'string',
    default: "'Send message'",
    description: 'Accessible name of the send button.',
  },
  {
    name: 'stopLabel',
    type: 'string',
    default: "'Stop generating'",
    description: 'Accessible name of the stop button.',
  },
  {
    name: 'ariaLabel',
    type: 'string',
    default: "'Message'",
    description: 'Accessible name of the textarea.',
  },
  {
    name: 'onSubmit',
    type: 'EventEmitter<string>',
    description: 'Emits the trimmed draft when the user submits.',
  },
  {
    name: 'onStop',
    type: 'EventEmitter<void>',
    description: 'Emits when the user interrupts a streaming reply.',
  },
  {
    name: 'focus()',
    type: '() => void',
    description: 'Moves focus into the textarea.',
  },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PromptInput, Button, DocsSection, DocsPropTable],
  template: `
    <h1>PromptInput</h1>
    <p class="docs-lead">
      Composer for agent prompts: the textarea grows with its content, Enter submits, Shift+Enter
      inserts a newline, and the send button turns into a stop button while a reply streams in.
      <code>import {{ '{' }} PromptInput {{ '}' }} from '&#64;swipergy/swipyui/promptinput';</code>
    </p>

    <docs-section title="Basic" [code]="basic" language="html">
      <syui-prompt-input [(value)]="draft" (onSubmit)="send($event)" />
      @if (sent(); as message) {
        <p class="docs-muted">Sent: “{{ message }}”</p>
      }
    </docs-section>

    <docs-section
      title="Streaming"
      [code]="streaming"
      language="html"
      description="While loading, the send button becomes a stop button that emits onStop. Submitting here starts a two-second fake stream."
    >
      <syui-prompt-input
        [(value)]="streamDraft"
        [loading]="isStreaming()"
        (onSubmit)="startStream()"
        (onStop)="stopStream()"
      />
      <p class="docs-muted">{{ streamStatus() }}</p>
    </docs-section>

    <docs-section
      title="Toolbar"
      [code]="toolbar"
      language="html"
      description="The toolbar slot holds controls left of the send button; attachments render above the textarea."
    >
      <syui-prompt-input [(value)]="toolbarDraft" placeholder="Describe the change…">
        <syui-button
          slot="toolbar"
          label="Attach"
          severity="secondary"
          variant="text"
          size="small"
        />
        <syui-button
          slot="toolbar"
          label="Model: Opus"
          severity="secondary"
          variant="text"
          size="small"
        />
      </syui-prompt-input>
    </docs-section>

    <docs-section
      title="Character limit"
      [code]="counter"
      language="html"
      description="The counter is wired to the textarea with aria-describedby, so screen reader users hear the remaining budget."
    >
      <syui-prompt-input [(value)]="limitedDraft" [maxLength]="200" showCounter />
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
})
export class PromptInputDemo {
  readonly basic = BASIC;
  readonly streaming = STREAMING;
  readonly toolbar = TOOLBAR;
  readonly counter = COUNTER;
  readonly props = PROPS;

  readonly draft = signal('');
  readonly sent = signal<string | null>(null);
  readonly streamDraft = signal('');
  readonly toolbarDraft = signal('');
  readonly limitedDraft = signal('');
  readonly isStreaming = signal(false);
  readonly streamStatus = signal('Idle.');

  private timer?: ReturnType<typeof setTimeout>;

  send(message: string): void {
    this.sent.set(message);
  }

  startStream(): void {
    this.isStreaming.set(true);
    this.streamStatus.set('Replying…');
    this.timer = setTimeout(() => {
      this.isStreaming.set(false);
      this.streamStatus.set('Done.');
    }, 2000);
  }

  stopStream(): void {
    clearTimeout(this.timer);
    this.isStreaming.set(false);
    this.streamStatus.set('Stopped by the user.');
  }
}
