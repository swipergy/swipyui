import { Component, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Step, Stepper } from './stepper';

@Component({
  imports: [Stepper, Step],
  template: `
    <syui-stepper [linear]="linear">
      <syui-step value="one" label="First">First content</syui-step>
      <syui-step value="two" label="Second">Second content</syui-step>
      <syui-step value="three" label="Third">Third content</syui-step>
    </syui-stepper>
  `,
})
class Host {
  linear = false;
  readonly stepper = viewChild.required(Stepper);
}

describe('Stepper', () => {
  function setup(linear = false) {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.linear = linear;
    fixture.detectChanges();
    const triggers = (): HTMLButtonElement[] =>
      Array.from(fixture.nativeElement.querySelectorAll('.syui-stepper-trigger'));
    return { fixture, triggers };
  }

  it('renders numbered headers and activates the first step by default', () => {
    const { fixture, triggers } = setup();
    expect(triggers().length).toBe(3);
    expect(triggers()[0].textContent).toContain('1');
    expect(triggers()[0].getAttribute('aria-current')).toBe('step');
    expect(fixture.nativeElement.textContent).toContain('First content');
    expect(fixture.nativeElement.textContent).not.toContain('Second content');
  });

  it('activates a step from its header button', () => {
    const { fixture, triggers } = setup();
    triggers()[1].click();
    fixture.detectChanges();
    expect(triggers()[1].getAttribute('aria-current')).toBe('step');
    expect(fixture.nativeElement.textContent).toContain('Second content');
  });

  it('marks previous steps completed with a check', () => {
    const { fixture, triggers } = setup();
    triggers()[2].click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.syui-stepper-check').length).toBe(2);
    expect(
      fixture.nativeElement.querySelectorAll('.syui-stepper-item-completed').length,
    ).toBe(2);
  });

  it('forbids jumping ahead in linear mode but allows the next step', () => {
    const { fixture, triggers } = setup(true);
    expect(triggers()[2].disabled).toBe(true);

    triggers()[2].click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('First content');

    triggers()[1].click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Second content');
  });

  it('steps programmatically via next() and prev()', () => {
    const { fixture } = setup();
    const stepper = fixture.componentInstance.stepper();

    stepper.next();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Second content');

    stepper.prev();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('First content');

    stepper.prev();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('First content');
  });
});
