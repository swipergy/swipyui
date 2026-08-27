import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Textarea } from './textarea';

@Component({
  imports: [Textarea, ReactiveFormsModule],
  template: `<textarea syuiTextarea [invalid]="invalid()" [formControl]="control"></textarea>`,
})
class Host {
  invalid = signal(false);
  control = new FormControl('note');
}

describe('Textarea', () => {
  it('applies classes and binds through reactive forms', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');

    expect(textarea.classList).toContain('syui-textarea');
    expect(textarea.value).toBe('note');

    textarea.value = 'edited';
    textarea.dispatchEvent(new Event('input'));
    expect(fixture.componentInstance.control.value).toBe('edited');
  });

  it('toggles the invalid class and aria-invalid', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
    expect(textarea.hasAttribute('aria-invalid')).toBe(false);

    fixture.componentInstance.invalid.set(true);
    fixture.detectChanges();
    expect(textarea.classList).toContain('syui-invalid');
    expect(textarea.getAttribute('aria-invalid')).toBe('true');
  });
});
