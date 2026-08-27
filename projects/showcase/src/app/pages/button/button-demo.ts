import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Button } from '@swipergy/swipyui/button';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';
import * as code from './button-demo.code';

const PROPS: PropRow[] = [
  { name: 'label', type: 'string', description: 'Text shown inside the button.' },
  {
    name: 'severity',
    type: "'primary' | 'secondary' | 'success' | 'danger'",
    default: "'primary'",
    description: 'Color scheme of the button.',
  },
  {
    name: 'variant',
    type: "'filled' | 'outlined' | 'text'",
    default: "'filled'",
    description: 'Visual style of the button.',
  },
  {
    name: 'size',
    type: "'small' | 'normal' | 'large'",
    default: "'normal'",
    description: 'Size of the button.',
  },
  {
    name: 'type',
    type: "'button' | 'submit' | 'reset'",
    default: "'button'",
    description: 'Native button type.',
  },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the button.' },
  {
    name: 'loading',
    type: 'boolean',
    default: 'false',
    description: 'Shows a spinner and disables the button.',
  },
  { name: 'ariaLabel', type: 'string', description: 'Accessible label for icon-only buttons.' },
  {
    name: 'onClick',
    type: 'output<MouseEvent>',
    description: 'Emitted when the button is clicked.',
  },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, DocsSection, DocsPropTable],
  template: `
    <h1>Button</h1>
    <p class="docs-lead">
      Button with severity, variant and size options, plus a loading state.
      <code>import {{ '{' }} Button {{ '}' }} from '&#64;swipergy/swipyui/button';</code>
    </p>

    <docs-section title="Severities" [code]="code.BASIC">
      <syui-button label="Primary" />
      <syui-button label="Secondary" severity="secondary" />
      <syui-button label="Success" severity="success" />
      <syui-button label="Danger" severity="danger" />
    </docs-section>

    <docs-section title="Variants" [code]="code.VARIANTS">
      <syui-button label="Filled" />
      <syui-button label="Outlined" variant="outlined" />
      <syui-button label="Text" variant="text" />
    </docs-section>

    <docs-section title="Sizes" [code]="code.SIZES">
      <syui-button label="Small" size="small" />
      <syui-button label="Normal" />
      <syui-button label="Large" size="large" />
    </docs-section>

    <docs-section title="States" [code]="code.STATES">
      <syui-button label="Disabled" disabled />
      <syui-button label="Loading" loading />
    </docs-section>

    <docs-section
      title="Custom content"
      description="Omit the label to project arbitrary content."
      [code]="code.CONTENT"
    >
      <syui-button severity="secondary" variant="outlined">
        <strong>Projected</strong>&nbsp;content
      </syui-button>
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
})
export class ButtonDemo {
  protected readonly code = code;
  protected readonly props = PROPS;
}
