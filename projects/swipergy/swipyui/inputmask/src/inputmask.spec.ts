import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { InputMask } from './inputmask';

@Component({
  imports: [InputMask, ReactiveFormsModule],
  template: `
    <input
      syuiInputMask
      [mask]="mask"
      [unmask]="unmask()"
      [invalid]="invalid()"
      [formControl]="control"
    />
  `,
})
class Host {
  mask = '(999) 999-9999';
  unmask = signal(false);
  invalid = signal(false);
  control = new FormControl<string | null>(null);
}

describe('InputMask', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    return { fixture, input };
  }

  function type(input: HTMLInputElement, text: string): void {
    input.dispatchEvent(new Event('focus'));
    input.value = input.value + text;
    input.dispatchEvent(new Event('input'));
  }

  it('inserts literals while typing and skips invalid characters', () => {
    const { fixture, input } = setup();
    type(input, '12a3');
    fixture.detectChanges();
    expect(input.value).toBe('(123) ___-____');
    expect(fixture.componentInstance.control.value).toBe('(123) ');
  });

  it('stores the raw characters when unmask is set', () => {
    const { fixture, input } = setup();
    fixture.componentInstance.unmask.set(true);
    fixture.detectChanges();
    type(input, '5551234567');
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe('5551234567');
    expect(input.value).toBe('(555) 123-4567');
  });

  it('Backspace removes the last accepted character, not literals', () => {
    const { fixture, input } = setup();
    type(input, '123');
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', cancelable: true }));
    fixture.detectChanges();
    expect(input.value).toBe('(12_) ___-____');
    expect(fixture.componentInstance.control.value).toBe('(12');
  });

  it('distributes pasted text through the mask', () => {
    const { fixture, input } = setup();
    input.dispatchEvent(new Event('focus'));
    const paste = new Event('paste', { cancelable: true }) as ClipboardEvent;
    Object.defineProperty(paste, 'clipboardData', {
      value: { getData: () => '555-123-4567' },
    });
    input.dispatchEvent(paste);
    fixture.detectChanges();
    expect(input.value).toBe('(555) 123-4567');
    expect(fixture.componentInstance.control.value).toBe('(555) 123-4567');
  });

  it('clears an incomplete value on blur (autoClear)', () => {
    const { fixture, input } = setup();
    type(input, '123');
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(input.value).toBe('');
    expect(fixture.componentInstance.control.value).toBeNull();
  });

  it('keeps a complete value on blur', () => {
    const { fixture, input } = setup();
    type(input, '5551234567');
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(input.value).toBe('(555) 123-4567');
    expect(fixture.componentInstance.control.value).toBe('(555) 123-4567');
  });

  it('renders an externally set form value through the mask', () => {
    const { fixture, input } = setup();
    fixture.componentInstance.control.setValue('5551234567');
    fixture.detectChanges();
    expect(input.value).toBe('(555) 123-4567');
  });

  it('disables via the forms API', () => {
    const { fixture, input } = setup();
    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    expect(input.disabled).toBe(true);
  });

  it('toggles the invalid class and aria-invalid', () => {
    const { fixture, input } = setup();
    expect(input.hasAttribute('aria-invalid')).toBe(false);

    fixture.componentInstance.invalid.set(true);
    fixture.detectChanges();
    expect(input.classList).toContain('syui-invalid');
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });
});
