import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TreeNode } from '@swipergy/swipyui/tree';
import { TreeSelect } from '@swipergy/swipyui/treeselect';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `files: TreeNode[] = [
  {
    key: 'docs', label: 'Documents', children: [
      { key: 'resume', label: 'Resume.pdf' },
      { key: 'notes', label: 'Notes.txt' },
    ],
  },
  { key: 'pics', label: 'Pictures', children: [{ key: 'logo', label: 'logo.png' }] },
];

// the control's value is the selected node's key
<syui-tree-select [options]="files" placeholder="Select a file" [formControl]="file" />`;

const CHECKBOX = `// the control's value is a key array, including fully-checked parents
<syui-tree-select
  [options]="files"
  selectionMode="checkbox"
  placeholder="Select files"
  [formControl]="selection"
/>`;

const PROPS: PropRow[] = [
  {
    name: 'options',
    type: 'TreeNode[]',
    default: '[]',
    description: 'Root nodes offered for selection.',
  },
  {
    name: 'selectionMode',
    type: "'single' | 'checkbox'",
    default: "'single'",
    description: 'Single node (value: key string) or checkbox selection (value: key array).',
  },
  { name: 'placeholder', type: 'string', default: "'Select…'", description: 'Text shown while empty.' },
  {
    name: 'maxSelectedLabels',
    type: 'number',
    default: '3',
    description: 'Above this many checked nodes the trigger shows "n items selected".',
  },
  { name: 'fluid', type: 'boolean', default: 'false', description: 'Stretches the trigger to the container width.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the control.' },
  { name: 'onShow', type: 'output<void>', description: 'Emitted when the panel opens.' },
  { name: 'onHide', type: 'output<void>', description: 'Emitted when the panel closes.' },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TreeSelect, ReactiveFormsModule, JsonPipe, DocsSection, DocsPropTable],
  template: `
    <h1>TreeSelect</h1>
    <p class="docs-lead">
      Form control that picks nodes from a tree in an overlay panel. The value holds node keys: a
      single key in single mode, a key array in checkbox mode.
      <code>import {{ '{' }} TreeSelect {{ '}' }} from '&#64;swipergy/swipyui/treeselect';</code>
    </p>

    <docs-section
      title="Basic"
      [code]="basic"
      language="typescript"
      description="Picking a node closes the panel; the form value is the node's key."
    >
      <syui-tree-select [options]="files" placeholder="Select a file" [formControl]="file" />
      <span class="docs-muted">value: {{ file.value }}</span>
    </docs-section>

    <docs-section
      title="Checkbox selection"
      [code]="checkbox"
      language="typescript"
      description="The panel stays open while checking; the trigger joins the labels and summarizes past maxSelectedLabels."
    >
      <syui-tree-select
        [options]="files"
        selectionMode="checkbox"
        placeholder="Select files"
        [formControl]="selection"
      />
      <span class="docs-muted">value: {{ selection.value | json }}</span>
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
})
export class TreeSelectDemo {
  readonly basic = BASIC;
  readonly checkbox = CHECKBOX;
  readonly props = PROPS;

  readonly files: TreeNode[] = [
    {
      key: 'docs',
      label: 'Documents',
      children: [
        { key: 'resume', label: 'Resume.pdf' },
        { key: 'notes', label: 'Notes.txt' },
      ],
    },
    { key: 'pics', label: 'Pictures', children: [{ key: 'logo', label: 'logo.png' }] },
  ];

  readonly file = new FormControl<string | null>(null);
  readonly selection = new FormControl<string[] | null>(null);
}
