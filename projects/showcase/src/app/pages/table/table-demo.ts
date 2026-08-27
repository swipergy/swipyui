import { CurrencyPipe } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, linkedSignal, signal } from '@angular/core';
import { Column, Table } from '@swipergy/swipyui/table';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';
import { CustomerPage } from '../../shared/mock-table-api';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
}

const PRODUCTS: Product[] = [
  { id: 1, name: 'Bamboo Watch', category: 'Accessories', price: 65, quantity: 24 },
  { id: 2, name: 'Black Watch', category: 'Accessories', price: 72, quantity: 61 },
  { id: 3, name: 'Blue Band', category: 'Fitness', price: 79, quantity: 2 },
  { id: 4, name: 'Blue T-Shirt', category: 'Clothing', price: 29, quantity: 25 },
  { id: 5, name: 'Bracelet', category: 'Accessories', price: 15, quantity: 73 },
  { id: 6, name: 'Brown Purse', category: 'Accessories', price: 120, quantity: 0 },
  { id: 7, name: 'Chakra Bracelet', category: 'Accessories', price: 32, quantity: 5 },
  { id: 8, name: 'Galaxy Earrings', category: 'Accessories', price: 34, quantity: 23 },
  { id: 9, name: 'Game Controller', category: 'Electronics', price: 99, quantity: 2 },
  { id: 10, name: 'Gaming Set', category: 'Electronics', price: 299, quantity: 63 },
  { id: 11, name: 'Gold Phone Case', category: 'Accessories', price: 24, quantity: 0 },
  { id: 12, name: 'Green Earbuds', category: 'Electronics', price: 89, quantity: 23 },
];

const BASIC = `<syui-table [value]="products">
  <syui-column field="name" header="Name" />
  <syui-column field="category" header="Category" />
  <syui-column field="price" header="Price" />
</syui-table>`;

const SORT = `<syui-table [value]="products">
  <syui-column field="name" header="Name" sortable />
  <syui-column field="category" header="Category" sortable />
  <syui-column field="price" header="Price" sortable />
</syui-table>`;

const PAGINATION = `<syui-table [value]="products" paginator rows="5" [rowsPerPageOptions]="[5, 10, 20]">
  ...
</syui-table>`;

const TEMPLATE = `<syui-column field="price" header="Price" sortable>
  <ng-template let-product>{{ product.price | currency }}</ng-template>
</syui-column>

<syui-column header="Status">
  <ng-template let-product>
    <span class="stock" [class.out]="product.quantity === 0">
      {{ product.quantity === 0 ? 'Out of stock' : 'In stock' }}
    </span>
  </ng-template>
</syui-column>`;

const SINGLE_SELECTION = `<syui-table [value]="products" dataKey="id" selectionMode="single" [(selection)]="selected">
  ...
</syui-table>`;

const MULTIPLE_SELECTION = `<syui-table [value]="products" dataKey="id" selectionMode="multiple" [(selection)]="selectedRows">
  ...
</syui-table>`;

const FILTER = `<!-- showGlobalFilter renders the search input above the table;
     [(globalFilter)] stays two-way bindable for external inputs. -->
<syui-table [value]="products" paginator rows="5" showGlobalFilter>
  ...
</syui-table>`;

const EXPORT = `<!-- showExport adds the button to the toolbar; exportCSV() is also
     callable directly, e.g. from your own button via a template ref. -->
<syui-table [value]="products" showExport exportFilename="products">
  <syui-column field="name" header="Name" />
  <syui-column field="category" header="Category" />
  <syui-column field="price" header="Price" />
</syui-table>`;

const COLUMN_FILTER = `<!-- filterType="select" renders a dropdown of the column's distinct
     values (or the ones passed via [filterOptions]) that matches exactly. -->
<syui-table [value]="products" paginator rows="5">
  <syui-column field="name" header="Name" sortable filterable filterPlaceholder="Search name" />
  <syui-column field="category" header="Category" filterable filterType="select" />
  <syui-column field="price" header="Price" sortable />
</syui-table>`;

const FILTER_MENU = `<!-- filterDisplay="menu" puts a funnel icon in each filterable header;
     clicking it opens a popup with match-mode constraints joined by AND/OR. -->
<syui-table [value]="products" paginator rows="5" filterDisplay="menu">
  <syui-column field="name" header="Name" sortable filterable filterPlaceholder="Search name" />
  <syui-column field="category" header="Category" filterable filterType="select" />
  <syui-column
    field="price"
    header="Price"
    sortable
    filterable
    [filterMatchModeOptions]="['equals', 'notEquals', 'startsWith']"
  />
</syui-table>`;

const COLUMN_TOGGLE = `<!-- The Columns button lets users hide columns to save space;
     bind hiddenColumns to persist the selection. -->
<syui-table [value]="products" columnToggle [(hiddenColumns)]="hiddenColumns">
  <syui-column field="name" header="Name" />
  <syui-column field="category" header="Category" />
  <syui-column field="price" header="Price" />
  <syui-column field="quantity" header="Quantity" />
</syui-table>`;

const COLUMN_REORDER = `<!-- Drag a column header onto another to move it; bind
     columnOrder to persist the arrangement. -->
<syui-table [value]="products" reorderableColumns [(columnOrder)]="columnOrder">
  <syui-column field="name" header="Name" />
  <syui-column field="category" header="Category" />
  <syui-column field="price" header="Price" />
  <syui-column field="quantity" header="Quantity" />
</syui-table>`;

const SERVER = `// Component: table state as signals, fed into an httpResource
readonly first = signal(0);
readonly rows = signal(5);
readonly sortField = signal<string | null>(null);
readonly sortOrder = signal<1 | -1>(1);

readonly customers = httpResource<CustomerPage>(() => ({
  url: '/api/customers',
  params: {
    first: this.first(),
    rows: this.rows(),
    ...(this.sortField() ? { sortField: this.sortField()!, sortOrder: this.sortOrder() } : {}),
  },
}));

<!-- Template: lazy renders value as-is; paging/sorting update the bound signals -->
<syui-table
  lazy
  paginator
  [value]="customers.value()?.data ?? []"
  [totalRecords]="customers.value()?.totalRecords ?? 0"
  [loading]="customers.isLoading()"
  [rows]="rows()"
  [rowsPerPageOptions]="[5, 10, 20]"
  [(first)]="first"
  [(sortField)]="sortField"
  [(sortOrder)]="sortOrder"
  (onPage)="rows.set($event.rows)"
>
  <syui-column field="name" header="Name" sortable />
  <syui-column field="country" header="Country" sortable />
  <syui-column field="balance" header="Balance" sortable />
</syui-table>`;

const PROPS: PropRow[] = [
  { name: 'value', type: 'T[]', default: '[]', description: 'Rows to display.' },
  {
    name: 'dataKey',
    type: 'string',
    description: 'Property that uniquely identifies a row; used for selection and row tracking.',
  },
  { name: 'paginator', type: 'boolean', default: 'false', description: 'Shows the paginator.' },
  {
    name: 'lazy',
    type: 'boolean',
    default: 'false',
    description:
      'Server-side mode: value is rendered as-is as the current page; paging, sorting and filtering emit onLazyLoad instead of being applied client-side.',
  },
  {
    name: 'totalRecords',
    type: 'number',
    default: '0',
    description: 'Total row count on the server; drives the paginator in lazy mode.',
  },
  {
    name: 'loading',
    type: 'boolean',
    default: 'false',
    description: 'Shows a loading overlay above the rows.',
  },
  {
    name: 'columnToggle',
    type: 'boolean',
    default: 'false',
    description: 'Shows a column-chooser button above the table for hiding/showing columns.',
  },
  {
    name: 'hiddenColumns',
    type: 'model<string[]>',
    default: '[]',
    description:
      'Columns hidden by the user, keyed by field (or header for field-less columns); two-way bindable.',
  },
  {
    name: 'reorderableColumns',
    type: 'boolean',
    default: 'false',
    description: 'Lets users reorder columns by dragging a column header onto another.',
  },
  {
    name: 'columnOrder',
    type: 'model<string[]>',
    default: '[]',
    description:
      'Column display order, keyed like hiddenColumns; two-way bindable to persist the arrangement.',
  },
  {
    name: 'first',
    type: 'model<number>',
    default: '0',
    description: 'Index of the first displayed row; two-way bindable for server-side pagination.',
  },
  { name: 'rows', type: 'number', default: '10', description: 'Rows per page.' },
  {
    name: 'rowsPerPageOptions',
    type: 'number[]',
    description: 'Page size choices shown in the paginator.',
  },
  {
    name: 'selectionMode',
    type: "'single' | 'multiple'",
    description: 'single selects on row click, multiple adds a checkbox column.',
  },
  {
    name: 'selection',
    type: 'model<T | T[]>',
    description: 'Two-way bound selected row(s).',
  },
  {
    name: 'globalFilter',
    type: 'model<string>',
    default: "''",
    description: 'Case-insensitive filter matched against all column fields; two-way bindable.',
  },
  {
    name: 'showGlobalFilter',
    type: 'boolean',
    default: 'false',
    description: 'Shows a search input for globalFilter above the table.',
  },
  {
    name: 'globalFilterPlaceholder',
    type: 'string',
    default: "'Search…'",
    description: 'Placeholder of the built-in global filter input.',
  },
  {
    name: 'filterDisplay',
    type: "'row' | 'menu'",
    default: "'row'",
    description:
      "How filterable columns present their filter: row shows an inline input row below the headers, menu shows a funnel icon in each header that opens a popup with match-mode constraints joined by AND/OR.",
  },
  {
    name: 'columnToggleLabel',
    type: 'string',
    default: "'Columns'",
    description: 'Text of the column-chooser button, e.g. for translation.',
  },
  {
    name: 'showExport',
    type: 'boolean',
    default: 'false',
    description: 'Shows an export button in the toolbar that calls exportCSV.',
  },
  {
    name: 'exportLabel',
    type: 'string',
    default: "'Export CSV'",
    description: 'Text of the export button, e.g. for translation.',
  },
  {
    name: 'csvSeparator',
    type: 'string',
    default: "','",
    description: 'Value separator used by exportCSV.',
  },
  {
    name: 'exportFilename',
    type: 'string',
    default: "'download'",
    description: 'File name (without extension) used by exportCSV.',
  },
  {
    name: 'exportCSV(options?)',
    type: 'method',
    description:
      'Downloads the current view (visible columns, filtered and sorted rows) as a CSV file; toCSV() returns the same data as a string.',
  },
  { name: 'striped', type: 'boolean', default: 'false', description: 'Alternating row background.' },
  { name: 'showGridlines', type: 'boolean', default: 'false', description: 'Cell borders on all sides.' },
  { name: 'rowHover', type: 'boolean', default: 'false', description: 'Hover highlight on rows.' },
  { name: 'sortField', type: 'model<string>', description: 'Field the table is sorted by.' },
  { name: 'sortOrder', type: 'model<1 | -1>', default: '1', description: '1 ascending, -1 descending.' },
  { name: 'emptyMessage', type: 'string', default: "'No records found'", description: 'Text shown without rows.' },
  { name: 'onSort', type: 'output<TableSortEvent>', description: 'Emitted when the sort changes.' },
  { name: 'onPage', type: 'output<TablePageEvent>', description: 'Emitted when the page or page size changes.' },
  { name: 'onFilter', type: 'output<TableFilterEvent>', description: 'Emitted when a column filter changes.' },
  {
    name: 'onColumnReorder',
    type: 'output<TableColumnReorderEvent>',
    description: 'Emitted when the user reorders a column via drag & drop.',
  },
  {
    name: 'onLazyLoad',
    type: 'output<TableLazyLoadEvent>',
    description: 'Emitted in lazy mode whenever the page, sort or a filter changes.',
  },
];

const COLUMN_PROPS: PropRow[] = [
  {
    name: 'field',
    type: 'string',
    description: 'Row property shown in this column; supports nested a.b paths.',
  },
  { name: 'header', type: 'string', description: 'Column header text.' },
  { name: 'sortable', type: 'boolean', default: 'false', description: 'Enables sorting by field.' },
  {
    name: 'filterable',
    type: 'boolean',
    default: 'false',
    description: 'Adds a filter input for field to the table filter row.',
  },
  {
    name: 'filterMatchMode',
    type: "'contains' | 'notContains' | 'startsWith' | 'endsWith' | 'equals' | 'notEquals'",
    default: "'contains'",
    description: 'How the filter input is matched against the cell value (select filters always match exactly).',
  },
  {
    name: 'filterMatchModeOptions',
    type: 'TableFilterMatchMode[]',
    description: 'Match modes offered in the filter menu (filterDisplay="menu"); defaults to all six text modes.',
  },
  {
    name: 'filterType',
    type: "'text' | 'select'",
    default: "'text'",
    description: 'Renders the column filter as a dropdown of choices instead of a text input.',
  },
  {
    name: 'filterOptions',
    type: 'unknown[]',
    description: 'Choices of a select filter; the column’s distinct values when omitted.',
  },
  {
    name: 'filterPlaceholder',
    type: 'string',
    description: 'Placeholder of the filter input (the "All" choice of a select filter).',
  },
  {
    name: 'hidden',
    type: 'boolean',
    default: 'false',
    description: 'Hides the column (also removes it from the column-toggle list).',
  },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Table, Column, CurrencyPipe, DocsSection, DocsPropTable],
  styles: `
    .stock {
      display: inline-block;
      padding: 0.125rem 0.5rem;
      border-radius: var(--syui-border-radius-sm);
      background: var(--syui-success-background);
      color: var(--syui-success-color);
      font-size: 0.875rem;
      font-weight: 600;
    }
    .stock.out {
      background: var(--syui-danger-background);
      color: var(--syui-danger-color);
    }
  `,
  template: `
    <h1>Table</h1>
    <p class="docs-lead">
      Data table with column sorting, pagination, global and per-column filtering, row selection,
      drag &amp; drop column reordering and custom cell templates.
      <code>import {{ '{' }} Table, Column {{ '}' }} from '&#64;swipergy/swipyui/table';</code>
    </p>

    <docs-section title="Basic" [code]="basic" language="html">
      <syui-table [value]="products.slice(0, 5)">
        <syui-column field="name" header="Name" />
        <syui-column field="category" header="Category" />
        <syui-column field="price" header="Price" />
      </syui-table>
    </docs-section>

    <docs-section
      title="Sortable"
      [code]="sort"
      language="html"
      description="Clicking a sortable header cycles ascending, descending and unsorted."
    >
      <syui-table [value]="products.slice(0, 6)" striped>
        <syui-column field="name" header="Name" sortable />
        <syui-column field="category" header="Category" sortable />
        <syui-column field="price" header="Price" sortable />
      </syui-table>
    </docs-section>

    <docs-section title="Pagination" [code]="pagination" language="html">
      <syui-table [value]="products" paginator rows="5" [rowsPerPageOptions]="[5, 10, 20]">
        <syui-column field="name" header="Name" sortable />
        <syui-column field="category" header="Category" sortable />
        <syui-column field="price" header="Price" sortable />
      </syui-table>
    </docs-section>

    <docs-section
      title="Cell templates"
      [code]="template"
      language="html"
      description="Project an ng-template into a column for custom cells; the row is the implicit template variable."
    >
      <syui-table [value]="products.slice(0, 6)">
        <syui-column field="name" header="Name" />
        <syui-column field="price" header="Price" sortable>
          <ng-template let-product>{{ product.price | currency }}</ng-template>
        </syui-column>
        <syui-column header="Status">
          <ng-template let-product>
            <span class="stock" [class.out]="product.quantity === 0">
              {{ product.quantity === 0 ? 'Out of stock' : 'In stock' }}
            </span>
          </ng-template>
        </syui-column>
      </syui-table>
    </docs-section>

    <docs-section title="Single selection" [code]="singleSelection" language="html">
      <syui-table
        [value]="products.slice(0, 5)"
        dataKey="id"
        selectionMode="single"
        [(selection)]="selected"
      >
        <syui-column field="name" header="Name" />
        <syui-column field="category" header="Category" />
      </syui-table>
      <span class="docs-muted">selected: {{ $any(selected())?.name ?? 'none' }}</span>
    </docs-section>

    <docs-section title="Multiple selection" [code]="multipleSelection" language="html">
      <syui-table
        [value]="products.slice(0, 5)"
        dataKey="id"
        selectionMode="multiple"
        [(selection)]="selectedRows"
      >
        <syui-column field="name" header="Name" />
        <syui-column field="category" header="Category" />
      </syui-table>
      <span class="docs-muted">{{ $any(selectedRows())?.length ?? 0 }} rows selected</span>
    </docs-section>

    <docs-section
      title="Global filter"
      [code]="filter"
      language="html"
      description="showGlobalFilter puts a search input on top of the table that matches the fields of all columns; pagination follows the filtered result."
    >
      <syui-table [value]="products" paginator rows="5" showGlobalFilter>
        <syui-column field="name" header="Name" sortable />
        <syui-column field="category" header="Category" sortable />
        <syui-column field="price" header="Price" sortable />
      </syui-table>
    </docs-section>

    <docs-section
      title="Column filters"
      [code]="columnFilter"
      language="html"
      description="filterable adds a filter row below the column headers; filterMatchMode controls how text filters are matched, and filterType='select' turns a column's filter into a dropdown of its distinct values (customizable via filterOptions) that matches exactly."
    >
      <syui-table [value]="products" paginator rows="5">
        <syui-column field="name" header="Name" sortable filterable filterPlaceholder="Search name" />
        <syui-column field="category" header="Category" filterable filterType="select" />
        <syui-column field="price" header="Price" sortable />
      </syui-table>
    </docs-section>

    <docs-section
      title="Filter menu"
      [code]="filterMenu"
      language="html"
      description="filterDisplay='menu' replaces the inline filter row with a funnel icon in each filterable header; the icon opens a popup where text columns take one or more match-mode constraints (Starts with, Contains, Not contains, Ends with, Equals, Not equals) joined by Match All (AND) or Match Any (OR), and select columns show their dropdown. Restrict the modes offered per column with filterMatchModeOptions."
    >
      <syui-table [value]="products" paginator rows="5" filterDisplay="menu">
        <syui-column field="name" header="Name" sortable filterable filterPlaceholder="Search name" />
        <syui-column field="category" header="Category" filterable filterType="select" />
        <syui-column
          field="price"
          header="Price"
          sortable
          filterable
          [filterMatchModeOptions]="['equals', 'notEquals', 'startsWith']"
        />
      </syui-table>
    </docs-section>

    <docs-section
      title="Column toggle"
      [code]="columnToggle"
      language="html"
      description="columnToggle adds a Columns button that lets users hide columns to save screen space; the two-way hiddenColumns binding makes the selection persistable."
    >
      <syui-table [value]="products.slice(0, 5)" columnToggle [(hiddenColumns)]="hiddenColumns">
        <syui-column field="name" header="Name" />
        <syui-column field="category" header="Category" />
        <syui-column field="price" header="Price" />
        <syui-column field="quantity" header="Quantity" />
      </syui-table>
      <span class="docs-muted">hidden: {{ hiddenColumns().join(', ') || 'none' }}</span>
    </docs-section>

    <docs-section
      title="Column reorder"
      [code]="columnReorder"
      language="html"
      description="reorderableColumns lets users rearrange columns by dragging a header onto another; the drop side is indicated while dragging, and the two-way columnOrder binding makes the arrangement persistable."
    >
      <syui-table [value]="products.slice(0, 5)" reorderableColumns [(columnOrder)]="columnOrder">
        <syui-column field="name" header="Name" />
        <syui-column field="category" header="Category" />
        <syui-column field="price" header="Price" />
        <syui-column field="quantity" header="Quantity" />
      </syui-table>
      <span class="docs-muted">order: {{ columnOrder().join(', ') || 'as declared' }}</span>
    </docs-section>

    <docs-section
      title="CSV export"
      [code]="csvExport"
      language="html"
      description="showExport adds an Export CSV button to the toolbar; it downloads the current view — visible columns, filtered and sorted rows across all pages — as a CSV file."
    >
      <syui-table [value]="products.slice(0, 5)" showExport exportFilename="products">
        <syui-column field="name" header="Name" />
        <syui-column field="category" header="Category" />
        <syui-column field="price" header="Price" />
      </syui-table>
    </docs-section>

    <docs-section
      title="Server-side (lazy)"
      [code]="server"
      language="html"
      description="With lazy the table renders value as-is and delegates paging, sorting and filtering to you: interactions update the two-way bound first/sortField/sortOrder and emit onLazyLoad. Feed those signals into an httpResource and bind its value, totalRecords and isLoading back — here against a mock endpoint with 200 rows and artificial latency."
    >
      <syui-table
        lazy
        paginator
        [value]="customerPage()?.data ?? []"
        [totalRecords]="customerPage()?.totalRecords ?? 0"
        [loading]="customers.isLoading()"
        [rows]="lazyRows()"
        [rowsPerPageOptions]="[5, 10, 20]"
        [(first)]="lazyFirst"
        [(sortField)]="lazySortField"
        [(sortOrder)]="lazySortOrder"
        (onPage)="lazyRows.set($event.rows)"
      >
        <syui-column field="name" header="Name" sortable />
        <syui-column field="country" header="Country" sortable />
        <syui-column field="company" header="Company" />
        <syui-column field="balance" header="Balance" sortable>
          <ng-template let-customer>{{ customer.balance | currency }}</ng-template>
        </syui-column>
      </syui-table>
    </docs-section>

    <h2>Table properties</h2>
    <docs-prop-table [props]="props" />
    <h2>Column properties</h2>
    <docs-prop-table [props]="columnProps" />
  `,
})
export class TableDemo {
  readonly basic = BASIC;
  readonly sort = SORT;
  readonly pagination = PAGINATION;
  readonly template = TEMPLATE;
  readonly singleSelection = SINGLE_SELECTION;
  readonly multipleSelection = MULTIPLE_SELECTION;
  readonly filter = FILTER;
  readonly csvExport = EXPORT;
  readonly columnFilter = COLUMN_FILTER;
  readonly filterMenu = FILTER_MENU;
  readonly columnToggle = COLUMN_TOGGLE;
  readonly columnReorder = COLUMN_REORDER;
  readonly server = SERVER;
  readonly props = PROPS;
  readonly columnProps = COLUMN_PROPS;

  readonly products = PRODUCTS;
  readonly selected = signal<Product | Product[] | null>(null);
  readonly selectedRows = signal<Product | Product[] | null>([]);

  readonly hiddenColumns = signal<string[]>([]);
  readonly columnOrder = signal<string[]>([]);

  readonly lazyFirst = signal(0);
  readonly lazyRows = signal(5);
  readonly lazySortField = signal<string | null>(null);
  readonly lazySortOrder = signal<1 | -1>(1);

  readonly customers = httpResource<CustomerPage>(() => ({
    url: '/api/customers',
    params: {
      first: this.lazyFirst(),
      rows: this.lazyRows(),
      ...(this.lazySortField()
        ? { sortField: this.lazySortField()!, sortOrder: this.lazySortOrder() }
        : {}),
    },
  }));

  /** Last loaded page, held while the next request is in flight so rows don't flash empty. */
  readonly customerPage = linkedSignal<CustomerPage | undefined, CustomerPage | undefined>({
    source: () => (this.customers.hasValue() ? this.customers.value() : undefined),
    computation: (page, previous) => page ?? previous?.value,
  });
}
