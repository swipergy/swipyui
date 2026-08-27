import { NgTemplateOutlet } from '@angular/common';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChild,
  contentChildren,
  inject,
  input,
  linkedSignal,
  model,
  numberAttribute,
  output,
  signal,
  viewChild,
} from '@angular/core';

export interface TableSortEvent {
  field: string | null;
  order: 1 | -1;
}

export interface TablePageEvent {
  /** Index of the first row on the page. */
  first: number;
  /** Rows per page. */
  rows: number;
}

export type TableFilterMatchMode =
  | 'contains'
  | 'notContains'
  | 'startsWith'
  | 'endsWith'
  | 'equals'
  | 'notEquals';

/** Joins the constraints of a column's filter menu: match all (AND) or any (OR). */
export type TableFilterOperator = 'and' | 'or';

/** One rule of a column's filter menu. */
export interface TableFilterConstraint {
  value: string;
  matchMode: TableFilterMatchMode;
}

/** A column's filter state: one or more constraints joined by an operator. */
export interface TableColumnFilterMeta {
  operator: TableFilterOperator;
  constraints: TableFilterConstraint[];
}

export interface TableFilterEvent {
  field: string;
  value: string;
}

export interface TableColumnReorderEvent {
  /** Index of the dragged column among the visible columns before the move. */
  dragIndex: number;
  /** Index of the dragged column among the visible columns after the move. */
  dropIndex: number;
}

/** Full table state emitted in `lazy` mode whenever the page, sort or a filter changes. */
export interface TableLazyLoadEvent {
  /** Index of the first requested row. */
  first: number;
  /** Rows per page. */
  rows: number;
  sortField: string | null;
  sortOrder: 1 | -1;
  /** First-constraint filter value per column, keyed by field (for simple back ends). */
  filters: Record<string, string>;
  /** Full per-column filter state (constraints and operator), keyed by field. */
  filterMeta: Record<string, TableColumnFilterMeta>;
  globalFilter: string;
}

/** Resolve a possibly nested field path like `country.name`. */
function resolveField(row: unknown, field: string): unknown {
  return field
    .split('.')
    .reduce<unknown>((value, key) => (value as Record<string, unknown> | undefined)?.[key], row);
}

function compareValues(a: unknown, b: unknown): number {
  if (a == null && b == null) {
    return 0;
  }
  if (a == null) {
    return -1;
  }
  if (b == null) {
    return 1;
  }
  if (typeof a === 'string' && typeof b === 'string') {
    return a.localeCompare(b);
  }
  return (a as number) < (b as number) ? -1 : (a as number) > (b as number) ? 1 : 0;
}

function matchesFilter(value: unknown, query: string, matchMode: TableFilterMatchMode): boolean {
  const text = String(value ?? '').toLowerCase();
  switch (matchMode) {
    case 'startsWith':
      return text.startsWith(query);
    case 'endsWith':
      return text.endsWith(query);
    case 'equals':
      return text === query;
    case 'notEquals':
      return text !== query;
    case 'notContains':
      return !text.includes(query);
    default:
      return text.includes(query);
  }
}

/**
 * Declares one column of `<syui-table>`. Renders `field` of each row by
 * default; project an `ng-template` for custom cells:
 *
 * ```html
 * <syui-column field="price" header="Price" sortable>
 *   <ng-template let-row let-rowIndex="rowIndex">{{ row.price | currency }}</ng-template>
 * </syui-column>
 * ```
 */
@Component({
  selector: 'syui-column',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '',
})
export class Column {
  /** Property of the row object shown in this column; supports `a.b` paths. */
  readonly field = input<string>();
  /** Text shown in the column header. */
  readonly header = input('');
  /** Enables sorting by `field` from the column header. */
  readonly sortable = input(false, { transform: booleanAttribute });
  /** Adds a filter input for `field` to the table's filter row. */
  readonly filterable = input(false, { transform: booleanAttribute });
  /** How the filter input is matched against the cell value (`select` filters always match exactly). */
  readonly filterMatchMode = input<TableFilterMatchMode>('contains');
  /** Match modes offered in the filter menu (`filterDisplay="menu"`); defaults to all six text modes. */
  readonly filterMatchModeOptions = input<TableFilterMatchMode[]>();
  /** Renders the column filter as a dropdown of choices instead of a text input. */
  readonly filterType = input<'text' | 'select'>('text');
  /** Choices of a `select` filter; the column's distinct values when omitted. */
  readonly filterOptions = input<unknown[]>();
  /** Placeholder of the filter input (the "all" choice of a `select` filter). */
  readonly filterPlaceholder = input('');
  /** Hides the column (also removes it from the column-toggle list). */
  readonly hidden = input(false, { transform: booleanAttribute });

  /** Custom cell template; context: `$implicit` row, `rowIndex`, `field`. */
  readonly cellTemplate = contentChild(TemplateRef);
}

/**
 * Data table with column sorting, optional pagination, global and per-column
 * filtering, row selection and drag & drop column reordering.
 *
 * ```html
 * <syui-table [value]="products" paginator rows="5" selectionMode="single" [(selection)]="selected">
 *   <syui-column field="name" header="Name" sortable />
 *   <syui-column field="price" header="Price" sortable />
 * </syui-table>
 * ```
 *
 * With `lazy`, sorting, filtering and pagination are delegated to the server:
 * `value` is rendered as-is as the current page, `totalRecords` drives the
 * paginator, and every interaction updates the `first`/`sortField`/`sortOrder`
 * models and emits `onLazyLoad`. Pairs with `httpResource`:
 *
 * ```html
 * <syui-table lazy paginator [value]="page.value()?.data ?? []"
 *           [totalRecords]="page.value()?.totalRecords ?? 0"
 *           [loading]="page.isLoading()" [(first)]="first"
 *           [(sortField)]="sortField" [(sortOrder)]="sortOrder">
 * ```
 */
@Component({
  selector: 'syui-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './table.css',
  imports: [NgTemplateOutlet],
  host: {
    class: 'syui-table',
    '[class.syui-table-striped]': 'striped()',
    '[class.syui-table-gridlines]': 'showGridlines()',
    '[class.syui-table-hoverable]': 'rowHover() || selectionMode() !== null',
    '[class.syui-table-loading]': 'loading()',
    '(document:click)': 'onDocumentClick($event)',
  },
  template: `
    @if (showGlobalFilter() || columnToggle() || showExport()) {
      <div class="syui-table-toolbar">
        @if (columnToggle()) {
          <div class="syui-table-column-toggle" (keydown.escape)="closeColumnToggle()">
            <button
              type="button"
              class="syui-table-toolbar-button syui-table-column-toggle-button"
              aria-haspopup="dialog"
              [attr.aria-expanded]="columnToggleOpen()"
              (click)="columnToggleOpen.set(!columnToggleOpen())"
            >
              <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <rect x="1.75" y="2.75" width="12.5" height="10.5" rx="1.5" stroke="currentColor" stroke-width="1.5" />
                <path d="M6.1 2.75v10.5M9.9 2.75v10.5" stroke="currentColor" stroke-width="1.5" />
              </svg>
              {{ columnToggleLabel() }}
            </button>
            @if (columnToggleOpen()) {
              <div class="syui-table-column-toggle-panel" role="dialog" [attr.aria-label]="columnToggleLabel()">
                @for (col of toggleableColumns(); track col) {
                  <label class="syui-table-column-toggle-option">
                    <input
                      type="checkbox"
                      class="syui-table-checkbox"
                      [checked]="!isColumnHidden(col)"
                      (change)="toggleColumn(col)"
                    />
                    {{ col.header() || col.field() }}
                  </label>
                }
              </div>
            }
          </div>
        }
        @if (showExport()) {
          <button
            type="button"
            class="syui-table-toolbar-button syui-table-export-button"
            (click)="exportCSV()"
          >
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M8 2v8M4.75 6.75L8 10l3.25-3.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M2.75 13.25h10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
            {{ exportLabel() }}
          </button>
        }
        @if (showGlobalFilter()) {
          <input
            type="search"
            class="syui-table-global-filter"
            [attr.aria-label]="globalFilterPlaceholder()"
            [placeholder]="globalFilterPlaceholder()"
            [value]="globalFilter()"
            (input)="onGlobalFilterInput($event)"
          />
        }
      </div>
    }

    <div class="syui-table-container" [attr.aria-busy]="loading() || null">
      @if (loading()) {
        <div class="syui-table-loading-overlay">
          <svg class="syui-table-loading-icon" viewBox="0 0 24 24" fill="none" role="img" aria-label="Loading">
            <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2.5" opacity="0.25" />
            <path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
          </svg>
        </div>
      }
      <table [attr.aria-label]="ariaLabel() || null">
        <thead>
          <tr>
            @if (selectionMode() === 'multiple') {
              <th scope="col" class="syui-table-selection-cell">
                <label class="syui-table-checkbox-hit">
                  <input
                    type="checkbox"
                    class="syui-table-checkbox"
                    aria-label="Select all rows"
                    [checked]="allSelected()"
                    [indeterminate]="someSelected()"
                    (change)="toggleAll()"
                  />
                </label>
              </th>
            }
            @for (col of columns(); track col) {
              <th
                scope="col"
                [attr.aria-sort]="col.sortable() ? ariaSort(col) : null"
                [attr.draggable]="reorderableColumns() ? true : null"
                [attr.tabindex]="reorderableColumns() ? 0 : null"
                [class.syui-table-column-dragging]="draggedColumn() === col"
                [class.syui-table-column-drop-before]="isDropTarget(col, false)"
                [class.syui-table-column-drop-after]="isDropTarget(col, true)"
                (dragstart)="onColumnDragStart($event, col)"
                (dragover)="onColumnDragOver($event, col)"
                (drop)="onColumnDrop($event, col)"
                (dragend)="onColumnDragEnd()"
                (keydown)="onColumnKeydown($event, col)"
              >
                <div class="syui-table-header-content">
                  @if (col.sortable() && col.field()) {
                    <button type="button" class="syui-table-sort-button" (click)="sort(col)">
                      {{ col.header() }}
                      <svg class="syui-table-sort-icon" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                        @if (sortField() === col.field() && sortOrder() === 1) {
                          <path d="M6 2.5L9.5 7H2.5L6 2.5Z" fill="currentColor" />
                        } @else if (sortField() === col.field() && sortOrder() === -1) {
                          <path d="M6 9.5L2.5 5H9.5L6 9.5Z" fill="currentColor" />
                        } @else {
                          <path class="syui-table-sort-icon-idle" d="M6 1.5L8.5 4.75H3.5L6 1.5Z" fill="currentColor" />
                          <path class="syui-table-sort-icon-idle" d="M6 10.5L3.5 7.25H8.5L6 10.5Z" fill="currentColor" />
                        }
                      </svg>
                    </button>
                  } @else {
                    <span>{{ col.header() }}</span>
                  }
                  @if (filterDisplay() === 'menu' && col.filterable() && col.field()) {
                    <button
                      type="button"
                      class="syui-table-filter-menu-button"
                      [class.syui-table-filter-menu-button-active]="isColumnFiltered(col)"
                      aria-haspopup="dialog"
                      [attr.aria-expanded]="filterMenuColumn() === col"
                      [attr.aria-label]="'Filter ' + (col.header() || col.field())"
                      (click)="toggleFilterMenu($event, col)"
                    >
                      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path
                          d="M2 3.25h12L9.25 8.5v4l-2.5 1.25V8.5L2 3.25Z"
                          stroke="currentColor"
                          stroke-width="1.5"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </button>
                  }
                </div>
              </th>
            }
          </tr>
          @if (hasFilterRow()) {
            <tr class="syui-table-filter-row">
              @if (selectionMode() === 'multiple') {
                <th scope="col" class="syui-table-selection-cell"></th>
              }
              @for (col of columns(); track col) {
                <th scope="col">
                  @if (col.filterable() && col.field(); as field) {
                    @if (col.filterType() === 'select') {
                      <select
                        class="syui-table-filter-select"
                        [attr.aria-label]="'Filter ' + (col.header() || field)"
                        [value]="filterValue(field)"
                        (change)="onFilterInput(col, $event)"
                      >
                        <option value="">{{ col.filterPlaceholder() || 'All' }}</option>
                        @for (option of filterOptionsFor(field); track option) {
                          <option [value]="option">{{ option }}</option>
                        }
                      </select>
                    } @else {
                      <input
                        type="text"
                        class="syui-table-filter-input"
                        [attr.aria-label]="'Filter ' + (col.header() || field)"
                        [placeholder]="col.filterPlaceholder()"
                        [value]="filterValue(field)"
                        (input)="onFilterInput(col, $event)"
                      />
                    }
                  }
                </th>
              }
            </tr>
          }
        </thead>
        <tbody>
          @for (row of pagedRows(); track rowKey(row, $index)) {
            <tr
              [class.syui-table-row-selected]="isSelected(row)"
              [attr.aria-selected]="selectionMode() ? isSelected(row) : null"
              [attr.tabindex]="selectionMode() === 'single' ? 0 : null"
              (click)="onRowClick(row)"
              (keydown)="onRowKeydown($event, row)"
            >
              @if (selectionMode() === 'multiple') {
                <td class="syui-table-selection-cell">
                  <label class="syui-table-checkbox-hit">
                    <input
                      type="checkbox"
                      class="syui-table-checkbox"
                      [attr.aria-label]="'Select row ' + (effectiveFirst() + $index + 1)"
                      [checked]="isSelected(row)"
                      (change)="toggleRow(row)"
                    />
                  </label>
                </td>
              }
              @for (col of columns(); track col) {
                <td>
                  @if (col.cellTemplate(); as template) {
                    <ng-container
                      [ngTemplateOutlet]="template"
                      [ngTemplateOutletContext]="{
                        $implicit: row,
                        rowIndex: effectiveFirst() + $index,
                        field: col.field(),
                      }"
                    />
                  } @else if (col.field(); as field) {
                    {{ cellValue(row, field) }}
                  }
                </td>
              }
            </tr>
          } @empty {
            <tr class="syui-table-empty-row">
              <td [attr.colspan]="columnCount()">{{ emptyMessage() }}</td>
            </tr>
          }
        </tbody>
      </table>
    </div>

    @if (paginator()) {
      <div class="syui-table-paginator" role="navigation" aria-label="Pagination">
        <span class="syui-table-page-report">
          @if (totalRecords() === 0) {
            0 of 0
          } @else {
            {{ effectiveFirst() + 1 }}–{{ pageEnd() }} of {{ totalRecords() }}
          }
        </span>
        <div class="syui-table-page-buttons">
          <button
            type="button"
            class="syui-table-page-button"
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
            class="syui-table-page-button"
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
              class="syui-table-page-button"
              [class.syui-table-page-button-active]="page === currentPage()"
              [attr.aria-label]="'Page ' + (page + 1)"
              [attr.aria-current]="page === currentPage() ? 'page' : null"
              (click)="goToPage(page)"
            >
              {{ page + 1 }}
            </button>
          }
          <button
            type="button"
            class="syui-table-page-button"
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
            class="syui-table-page-button"
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
            class="syui-table-rows-select"
            aria-label="Rows per page"
            [value]="pageSize()"
            (change)="setPageSize($event)"
          >
            @for (option of options; track option) {
              <option [value]="option">{{ option }}</option>
            }
          </select>
        }
      </div>
    }

    <ng-template #filterMenuPanel>
      @if (filterMenuColumn(); as col) {
        <div
          class="syui-table-filter-menu"
          role="dialog"
          [attr.aria-label]="'Filter ' + (col.header() || col.field())"
          (keydown.escape)="closeFilterMenu()"
        >
          @if (col.filterType() === 'select') {
            <select
              class="syui-table-filter-select"
              [attr.aria-label]="'Filter ' + (col.header() || col.field())"
              [value]="filterValue(col.field())"
              (change)="onMenuSelectChange(col, $event)"
            >
              <option value="">{{ col.filterPlaceholder() || 'All' }}</option>
              @for (option of filterOptionsFor(col.field()!); track option) {
                <option [value]="option">{{ option }}</option>
              }
            </select>
          } @else if (filterMenuDraft(); as draft) {
            @if (draft.constraints.length > 1) {
              <select
                class="syui-table-filter-menu-operator"
                aria-label="Constraint operator"
                [value]="draft.operator"
                (change)="setDraftOperator($event)"
              >
                <option value="and">Match All</option>
                <option value="or">Match Any</option>
              </select>
            }
            <div class="syui-table-filter-menu-constraints">
              @for (constraint of draft.constraints; track $index) {
                <div class="syui-table-filter-menu-constraint">
                  <select
                    class="syui-table-filter-select"
                    aria-label="Match mode"
                    [value]="constraint.matchMode"
                    (change)="setDraftMode($index, $event)"
                  >
                    @for (mode of matchModeOptions(col); track mode) {
                      <option [value]="mode">{{ matchModeLabel(mode) }}</option>
                    }
                  </select>
                  <input
                    type="text"
                    class="syui-table-filter-input"
                    aria-label="Filter value"
                    [placeholder]="col.filterPlaceholder()"
                    [value]="constraint.value"
                    (input)="setDraftValue($index, $event)"
                    (keydown.enter)="applyFilterMenu(col)"
                  />
                  @if (draft.constraints.length > 1) {
                    <button
                      type="button"
                      class="syui-table-filter-menu-remove"
                      aria-label="Remove rule"
                      (click)="removeDraftConstraint($index)"
                    >
                      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M4 8h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                      </svg>
                    </button>
                  }
                </div>
              }
            </div>
            <button type="button" class="syui-table-filter-menu-add" (click)="addDraftConstraint(col)">
              <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M8 4v8M4 8h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              </svg>
              Add Rule
            </button>
            <div class="syui-table-filter-menu-footer">
              <button
                type="button"
                class="syui-table-filter-menu-clear"
                (click)="clearFilterMenu(col)"
              >
                Clear
              </button>
              <button
                type="button"
                class="syui-table-filter-menu-apply"
                (click)="applyFilterMenu(col)"
              >
                Apply
              </button>
            </div>
          }
        </div>
      }
    </ng-template>
  `,
})
export class Table<T = any> implements OnDestroy {
  /** Rows to display. */
  readonly value = input<T[]>([]);
  /** Property that uniquely identifies a row; falls back to reference equality. */
  readonly dataKey = input<string>();
  /** Shows the paginator below the table. */
  readonly paginator = input(false, { transform: booleanAttribute });
  /**
   * Delegates sorting, filtering and pagination to the server: `value` is
   * rendered as-is as the current page and interactions emit `onLazyLoad`.
   */
  readonly lazy = input(false, { transform: booleanAttribute });
  /** Total row count on the server; drives the paginator in `lazy` mode. */
  readonly totalRecordsInput = input(0, { transform: numberAttribute, alias: 'totalRecords' });
  /** Shows a loading overlay above the rows. */
  readonly loading = input(false, { transform: booleanAttribute });
  /** Shows a column-chooser button above the table for hiding/showing columns. */
  readonly columnToggle = input(false, { transform: booleanAttribute });
  /** Text of the column-chooser button, e.g. for translation. */
  readonly columnToggleLabel = input('Columns');
  /** Shows an export button next to the column chooser that calls `exportCSV`. */
  readonly showExport = input(false, { transform: booleanAttribute });
  /** Text of the export button, e.g. for translation. */
  readonly exportLabel = input('Export CSV');
  /** Value separator used by `exportCSV`. */
  readonly csvSeparator = input(',');
  /** File name (without extension) used by `exportCSV`. */
  readonly exportFilename = input('download');
  /**
   * Columns currently hidden by the user, keyed by `field` (or `header` for
   * field-less columns); two-way bindable, e.g. to persist the selection.
   */
  readonly hiddenColumns = model<string[]>([]);
  /** Lets users reorder columns by dragging a column header onto another. */
  readonly reorderableColumns = input(false, { transform: booleanAttribute });
  /**
   * Column display order, keyed like `hiddenColumns`; two-way bindable, e.g.
   * to persist the order. Columns missing from the list keep their declared
   * position after the listed ones.
   */
  readonly columnOrder = model<string[]>([]);
  /** Index of the first displayed row; two-way bindable for server-side pagination. */
  readonly first = model(0);
  /** Rows per page when `paginator` is on. */
  readonly rows = input(10, { transform: numberAttribute });
  /** Page size choices shown in the paginator. */
  readonly rowsPerPageOptions = input<number[]>();
  /** Row selection: `single` selects on row click, `multiple` adds checkboxes. */
  readonly selectionMode = input<'single' | 'multiple' | null>(null);
  /** Selected row (`single`) or rows (`multiple`). */
  readonly selection = model<T | T[] | null>(null);
  /** Case-insensitive filter matched against all column fields; two-way bindable. */
  readonly globalFilter = model('');
  /** Shows a search input for `globalFilter` above the table. */
  readonly showGlobalFilter = input(false, { transform: booleanAttribute });
  readonly globalFilterPlaceholder = input('Search…');
  /**
   * How filterable columns present their filter: `row` (default) shows an inline
   * input row below the headers, `menu` shows a funnel icon in each header that
   * opens a popup with match-mode constraints joined by AND/OR.
   */
  readonly filterDisplay = input<'row' | 'menu'>('row');
  /** Alternating row background. */
  readonly striped = input(false, { transform: booleanAttribute });
  /** Cell borders on all sides. */
  readonly showGridlines = input(false, { transform: booleanAttribute });
  /** Hover highlight on rows (implied by `selectionMode`). */
  readonly rowHover = input(false, { transform: booleanAttribute });
  readonly emptyMessage = input('No records found');
  /** Accessible name for the table. */
  readonly ariaLabel = input<string>();
  /** Field the table is sorted by. */
  readonly sortField = model<string | null>(null);
  /** 1 ascending, -1 descending. */
  readonly sortOrder = model<1 | -1>(1);

  readonly onSort = output<TableSortEvent>();
  readonly onPage = output<TablePageEvent>();
  readonly onFilter = output<TableFilterEvent>();
  /** Emitted when the user reorders a column via drag & drop. */
  readonly onColumnReorder = output<TableColumnReorderEvent>();
  /** Emitted in `lazy` mode whenever the page, sort or a filter changes. */
  readonly onLazyLoad = output<TableLazyLoadEvent>();

  private readonly allColumns = contentChildren(Column);

  /** All declared columns, rearranged by the user's `columnOrder`. */
  private readonly orderedColumns = computed(() => {
    const cols = this.allColumns();
    const order = this.columnOrder();
    if (!order.length) {
      return [...cols];
    }
    const rank = new Map(order.map((key, index) => [key, index]));
    const listed = cols
      .filter((col) => rank.has(this.columnKey(col)))
      .sort((a, b) => rank.get(this.columnKey(a))! - rank.get(this.columnKey(b))!);
    const rest = cols.filter((col) => !rank.has(this.columnKey(col)));
    return [...listed, ...rest];
  });

  /** Columns after ordering, `hidden` inputs and the user's column-toggle selection. */
  protected readonly columns = computed(() => {
    const hidden = new Set(this.hiddenColumns());
    return this.orderedColumns().filter(
      (col) => !col.hidden() && !hidden.has(this.columnKey(col)),
    );
  });

  /** Columns offered in the column-toggle popup. */
  protected readonly toggleableColumns = computed(() =>
    this.orderedColumns().filter((col) => !col.hidden()),
  );

  /** Column currently dragged for reordering. */
  protected readonly draggedColumn = signal<Column | null>(null);
  /** Column the drag hovers over, and on which side the drop would insert. */
  protected readonly dropIndicator = signal<{ col: Column; after: boolean } | null>(null);

  protected readonly columnToggleOpen = signal(false);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly filterMenuPanel = viewChild<TemplateRef<unknown>>('filterMenuPanel');

  /** Column whose filter menu is open, or `null`. */
  protected readonly filterMenuColumn = signal<Column | null>(null);
  /** Editable copy of the open column's filter, committed on Apply. */
  protected readonly filterMenuDraft = signal<TableColumnFilterMeta | null>(null);
  private filterOverlayRef?: OverlayRef;
  private filterMenuTrigger?: HTMLElement;

  protected readonly pageSize = linkedSignal(() => this.rows());
  /** Per-column filter state (constraints and operator), keyed by field. */
  private readonly filterMeta = signal<Record<string, TableColumnFilterMeta>>({});

  private static readonly MATCH_MODE_LABELS: Record<TableFilterMatchMode, string> = {
    startsWith: 'Starts with',
    contains: 'Contains',
    notContains: 'Not contains',
    endsWith: 'Ends with',
    equals: 'Equals',
    notEquals: 'Not equals',
  };
  private static readonly DEFAULT_MATCH_MODES: TableFilterMatchMode[] = [
    'startsWith',
    'contains',
    'notContains',
    'endsWith',
    'equals',
    'notEquals',
  ];

  protected readonly hasFilterRow = computed(
    () =>
      this.filterDisplay() === 'row' &&
      this.columns().some((col) => col.filterable() && col.field()),
  );

  /** Rows after filtering and sorting, before pagination. */
  protected readonly processedRows = computed(() => {
    if (this.lazy()) {
      return this.value();
    }
    let data = [...this.value()];
    const meta = this.filterMeta();
    for (const col of this.columns()) {
      const field = col.field();
      if (!col.filterable() || !field) {
        continue;
      }
      const colMeta = meta[field];
      if (!colMeta) {
        continue;
      }
      const isSelect = col.filterType() === 'select';
      const active = colMeta.constraints
        .map((c) => ({ query: c.value.trim().toLowerCase(), matchMode: c.matchMode }))
        .filter((c) => c.query !== '');
      if (!active.length) {
        continue;
      }
      data = data.filter((row) => {
        const value = resolveField(row, field);
        const results = active.map((c) =>
          matchesFilter(value, c.query, isSelect ? 'equals' : c.matchMode),
        );
        return colMeta.operator === 'or' ? results.some(Boolean) : results.every(Boolean);
      });
    }
    const filter = this.globalFilter().trim().toLowerCase();
    if (filter) {
      const fields = this.columns()
        .map((col) => col.field())
        .filter((field): field is string => !!field);
      data = data.filter((row) =>
        fields.some((field) =>
          String(resolveField(row, field) ?? '')
            .toLowerCase()
            .includes(filter),
        ),
      );
    }
    const field = this.sortField();
    if (field) {
      const order = this.sortOrder();
      data.sort((a, b) => order * compareValues(resolveField(a, field), resolveField(b, field)));
    }
    return data;
  });

  /** Effective total: `totalRecords` input in `lazy` mode, filtered row count otherwise. */
  readonly totalRecords = computed(() =>
    this.lazy() ? this.totalRecordsInput() : this.processedRows().length,
  );

  protected readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(this.totalRecords() / Math.max(1, this.pageSize()))),
  );

  /** `first`, clamped so filtering never leaves the table on a page past the end. */
  protected readonly effectiveFirst = computed(() => {
    if (!this.paginator()) {
      return 0;
    }
    if (this.lazy()) {
      // The parent owns `first`; don't clamp against a total that may still be loading.
      return this.first();
    }
    const size = Math.max(1, this.pageSize());
    return Math.min(this.first(), (this.pageCount() - 1) * size);
  });

  protected readonly currentPage = computed(() =>
    Math.floor(this.effectiveFirst() / Math.max(1, this.pageSize())),
  );

  protected readonly pageEnd = computed(() => this.effectiveFirst() + this.pagedRows().length);

  protected readonly pagedRows = computed(() => {
    if (!this.paginator() || this.lazy()) {
      return this.processedRows();
    }
    const first = this.effectiveFirst();
    return this.processedRows().slice(first, first + this.pageSize());
  });

  /** Up to five page numbers centered on the current page. */
  protected readonly pageLinks = computed(() => {
    const count = this.pageCount();
    const visible = Math.min(5, count);
    let start = Math.max(0, this.currentPage() - Math.floor(visible / 2));
    start = Math.min(start, count - visible);
    return Array.from({ length: visible }, (_, i) => start + i);
  });

  protected readonly columnCount = computed(
    () => this.columns().length + (this.selectionMode() === 'multiple' ? 1 : 0),
  );

  protected readonly allSelected = computed(() => {
    const rows = this.processedRows();
    return rows.length > 0 && rows.every((row) => this.isSelected(row));
  });

  protected readonly someSelected = computed(
    () => !this.allSelected() && this.processedRows().some((row) => this.isSelected(row)),
  );

  /** Identifies a column in `hiddenColumns`: its `field`, or `header` without one. */
  protected columnKey(col: Column): string {
    return col.field() ?? col.header();
  }

  protected isColumnHidden(col: Column): boolean {
    return this.hiddenColumns().includes(this.columnKey(col));
  }

  protected toggleColumn(col: Column): void {
    const key = this.columnKey(col);
    this.hiddenColumns.update((hidden) =>
      hidden.includes(key) ? hidden.filter((k) => k !== key) : [...hidden, key],
    );
  }

  protected onColumnDragStart(event: DragEvent, col: Column): void {
    if (!this.reorderableColumns()) {
      return;
    }
    this.draggedColumn.set(col);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      // Firefox needs data for the drag to start.
      event.dataTransfer.setData('text/plain', this.columnKey(col));
    }
  }

  protected onColumnDragOver(event: DragEvent, col: Column): void {
    const dragged = this.draggedColumn();
    if (!dragged) {
      return;
    }
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    if (dragged === col) {
      this.dropIndicator.set(null);
      return;
    }
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.dropIndicator.set({ col, after: event.clientX > rect.left + rect.width / 2 });
  }

  protected onColumnDrop(event: DragEvent, target: Column): void {
    const dragged = this.draggedColumn();
    const indicator = this.dropIndicator();
    this.onColumnDragEnd();
    if (!dragged || dragged === target) {
      return;
    }
    event.preventDefault();
    const dragIndex = this.columns().indexOf(dragged);
    const columns = [...this.orderedColumns()];
    columns.splice(columns.indexOf(dragged), 1);
    const after = indicator?.col === target && indicator.after;
    columns.splice(columns.indexOf(target) + (after ? 1 : 0), 0, dragged);
    this.columnOrder.set(columns.map((col) => this.columnKey(col)));
    const dropIndex = this.columns().indexOf(dragged);
    if (dropIndex !== dragIndex) {
      this.onColumnReorder.emit({ dragIndex, dropIndex });
    }
  }

  protected onColumnDragEnd(): void {
    this.draggedColumn.set(null);
    this.dropIndicator.set(null);
  }

  /**
   * Keyboard alternative to dragging (SC 2.5.7): Arrow Left/Right on the
   * focused header move the column one position.
   */
  protected onColumnKeydown(event: KeyboardEvent, col: Column): void {
    if (!this.reorderableColumns() || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) {
      return;
    }
    event.preventDefault();
    const visible = this.columns();
    const dragIndex = visible.indexOf(col);
    const target = visible[dragIndex + (event.key === 'ArrowLeft' ? -1 : 1)];
    if (!target) {
      return;
    }
    const columns = [...this.orderedColumns()];
    columns.splice(columns.indexOf(col), 1);
    columns.splice(columns.indexOf(target) + (event.key === 'ArrowRight' ? 1 : 0), 0, col);
    this.columnOrder.set(columns.map((column) => this.columnKey(column)));
    this.onColumnReorder.emit({ dragIndex, dropIndex: this.columns().indexOf(col) });
  }

  protected isDropTarget(col: Column, after: boolean): boolean {
    const indicator = this.dropIndicator();
    return indicator !== null && indicator.col === col && indicator.after === after;
  }

  /**
   * The current view as CSV: visible columns with a `field`, all filtered and
   * sorted rows across every page (the rows of the current page in `lazy`
   * mode).
   */
  toCSV(): string {
    const separator = this.csvSeparator();
    const escape = (value: unknown): string => {
      const text = String(value ?? '');
      return text.includes(separator) || /["\n\r]/.test(text)
        ? `"${text.replace(/"/g, '""')}"`
        : text;
    };
    const columns = this.columns().filter((col) => col.field());
    const header = columns.map((col) => escape(col.header() || col.field())).join(separator);
    const lines = this.processedRows().map((row) =>
      columns.map((col) => escape(resolveField(row, col.field()!))).join(separator),
    );
    return [header, ...lines].join('\r\n');
  }

  /** Downloads the current view (see `toCSV`) as `<exportFilename>.csv`. */
  exportCSV(options?: { filename?: string }): void {
    // BOM so Excel detects UTF-8.
    const blob = new Blob(['\ufeff' + this.toCSV()], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${options?.filename ?? this.exportFilename()}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  /** Applies the built-in global filter input and returns to the first page. */
  protected onGlobalFilterInput(event: Event): void {
    this.globalFilter.set((event.target as HTMLInputElement).value);
    this.first.set(0);
    this.emitLazyLoad();
  }

  /** Closes the column-toggle popup (Escape) and returns focus to its button. */
  protected closeColumnToggle(): void {
    if (!this.columnToggleOpen()) {
      return;
    }
    this.columnToggleOpen.set(false);
    this.host.nativeElement
      .querySelector<HTMLButtonElement>('.syui-table-column-toggle-button')
      ?.focus();
  }

  protected onDocumentClick(event: Event): void {
    if (!this.columnToggleOpen()) {
      return;
    }
    const target = event.target as HTMLElement;
    const insideToggle =
      this.host.nativeElement.contains(target) && target.closest('.syui-table-column-toggle');
    if (!insideToggle) {
      this.columnToggleOpen.set(false);
    }
  }

  protected cellValue(row: T, field: string): unknown {
    return resolveField(row, field);
  }

  protected rowKey(row: T, index: number): unknown {
    const key = this.dataKey();
    return key ? resolveField(row, key) : index;
  }

  protected ariaSort(col: Column): 'ascending' | 'descending' | 'none' {
    if (this.sortField() !== col.field()) {
      return 'none';
    }
    return this.sortOrder() === 1 ? 'ascending' : 'descending';
  }

  protected sort(col: Column): void {
    const field = col.field();
    if (!field) {
      return;
    }
    if (this.sortField() === field) {
      if (this.sortOrder() === 1) {
        this.sortOrder.set(-1);
      } else {
        this.sortField.set(null);
        this.sortOrder.set(1);
      }
    } else {
      this.sortField.set(field);
      this.sortOrder.set(1);
    }
    this.onSort.emit({ field: this.sortField(), order: this.sortOrder() });
    this.emitLazyLoad();
  }

  /**
   * Sets a single-constraint filter on the column bound to `field` (clearing it
   * when `value` is empty) and returns to the first page.
   */
  filter(value: string, field: string): void {
    const col = this.columns().find((c) => c.field() === field);
    const meta: TableColumnFilterMeta | null =
      value.trim() === ''
        ? null
        : {
            operator: 'and',
            constraints: [{ value, matchMode: col ? this.defaultMatchMode(col) : 'contains' }],
          };
    this.setColumnFilter(field, meta);
    this.first.set(0);
    this.onFilter.emit({ field, value });
    this.emitLazyLoad();
  }

  protected filterValue(field: string | undefined): string {
    return field ? (this.filterMeta()[field]?.constraints[0]?.value ?? '') : '';
  }

  /** Default match mode of a column: exact for `select`, its `filterMatchMode` otherwise. */
  private defaultMatchMode(col: Column): TableFilterMatchMode {
    return col.filterType() === 'select' ? 'equals' : col.filterMatchMode();
  }

  /** Writes (or removes, when `meta` is `null`) the filter state of a column. */
  private setColumnFilter(field: string, meta: TableColumnFilterMeta | null): void {
    this.filterMeta.update((all) => {
      const next = { ...all };
      if (meta) {
        next[field] = meta;
      } else {
        delete next[field];
      }
      return next;
    });
  }

  /** Whether a column has at least one non-empty filter constraint. */
  protected isColumnFiltered(col: Column): boolean {
    const field = col.field();
    const meta = field ? this.filterMeta()[field] : undefined;
    return !!meta && meta.constraints.some((c) => c.value.trim() !== '');
  }

  protected matchModeOptions(col: Column): TableFilterMatchMode[] {
    return col.filterMatchModeOptions() ?? Table.DEFAULT_MATCH_MODES;
  }

  protected matchModeLabel(mode: TableFilterMatchMode): string {
    return Table.MATCH_MODE_LABELS[mode];
  }

  /** Choices of the `select` filters, keyed by field; distinct data values unless provided. */
  private readonly selectFilterOptions = computed(() => {
    const options = new Map<string, unknown[]>();
    for (const col of this.columns()) {
      const field = col.field();
      if (!col.filterable() || col.filterType() !== 'select' || !field) {
        continue;
      }
      const provided = col.filterOptions();
      if (provided) {
        options.set(field, provided);
        continue;
      }
      const seen = new Set<string>();
      const values: unknown[] = [];
      for (const row of this.value()) {
        const value = resolveField(row, field);
        if (value == null || value === '' || seen.has(String(value))) {
          continue;
        }
        seen.add(String(value));
        values.push(value);
      }
      values.sort(compareValues);
      options.set(field, values);
    }
    return options;
  });

  protected filterOptionsFor(field: string): unknown[] {
    return this.selectFilterOptions().get(field) ?? [];
  }

  protected onFilterInput(col: Column, event: Event): void {
    const field = col.field();
    if (field) {
      this.filter((event.target as HTMLInputElement).value, field);
    }
  }

  /** Opens the filter menu of `col` anchored to the funnel button, or closes it. */
  protected toggleFilterMenu(event: Event, col: Column): void {
    if (this.filterMenuColumn() === col) {
      this.closeFilterMenu();
      return;
    }
    this.closeFilterMenu();
    const trigger = (event.currentTarget ?? event.target) as HTMLElement;
    const field = col.field();
    if (!field) {
      return;
    }
    this.filterMenuDraft.set(this.cloneMeta(this.filterMeta()[field]) ?? this.newFilterMeta(col));
    this.filterMenuColumn.set(col);
    this.filterMenuTrigger = trigger;
    this.filterOverlayRef = this.createFilterOverlay(trigger);
    this.filterOverlayRef.attach(new TemplatePortal(this.filterMenuPanel()!, this.viewContainerRef));
    this.filterOverlayRef.overlayElement
      .querySelector<HTMLElement>('input, select')
      ?.focus();
  }

  /** Closes the filter menu; focus moved into it returns to the funnel button. */
  protected closeFilterMenu(): void {
    if (!this.filterMenuColumn()) {
      return;
    }
    const focusWasInside =
      this.filterOverlayRef?.overlayElement.contains(document.activeElement) ?? false;
    this.filterOverlayRef?.dispose();
    this.filterOverlayRef = undefined;
    this.filterMenuColumn.set(null);
    this.filterMenuDraft.set(null);
    if (focusWasInside) {
      this.filterMenuTrigger?.focus();
    }
    this.filterMenuTrigger = undefined;
  }

  private newFilterMeta(col: Column): TableColumnFilterMeta {
    return { operator: 'and', constraints: [{ value: '', matchMode: this.defaultMatchMode(col) }] };
  }

  private cloneMeta(meta?: TableColumnFilterMeta): TableColumnFilterMeta | null {
    return meta
      ? { operator: meta.operator, constraints: meta.constraints.map((c) => ({ ...c })) }
      : null;
  }

  protected setDraftOperator(event: Event): void {
    const operator = (event.target as HTMLSelectElement).value as TableFilterOperator;
    this.filterMenuDraft.update((draft) => draft && { ...draft, operator });
  }

  protected setDraftValue(index: number, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.filterMenuDraft.update(
      (draft) =>
        draft && {
          ...draft,
          constraints: draft.constraints.map((c, i) => (i === index ? { ...c, value } : c)),
        },
    );
  }

  protected setDraftMode(index: number, event: Event): void {
    const matchMode = (event.target as HTMLSelectElement).value as TableFilterMatchMode;
    this.filterMenuDraft.update(
      (draft) =>
        draft && {
          ...draft,
          constraints: draft.constraints.map((c, i) => (i === index ? { ...c, matchMode } : c)),
        },
    );
  }

  protected addDraftConstraint(col: Column): void {
    this.filterMenuDraft.update(
      (draft) =>
        draft && {
          ...draft,
          constraints: [...draft.constraints, { value: '', matchMode: this.defaultMatchMode(col) }],
        },
    );
  }

  protected removeDraftConstraint(index: number): void {
    this.filterMenuDraft.update((draft) => {
      if (!draft || draft.constraints.length <= 1) {
        return draft;
      }
      return { ...draft, constraints: draft.constraints.filter((_, i) => i !== index) };
    });
  }

  /** Commits the draft to the column's filter and closes the menu. */
  protected applyFilterMenu(col: Column): void {
    const field = col.field();
    const draft = this.filterMenuDraft();
    if (!field || !draft) {
      return;
    }
    const hasValue = draft.constraints.some((c) => c.value.trim() !== '');
    this.setColumnFilter(field, hasValue ? draft : null);
    this.first.set(0);
    this.onFilter.emit({ field, value: draft.constraints[0]?.value ?? '' });
    this.emitLazyLoad();
    this.closeFilterMenu();
  }

  /** Removes the column's filter and resets the draft; leaves the menu open. */
  protected clearFilterMenu(col: Column): void {
    const field = col.field();
    if (!field) {
      return;
    }
    this.setColumnFilter(field, null);
    this.filterMenuDraft.set(this.newFilterMeta(col));
    this.first.set(0);
    this.onFilter.emit({ field, value: '' });
    this.emitLazyLoad();
  }

  protected onMenuSelectChange(col: Column, event: Event): void {
    const field = col.field();
    if (field) {
      this.filter((event.target as HTMLSelectElement).value, field);
      this.closeFilterMenu();
    }
  }

  private createFilterOverlay(trigger: HTMLElement): OverlayRef {
    const overlayRef = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(trigger)
        .withPositions([
          { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 6 },
          { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -6 },
          { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 6 },
          { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -6 },
        ]),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
    });
    overlayRef.outsidePointerEvents().subscribe((event) => {
      if (!trigger.contains(event.target as Node)) {
        this.closeFilterMenu();
      }
    });
    overlayRef.keydownEvents().subscribe((event) => {
      if (event.key === 'Escape') {
        this.closeFilterMenu();
      }
    });
    return overlayRef;
  }

  ngOnDestroy(): void {
    this.filterOverlayRef?.dispose();
  }

  protected goToPage(page: number): void {
    const first = Math.max(0, Math.min(page, this.pageCount() - 1)) * this.pageSize();
    this.first.set(first);
    this.onPage.emit({ first, rows: this.pageSize() });
    this.emitLazyLoad();
  }

  protected setPageSize(event: Event): void {
    this.pageSize.set(Number((event.target as HTMLSelectElement).value));
    this.first.set(0);
    this.onPage.emit({ first: 0, rows: this.pageSize() });
    this.emitLazyLoad();
  }

  private emitLazyLoad(): void {
    if (!this.lazy()) {
      return;
    }
    const meta = this.filterMeta();
    const filters: Record<string, string> = {};
    for (const [field, colMeta] of Object.entries(meta)) {
      filters[field] = colMeta.constraints[0]?.value ?? '';
    }
    this.onLazyLoad.emit({
      first: this.first(),
      rows: this.pageSize(),
      sortField: this.sortField(),
      sortOrder: this.sortOrder(),
      filters,
      filterMeta: meta,
      globalFilter: this.globalFilter(),
    });
  }

  protected isSelected(row: T): boolean {
    const selection = this.selection();
    if (Array.isArray(selection)) {
      return selection.some((item) => this.rowEquals(item, row));
    }
    return selection != null && this.rowEquals(selection as T, row);
  }

  protected onRowClick(row: T): void {
    if (this.selectionMode() !== 'single') {
      return;
    }
    this.selection.set(this.isSelected(row) ? null : row);
  }

  protected onRowKeydown(event: KeyboardEvent, row: T): void {
    if (this.selectionMode() === 'single' && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      this.onRowClick(row);
    }
  }

  protected toggleRow(row: T): void {
    const selection = Array.isArray(this.selection()) ? (this.selection() as T[]) : [];
    this.selection.set(
      this.isSelected(row) ? selection.filter((item) => !this.rowEquals(item, row)) : [...selection, row],
    );
  }

  protected toggleAll(): void {
    this.selection.set(this.allSelected() ? [] : [...this.processedRows()]);
  }

  private rowEquals(a: T, b: T): boolean {
    const key = this.dataKey();
    return key ? resolveField(a, key) === resolveField(b, key) : a === b;
  }
}
