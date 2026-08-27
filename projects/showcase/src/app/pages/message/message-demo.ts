import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Message } from '@swipergy/swipyui/message';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const SEVERITIES = `<syui-message severity="success" text="Changes saved." />
<syui-message severity="info" text="A new version is available." />
<syui-message severity="warn" text="Your trial expires in 3 days." />
<syui-message severity="error" text="Payment could not be processed." />
<syui-message severity="secondary" text="Archived conversations are read-only." />`;

const CLOSABLE = `<syui-message severity="info" closable (onClose)="dismissed()">
  Click the X to dismiss this message.
</syui-message>`;

const SIZES = `<syui-message severity="success" size="small" text="Small message" />
<syui-message severity="success" text="Default message" />
<syui-message severity="success" size="large" text="Large message" />`;

const PROPS: PropRow[] = [
  {
    name: 'severity',
    type: "'success' | 'info' | 'warn' | 'error' | 'secondary'",
    default: "'info'",
    description: 'Visual and semantic tone; error/warn render with role="alert".',
  },
  {
    name: 'text',
    type: 'string',
    description: 'Message text; alternatively project arbitrary content.',
  },
  {
    name: 'closable',
    type: 'boolean',
    default: 'false',
    description: 'Shows a close button that hides the message.',
  },
  {
    name: 'size',
    type: "'small' | 'large' | null",
    default: 'null',
    description: 'Density variant; null is the default size.',
  },
  {
    name: 'onClose',
    type: 'output<void>',
    description: 'Emitted when the message is dismissed via the close button.',
  },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Message, DocsSection, DocsPropTable],
  template: `
    <h1>Message</h1>
    <p class="docs-lead">
      Inline static message with a severity icon and colored background, announced politely as a
      status or assertively as an alert.
      <code>import {{ '{' }} Message {{ '}' }} from '&#64;swipergy/swipyui/message';</code>
    </p>

    <docs-section title="Severities" [code]="severities">
      <div class="demo-stack">
        <syui-message severity="success" text="Changes saved." />
        <syui-message severity="info" text="A new version is available." />
        <syui-message severity="warn" text="Your trial expires in 3 days." />
        <syui-message severity="error" text="Payment could not be processed." />
        <syui-message severity="secondary" text="Archived conversations are read-only." />
      </div>
    </docs-section>

    <docs-section
      title="Closable"
      [code]="closable"
      description="The close button hides the message and emits onClose. Content can also be projected instead of using the text input."
    >
      <syui-message severity="info" closable>Click the X to dismiss this message.</syui-message>
    </docs-section>

    <docs-section title="Sizes" [code]="sizes">
      <div class="demo-stack">
        <syui-message severity="success" size="small" text="Small message" />
        <syui-message severity="success" text="Default message" />
        <syui-message severity="success" size="large" text="Large message" />
      </div>
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
  styles: `
    .demo-stack {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      width: 100%;
    }
  `,
})
export class MessageDemo {
  readonly severities = SEVERITIES;
  readonly closable = CLOSABLE;
  readonly sizes = SIZES;
  readonly props = PROPS;
}
