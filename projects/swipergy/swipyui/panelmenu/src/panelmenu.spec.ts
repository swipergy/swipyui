import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MenuItem } from '@swipergy/swipyui/core';
import { PanelMenu } from './panelmenu';

@Component({
  imports: [PanelMenu],
  template: `<syui-panel-menu [items]="items" [multiple]="multiple" />`,
})
class Host {
  multiple = false;
  selected = '';
  items: MenuItem[] = [
    {
      label: 'Files',
      items: [
        { label: 'New', command: () => (this.selected = 'New') },
        {
          label: 'Recent',
          items: [{ label: 'invoice.pdf', command: () => (this.selected = 'invoice.pdf') }],
        },
      ],
    },
    {
      label: 'Cloud',
      items: [{ label: 'Upload' }],
    },
    { label: 'Hidden', visible: false },
    { label: 'Sync', command: () => (this.selected = 'Sync') },
  ];
}

describe('PanelMenu', () => {
  function setup() {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement.querySelector('.syui-panelmenu');
    return { fixture, host };
  }

  function headers(host: HTMLElement): HTMLElement[] {
    return Array.from(host.querySelectorAll('.syui-panelmenu-header'));
  }

  it('renders visible root items and skips hidden ones', () => {
    const { host } = setup();
    const labels = headers(host).map((el) => el.textContent?.trim());
    expect(labels).toEqual(['Files', 'Cloud', 'Sync']);
  });

  it('expands a panel on header click and rotates the chevron state', () => {
    const { fixture, host } = setup();
    const header = headers(host)[0];
    expect(header.getAttribute('aria-expanded')).toBe('false');
    expect(host.querySelector('.syui-panelmenu-list')).toBeNull();

    header.click();
    fixture.detectChanges();
    expect(header.getAttribute('aria-expanded')).toBe('true');
    expect(host.querySelector('.syui-panelmenu-chevron-expanded')).toBeTruthy();
    expect(host.querySelector('.syui-panelmenu-list')).toBeTruthy();
  });

  it('keeps only one root panel open by default', () => {
    const { fixture, host } = setup();
    headers(host)[0].click();
    fixture.detectChanges();
    headers(host)[1].click();
    fixture.detectChanges();

    expect(headers(host)[0].getAttribute('aria-expanded')).toBe('false');
    expect(headers(host)[1].getAttribute('aria-expanded')).toBe('true');
  });

  it('keeps several panels open when multiple is set', () => {
    const { fixture, host } = setup();
    fixture.componentInstance.multiple = true;
    fixture.detectChanges();

    headers(host)[0].click();
    fixture.detectChanges();
    headers(host)[1].click();
    fixture.detectChanges();
    expect(headers(host)[0].getAttribute('aria-expanded')).toBe('true');
    expect(headers(host)[1].getAttribute('aria-expanded')).toBe('true');
  });

  it('expands nested levels inline and runs leaf commands', () => {
    const { fixture, host } = setup();
    headers(host)[0].click();
    fixture.detectChanges();

    const recent = host.querySelectorAll<HTMLElement>('.syui-panelmenu-link')[1];
    recent.click();
    fixture.detectChanges();
    expect(recent.getAttribute('aria-expanded')).toBe('true');

    const leaf = host.querySelectorAll<HTMLElement>('.syui-panelmenu-link')[2];
    leaf.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selected).toBe('invoice.pdf');
  });

  it('navigates and toggles with the keyboard', () => {
    const { fixture, host } = setup();
    const keydown = (key: string) =>
      host.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));

    keydown('ArrowDown'); // focus "Files"
    fixture.detectChanges();
    keydown('ArrowRight'); // expand "Files"
    fixture.detectChanges();
    expect(headers(host)[0].getAttribute('aria-expanded')).toBe('true');

    keydown('ArrowDown'); // focus "New"
    fixture.detectChanges();
    keydown('Enter'); // activate "New"
    fixture.detectChanges();
    expect(fixture.componentInstance.selected).toBe('New');

    keydown('ArrowLeft'); // back to the "Files" header
    keydown('ArrowLeft'); // collapse it
    fixture.detectChanges();
    expect(headers(host)[0].getAttribute('aria-expanded')).toBe('false');
  });
});
