import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Checkbox } from './checkbox';

@Component({
  imports: [Checkbox, ReactiveFormsModule],
  template: `<syui-checkbox label="Accept" ariaLabelledby="accept-heading" [formControl]="control" />`,
})
class Host {
  control = new FormControl(false);
}

describe('Checkbox', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    return { fixture, input };
  }

  it('reflects the form value', () => {
    const { fixture, input } = setup();
    expect(input.checked).toBe(false);

    fixture.componentInstance.control.setValue(true);
    fixture.detectChanges();
    expect(input.checked).toBe(true);
  });

  it('propagates user toggles to the form', () => {
    const { fixture, input } = setup();
    input.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe(true);
  });

  it('disables via the forms API', () => {
    const { fixture, input } = setup();
    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    expect(input.disabled).toBe(true);
  });

  it('renders the label', () => {
    const { fixture } = setup();
    expect(fixture.nativeElement.textContent).toContain('Accept');
  });

  it('exposes aria-labelledby on the input', () => {
    const { input } = setup();
    expect(input.getAttribute('aria-labelledby')).toBe('accept-heading');
  });
});
