import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Tag, type TagSeverity } from './tag';

@Component({
  imports: [Tag],
  template: `
    <syui-tag id="basic" [value]="value()" [severity]="severity()" [rounded]="rounded()" />
    <syui-tag id="projected" value="Ignored"><em>Custom</em></syui-tag>
  `,
})
class Host {
  readonly value = signal('New');
  readonly severity = signal<TagSeverity>(null);
  readonly rounded = signal(false);
}

describe('Tag', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const tag: HTMLElement = fixture.nativeElement.querySelector('#basic');
    return { fixture, tag };
  }

  it('renders the value', () => {
    const { tag } = setup();
    expect(tag.querySelector('.syui-tag-label')?.textContent?.trim()).toBe('New');
    expect(tag.classList).toContain('syui-tag');
  });

  it('applies the severity modifier class', () => {
    const { fixture, tag } = setup();
    fixture.componentInstance.severity.set('danger');
    fixture.detectChanges();
    expect(tag.classList).toContain('syui-tag-danger');
  });

  it('applies the rounded modifier class', () => {
    const { fixture, tag } = setup();
    fixture.componentInstance.rounded.set(true);
    fixture.detectChanges();
    expect(tag.classList).toContain('syui-tag-rounded');
  });

  it('lets projected content override the value', () => {
    const { fixture } = setup();
    const tag: HTMLElement = fixture.nativeElement.querySelector('#projected');
    expect(tag.querySelector('em')?.textContent).toBe('Custom');
    expect(tag.textContent).not.toContain('Ignored');
  });
});
