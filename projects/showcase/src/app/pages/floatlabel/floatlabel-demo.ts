import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FloatLabel } from '@swipergy/swipyui/floatlabel';
import { InputText } from '@swipergy/swipyui/inputtext';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `<syui-float-label>
  <input syuiInputText id="fl-email" placeholder=" " [formControl]="email" />
  <label for="fl-email">Email</label>
</syui-float-label>`;

const IN_VARIANT = `<syui-float-label variant="in">
  <input syuiInputText id="fl-name" placeholder=" " [formControl]="name" />
  <label for="fl-name">Full name</label>
</syui-float-label>`;

const PROPS: PropRow[] = [
  {
    name: 'variant',
    type: "'over' | 'in'",
    default: "'over'",
    description:
      "Where the floated label ends up: 'over' the top border, or 'in'side a taller field.",
  },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FloatLabel, InputText, ReactiveFormsModule, DocsSection, DocsPropTable],
  template: `
    <h1>FloatLabel</h1>
    <p class="docs-lead">
      Floats a label over its input: the label rests inside the field and moves up while the input
      is focused or non-empty — pure CSS via <code>:focus-within</code> and
      <code>:placeholder-shown</code>. Give the input a blank placeholder
      (<code>placeholder=" "</code>) so the filled state is detected without focus.
      <code>import {{ '{' }} FloatLabel {{ '}' }} from '&#64;swipergy/swipyui/floatlabel';</code>
    </p>

    <docs-section title="Basic" [code]="basic">
      <syui-float-label>
        <input syuiInputText id="fl-email" placeholder=" " [formControl]="email" />
        <label for="fl-email">Email</label>
      </syui-float-label>
    </docs-section>

    <docs-section
      title="In variant"
      [code]="inVariant"
      description="variant='in' keeps the floated label inside a taller field above the value."
    >
      <syui-float-label variant="in">
        <input syuiInputText id="fl-name" placeholder=" " [formControl]="name" />
        <label for="fl-name">Full name</label>
      </syui-float-label>
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
})
export class FloatLabelDemo {
  readonly basic = BASIC;
  readonly inVariant = IN_VARIANT;
  readonly props = PROPS;

  readonly email = new FormControl('');
  readonly name = new FormControl('Ada Lovelace');
}
