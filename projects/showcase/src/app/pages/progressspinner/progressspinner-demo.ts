import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ProgressSpinner } from '@swipergy/swipyui/progressspinner';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `<syui-progress-spinner />`;

const CUSTOM = `<syui-progress-spinner strokeWidth="4" style="width: 2.5rem; height: 2.5rem" />
<syui-progress-spinner strokeWidth="6" style="width: 4rem; height: 4rem" ariaLabel="Loading results" />`;

const COLOR = `/* override the color token on any ancestor */
.demo-spinner {
  --syui-progressspinner-color: var(--syui-green-500);
}`;

const PROPS: PropRow[] = [
  {
    name: 'strokeWidth',
    type: 'string',
    default: "'2'",
    description: 'Stroke width of the spinner circle, in SVG units.',
  },
  {
    name: 'ariaLabel',
    type: 'string',
    default: "'Loading'",
    description: 'Accessible name announced for the spinner.',
  },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProgressSpinner, DocsSection, DocsPropTable],
  template: `
    <h1>ProgressSpinner</h1>
    <p class="docs-lead">
      Indeterminate circular loading indicator, sized freely via CSS width/height on the host
      element.
      <code
        >import {{ '{' }} ProgressSpinner {{ '}' }} from '&#64;swipergy/swipyui/progressspinner';</code
      >
    </p>

    <docs-section title="Basic" [code]="basic">
      <syui-progress-spinner />
    </docs-section>

    <docs-section
      title="Size and stroke"
      [code]="custom"
      description="Set width/height on the host to scale the spinner; strokeWidth controls the ring thickness."
    >
      <div class="demo-row">
        <syui-progress-spinner strokeWidth="4" style="width: 2.5rem; height: 2.5rem" />
        <syui-progress-spinner
          strokeWidth="6"
          style="width: 4rem; height: 4rem"
          ariaLabel="Loading results"
        />
      </div>
    </docs-section>

    <docs-section
      title="Color"
      [code]="color"
      language="scss"
      description="The ring color comes from the --syui-progressspinner-color token."
    >
      <syui-progress-spinner class="demo-spinner" style="width: 3rem; height: 3rem" />
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
  styles: `
    .demo-row {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }
    .demo-spinner {
      --syui-progressspinner-color: var(--syui-green-500);
    }
  `,
})
export class ProgressSpinnerDemo {
  readonly basic = BASIC;
  readonly custom = CUSTOM;
  readonly color = COLOR;
  readonly props = PROPS;
}
