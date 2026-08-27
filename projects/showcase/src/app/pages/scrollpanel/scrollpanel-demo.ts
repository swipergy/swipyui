import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ScrollPanel } from '@swipergy/swipyui/scrollpanel';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `<syui-scroll-panel style="height: 12rem">
  <p>Lorem ipsum dolor sit amet…</p>
  <!-- more content -->
</syui-scroll-panel>`;

const BOTH_AXES = `<syui-scroll-panel style="height: 10rem">
  <pre style="width: 60rem">…wide content…</pre>
</syui-scroll-panel>`;

const PROPS: PropRow[] = [
  {
    name: '—',
    type: '—',
    description:
      'No inputs. Set the height (or max-height) via style or class; scrollbar colors and size come from the --syui-scroll-panel-* tokens.',
  },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ScrollPanel, DocsSection, DocsPropTable],
  template: `
    <h1>ScrollPanel</h1>
    <p class="docs-lead">
      Scrollable container with slim, theme-aware scrollbars on top of fully native scrolling.
      <code>import {{ '{' }} ScrollPanel {{ '}' }} from '&#64;swipergy/swipyui/scrollpanel';</code>
    </p>

    <docs-section
      title="Basic"
      [code]="basic"
      language="html"
      description="Give the panel a height; overflowing content scrolls with styled bars."
    >
      <syui-scroll-panel style="height: 12rem; width: 100%">
        @for (paragraph of paragraphs; track $index) {
          <p>{{ paragraph }}</p>
        }
      </syui-scroll-panel>
    </docs-section>

    <docs-section
      title="Both axes"
      [code]="bothAxes"
      language="html"
      description="Horizontal overflow gets the same styled scrollbar."
    >
      <syui-scroll-panel style="height: 10rem; width: 100%">
        <pre style="width: 60rem; margin: 0">{{ wide }}</pre>
      </syui-scroll-panel>
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
})
export class ScrollPanelDemo {
  readonly basic = BASIC;
  readonly bothAxes = BOTH_AXES;
  readonly props = PROPS;

  readonly paragraphs = Array.from(
    { length: 8 },
    (_, i) =>
      `Paragraph ${i + 1} — Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do ` +
      'eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, ' +
      'quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  );

  readonly wide = Array.from(
    { length: 6 },
    (_, i) => `Line ${i + 1}: ${'lorem ipsum dolor sit amet '.repeat(8)}`,
  ).join('\n');
}
