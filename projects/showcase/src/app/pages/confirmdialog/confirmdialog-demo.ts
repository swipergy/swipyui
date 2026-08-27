import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Button } from '@swipergy/swipyui/button';
import { ConfirmDialog, ConfirmationService } from '@swipergy/swipyui/confirmdialog';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `// Place the outlet once, e.g. in the root component:
// <syui-confirm-dialog />

private readonly confirmationService = inject(ConfirmationService);

save(): void {
  this.confirmationService.confirm({
    header: 'Save changes',
    message: 'Apply your changes to the shared workspace?',
    acceptLabel: 'Save',
    accept: () => this.doSave(),
    reject: () => console.log('kept editing'),
  });
}`;

const DANGER = `this.confirmationService.confirm({
  header: 'Delete account',
  message: 'This permanently removes the account and all its data.',
  acceptLabel: 'Delete',
  rejectLabel: 'Keep account',
  severity: 'danger', // danger accept button, initial focus on reject
  accept: () => this.deleteAccount(),
});`;

const PROPS: PropRow[] = [
  {
    name: 'confirm(confirmation)',
    type: '(confirmation: Confirmation) => void',
    description: 'ConfirmationService method that opens the dialog.',
  },
  { name: 'header', type: 'string', description: 'Title shown in the dialog header.' },
  { name: 'message', type: 'string', description: 'Question shown in the dialog body.' },
  {
    name: 'acceptLabel',
    type: 'string',
    default: "'Confirm'",
    description: 'Label of the accept button.',
  },
  {
    name: 'rejectLabel',
    type: 'string',
    default: "'Cancel'",
    description: 'Label of the reject button.',
  },
  {
    name: 'severity',
    type: "'primary' | 'danger'",
    default: "'primary'",
    description: 'Styles the accept button; danger moves initial focus to the reject button.',
  },
  {
    name: 'accept',
    type: '() => void',
    description: 'Called when the user accepts.',
  },
  {
    name: 'reject',
    type: '() => void',
    description: 'Called when the user rejects (button, Escape or mask click).',
  },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, ConfirmDialog, DocsSection, DocsPropTable],
  template: `
    <h1>ConfirmDialog</h1>
    <p class="docs-lead">
      Service-driven modal confirmation: place one outlet, call
      <code>ConfirmationService.confirm()</code> from anywhere. Escape and the mask reject.
      <code>
        import {{ '{' }} ConfirmDialog, ConfirmationService {{ '}' }} from
        '&#64;swipergy/swipyui/confirmdialog';
      </code>
    </p>

    <docs-section title="Basic" [code]="basic" language="typescript">
      <syui-button label="Save changes" (onClick)="confirmSave()" />
      <span class="docs-muted">result: {{ result() }}</span>
    </docs-section>

    <docs-section
      title="Danger"
      [code]="danger"
      language="typescript"
      description="severity: 'danger' styles the accept button destructively and puts the initial focus on the safe reject button."
    >
      <syui-button label="Delete account" severity="danger" variant="outlined" (onClick)="confirmDelete()" />
    </docs-section>

    <syui-confirm-dialog />

    <docs-prop-table [props]="props" />
  `,
})
export class ConfirmDialogDemo {
  readonly basic = BASIC;
  readonly danger = DANGER;
  readonly props = PROPS;

  readonly result = signal('—');

  private readonly confirmationService = inject(ConfirmationService);

  confirmSave(): void {
    this.confirmationService.confirm({
      header: 'Save changes',
      message: 'Apply your changes to the shared workspace?',
      acceptLabel: 'Save',
      accept: () => this.result.set('saved'),
      reject: () => this.result.set('rejected'),
    });
  }

  confirmDelete(): void {
    this.confirmationService.confirm({
      header: 'Delete account',
      message: 'This permanently removes the account and all its data.',
      acceptLabel: 'Delete',
      rejectLabel: 'Keep account',
      severity: 'danger',
      accept: () => this.result.set('deleted'),
      reject: () => this.result.set('kept'),
    });
  }
}
