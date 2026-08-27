import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Textarea } from '@swipergy/swipyui/textarea';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `<textarea syuiTextarea rows="3" placeholder="Your message"></textarea>`;
const AUTORESIZE = `<textarea syuiTextarea autoResize rows="2"
  placeholder="Grows with content"></textarea>`;

const PROPS: PropRow[] = [
  {
    name: 'autoResize',
    type: 'boolean',
    default: 'false',
    description: 'Grows the textarea with its content instead of scrolling.',
  },
  {
    name: 'fluid',
    type: 'boolean',
    default: 'false',
    description: 'Stretches the textarea to the width of its container.',
  },
  {
    name: 'invalid',
    type: 'boolean',
    default: 'false',
    description: 'Applies the invalid (error) style.',
  },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Textarea, DocsSection, DocsPropTable],
  template: `
    <h1>Textarea</h1>
    <p class="docs-lead">
      A directive that styles native textareas, with optional auto-resize.
      <code>import {{ '{' }} Textarea {{ '}' }} from '&#64;swipergy/swipyui/textarea';</code>
    </p>

    <docs-section title="Basic" [code]="basic">
      <textarea syuiTextarea rows="3" placeholder="Your message"></textarea>
    </docs-section>

    <docs-section title="Auto resize" [code]="autoResize">
      <textarea syuiTextarea autoResize rows="2" placeholder="Grows with content"></textarea>
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
})
export class TextareaDemo {
  readonly basic = BASIC;
  readonly autoResize = AUTORESIZE;
  readonly props = PROPS;
}
