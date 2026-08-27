import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocsSection } from '../../shared/docs-section';

const INSTALL_CODE = `npm install @swipergy/swipyui @angular/cdk`;

const THEME_CODE = `/* styles.scss */
@import "@angular/cdk/overlay-prebuilt.css"; /* overlay positioning (dialog, select, tooltip) */
@import "@swipergy/swipyui/themes/default/default.css";`;

const USAGE_CODE = `import { Component } from '@angular/core';
import { Button } from '@swipergy/swipyui/button';

@Component({
  selector: 'app-example',
  imports: [Button],
  template: \`<syui-button label="Save" (onClick)="save()" />\`,
})
export class Example {
  save() {}
}`;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsSection],
  template: `
    <h1>Installation</h1>
    <p class="docs-lead">SwipyUI works with Angular 22 and newer.</p>

    <docs-section
      title="Download"
      description="Install the package and its Angular CDK peer dependency from npm."
      [code]="installCode"
      language="bash"
    >
      <code>npm install &#64;swipergy/swipyui &#64;angular/cdk</code>
    </docs-section>

    <docs-section
      title="Theme"
      description="Import the default theme once, globally. All components are styled through its design tokens."
      [code]="themeCode"
      language="scss"
    >
      <code>&#64;import "&#64;swipergy/swipyui/themes/default/default.css";</code>
    </docs-section>

    <docs-section
      title="Usage"
      description="Import components from their own entry points and use them in any standalone component."
      [code]="usageCode"
      language="typescript"
    >
      <code>import {{ '{' }} Button {{ '}' }} from '&#64;swipergy/swipyui/button';</code>
    </docs-section>
  `,
})
export class Installation {
  readonly installCode = INSTALL_CODE;
  readonly themeCode = THEME_CODE;
  readonly usageCode = USAGE_CODE;
}
