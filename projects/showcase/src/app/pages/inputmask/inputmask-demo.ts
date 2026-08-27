import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { InputMask } from '@swipergy/swipyui/inputmask';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `<input syuiInputMask mask="99/99/9999" placeholder="dd/mm/yyyy" [formControl]="date" />`;

const PHONE = `<!-- unmask stores only the raw digits: 5551234567 -->
<input syuiInputMask mask="(999) 999-9999" unmask [formControl]="phone" />`;

const SERIAL = `<!-- a = letter, 9 = digit, * = alphanumeric -->
<input syuiInputMask mask="aa-9999-***" slotChar="•" [formControl]="serial" />`;

const PROPS: PropRow[] = [
  {
    name: 'mask',
    type: 'string',
    description: 'Pattern of 9 (digit), a (letter), * (alphanumeric) tokens; other characters are literals.',
  },
  { name: 'slotChar', type: 'string', default: "'_'", description: 'Placeholder character for unfilled positions while focused.' },
  { name: 'unmask', type: 'boolean', default: 'false', description: 'Stores the value without mask literals.' },
  { name: 'autoClear', type: 'boolean', default: 'true', description: 'Clears the value on blur when the mask is incomplete.' },
  { name: 'placeholder', type: 'string', description: 'Native placeholder shown while empty and unfocused.' },
  { name: 'fluid', type: 'boolean', default: 'false', description: 'Stretches the input to the container width.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the input.' },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputMask, ReactiveFormsModule, DocsSection, DocsPropTable],
  template: `
    <h1>InputMask</h1>
    <p class="docs-lead">
      Masks a native text input against a fixed pattern: literals are inserted automatically,
      invalid characters are rejected and incomplete values are cleared on blur.
      <code>import {{ '{' }} InputMask {{ '}' }} from '&#64;swipergy/swipyui/inputmask';</code>
    </p>

    <docs-section title="Basic" [code]="basic" language="html">
      <input syuiInputMask mask="99/99/9999" placeholder="dd/mm/yyyy" [formControl]="date" />
      <span class="docs-muted">value: {{ date.value }}</span>
    </docs-section>

    <docs-section
      title="Unmask"
      [code]="phoneSnippet"
      language="html"
      description="With unmask, the model holds only the characters the user typed, without literals."
    >
      <input syuiInputMask mask="(999) 999-9999" unmask [formControl]="phone" />
      <span class="docs-muted">value: {{ phone.value }}</span>
    </docs-section>

    <docs-section
      title="Tokens & slot character"
      [code]="serialSnippet"
      language="html"
      description="Mix letter, digit and alphanumeric tokens; slotChar customizes the fill character."
    >
      <input syuiInputMask mask="aa-9999-***" slotChar="•" [formControl]="serial" />
      <span class="docs-muted">value: {{ serial.value }}</span>
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
})
export class InputMaskDemo {
  readonly basic = BASIC;
  readonly phoneSnippet = PHONE;
  readonly serialSnippet = SERIAL;
  readonly props = PROPS;

  readonly date = new FormControl<string | null>(null);
  readonly phone = new FormControl<string | null>(null);
  readonly serial = new FormControl<string | null>(null);
}
