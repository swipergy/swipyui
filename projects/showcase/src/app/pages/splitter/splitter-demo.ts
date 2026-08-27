import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Splitter, SplitterPanel } from '@swipergy/swipyui/splitter';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `<syui-splitter style="height: 10rem">
  <syui-splitter-panel>Panel 1</syui-splitter-panel>
  <syui-splitter-panel>Panel 2</syui-splitter-panel>
</syui-splitter>`;

const SIZES = `sizes = signal([25, 75]);

<syui-splitter style="height: 10rem" [(panelSizes)]="sizes" [minSizes]="[20, 20]">
  <syui-splitter-panel>25%</syui-splitter-panel>
  <syui-splitter-panel>75%</syui-splitter-panel>
</syui-splitter>`;

const VERTICAL = `<syui-splitter layout="vertical" style="height: 14rem">
  <syui-splitter-panel>Top</syui-splitter-panel>
  <syui-splitter-panel>Bottom</syui-splitter-panel>
</syui-splitter>`;

const NESTED = `<syui-splitter style="height: 16rem">
  <syui-splitter-panel>Sidebar</syui-splitter-panel>
  <syui-splitter-panel>
    <syui-splitter layout="vertical" style="height: 100%">
      <syui-splitter-panel>Editor</syui-splitter-panel>
      <syui-splitter-panel>Console</syui-splitter-panel>
    </syui-splitter>
  </syui-splitter-panel>
</syui-splitter>`;

const PROPS: PropRow[] = [
  {
    name: 'layout',
    type: "'horizontal' | 'vertical'",
    default: "'horizontal'",
    description: 'Direction in which the panels are laid out.',
  },
  {
    name: 'panelSizes',
    type: 'model<number[]>',
    default: 'equal sizes',
    description: 'Panel sizes in percent, one entry per panel; updated while dragging.',
  },
  {
    name: 'minSizes',
    type: 'number[]',
    default: '[]',
    description: 'Minimum size in percent per panel; missing entries default to 0.',
  },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Splitter, SplitterPanel, DocsSection, DocsPropTable],
  template: `
    <h1>Splitter</h1>
    <p class="docs-lead">
      Resizable panel layout: drag the gutter with the pointer, or focus it and resize with the
      arrow keys.
      <code>
        import {{ '{' }} Splitter, SplitterPanel {{ '}' }} from '&#64;swipergy/swipyui/splitter';
      </code>
    </p>

    <docs-section title="Basic" [code]="basic" language="html">
      <syui-splitter style="height: 10rem; width: 100%">
        <syui-splitter-panel><div class="demo-pad">Panel 1</div></syui-splitter-panel>
        <syui-splitter-panel><div class="demo-pad">Panel 2</div></syui-splitter-panel>
      </syui-splitter>
    </docs-section>

    <docs-section
      title="Sizes and minimums"
      [code]="sizesCode"
      language="typescript"
      description="panelSizes two-way binds the percentages; minSizes stops the drag and the arrow keys."
    >
      <syui-splitter style="height: 10rem; width: 100%" [(panelSizes)]="sizes" [minSizes]="[20, 20]">
        <syui-splitter-panel><div class="demo-pad">Left</div></syui-splitter-panel>
        <syui-splitter-panel><div class="demo-pad">Right</div></syui-splitter-panel>
      </syui-splitter>
      <span class="docs-muted">sizes: {{ rounded() }}</span>
    </docs-section>

    <docs-section title="Vertical" [code]="vertical" language="html">
      <syui-splitter layout="vertical" style="height: 14rem; width: 100%">
        <syui-splitter-panel><div class="demo-pad">Top</div></syui-splitter-panel>
        <syui-splitter-panel><div class="demo-pad">Bottom</div></syui-splitter-panel>
      </syui-splitter>
    </docs-section>

    <docs-section
      title="Nested"
      [code]="nested"
      language="html"
      description="A splitter placed inside a panel creates familiar IDE-style layouts."
    >
      <syui-splitter style="height: 16rem; width: 100%">
        <syui-splitter-panel><div class="demo-pad">Sidebar</div></syui-splitter-panel>
        <syui-splitter-panel>
          <syui-splitter layout="vertical" style="height: 100%">
            <syui-splitter-panel><div class="demo-pad">Editor</div></syui-splitter-panel>
            <syui-splitter-panel><div class="demo-pad">Console</div></syui-splitter-panel>
          </syui-splitter>
        </syui-splitter-panel>
      </syui-splitter>
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
  styles: `
    .demo-pad {
      padding: 1rem;
    }
  `,
})
export class SplitterDemo {
  readonly basic = BASIC;
  readonly sizesCode = SIZES;
  readonly vertical = VERTICAL;
  readonly nested = NESTED;
  readonly props = PROPS;

  readonly sizes = signal([25, 75]);

  rounded(): string {
    return this.sizes()
      .map((size) => `${Math.round(size)}%`)
      .join(' / ');
  }
}
