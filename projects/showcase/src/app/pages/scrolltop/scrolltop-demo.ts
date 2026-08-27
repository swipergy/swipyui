import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ScrollTop } from '@swipergy/swipyui/scrolltop';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `<!-- placed once, e.g. in the app shell -->
<syui-scroll-top />`;

const THRESHOLD = `<syui-scroll-top [threshold]="200" />`;

const PROPS: PropRow[] = [
  {
    name: 'threshold',
    type: 'number',
    default: '400',
    description: 'Window scroll offset in pixels after which the button appears.',
  },
  {
    name: 'ariaLabel',
    type: 'string',
    default: "'Scroll to top'",
    description: 'Accessible label of the button.',
  },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ScrollTop, DocsSection, DocsPropTable],
  template: `
    <h1>ScrollTop</h1>
    <p class="docs-lead">
      Floating circular button that fades in after scrolling past a threshold and
      smooth-scrolls the window back to the top. It listens to window scroll only.
      <code>import {{ '{' }} ScrollTop {{ '}' }} from '&#64;swipergy/swipyui/scrolltop';</code>
    </p>

    <docs-section
      title="Basic"
      [code]="basic"
      description="Scroll this page down past 400px — the button fades in at the bottom-right corner and scrolls back up when clicked."
    >
      <syui-scroll-top />
      <span class="docs-muted">Scroll the page to see the button appear.</span>
    </docs-section>

    <docs-section
      title="Threshold"
      [code]="threshold"
      description="Lower the threshold to show the button earlier."
    >
      <syui-scroll-top [threshold]="200" />
      <span class="docs-muted">This instance appears after 200px already.</span>
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
})
export class ScrolltopDemo {
  readonly basic = BASIC;
  readonly threshold = THRESHOLD;
  readonly props = PROPS;
}
