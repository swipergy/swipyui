import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MenuItem } from '@swipergy/swipyui/core';
import { Breadcrumb } from './breadcrumb';

@Component({
  imports: [Breadcrumb],
  template: `<syui-breadcrumb [home]="home" [model]="items" />`,
})
class Host {
  clicked = 0;
  home: MenuItem = { routerLink: '/' };
  items: MenuItem[] = [
    { label: 'Library', routerLink: '/library' },
    { label: 'External', url: 'https://example.com' },
    { label: 'Hidden', visible: false },
    { label: 'Actions', command: () => this.clicked++ },
    { label: 'Data Grid' },
  ];
}

describe('Breadcrumb', () => {
  function setup() {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const nav: HTMLElement = fixture.nativeElement.querySelector('nav');
    return { fixture, nav };
  }

  it('renders home and items, skipping hidden ones', () => {
    const { nav } = setup();
    const items = Array.from(nav.querySelectorAll('.syui-breadcrumb-item'));
    expect(items.length).toBe(5);
    expect(nav.querySelector('.syui-breadcrumb-home-icon')).toBeTruthy();
    expect(nav.textContent).not.toContain('Hidden');
    expect(nav.getAttribute('aria-label')).toBe('Breadcrumb');
  });

  it('renders the last item unlinked with aria-current', () => {
    const { nav } = setup();
    const current = nav.querySelector('[aria-current="page"]')!;
    expect(current.tagName).toBe('SPAN');
    expect(current.textContent).toContain('Data Grid');
    expect(current.querySelector('a')).toBeNull();
  });

  it('renders chevron separators between items', () => {
    const { nav } = setup();
    const separators = nav.querySelectorAll('.syui-breadcrumb-separator');
    expect(separators.length).toBe(4);
    expect(separators[0].getAttribute('aria-hidden')).toBe('true');
  });

  it('renders routerLink and url anchors', () => {
    const { nav } = setup();
    const links = Array.from(nav.querySelectorAll<HTMLAnchorElement>('a[href]'));
    expect(links.some((a) => a.getAttribute('href') === '/library')).toBe(true);
    expect(links.some((a) => a.getAttribute('href') === 'https://example.com')).toBe(true);
  });

  it('invokes command items on click', () => {
    const { fixture, nav } = setup();
    const links = Array.from(nav.querySelectorAll<HTMLElement>('.syui-breadcrumb-link'));
    links.find((a) => a.textContent!.includes('Actions'))!.click();
    expect(fixture.componentInstance.clicked).toBe(1);
  });
});
