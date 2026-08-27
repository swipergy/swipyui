import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { InputOtp } from './inputotp';

@Component({
  imports: [InputOtp, ReactiveFormsModule],
  template: `<syui-input-otp [length]="4" [integerOnly]="integerOnly()" [formControl]="control" />`,
})
class Host {
  integerOnly = signal(false);
  control = new FormControl<string | null>(null);
}

describe('InputOtp', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const inputs = (): HTMLInputElement[] =>
      Array.from(fixture.nativeElement.querySelectorAll('input'));
    return { fixture, inputs };
  }

  function typeInto(input: HTMLInputElement, char: string): void {
    input.value = char;
    input.dispatchEvent(new Event('input'));
  }

  it('renders one box per length and distributes the value', () => {
    const { fixture, inputs } = setup();
    expect(inputs().length).toBe(4);

    fixture.componentInstance.control.setValue('12');
    fixture.detectChanges();
    expect(inputs().map((input) => input.value)).toEqual(['1', '2', '', '']);
  });

  it('typing fills the value and advances focus', () => {
    const { fixture, inputs } = setup();
    typeInto(inputs()[0], '1');
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe('1');
    expect(document.activeElement).toBe(inputs()[1]);
  });

  it('Backspace on an empty box clears and focuses the previous one', () => {
    const { fixture, inputs } = setup();
    fixture.componentInstance.control.setValue('12');
    fixture.detectChanges();

    inputs()[2].dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Backspace', cancelable: true }),
    );
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe('1');
    expect(document.activeElement).toBe(inputs()[1]);
  });

  it('arrow keys move focus between boxes', () => {
    const { fixture, inputs } = setup();
    inputs()[1].dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', cancelable: true }),
    );
    fixture.detectChanges();
    expect(document.activeElement).toBe(inputs()[2]);

    inputs()[2].dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowLeft', cancelable: true }),
    );
    fixture.detectChanges();
    expect(document.activeElement).toBe(inputs()[1]);
  });

  it('paste distributes characters across the boxes', () => {
    const { fixture, inputs } = setup();
    const paste = new Event('paste', { cancelable: true }) as ClipboardEvent;
    Object.defineProperty(paste, 'clipboardData', { value: { getData: () => '123456' } });
    inputs()[0].dispatchEvent(paste);
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe('1234');
    expect(inputs().map((input) => input.value)).toEqual(['1', '2', '3', '4']);
  });

  it('integerOnly rejects non-digit input', () => {
    const { fixture, inputs } = setup();
    fixture.componentInstance.integerOnly.set(true);
    fixture.detectChanges();

    typeInto(inputs()[0], 'a');
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe('');
    expect(inputs()[0].value).toBe('');
  });

  it('labels the group and each box for assistive technology', () => {
    const { fixture, inputs } = setup();
    const host: HTMLElement = fixture.nativeElement.querySelector('syui-input-otp');
    expect(host.getAttribute('role')).toBe('group');
    expect(inputs()[0].getAttribute('aria-label')).toBe('Character 1 of 4');
    expect(inputs()[3].getAttribute('aria-label')).toBe('Character 4 of 4');
  });

  it('disables all boxes via the forms API', () => {
    const { fixture, inputs } = setup();
    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    expect(inputs().every((input) => input.disabled)).toBe(true);
  });
});
