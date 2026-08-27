import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from '@angular/core';

/**
 * Content container with optional title, subtitle, header and footer.
 *
 * ```html
 * <syui-card title="Advanced" subtitle="For power users">
 *   Body content
 *   <div slot="footer">…</div>
 * </syui-card>
 * ```
 */
@Component({
  selector: 'syui-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './card.css',
  host: { class: 'syui-card' },
  template: `
    <ng-content select="[slot=header]" />
    <div class="syui-card-body">
      @if (title()) {
        <div class="syui-card-title">{{ title() }}</div>
      }
      @if (subtitle()) {
        <div class="syui-card-subtitle">{{ subtitle() }}</div>
      }
      <div class="syui-card-content">
        <ng-content />
      </div>
      <div class="syui-card-footer">
        <ng-content select="[slot=footer]" />
      </div>
    </div>
  `,
})
export class Card {
  readonly title = input<string>();
  readonly subtitle = input<string>();
}
