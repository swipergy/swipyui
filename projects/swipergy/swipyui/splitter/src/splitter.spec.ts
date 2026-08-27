import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Splitter, SplitterPanel } from './splitter';

@Component({
  imports: [Splitter, SplitterPanel],
  template: `
    <syui-splitter [(panelSizes)]="sizes" [minSizes]="minSizes">
      <syui-splitter-panel>One</syui-splitter-panel>
      <syui-splitter-panel>Two</syui-splitter-panel>
    </syui-splitter>
  `,
})
class Host {
  sizes = signal<number[]>([]);
  minSizes: number[] = [];
}

describe('Splitter', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const panels: HTMLElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('syui-splitter-panel'),
    );
    const gutter: HTMLElement = fixture.nativeElement.querySelector('.syui-splitter-gutter');
    return { fixture, panels, gutter };
  }

  it('renders panels with a gutter between them', () => {
    const { fixture, panels, gutter } = setup();
    expect(panels.length).toBe(2);
    expect(gutter).toBeTruthy();
    expect(fixture.nativeElement.querySelectorAll('.syui-splitter-gutter').length).toBe(1);
    // gutter sits between the two panels via flex order
    expect(panels[0].style.order).toBe('0');
    expect(gutter.style.order).toBe('1');
    expect(panels[1].style.order).toBe('2');
  });

  it('defaults panel sizes to equal percentages', () => {
    const { fixture } = setup();
    expect(fixture.componentInstance.sizes()).toEqual([50, 50]);
  });

  it('exposes the separator ARIA contract on the gutter', () => {
    const { gutter } = setup();
    expect(gutter.getAttribute('role')).toBe('separator');
    expect(gutter.getAttribute('aria-orientation')).toBe('vertical');
    expect(gutter.getAttribute('tabindex')).toBe('0');
    expect(gutter.getAttribute('aria-valuenow')).toBe('50');
  });

  it('resizes by 1% with arrow keys', () => {
    const { fixture, gutter } = setup();
    gutter.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.sizes()).toEqual([51, 49]);

    gutter.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    gutter.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.sizes()).toEqual([49, 51]);
  });

  it('collapses and expands the preceding panel with Home and End', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.minSizes = [10, 20];
    fixture.detectChanges();
    const gutter: HTMLElement = fixture.nativeElement.querySelector('.syui-splitter-gutter');

    gutter.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.sizes()).toEqual([10, 90]);

    gutter.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.sizes()).toEqual([80, 20]);
  });

  it('respects minimum sizes when resizing', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.minSizes = [49, 0];
    fixture.detectChanges();
    const gutter: HTMLElement = fixture.nativeElement.querySelector('.syui-splitter-gutter');

    gutter.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    gutter.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.sizes()).toEqual([49, 51]);
  });

  it('applies panel sizes as flex-grow weights', () => {
    const { fixture, panels } = setup();
    fixture.componentInstance.sizes.set([30, 70]);
    fixture.detectChanges();
    expect(panels[0].style.flexGrow).toBe('30');
    expect(panels[1].style.flexGrow).toBe('70');
  });
});
