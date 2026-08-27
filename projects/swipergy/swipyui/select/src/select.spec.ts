import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Select, SelectOption } from './select';

@Component({
  imports: [Select, ReactiveFormsModule],
  template: `<syui-select [options]="options" placeholder="Pick one" [formControl]="control" />`,
})
class Host {
  options: SelectOption[] = [
    { label: 'Berlin', value: 'BER' },
    { label: 'Hamburg', value: 'HAM', disabled: true },
    { label: 'Munich', value: 'MUC' },
  ];
  control = new FormControl<string | null>(null);
}

describe('Select', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const trigger: HTMLButtonElement = fixture.nativeElement.querySelector('.syui-select');
    return { fixture, trigger };
  }

  function panel(): HTMLElement | null {
    return document.querySelector('.syui-select-panel');
  }

  afterEach(() => {
    document.querySelector('.cdk-overlay-container')?.remove();
  });

  it('shows the placeholder until a value is set', () => {
    const { fixture, trigger } = setup();
    expect(trigger.textContent).toContain('Pick one');

    fixture.componentInstance.control.setValue('MUC');
    fixture.detectChanges();
    expect(trigger.textContent).toContain('Munich');
  });

  it('opens the listbox and selects an option by click', () => {
    const { fixture, trigger } = setup();
    trigger.click();
    fixture.detectChanges();

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    const options = panel()!.querySelectorAll('.syui-select-option');
    expect(options.length).toBe(3);

    (options[0] as HTMLElement).click();
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe('BER');
    expect(panel()).toBeNull();
  });

  it('navigates with arrow keys, skipping disabled options', () => {
    const { fixture, trigger } = setup();
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();
    expect(panel()).toBeTruthy();

    // active starts on first enabled option (Berlin), next skips disabled Hamburg
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.control.value).toBe('MUC');
  });

  it('moves the active option by typeahead letter, skipping disabled options', () => {
    const { fixture, trigger } = setup();
    trigger.click();
    fixture.detectChanges();

    // 'h' only matches disabled Hamburg, so the active option stays put
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'h', bubbles: true }));
    fixture.detectChanges();
    expect(trigger.getAttribute('aria-activedescendant')).toContain('option-0');

    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'm', bubbles: true }));
    fixture.detectChanges();
    expect(trigger.getAttribute('aria-activedescendant')).toContain('option-2');

    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe('MUC');
  });

  it('closes on Escape without selecting', () => {
    const { fixture, trigger } = setup();
    trigger.click();
    fixture.detectChanges();
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();

    expect(panel()).toBeNull();
    expect(fixture.componentInstance.control.value).toBeNull();
  });

  it('does not select disabled options', () => {
    const { fixture, trigger } = setup();
    trigger.click();
    fixture.detectChanges();
    const options = panel()!.querySelectorAll('.syui-select-option');
    (options[1] as HTMLElement).click();
    fixture.detectChanges();

    expect(fixture.componentInstance.control.value).toBeNull();
  });
});
