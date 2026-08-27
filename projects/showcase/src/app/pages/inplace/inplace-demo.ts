import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Inplace } from '@swipergy/swipyui/inplace';
import { InputText } from '@swipergy/swipyui/inputtext';
import { FormsModule } from '@angular/forms';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const EDIT = `<syui-inplace closable>
  <span syui-inplace-display>{{ name() || 'Click to edit' }}</span>
  <span syui-inplace-content>
    <input syuiInputText [(ngModel)]="name" placeholder="Enter a name" />
  </span>
</syui-inplace>`;

const IMAGE = `<syui-inplace>
  <span syui-inplace-display>Show the photo</span>
  <span syui-inplace-content>
    <img src="https://picsum.photos/id/1024/320/200" alt="Bald eagle" width="320" />
  </span>
</syui-inplace>`;

const PROPS: PropRow[] = [
  {
    name: 'active',
    type: 'model<boolean>',
    default: 'false',
    description: 'Whether the content slot is shown; supports [(active)] two-way binding.',
  },
  {
    name: 'closable',
    type: 'boolean',
    default: 'false',
    description: 'Renders a close button next to the content that deactivates it.',
  },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Prevents activation.' },
  { name: 'onActivate', type: 'output<void>', description: 'Emitted when the content is shown.' },
  { name: 'onDeactivate', type: 'output<void>', description: 'Emitted when the display returns.' },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Inplace, InputText, FormsModule, DocsSection, DocsPropTable],
  template: `
    <h1>Inplace</h1>
    <p class="docs-lead">
      Swaps inline display content for edit content on demand: the display slot is a button
      (click or Enter/Space) that reveals the content slot.
      <code>import {{ '{' }} Inplace {{ '}' }} from '&#64;swipergy/swipyui/inplace';</code>
    </p>

    <docs-section
      title="Click to edit"
      [code]="edit"
      description="The display slot shows the current value; activating reveals an input, and the close button returns to the display."
    >
      <syui-inplace closable>
        <span syui-inplace-display>{{ name() || 'Click to edit' }}</span>
        <span syui-inplace-content>
          <input syuiInputText [(ngModel)]="name" placeholder="Enter a name" />
        </span>
      </syui-inplace>
    </docs-section>

    <docs-section
      title="Image reveal"
      [code]="image"
      description="Defer heavy content like images until the user asks for it."
    >
      <syui-inplace>
        <span syui-inplace-display>Show the photo</span>
        <span syui-inplace-content>
          <img src="https://picsum.photos/id/1024/320/200" alt="Bald eagle" width="320" />
        </span>
      </syui-inplace>
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
})
export class InplaceDemo {
  readonly edit = EDIT;
  readonly image = IMAGE;
  readonly props = PROPS;

  readonly name = signal('');
}
