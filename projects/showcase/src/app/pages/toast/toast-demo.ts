import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Button } from '@swipergy/swipyui/button';
import { Toast, ToastService } from '@swipergy/swipyui/toast';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `// place the outlet once, e.g. in your root component
<syui-toast />

// then show messages from anywhere
private toast = inject(ToastService);

this.toast.show({ severity: 'success', summary: 'Saved', detail: 'Profile updated' });`;

const SEVERITIES = `this.toast.show({ severity: 'success', summary: 'Success' });
this.toast.show({ severity: 'info', summary: 'Info' });
this.toast.show({ severity: 'warn', summary: 'Warning' });
this.toast.show({ severity: 'danger', summary: 'Error' });`;

const PROPS: PropRow[] = [
  {
    name: 'position',
    type: "'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'",
    default: "'top-right'",
    description: 'Screen corner where messages appear (syui-toast outlet).',
  },
  {
    name: 'show(message)',
    type: 'ToastService',
    description: 'Queues a message: { severity?, summary, detail?, life? }.',
  },
  {
    name: 'life',
    type: 'number',
    default: '4000',
    description: 'Auto-dismiss delay in ms; 0 keeps the toast until closed.',
  },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, Toast, DocsSection, DocsPropTable],
  template: `
    <h1>Toast</h1>
    <p class="docs-lead">
      Service-driven notifications rendered in a polite ARIA live region.
      <code>import {{ '{' }} Toast, ToastService {{ '}' }} from '&#64;swipergy/swipyui/toast';</code>
    </p>

    <docs-section title="Basic" [code]="basic" language="typescript">
      <syui-button
        label="Show toast"
        (onClick)="toast.show({ severity: 'success', summary: 'Saved', detail: 'Profile updated' })"
      />
    </docs-section>

    <docs-section title="Severities" [code]="severities" language="typescript">
      <syui-button
        label="Success"
        severity="success"
        (onClick)="toast.show({ severity: 'success', summary: 'Success' })"
      />
      <syui-button
        label="Info"
        severity="secondary"
        variant="outlined"
        (onClick)="toast.show({ severity: 'info', summary: 'Info' })"
      />
      <syui-button
        label="Warning"
        severity="secondary"
        variant="outlined"
        (onClick)="toast.show({ severity: 'warn', summary: 'Warning' })"
      />
      <syui-button
        label="Error"
        severity="danger"
        (onClick)="toast.show({ severity: 'danger', summary: 'Error' })"
      />
    </docs-section>

    <docs-prop-table [props]="props" />

    <syui-toast />
  `,
})
export class ToastDemo {
  readonly basic = BASIC;
  readonly severities = SEVERITIES;
  readonly props = PROPS;
  readonly toast = inject(ToastService);
}
