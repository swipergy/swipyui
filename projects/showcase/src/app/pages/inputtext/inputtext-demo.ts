import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { InputText } from '@swipergy/swipyui/inputtext';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `<input syuiInputText placeholder="Your name" />`;
const FORMS = `<input syuiInputText [formControl]="name" placeholder="Your name" />
<!-- value: {{ name.value }} -->`;
const STATES = `<input syuiInputText placeholder="Disabled" disabled />
<input syuiInputText placeholder="Invalid" invalid />
<input syuiInputText placeholder="Fluid" fluid />`;

const PROPS: PropRow[] = [
  {
    name: 'fluid',
    type: 'boolean',
    default: 'false',
    description: 'Stretches the input to the width of its container.',
  },
  {
    name: 'invalid',
    type: 'boolean',
    default: 'false',
    description: 'Applies the invalid (error) style.',
  },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputText, ReactiveFormsModule, DocsSection, DocsPropTable],
  template: `
    <h1>InputText</h1>
    <p class="docs-lead">
      A directive that styles native text inputs — the element stays a plain
      <code>&lt;input&gt;</code>, so every forms API works untouched.
      <code>import {{ '{' }} InputText {{ '}' }} from '&#64;swipergy/swipyui/inputtext';</code>
    </p>

    <docs-section title="Basic" [code]="basic">
      <input syuiInputText placeholder="Your name" />
    </docs-section>

    <docs-section title="Reactive forms" [code]="forms">
      <input syuiInputText [formControl]="name" placeholder="Your name" />
      <span class="docs-muted">value: {{ name.value }}</span>
    </docs-section>

    <docs-section title="States" [code]="states">
      <input syuiInputText placeholder="Disabled" disabled />
      <input syuiInputText placeholder="Invalid" invalid />
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
})
export class InputTextDemo {
  readonly basic = BASIC;
  readonly forms = FORMS;
  readonly states = STATES;
  readonly props = PROPS;
  readonly name = new FormControl('');
}
