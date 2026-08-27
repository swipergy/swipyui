import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Divider } from '@swipergy/swipyui/divider';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `<p>Content above</p>
<syui-divider />
<p>Content below</p>`;

const TYPES = `<syui-divider />
<syui-divider type="dashed" />
<syui-divider type="dotted" />`;

const LABEL = `<syui-divider align="left">Left</syui-divider>
<syui-divider>Center</syui-divider>
<syui-divider align="right">Right</syui-divider>`;

const VERTICAL = `<div style="display: flex; height: 6rem">
  <p>Left</p>
  <syui-divider layout="vertical" />
  <p>Middle</p>
  <syui-divider layout="vertical">OR</syui-divider>
  <p>Right</p>
</div>`;

const PROPS: PropRow[] = [
  {
    name: 'layout',
    type: "'horizontal' | 'vertical'",
    default: "'horizontal'",
    description: 'Direction of the rule.',
  },
  {
    name: 'type',
    type: "'solid' | 'dashed' | 'dotted'",
    default: "'solid'",
    description: 'Line style of the rule.',
  },
  {
    name: 'align',
    type: "'left' | 'center' | 'right' | 'top' | 'bottom'",
    default: "'center'",
    description:
      'Position of the projected content: left/center/right for horizontal, top/center/bottom for vertical.',
  },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Divider, DocsSection, DocsPropTable],
  template: `
    <h1>Divider</h1>
    <p class="docs-lead">
      Separates content with a horizontal or vertical rule; projected content is rendered on the
      line.
      <code>import {{ '{' }} Divider {{ '}' }} from '&#64;swipergy/swipyui/divider';</code>
    </p>

    <docs-section title="Basic" [code]="basic" language="html">
      <div style="width: 100%">
        <p>Content above</p>
        <syui-divider />
        <p>Content below</p>
      </div>
    </docs-section>

    <docs-section title="Types" [code]="types" language="html">
      <div style="width: 100%">
        <syui-divider />
        <syui-divider type="dashed" />
        <syui-divider type="dotted" />
      </div>
    </docs-section>

    <docs-section
      title="Content on the line"
      [code]="label"
      language="html"
      description="Anything projected into the divider is placed on the rule; align moves it along the line."
    >
      <div style="width: 100%">
        <syui-divider align="left">Left</syui-divider>
        <syui-divider>Center</syui-divider>
        <syui-divider align="right">Right</syui-divider>
      </div>
    </docs-section>

    <docs-section
      title="Vertical"
      [code]="vertical"
      language="html"
      description="Vertical dividers stretch to the height of their flex container."
    >
      <div style="display: flex; align-items: center; height: 6rem">
        <p>Left</p>
        <syui-divider layout="vertical" />
        <p>Middle</p>
        <syui-divider layout="vertical">OR</syui-divider>
        <p>Right</p>
      </div>
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
})
export class DividerDemo {
  readonly basic = BASIC;
  readonly types = TYPES;
  readonly label = LABEL;
  readonly vertical = VERTICAL;
  readonly props = PROPS;
}
