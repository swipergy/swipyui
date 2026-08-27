import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ToggleButton } from './togglebutton';

@Component({
  imports: [ToggleButton, ReactiveFormsModule],
  template: `<syui-toggle-button onLabel="Muted" offLabel="Unmuted" [formControl]="control" />`,
})
class Host {
  control = new FormControl(false);
}

describe('ToggleButton', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    return { fixture, button };
  }

  it('reflects the form value in aria-pressed and the label', () => {
    const { fixture, button } = setup();
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(button.textContent).toContain('Unmuted');

    fixture.componentInstance.control.setValue(true);
    fixture.detectChanges();
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.textContent).toContain('Muted');
  });

  it('propagates user toggles to the form', () => {
    const { fixture, button } = setup();
    button.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe(true);

    button.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe(false);
  });

  it('styles the checked state', () => {
    const { fixture, button } = setup();
    fixture.componentInstance.control.setValue(true);
    fixture.detectChanges();
    expect(button.classList.contains('syui-togglebutton-checked')).toBe(true);
  });

  it('disables via the forms API', () => {
    const { fixture, button } = setup();
    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    expect(button.disabled).toBe(true);
  });
});
