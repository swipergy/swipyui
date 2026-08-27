import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { InputNumber } from './inputnumber';

@Component({
  imports: [InputNumber, ReactiveFormsModule],
  template: `
    <syui-input-number
      [formControl]="control"
      [min]="0"
      [max]="10"
      [step]="2"
      showButtons
      locale="en-US"
    />
  `,
})
class Host {
  control = new FormControl<number | null>(null);
}

describe('InputNumber', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    const buttons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    );
    return { fixture, input, buttons };
  }

  it('formats the form value for display', () => {
    const { fixture, input } = setup();
    fixture.componentInstance.control.setValue(1234.5);
    fixture.detectChanges();
    expect(input.value).toBe('1,234.5');
  });

  it('parses typed text into a number', () => {
    const { fixture, input } = setup();
    input.dispatchEvent(new Event('focus'));
    input.value = '7.5';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe(7.5);
  });

  it('steps with ArrowUp/ArrowDown and clamps to min', () => {
    const { fixture, input } = setup();
    fixture.componentInstance.control.setValue(1);
    fixture.detectChanges();

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe(3);

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe(0);
  });

  it('increments via the spin buttons', () => {
    const { fixture, buttons } = setup();
    buttons[0].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe(2);
  });

  it('clamps to max on blur', () => {
    const { fixture, input } = setup();
    input.dispatchEvent(new Event('focus'));
    input.value = '99';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe(10);
    expect(input.value).toBe('10');
  });

  it('exposes the spinbutton ARIA pattern', () => {
    const { fixture, input } = setup();
    fixture.componentInstance.control.setValue(5);
    fixture.detectChanges();
    expect(input.getAttribute('role')).toBe('spinbutton');
    expect(input.getAttribute('aria-valuemin')).toBe('0');
    expect(input.getAttribute('aria-valuemax')).toBe('10');
    expect(input.getAttribute('aria-valuenow')).toBe('5');
  });

  it('hides the spin buttons from assistive technology, keeping the input as keyboard path', () => {
    const { fixture, buttons } = setup();
    const group: HTMLElement = fixture.nativeElement.querySelector('.syui-inputnumber-button-group');
    expect(group.getAttribute('aria-hidden')).toBe('true');
    expect(buttons.every((button) => button.tabIndex === -1)).toBe(true);
  });

  it('disables input and buttons via the forms API', () => {
    const { fixture, input, buttons } = setup();
    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    expect(input.disabled).toBe(true);
    expect(buttons.every((button) => button.disabled)).toBe(true);
  });
});
