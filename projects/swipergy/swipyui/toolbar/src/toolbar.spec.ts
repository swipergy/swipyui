import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Toolbar } from './toolbar';

@Component({
  imports: [Toolbar],
  template: `
    <syui-toolbar ariaLabel="Editor actions">
      <div syui-toolbar-start>Start slot</div>
      <div syui-toolbar-center>Center slot</div>
      <div syui-toolbar-end>End slot</div>
    </syui-toolbar>
  `,
})
class Host {}

@Component({
  imports: [Toolbar],
  template: `
    <syui-toolbar ariaLabel="Actions">
      <div syui-toolbar-start>
        <button type="button">New</button>
        <button type="button">Open</button>
      </div>
      <div syui-toolbar-end>
        <button type="button">Save</button>
      </div>
    </syui-toolbar>
  `,
})
class KeyboardHost {}

describe('Toolbar', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const toolbar: HTMLElement = fixture.nativeElement.querySelector('syui-toolbar');
    return { fixture, toolbar };
  }

  function keyboardSetup() {
    const fixture = TestBed.createComponent(KeyboardHost);
    fixture.detectChanges();
    const buttons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    );
    return { fixture, buttons };
  }

  function press(target: HTMLElement, key: string) {
    target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
  }

  it('exposes the toolbar role and accessible name', () => {
    const { toolbar } = setup();
    expect(toolbar.getAttribute('role')).toBe('toolbar');
    expect(toolbar.getAttribute('aria-label')).toBe('Editor actions');
  });

  it('projects content into the start slot', () => {
    const { toolbar } = setup();
    expect(toolbar.querySelector('.syui-toolbar-start')?.textContent).toContain('Start slot');
  });

  it('projects content into the center slot', () => {
    const { toolbar } = setup();
    expect(toolbar.querySelector('.syui-toolbar-center')?.textContent).toContain('Center slot');
  });

  it('projects content into the end slot', () => {
    const { toolbar } = setup();
    expect(toolbar.querySelector('.syui-toolbar-end')?.textContent).toContain('End slot');
  });

  it('moves focus between controls with arrow keys, wrapping at the edges', () => {
    const { buttons } = keyboardSetup();
    buttons[0].focus();

    press(buttons[0], 'ArrowRight');
    expect(document.activeElement).toBe(buttons[1]);

    press(buttons[1], 'ArrowLeft');
    expect(document.activeElement).toBe(buttons[0]);

    press(buttons[0], 'ArrowLeft');
    expect(document.activeElement).toBe(buttons[2]);
  });

  it('jumps to the first and last control with Home and End', () => {
    const { buttons } = keyboardSetup();
    buttons[1].focus();

    press(buttons[1], 'End');
    expect(document.activeElement).toBe(buttons[2]);

    press(buttons[2], 'Home');
    expect(document.activeElement).toBe(buttons[0]);
  });
});
