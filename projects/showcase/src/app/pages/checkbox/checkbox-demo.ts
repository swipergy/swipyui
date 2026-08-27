import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Checkbox } from '@swipergy/swipyui/checkbox';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `<syui-checkbox label="Accept terms and conditions" [formControl]="accepted" />`;
const DISABLED = `<syui-checkbox label="Disabled unchecked" disabled />
<syui-checkbox label="Disabled checked" [formControl]="checked" />`;

const PROPS: PropRow[] = [
  { name: 'label', type: 'string', description: 'Text rendered next to the box.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the checkbox.' },
  { name: 'ariaLabel', type: 'string', description: 'Accessible label when no visible label is set.' },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Checkbox, ReactiveFormsModule, DocsSection, DocsPropTable],
  template: `
    <h1>Checkbox</h1>
    <p class="docs-lead">
      Boolean checkbox backed by a hidden native input.
      <code>import {{ '{' }} Checkbox {{ '}' }} from '&#64;swipergy/swipyui/checkbox';</code>
    </p>

    <docs-section title="Basic" [code]="basic">
      <syui-checkbox label="Accept terms and conditions" [formControl]="accepted" />
      <span class="docs-muted">value: {{ accepted.value }}</span>
    </docs-section>

    <docs-section title="Disabled" [code]="disabled">
      <syui-checkbox label="Disabled unchecked" disabled />
      <syui-checkbox label="Disabled checked" [formControl]="checked" />
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
})
export class CheckboxDemo {
  readonly basic = BASIC;
  readonly disabled = DISABLED;
  readonly props = PROPS;
  readonly accepted = new FormControl(false);
  readonly checked = new FormControl({ value: true, disabled: true });
}
