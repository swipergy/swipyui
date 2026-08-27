import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ToggleButton } from '@swipergy/swipyui/togglebutton';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `<syui-toggle-button [formControl]="confirmed" />`;

const CUSTOM = `<syui-toggle-button onLabel="Locked" offLabel="Unlocked" [formControl]="locked" />`;

const DISABLED = `<syui-toggle-button onLabel="On" offLabel="Off" disabled />`;

const PROPS: PropRow[] = [
  { name: 'onLabel', type: 'string', default: "'Yes'", description: 'Label shown while checked.' },
  { name: 'offLabel', type: 'string', default: "'No'", description: 'Label shown while unchecked.' },
  { name: 'checked', type: 'model<boolean>', default: 'false', description: 'Checked state; supports two-way binding.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the button.' },
  { name: 'ariaLabel', type: 'string', description: 'Accessible name of the button.' },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ToggleButton, ReactiveFormsModule, DocsSection, DocsPropTable],
  template: `
    <h1>ToggleButton</h1>
    <p class="docs-lead">
      Two-state button toggling between an on and off label, exposed to assistive technology via
      <code>aria-pressed</code>.
      <code>import {{ '{' }} ToggleButton {{ '}' }} from '&#64;swipergy/swipyui/togglebutton';</code>
    </p>

    <docs-section title="Basic" [code]="basic">
      <syui-toggle-button [formControl]="confirmed" ariaLabel="Confirmed" />
      <span class="docs-muted">value: {{ confirmed.value }}</span>
    </docs-section>

    <docs-section
      title="Custom labels"
      [code]="custom"
      description="onLabel and offLabel replace the default Yes/No pair."
    >
      <syui-toggle-button onLabel="Locked" offLabel="Unlocked" [formControl]="locked" ariaLabel="Lock" />
    </docs-section>

    <docs-section title="Disabled" [code]="disabledCode">
      <syui-toggle-button onLabel="On" offLabel="Off" disabled />
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
})
export class ToggleButtonDemo {
  readonly basic = BASIC;
  readonly custom = CUSTOM;
  readonly disabledCode = DISABLED;
  readonly props = PROPS;

  readonly confirmed = new FormControl(false);
  readonly locked = new FormControl(true);
}
