import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { InputText } from '@swipergy/swipyui/inputtext';
import { FloatLabel } from './floatlabel';

@Component({
  imports: [FloatLabel, InputText],
  template: `
    <syui-float-label [variant]="variant()">
      <input syuiInputText id="email" placeholder=" " />
      <label for="email">Email</label>
    </syui-float-label>
  `,
})
class Host {
  variant = signal<'over' | 'in'>('over');
}

describe('FloatLabel', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement.querySelector('syui-float-label');
    const label: HTMLLabelElement = fixture.nativeElement.querySelector('label');
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    return { fixture, host, label, input };
  }

  it('renders the wrapper class with input and label as direct children', () => {
    const { host, label, input } = setup();
    expect(host.classList.contains('syui-floatlabel')).toBe(true);
    expect(label.parentElement).toBe(host);
    expect(input.parentElement).toBe(host);
  });

  it('links label and input via for/id', () => {
    const { label, input } = setup();
    expect(label.htmlFor).toBe(input.id);
  });

  it('uses the over variant by default (no modifier class)', () => {
    const { host } = setup();
    expect(host.classList.contains('syui-floatlabel-in')).toBe(false);
  });

  it('applies the in-variant modifier class', () => {
    const { fixture, host } = setup();
    fixture.componentInstance.variant.set('in');
    fixture.detectChanges();
    expect(host.classList.contains('syui-floatlabel-in')).toBe(true);
  });

  it('keeps the blank placeholder used for the :placeholder-shown float trigger', () => {
    const { input } = setup();
    expect(input.getAttribute('placeholder')).toBe(' ');
  });
});
