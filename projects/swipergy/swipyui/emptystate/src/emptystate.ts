import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  numberAttribute,
} from '@angular/core';

/**
 * Placeholder for views that have nothing to show yet — empty tables,
 * search results without matches or a cleared inbox. Shows an icon, a
 * header, a description and optional actions.
 *
 * The `icon` slot replaces the built-in illustration, the `actions` slot
 * renders buttons below the text:
 *
 * ```html
 * <syui-emptystate header="No projects" description="Create your first project to get started.">
 *   <syui-button slot="actions" label="New project" />
 * </syui-emptystate>
 * ```
 */
@Component({
  selector: 'syui-emptystate',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './emptystate.css',
  host: {
    class: 'syui-emptystate',
  },
  template: `
    <div class="syui-emptystate-icon" aria-hidden="true">
      <ng-content select="[slot=icon]">
        @if (icon()) {
          <i [class]="icon()"></i>
        } @else {
          <svg viewBox="0 0 48 48" fill="none">
            <path
              d="M6 28h10l3 5h10l3-5h10M6 28v10a2 2 0 0 0 2 2h32a2 2 0 0 0 2-2V28M6 28l6-18a2 2 0 0 1 1.9-1.4h20.2A2 2 0 0 1 36 10l6 18"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        }
      </ng-content>
    </div>
    @if (header()) {
      <div class="syui-emptystate-header" role="heading" [attr.aria-level]="headingLevel()">{{
        header()
      }}</div>
    }
    @if (description()) {
      <p class="syui-emptystate-description">{{ description() }}</p>
    }
    <div class="syui-emptystate-actions">
      <ng-content select="[slot=actions]" />
    </div>
  `,
})
export class EmptyState {
  /** Short headline stating that there is nothing to show. */
  readonly header = input<string>();
  /** Supporting text, e.g. how the user can fill the view. */
  readonly description = input<string>();
  /** Heading level of the header, matching the surrounding document outline. */
  readonly headingLevel = input(2, { transform: numberAttribute });
  /** CSS class(es) for a user-supplied icon font, replacing the built-in illustration. */
  readonly icon = input<string>();
}
