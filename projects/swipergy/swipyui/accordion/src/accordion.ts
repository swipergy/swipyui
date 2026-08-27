import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChildren,
  forwardRef,
  inject,
  input,
  model,
} from '@angular/core';
import { uniqueId } from '@swipergy/swipyui/core';

/**
 * One collapsible panel inside `<syui-accordion>`; the projected content is
 * shown while the panel is expanded.
 */
@Component({
  selector: 'syui-accordion-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'syui-accordion-panel',
    '[class.syui-accordion-panel-active]': 'active()',
  },
  template: `
    <h3 class="syui-accordion-header">
      <button
        type="button"
        class="syui-accordion-toggle"
        [id]="headerId"
        [attr.aria-expanded]="active()"
        [attr.aria-controls]="active() ? contentId : null"
        [disabled]="disabled()"
        (click)="accordion.toggle(this)"
        (keydown)="accordion.onHeaderKeydown($event, this)"
      >
        <span class="syui-accordion-title">{{ header() }}</span>
        <svg class="syui-accordion-chevron" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path
            d="M2.5 4.5L6 8L9.5 4.5"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </h3>
    @if (active()) {
      <div
        class="syui-accordion-content"
        role="region"
        [id]="contentId"
        [attr.aria-labelledby]="headerId"
      >
        <ng-content />
      </div>
    }
  `,
})
export class AccordionPanel {
  /** Identifies this panel within the parent `value`. */
  readonly value = input.required<unknown>();
  /** Text shown in the panel header button. */
  readonly header = input.required<string>();
  readonly disabled = input(false, { transform: booleanAttribute });

  readonly headerId = uniqueId('syui-accordion-header');
  readonly contentId = uniqueId('syui-accordion-content');

  protected readonly accordion = inject<Accordion>(forwardRef(() => Accordion));

  readonly active = computed(() => {
    const value = this.accordion.value();
    return Array.isArray(value) ? value.includes(this.value()) : value === this.value();
  });
}

/**
 * Vertically stacked set of collapsible panels implementing the WAI-ARIA
 * accordion pattern: Enter/Space toggles, ArrowUp/ArrowDown move between
 * headers, Home/End jump to the first/last header.
 *
 * `value` holds the expanded panel's value — or an array of values when
 * `multiple` allows several panels to be open at once.
 *
 * ```html
 * <syui-accordion [(value)]="open">
 *   <syui-accordion-panel value="shipping" header="Shipping">…</syui-accordion-panel>
 *   <syui-accordion-panel value="billing" header="Billing">…</syui-accordion-panel>
 * </syui-accordion>
 * ```
 */
@Component({
  selector: 'syui-accordion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './accordion.css',
  host: { class: 'syui-accordion' },
  template: `<ng-content />`,
})
export class Accordion {
  /** Value(s) of the expanded panel(s); supports two-way binding. */
  readonly value = model<unknown | unknown[]>();
  /** Allows several panels to be expanded at once; `value` becomes an array. */
  readonly multiple = input(false, { transform: booleanAttribute });

  private readonly panels = contentChildren(AccordionPanel);

  /** Expands the panel if collapsed, collapses it if expanded. */
  toggle(panel: AccordionPanel): void {
    if (panel.disabled()) {
      return;
    }
    const value = panel.value();
    if (this.multiple()) {
      const current = this.value();
      const open = Array.isArray(current) ? current : current === undefined ? [] : [current];
      this.value.set(
        open.includes(value) ? open.filter((v) => v !== value) : [...open, value],
      );
    } else {
      this.value.set(this.value() === value ? undefined : value);
    }
  }

  onHeaderKeydown(event: KeyboardEvent, panel: AccordionPanel): void {
    const panels = this.panels().filter((p) => !p.disabled());
    if (!panels.length) {
      return;
    }
    const current = Math.max(panels.indexOf(panel), 0);
    let next: number;
    switch (event.key) {
      case 'ArrowDown':
        next = (current + 1) % panels.length;
        break;
      case 'ArrowUp':
        next = (current - 1 + panels.length) % panels.length;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = panels.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    document.getElementById(panels[next].headerId)?.focus();
  }
}
