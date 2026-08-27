import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Popover } from './popover';

@Component({
  imports: [Popover],
  template: `
    <button class="trigger" (click)="op.toggle($event)">Open</button>
    <syui-popover #op (onShow)="shown.set(true)" (onHide)="hidden.set(true)">
      <p class="popover-body">Popover body</p>
    </syui-popover>
  `,
})
class Host {
  shown = signal(false);
  hidden = signal(false);
}

describe('Popover', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const trigger: HTMLButtonElement = fixture.nativeElement.querySelector('.trigger');
    return { fixture, trigger };
  }

  function panel(): HTMLElement | null {
    return document.querySelector('.syui-popover');
  }

  afterEach(() => {
    document.querySelector('.cdk-overlay-container')?.remove();
  });

  it('opens on toggle and projects its content', async () => {
    const { fixture, trigger } = setup();
    expect(panel()).toBeNull();

    trigger.click();
    await fixture.whenStable();

    expect(panel()).toBeTruthy();
    expect(panel()!.textContent).toContain('Popover body');
    expect(fixture.componentInstance.shown()).toBe(true);
  });

  it('closes on a second toggle and emits onHide', async () => {
    const { fixture, trigger } = setup();
    trigger.click();
    await fixture.whenStable();

    trigger.click();
    await fixture.whenStable();

    expect(panel()).toBeNull();
    expect(fixture.componentInstance.hidden()).toBe(true);
  });

  it('closes on Escape', async () => {
    const { fixture, trigger } = setup();
    trigger.click();
    await fixture.whenStable();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await fixture.whenStable();

    expect(panel()).toBeNull();
  });

  it('returns focus to the anchor when closed while focus is inside the panel', async () => {
    @Component({
      imports: [Popover],
      template: `
        <button class="trigger" (click)="op.toggle($event)">Open</button>
        <syui-popover #op>
          <button class="inner">Inner action</button>
        </syui-popover>
      `,
    })
    class FocusHost {}
    const fixture = TestBed.createComponent(FocusHost);
    fixture.detectChanges();
    const trigger: HTMLButtonElement = fixture.nativeElement.querySelector('.trigger');

    trigger.click();
    await fixture.whenStable();
    document.querySelector<HTMLButtonElement>('.syui-popover .inner')!.focus();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await fixture.whenStable();

    expect(panel()).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('supports imperative show and hide', async () => {
    const { fixture, trigger } = setup();
    const popover = fixture.debugElement.children
      .find((child) => child.componentInstance instanceof Popover)!
      .componentInstance as Popover;

    popover.show({ currentTarget: trigger, target: trigger } as unknown as Event);
    await fixture.whenStable();
    expect(panel()).toBeTruthy();
    expect(popover.visible()).toBe(true);

    popover.hide();
    await fixture.whenStable();
    expect(panel()).toBeNull();
    expect(popover.visible()).toBe(false);
  });
});
