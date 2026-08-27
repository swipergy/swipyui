import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Password } from '@swipergy/swipyui/password';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `<syui-password placeholder="Password" [formControl]="password" />`;

const TOGGLE_MASK = `<syui-password toggleMask placeholder="Password" [formControl]="password" />`;

const NO_FEEDBACK = `<syui-password [feedback]="false" toggleMask placeholder="PIN" [formControl]="pin" />`;

const LABELS = `<syui-password
  toggleMask
  promptLabel="Choose a password"
  weakLabel="Too simple"
  mediumLabel="Average"
  strongLabel="Excellent"
  [formControl]="password"
/>`;

const PROPS: PropRow[] = [
  {
    name: 'toggleMask',
    type: 'boolean',
    default: 'false',
    description: 'Shows an eye button that toggles between masked and plain text.',
  },
  {
    name: 'feedback',
    type: 'boolean',
    default: 'true',
    description: 'Shows the strength meter overlay while the input is focused.',
  },
  {
    name: 'promptLabel',
    type: 'string',
    default: "'Enter a password'",
    description: 'Meter label while the field is empty.',
  },
  { name: 'weakLabel', type: 'string', default: "'Weak'", description: 'Label for weak passwords.' },
  {
    name: 'mediumLabel',
    type: 'string',
    default: "'Medium'",
    description: 'Label for medium passwords.',
  },
  {
    name: 'strongLabel',
    type: 'string',
    default: "'Strong'",
    description: 'Label for strong passwords.',
  },
  { name: 'placeholder', type: 'string', default: "''", description: 'Text shown while empty.' },
  {
    name: 'fluid',
    type: 'boolean',
    default: 'false',
    description: 'Stretches the control to the container width.',
  },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the control.' },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Password, ReactiveFormsModule, DocsSection, DocsPropTable],
  template: `
    <h1>Password</h1>
    <p class="docs-lead">
      Password input with an optional visibility toggle and a strength meter shown in an overlay
      below the field while it is focused.
      <code>import {{ '{' }} Password {{ '}' }} from '&#64;swipergy/swipyui/password';</code>
    </p>

    <docs-section
      title="Basic"
      [code]="basic"
      language="html"
      description="Focus the field and start typing to see the strength meter."
    >
      <syui-password placeholder="Password" [formControl]="password" />
    </docs-section>

    <docs-section
      title="Toggle mask"
      [code]="toggleMaskCode"
      language="html"
      description="The eye button reveals the value without moving focus away from the input."
    >
      <syui-password toggleMask placeholder="Password" [formControl]="password2" />
    </docs-section>

    <docs-section
      title="Without feedback"
      [code]="noFeedback"
      language="html"
      description="Disable the meter for fields where strength hints make no sense."
    >
      <syui-password [feedback]="false" toggleMask placeholder="PIN" [formControl]="pin" />
    </docs-section>

    <docs-section title="Custom labels" [code]="labels" language="html">
      <syui-password
        toggleMask
        promptLabel="Choose a password"
        weakLabel="Too simple"
        mediumLabel="Average"
        strongLabel="Excellent"
        [formControl]="password3"
      />
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
})
export class PasswordDemo {
  readonly basic = BASIC;
  readonly toggleMaskCode = TOGGLE_MASK;
  readonly noFeedback = NO_FEEDBACK;
  readonly labels = LABELS;
  readonly props = PROPS;

  readonly password = new FormControl<string | null>(null);
  readonly password2 = new FormControl<string | null>(null);
  readonly password3 = new FormControl<string | null>(null);
  readonly pin = new FormControl<string | null>(null);
}
