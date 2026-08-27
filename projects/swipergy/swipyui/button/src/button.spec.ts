import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Button } from './button';

@Component({
  imports: [Button],
  template: `<syui-button
    [label]="label()"
    [severity]="severity()"
    [loading]="loading()"
    (onClick)="clicks = clicks + 1"
  />`,
})
class Host {
  label = signal<string | undefined>('Save');
  severity = signal<'primary' | 'danger'>('primary');
  loading = signal(false);
  clicks = 0;
}

describe('Button', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    return { fixture, button };
  }

  it('renders the label and severity class', () => {
    const { button } = setup();
    expect(button.textContent).toContain('Save');
    expect(button.classList).toContain('syui-button-primary');
  });

  it('emits onClick', () => {
    const { fixture, button } = setup();
    button.click();
    expect(fixture.componentInstance.clicks).toBe(1);
  });

  it('disables the button and shows a spinner while loading', () => {
    const { fixture, button } = setup();
    fixture.componentInstance.loading.set(true);
    fixture.detectChanges();

    expect(button.disabled).toBe(true);
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.querySelector('.syui-button-spinner')).toBeTruthy();
  });

  it('updates classes when inputs change', () => {
    const { fixture, button } = setup();
    fixture.componentInstance.severity.set('danger');
    fixture.detectChanges();
    expect(button.classList).toContain('syui-button-danger');
  });
});
