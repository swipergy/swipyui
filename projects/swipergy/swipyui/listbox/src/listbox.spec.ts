import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SelectOption } from '@swipergy/swipyui/select';
import { Listbox } from './listbox';

@Component({
  imports: [Listbox, ReactiveFormsModule],
  template: `<syui-listbox
    [options]="options"
    [multiple]="multiple()"
    [filter]="filter()"
    [formControl]="control"
  />`,
})
class Host {
  options: SelectOption[] = [
    { label: 'Berlin', value: 'BER' },
    { label: 'Hamburg', value: 'HAM', disabled: true },
    { label: 'Munich', value: 'MUC' },
    { label: 'Cologne', value: 'CGN' },
  ];
  multiple = signal(false);
  filter = signal(false);
  control = new FormControl<unknown>(null);
}

describe('Listbox', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const list: HTMLElement = fixture.nativeElement.querySelector('.syui-listbox-list');
    const options = () =>
      fixture.nativeElement.querySelectorAll('.syui-listbox-option') as NodeListOf<HTMLElement>;
    return { fixture, list, options };
  }

  it('selects a single value by click', () => {
    const { fixture, options } = setup();
    expect(options().length).toBe(4);

    options()[0].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe('BER');
    expect(options()[0].getAttribute('aria-selected')).toBe('true');

    options()[2].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe('MUC');
  });

  it('toggles array values in multiple mode', () => {
    const { fixture, options, list } = setup();
    fixture.componentInstance.multiple.set(true);
    fixture.detectChanges();
    expect(list.getAttribute('aria-multiselectable')).toBe('true');

    options()[0].click();
    options()[2].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toEqual(['BER', 'MUC']);

    options()[0].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toEqual(['MUC']);
  });

  it('navigates with arrow keys, skipping disabled options, and selects with Enter', () => {
    const { fixture, list } = setup();
    list.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();
    // active is Berlin, next ArrowDown skips disabled Hamburg
    list.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    list.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe('MUC');
  });

  it('jumps to Home and End', () => {
    const { fixture, list, options } = setup();
    list.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    fixture.detectChanges();
    expect(options()[3].classList).toContain('syui-listbox-option-active');

    list.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    fixture.detectChanges();
    expect(options()[0].classList).toContain('syui-listbox-option-active');
  });

  it('moves the active option by typeahead letter', () => {
    const { fixture, list, options } = setup();
    list.dispatchEvent(new KeyboardEvent('keydown', { key: 'c', bubbles: true }));
    fixture.detectChanges();
    expect(options()[3].classList).toContain('syui-listbox-option-active');

    list.dispatchEvent(new KeyboardEvent('keydown', { key: 'b', bubbles: true }));
    fixture.detectChanges();
    expect(options()[0].classList).toContain('syui-listbox-option-active');
  });

  it('filters the options with the search box', () => {
    const { fixture, options } = setup();
    fixture.componentInstance.filter.set(true);
    fixture.detectChanges();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('.syui-listbox-filter');
    input.value = 'mun';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(options().length).toBe(1);
    expect(options()[0].textContent).toContain('Munich');
  });

  it('announces the filtered result count via a status live region', () => {
    const { fixture } = setup();
    fixture.componentInstance.filter.set(true);
    fixture.detectChanges();

    const status = () => fixture.nativeElement.querySelector('[role="status"]')!;
    expect(status().textContent).toContain('4 results available');

    const input: HTMLInputElement = fixture.nativeElement.querySelector('.syui-listbox-filter');
    input.value = 'mun';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(status().textContent).toContain('1 result available');
  });

  it('ignores clicks on disabled options and when disabled via the forms API', () => {
    const { fixture, options } = setup();
    options()[1].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBeNull();

    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    options()[0].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBeNull();
  });
});
