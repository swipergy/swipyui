import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Fieldset } from './fieldset';

@Component({
  imports: [Fieldset],
  template: `
    <syui-fieldset legend="Address" [toggleable]="toggleable()" [(collapsed)]="collapsed">
      Street, city, zip
    </syui-fieldset>
  `,
})
class Host {
  toggleable = signal(false);
  collapsed = signal(false);
}

describe('Fieldset', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    return { fixture, element };
  }

  it('renders a native fieldset with legend and content', () => {
    const { element } = setup();
    expect(element.querySelector('fieldset')).not.toBeNull();
    expect(element.querySelector('legend')?.textContent).toContain('Address');
    expect(element.querySelector('.syui-fieldset-content')?.textContent).toContain(
      'Street, city, zip',
    );
  });

  it('renders the legend as plain text when not toggleable', () => {
    const { element } = setup();
    expect(element.querySelector('.syui-fieldset-toggle')).toBeNull();
    expect(element.querySelector('.syui-fieldset-label')).not.toBeNull();
  });

  it('renders the legend as a toggle button when toggleable', () => {
    const { fixture, element } = setup();
    fixture.componentInstance.toggleable.set(true);
    fixture.detectChanges();

    const toggle = element.querySelector('legend .syui-fieldset-toggle');
    expect(toggle).not.toBeNull();
    expect(toggle!.getAttribute('aria-expanded')).toBe('true');
  });

  it('collapses and expands the content via the legend button', () => {
    const { fixture, element } = setup();
    fixture.componentInstance.toggleable.set(true);
    fixture.detectChanges();

    const toggle: HTMLButtonElement = element.querySelector('.syui-fieldset-toggle')!;
    toggle.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.collapsed()).toBe(true);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(element.querySelector('.syui-fieldset-content')).toBeNull();

    toggle.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.collapsed()).toBe(false);
    expect(element.querySelector('.syui-fieldset-content')).not.toBeNull();
  });

  it('respects an initial collapsed binding', () => {
    const { fixture, element } = setup();
    fixture.componentInstance.collapsed.set(true);
    fixture.detectChanges();
    expect(element.querySelector('.syui-fieldset-content')).toBeNull();
  });
});
