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
  signal,
  viewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { BaseValueControl, uniqueId } from '@swipergy/swipyui/core';

/** Strength levels reported by the password meter. */
export type PasswordStrength = 'prompt' | 'weak' | 'medium' | 'strong';

/**
 * Password input with an optional visibility toggle and a strength meter
 * shown in an overlay below the field while it is focused.
 *
 * Strength is estimated from simple heuristics (length, upper/lower case
 * mix, digits, symbols) — it is a UX hint, not a security check.
 *
 * ```html
 * <syui-password toggleMask placeholder="Password" [formField]="f.password" />
 * <syui-password [feedback]="false" [formControl]="pin" />
 * <syui-password promptLabel="Choose a password" [(value)]="password" />
 * ```
 */
@Component({
  selector: 'syui-password',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './password.css',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => Password), multi: true },
  ],
  host: {
    class: 'syui-password',
    '[class.syui-fluid]': 'fluid()',
    '[class.syui-invalid]': 'showInvalid()',
    '[class.syui-password-disabled]': 'isDisabled()',
  },
  template: `
    <input
      #inputEl
      class="syui-password-input"
      autocomplete="new-password"
      [type]="masked() ? 'password' : 'text'"
      [placeholder]="placeholder()"
      [disabled]="isDisabled()"
      [attr.aria-label]="ariaLabel() || null"
      [attr.aria-labelledby]="ariaLabelledby() || null"
      [attr.aria-invalid]="showInvalid() ? true : null"
      [attr.aria-describedby]="feedback() ? meterId : null"
      [value]="value() ?? ''"
      (input)="onInput(inputEl.value)"
      (focus)="onFocus()"
      (blur)="onBlur()"
    />
    @if (toggleMask()) {
      <button
        type="button"
        class="syui-password-toggle"
        aria-label="Show password"
        [attr.aria-pressed]="!masked()"
        [disabled]="isDisabled()"
        (mousedown)="$event.preventDefault()"
        (click)="masked.set(!masked())"
      >
        @if (masked()) {
          <svg class="syui-password-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8s-2.5 4.5-6.5 4.5S1.5 8 1.5 8Z"
              stroke="currentColor"
              stroke-width="1.25"
              stroke-linejoin="round"
            />
            <circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="1.25" />
          </svg>
        } @else {
          <svg class="syui-password-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8s-2.5 4.5-6.5 4.5S1.5 8 1.5 8Z"
              stroke="currentColor"
              stroke-width="1.25"
              stroke-linejoin="round"
            />
            <circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="1.25" />
            <path d="M2.5 13.5l11-11" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" />
          </svg>
        }
      </button>
    }

    <ng-template #panelTpl>
      <div class="syui-password-panel" [id]="meterId" role="status">
        <div class="syui-password-meter" aria-hidden="true">
          <div
            class="syui-password-meter-fill"
            [class.syui-password-meter-weak]="strength() === 'weak'"
            [class.syui-password-meter-medium]="strength() === 'medium'"
            [class.syui-password-meter-strong]="strength() === 'strong'"
            [style.width.%]="meterWidth()"
          ></div>
        </div>
        <span class="syui-password-strength-label">{{ strengthLabel() }}</span>
      </div>
    </ng-template>
  `,
})
export class Password extends BaseValueControl<string> {
  /** Shows an eye button that toggles between masked and plain text. */
  readonly toggleMask = input(false, { transform: booleanAttribute });
  /** Shows the strength meter overlay while the input is focused. */
  readonly feedback = input(true, { transform: booleanAttribute });
  /** Label shown in the meter while the field is empty. */
  readonly promptLabel = input('Enter a password');
  readonly weakLabel = input('Weak');
  readonly mediumLabel = input('Medium');
  readonly strongLabel = input('Strong');
  readonly placeholder = input('');
  /** Stretches the control to the width of its container. */
  readonly fluid = input(false, { transform: booleanAttribute });
  private readonly inputEl = viewChild.required<ElementRef<HTMLInputElement>>('inputEl');
  private readonly panelTemplate = viewChild.required<TemplateRef<unknown>>('panelTpl');

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private overlayRef?: OverlayRef;

  protected readonly meterId = uniqueId('syui-password-meter');
  /** True while the value is hidden behind password dots. */
  protected readonly masked = signal(true);

  /** Estimated strength of the current value. */
  protected readonly strength = computed<PasswordStrength>(() => {
    const value = this.value() ?? '';
    if (value.length === 0) {
      return 'prompt';
    }
    let score = 0;
    if (value.length >= 8) {
      score++;
    }
    if (/[a-z]/.test(value) && /[A-Z]/.test(value)) {
      score++;
    }
    if (/\d/.test(value)) {
      score++;
    }
    if (/[^A-Za-z0-9]/.test(value)) {
      score++;
    }
    return score <= 1 ? 'weak' : score <= 3 ? 'medium' : 'strong';
  });

  protected readonly meterWidth = computed(
    () => ({ prompt: 0, weak: 34, medium: 67, strong: 100 })[this.strength()],
  );

  protected readonly strengthLabel = computed(() => {
    switch (this.strength()) {
      case 'weak':
        return this.weakLabel();
      case 'medium':
        return this.mediumLabel();
      case 'strong':
        return this.strongLabel();
      default:
        return this.promptLabel();
    }
  });

  constructor() {
    super();
    inject(DestroyRef).onDestroy(() => this.overlayRef?.dispose());
  }

  protected onInput(text: string): void {
    this.updateValue(text);
  }

  protected onFocus(): void {
    if (this.feedback()) {
      this.showPanel();
    }
  }

  protected onBlur(): void {
    this.hidePanel();
    this.onTouched();
  }

  private showPanel(): void {
    if (this.overlayRef?.hasAttached()) {
      return;
    }
    this.overlayRef ??= this.createOverlay();
    this.overlayRef.attach(new TemplatePortal(this.panelTemplate(), this.viewContainerRef));
  }

  private hidePanel(): void {
    this.overlayRef?.detach();
  }

  private createOverlay(): OverlayRef {
    const host = this.host.nativeElement;
    return this.overlay.create({
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
  }
}
