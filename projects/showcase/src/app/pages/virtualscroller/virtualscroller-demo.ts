import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { VirtualScroller, VirtualScrollerItem } from '@swipergy/swipyui/virtualscroller';
import { Button } from '@swipergy/swipyui/button';
import { InputNumber } from '@swipergy/swipyui/inputnumber';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `<syui-virtual-scroller [items]="items" [itemSize]="40" style="height: 16rem" ariaLabel="Items">
  <ng-template syuiVirtualScrollerItem let-item let-i="index">
    <div class="row">#{{ i }} — {{ item }}</div>
  </ng-template>
</syui-virtual-scroller>`;

const HORIZONTAL = `<syui-virtual-scroller
  orientation="horizontal"
  [items]="items"
  [itemSize]="120"
  style="height: 6rem"
  ariaLabel="Cards"
>
  <ng-template syuiVirtualScrollerItem let-item>
    <div class="card">{{ item }}</div>
  </ng-template>
</syui-virtual-scroller>`;

const SCROLL_TO = `<syui-virtual-scroller #scroller [items]="items" [itemSize]="40" style="height: 16rem">
  …
</syui-virtual-scroller>

scroller.scrollToIndex(target, 'smooth');`;

const PROPS: PropRow[] = [
  { name: 'items', type: 'T[]', default: '[]', description: 'Items backing the list.' },
  {
    name: 'itemSize',
    type: 'number',
    description: 'Fixed size of one item along the scroll axis, in pixels. Required.',
  },
  {
    name: 'orientation',
    type: "'vertical' | 'horizontal'",
    default: "'vertical'",
    description: 'Scroll axis; the cross axis fills the scroller.',
  },
  {
    name: 'overscan',
    type: 'number',
    default: '3',
    description: 'Extra items rendered on each side of the viewport to reduce blanking.',
  },
  { name: 'ariaLabel', type: 'string', description: 'Accessible name of the scrollable region.' },
  {
    name: 'onScrollIndexChange',
    type: 'output<{ first, last }>',
    description: 'Emits the rendered index range whenever the user scrolls.',
  },
  {
    name: 'scrollToIndex(index, behavior?)',
    type: 'method',
    description: 'Scrolls so the item at index sits at the start of the viewport.',
  },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VirtualScroller, VirtualScrollerItem, Button, InputNumber, DocsSection, DocsPropTable],
  template: `
    <h1>VirtualScroller</h1>
    <p class="docs-lead">
      Renders only the visible slice of a large list, so tens of thousands of items scroll
      smoothly. Items need a fixed size along the scroll axis; scrolling stays fully native.
      <code>import {{ '{' }} VirtualScroller {{ '}' }} from '&#64;swipergy/swipyui/virtualscroller';</code>
    </p>

    <docs-section
      title="Basic"
      [code]="basic"
      language="html"
      description="100,000 rows; only the ones in view exist in the DOM."
    >
      <syui-virtual-scroller
        class="demo-scroller"
        [items]="items"
        [itemSize]="40"
        style="height: 16rem"
        ariaLabel="Items"
      >
        <ng-template syuiVirtualScrollerItem let-item let-i="index">
          <div class="demo-row">#{{ i }} — {{ item }}</div>
        </ng-template>
      </syui-virtual-scroller>
    </docs-section>

    <docs-section title="Horizontal" [code]="horizontal" language="html">
      <syui-virtual-scroller
        class="demo-scroller"
        orientation="horizontal"
        [items]="items"
        [itemSize]="120"
        style="height: 6rem"
        ariaLabel="Cards"
      >
        <ng-template syuiVirtualScrollerItem let-item>
          <div class="demo-card">{{ item }}</div>
        </ng-template>
      </syui-virtual-scroller>
    </docs-section>

    <docs-section
      title="Scroll to index"
      [code]="scrollTo"
      language="html"
      description="Programmatic jumps land on an exact item because item positions are known."
    >
      <div class="demo-jump-wrap">
        <div class="demo-jump">
          <syui-input-number [(value)]="target" [min]="0" [max]="99999" ariaLabel="Target index" />
          <syui-button label="Scroll to index" (click)="jump()" />
        </div>
        <syui-virtual-scroller
          #scroller
          class="demo-scroller"
          [items]="items"
          [itemSize]="40"
          style="height: 16rem"
          ariaLabel="Jump target list"
        >
          <ng-template syuiVirtualScrollerItem let-item let-i="index">
            <div class="demo-row">#{{ i }} — {{ item }}</div>
          </ng-template>
        </syui-virtual-scroller>
      </div>
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
  styles: `
    .demo-scroller {
      border: 1px solid var(--syui-content-border-color);
      border-radius: var(--syui-border-radius-md);
      width: min(100%, 28rem);
    }
    .demo-row {
      display: flex;
      align-items: center;
      height: 100%;
      padding: 0 0.75rem;
      border-bottom: 1px solid var(--syui-content-border-color);
    }
    .demo-card {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      margin: 0.5rem 0.25rem;
      border: 1px solid var(--syui-content-border-color);
      border-radius: var(--syui-border-radius-md);
    }
    .demo-jump-wrap {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      width: min(100%, 28rem);
    }
    .demo-jump {
      display: flex;
      gap: 0.5rem;
    }
  `,
})
export class VirtualScrollerDemo {
  readonly basic = BASIC;
  readonly horizontal = HORIZONTAL;
  readonly scrollTo = SCROLL_TO;
  readonly props = PROPS;

  readonly items = Array.from({ length: 100_000 }, (_, i) => `Item ${i}`);
  readonly scroller = viewChild.required<VirtualScroller<string>>('scroller');
  target: number | null = 50_000;

  jump(): void {
    this.scroller().scrollToIndex(this.target ?? 0, 'smooth');
  }
}
