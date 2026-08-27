import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Panel } from './panel';

@Component({
  imports: [Panel],
  template: `
    <syui-panel header="Details" [toggleable]="toggleable()" [(collapsed)]="collapsed">
      Body content
      <div syui-panel-footer>Footer actions</div>
    </syui-panel>
  `,
})
class Host {
  toggleable = signal(false);
  collapsed = signal(false);
}

describe('Panel', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    return { fixture, element };
  }

  it('renders header, content and footer', () => {
    const { element } = setup();
    expect(element.querySelector('.syui-panel-title')?.textContent).toContain('Details');
    expect(element.querySelector('.syui-panel-content')?.textContent).toContain('Body content');
    expect(element.querySelector('.syui-panel-footer')?.textContent).toContain('Footer actions');
  });

  it('shows no toggle button unless toggleable', () => {
    const { fixture, element } = setup();
    expect(element.querySelector('.syui-panel-toggle')).toBeNull();

    fixture.componentInstance.toggleable.set(true);
    fixture.detectChanges();
    expect(element.querySelector('.syui-panel-toggle')).not.toBeNull();
  });

  it('collapses and expands via the toggle button', () => {
    const { fixture, element } = setup();
    fixture.componentInstance.toggleable.set(true);
    fixture.detectChanges();

    const toggle: HTMLButtonElement = element.querySelector('.syui-panel-toggle')!;
    expect(toggle.getAttribute('aria-expanded')).toBe('true');

    toggle.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.collapsed()).toBe(true);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(element.querySelector('.syui-panel-content')).toBeNull();

    toggle.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.collapsed()).toBe(false);
    expect(element.querySelector('.syui-panel-content')).not.toBeNull();
  });

  it('names the toggle button after the header', () => {
    const { fixture, element } = setup();
    fixture.componentInstance.toggleable.set(true);
    fixture.detectChanges();

    const toggle: HTMLButtonElement = element.querySelector('.syui-panel-toggle')!;
    expect(toggle.getAttribute('aria-label')).toBe('Collapse Details');

    toggle.click();
    fixture.detectChanges();
    expect(toggle.getAttribute('aria-label')).toBe('Expand Details');
  });

  it('respects an initial collapsed binding', () => {
    const { fixture, element } = setup();
    fixture.componentInstance.collapsed.set(true);
    fixture.detectChanges();
    expect(element.querySelector('.syui-panel-content')).toBeNull();
    expect(element.querySelector('.syui-panel')!.classList.contains('syui-panel-collapsed')).toBe(true);
  });

  it('labels the content region with the header', () => {
    const { element } = setup();
    const title = element.querySelector('.syui-panel-title')!;
    const region = element.querySelector('[role=region]')!;
    expect(region.getAttribute('aria-labelledby')).toBe(title.id);
  });
});
