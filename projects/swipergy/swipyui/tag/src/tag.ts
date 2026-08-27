import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, input } from '@angular/core';

export type TagSeverity = 'secondary' | 'success' | 'info' | 'warn' | 'danger' | null;

/**
 * Small colored label categorizing content, e.g. a status column in a
 * table. Without a severity it uses the primary highlight colors.
 * Projected content overrides `value`.
 *
 * ```html
 * <syui-tag value="New" />
 * <syui-tag value="Out of stock" severity="danger" rounded />
 * ```
 */
@Component({
  selector: 'syui-tag',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './tag.css',
  host: {
    class: 'syui-tag',
    '[class.syui-tag-secondary]': "severity() === 'secondary'",
    '[class.syui-tag-success]': "severity() === 'success'",
    '[class.syui-tag-info]': "severity() === 'info'",
    '[class.syui-tag-warn]': "severity() === 'warn'",
    '[class.syui-tag-danger]': "severity() === 'danger'",
    '[class.syui-tag-rounded]': 'rounded()',
  },
  template: `
    <ng-content>
      <span class="syui-tag-label">{{ value() }}</span>
    </ng-content>
  `,
})
export class Tag {
  /** Text shown inside the tag. */
  readonly value = input<string>();
  readonly severity = input<TagSeverity>(null);
  /** Renders the tag as a fully rounded pill. */
  readonly rounded = input(false, { transform: booleanAttribute });
}
