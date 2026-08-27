import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Drawer, DrawerPosition } from './drawer';

@Component({
  imports: [Drawer],
  template: `
    <syui-drawer [(visible)]="visible" [position]="position()" header="Settings">
      <p>Drawer body</p>
    </syui-drawer>
  `,
})
class Host {
  visible = signal(false);
  position = signal<DrawerPosition>('left');
}

describe('Drawer', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    return { fixture };
  }

  function drawer(): HTMLElement | null {
    return document.querySelector('.syui-drawer');
  }

  function waitForLeave(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 250));
  }

  afterEach(() => {
    document.querySelector('.cdk-overlay-container')?.remove();
  });

  it('opens with the visible model and exposes dialog semantics', async () => {
    const { fixture } = setup();
    expect(drawer()).toBeNull();

    fixture.componentInstance.visible.set(true);
    await fixture.whenStable();

    expect(drawer()).toBeTruthy();
    expect(drawer()!.getAttribute('role')).toBe('dialog');
    expect(drawer()!.getAttribute('aria-modal')).toBe('true');
    expect(drawer()!.textContent).toContain('Drawer body');
  });

  it('closes after the leave animation when visible becomes false', async () => {
    const { fixture } = setup();
    fixture.componentInstance.visible.set(true);
    await fixture.whenStable();

    fixture.componentInstance.visible.set(false);
    await fixture.whenStable();
    expect(drawer()!.classList).toContain('syui-drawer-leave');

    await waitForLeave();
    expect(drawer()).toBeNull();
  });

  it('closes via the close button', async () => {
    const { fixture } = setup();
    fixture.componentInstance.visible.set(true);
    await fixture.whenStable();

    (document.querySelector('.syui-drawer-close') as HTMLElement).click();
    await fixture.whenStable();

    expect(fixture.componentInstance.visible()).toBe(false);
    await waitForLeave();
    expect(drawer()).toBeNull();
  });

  it('closes on Escape', async () => {
    const { fixture } = setup();
    fixture.componentInstance.visible.set(true);
    await fixture.whenStable();

    drawer()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await fixture.whenStable();

    expect(fixture.componentInstance.visible()).toBe(false);
  });

  it('returns focus to the previously focused element on close', async () => {
    const { fixture } = setup();
    const trigger = document.createElement('button');
    document.body.appendChild(trigger);
    trigger.focus();

    fixture.componentInstance.visible.set(true);
    await fixture.whenStable();
    fixture.componentInstance.visible.set(false);
    await fixture.whenStable();
    await waitForLeave();

    expect(document.activeElement).toBe(trigger);
    trigger.remove();
  });

  it('applies the position class and labels the drawer with its header', async () => {
    const { fixture } = setup();
    fixture.componentInstance.position.set('right');
    fixture.componentInstance.visible.set(true);
    await fixture.whenStable();

    expect(drawer()!.classList).toContain('syui-drawer-right');
    const labelledBy = drawer()!.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();
    expect(document.getElementById(labelledBy!)?.textContent).toContain('Settings');
  });
});
