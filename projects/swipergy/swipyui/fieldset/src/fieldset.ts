import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  input,
  model,
} from '@angular/core';
import { uniqueId } from '@swipergy/swipyui/core';

/**
 * Grouping container built on the native `<fieldset>`/`<legend>` elements.
 * When `toggleable`, the legend becomes a button that collapses the content.
 *
 * ```html
 * <syui-fieldset legend="Address" toggleable [(collapsed)]="collapsed">
 *   Form fields…
 * </syui-fieldset>
 * ```
 */
@Component({
  selector: 'syui-fieldset',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './fieldset.css',
  host: {
    class: 'syui-fieldset',
    '[class.syui-fieldset-collapsed]': 'collapsed()',
  },
  template: `
    <fieldset class="syui-fieldset-frame">
      <legend class="syui-fieldset-legend">
        @if (toggleable()) {
          <button
            type="button"
            class="syui-fieldset-toggle"
            [attr.aria-expanded]="!collapsed()"
            [attr.aria-controls]="collapsed() ? null : contentId"
            (click)="collapsed.set(!collapsed())"
          >
            <svg class="syui-fieldset-chevron" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path
                d="M2.5 4.5L6 8L9.5 4.5"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            {{ legend() }}
          </button>
        } @else {
          <span class="syui-fieldset-label">{{ legend() }}</span>
        }
      </legend>
      @if (!collapsed()) {
        <div class="syui-fieldset-content" [id]="contentId">
          <ng-content />
        </div>
      }
    </fieldset>
  `,
})
export class Fieldset {
  /** Text shown in the legend. */
  readonly legend = input<string>();
  /** Turns the legend into a button that collapses the content. */
  readonly toggleable = input(false, { transform: booleanAttribute });
  /** Whether the content is collapsed; supports two-way binding. */
  readonly collapsed = model(false);

  protected readonly contentId = uniqueId('syui-fieldset-content');
}
