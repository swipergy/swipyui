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
  output,
  signal,
  viewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { BaseValueControl, uniqueId } from '@swipergy/swipyui/core';

export interface SelectOption<T = unknown> {
  label: string;
  value: T;
  disabled?: boolean;
}

/**
 * Single-select dropdown following the WAI-ARIA combobox pattern:
 * focus stays on the trigger, the active option is tracked with
 * aria-activedescendant, arrow keys navigate, typing a letter jumps to the
 * next matching option, Enter selects, Escape closes.
 *
 * Implements the signal forms value contract, so it binds directly to a
 * field, and stays compatible with reactive and template-driven forms:
 *
 * ```html
 * <syui-select [options]="cities" placeholder="Select a city" [formField]="f.city" />
 * <syui-select [options]="cities" placeholder="Select a city" [formControl]="city" />
 * <syui-select [options]="cities" placeholder="Select a city" [(value)]="city" />
 * ```
 */
@Component({
  selector: 'syui-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './select.css',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => Select), multi: true }],
  template: `
    <button
      #trigger
      type="button"
      class="syui-select"
      role="combobox"
      aria-haspopup="listbox"
      [class.syui-fluid]="fluid()"
      [class.syui-invalid]="showInvalid()"
      [class.syui-select-open]="open()"
      [attr.aria-expanded]="open()"
      [attr.aria-controls]="open() ? listboxId : null"
      [attr.aria-activedescendant]="open() && activeIndex() >= 0 ? optionId(activeIndex()) : null"
      [attr.aria-label]="ariaLabel() || null"
      [attr.aria-labelledby]="ariaLabelledby() || null"
      [attr.aria-describedby]="ariaDescribedby() || null"
      [attr.aria-invalid]="showInvalid() || null"
      [disabled]="isDisabled()"
      (click)="toggle()"
      (keydown)="onKeydown($event)"
      (blur)="onTouched()"
    >
      <span class="syui-select-label" [class.syui-select-placeholder]="!selectedOption()">
        {{ selectedOption()?.label ?? placeholder() }}
      </span>
      <svg class="syui-select-chevron" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path
          d="M2.5 4.5L6 8L9.5 4.5"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>

    <ng-template #panel>
      <ul class="syui-select-panel" role="listbox" [id]="listboxId">
        @for (option of options(); track $index) {
          <li
            class="syui-select-option"
            role="option"
            [id]="optionId($index)"
            [class.syui-select-option-active]="$index === activeIndex()"
            [class.syui-select-option-selected]="option.value === value()"
            [class.syui-select-option-disabled]="option.disabled"
            [attr.aria-selected]="option.value === value()"
            [attr.aria-disabled]="option.disabled || null"
            (click)="selectOption(option)"
            (mouseenter)="activeIndex.set($index)"
          >
            {{ option.label }}
          </li>
        } @empty {
          <li class="syui-select-empty">{{ emptyMessage() }}</li>
        }
      </ul>
    </ng-template>
  `,
})
export class Select extends BaseValueControl<unknown> {
  readonly options = input<SelectOption[]>([]);
  readonly placeholder = input('Select…');
  readonly emptyMessage = input('No options');
  /** Stretches the trigger to the width of its container. */
  readonly fluid = input(false, { transform: booleanAttribute });
  readonly onShow = output<void>();
  readonly onHide = output<void>();

  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  private readonly panelTemplate = viewChild.required<TemplateRef<unknown>>('panel');

  private readonly overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private overlayRef?: OverlayRef;

  protected readonly listboxId = uniqueId('syui-select-listbox');
  protected readonly open = signal(false);
  protected readonly activeIndex = signal(-1);

  protected readonly selectedOption = computed(
    () => this.options().find((option) => option.value === this.value()) ?? null,
  );

  constructor() {
    super();
    inject(DestroyRef).onDestroy(() => this.overlayRef?.dispose());
  }

  protected optionId(index: number): string {
    return `${this.listboxId}-option-${index}`;
  }

  protected toggle(): void {
    this.open() ? this.hide() : this.show();
  }

  protected show(): void {
    if (this.open()) {
      return;
    }
    this.overlayRef ??= this.createOverlay();
    this.overlayRef.attach(new TemplatePortal(this.panelTemplate(), this.viewContainerRef));
    this.open.set(true);
    const selected = this.options().indexOf(this.selectedOption()!);
    this.activeIndex.set(selected >= 0 ? selected : this.firstEnabled(0, 1));
    this.onShow.emit();
  }

  protected hide(): void {
    if (!this.open()) {
      return;
    }
    this.overlayRef?.detach();
    this.open.set(false);
    this.onHide.emit();
  }

  protected selectOption(option: SelectOption): void {
    if (option.disabled) {
      return;
    }
    this.updateValue(option.value);
    this.hide();
    this.trigger().nativeElement.focus();
  }

  protected onKeydown(event: KeyboardEvent): void {
    const { key } = event;
    if (!this.open()) {
      if (key === 'ArrowDown' || key === 'ArrowUp' || key === 'Enter' || key === ' ') {
        event.preventDefault();
        this.show();
      } else if (this.isTypeaheadKey(event)) {
        this.show();
        this.typeahead(key);
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
      case 'Home':
        event.preventDefault();
        this.activeIndex.set(this.firstEnabled(0, 1));
        break;
      case 'End':
        event.preventDefault();
        this.activeIndex.set(this.firstEnabled(this.options().length - 1, -1));
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (this.activeIndex() >= 0) {
          this.selectOption(this.options()[this.activeIndex()]);
        }
        break;
      case 'Escape':
      case 'Tab':
        this.hide();
        break;
      default:
        if (this.isTypeaheadKey(event)) {
          this.typeahead(key);
        }
    }
  }

  private isTypeaheadKey(event: KeyboardEvent): boolean {
    return event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey;
  }

  /** Moves the active option to the next enabled option starting with the letter. */
  private typeahead(letter: string): void {
    const options = this.options();
    const query = letter.toLowerCase();
    const start = this.activeIndex() + 1;
    for (let step = 0; step < options.length; step++) {
      const index = (start + step) % options.length;
      const option = options[index];
      if (!option.disabled && option.label.toLowerCase().startsWith(query)) {
        this.activeIndex.set(index);
        return;
      }
    }
  }

  private moveActive(delta: number): void {
    const options = this.options();
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
    const options = this.options();
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
