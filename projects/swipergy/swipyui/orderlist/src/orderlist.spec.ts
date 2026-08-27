import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { OrderList } from './orderlist';

@Component({
  imports: [OrderList],
  template: `
    <syui-order-list [(value)]="items" header="Cities">
      <ng-template let-item let-selected="selected">{{ item }}</ng-template>
    </syui-order-list>
  `,
})
class Host {
  items = signal(['Berlin', 'Hamburg', 'Munich', 'Cologne']);
}

@Component({
  imports: [OrderList],
  template: `<syui-order-list [value]="['One']" ariaLabel="Steps" />`,
})
class PlainHost {}

describe('OrderList', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    const list = root.querySelector<HTMLElement>('[role="listbox"]')!;
    const options = () => Array.from(root.querySelectorAll<HTMLElement>('[role="option"]'));
    // Rendered order: move to top, up, down, move to bottom.
    const buttons = Array.from(
      root.querySelectorAll<HTMLButtonElement>('.syui-order-list-button'),
    );
    return { fixture, root, list, options, buttons };
  }

  it('renders the items in a multiselectable listbox with a header', () => {
    const { root, list, options } = setup();
    expect(list.getAttribute('aria-multiselectable')).toBe('true');
    expect(options().length).toBe(4);
    expect(options()[0].textContent).toContain('Berlin');
    expect(root.querySelector('.syui-order-list-header')!.textContent).toContain('Cities');
    expect(list.getAttribute('aria-labelledby')).not.toBeNull();
    expect(list.getAttribute('aria-label')).toBeNull();
  });

  it('falls back to the ariaLabel input without a header', () => {
    const fixture = TestBed.createComponent(PlainHost);
    fixture.detectChanges();
    const list = (fixture.nativeElement as HTMLElement).querySelector('[role="listbox"]')!;
    expect(list.getAttribute('aria-label')).toBe('Steps');
    expect(list.getAttribute('aria-labelledby')).toBeNull();
  });

  it('selects on click and toggles with ctrl-click', () => {
    const { fixture, options } = setup();
    options()[0].click();
    fixture.detectChanges();
    expect(options()[0].getAttribute('aria-selected')).toBe('true');

    options()[2].dispatchEvent(new MouseEvent('click', { bubbles: true, ctrlKey: true }));
    fixture.detectChanges();
    expect(options()[0].getAttribute('aria-selected')).toBe('true');
    expect(options()[2].getAttribute('aria-selected')).toBe('true');

    options()[0].dispatchEvent(new MouseEvent('click', { bubbles: true, ctrlKey: true }));
    fixture.detectChanges();
    expect(options()[0].getAttribute('aria-selected')).toBe('false');
  });

  it('selects a range with shift-click', () => {
    const { fixture, options } = setup();
    options()[1].click();
    fixture.detectChanges();
    options()[3].dispatchEvent(new MouseEvent('click', { bubbles: true, shiftKey: true }));
    fixture.detectChanges();
    const selected = options().map((option) => option.getAttribute('aria-selected'));
    expect(selected).toEqual(['false', 'true', 'true', 'true']);
  });

  it('moves the selected item with the reorder buttons and updates value', () => {
    const { fixture, options, buttons } = setup();
    options()[1].click(); // Hamburg
    fixture.detectChanges();

    buttons[1].click(); // up
    fixture.detectChanges();
    expect(fixture.componentInstance.items()).toEqual(['Hamburg', 'Berlin', 'Munich', 'Cologne']);

    buttons[3].click(); // move to bottom
    fixture.detectChanges();
    expect(fixture.componentInstance.items()).toEqual(['Berlin', 'Munich', 'Cologne', 'Hamburg']);
  });

  it('disables the reorder buttons while nothing is selected', () => {
    const { buttons } = setup();
    expect(buttons.every((button) => button.disabled)).toBe(true);
  });

  it('supports keyboard: arrows move the active option, Space selects, ctrl+arrow reorders', () => {
    const { fixture, list, options } = setup();
    list.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();
    expect(list.getAttribute('aria-activedescendant')).toBe(options()[0].id);

    list.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    fixture.detectChanges();
    expect(options()[0].getAttribute('aria-selected')).toBe('true');

    list.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', ctrlKey: true, bubbles: true }),
    );
    fixture.detectChanges();
    expect(fixture.componentInstance.items()).toEqual(['Hamburg', 'Berlin', 'Munich', 'Cologne']);
    // active option follows the moved item
    expect(list.getAttribute('aria-activedescendant')).toBe(options()[1].id);
  });
});
