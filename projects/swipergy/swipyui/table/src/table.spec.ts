import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Column, Table, TableColumnReorderEvent, TableLazyLoadEvent } from './table';

interface Product {
  id: number;
  name: string;
  price: number;
}

const PRODUCTS: Product[] = [
  { id: 1, name: 'Bamboo Watch', price: 65 },
  { id: 2, name: 'Black Watch', price: 72 },
  { id: 3, name: 'Blue Band', price: 79 },
  { id: 4, name: 'Blue T-Shirt', price: 29 },
  { id: 5, name: 'Bracelet', price: 15 },
];

@Component({
  imports: [Table, Column],
  template: `
    <syui-table
      [value]="products"
      dataKey="id"
      [paginator]="paginator"
      rows="2"
      [selectionMode]="selectionMode"
      [(selection)]="selection"
      [globalFilter]="filter()"
    >
      <syui-column field="name" header="Name" sortable [filterable]="filterable" />
      <syui-column field="price" header="Price" sortable [filterable]="filterable" filterMatchMode="equals" />
    </syui-table>
  `,
})
class Host {
  products = PRODUCTS;
  paginator = false;
  selectionMode: 'single' | 'multiple' | null = null;
  selection: Product | Product[] | null = null;
  filter = signal('');
  filterable = false;
}

describe('Table', () => {
  function setup(configure?: (host: Host) => void) {
    const fixture = TestBed.createComponent(Host);
    configure?.(fixture.componentInstance);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    const cellsIn = (column: number) =>
      Array.from(element.querySelectorAll('tbody tr')).map(
        (row) => row.children[column]?.textContent?.trim(),
      );
    return { fixture, element, cellsIn };
  }

  it('renders one row per record with field values', () => {
    const { element, cellsIn } = setup();
    expect(element.querySelectorAll('tbody tr').length).toBe(5);
    expect(cellsIn(0)[0]).toBe('Bamboo Watch');
    expect(cellsIn(1)[0]).toBe('65');
  });

  it('sorts ascending, descending, then resets on header clicks', () => {
    const { fixture, element, cellsIn } = setup();
    const sortButton = element.querySelectorAll<HTMLButtonElement>('.syui-table-sort-button')[1];

    sortButton.click();
    fixture.detectChanges();
    expect(cellsIn(1)).toEqual(['15', '29', '65', '72', '79']);

    sortButton.click();
    fixture.detectChanges();
    expect(cellsIn(1)).toEqual(['79', '72', '65', '29', '15']);

    sortButton.click();
    fixture.detectChanges();
    expect(cellsIn(1)).toEqual(['65', '72', '79', '29', '15']);
  });

  it('exposes column headers with scope and aria-sort', () => {
    const { fixture, element } = setup();
    const header = element.querySelector('thead th')!;
    expect(header.getAttribute('scope')).toBe('col');
    expect(header.getAttribute('aria-sort')).toBe('none');

    element.querySelector<HTMLButtonElement>('.syui-table-sort-button')!.click();
    fixture.detectChanges();
    expect(header.getAttribute('aria-sort')).toBe('ascending');
  });

  it('paginates and navigates pages', () => {
    const { fixture, element } = setup((host) => (host.paginator = true));
    expect(element.querySelectorAll('tbody tr').length).toBe(2);
    expect(element.querySelector('.syui-table-page-report')?.textContent).toContain('1–2 of 5');

    element.querySelector<HTMLButtonElement>('[aria-label="Next page"]')!.click();
    fixture.detectChanges();
    expect(element.querySelector('.syui-table-page-report')?.textContent).toContain('3–4 of 5');

    element.querySelector<HTMLButtonElement>('[aria-label="Last page"]')!.click();
    fixture.detectChanges();
    expect(element.querySelectorAll('tbody tr').length).toBe(1);
  });

  it('filters rows across column fields', () => {
    const { fixture, element } = setup();
    fixture.componentInstance.filter.set('watch');
    fixture.detectChanges();
    expect(element.querySelectorAll('tbody tr').length).toBe(2);

    fixture.componentInstance.filter.set('no-match');
    fixture.detectChanges();
    expect(element.textContent).toContain('No records found');
  });

  it('filters rows per column from the filter row', () => {
    const { fixture, element, cellsIn } = setup((host) => (host.filterable = true));
    const [nameInput, priceInput] = Array.from(
      element.querySelectorAll<HTMLInputElement>('.syui-table-filter-input'),
    );

    nameInput.value = 'blue';
    nameInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(cellsIn(0)).toEqual(['Blue Band', 'Blue T-Shirt']);

    priceInput.value = '79';
    priceInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(cellsIn(0)).toEqual(['Blue Band']);

    nameInput.value = '';
    nameInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(cellsIn(0)).toEqual(['Blue Band']);

    priceInput.value = '7';
    priceInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(element.textContent).toContain('No records found');
  });

  it('does not render a filter row without filterable columns', () => {
    const { element } = setup();
    expect(element.querySelector('.syui-table-filter-row')).toBeNull();
  });

  it('selects a row on click in single mode', () => {
    const { fixture, element } = setup((host) => (host.selectionMode = 'single'));
    const row = element.querySelectorAll<HTMLTableRowElement>('tbody tr')[1];

    row.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selection).toEqual(PRODUCTS[1]);
    expect(row.classList).toContain('syui-table-row-selected');

    row.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selection).toBeNull();
  });

  describe('lazy mode', () => {
    @Component({
      imports: [Table, Column],
      template: `
        <syui-table
          lazy
          paginator
          rows="2"
          [value]="page()"
          [totalRecords]="totalRecords()"
          [loading]="loading()"
          [(first)]="first"
          (onLazyLoad)="events.push($event)"
        >
          <syui-column field="name" header="Name" sortable />
          <syui-column field="price" header="Price" />
        </syui-table>
      `,
    })
    class LazyHost {
      page = signal(PRODUCTS.slice(0, 2));
      totalRecords = signal(5);
      loading = signal(false);
      first = signal(0);
      events: TableLazyLoadEvent[] = [];
    }

    function setupLazy() {
      const fixture = TestBed.createComponent(LazyHost);
      fixture.detectChanges();
      const element: HTMLElement = fixture.nativeElement;
      return { fixture, host: fixture.componentInstance, element };
    }

    it('renders value as-is and reports totals from totalRecords', () => {
      const { element } = setupLazy();
      expect(element.querySelectorAll('tbody tr').length).toBe(2);
      expect(element.querySelector('.syui-table-page-report')?.textContent).toContain('1–2 of 5');
    });

    it('updates first and emits onLazyLoad on page navigation instead of slicing', () => {
      const { fixture, host, element } = setupLazy();
      element.querySelector<HTMLButtonElement>('[aria-label="Next page"]')!.click();
      fixture.detectChanges();

      expect(host.first()).toBe(2);
      expect(host.events).toEqual([
        { first: 2, rows: 2, sortField: null, sortOrder: 1, filters: {}, filterMeta: {}, globalFilter: '' },
      ]);

      host.page.set(PRODUCTS.slice(2, 4));
      fixture.detectChanges();
      expect(element.querySelector('.syui-table-page-report')?.textContent).toContain('3–4 of 5');
      expect(element.querySelectorAll('tbody tr')[0].textContent).toContain('Blue Band');
    });

    it('emits onLazyLoad on sort without sorting client-side', () => {
      const { fixture, host, element } = setupLazy();
      element.querySelector<HTMLButtonElement>('.syui-table-sort-button')!.click();
      fixture.detectChanges();

      expect(host.events).toEqual([
        { first: 0, rows: 2, sortField: 'name', sortOrder: 1, filters: {}, filterMeta: {}, globalFilter: '' },
      ]);
      // Row order is the server's responsibility; value stays untouched.
      expect(element.querySelectorAll('tbody tr')[0].textContent).toContain('Bamboo Watch');
    });

    it('shows the loading overlay while loading', () => {
      const { fixture, host, element } = setupLazy();
      expect(element.querySelector('.syui-table-loading-overlay')).toBeNull();

      host.loading.set(true);
      fixture.detectChanges();
      expect(element.querySelector('.syui-table-loading-overlay')).not.toBeNull();
    });
  });

  describe('toolbar and export', () => {
    @Component({
      imports: [Table, Column],
      template: `
        <syui-table [value]="products" showGlobalFilter showExport exportLabel="Exportieren">
          <syui-column field="name" header="Name" />
          <syui-column field="price" header="Price" />
        </syui-table>
      `,
    })
    class ToolbarHost {
      products = PRODUCTS;
    }

    it('renders the export button in the toolbar with a translatable label', () => {
      const fixture = TestBed.createComponent(ToolbarHost);
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('.syui-table-export-button');
      expect(button?.textContent?.trim()).toBe('Exportieren');
    });

    it('filters rows from the built-in global filter input on top', () => {
      const fixture = TestBed.createComponent(ToolbarHost);
      fixture.detectChanges();
      const element: HTMLElement = fixture.nativeElement;
      const input = element.querySelector<HTMLInputElement>('.syui-table-global-filter')!;

      expect(input).toBeTruthy();
      input.value = 'watch';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(element.querySelectorAll('tbody tr').length).toBe(2);
    });

    it('exports the current view as CSV', () => {
      const fixture = TestBed.createComponent(ToolbarHost);
      fixture.detectChanges();
      const table: Table = fixture.debugElement.children[0].componentInstance;

      expect(table.toCSV().split('\r\n')).toEqual([
        'Name,Price',
        'Bamboo Watch,65',
        'Black Watch,72',
        'Blue Band,79',
        'Blue T-Shirt,29',
        'Bracelet,15',
      ]);
    });
  });

  describe('column toggle', () => {
    @Component({
      imports: [Table, Column],
      template: `
        <syui-table [value]="products" columnToggle [(hiddenColumns)]="hiddenColumns">
          <syui-column field="name" header="Name" />
          <syui-column field="price" header="Price" />
          <syui-column field="id" header="Id" [hidden]="hideId()" />
        </syui-table>
      `,
    })
    class ToggleHost {
      products = PRODUCTS;
      hiddenColumns = signal<string[]>([]);
      hideId = signal(true);
    }

    function setupToggle() {
      const fixture = TestBed.createComponent(ToggleHost);
      fixture.detectChanges();
      const element: HTMLElement = fixture.nativeElement;
      const headers = () =>
        Array.from(element.querySelectorAll('thead th')).map((th) => th.textContent?.trim());
      return { fixture, host: fixture.componentInstance, element, headers };
    }

    it('omits columns hidden via the hidden input, also from the popup', () => {
      const { fixture, element, headers } = setupToggle();
      expect(headers()).toEqual(['Name', 'Price']);

      element.querySelector<HTMLButtonElement>('.syui-table-column-toggle-button')!.click();
      fixture.detectChanges();
      const options = Array.from(
        element.querySelectorAll('.syui-table-column-toggle-option'),
      ).map((option) => option.textContent?.trim());
      expect(options).toEqual(['Name', 'Price']);
    });

    it('hides and shows columns from the toggle popup', () => {
      const { fixture, host, element, headers } = setupToggle();
      element.querySelector<HTMLButtonElement>('.syui-table-column-toggle-button')!.click();
      fixture.detectChanges();

      const priceCheckbox = element.querySelectorAll<HTMLInputElement>(
        '.syui-table-column-toggle-option input',
      )[1];
      priceCheckbox.click();
      fixture.detectChanges();
      expect(headers()).toEqual(['Name']);
      expect(host.hiddenColumns()).toEqual(['price']);
      expect(element.querySelectorAll('tbody tr')[0].children.length).toBe(1);

      priceCheckbox.click();
      fixture.detectChanges();
      expect(headers()).toEqual(['Name', 'Price']);
      expect(host.hiddenColumns()).toEqual([]);
    });

    it('closes the toggle popup with Escape and restores focus to its button', () => {
      const { fixture, element } = setupToggle();
      const button = element.querySelector<HTMLButtonElement>('.syui-table-column-toggle-button')!;
      button.click();
      fixture.detectChanges();
      expect(element.querySelector('.syui-table-column-toggle-panel')).not.toBeNull();

      element
        .querySelector<HTMLElement>('.syui-table-column-toggle')!
        .dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      fixture.detectChanges();
      expect(element.querySelector('.syui-table-column-toggle-panel')).toBeNull();
      expect(document.activeElement).toBe(button);
    });

    it('honors a preset hiddenColumns model', () => {
      const fixture = TestBed.createComponent(ToggleHost);
      fixture.componentInstance.hiddenColumns.set(['name']);
      fixture.detectChanges();
      const headers = Array.from(fixture.nativeElement.querySelectorAll('thead th')).map((th) =>
        (th as HTMLElement).textContent?.trim(),
      );
      expect(headers).toEqual(['Price']);
    });
  });

  describe('select filters', () => {
    @Component({
      imports: [Table, Column],
      template: `
        <syui-table [value]="products">
          <syui-column
            field="name"
            header="Name"
            filterable
            filterType="select"
            [filterOptions]="options()"
          />
          <syui-column field="price" header="Price" />
        </syui-table>
      `,
    })
    class SelectFilterHost {
      products = PRODUCTS;
      options = signal<string[] | undefined>(undefined);
    }

    function setupSelect() {
      const fixture = TestBed.createComponent(SelectFilterHost);
      fixture.detectChanges();
      const element: HTMLElement = fixture.nativeElement;
      const select = () => element.querySelector<HTMLSelectElement>('.syui-table-filter-select')!;
      const choose = (value: string) => {
        select().value = value;
        select().dispatchEvent(new Event('change'));
        fixture.detectChanges();
      };
      return { fixture, host: fixture.componentInstance, element, select, choose };
    }

    it('renders a dropdown with the distinct column values and an All choice', () => {
      const { select } = setupSelect();
      const labels = Array.from(select().options).map((option) => option.textContent?.trim());
      expect(labels).toEqual([
        'All',
        'Bamboo Watch',
        'Black Watch',
        'Blue Band',
        'Blue T-Shirt',
        'Bracelet',
      ]);
    });

    it('filters exactly on selection and resets via the All choice', () => {
      const { element, choose } = setupSelect();
      choose('Blue Band');
      expect(element.querySelectorAll('tbody tr').length).toBe(1);
      expect(element.querySelector('tbody td')?.textContent).toContain('Blue Band');

      choose('');
      expect(element.querySelectorAll('tbody tr').length).toBe(5);
    });

    it('uses provided filterOptions and matches them exactly, not by contains', () => {
      const { fixture, host, select, element, choose } = setupSelect();
      host.options.set(['Blue']);
      fixture.detectChanges();
      expect(select().options.length).toBe(2);

      // 'Blue' is a substring of two names but equals none — select filters match exactly.
      choose('Blue');
      expect(element.textContent).toContain('No records found');
    });
  });

  describe('filter menu', () => {
    @Component({
      imports: [Table, Column],
      template: `
        <syui-table [value]="products" filterDisplay="menu">
          <syui-column field="name" header="Name" filterable />
          <syui-column field="price" header="Price" filterable filterType="select" />
        </syui-table>
      `,
    })
    class MenuHost {
      products = PRODUCTS;
    }

    function setupMenu() {
      const fixture = TestBed.createComponent(MenuHost);
      fixture.detectChanges();
      const element: HTMLElement = fixture.nativeElement;
      const rows = () => element.querySelectorAll('tbody tr').length;
      const menu = () => document.querySelector<HTMLElement>('.syui-table-filter-menu');
      const funnels = () =>
        element.querySelectorAll<HTMLButtonElement>('.syui-table-filter-menu-button');
      const openName = async () => {
        funnels()[0].click();
        await fixture.whenStable();
        fixture.detectChanges();
      };
      return { fixture, element, rows, menu, funnels, openName };
    }

    afterEach(() => {
      document.querySelector('.cdk-overlay-container')?.remove();
    });

    it('renders a funnel per filterable column and no inline filter row', () => {
      const { element, funnels } = setupMenu();
      expect(funnels().length).toBe(2);
      expect(element.querySelector('.syui-table-filter-row')).toBeNull();
    });

    it('opens a constraint popup on the funnel and filters rows on Apply', async () => {
      const { fixture, rows, menu, openName } = setupMenu();
      await openName();
      expect(menu()).toBeTruthy();

      const input = menu()!.querySelector<HTMLInputElement>('.syui-table-filter-input')!;
      input.value = 'blue';
      input.dispatchEvent(new Event('input'));
      menu()!.querySelector<HTMLButtonElement>('.syui-table-filter-menu-apply')!.click();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(menu()).toBeNull();
      expect(rows()).toBe(2);
    });

    it('joins two constraints with Match Any (OR)', async () => {
      const { fixture, element, rows, menu, openName } = setupMenu();
      await openName();

      const setValue = (index: number, value: string) => {
        const input =
          menu()!.querySelectorAll<HTMLInputElement>('.syui-table-filter-input')[index];
        input.value = value;
        input.dispatchEvent(new Event('input'));
        fixture.detectChanges();
      };

      setValue(0, 'bamboo');
      menu()!.querySelector<HTMLButtonElement>('.syui-table-filter-menu-add')!.click();
      fixture.detectChanges();
      setValue(1, 'bracelet');

      const operator = menu()!.querySelector<HTMLSelectElement>('.syui-table-filter-menu-operator')!;
      operator.value = 'or';
      operator.dispatchEvent(new Event('change'));
      fixture.detectChanges();

      menu()!.querySelector<HTMLButtonElement>('.syui-table-filter-menu-apply')!.click();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(rows()).toBe(2);
      expect(element.querySelector('.syui-table-filter-menu-button-active')).toBeTruthy();
    });

    it('clears a column filter from the menu', async () => {
      const { fixture, element, rows, menu, openName } = setupMenu();
      await openName();
      const input = menu()!.querySelector<HTMLInputElement>('.syui-table-filter-input')!;
      input.value = 'blue';
      input.dispatchEvent(new Event('input'));
      menu()!.querySelector<HTMLButtonElement>('.syui-table-filter-menu-apply')!.click();
      await fixture.whenStable();
      fixture.detectChanges();
      expect(rows()).toBe(2);

      element.querySelectorAll<HTMLButtonElement>('.syui-table-filter-menu-button')[0].click();
      await fixture.whenStable();
      fixture.detectChanges();
      menu()!.querySelector<HTMLButtonElement>('.syui-table-filter-menu-clear')!.click();
      await fixture.whenStable();
      fixture.detectChanges();
      expect(rows()).toBe(5);
      expect(element.querySelector('.syui-table-filter-menu-button-active')).toBeNull();
    });

    it('shows a select dropdown in the menu of a select column', async () => {
      const { fixture, element, rows, menu } = setupMenu();
      element.querySelectorAll<HTMLButtonElement>('.syui-table-filter-menu-button')[1].click();
      await fixture.whenStable();
      fixture.detectChanges();

      const select = menu()!.querySelector<HTMLSelectElement>('.syui-table-filter-select')!;
      expect(select).toBeTruthy();
      select.value = '79';
      select.dispatchEvent(new Event('change'));
      await fixture.whenStable();
      fixture.detectChanges();

      expect(menu()).toBeNull();
      expect(rows()).toBe(1);
    });
  });

  describe('column reorder', () => {
    @Component({
      imports: [Table, Column],
      template: `
        <syui-table
          [value]="products"
          reorderableColumns
          [(columnOrder)]="columnOrder"
          (onColumnReorder)="events.push($event)"
        >
          <syui-column field="name" header="Name" />
          <syui-column field="price" header="Price" />
          <syui-column field="id" header="Id" />
        </syui-table>
      `,
    })
    class ReorderHost {
      products = PRODUCTS;
      columnOrder = signal<string[]>([]);
      events: TableColumnReorderEvent[] = [];
    }

    function setupReorder() {
      const fixture = TestBed.createComponent(ReorderHost);
      fixture.detectChanges();
      const element: HTMLElement = fixture.nativeElement;
      const headers = () =>
        Array.from(element.querySelectorAll<HTMLElement>('thead th')).map((th) =>
          th.textContent?.trim(),
        );
      const drag = (from: number, to: number) => {
        const cells = element.querySelectorAll<HTMLElement>('thead th');
        cells[from].dispatchEvent(new MouseEvent('dragstart', { bubbles: true }));
        cells[to].dispatchEvent(new MouseEvent('dragover', { bubbles: true }));
        cells[to].dispatchEvent(new MouseEvent('drop', { bubbles: true }));
        fixture.detectChanges();
      };
      return { fixture, host: fixture.componentInstance, element, headers, drag };
    }

    it('marks headers as draggable only when enabled', () => {
      const { element } = setupReorder();
      expect(element.querySelector('thead th')?.getAttribute('draggable')).toBe('true');

      const { element: plain } = setup();
      expect(plain.querySelector('thead th')?.hasAttribute('draggable')).toBe(false);
    });

    it('moves a column via drag & drop, updating cells, order model and event', () => {
      const { host, element, headers, drag } = setupReorder();
      expect(headers()).toEqual(['Name', 'Price', 'Id']);

      // jsdom reports zero-width cells, so the drop lands on the left half: insert before Name.
      drag(2, 0);
      expect(headers()).toEqual(['Id', 'Name', 'Price']);
      expect(host.columnOrder()).toEqual(['id', 'name', 'price']);
      expect(host.events).toEqual([{ dragIndex: 2, dropIndex: 0 }]);
      expect(element.querySelectorAll('tbody tr')[0].children[0].textContent?.trim()).toBe('1');
    });

    it('ignores a drop onto the dragged column itself', () => {
      const { host, headers, drag } = setupReorder();
      drag(1, 1);
      expect(headers()).toEqual(['Name', 'Price', 'Id']);
      expect(host.columnOrder()).toEqual([]);
      expect(host.events).toEqual([]);
    });

    it('moves a column with arrow keys on the focused header', () => {
      const { fixture, host, element, headers } = setupReorder();
      const idHeader = element.querySelectorAll<HTMLElement>('thead th')[2];
      expect(idHeader.getAttribute('tabindex')).toBe('0');

      idHeader.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
      fixture.detectChanges();
      expect(headers()).toEqual(['Name', 'Id', 'Price']);
      expect(host.columnOrder()).toEqual(['name', 'id', 'price']);
      expect(host.events).toEqual([{ dragIndex: 2, dropIndex: 1 }]);

      // At the leftmost position ArrowLeft is a no-op.
      element
        .querySelectorAll<HTMLElement>('thead th')[0]
        .dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
      fixture.detectChanges();
      expect(headers()).toEqual(['Name', 'Id', 'Price']);
    });

    it('honors a preset columnOrder model', () => {
      const fixture = TestBed.createComponent(ReorderHost);
      fixture.componentInstance.columnOrder.set(['price', 'id', 'name']);
      fixture.detectChanges();
      const headers = Array.from(fixture.nativeElement.querySelectorAll('thead th')).map((th) =>
        (th as HTMLElement).textContent?.trim(),
      );
      expect(headers).toEqual(['Price', 'Id', 'Name']);
    });
  });

  it('selects rows via checkboxes in multiple mode', () => {
    const { fixture, element } = setup((host) => {
      host.selectionMode = 'multiple';
      host.selection = [];
    });
    const checkboxes = element.querySelectorAll<HTMLInputElement>('tbody .syui-table-checkbox');

    checkboxes[0].click();
    checkboxes[2].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selection).toEqual([PRODUCTS[0], PRODUCTS[2]]);

    element.querySelector<HTMLInputElement>('thead .syui-table-checkbox')!.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selection).toEqual(PRODUCTS);
  });
});
