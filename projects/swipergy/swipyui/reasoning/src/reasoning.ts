import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  effect,
  input,
  model,
  untracked,
} from '@angular/core';
import { uniqueId } from '@swipergy/swipyui/core';

/**
 * Collapsible block holding an agent's intermediate reasoning. While `active`
 * the header animates and the block reports itself as busy; once the model
 * moves on, an optional `duration` records how long it thought.
 *
 * ```html
 * <syui-reasoning [active]="thinking()" [duration]="elapsed()" autoCollapse>
 *   {{ reasoningText() }}
 * </syui-reasoning>
 * ```
 */
@Component({
  selector: 'syui-reasoning',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './reasoning.css',
  host: {
    class: 'syui-reasoning',
    '[class.syui-reasoning-active]': 'active()',
    '[class.syui-reasoning-collapsed]': 'collapsed()',
    '[attr.aria-busy]': 'active() || null',
  },
  template: `
    <button
      type="button"
      class="syui-reasoning-toggle"
      [attr.aria-expanded]="!collapsed()"
      [attr.aria-controls]="collapsed() ? null : bodyId"
      (click)="collapsed.set(!collapsed())"
    >
      <svg class="syui-reasoning-chevron" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path
          d="M2.5 4.5L6 8L9.5 4.5"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <span class="syui-reasoning-label">{{ headerLabel() }}</span>
      @if (formattedDuration(); as duration) {
        <span class="syui-reasoning-duration">{{ duration }}</span>
      }
    </button>
    @if (!collapsed()) {
      <div class="syui-reasoning-body" [id]="bodyId">
        <ng-content />
      </div>
    }
  `,
})
export class Reasoning {
  /** Header text once the reasoning is complete. */
  readonly label = input('Reasoning');
  /** Header text while `active`. */
  readonly activeLabel = input('Thinking…');
  /** True while reasoning tokens are still streaming in. */
  readonly active = input(false, { transform: booleanAttribute });
  /** How long the model reasoned, in seconds. */
  readonly duration = input<number>();
  /** Whether the reasoning is hidden; supports two-way binding. */
  readonly collapsed = model(true);
  /** Collapses the block automatically when `active` turns false. */
  readonly autoCollapse = input(false, { transform: booleanAttribute });

  protected readonly bodyId = uniqueId('syui-reasoning-body');

  protected readonly headerLabel = computed(() =>
    this.active() ? this.activeLabel() : this.label(),
  );

  protected readonly formattedDuration = computed(() => {
    const seconds = this.duration();
    if (this.active() || seconds === undefined || Number.isNaN(seconds)) {
      return null;
    }
    return seconds < 60
      ? `${seconds < 10 ? seconds.toFixed(1) : Math.round(seconds)} s`
      : `${Math.floor(seconds / 60)} min ${Math.round(seconds % 60)} s`;
  });

  constructor() {
    let wasActive = false;
    effect(() => {
      const active = this.active();
      if (wasActive && !active && untracked(this.autoCollapse)) {
        this.collapsed.set(true);
      }
      wasActive = active;
    });
  }
}
