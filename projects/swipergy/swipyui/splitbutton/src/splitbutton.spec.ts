import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MenuItem } from '@swipergy/swipyui/core';
import { SplitButton } from './splitbutton';

@Component({
  imports: [SplitButton],
  template: `
    <syui-split-button
      label="Save"
      [model]="items"
      [disabled]="disabled()"
      (onClick)="clicks = clicks + 1"
    />
  `,
})
class Host {
  clicks = 0;
  disabled = signal(false);
  updated = 0;
  deleted = 0;
  items: MenuItem[] = [
    { label: 'Update', command: () => this.updated++ },
    { label: 'Sold out', disabled: true },
    { separator: true },
    { label: 'Delete', command: () => this.deleted++ },
  ];
}

describe('SplitButton', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const primary: HTMLButtonElement = fixture.nativeElement.querySelector('syui-button .syui-button');
    const trigger: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.syui-split-button-menu-button',
    );
    return { fixture, primary, trigger };
  }

  function menu(): HTMLElement | null {
    return document.querySelector('.syui-split-button-menu');
  }

  afterEach(() => {
    document.querySelector('.cdk-overlay-container')?.remove();
  });

  it('emits onClick from the primary button without opening the menu', () => {
    const { fixture, primary } = setup();
    primary.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.clicks).toBe(1);
    expect(menu()).toBeNull();
  });

  it('opens the menu from the chevron trigger', () => {
    const { fixture, trigger } = setup();
    trigger.click();
    fixture.detectChanges();

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(menu()!.querySelectorAll('[role="menuitem"]').length).toBe(3);
    expect(menu()!.querySelectorAll('[role="separator"]').length).toBe(1);
  });

  it('runs the item command on click and closes the menu', () => {
    const { fixture, trigger } = setup();
    trigger.click();
    fixture.detectChanges();

    (menu()!.querySelectorAll('[role="menuitem"]')[2] as HTMLElement).click();
    fixture.detectChanges();

    expect(fixture.componentInstance.deleted).toBe(1);
    expect(menu()).toBeNull();
  });

  it('navigates with arrow keys, skipping disabled items and separators', () => {
    const { fixture, trigger } = setup();
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();
    expect(menu()).toBeTruthy();

    // active starts on Update; next skips the disabled item and the separator
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.deleted).toBe(1);
    expect(fixture.componentInstance.updated).toBe(0);
    expect(menu()).toBeNull();
  });

  it('closes on Escape without activating anything', () => {
    const { fixture, trigger } = setup();
    trigger.click();
    fixture.detectChanges();
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();

    expect(menu()).toBeNull();
    expect(fixture.componentInstance.updated).toBe(0);
  });

  it('disables both halves', () => {
    const { fixture, primary, trigger } = setup();
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();

    expect(primary.disabled).toBe(true);
    expect(trigger.disabled).toBe(true);
  });
});
