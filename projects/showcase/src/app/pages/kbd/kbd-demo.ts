import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Kbd } from '@swipergy/swipyui/kbd';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `<syui-kbd value="Ctrl+C" />
<syui-kbd value="Ctrl+Shift+P" />
<syui-kbd value="⌘+K" />`;

const SEPARATOR = `<syui-kbd value="g+d" separator="then" />`;

const PROJECTED = `Press <syui-kbd>Esc</syui-kbd> to close the dialog.`;

const PROPS: PropRow[] = [
  {
    name: 'value',
    type: 'string',
    description: "Shortcut to display; '+' splits it into individual keycaps.",
  },
  {
    name: 'separator',
    type: 'string',
    default: "'+'",
    description: 'Character rendered between keycaps.',
  },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Kbd, DocsSection, DocsPropTable],
  template: `
    <h1>Kbd</h1>
    <p class="docs-lead">
      Inline keycaps for documenting keyboard shortcuts.
      <code>import {{ '{' }} Kbd {{ '}' }} from '&#64;swipergy/swipyui/kbd';</code>
    </p>

    <docs-section title="Basic" [code]="basic" language="html">
      <syui-kbd value="Ctrl+C" />
      <syui-kbd value="Ctrl+Shift+P" />
      <syui-kbd value="⌘+K" />
    </docs-section>

    <docs-section
      title="Separator"
      [code]="separatorCode"
      language="html"
      description="Sequences read better with a custom separator between the keycaps."
    >
      <syui-kbd value="g+d" separator="then" />
    </docs-section>

    <docs-section
      title="Custom content"
      [code]="projected"
      language="html"
      description="Projected content renders as a single keycap."
    >
      Press <syui-kbd>Esc</syui-kbd> to close the dialog.
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
})
export class KbdDemo {
  readonly basic = BASIC;
  readonly separatorCode = SEPARATOR;
  readonly projected = PROJECTED;
  readonly props = PROPS;
}
