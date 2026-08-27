import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ToggleSwitch } from './toggleswitch';

@Component({
  imports: [ToggleSwitch, ReactiveFormsModule],
  template: `<syui-toggleswitch
    label="Notifications"
    ariaLabelledby="notify-heading"
    [formControl]="control"
  />`,
})
class Host {
  control = new FormControl(false);
}

describe('ToggleSwitch', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    return { fixture, input };
  }

  it('uses the switch role', () => {
    const { input } = setup();
    expect(input.getAttribute('role')).toBe('switch');
  });

  it('exposes aria-labelledby on the input', () => {
    const { input } = setup();
    expect(input.getAttribute('aria-labelledby')).toBe('notify-heading');
  });

  it('round-trips the value with the form', () => {
    const { fixture, input } = setup();
    fixture.componentInstance.control.setValue(true);
    fixture.detectChanges();
    expect(input.checked).toBe(true);

    input.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe(false);
  });
});
