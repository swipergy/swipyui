import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Paginator, PaginatorPageEvent } from '@swipergy/swipyui/paginator';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `<syui-paginator [totalRecords]="120" rows="10" />`;

const ROWS_PER_PAGE = `<syui-paginator [totalRecords]="120" rows="10" [rowsPerPageOptions]="[10, 20, 50]" />`;

const EVENTS = `first = signal(0);

onPage(event: PaginatorPageEvent) {
  // { first, rows, page, pageCount }
  this.load(event.first, event.rows);
}

<syui-paginator [totalRecords]="120" rows="10" [(first)]="first" (onPage)="onPage($event)" />`;

const PROPS: PropRow[] = [
  {
    name: 'totalRecords',
    type: 'number',
    default: '0',
    description: 'Total number of records across all pages.',
  },
  { name: 'rows', type: 'number', default: '10', description: 'Rows per page.' },
  {
    name: 'rowsPerPageOptions',
    type: 'number[]',
    description: 'Page size choices shown in the rows-per-page select.',
  },
  {
    name: 'first',
    type: 'model<number>',
    default: '0',
    description: 'Two-way bound index of the first record on the current page.',
  },
  {
    name: 'onPage',
    type: 'output<PaginatorPageEvent>',
    description: 'Emitted on page or page size changes with { first, rows, page, pageCount }.',
  },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Paginator, DocsSection, DocsPropTable],
  template: `
    <h1>Paginator</h1>
    <p class="docs-lead">
      Standalone pagination bar with a page report, first/previous/numbered/next/last buttons and
      an optional rows-per-page select — the same paginator the table uses, for any paged content.
      <code>import {{ '{' }} Paginator {{ '}' }} from '&#64;swipergy/swipyui/paginator';</code>
    </p>

    <docs-section title="Basic" [code]="basic" language="html">
      <syui-paginator [totalRecords]="120" rows="10" />
    </docs-section>

    <docs-section
      title="Rows per page"
      [code]="rowsPerPage"
      language="html"
      description="rowsPerPageOptions adds a page size select; changing it resets to the first page."
    >
      <syui-paginator [totalRecords]="120" rows="10" [rowsPerPageOptions]="[10, 20, 50]" />
    </docs-section>

    <docs-section
      title="Two-way binding and events"
      [code]="events"
      language="typescript"
      description="first is a two-way bindable model; onPage carries everything needed to load a page lazily."
    >
      <syui-paginator [totalRecords]="120" rows="10" [(first)]="first" (onPage)="onPage($event)" />
      <span class="docs-muted">
        first: {{ first() }}, last event: {{ lastEvent() ?? 'none' }}
      </span>
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
})
export class PaginatorDemo {
  readonly basic = BASIC;
  readonly rowsPerPage = ROWS_PER_PAGE;
  readonly events = EVENTS;
  readonly props = PROPS;

  readonly first = signal(0);
  readonly lastEvent = signal<string | null>(null);

  onPage(event: PaginatorPageEvent): void {
    this.lastEvent.set(JSON.stringify(event));
  }
}
