import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MenuItem } from '@swipergy/swipyui/core';
import { SpeedDial } from '@swipergy/swipyui/speeddial';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `items: MenuItem[] = [
  { label: 'Add', command: () => this.log('Add') },
  { label: 'Update', command: () => this.log('Update') },
  { label: 'Delete', command: () => this.log('Delete') },
];

<syui-speed-dial [model]="items" direction="up" ariaLabel="Quick actions" />`;

const DIRECTIONS = `<syui-speed-dial [model]="items" direction="up" />
<syui-speed-dial [model]="items" direction="down" />
<syui-speed-dial [model]="items" direction="left" />
<syui-speed-dial [model]="items" direction="right" />`;

const MASK = `<syui-speed-dial [model]="items" direction="up" mask />`;

const PROPS: PropRow[] = [
  {
    name: 'model',
    type: 'MenuItem[]',
    default: '[]',
    description: 'Action items; label names the button, icon renders as <i class>, command runs on click.',
  },
  {
    name: 'direction',
    type: "'up' | 'down' | 'left' | 'right'",
    default: "'up'",
    description: 'Direction the actions fan out towards.',
  },
  { name: 'type', type: "'linear'", default: "'linear'", description: 'Layout of the fan-out; only linear is supported.' },
  { name: 'mask', type: 'boolean', default: 'false', description: 'Shows a full-screen mask behind the actions while open.' },
  { name: 'transitionDelay', type: 'number', default: '40', description: 'Stagger between consecutive action animations, in ms.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the trigger button.' },
  { name: 'ariaLabel', type: 'string', default: "'Show actions'", description: 'Accessible name of the trigger button.' },
  { name: 'visible', type: 'model<boolean>', default: 'false', description: 'Open state, two-way bindable via [(visible)].' },
  { name: 'onShow', type: 'output<void>', description: 'Emitted when the actions fan out.' },
  { name: 'onHide', type: 'output<void>', description: 'Emitted when the actions collapse.' },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SpeedDial, DocsSection, DocsPropTable],
  template: `
    <h1>SpeedDial</h1>
    <p class="docs-lead">
      Floating action button that fans out a set of quick actions with a staggered animation.
      Arrow keys move between actions, Escape and outside clicks close.
      <code>import {{ '{' }} SpeedDial {{ '}' }} from '&#64;swipergy/swipyui/speeddial';</code>
    </p>

    <docs-section title="Basic" [code]="basic" language="typescript">
      <div class="docs-speeddial-canvas" style="display: flex; align-items: flex-end; justify-content: center; height: 16rem;">
        <syui-speed-dial [model]="items" direction="up" ariaLabel="Quick actions" />
      </div>
      <span class="docs-muted">last action: {{ lastAction() || '—' }}</span>
    </docs-section>

    <docs-section
      title="Directions"
      [code]="directions"
      language="html"
      description="Actions fan out linearly towards the configured direction."
    >
      <div style="display: flex; align-items: center; justify-content: space-around; padding: 12rem 8rem;">
        <syui-speed-dial [model]="items" direction="up" ariaLabel="Up" />
        <syui-speed-dial [model]="items" direction="down" ariaLabel="Down" />
        <syui-speed-dial [model]="items" direction="left" ariaLabel="Left" />
        <syui-speed-dial [model]="items" direction="right" ariaLabel="Right" />
      </div>
    </docs-section>

    <docs-section
      title="Mask"
      [code]="mask"
      language="html"
      description="An optional full-screen mask dims the page while the actions are open."
    >
      <div style="display: flex; align-items: flex-end; justify-content: center; height: 16rem;">
        <syui-speed-dial [model]="items" direction="up" mask ariaLabel="Quick actions" />
      </div>
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
})
export class SpeedDialDemo {
  readonly basic = BASIC;
  readonly directions = DIRECTIONS;
  readonly mask = MASK;
  readonly props = PROPS;

  readonly lastAction = signal('');

  readonly items: MenuItem[] = [
    { label: 'Add', command: () => this.log('Add') },
    { label: 'Update', command: () => this.log('Update') },
    { label: 'Delete', command: () => this.log('Delete') },
  ];

  log(action: string): void {
    this.lastAction.set(action);
  }
}
