import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MenuItem } from '@swipergy/swipyui/core';
import { TieredMenu } from '@swipergy/swipyui/tieredmenu';
import { Button } from '@swipergy/swipyui/button';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `items: MenuItem[] = [
  {
    label: 'File',
    items: [
      { label: 'New', command: () => this.log('New') },
      { label: 'Open', command: () => this.log('Open') },
      { separator: true },
      { label: 'Quit', command: () => this.log('Quit') },
    ],
  },
  {
    label: 'Edit',
    items: [
      { label: 'Undo', command: () => this.log('Undo') },
      {
        label: 'Find',
        items: [
          { label: 'Find next', command: () => this.log('Find next') },
          { label: 'Replace', command: () => this.log('Replace') },
        ],
      },
    ],
  },
  { label: 'Docs', url: 'https://angular.dev', target: '_blank' },
];

<syui-tiered-menu [items]="items" />`;

const POPUP = `<syui-button label="Options" (onClick)="menu.toggle($event)" />
<syui-tiered-menu #menu [items]="items" popup />`;

const PROPS: PropRow[] = [
  {
    name: 'items',
    type: 'MenuItem[]',
    default: '[]',
    description: 'Menu model; items with items open a submenu flowing to the right.',
  },
  {
    name: 'popup',
    type: 'boolean',
    default: 'false',
    description: 'Renders the menu in an overlay controlled with toggle/show/hide.',
  },
  { name: 'ariaLabel', type: 'string', description: 'Accessible label of the root menu.' },
  { name: 'toggle(event)', type: 'method', description: 'Toggles the popup on the event target.' },
  { name: 'show(event)', type: 'method', description: 'Opens the popup on the event target.' },
  { name: 'hide()', type: 'method', description: 'Closes the popup.' },
  { name: 'onShow', type: 'output<void>', description: 'Emitted when the popup opens.' },
  { name: 'onHide', type: 'output<void>', description: 'Emitted when the popup closes.' },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TieredMenu, Button, DocsSection, DocsPropTable],
  template: `
    <h1>TieredMenu</h1>
    <p class="docs-lead">
      Menu of nested items where submenus open to the side. Arrow keys navigate, Right opens a
      submenu, Left closes it, Enter activates and Escape closes all.
      <code>import {{ '{' }} TieredMenu {{ '}' }} from '&#64;swipergy/swipyui/tieredmenu';</code>
    </p>

    <docs-section title="Basic" [code]="basic" language="typescript">
      <syui-tiered-menu [items]="items" ariaLabel="Main" />
      <span class="docs-muted">last action: {{ lastAction() || '—' }}</span>
    </docs-section>

    <docs-section
      title="Popup"
      [code]="popup"
      language="html"
      description="With popup, the menu renders in an overlay anchored to the element that called toggle/show."
    >
      <syui-button label="Options" (onClick)="menu.toggle($event)" />
      <syui-tiered-menu #menu [items]="items" popup />
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
})
export class TieredMenuDemo {
  readonly basic = BASIC;
  readonly popup = POPUP;
  readonly props = PROPS;

  readonly lastAction = signal('');

  readonly items: MenuItem[] = [
    {
      label: 'File',
      items: [
        { label: 'New', command: () => this.lastAction.set('New') },
        { label: 'Open', command: () => this.lastAction.set('Open') },
        { separator: true },
        { label: 'Quit', command: () => this.lastAction.set('Quit') },
      ],
    },
    {
      label: 'Edit',
      items: [
        { label: 'Undo', command: () => this.lastAction.set('Undo') },
        {
          label: 'Find',
          items: [
            { label: 'Find next', command: () => this.lastAction.set('Find next') },
            { label: 'Replace', command: () => this.lastAction.set('Replace') },
          ],
        },
      ],
    },
    { label: 'Docs', url: 'https://angular.dev', target: '_blank' },
  ];
}
