import { ChangeDetectionStrategy, Component } from '@angular/core';
import { InputGroup, InputGroupAddon } from '@swipergy/swipyui/inputgroup';
import { InputText } from '@swipergy/swipyui/inputtext';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `<syui-input-group>
  <syui-input-group-addon>https://</syui-input-group-addon>
  <input syuiInputText placeholder="example" />
  <syui-input-group-addon>.com</syui-input-group-addon>
</syui-input-group>`;

const PRICE = `<syui-input-group>
  <syui-input-group-addon>€</syui-input-group-addon>
  <input syuiInputText placeholder="0.00" />
  <syui-input-group-addon>per month</syui-input-group-addon>
</syui-input-group>`;

const PROPS: PropRow[] = [
  {
    name: '—',
    type: '—',
    description:
      'InputGroup and InputGroupAddon are pure CSS composition components without inputs; project addons and input[syuiInputText] elements as direct children.',
  },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputGroup, InputGroupAddon, InputText, DocsSection, DocsPropTable],
  template: `
    <h1>InputGroup</h1>
    <p class="docs-lead">
      Flex row that glues addons and text inputs into one visual control: shared borders collapse
      and inner corner radii are removed.
      <code>
        import {{ '{' }} InputGroup, InputGroupAddon {{ '}' }} from
        '&#64;swipergy/swipyui/inputgroup';
      </code>
    </p>

    <docs-section title="Basic" [code]="basic">
      <syui-input-group>
        <syui-input-group-addon>https://</syui-input-group-addon>
        <input syuiInputText placeholder="example" />
        <syui-input-group-addon>.com</syui-input-group-addon>
      </syui-input-group>
    </docs-section>

    <docs-section
      title="Prefix and suffix"
      [code]="price"
      description="Any mix of leading and trailing addons works; the input stretches to fill."
    >
      <syui-input-group>
        <syui-input-group-addon>€</syui-input-group-addon>
        <input syuiInputText placeholder="0.00" />
        <syui-input-group-addon>per month</syui-input-group-addon>
      </syui-input-group>
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
})
export class InputGroupDemo {
  readonly basic = BASIC;
  readonly price = PRICE;
  readonly props = PROPS;
}
