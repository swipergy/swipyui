import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Reasoning } from './reasoning';
import { ThinkingIndicator } from './thinking-indicator';

@Component({
  imports: [Reasoning],
  template: `
    <syui-reasoning
      id="reasoning"
      [active]="active()"
      [duration]="duration()"
      [autoCollapse]="autoCollapse()"
      [(collapsed)]="collapsed"
    >
      Weighing two approaches…
    </syui-reasoning>
  `,
})
class Host {
  readonly active = signal(false);
  readonly duration = signal<number | undefined>(undefined);
  readonly autoCollapse = signal(false);
  readonly collapsed = signal(true);
}

describe('Reasoning', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const block: HTMLElement = fixture.nativeElement.querySelector('#reasoning');
    const toggle = () => block.querySelector<HTMLButtonElement>('.syui-reasoning-toggle')!;
    return { fixture, block, toggle, host: fixture.componentInstance };
  }

  it('hides the reasoning behind a disclosure button', () => {
    const { fixture, block, toggle, host } = setup();
    expect(block.querySelector('.syui-reasoning-body')).toBeNull();
    expect(toggle().getAttribute('aria-expanded')).toBe('false');

    toggle().click();
    fixture.detectChanges();
    const body = block.querySelector('.syui-reasoning-body')!;
    expect(body.textContent).toContain('Weighing two approaches');
    expect(toggle().getAttribute('aria-controls')).toBe(body.id);
    expect(host.collapsed()).toBe(false);
  });

  it('swaps the label and reports busy while reasoning streams in', () => {
    const { fixture, block, host } = setup();
    expect(block.querySelector('.syui-reasoning-label')?.textContent).toBe('Reasoning');
    expect(block.getAttribute('aria-busy')).toBeNull();

    host.active.set(true);
    fixture.detectChanges();
    expect(block.querySelector('.syui-reasoning-label')?.textContent).toBe('Thinking…');
    expect(block.getAttribute('aria-busy')).toBe('true');
    expect(block.classList.contains('syui-reasoning-active')).toBe(true);
  });

  it('shows the duration only once the reasoning is complete', () => {
    const { fixture, block, host } = setup();
    host.duration.set(12.4);
    host.active.set(true);
    fixture.detectChanges();
    expect(block.querySelector('.syui-reasoning-duration')).toBeNull();

    host.active.set(false);
    fixture.detectChanges();
    expect(block.querySelector('.syui-reasoning-duration')?.textContent?.trim()).toBe('12 s');

    host.duration.set(4.25);
    fixture.detectChanges();
    expect(block.querySelector('.syui-reasoning-duration')?.textContent?.trim()).toBe('4.3 s');

    host.duration.set(95);
    fixture.detectChanges();
    expect(block.querySelector('.syui-reasoning-duration')?.textContent?.trim()).toBe('1 min 35 s');
  });

  it('collapses itself when reasoning ends and autoCollapse is set', () => {
    const { fixture, host } = setup();
    host.autoCollapse.set(true);
    host.active.set(true);
    fixture.detectChanges();

    host.collapsed.set(false);
    fixture.detectChanges();

    host.active.set(false);
    fixture.detectChanges();
    expect(host.collapsed()).toBe(true);
  });

  it('leaves an expanded block open without autoCollapse', () => {
    const { fixture, host } = setup();
    host.active.set(true);
    host.collapsed.set(false);
    fixture.detectChanges();

    host.active.set(false);
    fixture.detectChanges();
    expect(host.collapsed()).toBe(false);
  });
});

@Component({
  imports: [ThinkingIndicator],
  template: `<syui-thinking-indicator
    id="indicator"
    [label]="label()"
    [showLabel]="showLabel()"
  />`,
})
class IndicatorHost {
  readonly label = signal('Thinking…');
  readonly showLabel = signal(true);
}

describe('ThinkingIndicator', () => {
  function setup() {
    const fixture = TestBed.createComponent(IndicatorHost);
    fixture.detectChanges();
    const indicator: HTMLElement = fixture.nativeElement.querySelector('#indicator');
    return { fixture, indicator, host: fixture.componentInstance };
  }

  it('is a polite status region with three dots', () => {
    const { indicator } = setup();
    expect(indicator.getAttribute('role')).toBe('status');
    expect(indicator.getAttribute('aria-live')).toBe('polite');
    expect(indicator.querySelectorAll('.syui-thinking-indicator-dot')).toHaveLength(3);
  });

  it('keeps the label announced when it is not shown', () => {
    const { fixture, indicator, host } = setup();
    host.label.set('Searching the docs');
    fixture.detectChanges();
    expect(indicator.querySelector('.syui-thinking-indicator-label')?.textContent).toBe(
      'Searching the docs',
    );

    host.showLabel.set(false);
    fixture.detectChanges();
    expect(indicator.querySelector('.syui-thinking-indicator-label')).toBeNull();
    expect(indicator.querySelector('.syui-sr-only')?.textContent).toBe('Searching the docs');
  });
});
