import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Button } from '@swipergy/swipyui/button';
import { Tooltip } from '@swipergy/swipyui/tooltip';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `<syui-button label="Save" syuiTooltip="Persist your changes" />`;
const POSITIONS = `<syui-button label="Top" syuiTooltip="Tooltip on top" />
<syui-button label="Bottom" syuiTooltip="Tooltip below" tooltipPosition="bottom" />
<syui-button label="Left" syuiTooltip="Tooltip left" tooltipPosition="left" />
<syui-button label="Right" syuiTooltip="Tooltip right" tooltipPosition="right" />`;

const PROPS: PropRow[] = [
  { name: 'syuiTooltip', type: 'string', description: 'Tooltip text. Empty disables the tooltip. Required.' },
  {
    name: 'tooltipPosition',
    type: "'top' | 'bottom' | 'left' | 'right'",
    default: "'top'",
    description: 'Preferred side; flips automatically when there is no room.',
  },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, Tooltip, DocsSection, DocsPropTable],
  template: `
    <h1>Tooltip</h1>
    <p class="docs-lead">
      Directive that shows a text tooltip on hover and keyboard focus, wired with
      <code>aria-describedby</code>.
      <code>import {{ '{' }} Tooltip {{ '}' }} from '&#64;swipergy/swipyui/tooltip';</code>
    </p>

    <docs-section title="Basic" [code]="basic">
      <syui-button label="Save" syuiTooltip="Persist your changes" />
    </docs-section>

    <docs-section title="Positions" [code]="positions">
      <syui-button label="Top" severity="secondary" variant="outlined" syuiTooltip="Tooltip on top" />
      <syui-button
        label="Bottom"
        severity="secondary"
        variant="outlined"
        syuiTooltip="Tooltip below"
        tooltipPosition="bottom"
      />
      <syui-button
        label="Left"
        severity="secondary"
        variant="outlined"
        syuiTooltip="Tooltip left"
        tooltipPosition="left"
      />
      <syui-button
        label="Right"
        severity="secondary"
        variant="outlined"
        syuiTooltip="Tooltip right"
        tooltipPosition="right"
      />
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
})
export class TooltipDemo {
  readonly basic = BASIC;
  readonly positions = POSITIONS;
  readonly props = PROPS;
}
