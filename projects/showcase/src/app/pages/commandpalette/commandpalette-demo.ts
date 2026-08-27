import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommandPalette, CommandPaletteItem } from '@swipergy/swipyui/commandpalette';
import { Button } from '@swipergy/swipyui/button';
import { Kbd } from '@swipergy/swipyui/kbd';
import { Toast, ToastService } from '@swipergy/swipyui/toast';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `@Component({
  template: \`
    <syui-button label="Open palette" (click)="visible.set(true)" />
    <syui-commandpalette [(visible)]="visible" [items]="commands" />
  \`,
})
export class Demo {
  readonly visible = signal(false);
  readonly commands: CommandPaletteItem[] = [
    {
      label: 'New file',
      icon: 'pi pi-file',
      group: 'File',
      shortcut: '⌘ N',
      command: () => this.create(),
    },
    {
      label: 'Open file…',
      group: 'File',
      keywords: 'load document',
      command: () => this.open(),
    },
    { label: 'Toggle dark mode', group: 'View', command: () => this.toggleTheme() },
    { label: 'Sign out', group: 'Account', command: () => this.signOut() },
  ];
}`;

const PROPS: PropRow[] = [
  {
    name: 'visible',
    type: 'model<boolean>',
    default: 'false',
    description: 'Controls palette visibility; supports two-way binding.',
  },
  {
    name: 'items',
    type: 'CommandPaletteItem[]',
    default: '[]',
    description:
      'Commands offered by the palette. Extends MenuItem with group, shortcut and keywords.',
  },
  {
    name: 'placeholder',
    type: 'string',
    default: "'Type a command or search…'",
    description: 'Placeholder of the search input.',
  },
  {
    name: 'emptyMessage',
    type: 'string',
    default: "'No results found'",
    description: 'Message shown when no command matches the query.',
  },
  {
    name: 'hotkey',
    type: 'boolean',
    default: 'true',
    description: 'Opens/closes the palette with Ctrl+K or ⌘+K.',
  },
  { name: 'width', type: 'string', default: "'36rem'", description: 'Width of the palette.' },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommandPalette, Button, Kbd, Toast, DocsSection, DocsPropTable],
  template: `
    <h1>CommandPalette</h1>
    <p class="docs-lead">
      Searchable command dialog: typing filters the commands, arrow keys navigate, Enter runs the
      active command.
      <code
        >import {{ '{' }} CommandPalette {{ '}' }} from '&#64;swipergy/swipyui/commandpalette';</code
      >
    </p>

    <docs-section
      title="Basic"
      [code]="basic"
      language="typescript"
      description="Open it with the button or the built-in hotkey. Commands are grouped, searchable via extra keywords, and can show a shortcut hint."
    >
      <syui-button label="Open palette" (click)="visible.set(true)" />
      <span class="docs-muted" style="margin-left: 0.75rem">
        or press <syui-kbd value="⌘+K" /> / <syui-kbd value="Ctrl+K" />
      </span>
      <syui-commandpalette [(visible)]="visible" [items]="commands" />
      <syui-toast />
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
})
export class CommandPaletteDemo {
  readonly basic = BASIC;
  readonly props = PROPS;
  readonly visible = signal(false);

  private readonly toast = inject(ToastService);

  private run(label: string): void {
    this.toast.show({ severity: 'info', summary: label, detail: 'Command executed.' });
  }

  readonly commands: CommandPaletteItem[] = [
    {
      label: 'New file',
      group: 'File',
      shortcut: '⌘ N',
      command: () => this.run('New file'),
    },
    {
      label: 'Open file…',
      group: 'File',
      shortcut: '⌘ O',
      keywords: 'load document',
      command: () => this.run('Open file…'),
    },
    {
      label: 'Save all',
      group: 'File',
      disabled: true,
      command: () => this.run('Save all'),
    },
    { label: 'Toggle dark mode', group: 'View', command: () => this.run('Toggle dark mode') },
    { label: 'Zoom in', group: 'View', shortcut: '⌘ +', command: () => this.run('Zoom in') },
    { label: 'Sign out', group: 'Account', keywords: 'logout', command: () => this.run('Sign out') },
  ];
}
