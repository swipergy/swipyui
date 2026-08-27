import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  TemplateRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChild,
  inject,
  input,
  linkedSignal,
  model,
  numberAttribute,
  output,
  signal,
} from '@angular/core';
import { Paginator, PaginatorPageEvent } from '@swipergy/swipyui/paginator';

/**
 * Marks the `ng-template` rendered per item in the list layout of
 * `<syui-data-view>`. Context: `$implicit` item, `index`.
 */
@Directive({ selector: 'ng-template[syuiDataViewListItem]' })
export class DataViewListItem {
  readonly template = inject(TemplateRef);
}

/**
 * Marks the `ng-template` rendered per item in the grid layout of
 * `<syui-data-view>`. Context: `$implicit` item, `index`.
 */
@Directive({ selector: 'ng-template[syuiDataViewGridItem]' })
export class DataViewGridItem {
  readonly template = inject(TemplateRef);
}

/**
 * Displays a collection in a list or grid layout with an optional built-in
 * paginator. Item rendering is fully
 * template driven; when both a list and a grid template are projected, a
 * header with layout toggle buttons is shown.
 *
 * ```html
 * <syui-data-view [value]="products" [(layout)]="layout" paginator rows="6">
 *   <ng-template syuiDataViewListItem let-product>{{ product.name }}</ng-template>
 *   <ng-template syuiDataViewGridItem let-product>{{ product.name }}</ng-template>
 * </syui-data-view>
 * ```
 */
@Component({
  selector: 'syui-data-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './dataview.css',
  imports: [NgTemplateOutlet, Paginator],
  host: { class: 'syui-data-view' },
  template: `
    @if (showHeader()) {
      <div class="syui-data-view-header">
        <div class="syui-data-view-layout-options" role="group" aria-label="Layout">
          <button
            type="button"
            class="syui-data-view-layout-button"
            aria-label="List view"
            [class.syui-data-view-layout-button-active]="effectiveLayout() === 'list'"
            [attr.aria-pressed]="effectiveLayout() === 'list'"
            (click)="layout.set('list')"
          >
            <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M1.5 2.5H10.5M1.5 6H10.5M1.5 9.5H10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
          </button>
          <button
            type="button"
            class="syui-data-view-layout-button"
            aria-label="Grid view"
            [class.syui-data-view-layout-button-active]="effectiveLayout() === 'grid'"
            [attr.aria-pressed]="effectiveLayout() === 'grid'"
            (click)="layout.set('grid')"
          >
            <svg viewBox="0 0 12 12" aria-hidden="true">
              <rect x="1.5" y="1.5" width="4" height="4" rx="1" fill="currentColor" />
              <rect x="6.5" y="1.5" width="4" height="4" rx="1" fill="currentColor" />
              <rect x="1.5" y="6.5" width="4" height="4" rx="1" fill="currentColor" />
              <rect x="6.5" y="6.5" width="4" height="4" rx="1" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>
    }
    <div
      class="syui-data-view-content"
      [attr.role]="pagedItems().length ? 'list' : null"
      [class.syui-data-view-list]="effectiveLayout() === 'list'"
      [class.syui-data-view-grid]="effectiveLayout() === 'grid'"
    >
      @for (item of pagedItems(); track $index) {
        @if (activeTemplate(); as template) {
          <div class="syui-data-view-item" role="listitem">
            <ng-container
              [ngTemplateOutlet]="template"
              [ngTemplateOutletContext]="{ $implicit: item, index: effectiveFirst() + $index }"
            />
          </div>
        }
      } @empty {
        <div class="syui-data-view-empty">{{ emptyMessage() }}</div>
      }
    </div>
    <span class="syui-data-view-status" role="status">{{ statusMessage() }}</span>
    @if (paginator()) {
      <syui-paginator
        [totalRecords]="value().length"
        [rows]="rows()"
        [rowsPerPageOptions]="rowsPerPageOptions()"
        [first]="first()"
        (onPage)="onPageChange($event)"
      />
    }
  `,
})
export class DataView<T = any> {
  /** Items to display. */
  readonly value = input<T[]>([]);
  /** Active layout; supports two-way binding. */
  readonly layout = model<'list' | 'grid'>('list');
  /** Shows the paginator below the content. */
  readonly paginator = input(false, { transform: booleanAttribute });
  /** Items per page when `paginator` is on. */
  readonly rows = input(10, { transform: numberAttribute });
  /** Page size choices shown in the paginator. */
  readonly rowsPerPageOptions = input<number[]>();
  readonly emptyMessage = input('No records found');

  readonly onPage = output<PaginatorPageEvent>();

  protected readonly listTemplate = contentChild(DataViewListItem);
  protected readonly gridTemplate = contentChild(DataViewGridItem);

  protected readonly first = signal(0);
  protected readonly pageSize = linkedSignal(() => this.rows());

  /** Layout toggle header is shown when both item templates are projected. */
  protected readonly showHeader = computed(() => !!this.listTemplate() && !!this.gridTemplate());

  /** Requested layout, falling back to the only projected template. */
  protected readonly effectiveLayout = computed<'list' | 'grid'>(() => {
    if (this.layout() === 'grid') {
      return this.gridTemplate() || !this.listTemplate() ? 'grid' : 'list';
    }
    return this.listTemplate() || !this.gridTemplate() ? 'list' : 'grid';
  });

  protected readonly activeTemplate = computed<TemplateRef<unknown> | undefined>(() =>
    this.effectiveLayout() === 'grid'
      ? this.gridTemplate()?.template
      : this.listTemplate()?.template,
  );

  /** `first`, clamped so a shrinking collection never leaves a page past the end. */
  protected readonly effectiveFirst = computed(() => {
    if (!this.paginator()) {
      return 0;
    }
    const size = Math.max(1, this.pageSize());
    const pageCount = Math.max(1, Math.ceil(this.value().length / size));
    return Math.max(0, Math.min(this.first(), (pageCount - 1) * size));
  });

  protected readonly pagedItems = computed(() => {
    if (!this.paginator()) {
      return this.value();
    }
    const first = this.effectiveFirst();
    return this.value().slice(first, first + this.pageSize());
  });

  /** Status text reflecting the current layout and page. */
  protected readonly statusMessage = computed(() => {
    const layout = this.effectiveLayout() === 'grid' ? 'Grid' : 'List';
    if (!this.paginator()) {
      return `${layout} view, ${this.value().length} items`;
    }
    const size = Math.max(1, this.pageSize());
    const pageCount = Math.max(1, Math.ceil(this.value().length / size));
    return `${layout} view, page ${Math.floor(this.effectiveFirst() / size) + 1} of ${pageCount}`;
  });

  protected onPageChange(event: PaginatorPageEvent): void {
    this.first.set(event.first);
    this.pageSize.set(event.rows);
    this.onPage.emit(event);
  }
}
