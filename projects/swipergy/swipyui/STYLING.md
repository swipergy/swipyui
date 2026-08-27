# Styling SwipyUI

SwipyUI is styled entirely through CSS custom properties ("design tokens"). There is no Sass to compile and no build-time theme step: you override tokens in your own stylesheet, and every component that references them updates — in light and dark mode.

This manual covers how the token system is layered, how to customize anything from the brand color to a single component, and how to write a theme of your own.

## Setup

Load the Angular CDK overlay styles and the default theme once, e.g. in `styles.scss`:

```scss
@import "@angular/cdk/overlay-prebuilt.css";
@import "@swipergy/swipyui/themes/default/default.css";
```

The theme file only defines variables and a few native form-field skins — it does not style your app's own elements.

## The three token layers

All tokens live on `:root` and are prefixed `--syui-`. They come in three layers, each referencing the one below:

| Layer | Examples | Purpose |
|---|---|---|
| 1. Primitive | `--syui-primary-500`, `--syui-surface-100`, `--syui-border-radius-md`, `--syui-shadow-lg` | Raw scales: color palettes, radii, shadows, motion, typography |
| 2. Semantic | `--syui-primary`, `--syui-text-color`, `--syui-content-border-color`, `--syui-overlay-background` | Role-based colors; this is the layer dark mode flips |
| 3. Component | `--syui-button-primary-background`, `--syui-dialog-padding`, `--syui-tag-font-size` | Fine-grained knobs per component |

Every component style resolves top-down with fallbacks:

```css
/* inside a component stylesheet */
background: var(--syui-tag-primary-background, var(--syui-highlight-background));
```

So a component token wins when you set it, otherwise the semantic token applies. Override at the **highest layer that achieves what you want**:

- Rebrand the whole library → primitive palette or semantic tokens
- Adjust a role everywhere (e.g. all borders) → semantic tokens
- Tweak one component → component tokens

## Recipes

### Change the brand color

Swap the primary palette (the default is indigo):

```css
:root {
  --syui-primary-50: #ecfdf5;
  --syui-primary-100: #d1fae5;
  --syui-primary-200: #a7f3d0;
  --syui-primary-300: #6ee7b7;
  --syui-primary-400: #34d399;
  --syui-primary-500: #10b981;
  --syui-primary-600: #059669;
  --syui-primary-700: #047857;
  --syui-primary-800: #065f46;
  --syui-primary-900: #064e3b;
  --syui-primary-950: #022c22;
}
```

Both modes pick it up automatically: light mode uses the 600/700/800 steps, dark mode the 200–400 steps.

### Change the font, radius or motion

```css
:root {
  --syui-font-family: "Inter", system-ui, sans-serif;
  --syui-border-radius-sm: 2px;
  --syui-border-radius-md: 4px;
  --syui-border-radius-lg: 6px;
  --syui-border-radius-xl: 8px;
  --syui-transition-duration: 0.15s; /* 0s disables most animations */
}
```

### Restyle a single component

Component tokens follow the pattern `--syui-<component>-<part>-<property>`. Each component's stylesheet is the reference for what it exposes (see "Discovering tokens" below).

```css
:root {
  --syui-button-border-radius: 9999px; /* pill buttons everywhere */
  --syui-dialog-padding: 1rem;
  --syui-card-shadow: none;
}
```

### Scope overrides to part of the page

Tokens inherit like any CSS custom property, so overrides can be scoped to a container instead of `:root`:

```css
.marketing-hero {
  --syui-button-primary-background: #000;
  --syui-button-primary-hover-background: #222;
}
```

Caveat: overlays (dialogs, selects, toasts, the command palette) render in a CDK overlay container attached to `<body>`, outside your container. Scope overlay tokens globally or via `.cdk-overlay-container`.

### Dark mode

Dark mode is a class, not a media query, so you decide when it applies. Add `syui-dark` to `<html>` or `<body>`:

```js
document.documentElement.classList.toggle('syui-dark');
```

To follow the OS preference:

```js
const dark = window.matchMedia('(prefers-color-scheme: dark)');
document.documentElement.classList.toggle('syui-dark', dark.matches);
dark.addEventListener('change', (e) =>
  document.documentElement.classList.toggle('syui-dark', e.matches));
```

Dark mode only remaps **semantic** tokens (plus a handful of component tokens). If you override a semantic token yourself, provide a dark value too:

```css
:root { --syui-content-border-color: #e2e8f0; }
.syui-dark { --syui-content-border-color: #334155; }
```

Prefer semantic references over hard-coded colors in your overrides — `var(--syui-surface-200)` stays wrong in dark mode, `var(--syui-content-border-color)` does not.

### Focus rings, disabled state, status colors

```css
:root {
  --syui-focus-ring-color: var(--syui-primary);
  --syui-focus-ring-width: 2px;
  --syui-focus-ring-offset: 2px;
  --syui-disabled-opacity: 0.6;

  /* Status roles used by tags, messages, toasts, buttons … */
  --syui-success-color: var(--syui-green-600);
  --syui-success-background: var(--syui-green-100);
  --syui-danger-color: var(--syui-red-600);
  --syui-danger-background: var(--syui-red-100);
}
```

## Writing your own theme

For anything beyond a few overrides, copy `themes/default/default.css` into your project, adjust it, and import your copy instead. The file is plain CSS organized into the three layers plus the native form-field skins (`.syui-inputtext`, `.syui-textarea`), and is the complete, authoritative token list.

Keep the structure: primitives on `:root`, light semantics on `:root`, dark semantics on `.syui-dark`, component tokens last.

## Discovering tokens

- **Theme file** — `@swipergy/swipyui/themes/default/default.css` lists every primitive and semantic token, and the component tokens that have theme-level defaults.
- **Component stylesheets** — each component reads its tokens with `var(--syui-<component>-…, fallback)`. Inspect an element in devtools (all styles are global, nothing is encapsulated) or read the component's CSS in the package to see the exact knobs.
- **Escape hatch** — components use `ViewEncapsulation.None` with stable, prefixed class names (`.syui-button`, `.syui-dialog-header`, `.syui-commandpalette-option`, …). When no token exists for what you need, target those classes directly in your stylesheet.

## Utility classes

- `syui-dark` — enables the dark semantic layer (set it on `<html>` or `<body>`).
- `syui-fluid` — stretches supporting form components to the width of their container.

## Accessibility (WCAG 2.2 AAA)

The default theme and the components are built to WCAG 2.2 Level AAA. The token system is part of that contract: the guarantees below hold as long as your overrides stay within the same thresholds.

### Contrast

The semantic color pairs in the default theme meet SC 1.4.6 (Contrast Enhanced): at least **7:1** for text against the background it is paired with (`--syui-text-color` on `--syui-surface-0`/`--syui-surface-50`, `--syui-text-muted-color` on content surfaces, `--syui-primary-contrast` on `--syui-primary`, and so on), in both light and dark mode. Non-text visuals that convey state — borders of inputs, focus rings, checkbox/switch fills, icons — keep at least **3:1** against their adjacent colors (SC 1.4.11).

When you override a color token, you take over that guarantee. Check the new pair with a contrast tool: text pairs ≥ 7:1, non-text state indicators ≥ 3:1 — and remember to check the dark values too.

### Focus rings

Every focusable part draws its focus indicator from three tokens:

```css
:root {
  --syui-focus-ring-color: var(--syui-primary);
  --syui-focus-ring-width: 2px;
  --syui-focus-ring-offset: 2px;
}
```

The defaults satisfy SC 2.4.13 (Focus Appearance): a solid outline at least 2 CSS px thick, offset from the control so it encloses it, with ≥ 3:1 contrast against the surrounding colors. Feel free to make the ring bolder; don't make it thinner than 2px, transparent, or a color that blends into your background.

### Target size

`--syui-target-size` (default `2.75rem` = 44 CSS px) is the minimum pointer-target size per SC 2.5.5 (Target Size, Enhanced). Interactive components size themselves with it: inputs and buttons set `min-height`/`min-width` from the token, and visually small controls (e.g. `.syui-button-small`, checkboxes, switches, close icons) keep their compact look but expand their *hit area* with an invisible pseudo-element overlay of `max(100%, var(--syui-target-size))`, so the clickable region is 44×44 even where the visual is not. Lowering the token below `2.75rem` breaks AAA conformance; raising it is always safe.

### Reduced motion

The theme ends with a `@media (prefers-reduced-motion: reduce)` block (SC 2.3.3, Animation from Interactions): it sets `--syui-transition-duration: 0s` and forces `animation-duration`/`transition-duration` to effectively zero on all `syui-` classes. Motion that is **essential** — a loading spinner that is itself the status indication — is exempt under the SC; components with essential motion re-enable a slowed, subtle variant inside their own reduced-motion block rather than freezing entirely. Follow the same pattern in your app: drive your own transitions from `var(--syui-transition-duration)` so they honor the preference for free, and only opt animation back in when the motion itself carries the meaning.

### Checklist for app authors

- **Label every control.** Prefer a visible `<label>` or the `ariaLabelledby` input; use the `ariaLabel` input when no visible label exists (icon-only buttons, dense toolbars). Wire help and error text to controls via the `ariaDescribedby` input.
- **Keep token overrides above the AAA thresholds** — 7:1 text contrast, 3:1 non-text contrast, ≥ 2px focus ring, ≥ 2.75rem target size.
- **Route custom motion through `--syui-transition-duration`** instead of hard-coded durations, so the reduced-motion media query covers your styles too.
- **Screen-reader-only text.** For text that should be spoken but not seen (e.g. extra context on an icon button), add the classic visually-hidden utility to your global stylesheet:

  ```css
  .syui-sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
    border: 0;
  }
  ```

  Don't use `display: none` or `visibility: hidden` for this — both remove the text from the accessibility tree.
