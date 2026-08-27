import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface PropRow {
  name: string;
  type: string;
  default?: string;
  description: string;
}

@Component({
  selector: 'docs-prop-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="docs-section">
      <h2 id="api">{{ title() }}</h2>
      <div class="docs-prop-table-wrapper">
        <table class="docs-prop-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Default</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            @for (prop of props(); track prop.name) {
              <tr>
                <td>
                  <code>{{ prop.name }}</code>
                </td>
                <td>
                  <code>{{ prop.type }}</code>
                </td>
                <td>
                  @if (prop.default) {
                    <code>{{ prop.default }}</code>
                  } @else {
                    <span class="docs-muted">—</span>
                  }
                </td>
                <td>{{ prop.description }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </section>
  `,
})
export class DocsPropTable {
  readonly title = input('API');
  readonly props = input.required<PropRow[]>();
}
