import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Message } from './message';

@Component({
  imports: [Message],
  template: `<syui-message [severity]="severity()" text="Saved." closable (onClose)="closed = true" />`,
})
class Host {
  severity = signal<'success' | 'info' | 'warn' | 'error' | 'secondary'>('success');
  closed = false;
}

describe('Message', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const message: HTMLElement = fixture.nativeElement.querySelector('syui-message');
    return { fixture, message };
  }

  it('renders the text with the severity class and icon', () => {
    const { message } = setup();
    expect(message.textContent).toContain('Saved.');
    expect(message.classList).toContain('syui-message-success');
    expect(message.querySelector('svg.syui-message-icon')).toBeTruthy();
  });

  it('uses role="status" for non-critical severities', () => {
    const { message } = setup();
    expect(message.getAttribute('role')).toBe('status');
  });

  it('uses role="alert" for error and warn severities', () => {
    const { fixture, message } = setup();
    fixture.componentInstance.severity.set('error');
    fixture.detectChanges();
    expect(message.getAttribute('role')).toBe('alert');
    expect(message.classList).toContain('syui-message-error');
  });

  it('hides itself and emits onClose when the close button is clicked', () => {
    const { fixture, message } = setup();
    const close: HTMLButtonElement = message.querySelector('.syui-message-close')!;
    close.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.closed).toBe(true);
    expect(message.classList).toContain('syui-message-hidden');
    expect(message.querySelector('.syui-message-text')).toBeNull();
  });

  it('projects content', () => {
    @Component({
      imports: [Message],
      template: `<syui-message severity="info">Projected <strong>content</strong></syui-message>`,
    })
    class Projecting {}
    const fixture = TestBed.createComponent(Projecting);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('strong')?.textContent).toBe('content');
  });
});
