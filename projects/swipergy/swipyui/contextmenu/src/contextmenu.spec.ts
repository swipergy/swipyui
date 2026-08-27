import { Component, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MenuItem } from '@swipergy/swipyui/core';
import { ContextMenu } from './contextmenu';

@Component({
  imports: [ContextMenu],
  template: `
    <div class="target" (contextmenu)="menu().show($event)">Right-click me</div>
    <syui-context-menu [items]="items" />
  `,
})
class Host {
  readonly menu = viewChild.required(ContextMenu);
  selected = '';
  items: MenuItem[] = [
    { label: 'Copy', command: () => (this.selected = 'Copy') },
    { label: 'Paste', disabled: true },
    { separator: true },
    {
      label: 'Share',
      items: [{ label: 'Mail', command: () => (this.selected = 'Mail') }],
    },
    { label: 'Hidden', visible: false },
  ];
}

@Component({
  imports: [ContextMenu],
  template: `<syui-context-menu [items]="items" global />`,
})
class GlobalHost {
  items: MenuItem[] = [{ label: 'Refresh' }];
}

describe('ContextMenu', () => {
  function setup() {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const target: HTMLElement = fixture.nativeElement.querySelector('.target');
    return { fixture, target };
  }

  function openAt(target: HTMLElement, x = 40, y = 60) {
    target.dispatchEvent(
      new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: x, clientY: y }),
    );
  }

  function menu(): HTMLElement | null {
    return document.querySelector('.syui-contextmenu');
  }

  afterEach(() => {
    document.querySelector('.cdk-overlay-container')?.remove();
  });

  it('opens on the target contextmenu event and skips hidden items', () => {
    const { fixture, target } = setup();
    expect(menu()).toBeNull();

    openAt(target);
    fixture.detectChanges();
    const labels = Array.from(menu()!.querySelectorAll('.syui-contextmenu-label')).map(
      (el) => el.textContent?.trim(),
    );
    expect(labels).toEqual(['Copy', 'Paste', 'Share']);
  });

  it('runs the command and closes when an item is clicked', () => {
    const { fixture, target } = setup();
    openAt(target);
    fixture.detectChanges();

    menu()!.querySelector<HTMLElement>('.syui-contextmenu-link')!.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selected).toBe('Copy');
    expect(menu()).toBeNull();
  });

  it('opens a submenu on hover and keeps the menu open when toggling it', () => {
    const { fixture, target } = setup();
    openAt(target);
    fixture.detectChanges();

    const share = menu()!.querySelectorAll('.syui-contextmenu-item')[2];
    share.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
    expect(menu()!.querySelector('.syui-contextmenu-submenu')).toBeTruthy();
    expect(share.querySelector('.syui-contextmenu-link')!.getAttribute('aria-expanded')).toBe('true');
  });

  it('navigates with the keyboard and closes on Escape', () => {
    const { fixture, target } = setup();
    openAt(target);
    fixture.detectChanges();
    const keydown = (key: string) =>
      menu()!.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));

    keydown('ArrowDown'); // skips disabled "Paste" and the separator → "Share"
    keydown('ArrowRight'); // opens the submenu
    fixture.detectChanges();
    keydown('Enter'); // activates "Mail"
    fixture.detectChanges();
    expect(fixture.componentInstance.selected).toBe('Mail');
    expect(menu()).toBeNull();

    openAt(target);
    fixture.detectChanges();
    keydown('Escape');
    fixture.detectChanges();
    expect(menu()).toBeNull();
  });

  it('opens from a keyboard event, anchored to the target element', () => {
    const { fixture, target } = setup();
    target.tabIndex = 0;
    target.focus();
    target.addEventListener('keydown', (event) => {
      if (event.shiftKey && event.key === 'F10') {
        fixture.componentInstance.menu().show(event);
      }
    });

    target.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'F10', shiftKey: true, cancelable: true, bubbles: true }),
    );
    fixture.detectChanges();
    expect(menu()).toBeTruthy();

    menu()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(menu()).toBeNull();
    expect(document.activeElement).toBe(target);
  });

  it('restores focus to the trigger element on Escape', () => {
    const { fixture, target } = setup();
    target.tabIndex = 0;
    openAt(target);
    fixture.detectChanges();

    menu()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(menu()).toBeNull();
    expect(document.activeElement).toBe(target);
  });

  it('does not activate disabled items', () => {
    const { fixture, target } = setup();
    openAt(target);
    fixture.detectChanges();

    const disabled = menu()!.querySelectorAll<HTMLElement>('.syui-contextmenu-link')[1];
    expect(disabled.getAttribute('aria-disabled')).toBe('true');
    disabled.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selected).toBe('');
    expect(menu()).toBeTruthy();
  });

  it('binds to the document in global mode', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(GlobalHost);
    fixture.detectChanges();

    document.body.dispatchEvent(
      new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 10, clientY: 10 }),
    );
    fixture.detectChanges();
    expect(menu()).toBeTruthy();

    fixture.destroy();
    document.querySelector('.cdk-overlay-container')?.remove();
  });
});
