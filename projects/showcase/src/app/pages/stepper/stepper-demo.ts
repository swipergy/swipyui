import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Button } from '@swipergy/swipyui/button';
import { Step, Stepper } from '@swipergy/swipyui/stepper';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `<syui-stepper>
  <syui-step value="account" label="Account">Account form…</syui-step>
  <syui-step value="payment" label="Payment">Payment form…</syui-step>
  <syui-step value="confirm" label="Confirm">Summary…</syui-step>
</syui-stepper>`;

const PROGRAMMATIC = `<syui-stepper #stepper>
  <syui-step value="1" label="Details">…</syui-step>
  <syui-step value="2" label="Review">…</syui-step>
  <syui-step value="3" label="Done">…</syui-step>
</syui-stepper>
<syui-button label="Back" severity="secondary" (onClick)="stepper.prev()" />
<syui-button label="Next" (onClick)="stepper.next()" />`;

const LINEAR = `<syui-stepper linear #wizard>
  <syui-step value="a" label="First">…</syui-step>
  <syui-step value="b" label="Second">…</syui-step>
  <syui-step value="c" label="Third">…</syui-step>
</syui-stepper>`;

const PROPS: PropRow[] = [
  {
    name: 'value',
    type: 'model<unknown>',
    default: 'first step',
    description: 'Value of the active step; supports two-way binding.',
  },
  {
    name: 'linear',
    type: 'boolean',
    default: 'false',
    description: 'Forbids activating steps beyond the next uncompleted one.',
  },
  {
    name: 'next() / prev()',
    type: 'method',
    description: 'Programmatic navigation, e.g. via a template reference variable.',
  },
  {
    name: 'syui-step value',
    type: 'unknown',
    description: 'Identifies the step within the stepper value.',
  },
  {
    name: 'syui-step label',
    type: 'string',
    description: 'Text shown next to the step number.',
  },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Stepper, Step, Button, DocsSection, DocsPropTable],
  template: `
    <h1>Stepper</h1>
    <p class="docs-lead">
      Guides users through a sequence of steps with numbered indicators, connector lines and a
      check mark for completed steps.
      <code>import {{ '{' }} Stepper, Step {{ '}' }} from '&#64;swipergy/swipyui/stepper';</code>
    </p>

    <docs-section title="Basic" [code]="basic" language="html">
      <syui-stepper style="width: 100%">
        <syui-step value="account" label="Account">
          Create your account: pick a username and a password.
        </syui-step>
        <syui-step value="payment" label="Payment">
          Choose a payment method and enter the billing details.
        </syui-step>
        <syui-step value="confirm" label="Confirm">Review everything and submit.</syui-step>
      </syui-stepper>
    </docs-section>

    <docs-section
      title="Programmatic navigation"
      [code]="programmatic"
      language="html"
      description="next() and prev() are available on the component instance, e.g. through a template reference."
    >
      <div style="width: 100%">
        <syui-stepper #stepper>
          <syui-step value="1" label="Details">Step one content.</syui-step>
          <syui-step value="2" label="Review">Step two content.</syui-step>
          <syui-step value="3" label="Done">Step three content.</syui-step>
        </syui-stepper>
        <div style="display: flex; gap: 0.5rem">
          <syui-button label="Back" severity="secondary" (onClick)="stepper.prev()" />
          <syui-button label="Next" (onClick)="stepper.next()" />
        </div>
      </div>
    </docs-section>

    <docs-section
      title="Linear"
      [code]="linear"
      language="html"
      description="In linear mode the headers past the next step are disabled; advance with next() or by completing steps in order."
    >
      <div style="width: 100%">
        <syui-stepper linear #wizard>
          <syui-step value="a" label="First">Complete this step to unlock the next one.</syui-step>
          <syui-step value="b" label="Second">Almost there.</syui-step>
          <syui-step value="c" label="Third">Finished.</syui-step>
        </syui-stepper>
        <div style="display: flex; gap: 0.5rem">
          <syui-button label="Back" severity="secondary" (onClick)="wizard.prev()" />
          <syui-button label="Next" (onClick)="wizard.next()" />
        </div>
      </div>
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
})
export class StepperDemo {
  readonly basic = BASIC;
  readonly programmatic = PROGRAMMATIC;
  readonly linear = LINEAR;
  readonly props = PROPS;
}
