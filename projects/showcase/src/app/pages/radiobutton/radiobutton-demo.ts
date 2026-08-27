import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RadioButton } from '@swipergy/swipyui/radiobutton';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `<syui-radiobutton name="size" value="s" label="Small" [formControl]="size" />
<syui-radiobutton name="size" value="m" label="Medium" [formControl]="size" />
<syui-radiobutton name="size" value="l" label="Large" [formControl]="size" />`;

const PROPS: PropRow[] = [
  { name: 'value', type: 'unknown', description: 'Value this option writes to the form control. Required.' },
  { name: 'name', type: 'string', description: 'Groups radios for native keyboard navigation.' },
  { name: 'label', type: 'string', description: 'Text rendered next to the radio.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the radio.' },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RadioButton, ReactiveFormsModule, DocsSection, DocsPropTable],
  template: `
    <h1>RadioButton</h1>
    <p class="docs-lead">
      Single-select options bound to one form control.
      <code>import {{ '{' }} RadioButton {{ '}' }} from '&#64;swipergy/swipyui/radiobutton';</code>
    </p>

    <docs-section title="Basic" [code]="basic">
      <syui-radiobutton name="size" value="s" label="Small" [formControl]="size" />
      <syui-radiobutton name="size" value="m" label="Medium" [formControl]="size" />
      <syui-radiobutton name="size" value="l" label="Large" [formControl]="size" />
      <span class="docs-muted">value: {{ size.value }}</span>
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
})
export class RadioButtonDemo {
  readonly basic = BASIC;
  readonly props = PROPS;
  readonly size = new FormControl('m');
}
