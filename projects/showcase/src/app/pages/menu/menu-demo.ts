import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MenuItem } from '@swipergy/swipyui/core';
import { Menu } from '@swipergy/swipyui/menu';
import { Button } from '@swipergy/swipyui/button';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `items: MenuItem[] = [
  { label: 'New file', command: () => this.create() },
  { label: 'Open…', command: () => this.open() },
  { separator: true },
  { label: 'Website', url: 'https://swipergy.com', target: '_blank' },
];

<syui-menu [model]="items" />`;

const GROUPED = `items: MenuItem[] = [
  {
    label: 'Documents',
    items: [
      { label: 'New', command: () => {} },
      { label: 'Search', command: () => {} },
    ],
  },
  {
    label: 'Profile',
    items: [
      { label: 'Settings', routerLink: '/theming' },
      { label: 'Sign out', command: () => {} },
    ],
  },
];`;

const POPUP = `<syui-button label="Options" (onClick)="menu.toggle($event)" />
<syui-menu #menu [model]="items" popup />`;

const PROPS: PropRow[] = [
  {
    name: 'model',
    type: 'MenuItem[]',
    default: '[]',
    description: 'Items to render; items with `items` become group headers.',
  },
  {
    name: 'popup',
    type: 'boolean',
    default: 'false',
    description: 'Hides the menu until it is opened with toggle()/show().',
  },
  { name: 'ariaLabel', type: 'string', description: 'Accessible label of the menu.' },
  {
    name: 'toggle(event)',
    type: 'method',
    description: 'Opens the popup anchored to event.currentTarget, or closes it.',
  },
  { name: 'show(event)', type: 'method', description: 'Opens the popup menu.' },
  { name: 'hide()', type: 'method', description: 'Closes the popup menu.' },
  { name: 'onShow', type: 'output<void>', description: 'Emitted when the popup opens.' },
  { name: 'onHide', type: 'output<void>', description: 'Emitted when the popup closes.' },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Menu, Button, DocsSection, DocsPropTable],
  template: `
    <h1>Menu</h1>
    <p class="docs-lead">
      Vertical menu of MenuItems with the ARIA menu pattern — inline or as a popup anchored to any
      element. <code>import {{ '{' }} Menu {{ '}' }} from '&#64;swipergy/swipyui/menu';</code>
    </p>

    <docs-section title="Basic" [code]="basic" language="typescript">
      <syui-menu [model]="items" />
      <span class="docs-muted">last action: {{ lastAction }}</span>
    </docs-section>

    <docs-section
      title="Grouped"
      [code]="grouped"
      language="typescript"
      description="Items with children render as non-interactive group headers with their children below."
    >
      <syui-menu [model]="groupedItems" />
    </docs-section>

    <docs-section
      title="Popup"
      [code]="popup"
      language="html"
      description="With popup the menu opens from toggle(event), anchored to the event target, and closes on outside click, Escape or item click."
    >
      <syui-button label="Options" (onClick)="menu.toggle($event)" />
      <syui-menu #menu [model]="items" popup />
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
})
export class MenuDemo {
  readonly basic = BASIC;
  readonly grouped = GROUPED;
  readonly popup = POPUP;
  readonly props = PROPS;

  lastAction = '–';

  readonly items: MenuItem[] = [
    { label: 'New file', command: () => (this.lastAction = 'New file') },
    { label: 'Open…', command: () => (this.lastAction = 'Open…') },
    { label: 'Print', disabled: true },
    { separator: true },
    { label: 'Website', url: 'https://swipergy.com', target: '_blank' },
  ];

  readonly groupedItems: MenuItem[] = [
    {
      label: 'Documents',
      items: [
        { label: 'New', command: () => (this.lastAction = 'New') },
        { label: 'Search', command: () => (this.lastAction = 'Search') },
      ],
    },
    {
      label: 'Profile',
      items: [
        { label: 'Settings', routerLink: '/theming' },
        { label: 'Sign out', command: () => (this.lastAction = 'Sign out') },
      ],
    },
  ];
}
