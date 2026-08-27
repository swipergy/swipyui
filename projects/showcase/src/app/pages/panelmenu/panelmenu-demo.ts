import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MenuItem } from '@swipergy/swipyui/core';
import { PanelMenu } from '@swipergy/swipyui/panelmenu';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `items: MenuItem[] = [
  {
    label: 'Files',
    items: [
      { label: 'New', command: () => this.log('New') },
      {
        label: 'Recent',
        items: [
          { label: 'invoice.pdf', command: () => this.log('invoice.pdf') },
          { label: 'report.xlsx', command: () => this.log('report.xlsx') },
        ],
      },
    ],
  },
  {
    label: 'Cloud',
    items: [
      { label: 'Upload', command: () => this.log('Upload') },
      { label: 'Download', command: () => this.log('Download') },
    ],
  },
  { label: 'Docs', url: 'https://angular.dev', target: '_blank' },
];

<syui-panel-menu [items]="items" />`;

const MULTIPLE = `<syui-panel-menu [items]="items" multiple />`;

const PROPS: PropRow[] = [
  {
    name: 'items',
    type: 'MenuItem[]',
    default: '[]',
    description: 'Menu model; root items with items become collapsible panels.',
  },
  {
    name: 'multiple',
    type: 'boolean',
    default: 'false',
    description: 'Allows several root panels to be expanded at the same time.',
  },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PanelMenu, DocsSection, DocsPropTable],
  template: `
    <h1>PanelMenu</h1>
    <p class="docs-lead">
      Vertical accordion of menu items: root panels expand and collapse, nested levels indent and
      expand inline. Arrow keys move, Right expands, Left collapses, Enter activates.
      <code>import {{ '{' }} PanelMenu {{ '}' }} from '&#64;swipergy/swipyui/panelmenu';</code>
    </p>

    <docs-section
      title="Basic"
      [code]="basic"
      language="typescript"
      description="Only one root panel is open at a time by default."
    >
      <syui-panel-menu [items]="items" />
      <span class="docs-muted">last action: {{ lastAction() || '—' }}</span>
    </docs-section>

    <docs-section
      title="Multiple"
      [code]="multiple"
      language="html"
      description="With multiple, expanding a panel keeps the others open."
    >
      <syui-panel-menu [items]="items" multiple />
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
})
export class PanelMenuDemo {
  readonly basic = BASIC;
  readonly multiple = MULTIPLE;
  readonly props = PROPS;

  readonly lastAction = signal('');

  readonly items: MenuItem[] = [
    {
      label: 'Files',
      items: [
        { label: 'New', command: () => this.lastAction.set('New') },
        {
          label: 'Recent',
          items: [
            { label: 'invoice.pdf', command: () => this.lastAction.set('invoice.pdf') },
            { label: 'report.xlsx', command: () => this.lastAction.set('report.xlsx') },
          ],
        },
      ],
    },
    {
      label: 'Cloud',
      items: [
        { label: 'Upload', command: () => this.lastAction.set('Upload') },
        { label: 'Download', command: () => this.lastAction.set('Download') },
      ],
    },
    { label: 'Docs', url: 'https://angular.dev', target: '_blank' },
  ];
}
