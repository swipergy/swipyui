import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MenuItem } from '@swipergy/swipyui/core';
import { Menubar } from '@swipergy/swipyui/menubar';
import { Button } from '@swipergy/swipyui/button';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `items: MenuItem[] = [
  {
    label: 'File',
    items: [
      { label: 'New', command: () => {} },
      { label: 'Open…', command: () => {} },
      { separator: true },
      { label: 'Export', items: [{ label: 'PDF' }, { label: 'CSV' }] },
    ],
  },
  { label: 'Edit', items: [{ label: 'Undo' }, { label: 'Redo' }] },
  { label: 'Docs', routerLink: '/theming' },
];

<syui-menubar [model]="items" />`;

const SLOTS = `<syui-menubar [model]="items">
  <div syui-menubar-start><strong>SwipyUI</strong></div>
  <div syui-menubar-end><syui-button label="Sign in" size="small" /></div>
</syui-menubar>`;

const PROPS: PropRow[] = [
  {
    name: 'model',
    type: 'MenuItem[]',
    default: '[]',
    description: 'Root items; items with `items` open a dropdown submenu.',
  },
  { name: 'ariaLabel', type: 'string', description: 'Accessible label of the menubar.' },
  {
    name: '[syui-menubar-start]',
    type: 'slot',
    description: 'Content projected before the root items.',
  },
  {
    name: '[syui-menubar-end]',
    type: 'slot',
    description: 'Content projected after the root items, pushed to the far end.',
  },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Menubar, Button, DocsSection, DocsPropTable],
  template: `
    <h1>Menubar</h1>
    <p class="docs-lead">
      Horizontal menubar with dropdown submenus following the ARIA menubar pattern: Left/Right move
      across root items, Down opens a submenu, Right opens nested submenus, Escape closes.
      <code>import {{ '{' }} Menubar {{ '}' }} from '&#64;swipergy/swipyui/menubar';</code>
    </p>

    <docs-section title="Basic" [code]="basic" language="typescript">
      <syui-menubar [model]="items" />
      <span class="docs-muted">last action: {{ lastAction }}</span>
    </docs-section>

    <docs-section
      title="Start and end slots"
      [code]="slots"
      language="html"
      description="Project a logo or actions around the items with the syui-menubar-start / syui-menubar-end attributes."
    >
      <syui-menubar [model]="items">
        <div syui-menubar-start><strong>SwipyUI</strong></div>
        <div syui-menubar-end><syui-button label="Sign in" size="small" /></div>
      </syui-menubar>
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
})
export class MenubarDemo {
  readonly basic = BASIC;
  readonly slots = SLOTS;
  readonly props = PROPS;

  lastAction = '–';

  readonly items: MenuItem[] = [
    {
      label: 'File',
      items: [
        { label: 'New', command: () => (this.lastAction = 'New') },
        { label: 'Open…', command: () => (this.lastAction = 'Open…') },
        { separator: true },
        {
          label: 'Export',
          items: [
            { label: 'PDF', command: () => (this.lastAction = 'PDF') },
            { label: 'CSV', command: () => (this.lastAction = 'CSV') },
          ],
        },
      ],
    },
    {
      label: 'Edit',
      items: [
        { label: 'Undo', command: () => (this.lastAction = 'Undo') },
        { label: 'Redo', disabled: true },
      ],
    },
    { label: 'Docs', routerLink: '/theming' },
  ];
}
