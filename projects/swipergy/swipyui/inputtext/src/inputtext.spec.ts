import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { InputText } from './inputtext';

@Component({
  imports: [InputText, ReactiveFormsModule],
  template: `<input syuiInputText [invalid]="invalid()" [formControl]="control" />`,
})
class Host {
  invalid = signal(false);
  control = new FormControl('hello');
}

describe('InputText', () => {
  it('applies the base class and binds through reactive forms', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');

    expect(input.classList).toContain('syui-inputtext');
    expect(input.value).toBe('hello');

    input.value = 'changed';
    input.dispatchEvent(new Event('input'));
    expect(fixture.componentInstance.control.value).toBe('changed');
  });

  it('shows invalid styling from reactive-form validators after touch', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    const control = fixture.componentInstance.control;

    control.addValidators([(c) => (c.value === 'forbidden' ? { forbidden: true } : null)]);
    control.setValue('forbidden');
    fixture.detectChanges();
    // Invalid but untouched: no styling yet.
    expect(input.classList).not.toContain('syui-invalid');

    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(input.classList).toContain('syui-invalid');
    expect(input.getAttribute('aria-invalid')).toBe('true');

    control.setValue('fine');
    fixture.detectChanges();
    expect(input.classList).not.toContain('syui-invalid');
    expect(input.hasAttribute('aria-invalid')).toBe(false);
  });

  it('toggles the invalid class and aria-invalid', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    fixture.componentInstance.invalid.set(true);
    fixture.detectChanges();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    expect(input.classList).toContain('syui-invalid');
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });
});
