import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Carousel } from '@swipergy/swipyui/carousel';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `products = [
  { name: 'Bamboo Watch', price: 65 },
  { name: 'Black Watch', price: 72 },
  // …
];

<syui-carousel [value]="products" [numVisible]="3" [numScroll]="1">
  <ng-template let-product>
    <div class="product-card">
      <strong>{{ product.name }}</strong>
      <span>{{ product.price | currency }}</span>
    </div>
  </ng-template>
</syui-carousel>`;

const CIRCULAR = `<syui-carousel [value]="products" [numVisible]="2" [numScroll]="2"
  circular [autoplayInterval]="3000">
  <ng-template let-product let-i="index">…</ng-template>
</syui-carousel>`;

const PROPS: PropRow[] = [
  { name: 'value', type: 'any[]', default: '[]', description: 'Items to display.' },
  {
    name: 'numVisible',
    type: 'number',
    default: '1',
    description: 'Number of items visible at a time.',
  },
  {
    name: 'numScroll',
    type: 'number',
    default: '1',
    description: 'Number of items scrolled per prev/next step.',
  },
  {
    name: 'circular',
    type: 'boolean',
    default: 'false',
    description: 'Wraps from the last page back to the first and vice versa.',
  },
  {
    name: 'autoplayInterval',
    type: 'number',
    default: '0',
    description:
      'Advances to the next page every n milliseconds; 0 disables. Pauses on hover and focus.',
  },
  {
    name: 'page',
    type: 'model<number>',
    default: '0',
    description: 'Index of the active page; supports [(page)] two-way binding.',
  },
  { name: 'ariaLabel', type: 'string', description: 'Accessible name of the carousel region.' },
  { name: 'onPage', type: 'output<number>', description: 'Emitted when the active page changes.' },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Carousel, DocsSection, DocsPropTable],
  styles: `
    .carousel-demo-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      margin: 0 0.5rem;
      padding: 1.5rem 1rem;
      border: 1px solid var(--syui-content-border-color);
      border-radius: var(--syui-border-radius-lg);
      text-align: center;
    }
    .carousel-demo-price {
      color: var(--syui-text-muted-color);
    }
  `,
  template: `
    <h1>Carousel</h1>
    <p class="docs-lead">
      Content slider that shows a configurable number of items per page, with prev/next
      controls, dot page indicators, circular wrapping and autoplay.
      <code>import {{ '{' }} Carousel {{ '}' }} from '&#64;swipergy/swipyui/carousel';</code>
    </p>

    <docs-section
      title="Basic"
      [code]="basic"
      language="typescript"
      description="Items render through a projected ng-template with the item as $implicit and its index."
    >
      <syui-carousel [value]="products" [numVisible]="3" ariaLabel="Products">
        <ng-template let-product>
          <div class="carousel-demo-card">
            <strong>{{ product.name }}</strong>
            <span class="carousel-demo-price">\${{ product.price }}</span>
          </div>
        </ng-template>
      </syui-carousel>
    </docs-section>

    <docs-section
      title="Circular with autoplay"
      [code]="circular"
      description="Autoplay advances every 3 seconds and pauses while hovered or focused; circular wraps around at the ends."
    >
      <syui-carousel
        [value]="products"
        [numVisible]="2"
        [numScroll]="2"
        circular
        [autoplayInterval]="3000"
        ariaLabel="Featured products"
      >
        <ng-template let-product let-i="index">
          <div class="carousel-demo-card">
            <strong>{{ i + 1 }}. {{ product.name }}</strong>
            <span class="carousel-demo-price">\${{ product.price }}</span>
          </div>
        </ng-template>
      </syui-carousel>
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
})
export class CarouselDemo {
  readonly basic = BASIC;
  readonly circular = CIRCULAR;
  readonly props = PROPS;

  readonly products = [
    { name: 'Bamboo Watch', price: 65 },
    { name: 'Black Watch', price: 72 },
    { name: 'Blue Band', price: 79 },
    { name: 'Blue T-Shirt', price: 29 },
    { name: 'Bracelet', price: 15 },
    { name: 'Brown Purse', price: 120 },
  ];
}
