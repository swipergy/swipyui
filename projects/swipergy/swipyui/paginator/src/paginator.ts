import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
  linkedSignal,
  model,
  numberAttribute,
  output,
} from '@angular/core';

export interface PaginatorPageEvent {
  /** Index of the first record on the page. */
  first: number;
  /** Rows per page. */
  rows: number;
  /** Zero-based index of the page. */
  page: number;
  /** Total number of pages. */
  pageCount: number;
}

/**
 * Standalone pagination bar for any paged content: page report,
 * first/previous/numbered/next/last buttons and an optional rows-per-page
 * select, matching the built-in table paginator.
 *
 * ```html
 * <syui-paginator
 *   [totalRecords]="120"
 *   rows="10"
 *   [rowsPerPageOptions]="[10, 20, 50]"
 *   [(first)]="first"
 *   (onPage)="load($event)"
 * />
 * ```
 */
@Component({
  selector: 'syui-paginator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './paginator.css',
  host: {
    class: 'syui-paginator',
    role: 'navigation',
    '[attr.aria-label]': 'ariaLabel()',
  },
  template: `
    <span class="syui-paginator-page-report">
      @if (totalRecords() === 0) {
        0 of 0
      } @else {
        {{ effectiveFirst() + 1 }}–{{ pageEnd() }} of {{ totalRecords() }}
      }
    </span>
    <div class="syui-paginator-page-buttons">
      <button
        type="button"
        class="syui-paginator-page-button"
        aria-label="First page"
        [disabled]="currentPage() === 0"
        (click)="goToPage(0)"
      >
        <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M7.5 2.5L4 6L7.5 9.5M9.5 2.5V9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" transform="rotate(180 6 6)" />
        </svg>
      </button>
      <button
        type="button"
        class="syui-paginator-page-button"
        aria-label="Previous page"
        [disabled]="currentPage() === 0"
        (click)="goToPage(currentPage() - 1)"
      >
        <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M7.5 2.5L4 6L7.5 9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
      @for (page of pageLinks(); track page) {
        <button
          type="button"
          class="syui-paginator-page-button"
          [class.syui-paginator-page-button-active]="page === currentPage()"
          [attr.aria-label]="'Page ' + (page + 1)"
          [attr.aria-current]="page === currentPage() ? 'page' : null"
          (click)="goToPage(page)"
        >
          {{ page + 1 }}
        </button>
      }
      <button
        type="button"
        class="syui-paginator-page-button"
        aria-label="Next page"
        [disabled]="currentPage() >= pageCount() - 1"
        (click)="goToPage(currentPage() + 1)"
      >
        <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M4.5 2.5L8 6L4.5 9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
      <button
        type="button"
        class="syui-paginator-page-button"
        aria-label="Last page"
        [disabled]="currentPage() >= pageCount() - 1"
        (click)="goToPage(pageCount() - 1)"
      >
        <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M4.5 2.5L8 6L4.5 9.5M2.5 2.5V9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" transform="rotate(180 6 6)" />
        </svg>
      </button>
    </div>
    @if (rowsPerPageOptions(); as options) {
      <select
        class="syui-paginator-rows-select"
        aria-label="Rows per page"
        [value]="pageSize()"
        (change)="setPageSize($event)"
      >
        @for (option of options; track option) {
          <option [value]="option">{{ option }}</option>
        }
      </select>
    }
  `,
})
export class Paginator {
  /** Total number of records across all pages. */
  readonly totalRecords = input(0, { transform: numberAttribute });
  /** Rows per page. */
  readonly rows = input(10, { transform: numberAttribute });
  /** Page size choices shown in the rows-per-page select. */
  readonly rowsPerPageOptions = input<number[]>();
  /** Index of the first record on the current page; supports two-way binding. */
  readonly first = model(0);
  /** Accessible name of the pagination landmark, e.g. for translation. */
  readonly ariaLabel = input('Pagination');

  readonly onPage = output<PaginatorPageEvent>();

  protected readonly pageSize = linkedSignal(() => this.rows());

  protected readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(this.totalRecords() / Math.max(1, this.pageSize()))),
  );

  /** `first`, clamped so a shrinking record set never leaves a page past the end. */
  protected readonly effectiveFirst = computed(() => {
    const size = Math.max(1, this.pageSize());
    return Math.max(0, Math.min(this.first(), (this.pageCount() - 1) * size));
  });

  protected readonly currentPage = computed(() =>
    Math.floor(this.effectiveFirst() / Math.max(1, this.pageSize())),
  );

  protected readonly pageEnd = computed(() =>
    Math.min(this.effectiveFirst() + this.pageSize(), this.totalRecords()),
  );

  /** Up to five page numbers centered on the current page. */
  protected readonly pageLinks = computed(() => {
    const count = this.pageCount();
    const visible = Math.min(5, count);
    let start = Math.max(0, this.currentPage() - Math.floor(visible / 2));
    start = Math.min(start, count - visible);
    return Array.from({ length: visible }, (_, i) => start + i);
  });

  protected goToPage(page: number): void {
    const target = Math.max(0, Math.min(page, this.pageCount() - 1));
    const first = target * this.pageSize();
    this.first.set(first);
    this.onPage.emit({
      first,
      rows: this.pageSize(),
      page: target,
      pageCount: this.pageCount(),
    });
  }

  protected setPageSize(event: Event): void {
    this.pageSize.set(Number((event.target as HTMLSelectElement).value));
    this.first.set(0);
    this.onPage.emit({
      first: 0,
      rows: this.pageSize(),
      page: 0,
      pageCount: this.pageCount(),
    });
  }
}
