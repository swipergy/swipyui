import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MenuItem } from '@swipergy/swipyui/core';
import { SplitButton } from '@swipergy/swipyui/splitbutton';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `items: MenuItem[] = [
  { label: 'Save as draft', command: () => this.log('Saved as draft') },
  { label: 'Save and publish', command: () => this.log('Published') },
  { separator: true },
  { label: 'Discard', command: () => this.log('Discarded') },
];

<syui-split-button label="Save" [model]="items" (onClick)="log('Saved')" />`;

const SEVERITIES = `<syui-split-button label="Save" severity="primary" [model]="items" />
<syui-split-button label="Save" severity="secondary" [model]="items" />
<syui-split-button label="Delete" severity="danger" outlined [model]="items" />`;

const DISABLED = `<syui-split-button label="Save" [model]="items" disabled />`;

const PROPS: PropRow[] = [
  { name: 'label', type: 'string', description: 'Text of the primary action button.' },
  {
    name: 'model',
    type: 'MenuItem[]',
    default: '[]',
    description: 'Menu items shown in the dropdown; supports command, url, separator, disabled, visible.',
  },
  { name: 'severity', type: 'ButtonSeverity', default: "'primary'", description: 'Color severity of both halves.' },
  { name: 'outlined', type: 'boolean', default: 'false', description: 'Renders both halves in the outlined variant.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the primary button and the menu trigger.' },
  { name: 'dropdownAriaLabel', type: 'string', default: "'More actions'", description: 'Accessible name of the chevron trigger and its menu.' },
  { name: 'onClick', type: 'output<MouseEvent>', description: 'Emitted when the primary button is clicked.' },
  { name: 'onShow', type: 'output<void>', description: 'Emitted when the menu opens.' },
  { name: 'onHide', type: 'output<void>', description: 'Emitted when the menu closes.' },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SplitButton, DocsSection, DocsPropTable],
  template: `
    <h1>SplitButton</h1>
    <p class="docs-lead">
      A primary action button paired with a chevron trigger that opens a menu of secondary
      actions. Arrow keys navigate the menu, Enter activates, Escape closes.
      <code>import {{ '{' }} SplitButton {{ '}' }} from '&#64;swipergy/swipyui/splitbutton';</code>
    </p>

    <docs-section title="Basic" [code]="basic" language="typescript">
      <syui-split-button label="Save" [model]="items" (onClick)="log('Saved')" />
      <span class="docs-muted">last action: {{ lastAction() || '—' }}</span>
    </docs-section>

    <docs-section
      title="Severities"
      [code]="severities"
      language="html"
      description="Severity and the outlined variant pass through to both halves, matching the Button API."
    >
      <syui-split-button label="Save" severity="primary" [model]="items" (onClick)="log('Saved')" />
      <syui-split-button label="Save" severity="secondary" [model]="items" (onClick)="log('Saved')" />
      <syui-split-button
        label="Delete"
        severity="danger"
        outlined
        [model]="items"
        (onClick)="log('Deleted')"
      />
    </docs-section>

    <docs-section
      title="Disabled"
      [code]="disabledCode"
      language="html"
      description="Disabling the control disables both the primary button and the menu trigger."
    >
      <syui-split-button label="Save" [model]="items" disabled />
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
})
export class SplitButtonDemo {
  readonly basic = BASIC;
  readonly severities = SEVERITIES;
  readonly disabledCode = DISABLED;
  readonly props = PROPS;

  readonly lastAction = signal('');

  readonly items: MenuItem[] = [
    { label: 'Save as draft', command: () => this.log('Saved as draft') },
    { label: 'Save and publish', command: () => this.log('Published') },
    { separator: true },
    { label: 'Discard', command: () => this.log('Discarded') },
  ];

  log(action: string): void {
    this.lastAction.set(action);
  }
}
