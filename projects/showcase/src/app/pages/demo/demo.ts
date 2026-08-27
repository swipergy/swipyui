import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Button } from '@swipergy/swipyui/button';
import { CommandPalette, CommandPaletteItem } from '@swipergy/swipyui/commandpalette';
import { EmptyState } from '@swipergy/swipyui/emptystate';
import { IconField, InputIcon } from '@swipergy/swipyui/iconfield';
import { InputText } from '@swipergy/swipyui/inputtext';
import { Kbd } from '@swipergy/swipyui/kbd';
import { Tag } from '@swipergy/swipyui/tag';
import { Toast, ToastService } from '@swipergy/swipyui/toast';
import { ThemeService } from '../../layout/theme.service';
import { DocsSection } from '../../shared/docs-section';

type ProjectStatus = 'Active' | 'Paused' | 'Done';

interface Project {
  id: number;
  name: string;
  owner: string;
  status: ProjectStatus;
}

const CODE = `@Component({
  template: \`
    <syui-icon-field>
      <syui-input-icon>🔍</syui-input-icon>
      <input syuiInputText placeholder="Search projects" [value]="query()"
             (input)="query.set($any($event.target).value)" />
    </syui-icon-field>
    <span class="hint">Press <syui-kbd value="⌘+K" /> for commands</span>

    @for (project of filtered(); track project.id) {
      <div class="row">{{ project.name }} <syui-tag [value]="project.status" /></div>
    } @empty {
      @if (projects().length === 0) {
        <syui-emptystate header="No projects yet"
                       description="Create your first project to get started.">
          <syui-button slot="actions" label="New project" (onClick)="addProject()" />
        </syui-emptystate>
      } @else {
        <syui-emptystate header="No matching projects"
                       description="No project matches your search.">
          <syui-button slot="actions" label="Clear search" severity="secondary"
                     (onClick)="query.set('')" />
        </syui-emptystate>
      }
    }

    <syui-commandpalette [(visible)]="paletteVisible" [items]="commands" />
    <syui-toast />
  \`,
})
export class Demo {
  readonly query = signal('');
  readonly projects = signal<Project[]>(SEED);
  readonly filtered = computed(() =>
    this.projects().filter((p) =>
      p.name.toLowerCase().includes(this.query().trim().toLowerCase()),
    ),
  );

  readonly paletteVisible = signal(false);
  readonly commands: CommandPaletteItem[] = [
    { label: 'New project', group: 'Project', shortcut: '⌘ N', command: () => this.addProject() },
    { label: 'Clear finished projects', group: 'Project', command: () => this.clearDone() },
    { label: 'Clear search', group: 'View', keywords: 'reset filter', command: () => this.query.set('') },
    { label: 'Toggle dark mode', group: 'View', command: () => this.theme.toggle() },
  ];
}`;

const SEED: Project[] = [
  { id: 1, name: 'Website relaunch', owner: 'Mara', status: 'Active' },
  { id: 2, name: 'Mobile app', owner: 'Jonas', status: 'Active' },
  { id: 3, name: 'Design system', owner: 'Ada', status: 'Paused' },
  { id: 4, name: 'Billing migration', owner: 'Sam', status: 'Done' },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    Button,
    CommandPalette,
    EmptyState,
    IconField,
    InputIcon,
    InputText,
    Kbd,
    Tag,
    Toast,
    DocsSection,
  ],
  template: `
    <h1>Demo</h1>
    <p class="docs-lead">
      A small project tracker combining the newest components — CommandPalette, Kbd and
      EmptyState — with inputs, tags, buttons and toasts.
    </p>

    <docs-section
      title="Project tracker"
      [code]="code"
      language="typescript"
      description="Open the command palette with the ⌘+K / Ctrl+K hotkey to add projects, clear finished ones or toggle the theme. Emptying the list or searching for something that does not exist shows the matching empty state."
    >
      <div class="demo-app">
        <div class="demo-toolbar">
          <syui-icon-field>
            <syui-input-icon>
              <svg viewBox="0 0 16 16" fill="none" width="16" height="16">
                <circle cx="7" cy="7" r="4.5" stroke="currentColor" stroke-width="1.5" />
                <path
                  d="M10.5 10.5L14 14"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
              </svg>
            </syui-input-icon>
            <input
              syuiInputText
              placeholder="Search projects"
              [value]="query()"
              (input)="query.set($any($event.target).value)"
            />
          </syui-icon-field>
          <syui-button label="New project" (onClick)="addProject()" />
          <span class="demo-hint docs-muted">
            Press <syui-kbd value="⌘+K" /> / <syui-kbd value="Ctrl+K" /> for commands
          </span>
        </div>

        @for (project of filtered(); track project.id) {
          <div class="demo-row">
            <div class="demo-row-text">
              <span class="demo-row-name">{{ project.name }}</span>
              <span class="demo-row-owner docs-muted">{{ project.owner }}</span>
            </div>
            <syui-tag [value]="project.status" [severity]="severityOf(project.status)" rounded />
            <syui-button
              label="Remove"
              severity="danger"
              variant="text"
              size="small"
              (onClick)="remove(project)"
            />
          </div>
        } @empty {
          @if (projects().length === 0) {
            <syui-emptystate
              header="No projects yet"
              description="Create your first project to get started."
            >
              <syui-button slot="actions" label="New project" (onClick)="addProject()" />
            </syui-emptystate>
          } @else {
            <syui-emptystate
              header="No matching projects"
              description="No project matches your search."
            >
              <syui-button
                slot="actions"
                label="Clear search"
                severity="secondary"
                (onClick)="query.set('')"
              />
            </syui-emptystate>
          }
        }
      </div>

      <syui-commandpalette [(visible)]="paletteVisible" [items]="commands" />
      <syui-toast />
    </docs-section>
  `,
  styles: `
    .demo-app {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      width: 100%;
      max-width: 42rem;
    }
    .demo-toolbar {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
      margin-bottom: 0.25rem;
    }
    .demo-hint {
      margin-left: auto;
    }
    .demo-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.625rem 0.875rem;
      border: 1px solid var(--syui-content-border-color, #e2e8f0);
      border-radius: var(--syui-border-radius, 6px);
    }
    .demo-row-text {
      display: flex;
      flex-direction: column;
      margin-right: auto;
    }
    .demo-row-name {
      font-weight: 600;
    }
    .demo-row-owner {
      font-size: 0.8125rem;
    }
  `,
})
export class Demo {
  readonly code = CODE;

  protected readonly theme = inject(ThemeService);
  private readonly toast = inject(ToastService);

  readonly query = signal('');
  readonly projects = signal<Project[]>([...SEED]);
  readonly filtered = computed(() =>
    this.projects().filter((p) =>
      p.name.toLowerCase().includes(this.query().trim().toLowerCase()),
    ),
  );

  readonly paletteVisible = signal(false);

  private nextId = SEED.length + 1;

  readonly commands: CommandPaletteItem[] = [
    {
      label: 'New project',
      group: 'Project',
      shortcut: '⌘ N',
      keywords: 'add create',
      command: () => this.addProject(),
    },
    {
      label: 'Clear finished projects',
      group: 'Project',
      keywords: 'remove done completed',
      command: () => this.clearDone(),
    },
    {
      label: 'Remove all projects',
      group: 'Project',
      keywords: 'delete empty',
      command: () => this.removeAll(),
    },
    {
      label: 'Clear search',
      group: 'View',
      keywords: 'reset filter',
      command: () => this.query.set(''),
    },
    {
      label: 'Toggle dark mode',
      group: 'View',
      keywords: 'theme light',
      command: () => this.theme.toggle(),
    },
  ];

  severityOf(status: ProjectStatus): 'success' | 'warn' | 'secondary' {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Paused':
        return 'warn';
      case 'Done':
        return 'secondary';
    }
  }

  addProject(): void {
    const id = this.nextId++;
    const owners = ['Mara', 'Jonas', 'Ada', 'Sam'];
    const project: Project = {
      id,
      name: `Project ${id}`,
      owner: owners[id % owners.length],
      status: 'Active',
    };
    this.projects.update((list) => [...list, project]);
    this.toast.show({ severity: 'success', summary: 'Project created', detail: project.name });
  }

  remove(project: Project): void {
    this.projects.update((list) => list.filter((p) => p.id !== project.id));
  }

  clearDone(): void {
    const removed = this.projects().filter((p) => p.status === 'Done').length;
    this.projects.update((list) => list.filter((p) => p.status !== 'Done'));
    this.toast.show({
      severity: 'info',
      summary: 'Finished projects cleared',
      detail: `${removed} project${removed === 1 ? '' : 's'} removed.`,
    });
  }

  removeAll(): void {
    this.projects.set([]);
    this.toast.show({ severity: 'info', summary: 'All projects removed' });
  }
}
