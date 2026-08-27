import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Paginator, PaginatorPageEvent } from './paginator';

@Component({
  imports: [Paginator],
  template: `
    <syui-paginator
      [totalRecords]="totalRecords()"
      rows="10"
      [rowsPerPageOptions]="[10, 20]"
      [(first)]="first"
      (onPage)="events.push($event)"
    />
  `,
})
class Host {
  readonly totalRecords = signal(120);
  readonly first = signal(0);
  readonly events: PaginatorPageEvent[] = [];
}

describe('Paginator', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    const button = (label: string) =>
      element.querySelector<HTMLButtonElement>(`[aria-label="${label}"]`)!;
    const report = () => element.querySelector('.syui-paginator-page-report')!.textContent!.trim();
    const pageButtons = () =>
      Array.from(element.querySelectorAll('.syui-paginator-page-button'))
        .map((el) => el.textContent!.trim())
        .filter(Boolean);
    return { fixture, element, button, report, pageButtons };
  }

  it('renders the page report and up to five page links', () => {
    const { report, pageButtons } = setup();
    expect(report()).toBe('1–10 of 120');
    expect(pageButtons()).toEqual(['1', '2', '3', '4', '5']);
  });

  it('renders as a labelled navigation landmark', () => {
    const { element } = setup();
    const paginator = element.querySelector('syui-paginator')!;
    expect(paginator.getAttribute('role')).toBe('navigation');
    expect(paginator.getAttribute('aria-label')).toBe('Pagination');
  });

  it('navigates with next and emits a full page event', () => {
    const { fixture, button, report } = setup();
    button('Next page').click();
    fixture.detectChanges();

    expect(report()).toBe('11–20 of 120');
    expect(fixture.componentInstance.first()).toBe(10);
    expect(fixture.componentInstance.events).toEqual([
      { first: 10, rows: 10, page: 1, pageCount: 12 },
    ]);
  });

  it('marks the current page with aria-current and windows the links around it', () => {
    const { fixture, button, element, pageButtons } = setup();
    button('Last page').click();
    fixture.detectChanges();

    expect(pageButtons()).toEqual(['8', '9', '10', '11', '12']);
    const active = element.querySelector('[aria-current="page"]')!;
    expect(active.textContent!.trim()).toBe('12');
    expect(active.classList).toContain('syui-paginator-page-button-active');
  });

  it('disables the boundary buttons on the first and last page', () => {
    const { fixture, button } = setup();
    expect(button('First page').disabled).toBe(true);
    expect(button('Previous page').disabled).toBe(true);
    expect(button('Next page').disabled).toBe(false);

    button('Last page').click();
    fixture.detectChanges();
    expect(button('Next page').disabled).toBe(true);
    expect(button('Last page').disabled).toBe(true);
    expect(button('First page').disabled).toBe(false);
  });

  it('changes the page size and resets to the first page', () => {
    const { fixture, button, element, report } = setup();
    button('Next page').click();
    fixture.detectChanges();

    const select = element.querySelector<HTMLSelectElement>('.syui-paginator-rows-select')!;
    select.value = '20';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(report()).toBe('1–20 of 120');
    expect(fixture.componentInstance.events.at(-1)).toEqual({
      first: 0,
      rows: 20,
      page: 0,
      pageCount: 6,
    });
  });

  it('clamps the report when the record count shrinks below the current page', () => {
    const { fixture, button, report } = setup();
    button('Last page').click();
    fixture.detectChanges();

    fixture.componentInstance.totalRecords.set(15);
    fixture.detectChanges();
    expect(report()).toBe('11–15 of 15');
  });
});
