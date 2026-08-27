import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MenuItem } from '@swipergy/swipyui/core';
import { SpeedDial } from './speeddial';

@Component({
  imports: [SpeedDial],
  template: `<syui-speed-dial [model]="items" ariaLabel="Quick actions" [disabled]="disabled()" />`,
})
class Host {
  disabled = signal(false);
  added = 0;
  items: MenuItem[] = [
    { label: 'Add', command: () => this.added++ },
    { label: 'Edit' },
    { label: 'Hidden', visible: false },
  ];
}

describe('SpeedDial', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement.querySelector('syui-speed-dial');
    const trigger: HTMLButtonElement = root.querySelector('.syui-speed-dial-button')!;
    return { fixture, root, trigger };
  }

  function actions(root: HTMLElement): NodeListOf<HTMLButtonElement> {
    return root.querySelectorAll('.syui-speed-dial-action');
  }

  it('renders one labelled action per visible item', () => {
    const { root, trigger } = setup();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(actions(root).length).toBe(2);
    expect(actions(root)[0].getAttribute('aria-label')).toBe('Add');
    expect(actions(root)[0].getAttribute('title')).toBe('Add');
  });

  it('toggles open state from the trigger', () => {
    const { fixture, root, trigger } = setup();
    trigger.click();
    fixture.detectChanges();

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(root.classList).toContain('syui-speed-dial-open');
    expect(root.querySelector('[role="menu"]')!.getAttribute('aria-hidden')).toBe('false');

    trigger.click();
    fixture.detectChanges();
    expect(root.classList).not.toContain('syui-speed-dial-open');
  });

  it('runs the item command on click and closes', () => {
    const { fixture, root, trigger } = setup();
    trigger.click();
    fixture.detectChanges();

    actions(root)[0].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.added).toBe(1);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('opens with Enter on the trigger and focuses the first action', () => {
    const { fixture, root, trigger } = setup();
    trigger.focus();
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement).toBe(actions(root)[0]);
  });

  it('moves focus between actions with arrow keys', () => {
    const { fixture, root, trigger } = setup();
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(actions(root)[0]);

    actions(root)[0].dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
    );
    fixture.detectChanges();
    expect(document.activeElement).toBe(actions(root)[1]);
  });

  it('closes on Escape and refocuses the trigger', () => {
    const { fixture, root, trigger } = setup();
    trigger.click();
    fixture.detectChanges();

    actions(root)[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();

    expect(root.classList).not.toContain('syui-speed-dial-open');
    expect(document.activeElement).toBe(trigger);
  });

  it('closes on outside click', () => {
    const { fixture, trigger } = setup();
    trigger.click();
    fixture.detectChanges();

    document.body.click();
    fixture.detectChanges();

    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('applies the direction class and staggers transition delays', () => {
    const { root, fixture, trigger } = setup();
    expect(root.classList).toContain('syui-speed-dial-up');

    trigger.click();
    fixture.detectChanges();
    expect(actions(root)[0].style.transitionDelay).toBe('0ms');
    expect(actions(root)[1].style.transitionDelay).toBe('40ms');
  });

  it('disables the trigger', () => {
    const { fixture, trigger } = setup();
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();
    expect(trigger.disabled).toBe(true);
  });
});
