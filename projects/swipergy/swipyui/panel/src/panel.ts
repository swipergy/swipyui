import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  model,
} from '@angular/core';
import { uniqueId } from '@swipergy/swipyui/core';

/**
 * Bordered content container with a header bar; optionally collapsible via
 * a chevron button in the header. A footer is projected with the
 * `syui-panel-footer` attribute.
 *
 * ```html
 * <syui-panel header="Details" toggleable [(collapsed)]="collapsed">
 *   Body content
 *   <div syui-panel-footer>Footer actions</div>
 * </syui-panel>
 * ```
 */
@Component({
  selector: 'syui-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './panel.css',
  host: {
    class: 'syui-panel',
    '[class.syui-panel-collapsed]': 'collapsed()',
  },
  template: `
    <div class="syui-panel-header">
      <span class="syui-panel-title" [id]="headerId">{{ header() }}</span>
      @if (toggleable()) {
        <button
          type="button"
          class="syui-panel-toggle"
          [attr.aria-expanded]="!collapsed()"
          [attr.aria-controls]="collapsed() ? null : contentId"
          [attr.aria-label]="toggleLabel()"
          (click)="collapsed.set(!collapsed())"
        >
          <svg class="syui-panel-chevron" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path
              d="M2.5 4.5L6 8L9.5 4.5"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      }
    </div>
    @if (!collapsed()) {
      <div class="syui-panel-content" role="region" [id]="contentId" [attr.aria-labelledby]="headerId">
        <ng-content />
        <div class="syui-panel-footer">
          <ng-content select="[syui-panel-footer]" />
        </div>
      </div>
    }
  `,
})
export class Panel {
  /** Text shown in the header bar. */
  readonly header = input<string>();
  /** Shows a chevron button in the header that collapses the content. */
  readonly toggleable = input(false, { transform: booleanAttribute });
  /** Whether the content is collapsed; supports two-way binding. */
  readonly collapsed = model(false);

  protected readonly headerId = uniqueId('syui-panel-header');
  protected readonly contentId = uniqueId('syui-panel-content');

  /** Toggle button label naming the panel, e.g. "Collapse Details". */
  protected readonly toggleLabel = computed(() => {
    const action = this.collapsed() ? 'Expand' : 'Collapse';
    const header = this.header();
    return header ? `${action} ${header}` : action;
  });
}
