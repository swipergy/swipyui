import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { Tree, TreeNode } from '@swipergy/swipyui/tree';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `files: TreeNode[] = [
  {
    key: 'docs', label: 'Documents', children: [
      { key: 'work', label: 'Work', children: [
        { key: 'resume', label: 'Resume.pdf' },
        { key: 'invoice', label: 'Invoice.pdf' },
      ]},
      { key: 'notes', label: 'Notes.txt' },
    ],
  },
  { key: 'pics', label: 'Pictures', children: [{ key: 'logo', label: 'logo.png' }] },
];

<syui-tree [value]="files" selectionMode="single" [(selection)]="selected" />`;

const CHECKBOX = `<syui-tree [value]="files" selectionMode="checkbox" [(selection)]="checked" />`;

const FILTER = `<syui-tree [value]="files" filter selectionMode="single" [(selection)]="selected" />`;

const EXPANDED = `expanded = signal<Record<string, boolean>>({ docs: true, work: true });

<syui-tree [value]="files" [(expandedKeys)]="expanded" />`;

const PROPS: PropRow[] = [
  {
    name: 'value',
    type: 'TreeNode[]',
    default: '[]',
    description: 'Root nodes as { key, label, icon?, children?, leaf?, selectable? } objects.',
  },
  {
    name: 'selectionMode',
    type: "'single' | 'multiple' | 'checkbox' | null",
    default: 'null',
    description: 'How nodes are selected; null renders a plain tree.',
  },
  {
    name: 'selection',
    type: 'model<TreeNode | TreeNode[] | null>',
    default: 'null',
    description: 'Selected node (single) or nodes (multiple/checkbox); two-way bindable.',
  },
  {
    name: 'expandedKeys',
    type: 'model<Record<string, boolean>>',
    default: '{}',
    description: 'Expansion state keyed by node key (true = expanded); two-way bindable.',
  },
  {
    name: 'filter',
    type: 'boolean',
    default: 'false',
    description: 'Shows a filter box that matches labels and auto-expands matches.',
  },
  {
    name: 'filterPlaceholder',
    type: 'string',
    default: "'Search…'",
    description: 'Placeholder of the filter box.',
  },
  {
    name: 'emptyMessage',
    type: 'string',
    default: "'No nodes'",
    description: 'Text shown when no nodes are visible.',
  },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Tree, DocsSection, DocsPropTable],
  template: `
    <h1>Tree</h1>
    <p class="docs-lead">
      Hierarchical tree with the ARIA tree pattern: arrow keys walk visible nodes, Right expands,
      Left collapses, Enter/Space selects — with single, multiple and tri-state checkbox selection.
      <code>import {{ '{' }} Tree, TreeNode {{ '}' }} from '&#64;swipergy/swipyui/tree';</code>
    </p>

    <docs-section title="Basic" [code]="basic" language="typescript">
      <syui-tree [value]="files" selectionMode="single" [(selection)]="selected" />
      <span class="docs-muted">selected: {{ selectedLabel() }}</span>
    </docs-section>

    <docs-section
      title="Checkbox selection"
      [code]="checkbox"
      language="typescript"
      description="Checking a branch checks its whole subtree; parents show a partial state while only some descendants are checked."
    >
      <syui-tree [value]="files" selectionMode="checkbox" [(selection)]="checked" />
      <span class="docs-muted">checked: {{ checkedCount() }} nodes</span>
    </docs-section>

    <docs-section
      title="Filter"
      [code]="filterCode"
      language="typescript"
      description="The filter box matches node labels and auto-expands branches containing matches."
    >
      <syui-tree [value]="files" filter selectionMode="single" [(selection)]="selected" />
    </docs-section>

    <docs-section
      title="Controlled expansion"
      [code]="expandedCode"
      language="typescript"
      description="expandedKeys is a record of node key → true, two-way bindable."
    >
      <syui-tree [value]="files" [(expandedKeys)]="expanded" />
      <span class="docs-muted">expandedKeys: {{ expandedJson() }}</span>
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
})
export class TreeDemo {
  readonly basic = BASIC;
  readonly checkbox = CHECKBOX;
  readonly filterCode = FILTER;
  readonly expandedCode = EXPANDED;
  readonly props = PROPS;

  readonly files: TreeNode[] = [
    {
      key: 'docs',
      label: 'Documents',
      children: [
        {
          key: 'work',
          label: 'Work',
          children: [
            { key: 'resume', label: 'Resume.pdf' },
            { key: 'invoice', label: 'Invoice.pdf' },
          ],
        },
        { key: 'notes', label: 'Notes.txt' },
      ],
    },
    { key: 'pics', label: 'Pictures', children: [{ key: 'logo', label: 'logo.png' }] },
  ];

  readonly selected = signal<TreeNode | TreeNode[] | null>(null);
  readonly checked = signal<TreeNode | TreeNode[] | null>(null);
  readonly expanded = signal<Record<string, boolean>>({ docs: true, work: true });

  readonly selectedLabel = computed(() => {
    const selection = this.selected();
    return selection && !Array.isArray(selection) ? selection.label : '—';
  });

  readonly checkedCount = computed(() => {
    const selection = this.checked();
    return Array.isArray(selection) ? selection.length : 0;
  });

  readonly expandedJson = computed(() => JSON.stringify(this.expanded()));
}
