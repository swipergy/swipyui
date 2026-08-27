import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Card } from './card';

@Component({
  imports: [Card],
  template: `
    <syui-card title="Title" subtitle="Sub">
      Body
      <button slot="footer">Action</button>
    </syui-card>
  `,
})
class Host {}

describe('Card', () => {
  it('renders title, subtitle, content and footer', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelector('.syui-card-title')?.textContent).toContain('Title');
    expect(el.querySelector('.syui-card-subtitle')?.textContent).toContain('Sub');
    expect(el.querySelector('.syui-card-content')?.textContent).toContain('Body');
    expect(el.querySelector('.syui-card-footer button')).toBeTruthy();
  });
});
