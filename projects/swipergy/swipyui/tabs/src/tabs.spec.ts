import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Tab, Tabs } from './tabs';

@Component({
  imports: [Tabs, Tab],
  template: `
    <syui-tabs [(value)]="active">
      <syui-tab value="a" label="Alpha">Alpha content</syui-tab>
      <syui-tab value="b" label="Beta">Beta content</syui-tab>
      <syui-tab value="c" label="Gamma" disabled>Gamma content</syui-tab>
    </syui-tabs>
  `,
})
class Host {
  active = signal<string | undefined>(undefined);
}

describe('Tabs', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const buttons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('[role=tab]'),
    );
    return { fixture, buttons };
  }

  it('activates the first enabled tab by default and renders only its panel', () => {
    const { fixture, buttons } = setup();
    expect(fixture.componentInstance.active()).toBe('a');
    expect(buttons[0].getAttribute('aria-selected')).toBe('true');

    const panels = fixture.nativeElement.querySelectorAll('[role=tabpanel]');
    expect(panels.length).toBe(1);
    expect(panels[0].textContent).toContain('Alpha content');
  });

  it('switches panels on click', () => {
    const { fixture, buttons } = setup();
    buttons[1].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.active()).toBe('b');
    expect(fixture.nativeElement.querySelector('[role=tabpanel]').textContent).toContain(
      'Beta content',
    );
  });

  it('navigates with arrow keys, skipping disabled tabs', () => {
    const { fixture, buttons } = setup();
    const tablist = fixture.nativeElement.querySelector('[role=tablist]');

    tablist.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.active()).toBe('b');

    // Gamma is disabled, ArrowRight wraps back to Alpha
    tablist.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.active()).toBe('a');
  });

  it('does not activate disabled tabs on click', () => {
    const { fixture, buttons } = setup();
    buttons[2].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.active()).toBe('a');
  });
});
