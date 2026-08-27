import { Component, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MenuItem } from '@swipergy/swipyui/core';
import { Menu } from './menu';

@Component({
  imports: [Menu],
  template: `
    <syui-menu [model]="items" />
    <button type="button" (click)="popupMenu().toggle($event)">Open</button>
    <syui-menu #popup [model]="items" popup />
  `,
})
class Host {
  readonly popupMenu = viewChild.required<Menu>('popup');
  saved = 0;
  items: MenuItem[] = [
    {
      label: 'File',
      items: [
        { label: 'Save', command: () => this.saved++ },
        { label: 'Print', disabled: true, command: () => this.saved++ },
        { separator: true },
        { label: 'Docs', routerLink: '/docs' },
      ],
    },
    { label: 'Hidden', visible: false },
    { label: 'Website', url: 'https://example.com' },
  ];
}

describe('Menu', () => {
  function setup() {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const inline: HTMLElement = fixture.nativeElement.querySelector('.syui-menu-list');
    return { fixture, inline };
  }

  function links(root: ParentNode): HTMLElement[] {
    return Array.from(root.querySelectorAll('[role="menuitem"]'));
  }

  it('renders items, group headers and separators, skipping hidden items', () => {
    const { inline } = setup();
    expect(links(inline).map((link) => link.textContent!.trim())).toEqual([
      'Save',
      'Print',
      'Docs',
      'Website',
    ]);
    expect(inline.querySelector('.syui-menu-header')!.textContent).toContain('File');
    expect(inline.querySelector('[role="separator"]')).toBeTruthy();
    expect(inline.textContent).not.toContain('Hidden');
  });

  it('invokes command on click but ignores disabled items', () => {
    const { fixture, inline } = setup();
    links(inline)[0].click();
    expect(fixture.componentInstance.saved).toBe(1);
    links(inline)[1].click();
    expect(fixture.componentInstance.saved).toBe(1);
  });

  it('moves focus with arrow keys, skipping disabled items', () => {
    const { inline } = setup();
    const enabled = links(inline).filter((link) => !link.classList.contains('syui-menu-item-disabled'));
    enabled[0].focus();
    enabled[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(document.activeElement).toBe(enabled[1]);
    document.activeElement!.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }),
    );
    expect(document.activeElement).toBe(enabled[0]);
  });

  it('uses a roving tabindex', () => {
    const { inline } = setup();
    const tabbable = links(inline).filter((link) => link.tabIndex === 0);
    expect(tabbable.length).toBe(1);
    expect(tabbable[0].textContent).toContain('Save');
  });

  it('opens the popup via toggle() and closes it on item click', () => {
    const { fixture } = setup();
    expect(document.querySelector('.syui-menu-popup')).toBeNull();

    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();
    fixture.detectChanges();
    const popup = document.querySelector('.syui-menu-popup')!;
    expect(popup).toBeTruthy();

    links(popup)[0].click();
    fixture.detectChanges();
    expect(document.querySelector('.syui-menu-popup')).toBeNull();
    expect(fixture.componentInstance.saved).toBe(1);
  });

  it('closes the popup on Escape', () => {
    const { fixture } = setup();
    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();
    fixture.detectChanges();
    const popup = document.querySelector('.syui-menu-popup')!;

    popup.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(document.querySelector('.syui-menu-popup')).toBeNull();
  });
});
