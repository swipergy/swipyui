import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocsSection } from '../../shared/docs-section';

const OVERRIDE_CODE = `/* styles.scss — after the theme import */
:root {
  /* Rebrand: swap the primary role to your own palette */
  --syui-primary: #0d9488;
  --syui-primary-hover: #0f766e;
  --syui-primary-active: #115e59;

  /* Or tune a single component */
  --syui-button-border-radius: 9999px;
}`;

const DARK_CODE = `// Toggle dark mode by flipping one class — all
// semantic tokens switch with it.
document.documentElement.classList.toggle('syui-dark');`;

const DARK_INIT_CODE = `<script>
  // in index.html <head>: honor the OS preference before first paint
  if (matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('syui-dark');
  }
</script>`;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsSection],
  template: `
    <h1>Theming</h1>
    <p class="docs-lead">
      SwipyUI styles everything through CSS custom properties in three layers: primitive tokens
      (raw palettes like <code>--syui-primary-500</code>), semantic tokens (roles like
      <code>--syui-primary</code> and <code>--syui-text-color</code>) and component tokens (like
      <code>--syui-button-border-radius</code>). Override any layer in your own stylesheet — no build
      step, no SCSS required.
    </p>

    <docs-section
      title="Customizing tokens"
      description="Override semantic tokens to rebrand every component at once, or component tokens for surgical changes."
      [code]="overrideCode"
      language="scss"
    >
      <code>--syui-primary: #0d9488;</code>
    </docs-section>

    <docs-section
      title="Dark mode"
      description="Dark mode is a class, not a separate stylesheet. Add syui-dark to the html or body element."
      [code]="darkCode"
      language="typescript"
    >
      <code>document.documentElement.classList.toggle('syui-dark')</code>
    </docs-section>

    <docs-section
      title="Honoring the OS preference"
      description="Apply the class before first paint to avoid a flash of the wrong scheme."
      [code]="darkInitCode"
      language="html"
    >
      <code>matchMedia('(prefers-color-scheme: dark)')</code>
    </docs-section>
  `,
})
export class Theming {
  readonly overrideCode = OVERRIDE_CODE;
  readonly darkCode = DARK_CODE;
  readonly darkInitCode = DARK_INIT_CODE;
}
