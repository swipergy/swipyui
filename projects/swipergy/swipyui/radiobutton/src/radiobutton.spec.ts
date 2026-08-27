import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RadioButton } from './radiobutton';

@Component({
  imports: [RadioButton, ReactiveFormsModule],
  template: `
    <syui-radiobutton
      name="size"
      value="s"
      label="Small"
      ariaLabelledby="size-heading"
      [formControl]="control"
    />
    <syui-radiobutton name="size" value="m" label="Medium" [formControl]="control" />
  `,
})
class Host {
  control = new FormControl<string | null>(null);
}

describe('RadioButton', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const inputs: HTMLInputElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('input'),
    );
    return { fixture, inputs };
  }

  it('selects the option matching the form value', () => {
    const { fixture, inputs } = setup();
    fixture.componentInstance.control.setValue('m');
    fixture.detectChanges();

    expect(inputs[0].checked).toBe(false);
    expect(inputs[1].checked).toBe(true);
  });

  it('writes its value to the form when selected', () => {
    const { fixture, inputs } = setup();
    inputs[0].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe('s');
  });

  it('exposes aria-labelledby on the input', () => {
    const { inputs } = setup();
    expect(inputs[0].getAttribute('aria-labelledby')).toBe('size-heading');
    expect(inputs[1].getAttribute('aria-labelledby')).toBe(null);
  });
});
