import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MenuItem } from '@swipergy/swipyui/core';
import { ContextMenu } from '@swipergy/swipyui/contextmenu';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `items: MenuItem[] = [
  { label: 'Copy', command: () => this.log('Copy') },
  { label: 'Rename', command: () => this.log('Rename') },
  { separator: true },
  {
    label: 'Share',
    items: [
      { label: 'Mail', command: () => this.log('Mail') },
      { label: 'Link', command: () => this.log('Link') },
    ],
  },
  { label: 'Delete', command: () => this.log('Delete') },
];

<div class="zone" (contextmenu)="cm.show($event)">Right-click here</div>
<syui-context-menu #cm [items]="items" />`;

const GLOBAL = `<!-- attaches to the document's contextmenu event -->
<syui-context-menu [items]="items" global />`;

const PROPS: PropRow[] = [
  {
    name: 'items',
    type: 'MenuItem[]',
    default: '[]',
    description: 'Menu model; items with items open a submenu flowing to the right.',
  },
  {
    name: 'global',
    type: 'boolean',
    default: 'false',
    description: "Attaches the menu to the document's contextmenu event.",
  },
  { name: 'ariaLabel', type: 'string', description: 'Accessible label of the root menu.' },
  {
    name: 'show(event)',
    type: 'method',
    description: 'Opens the menu at the cursor position of the mouse event.',
  },
  { name: 'hide()', type: 'method', description: 'Closes the menu.' },
  { name: 'onShow', type: 'output<void>', description: 'Emitted when the menu opens.' },
  { name: 'onHide', type: 'output<void>', description: 'Emitted when the menu closes.' },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ContextMenu, DocsSection, DocsPropTable],
  styles: `
    .contextmenu-demo-zone {
      display: grid;
      place-items: center;
      height: 10rem;
      border: 2px dashed var(--syui-content-border-color);
      border-radius: var(--syui-border-radius-lg, 8px);
      color: var(--syui-text-muted-color);
      user-select: none;
    }
  `,
  template: `
    <h1>ContextMenu</h1>
    <p class="docs-lead">
      Right-click menu that opens at the cursor position and closes on outside click or Escape.
      Attach it per element with <code>show($event)</code> or to the whole page with
      <code>global</code>.
      <code>import {{ '{' }} ContextMenu {{ '}' }} from '&#64;swipergy/swipyui/contextmenu';</code>
    </p>

    <docs-section
      title="Basic"
      [code]="basic"
      language="typescript"
      description="Call show($event) from the (contextmenu) event of any element."
    >
      <div class="contextmenu-demo-zone" (contextmenu)="cm.show($event)">Right-click here</div>
      <syui-context-menu #cm [items]="items" ariaLabel="File actions" />
      <span class="docs-muted">last action: {{ lastAction() || '—' }}</span>
    </docs-section>

    <docs-section
      title="Global"
      [code]="global"
      language="html"
      description="With global, the menu replaces the browser context menu on the entire document. Not demonstrated live so the rest of this page keeps its native menu."
    />

    <docs-prop-table [props]="props" />
  `,
})
export class ContextMenuDemo {
  readonly basic = BASIC;
  readonly global = GLOBAL;
  readonly props = PROPS;

  readonly lastAction = signal('');

  readonly items: MenuItem[] = [
    { label: 'Copy', command: () => this.lastAction.set('Copy') },
    { label: 'Rename', command: () => this.lastAction.set('Rename') },
    { separator: true },
    {
      label: 'Share',
      items: [
        { label: 'Mail', command: () => this.lastAction.set('Mail') },
        { label: 'Link', command: () => this.lastAction.set('Link') },
      ],
    },
    { label: 'Delete', command: () => this.lastAction.set('Delete') },
  ];
}
