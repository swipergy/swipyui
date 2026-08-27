import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MenuItem } from '@swipergy/swipyui/core';
import { Breadcrumb } from '@swipergy/swipyui/breadcrumb';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `home: MenuItem = { routerLink: '/' };
items: MenuItem[] = [
  { label: 'Components', routerLink: '/landing' },
  { label: 'Data', routerLink: '/table' },
  { label: 'Table' },
];

<syui-breadcrumb [home]="home" [model]="items" />`;

const WITHOUT_HOME = `<syui-breadcrumb [model]="items" />`;

const PROPS: PropRow[] = [
  {
    name: 'model',
    type: 'MenuItem[]',
    default: '[]',
    description: 'Trail items in order; the last one is the current page.',
  },
  {
    name: 'home',
    type: 'MenuItem',
    description: 'Optional first item, rendered with a house icon.',
  },
  {
    name: 'ariaLabel',
    type: 'string',
    default: "'Breadcrumb'",
    description: 'aria-label of the nav landmark.',
  },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Breadcrumb, DocsSection, DocsPropTable],
  template: `
    <h1>Breadcrumb</h1>
    <p class="docs-lead">
      Breadcrumb trail built from MenuItems; the last item is the current page and rendered
      unlinked with aria-current.
      <code>import {{ '{' }} Breadcrumb {{ '}' }} from '&#64;swipergy/swipyui/breadcrumb';</code>
    </p>

    <docs-section title="Basic" [code]="basic" language="typescript">
      <syui-breadcrumb [home]="home" [model]="items" />
    </docs-section>

    <docs-section
      title="Without home"
      [code]="withoutHome"
      language="html"
      description="Omit the home input to start the trail with the first model item."
    >
      <syui-breadcrumb [model]="items" />
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
})
export class BreadcrumbDemo {
  readonly basic = BASIC;
  readonly withoutHome = WITHOUT_HOME;
  readonly props = PROPS;

  readonly home: MenuItem = { routerLink: '/' };
  readonly items: MenuItem[] = [
    { label: 'Components', routerLink: '/landing' },
    { label: 'Data', routerLink: '/table' },
    { label: 'Table' },
  ];
}
