import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SelectButton, SelectButtonOption } from './selectbutton';

@Component({
  imports: [SelectButton, ReactiveFormsModule],
  template: `
    <syui-select-button
      [options]="options"
      [multiple]="multiple()"
      [allowEmpty]="allowEmpty()"
      [formControl]="control"
    />
  `,
})
class Host {
  options: SelectButtonOption[] = [
    { label: 'Small', value: 'S' },
    { label: 'Medium', value: 'M' },
    { label: 'Large', value: 'L', disabled: true },
  ];
  multiple = signal(false);
  allowEmpty = signal(true);
  control = new FormControl<unknown>(null);
}

describe('SelectButton', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const group: HTMLElement = fixture.nativeElement.querySelector('[role="radiogroup"]');
    const buttons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    );
    return { fixture, group, buttons };
  }

  it('renders one radio-role button per option inside a radiogroup in single mode', () => {
    const { group, buttons } = setup();
    expect(group).toBeTruthy();
    expect(buttons.length).toBe(3);
    expect(buttons.map((button) => button.getAttribute('role'))).toEqual([
      'radio',
      'radio',
      'radio',
    ]);
    expect(buttons.map((button) => button.getAttribute('aria-checked'))).toEqual([
      'false',
      'false',
      'false',
    ]);
  });

  it('selects an option on click and propagates to the form', () => {
    const { fixture, buttons } = setup();
    buttons[1].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe('M');
    expect(buttons[1].getAttribute('aria-checked')).toBe('true');
  });

  it('clears the value when the selected option is clicked again (allowEmpty)', () => {
    const { fixture, buttons } = setup();
    buttons[0].click();
    buttons[0].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe(null);
  });

  it('keeps the last selection when allowEmpty is false', () => {
    const { fixture, buttons } = setup();
    fixture.componentInstance.allowEmpty.set(false);
    fixture.detectChanges();
    buttons[0].click();
    buttons[0].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe('S');
  });

  it('collects an array of values in multiple mode', () => {
    const { fixture, buttons } = setup();
    fixture.componentInstance.multiple.set(true);
    fixture.detectChanges();
    buttons[0].click();
    buttons[1].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toEqual(['S', 'M']);

    buttons[0].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toEqual(['M']);
  });

  it('moves focus with arrow keys, skipping disabled options', () => {
    const { fixture, group, buttons } = setup();
    buttons[1].focus();
    fixture.detectChanges();
    group.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();
    // Large is disabled, so focus wraps to Small.
    expect(document.activeElement).toBe(buttons[0]);
  });

  it('ignores clicks on disabled options and disables via the forms API', () => {
    const { fixture, buttons } = setup();
    buttons[2].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe(null);

    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    expect(buttons.every((button) => button.disabled)).toBe(true);
  });
});
