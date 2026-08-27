import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Tooltip } from './tooltip';

@Component({
  imports: [Tooltip],
  template: `<button syuiTooltip="More info">Hover me</button>`,
})
class Host {}

describe('Tooltip', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    return { fixture, button };
  }

  function panel(): HTMLElement | null {
    return document.querySelector('.syui-tooltip');
  }

  afterEach(() => {
    vi.useRealTimers();
    document.querySelector('.cdk-overlay-container')?.remove();
  });

  it('shows the tooltip on mouseenter and hides after mouseleave', () => {
    vi.useFakeTimers();
    const { fixture, button } = setup();

    button.dispatchEvent(new Event('mouseenter'));
    fixture.detectChanges();

    expect(panel()?.textContent).toContain('More info');
    expect(panel()?.getAttribute('role')).toBe('tooltip');
    expect(button.getAttribute('aria-describedby')).toBe(panel()?.id);

    button.dispatchEvent(new Event('mouseleave'));
    fixture.detectChanges();
    // Still visible during the grace period so the pointer can reach it.
    expect(panel()).toBeTruthy();

    vi.advanceTimersByTime(200);
    expect(panel()).toBeNull();
    expect(button.hasAttribute('aria-describedby')).toBe(false);
  });

  it('stays open while the pointer rests on the tooltip', () => {
    vi.useFakeTimers();
    const { fixture, button } = setup();
    button.dispatchEvent(new Event('mouseenter'));
    fixture.detectChanges();

    button.dispatchEvent(new Event('mouseleave'));
    document
      .querySelector('.cdk-overlay-pane')!
      .dispatchEvent(new Event('mouseenter'));
    vi.advanceTimersByTime(500);
    expect(panel()).toBeTruthy();

    document
      .querySelector('.cdk-overlay-pane')!
      .dispatchEvent(new Event('mouseleave'));
    vi.advanceTimersByTime(200);
    expect(panel()).toBeNull();
  });

  it('shows the tooltip on focus and keeps it open while focused', () => {
    vi.useFakeTimers();
    const { fixture, button } = setup();
    button.focus();
    button.dispatchEvent(new Event('focusin'));
    fixture.detectChanges();
    expect(panel()).toBeTruthy();

    // A stray mouseleave must not dismiss a tooltip held open by focus.
    button.dispatchEvent(new Event('mouseleave'));
    vi.advanceTimersByTime(500);
    expect(panel()).toBeTruthy();
  });

  it('dismisses on Escape without moving focus', () => {
    const { fixture, button } = setup();
    button.focus();
    button.dispatchEvent(new Event('focusin'));
    fixture.detectChanges();
    expect(panel()).toBeTruthy();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();

    expect(panel()).toBeNull();
    expect(document.activeElement).toBe(button);
    expect(button.hasAttribute('aria-describedby')).toBe(false);
  });
});
