import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Skeleton } from '@swipergy/swipyui/skeleton';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const SHAPES = `<syui-skeleton width="12rem" />
<syui-skeleton width="12rem" height="2rem" borderRadius="16px" />
<syui-skeleton shape="circle" width="3rem" height="3rem" />`;

const CARD = `<div class="placeholder-card">
  <div class="placeholder-row">
    <syui-skeleton shape="circle" width="3rem" height="3rem" />
    <div class="placeholder-lines">
      <syui-skeleton width="10rem" />
      <syui-skeleton width="6rem" />
    </div>
  </div>
  <syui-skeleton height="8rem" />
  <div class="placeholder-row">
    <syui-skeleton width="5rem" height="2rem" />
    <syui-skeleton width="5rem" height="2rem" />
  </div>
</div>`;

const LIST = `@for (row of [1, 2, 3]; track row) {
  <div class="placeholder-row">
    <syui-skeleton shape="circle" width="2.5rem" height="2.5rem" />
    <div class="placeholder-lines">
      <syui-skeleton />
      <syui-skeleton width="75%" />
    </div>
  </div>
}`;

const PROPS: PropRow[] = [
  {
    name: 'shape',
    type: "'rectangle' | 'circle'",
    default: "'rectangle'",
    description: 'Circle renders a fully rounded placeholder, e.g. for avatars.',
  },
  { name: 'width', type: 'string', default: "'100%'", description: 'CSS width of the placeholder.' },
  { name: 'height', type: 'string', default: "'1rem'", description: 'CSS height of the placeholder.' },
  {
    name: 'borderRadius',
    type: 'string',
    description: 'Overrides the default border radius (ignored for circles).',
  },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Skeleton, DocsSection, DocsPropTable],
  template: `
    <h1>Skeleton</h1>
    <p class="docs-lead">
      Shimmering placeholder blocks that sketch the layout of content while it loads; hidden from
      assistive technology.
      <code>import {{ '{' }} Skeleton {{ '}' }} from '&#64;swipergy/swipyui/skeleton';</code>
    </p>

    <docs-section title="Shapes" [code]="shapes">
      <div class="demo-stack">
        <syui-skeleton width="12rem" />
        <syui-skeleton width="12rem" height="2rem" borderRadius="16px" />
        <syui-skeleton shape="circle" width="3rem" height="3rem" />
      </div>
    </docs-section>

    <docs-section
      title="Card placeholder"
      [code]="card"
      description="Compose skeletons to mirror the layout of the loading card."
    >
      <div class="placeholder-card">
        <div class="placeholder-row">
          <syui-skeleton shape="circle" width="3rem" height="3rem" />
          <div class="placeholder-lines">
            <syui-skeleton width="10rem" />
            <syui-skeleton width="6rem" />
          </div>
        </div>
        <syui-skeleton height="8rem" />
        <div class="placeholder-row">
          <syui-skeleton width="5rem" height="2rem" />
          <syui-skeleton width="5rem" height="2rem" />
        </div>
      </div>
    </docs-section>

    <docs-section title="List placeholder" [code]="list">
      <div class="placeholder-list">
        @for (row of rows; track row) {
          <div class="placeholder-row">
            <syui-skeleton shape="circle" width="2.5rem" height="2.5rem" />
            <div class="placeholder-lines">
              <syui-skeleton />
              <syui-skeleton width="75%" />
            </div>
          </div>
        }
      </div>
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
  styles: `
    .demo-stack {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      width: 100%;
    }
    .placeholder-card {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      width: 100%;
      max-width: 24rem;
      padding: var(--syui-card-padding, 1.25rem);
      background: var(--syui-card-background, var(--syui-content-background));
      border: 1px solid var(--syui-card-border-color, var(--syui-content-border-color));
      border-radius: var(--syui-card-border-radius, 12px);
    }
    .placeholder-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      width: 100%;
      max-width: 24rem;
    }
    .placeholder-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .placeholder-lines {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      flex: 1;
    }
  `,
})
export class SkeletonDemo {
  readonly shapes = SHAPES;
  readonly card = CARD;
  readonly list = LIST;
  readonly props = PROPS;

  readonly rows = [1, 2, 3];
}
