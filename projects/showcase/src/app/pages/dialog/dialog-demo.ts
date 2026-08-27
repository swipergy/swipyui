import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Button } from '@swipergy/swipyui/button';
import { Dialog } from '@swipergy/swipyui/dialog';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `<syui-button label="Show dialog" (onClick)="visible.set(true)" />

<syui-dialog [(visible)]="visible" header="Confirm">
  Are you sure you want to proceed? This action cannot be undone.
  <div slot="footer">
    <syui-button label="Cancel" severity="secondary" variant="outlined"
      (onClick)="visible.set(false)" />
    <syui-button label="Confirm" (onClick)="visible.set(false)" />
  </div>
</syui-dialog>`;

const PROPS: PropRow[] = [
  {
    name: 'visible',
    type: 'model<boolean>',
    default: 'false',
    description: 'Controls visibility; supports [(visible)] two-way binding.',
  },
  { name: 'header', type: 'string', description: 'Title shown in the dialog header.' },
  {
    name: 'closable',
    type: 'boolean',
    default: 'true',
    description: 'Shows the close button and enables the Escape key.',
  },
  {
    name: 'dismissableMask',
    type: 'boolean',
    default: 'true',
    description: 'Closes the dialog when the backdrop is clicked.',
  },
  { name: 'width', type: 'string', default: "'32rem'", description: 'CSS width of the dialog panel.' },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, Dialog, DocsSection, DocsPropTable],
  template: `
    <h1>Dialog</h1>
    <p class="docs-lead">
      Modal dialog with focus trap, ESC and backdrop close, and focus restore.
      <code>import {{ '{' }} Dialog {{ '}' }} from '&#64;swipergy/swipyui/dialog';</code>
    </p>

    <docs-section title="Basic" [code]="basic">
      <syui-button label="Show dialog" (onClick)="visible.set(true)" />
      <syui-dialog [(visible)]="visible" header="Confirm">
        Are you sure you want to proceed? This action cannot be undone.
        <div slot="footer">
          <syui-button
            label="Cancel"
            severity="secondary"
            variant="outlined"
            (onClick)="visible.set(false)"
          />
          <syui-button label="Confirm" (onClick)="visible.set(false)" />
        </div>
      </syui-dialog>
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
})
export class DialogDemo {
  readonly basic = BASIC;
  readonly props = PROPS;
  readonly visible = signal(false);
}
