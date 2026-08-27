import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Kbd } from './kbd';

@Component({
  imports: [Kbd],
  template: `
    <syui-kbd id="combo" [value]="value()" [separator]="separator()" />
    <syui-kbd id="projected">⌘</syui-kbd>
  `,
})
class Host {
  readonly value = signal('Ctrl+Shift+P');
  readonly separator = signal('+');
}

describe('Kbd', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const kbd: HTMLElement = fixture.nativeElement.querySelector('#combo');
    return { fixture, kbd };
  }

  it('splits the value into individual keycaps', () => {
    const { kbd } = setup();
    const keys = Array.from(kbd.querySelectorAll('.syui-kbd-key')).map((k) => k.textContent?.trim());
    expect(keys).toEqual(['Ctrl', 'Shift', 'P']);
    expect(kbd.querySelectorAll('.syui-kbd-separator').length).toBe(2);
  });

  it('renders the configured separator between keycaps', () => {
    const { fixture, kbd } = setup();
    fixture.componentInstance.separator.set('then');
    fixture.detectChanges();
    expect(kbd.querySelector('.syui-kbd-separator')?.textContent?.trim()).toBe('then');
  });

  it('renders projected content as a single keycap', () => {
    const { fixture } = setup();
    const kbd: HTMLElement = fixture.nativeElement.querySelector('#projected');
    expect(kbd.querySelectorAll('.syui-kbd-key').length).toBe(1);
    expect(kbd.textContent?.trim()).toBe('⌘');
  });
});
