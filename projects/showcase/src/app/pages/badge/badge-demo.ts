import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Badge, BadgeDirective } from '@swipergy/swipyui/badge';
import { Avatar } from '@swipergy/swipyui/avatar';
import { Button } from '@swipergy/swipyui/button';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `<syui-badge value="2" />
<syui-badge value="8" severity="success" />
<syui-badge value="4" severity="info" />
<syui-badge value="12" severity="warn" />
<syui-badge value="3" severity="danger" />
<syui-badge value="new" severity="secondary" />`;

const SIZES = `<syui-badge value="4" size="small" />
<syui-badge value="4" />
<syui-badge value="4" size="large" />`;

const OVERLAY = `<syui-button label="Notifications" syuiBadge="3" syuiBadgeSeverity="danger" />
<syui-avatar label="FK" syuiBadge />`;

const PROPS: PropRow[] = [
  { name: 'value', type: 'string | number', default: "''", description: 'Text or number shown inside the pill.' },
  {
    name: 'severity',
    type: "'secondary' | 'success' | 'info' | 'warn' | 'danger' | null",
    default: 'null',
    description: 'Color scheme; null uses the primary color.',
  },
  { name: 'size', type: "'small' | 'large' | null", default: 'null', description: 'Badge size.' },
  {
    name: 'syuiBadge',
    type: 'string | number',
    default: "''",
    description: 'Directive: corner badge value; empty renders a dot.',
  },
  {
    name: 'syuiBadgeSeverity',
    type: "'secondary' | 'success' | 'info' | 'warn' | 'danger' | null",
    default: 'null',
    description: 'Directive: color scheme of the corner badge.',
  },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Badge, BadgeDirective, Avatar, Button, DocsSection, DocsPropTable],
  template: `
    <h1>Badge</h1>
    <p class="docs-lead">
      Numeric/status pill, standalone via <code>syui-badge</code> or overlaid on any element's
      corner via the <code>syuiBadge</code> directive.
      <code>import {{ '{' }} Badge, BadgeDirective {{ '}' }} from '&#64;swipergy/swipyui/badge';</code>
    </p>

    <docs-section title="Severities" [code]="basic" language="html">
      <syui-badge value="2" />
      <syui-badge value="8" severity="success" />
      <syui-badge value="4" severity="info" />
      <syui-badge value="12" severity="warn" />
      <syui-badge value="3" severity="danger" />
      <syui-badge value="new" severity="secondary" />
    </docs-section>

    <docs-section title="Sizes" [code]="sizes" language="html">
      <syui-badge value="4" size="small" />
      <syui-badge value="4" />
      <syui-badge value="4" size="large" />
    </docs-section>

    <docs-section
      title="Overlay"
      [code]="overlay"
      language="html"
      description="The syuiBadge directive pins a badge to the host's top-right corner; an empty value renders a dot."
    >
      <syui-button label="Notifications" syuiBadge="3" syuiBadgeSeverity="danger" />
      <syui-avatar label="FK" syuiBadge />
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
})
export class BadgeDemo {
  readonly basic = BASIC;
  readonly sizes = SIZES;
  readonly overlay = OVERLAY;
  readonly props = PROPS;
}
