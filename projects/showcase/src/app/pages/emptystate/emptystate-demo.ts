import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EmptyState } from '@swipergy/swipyui/emptystate';
import { Button } from '@swipergy/swipyui/button';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `<syui-emptystate
  header="No projects yet"
  description="Projects you create will show up here."
/>`;

const ACTIONS = `<syui-emptystate
  header="No results found"
  description="Try adjusting the filters or search for something else."
>
  <syui-button slot="actions" label="Clear filters" severity="secondary" />
  <syui-button slot="actions" label="New search" />
</syui-emptystate>`;

const CUSTOM_ICON = `<syui-emptystate header="Inbox zero" description="You are all caught up.">
  <span slot="icon" style="font-size: 3rem">🎉</span>
</syui-emptystate>`;

const PROPS: PropRow[] = [
  {
    name: 'header',
    type: 'string',
    description: 'Short headline stating that there is nothing to show.',
  },
  {
    name: 'description',
    type: 'string',
    description: 'Supporting text, e.g. how the user can fill the view.',
  },
  {
    name: 'icon',
    type: 'string',
    description: 'CSS class(es) for an icon font, replacing the built-in illustration.',
  },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EmptyState, Button, DocsSection, DocsPropTable],
  template: `
    <h1>EmptyState</h1>
    <p class="docs-lead">
      Placeholder for views that have nothing to show yet — empty tables, search results without
      matches or a cleared inbox.
      <code>import {{ '{' }} EmptyState {{ '}' }} from '&#64;swipergy/swipyui/emptystate';</code>
    </p>

    <docs-section title="Basic" [code]="basic" language="html">
      <syui-emptystate header="No projects yet" description="Projects you create will show up here." />
    </docs-section>

    <docs-section
      title="Actions"
      [code]="actions"
      language="html"
      description="Content in the actions slot renders below the text."
    >
      <syui-emptystate
        header="No results found"
        description="Try adjusting the filters or search for something else."
      >
        <syui-button slot="actions" label="Clear filters" severity="secondary" />
        <syui-button slot="actions" label="New search" />
      </syui-emptystate>
    </docs-section>

    <docs-section
      title="Custom icon"
      [code]="customIcon"
      language="html"
      description="The icon slot replaces the built-in illustration; the icon input takes icon-font classes."
    >
      <syui-emptystate header="Inbox zero" description="You are all caught up.">
        <span slot="icon" style="font-size: 3rem">🎉</span>
      </syui-emptystate>
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
})
export class EmptyStateDemo {
  readonly basic = BASIC;
  readonly actions = ACTIONS;
  readonly customIcon = CUSTOM_ICON;
  readonly props = PROPS;
}
