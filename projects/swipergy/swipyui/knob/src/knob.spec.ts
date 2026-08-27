import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Knob } from './knob';

@Component({
  imports: [Knob, ReactiveFormsModule],
  template: `<syui-knob
    [min]="0"
    [max]="100"
    [step]="10"
    valueTemplate="{value}%"
    ariaLabelledby="volume-heading"
    [readonly]="readonly()"
    [formControl]="control"
  />`,
})
class Host {
  control = new FormControl<number | null>(30);
  readonly = signal(false);
}

describe('Knob', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const dial: SVGSVGElement = fixture.nativeElement.querySelector('svg');
    return { fixture, dial };
  }

  it('exposes the slider ARIA attributes', () => {
    const { dial } = setup();
    expect(dial.getAttribute('role')).toBe('slider');
    expect(dial.getAttribute('aria-valuemin')).toBe('0');
    expect(dial.getAttribute('aria-valuemax')).toBe('100');
    expect(dial.getAttribute('aria-valuenow')).toBe('30');
    expect(dial.getAttribute('aria-valuetext')).toBe('30%');
    expect(dial.getAttribute('aria-labelledby')).toBe('volume-heading');
  });

  it('renders the value through the valueTemplate', () => {
    const { fixture } = setup();
    const text: SVGTextElement = fixture.nativeElement.querySelector('.syui-knob-text');
    expect(text.textContent!.trim()).toBe('30%');
  });

  it('steps with arrow keys and clamps at the ends', () => {
    const { fixture, dial } = setup();
    dial.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    expect(fixture.componentInstance.control.value).toBe(40);

    dial.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    expect(fixture.componentInstance.control.value).toBe(100);

    dial.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(fixture.componentInstance.control.value).toBe(100);
  });

  it('draws a larger filled arc for a larger value', () => {
    const { fixture } = setup();
    const valueArc = () =>
      (fixture.nativeElement.querySelector('.syui-knob-value') as SVGPathElement).getAttribute('d');
    const before = valueArc();
    fixture.componentInstance.control.setValue(90);
    fixture.detectChanges();
    expect(valueArc()).not.toBe(before);
  });

  it('ignores keyboard input when readonly', () => {
    const { fixture, dial } = setup();
    fixture.componentInstance.readonly.set(true);
    fixture.detectChanges();
    dial.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    expect(fixture.componentInstance.control.value).toBe(30);
  });

  it('ignores keyboard input when disabled', () => {
    const { fixture, dial } = setup();
    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    dial.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    expect(fixture.componentInstance.control.value).toBe(30);
    expect(dial.getAttribute('tabindex')).toBe('-1');
  });
});
