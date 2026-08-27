import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Slider } from './slider';

@Component({
  imports: [Slider, ReactiveFormsModule],
  template: `<syui-slider
    [min]="0"
    [max]="100"
    [step]="5"
    ariaLabelledby="volume-heading"
    [formControl]="control"
  />`,
})
class Host {
  control = new FormControl<number | null>(20);
}

describe('Slider', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const track: HTMLElement = fixture.nativeElement.querySelector('.syui-slider-track');
    const handle: HTMLElement = fixture.nativeElement.querySelector('.syui-slider-handle');
    return { fixture, track, handle };
  }

  it('exposes the slider ARIA attributes', () => {
    const { handle } = setup();
    expect(handle.getAttribute('role')).toBe('slider');
    expect(handle.getAttribute('aria-valuemin')).toBe('0');
    expect(handle.getAttribute('aria-valuemax')).toBe('100');
    expect(handle.getAttribute('aria-valuenow')).toBe('20');
    expect(handle.getAttribute('aria-orientation')).toBe('horizontal');
    expect(handle.getAttribute('aria-labelledby')).toBe('volume-heading');
  });

  it('steps with arrow keys', () => {
    const { fixture, handle } = setup();
    handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe(25);

    handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe(20);
  });

  it('jumps with PageUp/PageDown and Home/End', () => {
    const { fixture, handle } = setup();
    handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageUp', bubbles: true }));
    expect(fixture.componentInstance.control.value).toBe(70);

    handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    expect(fixture.componentInstance.control.value).toBe(0);

    handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    expect(fixture.componentInstance.control.value).toBe(100);
  });

  it('sets the value from a click on the track, snapped to the step', () => {
    const { fixture, track } = setup();
    track.getBoundingClientRect = () =>
      ({ left: 0, right: 200, top: 0, bottom: 4, width: 200, height: 4 }) as DOMRect;
    track.dispatchEvent(new MouseEvent('pointerdown', { clientX: 123, bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe(60);
  });

  it('reflects the form value in the filled range', () => {
    const { fixture } = setup();
    fixture.componentInstance.control.setValue(75);
    fixture.detectChanges();
    const range: HTMLElement = fixture.nativeElement.querySelector('.syui-slider-range');
    expect(range.style.width).toBe('75%');
  });

  it('ignores keyboard input when disabled', () => {
    const { fixture, handle } = setup();
    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(fixture.componentInstance.control.value).toBe(20);
    expect(handle.getAttribute('tabindex')).toBe('-1');
  });
});
