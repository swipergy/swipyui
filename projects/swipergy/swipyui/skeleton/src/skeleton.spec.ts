import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Skeleton } from './skeleton';

@Component({
  imports: [Skeleton],
  template: `<syui-skeleton [shape]="shape()" [width]="width()" [height]="height()" [borderRadius]="radius()" />`,
})
class Host {
  shape = signal<'rectangle' | 'circle'>('rectangle');
  width = signal('10rem');
  height = signal('2rem');
  radius = signal<string | undefined>(undefined);
}

describe('Skeleton', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const skeleton: HTMLElement = fixture.nativeElement.querySelector('syui-skeleton');
    return { fixture, skeleton };
  }

  it('applies width and height to the host', () => {
    const { skeleton } = setup();
    expect(skeleton.style.width).toBe('10rem');
    expect(skeleton.style.height).toBe('2rem');
  });

  it('defaults to 100% width and 1rem height', () => {
    @Component({ imports: [Skeleton], template: `<syui-skeleton />` })
    class Defaults {}
    const fixture = TestBed.createComponent(Defaults);
    fixture.detectChanges();
    const skeleton: HTMLElement = fixture.nativeElement.querySelector('syui-skeleton');
    expect(skeleton.style.width).toBe('100%');
    expect(skeleton.style.height).toBe('1rem');
  });

  it('renders the circle shape modifier', () => {
    const { fixture, skeleton } = setup();
    expect(skeleton.classList).not.toContain('syui-skeleton-circle');
    fixture.componentInstance.shape.set('circle');
    fixture.detectChanges();
    expect(skeleton.classList).toContain('syui-skeleton-circle');
  });

  it('applies a custom border radius', () => {
    const { fixture, skeleton } = setup();
    fixture.componentInstance.radius.set('16px');
    fixture.detectChanges();
    expect(skeleton.style.borderRadius).toBe('16px');
  });

  it('is hidden from assistive technology', () => {
    const { skeleton } = setup();
    expect(skeleton.getAttribute('aria-hidden')).toBe('true');
  });
});
