import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Divider } from './divider';

@Component({
  imports: [Divider],
  template: `
    <syui-divider [layout]="layout()" [type]="type()" [align]="align()">{{ label() }}</syui-divider>
  `,
})
class Host {
  readonly layout = signal<'horizontal' | 'vertical'>('horizontal');
  readonly type = signal<'solid' | 'dashed' | 'dotted'>('solid');
  readonly align = signal<'left' | 'center' | 'right' | 'top' | 'bottom'>('center');
  readonly label = signal('');
}

describe('Divider', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const divider: HTMLElement = fixture.nativeElement.querySelector('syui-divider');
    return { fixture, divider };
  }

  it('renders a separator with horizontal orientation by default', () => {
    const { divider } = setup();
    expect(divider.getAttribute('role')).toBe('separator');
    expect(divider.getAttribute('aria-orientation')).toBe('horizontal');
    expect(divider.classList.contains('syui-divider-horizontal')).toBe(true);
  });

  it('switches to vertical orientation', () => {
    const { fixture, divider } = setup();
    fixture.componentInstance.layout.set('vertical');
    fixture.detectChanges();
    expect(divider.getAttribute('aria-orientation')).toBe('vertical');
    expect(divider.classList.contains('syui-divider-vertical')).toBe(true);
  });

  it('applies line style modifier classes', () => {
    const { fixture, divider } = setup();
    fixture.componentInstance.type.set('dashed');
    fixture.detectChanges();
    expect(divider.classList.contains('syui-divider-dashed')).toBe(true);

    fixture.componentInstance.type.set('dotted');
    fixture.detectChanges();
    expect(divider.classList.contains('syui-divider-dotted')).toBe(true);
    expect(divider.classList.contains('syui-divider-dashed')).toBe(false);
  });

  it('applies alignment modifier classes', () => {
    const { fixture, divider } = setup();
    expect(divider.classList.contains('syui-divider-align-start')).toBe(false);

    fixture.componentInstance.align.set('left');
    fixture.detectChanges();
    expect(divider.classList.contains('syui-divider-align-start')).toBe(true);

    fixture.componentInstance.align.set('right');
    fixture.detectChanges();
    expect(divider.classList.contains('syui-divider-align-end')).toBe(true);
  });

  it('renders projected content on the line', () => {
    const { fixture, divider } = setup();
    fixture.componentInstance.label.set('OR');
    fixture.detectChanges();
    expect(divider.querySelector('.syui-divider-content')!.textContent).toContain('OR');
  });
});
