import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  TemplateRef,
  ViewContainerRef,
  ViewEncapsulation,
  afterNextRender,
  afterRenderEffect,
  booleanAttribute,
  computed,
  forwardRef,
  inject,
  input,
  numberAttribute,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { BaseValueControl, uniqueId } from '@swipergy/swipyui/core';
import type { SelectOption } from '@swipergy/swipyui/select';

/**
 * Multi-select dropdown following the WAI-ARIA combobox pattern: the trigger
 * keeps focus, options render as a multiselectable listbox with checkboxes,
 * arrow keys navigate, Space/Enter toggles the active option (the panel stays
 * open), Escape closes. The trigger shows the selected labels comma-joined,
 * "n items selected" past `maxSelectedLabels`, or removable chips with
 * `display="chip"`; chips never widen the trigger — the ones that don't fit
 * collapse into a "+n" chip. Options can be filtered and toggled all at once.
 *
 * Implements the signal forms value contract, so it binds directly to a
 * field, and stays compatible with reactive and template-driven forms:
 *
 * ```html
 * <syui-multiselect [options]="cities" placeholder="Select cities" [formField]="f.cities" />
 * <syui-multiselect [options]="cities" filter display="chip" [formControl]="cities" />
 * <syui-multiselect [options]="cities" [(value)]="cities" />
 * ```
 */
@Component({
  selector: 'syui-multiselect',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './multiselect.css',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => MultiSelect), multi: true },
  ],
  template: `
    <div
      #trigger
      class="syui-multiselect"
      role="combobox"
      aria-haspopup="listbox"
      [class.syui-fluid]="fluid()"
      [class.syui-invalid]="showInvalid()"
      [class.syui-multiselect-open]="open()"
      [class.syui-multiselect-disabled]="isDisabled()"
      [class.syui-multiselect-chip]="display() === 'chip'"
      [attr.tabindex]="isDisabled() ? null : 0"
      [attr.aria-expanded]="open()"
      [attr.aria-controls]="open() ? listboxId : null"
      [attr.aria-activedescendant]="open() && activeIndex() >= 0 ? optionId(activeIndex()) : null"
      [attr.aria-label]="ariaLabel() || null"
      [attr.aria-labelledby]="ariaLabelledby() || null"
      [attr.aria-describedby]="ariaDescribedby() || null"
      [attr.aria-invalid]="showInvalid() || null"
      [attr.aria-disabled]="isDisabled() || null"
      (click)="toggle()"
      (keydown)="onTriggerKeydown($event)"
      (blur)="onTouched()"
    >
      @if (selectedOptions().length === 0) {
        <span class="syui-multiselect-label syui-multiselect-placeholder">{{ placeholder() }}</span>
      } @else if (display() === 'chip') {
        <span class="syui-multiselect-chips" #chipsContainer>
          @for (option of visibleChipOptions(); track $index) {
            <span class="syui-multiselect-chip-item">
              <span class="syui-multiselect-chip-label">{{ option.label }}</span>
              <button
                type="button"
                class="syui-multiselect-chip-remove"
                [attr.aria-label]="'Remove ' + option.label"
                [disabled]="isDisabled()"
                (click)="removeOption(option, $event)"
              >
                <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path
                    d="M3 3L9 9M9 3L3 9"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                  />
                </svg>
              </button>
            </span>
          }
          @if (overflowCount() > 0) {
            <span
              class="syui-multiselect-chip-item syui-multiselect-chip-overflow"
              [attr.title]="overflowLabels()"
              >+{{ overflowCount() }}</span
            >
          }
        </span>
        <span class="syui-multiselect-chips syui-multiselect-chips-measure" #chipsMeasure aria-hidden="true">
          @for (option of selectedOptions(); track $index) {
            <span class="syui-multiselect-chip-item">
              <span class="syui-multiselect-chip-label">{{ option.label }}</span>
              <span class="syui-multiselect-chip-remove">
                <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path
                    d="M3 3L9 9M9 3L3 9"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                  />
                </svg>
              </span>
            </span>
          }
          <span class="syui-multiselect-chip-item syui-multiselect-chip-overflow"
            >+{{ selectedOptions().length }}</span
          >
        </span>
      } @else {
        <span class="syui-multiselect-label">{{ triggerLabel() }}</span>
      }
      <svg class="syui-multiselect-chevron" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path
          d="M2.5 4.5L6 8L9.5 4.5"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </div>

    <ng-template #panel>
      <div class="syui-multiselect-panel">
        @if (showToggleAll() || filter()) {
          <div class="syui-multiselect-header">
            @if (showToggleAll()) {
              <label class="syui-multiselect-toggle-all-label">
                <input
                  type="checkbox"
                  class="syui-multiselect-toggle-all"
                  aria-label="Toggle all"
                  [checked]="allSelected()"
                  [indeterminate]="someSelected()"
                  (change)="toggleAll()"
                />
              </label>
            }
            @if (filter()) {
              <input
                #filterInput
                type="text"
                class="syui-multiselect-filter"
                role="searchbox"
                aria-label="Filter options"
                [attr.aria-controls]="listboxId"
                [attr.aria-activedescendant]="activeIndex() >= 0 ? optionId(activeIndex()) : null"
                [placeholder]="filterPlaceholder()"
                [value]="filterValue()"
                (input)="onFilterInput($event)"
                (keydown)="onFilterKeydown($event)"
              />
            }
          </div>
        }
        <ul class="syui-multiselect-list" role="listbox" aria-multiselectable="true" [id]="listboxId">
          @for (option of visibleOptions(); track $index) {
            <li
              class="syui-multiselect-option"
              role="option"
              [id]="optionId($index)"
              [class.syui-multiselect-option-active]="$index === activeIndex()"
              [class.syui-multiselect-option-selected]="isSelected(option)"
              [class.syui-multiselect-option-disabled]="option.disabled"
              [attr.aria-selected]="isSelected(option)"
              [attr.aria-disabled]="option.disabled || null"
              (click)="toggleOption(option)"
              (mouseenter)="activeIndex.set($index)"
            >
              <span class="syui-multiselect-checkbox" aria-hidden="true">
                @if (isSelected(option)) {
                  <svg viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2.5 6.5L5 9L9.5 3.5"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                }
              </span>
              <span class="syui-multiselect-option-label">{{ option.label }}</span>
            </li>
          } @empty {
            <li class="syui-multiselect-empty">{{ emptyMessage() }}</li>
          }
        </ul>
        @if (filter()) {
          <span class="syui-sr-only" role="status">{{ filterStatus() }}</span>
        }
      </div>
    </ng-template>
  `,
})
export class MultiSelect extends BaseValueControl<unknown[]> {
  readonly options = input<SelectOption[]>([]);
  readonly placeholder = input('Select…');
  readonly emptyMessage = input('No options');
  /** How selected values render in the trigger: joined labels or removable chips. */
  readonly display = input<'comma' | 'chip'>('comma');
  /** Above this many selections the trigger shows "n items selected" instead of labels. */
  readonly maxSelectedLabels = input(3, { transform: numberAttribute });
  /** Shows a search box at the top of the panel that filters the options. */
  readonly filter = input(false, { transform: booleanAttribute });
  readonly filterPlaceholder = input('Search…');
  /** Shows a select-all checkbox in the panel header. */
  readonly showToggleAll = input(true, { transform: booleanAttribute });
  /** Stretches the trigger to the width of its container. */
  readonly fluid = input(false, { transform: booleanAttribute });
  readonly onShow = output<void>();
  readonly onHide = output<void>();

  private readonly trigger = viewChild.required<ElementRef<HTMLElement>>('trigger');
  private readonly panelTemplate = viewChild.required<TemplateRef<unknown>>('panel');
  private readonly filterInput = viewChild<ElementRef<HTMLInputElement>>('filterInput');
  private readonly chipsContainer = viewChild<ElementRef<HTMLElement>>('chipsContainer');
  private readonly chipsMeasure = viewChild<ElementRef<HTMLElement>>('chipsMeasure');

  private readonly overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private overlayRef?: OverlayRef;

  protected readonly listboxId = uniqueId('syui-multiselect-listbox');
  protected readonly open = signal(false);
  protected readonly activeIndex = signal(-1);
  protected readonly filterValue = signal('');

  /** Trigger width tracked by a ResizeObserver so chips re-fit on resize. */
  private readonly triggerWidth = signal(0);
  /** How many chips fit the trigger; Infinity until a measurement limits it. */
  private readonly visibleChipCount = signal(Infinity);

  /** Selected options in the order they appear in `options`. */
  protected readonly selectedOptions = computed(() => {
    const selected = this.value() ?? [];
    return this.options().filter((option) => selected.includes(option.value));
  });

  /** Chips actually rendered in the trigger; the rest collapse into "+n". */
  protected readonly visibleChipOptions = computed(() => {
    const selected = this.selectedOptions();
    const count = this.visibleChipCount();
    return count >= selected.length ? selected : selected.slice(0, count);
  });

  protected readonly overflowCount = computed(
    () => this.selectedOptions().length - this.visibleChipOptions().length,
  );

  /** Labels hidden behind the "+n" chip, surfaced as its tooltip. */
  protected readonly overflowLabels = computed(() =>
    this.selectedOptions()
      .slice(this.visibleChipOptions().length)
      .map((option) => option.label)
      .join(', '),
  );

  /** Options currently shown in the panel, narrowed by the filter query. */
  protected readonly visibleOptions = computed(() => {
    const query = this.filterValue().trim().toLowerCase();
    const options = this.options();
    return query ? options.filter((o) => o.label.toLowerCase().includes(query)) : options;
  });

  protected readonly triggerLabel = computed(() => {
    const selected = this.selectedOptions();
    return selected.length > this.maxSelectedLabels()
      ? `${selected.length} items selected`
      : selected.map((option) => option.label).join(', ');
  });

  /** Politely announced so screen readers hear how many options the filter left. */
  protected readonly filterStatus = computed(() => {
    const count = this.visibleOptions().length;
    return count === 1 ? '1 result available' : `${count} results available`;
  });

  private readonly enabledVisible = computed(() =>
    this.visibleOptions().filter((option) => !option.disabled),
  );

  protected readonly allSelected = computed(() => {
    const enabled = this.enabledVisible();
    return enabled.length > 0 && enabled.every((option) => this.isSelected(option));
  });

  protected readonly someSelected = computed(
    () => !this.allSelected() && this.enabledVisible().some((option) => this.isSelected(option)),
  );

  constructor() {
    super();
    const destroyRef = inject(DestroyRef);
    destroyRef.onDestroy(() => this.overlayRef?.dispose());
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(() =>
        this.triggerWidth.set(this.trigger().nativeElement.clientWidth),
      );
      afterNextRender(() => observer.observe(this.trigger().nativeElement));
      destroyRef.onDestroy(() => observer.disconnect());
    }
    afterRenderEffect(() => {
      this.selectedOptions();
      this.triggerWidth();
      this.visibleChipCount.set(this.fittingChipCount());
    });
  }

  /**
   * How many chips fit the trigger row next to the "+n" chip, measured
   * against the off-screen copy so natural chip widths are always available.
   * Infinity when everything fits or nothing is measurable (SSR, no layout).
   */
  private fittingChipCount(): number {
    const container = this.chipsContainer()?.nativeElement;
    const measure = this.chipsMeasure()?.nativeElement;
    if (!container || !measure) {
      return Infinity;
    }
    const available = container.clientWidth;
    const chips = Array.from(measure.children) as HTMLElement[];
    const badge = chips.pop();
    const last = chips[chips.length - 1];
    if (!badge || !last || available <= 0) {
      return Infinity;
    }
    if (last.offsetLeft + last.offsetWidth <= available) {
      return Infinity;
    }
    const gap =
      chips.length > 1 ? chips[1].offsetLeft - chips[0].offsetLeft - chips[0].offsetWidth : 0;
    const limit = available - badge.offsetWidth - gap;
    let count = 0;
    while (count < chips.length && chips[count].offsetLeft + chips[count].offsetWidth <= limit) {
      count++;
    }
    // Never hide every chip; a lone oversized chip ellipsizes instead.
    return Math.max(1, count);
  }

  protected optionId(index: number): string {
    return `${this.listboxId}-option-${index}`;
  }

  protected isSelected(option: SelectOption): boolean {
    return (this.value() ?? []).includes(option.value);
  }

  protected toggle(): void {
    if (this.isDisabled()) {
      return;
    }
    this.open() ? this.hide() : this.show();
  }

  protected show(): void {
    if (this.open()) {
      return;
    }
    this.overlayRef ??= this.createOverlay();
    this.overlayRef.attach(new TemplatePortal(this.panelTemplate(), this.viewContainerRef));
    this.open.set(true);
    this.activeIndex.set(this.firstEnabled(0, 1));
    if (this.filter()) {
      setTimeout(() => this.filterInput()?.nativeElement.focus());
    }
    this.onShow.emit();
  }

  protected hide(): void {
    if (!this.open()) {
      return;
    }
    this.overlayRef?.detach();
    this.open.set(false);
    this.filterValue.set('');
    this.onHide.emit();
  }

  /** Adds or removes the option's value; the panel stays open. */
  protected toggleOption(option: SelectOption): void {
    if (option.disabled || this.isDisabled()) {
      return;
    }
    const current = this.value() ?? [];
    this.updateValue(
      current.includes(option.value)
        ? current.filter((value) => value !== option.value)
        : [...current, option.value],
    );
  }

  protected removeOption(option: SelectOption, event: Event): void {
    event.stopPropagation();
    if (this.isDisabled()) {
      return;
    }
    this.updateValue((this.value() ?? []).filter((value) => value !== option.value));
    this.onTouched();
  }

  /** Selects every enabled visible option, or clears them all when already selected. */
  protected toggleAll(): void {
    const enabledValues = this.enabledVisible().map((option) => option.value);
    const current = this.value() ?? [];
    this.updateValue(
      this.allSelected()
        ? current.filter((value) => !enabledValues.includes(value))
        : [...current, ...enabledValues.filter((value) => !current.includes(value))],
    );
  }

  protected onFilterInput(event: Event): void {
    this.filterValue.set((event.target as HTMLInputElement).value);
    this.activeIndex.set(this.firstEnabled(0, 1));
  }

  protected onFilterKeydown(event: KeyboardEvent): void {
    // Space types into the filter; everything else shares the trigger handling.
    if (event.key !== ' ') {
      this.handleOpenKeydown(event);
    }
    event.stopPropagation();
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
    if (this.isDisabled()) {
      return;
    }
    const { key } = event;
    if (!this.open()) {
      if (key === 'ArrowDown' || key === 'ArrowUp' || key === 'Enter' || key === ' ') {
        event.preventDefault();
        this.show();
      }
      return;
    }
    this.handleOpenKeydown(event);
  }

  private handleOpenKeydown(event: KeyboardEvent): void {
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
        this.activeIndex.set(this.firstEnabled(0, 1));
        break;
      case 'End':
        event.preventDefault();
        this.activeIndex.set(this.firstEnabled(this.visibleOptions().length - 1, -1));
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (this.activeIndex() >= 0) {
          this.toggleOption(this.visibleOptions()[this.activeIndex()]);
        }
        break;
      case 'Escape':
      case 'Tab':
        this.hide();
        this.trigger().nativeElement.focus();
        break;
    }
  }

  private moveActive(delta: number): void {
    const options = this.visibleOptions();
    let index = this.activeIndex();
    for (let step = 0; step < options.length; step++) {
      index = (index + delta + options.length) % options.length;
      if (!options[index].disabled) {
        this.activeIndex.set(index);
        return;
      }
    }
  }

  private firstEnabled(start: number, delta: number): number {
    const options = this.visibleOptions();
    for (let i = start; i >= 0 && i < options.length; i += delta) {
      if (!options[i].disabled) {
        return i;
      }
    }
    return -1;
  }

  private createOverlay(): OverlayRef {
    const trigger = this.trigger();
    const overlayRef = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(trigger)
        .withPositions([
          { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
          { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
        ]),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      minWidth: trigger.nativeElement.offsetWidth,
    });
    overlayRef.outsidePointerEvents().subscribe((event) => {
      if (!trigger.nativeElement.contains(event.target as Node)) {
        this.hide();
      }
    });
    return overlayRef;
  }
}
