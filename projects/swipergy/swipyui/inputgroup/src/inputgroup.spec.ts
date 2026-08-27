import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { InputText } from '@swipergy/swipyui/inputtext';
import { InputGroup, InputGroupAddon } from './inputgroup';

@Component({
  imports: [InputGroup, InputGroupAddon, InputText],
  template: `
    <syui-input-group>
      <syui-input-group-addon>https://</syui-input-group-addon>
      <input syuiInputText placeholder="example.com" />
      <syui-input-group-addon>.com</syui-input-group-addon>
    </syui-input-group>
  `,
})
class Host {}

describe('InputGroup', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const group: HTMLElement = fixture.nativeElement.querySelector('syui-input-group');
    const addons: HTMLElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('syui-input-group-addon'),
    );
    return { fixture, group, addons };
  }

  it('renders the group host class', () => {
    const { group } = setup();
    expect(group.classList.contains('syui-inputgroup')).toBe(true);
  });

  it('renders addons with their class and projected content', () => {
    const { addons } = setup();
    expect(addons.length).toBe(2);
    expect(addons[0].classList.contains('syui-inputgroup-addon')).toBe(true);
    expect(addons[0].textContent).toContain('https://');
    expect(addons[1].textContent).toContain('.com');
  });

  it('keeps addons and the input as direct children in order', () => {
    const { group } = setup();
    const children = Array.from(group.children).map((child) => child.tagName.toLowerCase());
    expect(children).toEqual(['syui-input-group-addon', 'input', 'syui-input-group-addon']);
  });

  it('wraps a styled text input', () => {
    const { group } = setup();
    expect(group.querySelector('input.syui-inputtext')).toBeTruthy();
  });
});
