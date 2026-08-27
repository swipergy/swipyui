import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Inplace } from './inplace';

@Component({
  imports: [Inplace],
  template: `
    <syui-inplace [(active)]="active" [closable]="closable()" [disabled]="disabled()">
      <span syui-inplace-display>Click to edit</span>
      <span syui-inplace-content><input class="editor" value="text" /></span>
    </syui-inplace>
  `,
})
class Host {
  active = signal(false);
  closable = signal(false);
  disabled = signal(false);
}

describe('Inplace', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    const display = () => element.querySelector<HTMLButtonElement>('.syui-inplace-display');
    const content = () => element.querySelector<HTMLElement>('.syui-inplace-content');
    const close = () => element.querySelector<HTMLButtonElement>('.syui-inplace-close');
    return { fixture, element, display, content, close };
  }

  it('shows the display slot in a button until activated', () => {
    const { display, content } = setup();
    expect(display()!.textContent).toContain('Click to edit');
    expect(content()).toBeNull();
  });

  it('activates on click and shows the content slot', () => {
    const { fixture, display, content } = setup();
    display()!.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.active()).toBe(true);
    expect(display()).toBeNull();
    expect(content()!.querySelector('.editor')).toBeTruthy();
  });

  it('deactivates through the two-way bound active model', () => {
    const { fixture, display, content } = setup();
    fixture.componentInstance.active.set(true);
    fixture.detectChanges();
    expect(content()).toBeTruthy();

    fixture.componentInstance.active.set(false);
    fixture.detectChanges();
    expect(content()).toBeNull();
    expect(display()).toBeTruthy();
  });

  it('renders a close button when closable that deactivates', () => {
    const { fixture, display, close } = setup();
    fixture.componentInstance.closable.set(true);
    fixture.componentInstance.active.set(true);
    fixture.detectChanges();

    const closeButton = close()!;
    expect(closeButton.getAttribute('aria-label')).toBe('Close');
    closeButton.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.active()).toBe(false);
    expect(display()).toBeTruthy();
  });

  it('moves focus into the content when activated', async () => {
    const { fixture, display, content } = setup();
    display()!.click();
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve));

    expect(document.activeElement).toBe(content()!.querySelector('.editor'));
  });

  it('reverts to display mode on Escape and restores focus', async () => {
    const { fixture, display, content } = setup();
    display()!.click();
    fixture.detectChanges();

    content()!
      .querySelector('.editor')!
      .dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.active()).toBe(false);
    expect(content()).toBeNull();
    await new Promise((resolve) => setTimeout(resolve));
    expect(document.activeElement).toBe(display());
  });

  it('hides the close button when not closable', () => {
    const { fixture, close } = setup();
    fixture.componentInstance.active.set(true);
    fixture.detectChanges();
    expect(close()).toBeNull();
  });

  it('does not activate while disabled', () => {
    const { fixture, display, content } = setup();
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();

    expect(display()!.disabled).toBe(true);
    display()!.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.active()).toBe(false);
    expect(content()).toBeNull();
  });
});
