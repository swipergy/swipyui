import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Button } from '@swipergy/swipyui/button';
import { Popover } from '@swipergy/swipyui/popover';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `<syui-button label="Toggle popover" (onClick)="op.toggle($event)" />

<syui-popover #op>
  <strong>Share this document</strong>
  <p>Anyone with the link can view.</p>
</syui-popover>`;

const IMPERATIVE = `<syui-button label="Show" (onClick)="op.show($event)" />
<syui-button label="Hide" severity="secondary" variant="outlined" (onClick)="op.hide()" />

<syui-popover #op (onShow)="log('shown')" (onHide)="log('hidden')">
  Anchored to the event's currentTarget.
</syui-popover>`;

const PROPS: PropRow[] = [
  {
    name: 'toggle(event)',
    type: '(event: Event) => void',
    description: 'Opens the panel anchored to event.currentTarget, or closes it if open.',
  },
  {
    name: 'show(event)',
    type: '(event: Event) => void',
    description: 'Opens the panel anchored to event.currentTarget.',
  },
  { name: 'hide()', type: '() => void', description: 'Closes the panel.' },
  {
    name: 'visible',
    type: 'Signal<boolean>',
    description: 'Whether the panel is currently open.',
  },
  { name: 'onShow', type: 'output<void>', description: 'Emitted after the panel opened.' },
  { name: 'onHide', type: 'output<void>', description: 'Emitted after the panel closed.' },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, Popover, DocsSection, DocsPropTable],
  template: `
    <h1>Popover</h1>
    <p class="docs-lead">
      Overlay panel anchored to an element and opened imperatively via a template reference.
      Closes on outside click and Escape.
      <code>import {{ '{' }} Popover {{ '}' }} from '&#64;swipergy/swipyui/popover';</code>
    </p>

    <docs-section title="Basic" [code]="basic">
      <syui-button label="Toggle popover" (onClick)="op.toggle($event)" />
      <syui-popover #op>
        <strong>Share this document</strong>
        <p>Anyone with the link can view.</p>
      </syui-popover>
    </docs-section>

    <docs-section
      title="Imperative show / hide"
      [code]="imperative"
      description="show() and hide() give full control; onShow and onHide report state changes."
    >
      <syui-button label="Show" (onClick)="op2.show($event)" />
      <syui-button label="Hide" severity="secondary" variant="outlined" (onClick)="op2.hide()" />
      <syui-popover #op2 (onShow)="lastEvent.set('onShow')" (onHide)="lastEvent.set('onHide')">
        Anchored to the event's currentTarget.
      </syui-popover>
      <span class="docs-muted">last event: {{ lastEvent() }}</span>
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
})
export class PopoverDemo {
  readonly basic = BASIC;
  readonly imperative = IMPERATIVE;
  readonly props = PROPS;

  readonly lastEvent = signal('—');
}
