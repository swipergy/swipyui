import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Button } from '@swipergy/swipyui/button';
import { Drawer, DrawerPosition } from '@swipergy/swipyui/drawer';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `<syui-button label="Open drawer" (onClick)="visible.set(true)" />

<syui-drawer [(visible)]="visible" header="Settings">
  Drawer content goes here.
</syui-drawer>`;

const POSITIONS = `<syui-drawer [(visible)]="visible" [position]="position" header="Drawer">
  Slides in from {{ position }}.
</syui-drawer>`;

const PROPS: PropRow[] = [
  {
    name: 'visible',
    type: 'model<boolean>',
    default: 'false',
    description: 'Controls visibility; supports [(visible)] two-way binding.',
  },
  {
    name: 'position',
    type: "'left' | 'right' | 'top' | 'bottom'",
    default: "'left'",
    description: 'Edge of the viewport the drawer slides in from.',
  },
  { name: 'header', type: 'string', description: 'Title shown in the drawer header.' },
  {
    name: 'modal',
    type: 'boolean',
    default: 'true',
    description: 'Renders a mask behind the drawer.',
  },
  {
    name: 'dismissible',
    type: 'boolean',
    default: 'true',
    description: 'Closes the drawer when the mask is clicked.',
  },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, Drawer, DocsSection, DocsPropTable],
  template: `
    <h1>Drawer</h1>
    <p class="docs-lead">
      Panel that slides in over a mask from an edge of the viewport, with focus management,
      Escape/mask close and blocked body scroll.
      <code>import {{ '{' }} Drawer {{ '}' }} from '&#64;swipergy/swipyui/drawer';</code>
    </p>

    <docs-section title="Basic" [code]="basic">
      <syui-button label="Open drawer" (onClick)="basicVisible.set(true)" />
      <syui-drawer [(visible)]="basicVisible" header="Settings">
        <p>Drawer content goes here.</p>
        <syui-button label="Close" severity="secondary" variant="outlined" (onClick)="basicVisible.set(false)" />
      </syui-drawer>
    </docs-section>

    <docs-section
      title="Positions"
      [code]="positions"
      description="The drawer can slide in from any edge of the viewport."
    >
      @for (pos of allPositions; track pos) {
        <syui-button [label]="pos" severity="secondary" variant="outlined" (onClick)="open(pos)" />
      }
      <syui-drawer [(visible)]="positionVisible" [position]="position()" header="Drawer">
        <p>Slides in from {{ position() }}.</p>
      </syui-drawer>
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
})
export class DrawerDemo {
  readonly basic = BASIC;
  readonly positions = POSITIONS;
  readonly props = PROPS;

  readonly basicVisible = signal(false);
  readonly positionVisible = signal(false);
  readonly position = signal<DrawerPosition>('left');
  readonly allPositions: DrawerPosition[] = ['left', 'right', 'top', 'bottom'];

  open(position: DrawerPosition): void {
    this.position.set(position);
    this.positionVisible.set(true);
  }
}
