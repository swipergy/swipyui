import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Password } from './password';

@Component({
  imports: [Password, ReactiveFormsModule],
  template: `<syui-password toggleMask placeholder="Password" [formControl]="control" />`,
})
class Host {
  control = new FormControl<string | null>(null);
}

describe('Password', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('.syui-password-input');
    return { fixture, input };
  }

  function panel(): HTMLElement | null {
    return document.querySelector('.syui-password-panel');
  }

  function type(fixture: { detectChanges(): void }, input: HTMLInputElement, text: string) {
    input.value = text;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
  }

  afterEach(() => {
    document.querySelector('.cdk-overlay-container')?.remove();
  });

  it('propagates typed text to the form', () => {
    const { fixture, input } = setup();
    type(fixture, input, 'hunter2');
    expect(fixture.componentInstance.control.value).toBe('hunter2');
  });

  it('toggles masking via the eye button', () => {
    const { fixture, input } = setup();
    const toggle: HTMLButtonElement = fixture.nativeElement.querySelector('.syui-password-toggle');
    expect(input.type).toBe('password');

    toggle.click();
    fixture.detectChanges();
    expect(input.type).toBe('text');

    toggle.click();
    fixture.detectChanges();
    expect(input.type).toBe('password');
  });

  it('shows the feedback panel on focus and hides it on blur', () => {
    const { fixture, input } = setup();
    input.dispatchEvent(new Event('focus', { bubbles: true }));
    fixture.detectChanges();
    expect(panel()!.textContent).toContain('Enter a password');

    input.dispatchEvent(new Event('blur', { bubbles: true }));
    fixture.detectChanges();
    expect(panel()).toBeNull();
  });

  it('rates strength from weak to strong while typing', () => {
    const { fixture, input } = setup();
    input.dispatchEvent(new Event('focus', { bubbles: true }));
    fixture.detectChanges();

    type(fixture, input, 'abc');
    expect(panel()!.textContent).toContain('Weak');
    expect(panel()!.querySelector('.syui-password-meter-weak')).toBeTruthy();

    type(fixture, input, 'Abcdefg1');
    expect(panel()!.textContent).toContain('Medium');

    type(fixture, input, 'Abcdefg1!');
    expect(panel()!.textContent).toContain('Strong');
    expect(panel()!.querySelector('.syui-password-meter-strong')).toBeTruthy();
  });

  it('exposes the toggle as a keyboard-reachable pressed button', () => {
    const { fixture } = setup();
    const toggle: HTMLButtonElement = fixture.nativeElement.querySelector('.syui-password-toggle');
    expect(toggle.tabIndex).toBe(0);
    expect(toggle.getAttribute('aria-label')).toBe('Show password');
    expect(toggle.getAttribute('aria-pressed')).toBe('false');

    toggle.click();
    fixture.detectChanges();
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
  });

  it('disables via the forms API', () => {
    const { fixture, input } = setup();
    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    expect(input.disabled).toBe(true);
  });
});
