import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CommandPalette, type CommandPaletteItem } from './commandpalette';

describe('CommandPalette', () => {
  const executed: string[] = [];

  @Component({
    imports: [CommandPalette],
    template: `<syui-commandpalette [(visible)]="visible" [items]="items()" [hotkey]="hotkey()" />`,
  })
  class Host {
    readonly visible = signal(false);
    readonly hotkey = signal(true);
    readonly items = signal<CommandPaletteItem[]>([
      { label: 'New file', group: 'File', shortcut: '⌘ N', command: () => executed.push('new') },
      { label: 'Open file', group: 'File', keywords: 'load document', command: () => executed.push('open') },
      { label: 'Toggle theme', group: 'View', command: () => executed.push('theme') },
      { label: 'Locked action', disabled: true, command: () => executed.push('locked') },
    ]);
  }

  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    return { fixture };
  }

  function palette(): HTMLElement | null {
    return document.querySelector('.syui-commandpalette');
  }

  function searchInput(): HTMLInputElement {
    return document.querySelector('.syui-commandpalette-input') as HTMLInputElement;
  }

  function optionLabels(): string[] {
    return Array.from(document.querySelectorAll('.syui-commandpalette-option-label')).map(
      (el) => el.textContent!.trim(),
    );
  }

  beforeEach(() => {
    executed.length = 0;
  });

  afterEach(() => {
    document.querySelector('.cdk-overlay-container')?.remove();
  });

  it('opens via the visible model and lists commands under group headings', async () => {
    const { fixture } = setup();
    expect(palette()).toBeNull();

    fixture.componentInstance.visible.set(true);
    await fixture.whenStable();

    expect(palette()).toBeTruthy();
    expect(optionLabels()).toEqual(['New file', 'Open file', 'Toggle theme', 'Locked action']);
    const groups = Array.from(document.querySelectorAll('.syui-commandpalette-group')).map(
      (el) => el.textContent!.trim(),
    );
    expect(groups).toEqual(['File', 'View']);
  });

  it('filters commands by label and keywords', async () => {
    const { fixture } = setup();
    fixture.componentInstance.visible.set(true);
    await fixture.whenStable();

    searchInput().value = 'document';
    searchInput().dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(optionLabels()).toEqual(['Open file']);

    searchInput().value = 'zzz';
    searchInput().dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(optionLabels()).toEqual([]);
    expect(document.querySelector('.syui-commandpalette-empty')?.textContent).toContain(
      'No results found',
    );
  });

  it('announces the result count in a polite live region', async () => {
    const { fixture } = setup();
    fixture.componentInstance.visible.set(true);
    await fixture.whenStable();

    const status = document.querySelector('.syui-commandpalette-status')!;
    expect(status.getAttribute('aria-live')).toBe('polite');
    expect(status.textContent).toContain('4 results');

    searchInput().value = 'document';
    searchInput().dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(status.textContent).toContain('1 result');
  });

  it('runs the active command on Enter and closes', async () => {
    const { fixture } = setup();
    fixture.componentInstance.visible.set(true);
    await fixture.whenStable();

    searchInput().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    searchInput().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    await fixture.whenStable();

    expect(executed).toEqual(['open']);
    expect(fixture.componentInstance.visible()).toBe(false);
    expect(palette()).toBeNull();
  });

  it('skips disabled commands when navigating and on click', async () => {
    const { fixture } = setup();
    fixture.componentInstance.visible.set(true);
    await fixture.whenStable();

    // ArrowUp from the first option wraps around, skipping disabled 'Locked action'
    searchInput().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    await fixture.whenStable();
    const active = document.querySelector('.syui-commandpalette-option-active');
    expect(active?.textContent).toContain('Toggle theme');

    (document.querySelectorAll('.syui-commandpalette-option')[3] as HTMLElement).click();
    await fixture.whenStable();
    expect(executed).toEqual([]);
    expect(fixture.componentInstance.visible()).toBe(true);
  });

  it('toggles with Ctrl+K and ignores the hotkey when disabled', async () => {
    const { fixture } = setup();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.visible()).toBe(true);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.visible()).toBe(false);

    fixture.componentInstance.hotkey.set(false);
    await fixture.whenStable();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.visible()).toBe(false);
  });

  it('closes on Escape without running a command', async () => {
    const { fixture } = setup();
    fixture.componentInstance.visible.set(true);
    await fixture.whenStable();

    palette()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await fixture.whenStable();

    expect(executed).toEqual([]);
    expect(fixture.componentInstance.visible()).toBe(false);
  });
});
