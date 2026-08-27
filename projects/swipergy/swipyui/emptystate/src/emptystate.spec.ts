import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { EmptyState } from './emptystate';

@Component({
  imports: [EmptyState],
  template: `
    <syui-emptystate
      id="basic"
      [header]="header()"
      [description]="description()"
      [icon]="icon()"
      [headingLevel]="headingLevel()"
    >
      <button slot="actions" class="action">New project</button>
    </syui-emptystate>
    <syui-emptystate id="custom-icon" header="Empty">
      <img slot="icon" class="illustration" alt="" />
    </syui-emptystate>
  `,
})
class Host {
  readonly header = signal('No projects');
  readonly description = signal('Create your first project to get started.');
  readonly icon = signal<string | undefined>(undefined);
  readonly headingLevel = signal(2);
}

describe('EmptyState', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const empty: HTMLElement = fixture.nativeElement.querySelector('#basic');
    return { fixture, empty };
  }

  it('renders header, description and the built-in illustration', () => {
    const { empty } = setup();
    expect(empty.querySelector('.syui-emptystate-header')?.textContent).toBe('No projects');
    expect(empty.querySelector('.syui-emptystate-description')?.textContent).toContain(
      'Create your first project',
    );
    expect(empty.querySelector('.syui-emptystate-icon svg')).toBeTruthy();
  });

  it('exposes the header as a level-2 heading by default', () => {
    const { fixture, empty } = setup();
    const header = empty.querySelector('.syui-emptystate-header')!;
    expect(header.getAttribute('role')).toBe('heading');
    expect(header.getAttribute('aria-level')).toBe('2');

    fixture.componentInstance.headingLevel.set(3);
    fixture.detectChanges();
    expect(header.getAttribute('aria-level')).toBe('3');
  });

  it('renders a font icon instead of the illustration when icon is set', () => {
    const { fixture, empty } = setup();
    fixture.componentInstance.icon.set('pi pi-inbox');
    fixture.detectChanges();
    expect(empty.querySelector('.syui-emptystate-icon i')?.className).toBe('pi pi-inbox');
    expect(empty.querySelector('.syui-emptystate-icon svg')).toBeNull();
  });

  it('projects actions below the text', () => {
    const { empty } = setup();
    expect(empty.querySelector('.syui-emptystate-actions .action')?.textContent).toBe(
      'New project',
    );
  });

  it('lets projected icon content replace the illustration', () => {
    const { fixture } = setup();
    const empty: HTMLElement = fixture.nativeElement.querySelector('#custom-icon');
    expect(empty.querySelector('.syui-emptystate-icon .illustration')).toBeTruthy();
    expect(empty.querySelector('.syui-emptystate-icon svg')).toBeNull();
  });
});
