import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DataView, DataViewGridItem, DataViewListItem } from '@swipergy/swipyui/dataview';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
}

const PRODUCTS: Product[] = [
  { id: 1, name: 'Bamboo Watch', category: 'Accessories', price: 65 },
  { id: 2, name: 'Black Watch', category: 'Accessories', price: 72 },
  { id: 3, name: 'Blue Band', category: 'Fitness', price: 79 },
  { id: 4, name: 'Blue T-Shirt', category: 'Clothing', price: 29 },
  { id: 5, name: 'Bracelet', category: 'Accessories', price: 15 },
  { id: 6, name: 'Brown Purse', category: 'Accessories', price: 120 },
  { id: 7, name: 'Game Controller', category: 'Electronics', price: 99 },
  { id: 8, name: 'Gaming Set', category: 'Electronics', price: 299 },
  { id: 9, name: 'Green Earbuds', category: 'Electronics', price: 89 },
];

const BASIC = `<syui-data-view [value]="products">
  <ng-template syuiDataViewListItem let-product>
    <div class="product-row">
      <span>{{ product.name }}</span>
      <span>{{ product.price | currency }}</span>
    </div>
  </ng-template>
</syui-data-view>`;

const LAYOUT = `<syui-data-view [value]="products" [(layout)]="layout">
  <ng-template syuiDataViewListItem let-product>…</ng-template>
  <ng-template syuiDataViewGridItem let-product>…</ng-template>
</syui-data-view>`;

const PAGINATION = `<syui-data-view [value]="products" paginator rows="4" [rowsPerPageOptions]="[4, 8]">
  <ng-template syuiDataViewListItem let-product let-i="index">…</ng-template>
</syui-data-view>`;

const PROPS: PropRow[] = [
  { name: 'value', type: 'T[]', default: '[]', description: 'Items to display.' },
  {
    name: 'layout',
    type: "model<'list' | 'grid'>",
    default: "'list'",
    description: 'Two-way bound active layout.',
  },
  { name: 'paginator', type: 'boolean', default: 'false', description: 'Shows the paginator.' },
  { name: 'rows', type: 'number', default: '10', description: 'Items per page.' },
  {
    name: 'rowsPerPageOptions',
    type: 'number[]',
    description: 'Page size choices shown in the paginator.',
  },
  {
    name: 'emptyMessage',
    type: 'string',
    default: "'No records found'",
    description: 'Text shown without items.',
  },
  {
    name: 'onPage',
    type: 'output<PaginatorPageEvent>',
    description: 'Emitted when the page or page size changes.',
  },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DataView, DataViewListItem, DataViewGridItem, CurrencyPipe, DocsSection, DocsPropTable],
  styles: `
    .product-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--syui-content-border-color);
    }
    .product-row .category,
    .product-card .category {
      color: var(--syui-text-muted-color);
      font-size: 0.875rem;
    }
    .product-card {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      padding: 1rem;
      border: 1px solid var(--syui-content-border-color);
      border-radius: var(--syui-border-radius-lg);
    }
    .product-card .price {
      font-weight: 600;
    }
  `,
  template: `
    <h1>DataView</h1>
    <p class="docs-lead">
      Displays a collection in a fully template-driven list or grid layout with an optional
      built-in paginator and a layout toggle.
      <code>
        import {{ '{' }} DataView, DataViewListItem, DataViewGridItem {{ '}' }} from
        '&#64;swipergy/swipyui/dataview';
      </code>
    </p>

    <docs-section
      title="Basic"
      [code]="basic"
      language="html"
      description="Mark the item template with syuiDataViewListItem; the item is the implicit template variable."
    >
      <syui-data-view [value]="products.slice(0, 4)">
        <ng-template syuiDataViewListItem let-product>
          <div class="product-row">
            <span>{{ product.name }}</span>
            <span class="category">{{ product.category }}</span>
            <span>{{ product.price | currency }}</span>
          </div>
        </ng-template>
      </syui-data-view>
    </docs-section>

    <docs-section
      title="Layout toggle"
      [code]="layoutCode"
      language="html"
      description="When both a list and a grid template are projected, a header with layout toggle buttons appears."
    >
      <syui-data-view [value]="products.slice(0, 6)" [(layout)]="layout">
        <ng-template syuiDataViewListItem let-product>
          <div class="product-row">
            <span>{{ product.name }}</span>
            <span>{{ product.price | currency }}</span>
          </div>
        </ng-template>
        <ng-template syuiDataViewGridItem let-product>
          <div class="product-card">
            <span>{{ product.name }}</span>
            <span class="category">{{ product.category }}</span>
            <span class="price">{{ product.price | currency }}</span>
          </div>
        </ng-template>
      </syui-data-view>
      <span class="docs-muted">layout: {{ layout() }}</span>
    </docs-section>

    <docs-section title="Pagination" [code]="pagination" language="html">
      <syui-data-view [value]="products" paginator rows="4" [rowsPerPageOptions]="[4, 8]">
        <ng-template syuiDataViewListItem let-product let-i="index">
          <div class="product-row">
            <span>{{ i + 1 }}. {{ product.name }}</span>
            <span>{{ product.price | currency }}</span>
          </div>
        </ng-template>
      </syui-data-view>
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
})
export class DataViewDemo {
  readonly basic = BASIC;
  readonly layoutCode = LAYOUT;
  readonly pagination = PAGINATION;
  readonly props = PROPS;

  readonly products = PRODUCTS;
  readonly layout = signal<'list' | 'grid'>('grid');
}
