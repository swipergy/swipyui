import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ToolCall, ToolCallStatus } from './toolcall';

@Component({
  imports: [ToolCall],
  template: `
    <syui-tool-call
      id="call"
      name="search_docs"
      [status]="status()"
      [description]="description()"
      [duration]="duration()"
      [collapsible]="collapsible()"
      [(collapsed)]="collapsed"
    >
      <pre class="result">{{ '{ "hits": 3 }' }}</pre>
      <button slot="actions" class="retry">Retry</button>
    </syui-tool-call>
  `,
})
class Host {
  readonly status = signal<ToolCallStatus>('pending');
  readonly description = signal<string | undefined>(undefined);
  readonly duration = signal<number | undefined>(undefined);
  readonly collapsible = signal(true);
  readonly collapsed = signal(true);
}

describe('ToolCall', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const call: HTMLElement = fixture.nativeElement.querySelector('#call');
    const toggle = () => call.querySelector<HTMLButtonElement>('button.syui-tool-call-toggle')!;
    return { fixture, call, toggle, host: fixture.componentInstance };
  }

  it('starts collapsed and toggles the body from the header', () => {
    const { fixture, call, toggle, host } = setup();
    expect(call.querySelector('.syui-tool-call-body')).toBeNull();
    expect(toggle().getAttribute('aria-expanded')).toBe('false');
    expect(toggle().getAttribute('aria-controls')).toBeNull();

    toggle().click();
    fixture.detectChanges();
    const body = call.querySelector('.syui-tool-call-body')!;
    expect(body.querySelector('.result')).toBeTruthy();
    expect(toggle().getAttribute('aria-expanded')).toBe('true');
    expect(toggle().getAttribute('aria-controls')).toBe(body.id);
    expect(host.collapsed()).toBe(false);
  });

  it('announces the status as text, not by color alone', () => {
    const { fixture, call, host } = setup();
    expect(call.querySelector('.syui-tool-call-toggle .syui-sr-only')?.textContent).toBe('Queued');

    const expected: Record<ToolCallStatus, string> = {
      pending: 'Queued',
      running: 'Running',
      success: 'Completed',
      error: 'Failed',
    };
    for (const status of Object.keys(expected) as ToolCallStatus[]) {
      host.status.set(status);
      fixture.detectChanges();
      expect(call.querySelector('.syui-tool-call-toggle .syui-sr-only')?.textContent).toBe(
        expected[status],
      );
      expect(call.classList.contains(`syui-tool-call-${status}`)).toBe(true);
    }
  });

  it('reports itself busy only while running', () => {
    const { fixture, call, host } = setup();
    expect(call.getAttribute('aria-busy')).toBeNull();

    host.status.set('running');
    fixture.detectChanges();
    expect(call.getAttribute('aria-busy')).toBe('true');
    expect(call.querySelector('.syui-tool-call-spinner')).toBeTruthy();
  });

  it('formats the duration in milliseconds below a second and in seconds above', () => {
    const { fixture, call, host } = setup();
    expect(call.querySelector('.syui-tool-call-duration')).toBeNull();

    host.duration.set(820);
    fixture.detectChanges();
    expect(call.querySelector('.syui-tool-call-duration')?.textContent?.trim()).toBe('820 ms');

    host.duration.set(4200);
    fixture.detectChanges();
    expect(call.querySelector('.syui-tool-call-duration')?.textContent?.trim()).toBe('4.2 s');
  });

  it('shows the name, the description and projected actions in the header', () => {
    const { fixture, call, host } = setup();
    host.description.set('query: signals');
    fixture.detectChanges();
    expect(call.querySelector('.syui-tool-call-name')?.textContent).toBe('search_docs');
    expect(call.querySelector('.syui-tool-call-description')?.textContent).toBe('query: signals');
    expect(call.querySelector('.syui-tool-call-actions .retry')).toBeTruthy();
  });

  it('shows a static header with the body always open when not collapsible', () => {
    const { fixture, call, host } = setup();
    host.collapsible.set(false);
    fixture.detectChanges();
    expect(call.querySelector('button.syui-tool-call-toggle')).toBeNull();
    expect(call.querySelector('.syui-tool-call-static')).toBeTruthy();
    expect(call.querySelector('.syui-tool-call-body .result')).toBeTruthy();
  });
});
