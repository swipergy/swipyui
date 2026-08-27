import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { InputOtp } from '@swipergy/swipyui/inputotp';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `<syui-input-otp [formControl]="code" />`;

const INTEGER_ONLY = `<syui-input-otp [length]="6" integerOnly [formControl]="smsCode" />`;

const MASKED = `<syui-input-otp masked [formControl]="pin" />`;

const PROPS: PropRow[] = [
  { name: 'length', type: 'number', default: '4', description: 'Number of character boxes.' },
  { name: 'integerOnly', type: 'boolean', default: 'false', description: 'Accepts digits only.' },
  { name: 'masked', type: 'boolean', default: 'false', description: 'Renders password inputs to hide the code.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables all boxes.' },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputOtp, ReactiveFormsModule, DocsSection, DocsPropTable],
  template: `
    <h1>InputOtp</h1>
    <p class="docs-lead">
      One-time-passcode input with one box per character: typing advances, Backspace moves back
      and pasting distributes the code across the boxes.
      <code>import {{ '{' }} InputOtp {{ '}' }} from '&#64;swipergy/swipyui/inputotp';</code>
    </p>

    <docs-section title="Basic" [code]="basic" language="html">
      <syui-input-otp [formControl]="code" />
      <span class="docs-muted">value: {{ code.value }}</span>
    </docs-section>

    <docs-section
      title="Integer only"
      [code]="integerOnly"
      language="html"
      description="Rejects non-digit keys and switches mobile keyboards to numeric."
    >
      <syui-input-otp [length]="6" integerOnly [formControl]="smsCode" />
    </docs-section>

    <docs-section
      title="Masked"
      [code]="masked"
      language="html"
      description="Renders password inputs so the entered code stays hidden."
    >
      <syui-input-otp masked [formControl]="pin" />
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
})
export class InputOtpDemo {
  readonly basic = BASIC;
  readonly integerOnly = INTEGER_ONLY;
  readonly masked = MASKED;
  readonly props = PROPS;

  readonly code = new FormControl<string | null>(null);
  readonly smsCode = new FormControl<string | null>(null);
  readonly pin = new FormControl<string | null>(null);
}
