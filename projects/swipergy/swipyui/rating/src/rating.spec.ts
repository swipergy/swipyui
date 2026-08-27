import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Rating } from './rating';

@Component({
  imports: [Rating, ReactiveFormsModule],
  template: `<syui-rating [stars]="stars()" [readonly]="readonly()" [formControl]="control" />`,
})
class Host {
  control = new FormControl<number | null>(null);
  stars = signal(5);
  readonly = signal(false);
}

describe('Rating', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const inputs = (): HTMLInputElement[] =>
      Array.from(fixture.nativeElement.querySelectorAll('input[type="radio"]'));
    return { fixture, inputs };
  }

  it('renders one hidden radio per star with an aria-label', () => {
    const { inputs } = setup();
    const radios = inputs();
    expect(radios.length).toBe(5);
    expect(radios[0].getAttribute('aria-label')).toBe('1 of 5 stars');
    expect(radios[2].getAttribute('aria-label')).toBe('3 of 5 stars');
  });

  it('sets the form value when a star is clicked', () => {
    const { fixture, inputs } = setup();
    inputs()[3].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe(4);
    expect(fixture.nativeElement.querySelectorAll('.syui-rating-option-filled').length).toBe(4);
  });

  it('clears the value when the selected star is clicked again', () => {
    const { fixture, inputs } = setup();
    fixture.componentInstance.control.setValue(3);
    fixture.detectChanges();
    inputs()[2].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe(null);
    expect(fixture.nativeElement.querySelectorAll('.syui-rating-option-filled').length).toBe(0);
  });

  it('fills stars up to the form value', () => {
    const { fixture } = setup();
    fixture.componentInstance.control.setValue(2);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.syui-rating-option-filled').length).toBe(2);
  });

  it('ignores clicks when readonly', () => {
    const { fixture, inputs } = setup();
    fixture.componentInstance.readonly.set(true);
    fixture.detectChanges();
    inputs()[4].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe(null);
    const host: HTMLElement = fixture.nativeElement.querySelector('syui-rating');
    expect(host.getAttribute('aria-readonly')).toBe('true');
  });

  it('disables the radios via the forms API', () => {
    const { fixture, inputs } = setup();
    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    expect(inputs().every((radio) => radio.disabled)).toBe(true);
  });

  it('respects a custom star count', () => {
    const { fixture, inputs } = setup();
    fixture.componentInstance.stars.set(10);
    fixture.detectChanges();
    expect(inputs().length).toBe(10);
  });
});
