import { Component, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MenuItem } from '@swipergy/swipyui/core';
import { TieredMenu } from './tieredmenu';

@Component({
  imports: [TieredMenu],
  template: `<syui-tiered-menu [items]="items" />`,
})
class Host {
  selected = '';
  items: MenuItem[] = [
    {
      label: 'File',
      items: [
        { label: 'New', command: () => (this.selected = 'New') },
        { label: 'Print', disabled: true },
        { separator: true },
        { label: 'Quit', command: () => (this.selected = 'Quit') },
      ],
    },
    { label: 'Docs', url: 'https://example.com', target: '_blank' },
    { label: 'Settings', routerLink: '/settings' },
    { label: 'Hidden', visible: false },
  ];
}

@Component({
  imports: [TieredMenu],
  template: `
    <button type="button" (click)="menu().toggle($event)">Open</button>
    <syui-tiered-menu [items]="items" popup />
  `,
})
class PopupHost {
  readonly menu = viewChild.required(TieredMenu);
  items: MenuItem[] = [{ label: 'One' }, { label: 'Two' }];
}

describe('TieredMenu', () => {
  function setup() {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const menu: HTMLElement = fixture.nativeElement.querySelector('.syui-tieredmenu');
    return { fixture, menu };
  }

  afterEach(() => {
    document.querySelector('.cdk-overlay-container')?.remove();
  });

  it('renders visible items and skips hidden ones', () => {
    const { menu } = setup();
    const labels = Array.from(menu.querySelectorAll('.syui-tieredmenu-label')).map(
      (el) => el.textContent?.trim(),
    );
    expect(labels).toEqual(['File', 'Docs', 'Settings']);
  });

  it('renders url items as plain anchors and routerLink items with router hrefs', () => {
    const { menu } = setup();
    const links = menu.querySelectorAll<HTMLAnchorElement>('.syui-tieredmenu-link');
    expect(links[1].getAttribute('href')).toBe('https://example.com');
    expect(links[1].getAttribute('target')).toBe('_blank');
    expect(links[2].getAttribute('href')).toBe('/settings');
  });

  it('opens the submenu on hover and renders the separator', () => {
    const { fixture, menu } = setup();
    const first = menu.querySelector('.syui-tieredmenu-item')!;
    first.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();

    const submenu = menu.querySelector('.syui-tieredmenu-submenu')!;
    expect(submenu).toBeTruthy();
    expect(first.querySelector('.syui-tieredmenu-link')!.getAttribute('aria-expanded')).toBe('true');
    expect(submenu.querySelectorAll('[role="separator"]').length).toBe(1);
  });

  it('navigates with the keyboard: right opens, arrows skip disabled, enter activates', () => {
    const { fixture, menu } = setup();
    const keydown = (key: string) =>
      menu.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));

    keydown('ArrowDown'); // focus "File"
    fixture.detectChanges();
    keydown('ArrowRight'); // open submenu, focus "New"
    fixture.detectChanges();
    expect(menu.querySelector('.syui-tieredmenu-submenu')).toBeTruthy();

    keydown('ArrowDown'); // skips disabled "Print" and the separator → "Quit"
    fixture.detectChanges();
    keydown('Enter');
    fixture.detectChanges();
    expect(fixture.componentInstance.selected).toBe('Quit');
  });

  it('closes the submenu with ArrowLeft', () => {
    const { fixture, menu } = setup();
    const keydown = (key: string) =>
      menu.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));

    keydown('ArrowDown');
    keydown('ArrowRight');
    fixture.detectChanges();
    keydown('ArrowLeft');
    fixture.detectChanges();
    expect(menu.querySelector('.syui-tieredmenu-submenu')).toBeNull();
  });

  it('does not activate disabled items', () => {
    const { fixture, menu } = setup();
    menu.querySelector('.syui-tieredmenu-item')!.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();

    const disabled = menu.querySelectorAll<HTMLElement>(
      '.syui-tieredmenu-submenu .syui-tieredmenu-link',
    )[1];
    expect(disabled.getAttribute('aria-disabled')).toBe('true');
    disabled.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selected).toBe('');
  });

  it('toggles as a popup and closes on Escape', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(PopupHost);
    fixture.detectChanges();
    expect(document.querySelector('.syui-tieredmenu')).toBeNull();

    fixture.nativeElement.querySelector('button').click();
    fixture.detectChanges();
    const menu = document.querySelector('.syui-tieredmenu-popup')!;
    expect(menu).toBeTruthy();

    menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(document.querySelector('.syui-tieredmenu')).toBeNull();
  });
});
