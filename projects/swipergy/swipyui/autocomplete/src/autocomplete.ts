import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  TemplateRef,
  ViewContainerRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  forwardRef,
  inject,
  input,
  linkedSignal,
  numberAttribute,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { BaseValueControl, uniqueId } from '@swipergy/swipyui/core';

/** Payload of the {@link Autocomplete.completeMethod} output. */
export interface AutocompleteCompleteEvent {
  /** The current input text ('' when triggered via the dropdown button). */
  query: string;
}

/**
 * Text input with a suggestion overlay following the WAI-ARIA combobox
 * pattern: focus stays on the input, the active suggestion is tracked with
 * aria-activedescendant, arrow keys navigate, Enter selects, Escape closes.
 * A polite live region announces how many results are available.
 *
 * The component never filters by itself — it emits `completeMethod`
 * (debounced ~250ms) with the current query and the parent supplies the
 * `suggestions` input, either plain strings or objects resolved through
 * `optionLabel`:
 *
 * ```html
 * <syui-autocomplete
 *   [suggestions]="filtered"
 *   (completeMethod)="search($event.query)"
 *   [formControl]="city"
 * />
 * <syui-autocomplete [suggestions]="users" optionLabel="name" dropdown [(value)]="user" />
 * ```
 */
@Component({
  selector: 'syui-autocomplete',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './autocomplete.css',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => Autocomplete), multi: true },
  ],
  host: {
    class: 'syui-autocomplete',
    '[class.syui-fluid]': 'fluid()',
    '[class.syui-autocomplete-open]': 'open()',
    '[class.syui-invalid]': 'showInvalid()',
    '[class.syui-autocomplete-disabled]': 'isDisabled()',
  },
  template: `
    <input
      #inputEl
      type="text"
      class="syui-autocomplete-input"
      role="combobox"
      autocomplete="off"
      aria-autocomplete="list"
      aria-haspopup="listbox"
      [attr.aria-expanded]="open()"
      [attr.aria-controls]="open() ? listboxId : null"
      [attr.aria-activedescendant]="open() && activeIndex() >= 0 ? optionId(activeIndex()) : null"
      [attr.aria-label]="ariaLabel() || null"
      [attr.aria-labelledby]="ariaLabelledby() || null"
      [attr.aria-describedby]="ariaDescribedby() || null"
      [attr.aria-invalid]="showInvalid() || null"
      [placeholder]="placeholder()"
      [disabled]="isDisabled()"
      [value]="inputText()"
      (input)="onInput(inputEl.value)"
      (keydown)="onKeydown($event)"
      (blur)="onBlur()"
    />
    @if (dropdown()) {
      <button
        type="button"
        class="syui-autocomplete-dropdown"
        tabindex="-1"
        aria-label="Show suggestions"
        [disabled]="isDisabled()"
        (mousedown)="$event.preventDefault()"
        (click)="onDropdownClick()"
      >
        <svg class="syui-autocomplete-chevron" viewBox="0 0 12 12" fill="none" aria-hidden="true">
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
    <span class="syui-sr-only" role="status">{{ resultsStatus() }}</span>

    <ng-template #panel>
      <ul
        class="syui-autocomplete-panel"
        role="listbox"
        [id]="listboxId"
        (mousedown)="$event.preventDefault()"
      >
        @for (suggestion of suggestions(); track $index) {
          <li
            class="syui-autocomplete-option"
            role="option"
            [id]="optionId($index)"
            [class.syui-autocomplete-option-active]="$index === activeIndex()"
            [attr.aria-selected]="$index === activeIndex()"
            (click)="selectSuggestion(suggestion)"
            (mouseenter)="activeIndex.set($index)"
          >
            {{ resolveLabel(suggestion) }}
          </li>
        } @empty {
          <li class="syui-autocomplete-empty">{{ emptyMessage() }}</li>
        }
      </ul>
    </ng-template>
  `,
})
export class Autocomplete extends BaseValueControl<unknown> {
  /** Suggestions supplied by the parent in response to `completeMethod`. */
  readonly suggestions = input<unknown[]>([]);
  /** Field name used as the display label when suggestions are objects. */
  readonly optionLabel = input<string>();
  readonly placeholder = input('');
  readonly emptyMessage = input('No results');
  /** Minimum number of characters before `completeMethod` fires. */
  readonly minLength = input(1, { transform: numberAttribute });
  /** Shows a chevron button that requests all suggestions (empty query). */
  readonly dropdown = input(false, { transform: booleanAttribute });
  /** Clears free text on blur unless it matches a suggestion. */
  readonly forceSelection = input(false, { transform: booleanAttribute });
  /** Stretches the control to the width of its container. */
  readonly fluid = input(false, { transform: booleanAttribute });
  /** Emitted (debounced) whenever new suggestions should be computed. */
  readonly completeMethod = output<AutocompleteCompleteEvent>();
  readonly onShow = output<void>();
  readonly onHide = output<void>();

  private readonly inputEl = viewChild.required<ElementRef<HTMLInputElement>>('inputEl');
  private readonly panelTemplate = viewChild.required<TemplateRef<unknown>>('panel');

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private overlayRef?: OverlayRef;
  private debounceTimer?: ReturnType<typeof setTimeout>;

  protected readonly listboxId = uniqueId('syui-autocomplete-listbox');
  /** Panel visibility; also drives aria-expanded. */
  protected readonly open = signal(false);
  /** Active (highlighted) suggestion, reset whenever suggestions change. */
  protected readonly activeIndex = linkedSignal({
    source: this.suggestions,
    computation: () => -1,
  });

  /** Text shown in the input, derived from the current value. */
  protected readonly inputText = computed(() => this.resolveLabel(this.value()));

  /** Politely announced so screen readers hear how many suggestions came back. */
  protected readonly resultsStatus = computed(() => {
    if (!this.open()) {
      return '';
    }
    const count = this.suggestions().length;
    if (count === 0) {
      return this.emptyMessage();
    }
    return count === 1 ? '1 result available' : `${count} results available`;
  });

  constructor() {
    super();
    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this.debounceTimer);
      this.overlayRef?.dispose();
    });
  }

  /** Resolves the display label of a suggestion (or value). */
  protected resolveLabel(option: unknown): string {
    if (option == null) {
      return '';
    }
    const field = this.optionLabel();
    if (field && typeof option === 'object') {
      return String((option as Record<string, unknown>)[field] ?? '');
    }
    return String(option);
  }

  protected optionId(index: number): string {
    return `${this.listboxId}-option-${index}`;
  }

  protected onInput(text: string): void {
    this.updateValue(text === '' ? null : text);
    clearTimeout(this.debounceTimer);
    if (text.length < this.minLength()) {
      this.hide();
      return;
    }
    this.debounceTimer = setTimeout(() => {
      this.completeMethod.emit({ query: text });
      this.show();
    }, 250);
  }

  protected onDropdownClick(): void {
    if (this.open()) {
      this.hide();
      return;
    }
    this.inputEl().nativeElement.focus();
    clearTimeout(this.debounceTimer);
    this.completeMethod.emit({ query: '' });
    this.show();
  }

  protected onBlur(): void {
    clearTimeout(this.debounceTimer);
    this.hide();
    // Free text is a plain string; suggestions picked from the panel are kept
    // as-is even if the parent has since replaced the suggestions array.
    if (this.forceSelection() && typeof this.value() === 'string') {
      const text = this.inputText();
      const match = this.suggestions().find((s) => this.resolveLabel(s) === text);
      this.updateValue(match !== undefined ? match : null);
    }
    this.onTouched();
  }

  protected selectSuggestion(suggestion: unknown): void {
    this.updateValue(suggestion);
    this.hide();
    this.inputEl().nativeElement.focus();
  }

  protected onKeydown(event: KeyboardEvent): void {
    const { key } = event;
    if (!this.open()) {
      if (key === 'ArrowDown') {
        event.preventDefault();
        clearTimeout(this.debounceTimer);
        this.completeMethod.emit({ query: this.inputText() });
        this.show();
      }
      return;
    }
    switch (key) {
      case 'ArrowDown':
        event.preventDefault();
        this.moveActive(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.moveActive(-1);
        break;
      // Home/End keep their native caret movement inside the text input.
      case 'Enter':
        if (this.activeIndex() >= 0) {
          event.preventDefault();
          this.selectSuggestion(this.suggestions()[this.activeIndex()]);
        }
        break;
      case 'Escape':
        event.preventDefault();
        this.hide();
        break;
      case 'Tab':
        this.hide();
        break;
    }
  }

  private moveActive(delta: number): void {
    const count = this.suggestions().length;
    if (count === 0) {
      return;
    }
    this.activeIndex.set((this.activeIndex() + delta + count) % count);
  }

  private show(): void {
    if (this.open()) {
      return;
    }
    this.overlayRef ??= this.createOverlay();
    this.overlayRef.attach(new TemplatePortal(this.panelTemplate(), this.viewContainerRef));
    this.open.set(true);
    this.activeIndex.set(-1);
    this.onShow.emit();
  }

  private hide(): void {
    if (!this.open()) {
      return;
    }
    this.overlayRef?.detach();
    this.open.set(false);
    this.onHide.emit();
  }

  private createOverlay(): OverlayRef {
    const host = this.host.nativeElement;
    const overlayRef = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(host)
        .withPositions([
          { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
          { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
        ]),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      minWidth: host.offsetWidth,
    });
    overlayRef.outsidePointerEvents().subscribe((event) => {
      if (!host.contains(event.target as Node)) {
        this.hide();
      }
    });
    return overlayRef;
  }
}
