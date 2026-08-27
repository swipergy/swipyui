import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { InputText } from '@swipergy/swipyui/inputtext';
import { IconField, InputIcon } from './iconfield';

@Component({
  imports: [IconField, InputIcon, InputText],
  template: `
    <syui-icon-field [iconPosition]="position()">
      <syui-input-icon><svg data-testid="icon"></svg></syui-input-icon>
      <input syuiInputText placeholder="Search" />
    </syui-icon-field>
  `,
})
class Host {
  position = signal<'left' | 'right'>('left');
}

describe('IconField', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const field: HTMLElement = fixture.nativeElement.querySelector('syui-icon-field');
    const icon: HTMLElement = fixture.nativeElement.querySelector('syui-input-icon');
    return { fixture, field, icon };
  }

  it('renders the wrapper and icon classes', () => {
    const { field, icon } = setup();
    expect(field.classList.contains('syui-iconfield')).toBe(true);
    expect(icon.classList.contains('syui-inputicon')).toBe(true);
  });

  it('projects arbitrary icon content', () => {
    const { icon } = setup();
    expect(icon.querySelector('[data-testid="icon"]')).toBeTruthy();
  });

  it('hides the icon from assistive technology', () => {
    const { icon } = setup();
    expect(icon.getAttribute('aria-hidden')).toBe('true');
  });

  it('positions the icon on the left by default and on the right on demand', () => {
    const { fixture, field } = setup();
    expect(field.classList.contains('syui-iconfield-right')).toBe(false);

    fixture.componentInstance.position.set('right');
    fixture.detectChanges();
    expect(field.classList.contains('syui-iconfield-right')).toBe(true);
  });

  it('wraps a styled text input', () => {
    const { field } = setup();
    expect(field.querySelector('input.syui-inputtext')).toBeTruthy();
  });
});
