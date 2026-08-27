import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Tree, TreeNode } from './tree';

@Component({
  imports: [Tree],
  template: `<syui-tree
    [value]="nodes"
    [filter]="filter()"
    [selectionMode]="mode()"
    [(selection)]="selection"
    [(expandedKeys)]="expanded"
  />`,
})
class Host {
  nodes: TreeNode[] = [
    {
      key: 'docs',
      label: 'Documents',
      children: [
        {
          key: 'work',
          label: 'Work',
          children: [
            { key: 'resume', label: 'Resume.pdf' },
            { key: 'invoice', label: 'Invoice.pdf' },
          ],
        },
        { key: 'notes', label: 'Notes.txt' },
      ],
    },
    { key: 'pics', label: 'Pictures', children: [{ key: 'logo', label: 'logo.png' }] },
  ];
  filter = signal(false);
  mode = signal<'single' | 'multiple' | 'checkbox' | null>('single');
  selection = signal<TreeNode | TreeNode[] | null>(null);
  expanded = signal<Record<string, boolean>>({});
}

describe('Tree', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    const item = (key: string) => element.querySelector<HTMLElement>(`[data-key="${key}"]`);
    const content = (key: string) =>
      item(key)?.querySelector<HTMLElement>('.syui-tree-node-content') ?? null;
    return { fixture, element, item, content };
  }

  it('renders root nodes collapsed', () => {
    const { element, item } = setup();
    expect(element.querySelectorAll('[role="treeitem"]').length).toBe(2);
    expect(item('docs')!.getAttribute('aria-expanded')).toBe('false');
    expect(element.textContent).not.toContain('Work');
  });

  it('expands via the chevron and reports it through expandedKeys', () => {
    const { fixture, item } = setup();
    item('docs')!.querySelector<HTMLElement>('.syui-tree-toggler')!.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.expanded()).toEqual({ docs: true });
    expect(item('docs')!.getAttribute('aria-expanded')).toBe('true');
    expect(item('work')).toBeTruthy();
  });

  it('selects a node in single mode and marks it with aria-selected', () => {
    const { fixture, item, content } = setup();
    fixture.componentInstance.expanded.set({ docs: true });
    fixture.detectChanges();

    content('notes')!.click();
    fixture.detectChanges();
    expect((fixture.componentInstance.selection() as TreeNode).key).toBe('notes');
    expect(item('notes')!.getAttribute('aria-selected')).toBe('true');

    // clicking the selected node again deselects it
    content('notes')!.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selection()).toBeNull();
  });

  it('checks the whole subtree and tri-states parents in checkbox mode', () => {
    const { fixture, item, content } = setup();
    fixture.componentInstance.mode.set('checkbox');
    fixture.componentInstance.expanded.set({ docs: true, work: true });
    fixture.detectChanges();

    content('docs')!.click();
    fixture.detectChanges();
    const keys = () =>
      (fixture.componentInstance.selection() as TreeNode[]).map((node) => node.key).sort();
    expect(keys()).toEqual(['docs', 'invoice', 'notes', 'resume', 'work']);
    expect(item('docs')!.getAttribute('aria-checked')).toBe('true');

    content('resume')!.click();
    fixture.detectChanges();
    expect(keys()).toEqual(['invoice', 'notes']);
    expect(item('work')!.getAttribute('aria-checked')).toBe('mixed');
    expect(item('docs')!.getAttribute('aria-checked')).toBe('mixed');
  });

  it('navigates with arrow keys: Right expands, Down moves, Left goes to the parent', () => {
    const { fixture, item } = setup();
    const key = (target: HTMLElement, k: string) =>
      target.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));

    key(item('docs')!, 'ArrowRight');
    fixture.detectChanges();
    expect(item('docs')!.getAttribute('aria-expanded')).toBe('true');

    key(item('docs')!, 'ArrowDown');
    fixture.detectChanges();
    expect(document.activeElement).toBe(item('work'));
    expect(item('work')!.tabIndex).toBe(0);
    expect(item('docs')!.tabIndex).toBe(-1);

    key(item('work')!, 'ArrowLeft');
    fixture.detectChanges();
    expect(document.activeElement).toBe(item('docs'));
  });

  it('toggles the checkbox with Enter in checkbox mode', () => {
    const { fixture, item } = setup();
    fixture.componentInstance.mode.set('checkbox');
    fixture.detectChanges();

    item('pics')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();
    const keys = (fixture.componentInstance.selection() as TreeNode[]).map((node) => node.key);
    expect(keys.sort()).toEqual(['logo', 'pics']);
  });

  it('exposes aria-level, aria-posinset and aria-setsize on tree items', () => {
    const { fixture, item } = setup();
    fixture.componentInstance.expanded.set({ docs: true });
    fixture.detectChanges();

    expect(item('docs')!.getAttribute('aria-level')).toBe('1');
    expect(item('docs')!.getAttribute('aria-posinset')).toBe('1');
    expect(item('docs')!.getAttribute('aria-setsize')).toBe('2');
    expect(item('notes')!.getAttribute('aria-level')).toBe('2');
    expect(item('notes')!.getAttribute('aria-posinset')).toBe('2');
    expect(item('notes')!.getAttribute('aria-setsize')).toBe('2');
  });

  it('filters by label and auto-expands ancestors of matches', () => {
    const { fixture, element } = setup();
    fixture.componentInstance.filter.set(true);
    fixture.detectChanges();

    const input = element.querySelector<HTMLInputElement>('.syui-tree-filter')!;
    input.value = 'resume';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(element.textContent).toContain('Resume.pdf');
    expect(element.textContent).not.toContain('Notes.txt');
    expect(element.textContent).not.toContain('Pictures');
  });
});
