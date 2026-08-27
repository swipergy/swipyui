import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Approval, ApprovalDecision, ApprovalSeverity } from './approval';

@Component({
  imports: [Approval],
  template: `
    <syui-approval
      id="approval"
      header="Run migration script?"
      [description]="description()"
      [severity]="severity()"
      [pending]="pending()"
      [disabled]="disabled()"
      [(decision)]="decision"
      (onApprove)="approved.set(approved() + 1)"
      (onReject)="rejected.set(rejected() + 1)"
    >
      <pre class="command">npm run db:migrate</pre>
    </syui-approval>
  `,
})
class Host {
  readonly description = signal<string | undefined>('This drops and recreates the orders table.');
  readonly severity = signal<ApprovalSeverity>('warn');
  readonly pending = signal(false);
  readonly disabled = signal(false);
  readonly decision = signal<ApprovalDecision | null>(null);
  readonly approved = signal(0);
  readonly rejected = signal(0);
}

describe('Approval', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const card: HTMLElement = fixture.nativeElement.querySelector('#approval');
    const buttons = () =>
      Array.from(card.querySelectorAll<HTMLButtonElement>('.syui-approval-footer button'));
    return { fixture, card, buttons, host: fixture.componentInstance };
  }

  it('is a group named by its header and shows the projected details', () => {
    const { card } = setup();
    expect(card.getAttribute('role')).toBe('group');
    const title = card.querySelector('.syui-approval-title')!;
    expect(card.getAttribute('aria-labelledby')).toBe(title.id);
    expect(title.textContent).toBe('Run migration script?');
    expect(card.querySelector('.syui-approval-description')?.textContent).toContain('orders table');
    expect(card.querySelector('.syui-approval-body .command')).toBeTruthy();
  });

  it('records an approval and replaces the buttons with an announced outcome', () => {
    const { fixture, card, buttons, host } = setup();
    buttons()[1].click();
    fixture.detectChanges();

    expect(host.approved()).toBe(1);
    expect(host.decision()).toBe('approved');
    const status = card.querySelector('.syui-approval-decision')!;
    expect(status.getAttribute('role')).toBe('status');
    expect(status.textContent).toContain('Approved');
    expect(buttons()).toHaveLength(0);
    expect(card.classList.contains('syui-approval-resolved')).toBe(true);
  });

  it('records a rejection', () => {
    const { fixture, card, buttons, host } = setup();
    buttons()[0].click();
    fixture.detectChanges();

    expect(host.rejected()).toBe(1);
    expect(host.decision()).toBe('rejected');
    expect(card.querySelector('.syui-approval-decision')?.textContent).toContain('Rejected');
  });

  it('renders an already resolved request without buttons', () => {
    const { fixture, card, buttons, host } = setup();
    host.decision.set('rejected');
    fixture.detectChanges();
    expect(buttons()).toHaveLength(0);
    expect(card.querySelector('.syui-approval-decision')?.textContent).toContain('Rejected');
  });

  it('takes no decision while disabled', () => {
    const { fixture, buttons, host } = setup();
    host.disabled.set(true);
    fixture.detectChanges();

    for (const button of buttons()) {
      expect(button.disabled).toBe(true);
      button.click();
    }
    fixture.detectChanges();
    expect(host.decision()).toBeNull();
    expect(host.approved()).toBe(0);
    expect(host.rejected()).toBe(0);
  });

  it('keeps approving available while pending but blocks a late rejection', () => {
    const { fixture, buttons, host } = setup();
    host.pending.set(true);
    fixture.detectChanges();

    const [reject, approve] = buttons();
    expect(reject.disabled).toBe(true);
    expect(approve.getAttribute('aria-busy')).toBe('true');

    reject.click();
    fixture.detectChanges();
    expect(host.decision()).toBeNull();
  });

  it('accents the card by severity and escalates the approve button for danger', () => {
    const { fixture, card, buttons, host } = setup();
    expect(card.classList.contains('syui-approval-warn')).toBe(true);
    expect(buttons()[1].classList.contains('syui-button-primary')).toBe(true);

    host.severity.set('danger');
    fixture.detectChanges();
    expect(card.classList.contains('syui-approval-danger')).toBe(true);
    expect(buttons()[1].classList.contains('syui-button-danger')).toBe(true);
  });
});
