import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Tab, Tabs } from '@swipergy/swipyui/tabs';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `<syui-tabs [(value)]="active">
  <syui-tab value="general" label="General">General settings…</syui-tab>
  <syui-tab value="security" label="Security">Security settings…</syui-tab>
  <syui-tab value="billing" label="Billing" disabled>Billing…</syui-tab>
</syui-tabs>`;

const PROPS: PropRow[] = [
  {
    name: 'value',
    type: 'model<unknown>',
    description: 'Active tab value; supports [(value)] two-way binding. Defaults to the first enabled tab.',
  },
  { name: 'syui-tab value', type: 'unknown', description: 'Identifies a tab. Required.' },
  { name: 'syui-tab label', type: 'string', description: 'Tab header text. Required.' },
  { name: 'syui-tab disabled', type: 'boolean', default: 'false', description: 'Disables the tab.' },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Tabs, Tab, DocsSection, DocsPropTable],
  template: `
    <h1>Tabs</h1>
    <p class="docs-lead">
      WAI-ARIA tabs with roving tabindex — arrow keys move and activate, Home/End jump.
      <code>import {{ '{' }} Tabs, Tab {{ '}' }} from '&#64;swipergy/swipyui/tabs';</code>
    </p>

    <docs-section title="Basic" [code]="basic">
      <syui-tabs [(value)]="active" style="width: 100%">
        <syui-tab value="general" label="General">
          Configure your workspace name, logo and default language.
        </syui-tab>
        <syui-tab value="security" label="Security">
          Two-factor authentication, session length and allowed IP ranges.
        </syui-tab>
        <syui-tab value="billing" label="Billing" disabled>Billing details.</syui-tab>
      </syui-tabs>
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
})
export class TabsDemo {
  readonly basic = BASIC;
  readonly props = PROPS;
  readonly active = signal<string | undefined>(undefined);
}
