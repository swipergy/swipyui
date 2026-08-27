import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from '@swipergy/swipyui/button';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Button],
  template: `
    <div class="landing">
      <h1>Swipy<span class="landing-accent">UI</span></h1>
      <p class="docs-lead">
        An Angular component library with design-token based theming. Standalone, signal-based
        components, styled out of the box — dark mode included.
      </p>
      <div class="landing-actions">
        <a routerLink="/installation">
          <syui-button label="Get Started" size="large" />
        </a>
        <a routerLink="/components/button">
          <syui-button label="Components" severity="secondary" variant="outlined" size="large" />
        </a>
      </div>
      <div class="landing-features">
        <div class="landing-feature">
          <h3>Design tokens</h3>
          <p>
            Every color, radius and spacing is a CSS custom property. Theme the whole library by
            overriding a handful of semantic tokens.
          </p>
        </div>
        <div class="landing-feature">
          <h3>Tree-shakable</h3>
          <p>
            Each component ships as its own entry point, so your bundle only contains what you use.
          </p>
        </div>
        <div class="landing-feature">
          <h3>Accessible</h3>
          <p>
            Built on the Angular CDK with WAI-ARIA patterns: focus traps, keyboard navigation and
            screen-reader announcements.
          </p>
        </div>
      </div>
    </div>
  `,
  styles: `
    .landing {
      padding-top: 3rem;
      text-align: center;

      h1 {
        font-size: 3rem;
      }
    }
    .landing-accent {
      color: var(--syui-primary);
    }
    .landing-actions {
      display: flex;
      justify-content: center;
      gap: 1rem;

      a {
        text-decoration: none;
      }
    }
    .landing-features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
      gap: 1.5rem;
      margin-top: 4rem;
      text-align: left;
    }
    .landing-feature {
      border: 1px solid var(--syui-content-border-color);
      border-radius: var(--syui-border-radius-xl);
      padding: 1.25rem;

      h3 {
        margin: 0 0 0.5rem;
      }
      p {
        margin: 0;
        color: var(--syui-text-muted-color);
      }
    }
  `,
})
export class Landing {}
