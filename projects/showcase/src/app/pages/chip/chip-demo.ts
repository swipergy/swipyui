import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Chip } from '@swipergy/swipyui/chip';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `<syui-chip label="Angular" />
<syui-chip label="TypeScript" />
<syui-chip image="https://i.pravatar.cc/48?img=13" label="Frank Kuhn" />`;

const REMOVABLE = `<syui-chip label="Berlin" removable (onRemove)="removed()" />
<syui-chip label="Hamburg" removable />`;

const PROJECTED = `<syui-chip>
  <strong>24</strong>&nbsp;results
</syui-chip>`;

const PROPS: PropRow[] = [
  { name: 'label', type: 'string', description: 'Text shown in the chip; overridden by projected content.' },
  { name: 'icon', type: 'string', description: 'CSS class of a user-supplied icon font glyph.' },
  { name: 'image', type: 'string', description: 'Image URL shown before the label; wins over icon.' },
  { name: 'removable', type: 'boolean', default: 'false', description: 'Shows an X button that hides the chip.' },
  { name: 'onRemove', type: 'output<MouseEvent>', description: 'Emitted when the remove button is clicked.' },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Chip, DocsSection, DocsPropTable],
  template: `
    <h1>Chip</h1>
    <p class="docs-lead">
      Compact pill representing an entity, optionally with an image/icon and a remove button.
      <code>import {{ '{' }} Chip {{ '}' }} from '&#64;swipergy/swipyui/chip';</code>
    </p>

    <docs-section title="Basic" [code]="basic" language="html">
      <syui-chip label="Angular" />
      <syui-chip label="TypeScript" />
      <syui-chip image="https://i.pravatar.cc/48?img=13" label="Frank Kuhn" />
    </docs-section>

    <docs-section
      title="Removable"
      [code]="removable"
      language="html"
      description="The X button hides the chip and emits onRemove."
    >
      <syui-chip label="Berlin" removable (onRemove)="removedCount.set(removedCount() + 1)" />
      <syui-chip label="Hamburg" removable (onRemove)="removedCount.set(removedCount() + 1)" />
      <span class="docs-muted">removed: {{ removedCount() }}</span>
    </docs-section>

    <docs-section
      title="Custom content"
      [code]="projected"
      language="html"
      description="Projected content replaces the label."
    >
      <syui-chip><strong>24</strong>&nbsp;results</syui-chip>
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
})
export class ChipDemo {
  readonly basic = BASIC;
  readonly removable = REMOVABLE;
  readonly projected = PROJECTED;
  readonly props = PROPS;

  readonly removedCount = signal(0);
}
