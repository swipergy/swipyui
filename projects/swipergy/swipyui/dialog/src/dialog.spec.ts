import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Dialog } from './dialog';

@Component({
  imports: [Dialog],
  template: `
    <syui-dialog [(visible)]="visible" header="Confirm">
      <p>Body text</p>
      <button slot="footer" class="footer-action">OK</button>
    </syui-dialog>
  `,
})
class Host {
  visible = signal(false);
}

describe('Dialog', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    return { fixture };
  }

  function dialog(): HTMLElement | null {
    return document.querySelector('.syui-dialog');
  }

  afterEach(() => {
    document.querySelector('.cdk-overlay-container')?.remove();
  });

  it('opens and closes with the visible model', async () => {
    const { fixture } = setup();
    expect(dialog()).toBeNull();

    fixture.componentInstance.visible.set(true);
    await fixture.whenStable();
    expect(dialog()).toBeTruthy();
    expect(dialog()!.getAttribute('role')).toBe('dialog');
    expect(dialog()!.getAttribute('aria-modal')).toBe('true');
    expect(dialog()!.textContent).toContain('Body text');

    fixture.componentInstance.visible.set(false);
    await fixture.whenStable();
    expect(dialog()).toBeNull();
  });

  it('closes via the close button and updates the model', async () => {
    const { fixture } = setup();
    fixture.componentInstance.visible.set(true);
    await fixture.whenStable();

    (document.querySelector('.syui-dialog-close') as HTMLElement).click();
    await fixture.whenStable();

    expect(fixture.componentInstance.visible()).toBe(false);
    expect(dialog()).toBeNull();
  });

  it('closes on Escape', async () => {
    const { fixture } = setup();
    fixture.componentInstance.visible.set(true);
    await fixture.whenStable();

    dialog()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await fixture.whenStable();

    expect(fixture.componentInstance.visible()).toBe(false);
    expect(dialog()).toBeNull();
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

    expect(document.activeElement).toBe(trigger);
    trigger.remove();
  });

  it('labels the dialog with its header', async () => {
    const { fixture } = setup();
    fixture.componentInstance.visible.set(true);
    await fixture.whenStable();

    const labelledBy = dialog()!.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();
    expect(document.getElementById(labelledBy!)?.textContent).toContain('Confirm');
  });

  it('uses the ariaLabel input when no header is rendered', async () => {
    @Component({
      imports: [Dialog],
      template: `<syui-dialog [(visible)]="visible" ariaLabel="Settings">Body</syui-dialog>`,
    })
    class Unlabelled {
      visible = signal(false);
    }
    const fixture = TestBed.createComponent(Unlabelled);
    fixture.detectChanges();
    fixture.componentInstance.visible.set(true);
    await fixture.whenStable();

    expect(dialog()!.getAttribute('aria-label')).toBe('Settings');
    expect(dialog()!.hasAttribute('aria-labelledby')).toBe(false);
  });
});
