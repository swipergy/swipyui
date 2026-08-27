import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AgentStep, AgentStepContent, AgentSteps } from './agentsteps';

@Component({
  imports: [AgentSteps, AgentStepContent],
  template: `
    <syui-agent-steps id="steps" [steps]="steps()" [live]="live()" [busy]="busy()">
      <ng-template syuiAgentStepContent let-step let-i="index">
        <span class="detail">{{ i }}:{{ step.label }}</span>
      </ng-template>
    </syui-agent-steps>
  `,
})
class Host {
  readonly steps = signal<AgentStep[]>([
    { label: 'Read the issue', status: 'done' },
    {
      label: 'Search the codebase',
      status: 'active',
      description: 'grep for the failing assertion',
    },
    { label: 'Write the fix' },
  ]);
  readonly live = signal<'polite' | 'off'>('polite');
  readonly busy = signal(false);
}

describe('AgentSteps', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement.querySelector('#steps');
    const items = () => Array.from(root.querySelectorAll('.syui-agent-steps-step'));
    return { fixture, root, items, host: fixture.componentInstance };
  }

  it('renders the plan as a named, politely announced ordered list', () => {
    const { root, items } = setup();
    const list = root.querySelector('ol')!;
    expect(list.getAttribute('aria-label')).toBe('Agent progress');
    expect(list.getAttribute('aria-live')).toBe('polite');
    expect(items()).toHaveLength(3);
  });

  it('marks each step with its status and announces it as text', () => {
    const { items } = setup();
    expect(items()[0].classList.contains('syui-agent-steps-done')).toBe(true);
    expect(items()[1].classList.contains('syui-agent-steps-active')).toBe(true);
    expect(items()[1].querySelector('.syui-sr-only')?.textContent).toContain('In progress');
    expect(items()[2].classList.contains('syui-agent-steps-pending')).toBe(true);
    expect(items()[2].querySelector('.syui-sr-only')?.textContent).toContain('Not started');
  });

  it('spins on the active step and connects all but the last', () => {
    const { root, items } = setup();
    expect(items()[1].querySelector('.syui-agent-steps-spinner')).toBeTruthy();
    expect(root.querySelectorAll('.syui-agent-steps-connector')).toHaveLength(2);
  });

  it('shows the description and the projected step template', () => {
    const { items } = setup();
    expect(items()[1].querySelector('.syui-agent-steps-description')?.textContent).toBe(
      'grep for the failing assertion',
    );
    expect(items()[1].querySelector('.detail')?.textContent).toBe('1:Search the codebase');
  });

  it('reports itself busy while the agent works and can go quiet', () => {
    const { fixture, root, host } = setup();
    const list = root.querySelector('ol')!;
    expect(list.getAttribute('aria-busy')).toBeNull();

    host.busy.set(true);
    host.live.set('off');
    fixture.detectChanges();
    expect(list.getAttribute('aria-busy')).toBe('true');
    expect(list.getAttribute('aria-live')).toBe('off');
  });

  it('reflects status changes as the agent advances', () => {
    const { fixture, items, host } = setup();
    host.steps.set([
      { label: 'Read the issue', status: 'done' },
      { label: 'Search the codebase', status: 'error' },
      { label: 'Write the fix', status: 'skipped' },
    ]);
    fixture.detectChanges();
    expect(items()[1].classList.contains('syui-agent-steps-error')).toBe(true);
    expect(items()[1].querySelector('.syui-sr-only')?.textContent).toContain('Failed');
    expect(items()[2].querySelector('.syui-sr-only')?.textContent).toContain('Skipped');
  });
});
