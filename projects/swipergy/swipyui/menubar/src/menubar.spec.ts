import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MenuItem } from '@swipergy/swipyui/core';
import { Menubar } from './menubar';

@Component({
  imports: [Menubar],
  template: `
    <syui-menubar [model]="items">
      <div syui-menubar-start>Logo</div>
      <div syui-menubar-end>End</div>
    </syui-menubar>
  `,
})
class Host {
  opened = 0;
  items: MenuItem[] = [
    {
      label: 'File',
      items: [
        { label: 'Open', command: () => this.opened++ },
        { separator: true },
        { label: 'Recent', items: [{ label: 'One' }, { label: 'Two' }] },
      ],
    },
    { label: 'Edit', items: [{ label: 'Undo' }] },
    { label: 'Docs', routerLink: '/docs' },
    { label: 'Hidden', visible: false },
  ];
}

describe('Menubar', () => {
  function setup() {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const menubar: HTMLElement = fixture.nativeElement.querySelector('syui-menubar');
    const rootLinks = (): HTMLElement[] =>
      Array.from(menubar.querySelectorAll('[role="menubar"] > li > [role="menuitem"]'));
    return { fixture, menubar, rootLinks };
  }

  it('renders root items with the menubar role and projects start/end slots', () => {
    const { menubar, rootLinks } = setup();
    expect(menubar.querySelector('[role="menubar"]')).toBeTruthy();
    expect(rootLinks().map((link) => link.textContent!.trim())).toEqual(['File', 'Edit', 'Docs']);
    expect(menubar.querySelector('.syui-menubar-start')!.textContent).toContain('Logo');
    expect(menubar.querySelector('.syui-menubar-end')!.textContent).toContain('End');
  });

  it('opens a submenu on click and closes it on outside click', () => {
    const { fixture, menubar, rootLinks } = setup();
    rootLinks()[0].click();
    fixture.detectChanges();
    const submenu = menubar.querySelector('.syui-menubar-submenu')!;
    expect(submenu).toBeTruthy();
    expect(rootLinks()[0].getAttribute('aria-expanded')).toBe('true');
    expect(submenu.getAttribute('aria-label')).toBe('File');
    expect(submenu.textContent).toContain('Open');

    document.body.click();
    fixture.detectChanges();
    expect(menubar.querySelector('.syui-menubar-submenu')).toBeNull();
  });

  it('runs the command of a submenu item and closes the menu', () => {
    const { fixture, menubar, rootLinks } = setup();
    rootLinks()[0].click();
    fixture.detectChanges();
    const item = menubar.querySelector<HTMLElement>('.syui-menubar-submenu [role="menuitem"]')!;
    item.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.opened).toBe(1);
    expect(menubar.querySelector('.syui-menubar-submenu')).toBeNull();
  });

  it('moves focus across root items with arrow keys', () => {
    const { rootLinks } = setup();
    const links = rootLinks();
    links[0].focus();
    links[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(document.activeElement).toBe(links[1]);
    links[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    expect(document.activeElement).toBe(links[0]);
  });

  it('opens the submenu with ArrowDown and focuses its first item', async () => {
    const { fixture, menubar, rootLinks } = setup();
    const first = rootLinks()[0];
    first.focus();
    first.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve));
    const item = menubar.querySelector<HTMLElement>('.syui-menubar-submenu [role="menuitem"]')!;
    expect(item.textContent).toContain('Open');
    expect(document.activeElement).toBe(item);
  });

  it('closes everything on Escape and restores focus to the root item', async () => {
    const { fixture, menubar, rootLinks } = setup();
    const first = rootLinks()[0];
    first.focus();
    first.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve));

    document.activeElement!.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    fixture.detectChanges();
    expect(menubar.querySelector('.syui-menubar-submenu')).toBeNull();
    expect(document.activeElement).toBe(first);
  });
});
