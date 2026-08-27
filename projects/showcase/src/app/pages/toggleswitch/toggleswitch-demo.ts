import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ToggleSwitch } from '@swipergy/swipyui/toggleswitch';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `<syui-toggleswitch label="Email notifications" [formControl]="notify" />`;
const DISABLED = `<syui-toggleswitch label="Disabled" disabled />`;

const PROPS: PropRow[] = [
  { name: 'label', type: 'string', description: 'Text rendered next to the switch.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the switch.' },
  { name: 'ariaLabel', type: 'string', description: 'Accessible label when no visible label is set.' },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ToggleSwitch, ReactiveFormsModule, DocsSection, DocsPropTable],
  template: `
    <h1>ToggleSwitch</h1>
    <p class="docs-lead">
      On/off switch with the ARIA switch role.
      <code>import {{ '{' }} ToggleSwitch {{ '}' }} from '&#64;swipergy/swipyui/toggleswitch';</code>
    </p>

    <docs-section title="Basic" [code]="basic">
      <syui-toggleswitch label="Email notifications" [formControl]="notify" />
      <span class="docs-muted">value: {{ notify.value }}</span>
    </docs-section>

    <docs-section title="Disabled" [code]="disabled">
      <syui-toggleswitch label="Disabled" disabled />
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
})
export class ToggleSwitchDemo {
  readonly basic = BASIC;
  readonly disabled = DISABLED;
  readonly props = PROPS;
  readonly notify = new FormControl(true);
}
