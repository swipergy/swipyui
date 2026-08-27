import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { MenuItem } from '@swipergy/swipyui/core';

interface BreadcrumbEntry {
  item: MenuItem;
  home: boolean;
}

/**
 * Breadcrumb trail built from `MenuItem`s: an optional `home` item (house
 * icon) followed by the `model` items, separated by chevrons. The last item
 * is the current page — rendered unlinked with `aria-current="page"`.
 *
 * ```html
 * <syui-breadcrumb [home]="{ routerLink: '/' }" [model]="items" />
 * ```
 */
@Component({
  selector: 'syui-breadcrumb',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './breadcrumb.css',
  imports: [NgTemplateOutlet, RouterLink],
  host: { class: 'syui-breadcrumb' },
  template: `
    <ng-template #itemContent let-entry>
      @if (entry.home) {
        <svg class="syui-breadcrumb-home-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M2.5 7.5L8 2.5l5.5 5V13a.5.5 0 0 1-.5.5H9.75V10h-3.5v3.5H3a.5.5 0 0 1-.5-.5V7.5Z"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linejoin="round"
          />
        </svg>
      } @else if (entry.item.icon) {
        <i class="syui-breadcrumb-icon" [class]="entry.item.icon" aria-hidden="true"></i>
      }
      @if (entry.item.label) {
        <span class="syui-breadcrumb-label">{{ entry.item.label }}</span>
      }
    </ng-template>

    <nav [attr.aria-label]="ariaLabel()">
      <ol class="syui-breadcrumb-list">
        @for (entry of entries(); track $index; let last = $last) {
          <li class="syui-breadcrumb-item">
            @if (last) {
              <span class="syui-breadcrumb-current" aria-current="page">
                <ng-container *ngTemplateOutlet="itemContent; context: { $implicit: entry }" />
              </span>
            } @else if (entry.item.routerLink && !entry.item.disabled) {
              <a
                class="syui-breadcrumb-link"
                [routerLink]="entry.item.routerLink"
                (click)="onItemClick($event, entry.item)"
              >
                <ng-container *ngTemplateOutlet="itemContent; context: { $implicit: entry }" />
              </a>
            } @else if (entry.item.url && !entry.item.disabled) {
              <a
                class="syui-breadcrumb-link"
                [attr.href]="entry.item.url"
                [attr.target]="entry.item.target || null"
                (click)="onItemClick($event, entry.item)"
              >
                <ng-container *ngTemplateOutlet="itemContent; context: { $implicit: entry }" />
              </a>
            } @else {
              <a
                class="syui-breadcrumb-link"
                role="link"
                [class.syui-breadcrumb-link-disabled]="entry.item.disabled"
                [attr.aria-disabled]="entry.item.disabled || null"
                [attr.tabindex]="entry.item.disabled ? null : 0"
                (click)="onItemClick($event, entry.item)"
                (keydown.enter)="onItemClick($event, entry.item)"
              >
                <ng-container *ngTemplateOutlet="itemContent; context: { $implicit: entry }" />
              </a>
            }
          </li>
          @if (!last) {
            <li class="syui-breadcrumb-separator" aria-hidden="true">
              <svg viewBox="0 0 12 12" fill="none">
                <path
                  d="M4.5 2.5L8 6L4.5 9.5"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </li>
          }
        }
      </ol>
    </nav>
  `,
})
export class Breadcrumb {
  /** Trail items in order; the last one is the current page. */
  readonly model = input<MenuItem[]>([]);
  /** Optional first item, rendered with a house icon. */
  readonly home = input<MenuItem>();
  readonly ariaLabel = input('Breadcrumb');

  protected readonly entries = computed<BreadcrumbEntry[]>(() => {
    const entries: BreadcrumbEntry[] = [];
    const home = this.home();
    if (home && home.visible !== false) {
      entries.push({ item: home, home: true });
    }
    for (const item of this.model()) {
      if (item.visible !== false && !item.separator) {
        entries.push({ item, home: false });
      }
    }
    return entries;
  });

  protected onItemClick(event: Event, item: MenuItem): void {
    if (item.disabled) {
      event.preventDefault();
      return;
    }
    item.command?.({ originalEvent: event, item });
  }
}
