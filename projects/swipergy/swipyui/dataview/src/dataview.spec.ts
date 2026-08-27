import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DataView, DataViewGridItem, DataViewListItem } from './dataview';

interface Product {
  name: string;
}

@Component({
  imports: [DataView, DataViewListItem, DataViewGridItem],
  template: `
    <syui-data-view [value]="items()" [(layout)]="layout" paginator rows="3">
      <ng-template syuiDataViewListItem let-item let-i="index">
        <div class="list-item">{{ i }}:{{ item.name }}</div>
      </ng-template>
      <ng-template syuiDataViewGridItem let-item>
        <div class="grid-item">{{ item.name }}</div>
      </ng-template>
    </syui-data-view>
  `,
})
class Host {
  readonly items = signal<Product[]>([
    { name: 'Watch' },
    { name: 'Band' },
    { name: 'Purse' },
    { name: 'Earrings' },
    { name: 'Controller' },
  ]);
  readonly layout = signal<'list' | 'grid'>('list');
}

describe('DataView', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    const listItems = () =>
      Array.from(element.querySelectorAll('.list-item')).map((el) => el.textContent!.trim());
    return { fixture, element, listItems };
  }

  it('renders the list template per item with the index in context', () => {
    const { listItems } = setup();
    expect(listItems()).toEqual(['0:Watch', '1:Band', '2:Purse']);
  });

  it('pages the items through the built-in paginator', () => {
    const { fixture, element, listItems } = setup();
    element.querySelector<HTMLButtonElement>('[aria-label="Next page"]')!.click();
    fixture.detectChanges();
    expect(listItems()).toEqual(['3:Earrings', '4:Controller']);
  });

  it('switches to the grid template via the header toggle', () => {
    const { fixture, element } = setup();
    expect(element.querySelector('.syui-data-view-content')!.classList).toContain('syui-data-view-list');

    element.querySelector<HTMLButtonElement>('[aria-label="Grid view"]')!.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.layout()).toBe('grid');
    expect(element.querySelector('.syui-data-view-content')!.classList).toContain('syui-data-view-grid');
    expect(element.querySelectorAll('.grid-item').length).toBe(3);
    expect(
      element.querySelector('[aria-label="Grid view"]')!.getAttribute('aria-pressed'),
    ).toBe('true');
  });

  it('follows an external layout binding', () => {
    const { fixture, element } = setup();
    fixture.componentInstance.layout.set('grid');
    fixture.detectChanges();
    expect(element.querySelectorAll('.grid-item').length).toBe(3);
  });

  it('exposes list semantics and announces layout and page changes', () => {
    const { fixture, element } = setup();
    const content = element.querySelector('.syui-data-view-content')!;
    expect(content.getAttribute('role')).toBe('list');
    expect(content.querySelectorAll('[role="listitem"]').length).toBe(3);

    const status = element.querySelector('.syui-data-view-status')!;
    expect(status.getAttribute('role')).toBe('status');
    expect(status.textContent).toContain('List view, page 1 of 2');

    element.querySelector<HTMLButtonElement>('[aria-label="Next page"]')!.click();
    fixture.detectChanges();
    expect(status.textContent).toContain('List view, page 2 of 2');

    element.querySelector<HTMLButtonElement>('[aria-label="Grid view"]')!.click();
    fixture.detectChanges();
    expect(status.textContent).toContain('Grid view');
  });

  it('shows the empty message without items', () => {
    const { fixture, element } = setup();
    fixture.componentInstance.items.set([]);
    fixture.detectChanges();
    expect(element.querySelector('.syui-data-view-empty')!.textContent).toContain(
      'No records found',
    );
  });
});
