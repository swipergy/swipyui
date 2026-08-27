import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IconField, InputIcon } from '@swipergy/swipyui/iconfield';
import { InputText } from '@swipergy/swipyui/inputtext';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `<syui-icon-field>
  <syui-input-icon>
    <svg viewBox="0 0 16 16" fill="none">…</svg>
  </syui-input-icon>
  <input syuiInputText placeholder="Search" />
</syui-icon-field>`;

const RIGHT = `<syui-icon-field iconPosition="right">
  <input syuiInputText placeholder="Amount" />
  <syui-input-icon>€</syui-input-icon>
</syui-icon-field>`;

const PROPS: PropRow[] = [
  {
    name: 'iconPosition',
    type: "'left' | 'right'",
    default: "'left'",
    description: 'Side of the input the icon is rendered on (syui-icon-field).',
  },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconField, InputIcon, InputText, DocsSection, DocsPropTable],
  template: `
    <h1>IconField</h1>
    <p class="docs-lead">
      Layout wrapper that places an icon inside a text input; project an
      <code>&lt;syui-input-icon&gt;</code> with any svg or icon-font element next to an
      <code>input[syuiInputText]</code>.
      <code>
        import {{ '{' }} IconField, InputIcon {{ '}' }} from '&#64;swipergy/swipyui/iconfield';
      </code>
    </p>

    <docs-section title="Basic" [code]="basic">
      <syui-icon-field>
        <syui-input-icon>
          <svg viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="4.5" stroke="currentColor" stroke-width="1.5" />
            <path
              d="M10.5 10.5L14 14"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
        </syui-input-icon>
        <input syuiInputText placeholder="Search" />
      </syui-icon-field>
    </docs-section>

    <docs-section
      title="Right icon"
      [code]="right"
      description="With iconPosition='right' the icon and the padding move to the trailing edge."
    >
      <syui-icon-field iconPosition="right">
        <input syuiInputText placeholder="Amount" />
        <syui-input-icon>€</syui-input-icon>
      </syui-icon-field>
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
})
export class IconFieldDemo {
  readonly basic = BASIC;
  readonly right = RIGHT;
  readonly props = PROPS;
}
