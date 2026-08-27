import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TreeNode } from '@swipergy/swipyui/tree';
import { TreeSelect } from './treeselect';

@Component({
  imports: [TreeSelect, ReactiveFormsModule],
  template: `<syui-tree-select
    [options]="nodes"
    [selectionMode]="mode()"
    placeholder="Pick a file"
    [formControl]="control"
  />`,
})
class Host {
  nodes: TreeNode[] = [
    {
      key: 'docs',
      label: 'Documents',
      children: [
        { key: 'resume', label: 'Resume.pdf' },
        { key: 'notes', label: 'Notes.txt' },
      ],
    },
    { key: 'pics', label: 'Pictures', children: [{ key: 'logo', label: 'logo.png' }] },
  ];
  mode = signal<'single' | 'checkbox'>('single');
  control = new FormControl<string | string[] | null>(null);
}

describe('TreeSelect', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const trigger: HTMLButtonElement = fixture.nativeElement.querySelector('.syui-tree-select');
    return { fixture, trigger };
  }

  function panel(): HTMLElement | null {
    return document.querySelector('.syui-tree-select-panel');
  }

  function content(key: string): HTMLElement | null {
    return panel()?.querySelector<HTMLElement>(`[data-key="${key}"] .syui-tree-node-content`) ?? null;
  }

  afterEach(() => {
    document.querySelector('.cdk-overlay-container')?.remove();
  });

  it('shows the placeholder and opens a tree panel on click', () => {
    const { fixture, trigger } = setup();
    expect(trigger.textContent).toContain('Pick a file');

    trigger.click();
    fixture.detectChanges();
    expect(panel()!.querySelector('[role="tree"]')).toBeTruthy();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
  });

  it('sets the node key as value and closes the panel in single mode', () => {
    const { fixture, trigger } = setup();
    trigger.click();
    fixture.detectChanges();

    panel()!.querySelector<HTMLElement>('[data-key="docs"] .syui-tree-toggler')!.click();
    fixture.detectChanges();
    content('notes')!.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.control.value).toBe('notes');
    expect(panel()).toBeNull();
    expect(trigger.textContent).toContain('Notes.txt');
  });

  it('collects checked keys and keeps the panel open in checkbox mode', () => {
    const { fixture, trigger } = setup();
    fixture.componentInstance.mode.set('checkbox');
    fixture.detectChanges();

    trigger.click();
    fixture.detectChanges();
    content('pics')!.click();
    fixture.detectChanges();

    expect((fixture.componentInstance.control.value as string[]).sort()).toEqual(['logo', 'pics']);
    expect(panel()).toBeTruthy();
    expect(trigger.textContent).toContain('Pictures, logo.png');
  });

  it('renders the label for a value written by the form', () => {
    const { fixture, trigger } = setup();
    fixture.componentInstance.control.setValue('resume');
    fixture.detectChanges();
    expect(trigger.textContent).toContain('Resume.pdf');
  });

  it('closes on Escape', () => {
    const { fixture, trigger } = setup();
    trigger.click();
    fixture.detectChanges();
    expect(panel()).toBeTruthy();

    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(panel()).toBeNull();
  });

  it('closes and returns focus to the trigger on Escape inside the tree', () => {
    const { fixture, trigger } = setup();
    trigger.click();
    fixture.detectChanges();

    const tree = panel()!.querySelector<HTMLElement>('[role="tree"]')!;
    tree.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();

    expect(panel()).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('does not open when disabled via the forms API', () => {
    const { fixture, trigger } = setup();
    fixture.componentInstance.control.disable();
    fixture.detectChanges();

    trigger.click();
    fixture.detectChanges();
    expect(trigger.disabled).toBe(true);
    expect(panel()).toBeNull();
  });
});
