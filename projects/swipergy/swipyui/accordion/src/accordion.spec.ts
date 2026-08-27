import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Accordion, AccordionPanel } from './accordion';

@Component({
  imports: [Accordion, AccordionPanel],
  template: `
    <syui-accordion [(value)]="open" [multiple]="multiple()">
      <syui-accordion-panel value="a" header="Alpha">Alpha content</syui-accordion-panel>
      <syui-accordion-panel value="b" header="Beta">Beta content</syui-accordion-panel>
      <syui-accordion-panel value="c" header="Gamma" disabled>Gamma content</syui-accordion-panel>
    </syui-accordion>
  `,
})
class Host {
  open = signal<unknown>(undefined);
  multiple = signal(false);
}

describe('Accordion', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const buttons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.syui-accordion-toggle'),
    );
    return { fixture, buttons };
  }

  it('renders all headers collapsed by default', () => {
    const { fixture, buttons } = setup();
    expect(buttons.length).toBe(3);
    expect(buttons.every((b) => b.getAttribute('aria-expanded') === 'false')).toBe(true);
    expect(fixture.nativeElement.querySelectorAll('[role=region]').length).toBe(0);
  });

  it('expands a panel on click and collapses it on a second click', () => {
    const { fixture, buttons } = setup();
    buttons[0].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.open()).toBe('a');
    expect(buttons[0].getAttribute('aria-expanded')).toBe('true');
    expect(buttons[0].getAttribute('aria-controls')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[role=region]').textContent).toContain(
      'Alpha content',
    );

    buttons[0].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.open()).toBeUndefined();
    expect(fixture.nativeElement.querySelectorAll('[role=region]').length).toBe(0);
  });

  it('closes the previous panel in single mode', () => {
    const { fixture, buttons } = setup();
    buttons[0].click();
    fixture.detectChanges();
    buttons[1].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.open()).toBe('b');
    const regions = fixture.nativeElement.querySelectorAll('[role=region]');
    expect(regions.length).toBe(1);
    expect(regions[0].textContent).toContain('Beta content');
  });

  it('keeps several panels open in multiple mode', () => {
    const { fixture, buttons } = setup();
    fixture.componentInstance.multiple.set(true);
    fixture.detectChanges();

    buttons[0].click();
    fixture.detectChanges();
    buttons[1].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.open()).toEqual(['a', 'b']);
    expect(fixture.nativeElement.querySelectorAll('[role=region]').length).toBe(2);
  });

  it('moves focus between headers with arrow keys, skipping disabled panels', () => {
    const { buttons } = setup();
    buttons[0].focus();
    buttons[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(document.activeElement).toBe(buttons[1]);

    // Gamma is disabled, ArrowDown wraps back to Alpha
    buttons[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(document.activeElement).toBe(buttons[0]);

    buttons[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    expect(document.activeElement).toBe(buttons[1]);
  });

  it('ignores clicks on disabled panels', () => {
    const { fixture, buttons } = setup();
    buttons[2].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.open()).toBeUndefined();
  });
});
