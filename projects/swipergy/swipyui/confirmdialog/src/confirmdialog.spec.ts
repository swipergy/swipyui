import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ConfirmDialog } from './confirmdialog';
import { ConfirmationService } from './confirmation.service';

@Component({
  imports: [ConfirmDialog],
  template: `<syui-confirm-dialog />`,
})
class Host {}

describe('ConfirmDialog', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const service = TestBed.inject(ConfirmationService);
    return { fixture, service };
  }

  function panel(): HTMLElement | null {
    return document.querySelector('.syui-confirmdialog');
  }

  afterEach(() => {
    document.querySelector('.cdk-overlay-container')?.remove();
  });

  it('opens via the service and renders header and message', async () => {
    const { fixture, service } = setup();
    expect(panel()).toBeNull();

    service.confirm({ header: 'Delete file', message: 'Are you sure?' });
    await fixture.whenStable();

    expect(panel()).toBeTruthy();
    expect(panel()!.getAttribute('role')).toBe('alertdialog');
    expect(panel()!.getAttribute('aria-modal')).toBe('true');
    expect(panel()!.textContent).toContain('Delete file');
    expect(panel()!.textContent).toContain('Are you sure?');
  });

  it('runs the accept callback and closes on accept', async () => {
    const { fixture, service } = setup();
    const accept = vi.fn();
    const reject = vi.fn();
    service.confirm({ message: 'Proceed?', acceptLabel: 'Yes', accept, reject });
    await fixture.whenStable();

    const acceptButton = document.querySelector<HTMLButtonElement>(
      '.syui-confirmdialog-accept button',
    )!;
    expect(acceptButton.textContent).toContain('Yes');
    acceptButton.click();
    await fixture.whenStable();

    expect(accept).toHaveBeenCalledTimes(1);
    expect(reject).not.toHaveBeenCalled();
    expect(panel()).toBeNull();
  });

  it('runs the reject callback and closes on reject', async () => {
    const { fixture, service } = setup();
    const reject = vi.fn();
    service.confirm({ message: 'Proceed?', reject });
    await fixture.whenStable();

    document.querySelector<HTMLButtonElement>('.syui-confirmdialog-reject button')!.click();
    await fixture.whenStable();

    expect(reject).toHaveBeenCalledTimes(1);
    expect(panel()).toBeNull();
  });

  it('rejects on Escape', async () => {
    const { fixture, service } = setup();
    const reject = vi.fn();
    service.confirm({ message: 'Proceed?', reject });
    await fixture.whenStable();

    panel()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await fixture.whenStable();

    expect(reject).toHaveBeenCalledTimes(1);
    expect(panel()).toBeNull();
  });

  it('focuses the accept button by default and the reject button for danger', async () => {
    const { fixture, service } = setup();
    service.confirm({ message: 'Proceed?' });
    await fixture.whenStable();
    expect(document.activeElement).toBe(
      document.querySelector('.syui-confirmdialog-accept button'),
    );

    service.close();
    await fixture.whenStable();

    service.confirm({ message: 'Delete?', severity: 'danger' });
    await fixture.whenStable();
    expect(document.activeElement).toBe(
      document.querySelector('.syui-confirmdialog-reject button'),
    );
  });

  it('returns focus to the previously focused element on close', async () => {
    const { fixture, service } = setup();
    const trigger = document.createElement('button');
    document.body.appendChild(trigger);
    trigger.focus();

    service.confirm({ message: 'Proceed?' });
    await fixture.whenStable();
    expect(document.activeElement).not.toBe(trigger);

    document.querySelector<HTMLButtonElement>('.syui-confirmdialog-accept button')!.click();
    await fixture.whenStable();

    expect(document.activeElement).toBe(trigger);
    trigger.remove();
  });

  it('styles the accept button by severity', async () => {
    const { fixture, service } = setup();
    service.confirm({ message: 'Delete?', severity: 'danger' });
    await fixture.whenStable();

    const acceptButton = document.querySelector('.syui-confirmdialog-accept button')!;
    expect(acceptButton.classList).toContain('syui-button-danger');
  });
});
