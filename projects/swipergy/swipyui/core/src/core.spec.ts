import { Component, forwardRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { BaseControl } from './base-control';
import { uniqueId } from './id';

@Component({
  selector: 'syui-test-control',
  template: `<button [disabled]="isDisabled()" (click)="updateModel('clicked')">
    {{ modelValue() }}
  </button>`,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TestControl), multi: true },
  ],
})
class TestControl extends BaseControl<string> {}

@Component({
  imports: [TestControl, ReactiveFormsModule],
  template: `<syui-test-control [formControl]="control" />`,
})
class Host {
  control = new FormControl<string>('initial');
}

describe('BaseControl', () => {
  it('syncs the form value into the control and back', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.textContent!.trim()).toBe('initial');

    button.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe('clicked');
  });

  it('honors setDisabledState from the forms API', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.control.disable();
    fixture.detectChanges();

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.disabled).toBe(true);
  });
});

describe('uniqueId', () => {
  it('generates unique prefixed ids', () => {
    const a = uniqueId('syui-checkbox');
    const b = uniqueId('syui-checkbox');
    expect(a).toMatch(/^syui-checkbox-\d+$/);
    expect(a).not.toBe(b);
  });
});
