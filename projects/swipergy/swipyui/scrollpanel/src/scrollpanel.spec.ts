import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ScrollPanel } from './scrollpanel';

@Component({
  imports: [ScrollPanel],
  template: `
    <syui-scroll-panel ariaLabel="Example content" style="height: 100px">
      <p class="line">First line</p>
      <p class="line">Second line</p>
    </syui-scroll-panel>
  `,
})
class Host {}

describe('ScrollPanel', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const panel: HTMLElement = fixture.nativeElement.querySelector('syui-scroll-panel');
    return { fixture, panel };
  }

  it('projects its content', () => {
    const { panel } = setup();
    expect(panel.querySelectorAll('.line').length).toBe(2);
    expect(panel.textContent).toContain('First line');
  });

  it('carries the scroll panel class for native scrollbar styling', () => {
    const { panel } = setup();
    expect(panel.classList.contains('syui-scroll-panel')).toBe(true);
  });

  it('is keyboard focusable', () => {
    const { panel } = setup();
    expect(panel.getAttribute('tabindex')).toBe('0');
  });

  it('exposes a labelled region for assistive technology', () => {
    const { panel } = setup();
    expect(panel.getAttribute('role')).toBe('region');
    expect(panel.getAttribute('aria-label')).toBe('Example content');
  });

  it('keeps the height set by the consumer', () => {
    const { panel } = setup();
    expect(panel.style.height).toBe('100px');
  });
});
