import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChildren,
  effect,
  forwardRef,
  inject,
  input,
  model,
} from '@angular/core';
import { uniqueId } from '@swipergy/swipyui/core';

/**
 * One tab inside `<syui-tabs>`; the projected content is its panel.
 */
@Component({
  selector: 'syui-tab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    @if (active()) {
      <div
        class="syui-tabs-panel"
        role="tabpanel"
        tabindex="0"
        [id]="panelId"
        [attr.aria-labelledby]="tabId"
      >
        <ng-content />
      </div>
    }
  `,
})
export class Tab {
  /** Identifies this tab within the parent `value`. */
  readonly value = input.required<unknown>();
  /** Text shown in the tab header. */
  readonly label = input.required<string>();
  readonly disabled = input(false, { transform: booleanAttribute });

  readonly tabId = uniqueId('syui-tab');
  readonly panelId = uniqueId('syui-tabpanel');

  private readonly tabs = inject<Tabs>(forwardRef(() => Tabs));

  readonly active = computed(() => this.tabs.value() === this.value());
}

/**
 * Tab container implementing the WAI-ARIA tabs pattern with a roving
 * tabindex: arrow keys move and activate, Home/End jump.
 *
 * ```html
 * <syui-tabs [(value)]="active">
 *   <syui-tab value="general" label="General">…</syui-tab>
 *   <syui-tab value="security" label="Security">…</syui-tab>
 * </syui-tabs>
 * ```
 */
@Component({
  selector: 'syui-tabs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './tabs.css',
  host: { class: 'syui-tabs' },
  template: `
    <div
      class="syui-tabs-nav"
      role="tablist"
      [attr.aria-label]="ariaLabel() || null"
      (keydown)="onKeydown($event)"
    >
      @for (tab of tabList(); track tab.tabId) {
        <button
          type="button"
          role="tab"
          class="syui-tabs-tab"
          [id]="tab.tabId"
          [class.syui-tabs-tab-active]="tab.active()"
          [attr.aria-selected]="tab.active()"
          [attr.aria-controls]="tab.active() ? tab.panelId : null"
          [tabindex]="tab.active() ? 0 : -1"
          [disabled]="tab.disabled()"
          (click)="select(tab)"
        >
          {{ tab.label() }}
        </button>
      }
    </div>
    <ng-content />
  `,
})
export class Tabs {
  /** Value of the active tab; supports two-way binding. */
  readonly value = model<unknown>();
  /** Accessible name of the tab list. */
  readonly ariaLabel = input<string>();

  protected readonly tabList = contentChildren(Tab);

  constructor() {
    // default to the first enabled tab when no value is set
    effect(() => {
      const tabs = this.tabList();
      if (this.value() === undefined && tabs.length) {
        const first = tabs.find((tab) => !tab.disabled());
        if (first) {
          this.value.set(first.value());
        }
      }
    });
  }

  protected select(tab: Tab): void {
    if (!tab.disabled()) {
      this.value.set(tab.value());
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    const tabs = this.tabList().filter((tab) => !tab.disabled());
    if (!tabs.length) {
      return;
    }
    const current = Math.max(
      tabs.findIndex((tab) => tab.active()),
      0,
    );
    let next: number;
    switch (event.key) {
      case 'ArrowRight':
        next = (current + 1) % tabs.length;
        break;
      case 'ArrowLeft':
        next = (current - 1 + tabs.length) % tabs.length;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = tabs.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    const tab = tabs[next];
    this.value.set(tab.value());
    document.getElementById(tab.tabId)?.focus();
  }
}
