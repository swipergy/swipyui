import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Button } from '@swipergy/swipyui/button';
import { ProgressBar } from '@swipergy/swipyui/progressbar';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `<syui-progress-bar [value]="60" />`;

const DYNAMIC = `progress = signal(20);

<syui-progress-bar [value]="progress()" />
<syui-button label="Advance" (onClick)="advance()" />`;

const INDETERMINATE = `<syui-progress-bar mode="indeterminate" />`;

const NO_LABEL = `<syui-progress-bar [value]="35" [showValue]="false" />`;

const PROPS: PropRow[] = [
  {
    name: 'value',
    type: 'number',
    default: '0',
    description: 'Progress in percent, clamped to 0–100.',
  },
  {
    name: 'mode',
    type: "'determinate' | 'indeterminate'",
    default: "'determinate'",
    description: 'Indeterminate loops a sweeping animation instead of showing value.',
  },
  {
    name: 'showValue',
    type: 'boolean',
    default: 'true',
    description: 'Shows the percentage label inside the bar.',
  },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProgressBar, Button, DocsSection, DocsPropTable],
  template: `
    <h1>ProgressBar</h1>
    <p class="docs-lead">
      Horizontal progress indicator with determinate and indeterminate modes, exposed via the ARIA
      progressbar role.
      <code>import {{ '{' }} ProgressBar {{ '}' }} from '&#64;swipergy/swipyui/progressbar';</code>
    </p>

    <docs-section title="Basic" [code]="basic">
      <syui-progress-bar class="demo-bar" [value]="60" />
    </docs-section>

    <docs-section
      title="Dynamic"
      [code]="dynamic"
      language="typescript"
      description="Bind value to a signal; the fill width animates between updates."
    >
      <div class="demo-stack">
        <syui-progress-bar class="demo-bar" [value]="progress()" />
        <syui-button label="Advance" (onClick)="advance()" />
      </div>
    </docs-section>

    <docs-section
      title="Indeterminate"
      [code]="indeterminate"
      description="For operations of unknown duration."
    >
      <syui-progress-bar class="demo-bar" mode="indeterminate" />
    </docs-section>

    <docs-section title="Without label" [code]="noLabel">
      <syui-progress-bar class="demo-bar" [value]="35" [showValue]="false" />
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
  styles: `
    .demo-bar {
      width: 100%;
    }
    .demo-stack {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;
      width: 100%;
    }
  `,
})
export class ProgressBarDemo {
  readonly basic = BASIC;
  readonly dynamic = DYNAMIC;
  readonly indeterminate = INDETERMINATE;
  readonly noLabel = NO_LABEL;
  readonly props = PROPS;

  readonly progress = signal(20);

  advance(): void {
    this.progress.update((value) => (value >= 100 ? 0 : value + 20));
  }
}
