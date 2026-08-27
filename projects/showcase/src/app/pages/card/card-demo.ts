import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Button } from '@swipergy/swipyui/button';
import { Card } from '@swipergy/swipyui/card';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `<syui-card title="Advanced Plan" subtitle="For growing teams">
  Includes unlimited projects, priority support and custom roles.
  <div slot="footer">
    <syui-button label="Choose plan" />
    <syui-button label="Details" severity="secondary" variant="text" />
  </div>
</syui-card>`;

const PROPS: PropRow[] = [
  { name: 'title', type: 'string', description: 'Title rendered above the content.' },
  { name: 'subtitle', type: 'string', description: 'Muted line under the title.' },
  { name: 'slot="header"', type: 'content', description: 'Projected above the body, e.g. an image.' },
  { name: 'slot="footer"', type: 'content', description: 'Projected action row below the content.' },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, Card, DocsSection, DocsPropTable],
  template: `
    <h1>Card</h1>
    <p class="docs-lead">
      Content container with optional title, subtitle, header and footer.
      <code>import {{ '{' }} Card {{ '}' }} from '&#64;swipergy/swipyui/card';</code>
    </p>

    <docs-section title="Basic" [code]="basic">
      <syui-card title="Advanced Plan" subtitle="For growing teams" style="max-width: 24rem">
        Includes unlimited projects, priority support and custom roles.
        <div slot="footer">
          <syui-button label="Choose plan" />
          <syui-button label="Details" severity="secondary" variant="text" />
        </div>
      </syui-card>
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
})
export class CardDemo {
  readonly basic = BASIC;
  readonly props = PROPS;
}
