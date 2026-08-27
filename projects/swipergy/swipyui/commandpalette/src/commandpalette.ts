import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
  afterRenderEffect,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { A11yModule } from '@angular/cdk/a11y';
import { uniqueId, type MenuItem } from '@swipergy/swipyui/core';

/** Command shown in the palette; activating it runs `command` and closes. */
export interface CommandPaletteItem extends MenuItem {
  /** Heading the command is listed under; groups appear in first-seen order. */
  group?: string;
  /** Shortcut hint rendered at the right edge, e.g. '⌘ S'. */
  shortcut?: string;
  /** Extra search terms matched in addition to the label. */
  keywords?: string;
}

/**
 * Searchable command dialog opened with Ctrl/⌘+K (or the `visible` model):
 * typing filters the commands, arrow keys navigate, Enter runs the active
 * command and closes. Commands can carry a group heading, an icon, extra
 * search keywords and a shortcut hint.
 *
 * ```html
 * <syui-commandpalette [items]="commands" />
 * ```
 */
@Component({
  selector: 'syui-commandpalette',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './commandpalette.css',
  imports: [A11yModule],
  host: {
    '(document:keydown)': 'onDocumentKeydown($event)',
  },
  template: `
    <ng-template #panel>
      <div
        class="syui-commandpalette"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="ariaLabel()"
        [style.width]="width()"
        cdkTrapFocus
        cdkTrapFocusAutoCapture
        (keydown.escape)="close()"
      >
        <div class="syui-commandpalette-search">
          <svg class="syui-commandpalette-search-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="7" cy="7" r="4.5" stroke="currentColor" stroke-width="1.5" />
            <path d="M10.5 10.5L14 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
          <input
            type="text"
            class="syui-commandpalette-input"
            role="combobox"
            aria-expanded="true"
            aria-autocomplete="list"
            [attr.aria-controls]="listId"
            [attr.aria-activedescendant]="activeIndex() >= 0 ? optionId(activeIndex()) : null"
            [attr.aria-label]="placeholder()"
            [placeholder]="placeholder()"
            [value]="query()"
            (input)="onInput($event)"
            (keydown)="onKeydown($event)"
          />
        </div>
        <div class="syui-commandpalette-status" aria-live="polite">{{ statusMessage() }}</div>
        <div class="syui-commandpalette-list" role="listbox" [id]="listId">
          @for (group of groups(); track group.label) {
            @if (group.label) {
              <div class="syui-commandpalette-group" role="presentation">{{ group.label }}</div>
            }
            @for (entry of group.entries; track entry.index) {
              <div
                class="syui-commandpalette-option"
                role="option"
                [id]="optionId(entry.index)"
                [class.syui-commandpalette-option-active]="entry.index === activeIndex()"
                [class.syui-commandpalette-option-disabled]="entry.item.disabled"
                [attr.aria-selected]="entry.index === activeIndex()"
                [attr.aria-disabled]="entry.item.disabled || null"
                (click)="activate(entry.item, $event)"
                (mousemove)="entry.item.disabled || activeIndex.set(entry.index)"
              >
                @if (entry.item.icon) {
                  <i class="syui-commandpalette-option-icon" [class]="entry.item.icon" aria-hidden="true"></i>
                }
                <span class="syui-commandpalette-option-label">{{ entry.item.label }}</span>
                @if (entry.item.shortcut) {
                  <kbd class="syui-commandpalette-option-shortcut">{{ entry.item.shortcut }}</kbd>
                }
              </div>
            }
          } @empty {
            <div class="syui-commandpalette-empty">{{ emptyMessage() }}</div>
          }
        </div>
      </div>
    </ng-template>
  `,
})
export class CommandPalette implements OnDestroy {
  /** Controls palette visibility; supports two-way binding. */
  readonly visible = model(false);
  /** Commands offered by the palette. */
  readonly items = input<CommandPaletteItem[]>([]);
  readonly placeholder = input('Type a command or search…');
  readonly emptyMessage = input('No results found');
  /** Opens/closes the palette with Ctrl+K or ⌘+K. */
  readonly hotkey = input(true, { transform: booleanAttribute });
  readonly width = input('36rem');
  /** Accessible name of the dialog, e.g. for translation. */
  readonly ariaLabel = input('Command palette');

  @ViewChild('panel', { static: true })
  private panelTemplate!: TemplateRef<unknown>;

  private readonly overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private overlayRef?: OverlayRef;
  private previouslyFocused?: HTMLElement;

  protected readonly listId = uniqueId('syui-commandpalette');
  protected readonly query = signal('');
  protected readonly activeIndex = signal(0);

  /** Matching commands bucketed by group label, in first-seen group order. */
  protected readonly groups = computed(() => {
    const query = this.query().trim().toLowerCase();
    const buckets = new Map<string, CommandPaletteItem[]>();
    for (const item of this.items()) {
      if (item.visible === false || item.separator || (query && !this.matches(item, query))) {
        continue;
      }
      const label = item.group ?? '';
      buckets.has(label) ? buckets.get(label)!.push(item) : buckets.set(label, [item]);
    }
    let index = 0;
    return Array.from(buckets, ([label, items]) => ({
      label,
      entries: items.map((item) => ({ item, index: index++ })),
    }));
  });

  /** Matching commands in display order, indexed by the option ids. */
  protected readonly flatItems = computed(() =>
    this.groups().flatMap((group) => group.entries.map((entry) => entry.item)),
  );

  /** Result count announced to screen readers whenever the filter changes. */
  protected readonly statusMessage = computed(() => {
    const count = this.flatItems().length;
    return count === 1 ? '1 result' : `${count} results`;
  });

  constructor() {
    effect(() => {
      this.visible() ? this.attach() : this.detach();
    });
    afterRenderEffect(() => {
      const index = this.activeIndex();
      if (this.visible() && index >= 0) {
        document.getElementById(this.optionId(index))?.scrollIntoView({ block: 'nearest' });
      }
    });
  }

  protected optionId(index: number): string {
    return `${this.listId}-option-${index}`;
  }

  protected close(): void {
    this.visible.set(false);
  }

  protected activate(item: CommandPaletteItem, originalEvent?: Event): void {
    if (item.disabled) {
      return;
    }
    item.command?.({ originalEvent, item });
    this.close();
  }

  protected onInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.activeIndex.set(this.firstEnabled());
  }

  protected onDocumentKeydown(event: KeyboardEvent): void {
    if (
      this.hotkey() &&
      (event.metaKey || event.ctrlKey) &&
      !event.altKey &&
      event.key.toLowerCase() === 'k'
    ) {
      event.preventDefault();
      this.visible.update((visible) => !visible);
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.moveActive(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.moveActive(-1);
        break;
      case 'Home':
        event.preventDefault();
        this.activeIndex.set(this.firstEnabled());
        break;
      case 'End':
        event.preventDefault();
        this.moveActive(-1, 0);
        break;
      case 'Enter': {
        event.preventDefault();
        const item = this.flatItems()[this.activeIndex()];
        if (item) {
          this.activate(item, event);
        }
        break;
      }
    }
  }

  private matches(item: CommandPaletteItem, query: string): boolean {
    const haystack = `${item.label ?? ''} ${item.keywords ?? ''}`.toLowerCase();
    return haystack.includes(query);
  }

  private firstEnabled(): number {
    return this.flatItems().findIndex((item) => !item.disabled);
  }

  /** Moves the active option by delta with wrap-around, skipping disabled commands. */
  private moveActive(delta: number, from = this.activeIndex()): void {
    const items = this.flatItems();
    let index = from;
    for (let step = 0; step < items.length; step++) {
      index = (index + delta + items.length) % items.length;
      if (!items[index].disabled) {
        this.activeIndex.set(index);
        return;
      }
    }
  }

  private attach(): void {
    if (this.overlayRef?.hasAttached()) {
      return;
    }
    this.previouslyFocused = (document.activeElement as HTMLElement) ?? undefined;
    this.query.set('');
    this.overlayRef ??= this.createOverlay();
    this.overlayRef.attach(new TemplatePortal(this.panelTemplate, this.viewContainerRef));
    this.activeIndex.set(this.firstEnabled());
  }

  private detach(): void {
    if (!this.overlayRef?.hasAttached()) {
      return;
    }
    this.overlayRef.detach();
    this.previouslyFocused?.focus();
    this.previouslyFocused = undefined;
  }

  private createOverlay(): OverlayRef {
    const overlayRef = this.overlay.create({
      positionStrategy: this.overlay.position().global().centerHorizontally().top('15vh'),
      scrollStrategy: this.overlay.scrollStrategies.block(),
      hasBackdrop: true,
      backdropClass: 'syui-commandpalette-mask',
    });
    overlayRef.backdropClick().subscribe(() => this.close());
    return overlayRef;
  }

  ngOnDestroy(): void {
    this.overlayRef?.dispose();
  }
}
