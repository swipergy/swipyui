import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Autocomplete, AutocompleteCompleteEvent } from './autocomplete';

const CITIES = ['Berlin', 'Bern', 'Bremen', 'Hamburg'];

@Component({
  imports: [Autocomplete, ReactiveFormsModule],
  template: `
    <syui-autocomplete
      [suggestions]="suggestions()"
      [forceSelection]="forceSelection"
      dropdown
      placeholder="City"
      [formControl]="control"
      (completeMethod)="search($event)"
    />
  `,
})
class Host {
  suggestions = signal<string[]>([]);
  forceSelection = false;
  control = new FormControl<string | null>(null);
  queries: string[] = [];

  search(event: AutocompleteCompleteEvent): void {
    this.queries.push(event.query);
    this.suggestions.set(CITIES.filter((c) => c.toLowerCase().startsWith(event.query.toLowerCase())));
  }
}

describe('Autocomplete', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    document.querySelector('.cdk-overlay-container')?.remove();
  });

  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('.syui-autocomplete-input');
    return { fixture, input };
  }

  function panel(): HTMLElement | null {
    return document.querySelector('.syui-autocomplete-panel');
  }

  function type(fixture: { detectChanges(): void }, input: HTMLInputElement, text: string) {
    input.value = text;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    vi.advanceTimersByTime(300);
    fixture.detectChanges();
  }

  it('emits completeMethod with the query after the debounce', () => {
    const { fixture, input } = setup();
    input.value = 'be';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.queries).toEqual([]);

    vi.advanceTimersByTime(300);
    fixture.detectChanges();
    expect(fixture.componentInstance.queries).toEqual(['be']);
  });

  it('shows suggestions and selects one by click', () => {
    const { fixture, input } = setup();
    type(fixture, input, 'ber');

    const options = panel()!.querySelectorAll('.syui-autocomplete-option');
    expect(options.length).toBe(2);

    (options[1] as HTMLElement).click();
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe('Bern');
    expect(input.value).toBe('Bern');
    expect(panel()).toBeNull();
  });

  it('navigates with arrow keys and selects with Enter', () => {
    const { fixture, input } = setup();
    type(fixture, input, 'b');

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();
    expect(input.getAttribute('aria-activedescendant')).toContain('option-1');

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe('Bern');
  });

  it('announces the result count via a status live region', () => {
    const { fixture, input } = setup();
    const status = () => fixture.nativeElement.querySelector('[role="status"]')!;
    expect(status().textContent!.trim()).toBe('');

    type(fixture, input, 'b');
    expect(status().textContent).toContain('3 results available');

    type(fixture, input, 'xyz');
    expect(status().textContent).toContain('No results');

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(status().textContent!.trim()).toBe('');
  });

  it('closes on Escape and keeps the typed text', () => {
    const { fixture, input } = setup();
    type(fixture, input, 'ber');
    expect(panel()).toBeTruthy();

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(panel()).toBeNull();
    expect(fixture.componentInstance.control.value).toBe('ber');
  });

  it('emits an empty query from the dropdown button', () => {
    const { fixture } = setup();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.syui-autocomplete-dropdown',
    );
    button.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.queries).toEqual(['']);
    expect(panel()!.querySelectorAll('.syui-autocomplete-option').length).toBe(CITIES.length);
  });

  it('clears free text on blur with forceSelection', () => {
    const { fixture, input } = setup();
    fixture.componentInstance.forceSelection = true;
    fixture.detectChanges();
    type(fixture, input, 'xyz');

    input.dispatchEvent(new Event('blur', { bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBeNull();
    expect(input.value).toBe('');
  });

  it('keeps text matching a suggestion on blur with forceSelection', () => {
    const { fixture, input } = setup();
    fixture.componentInstance.forceSelection = true;
    fixture.detectChanges();
    type(fixture, input, 'Berlin');

    input.dispatchEvent(new Event('blur', { bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe('Berlin');
  });

  it('disables via the forms API', () => {
    const { fixture, input } = setup();
    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    expect(input.disabled).toBe(true);
  });
});
