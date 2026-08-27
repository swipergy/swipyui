import { Component, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { VirtualScroller, VirtualScrollerItem, VirtualScrollerRange } from './virtualscroller';

@Component({
  imports: [VirtualScroller, VirtualScrollerItem],
  template: `<syui-virtual-scroller
    [items]="items()"
    [itemSize]="40"
    [overscan]="2"
    ariaLabel="Rows"
    style="height: 200px"
    (onScrollIndexChange)="range = $event"
  >
    <ng-template syuiVirtualScrollerItem let-item let-i="index">{{ i }}:{{ item }}</ng-template>
  </syui-virtual-scroller>`,
})
class Host {
  readonly items = signal(Array.from({ length: 1000 }, (_, i) => `item ${i}`));
  readonly scroller = viewChild.required(VirtualScroller);
  range: VirtualScrollerRange | undefined;
}

describe('VirtualScroller', () => {
  // jsdom has no layout: pretend every scroller viewport is 200px tall
  const clientHeight = Object.getOwnPropertyDescriptor(Element.prototype, 'clientHeight');
  beforeEach(() => {
    Object.defineProperty(Element.prototype, 'clientHeight', {
      configurable: true,
      get: () => 200,
    });
  });
  afterEach(() => {
    Object.defineProperty(Element.prototype, 'clientHeight', clientHeight!);
  });

  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement.querySelector('syui-virtual-scroller');
    const renderedItems = () =>
      Array.from(host.querySelectorAll<HTMLElement>('.syui-virtual-scroller-item'), (item) =>
        item.textContent!.trim(),
      );
    return { fixture, host, renderedItems };
  }

  it('renders only the visible slice plus the overscan', async () => {
    const { fixture, renderedItems } = setup();
    await fixture.whenStable(); // viewport measured after first render
    fixture.detectChanges();
    // 200px viewport / 40px items = 5 visible + 1 partial + 2 overscan below
    expect(renderedItems().length).toBe(10);
    expect(renderedItems()[0]).toBe('0:item 0');
  });

  it('holds the full list length open through the spacer', () => {
    const { host } = setup();
    const spacer: HTMLElement = host.querySelector('.syui-virtual-scroller-spacer')!;
    expect(spacer.style.height).toBe('40000px');
  });

  it('shifts the rendered window on scroll and reports the range', async () => {
    const { fixture, host, renderedItems } = setup();
    await fixture.whenStable();
    host.scrollTop = 4000; // item 100
    host.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
    expect(renderedItems()[0]).toBe('98:item 98'); // 100 minus overscan 2
    expect(fixture.componentInstance.range).toEqual({ first: 98, last: 108 });
    const content: HTMLElement = host.querySelector('.syui-virtual-scroller-content')!;
    expect(content.style.transform).toBe('translateY(3920px)');
  });

  it('clamps the window at the end of the list', async () => {
    const { fixture, host, renderedItems } = setup();
    await fixture.whenStable();
    host.scrollTop = 39800;
    host.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
    const rendered = renderedItems();
    expect(rendered[rendered.length - 1]).toBe('999:item 999');
  });

  it('scrollToIndex jumps to the item offset', () => {
    const { fixture, host } = setup();
    const scrollTo = vi.fn();
    host.scrollTo = scrollTo;
    fixture.componentInstance.scroller().scrollToIndex(50);
    expect(scrollTo).toHaveBeenCalledWith({ top: 2000, behavior: 'auto' });
  });

  it('is a labelled focusable region with list semantics', () => {
    const { host } = setup();
    expect(host.getAttribute('tabindex')).toBe('0');
    expect(host.getAttribute('role')).toBe('region');
    expect(host.getAttribute('aria-label')).toBe('Rows');
    expect(host.querySelector('[role="list"]')).toBeTruthy();
    expect(host.querySelector('[role="listitem"]')).toBeTruthy();
  });
});
