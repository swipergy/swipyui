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
 * One step inside `<syui-stepper>`; the projected content is shown below the
 * header while the step is active.
 */
@Component({
  selector: 'syui-step',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    @if (active()) {
      <div class="syui-stepper-panel" [id]="panelId" [attr.aria-labelledby]="stepId">
        <ng-content />
      </div>
    }
  `,
})
export class Step {
  /** Identifies this step within the parent `value`. */
  readonly value = input.required<unknown>();
  /** Text shown next to the step number. */
  readonly label = input.required<string>();

  readonly stepId = uniqueId('syui-step');
  readonly panelId = uniqueId('syui-step-panel');

  private readonly stepper = inject<Stepper>(forwardRef(() => Stepper));

  readonly index = computed(() => this.stepper.stepList().indexOf(this));
  readonly active = computed(() => this.stepper.value() === this.value());
  /** True for steps before the active one. */
  readonly completed = computed(() => {
    const activeIndex = this.stepper.activeIndex();
    return activeIndex >= 0 && this.index() < activeIndex;
  });
}

/**
 * Guides users through a sequence of steps: numbered circular indicators
 * joined by connector lines, a check mark for completed steps and the active
 * step's content projected below the header. In `linear` mode users cannot
 * jump ahead past the next uncompleted step. Drive it programmatically via a
 * template reference:
 *
 * ```html
 * <syui-stepper #stepper linear>
 *   <syui-step value="account" label="Account">…</syui-step>
 *   <syui-step value="payment" label="Payment">…</syui-step>
 * </syui-stepper>
 * <button syui-button (click)="stepper.next()">Next</button>
 * ```
 */
@Component({
  selector: 'syui-stepper',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './stepper.css',
  host: { class: 'syui-stepper' },
  template: `
    <ol class="syui-stepper-header">
      @for (step of stepList(); track step.stepId; let i = $index; let last = $last) {
        <li
          class="syui-stepper-item"
          [class.syui-stepper-item-active]="step.active()"
          [class.syui-stepper-item-completed]="step.completed()"
        >
          <button
            type="button"
            class="syui-stepper-trigger"
            [id]="step.stepId"
            [attr.aria-current]="step.active() ? 'step' : null"
            [attr.aria-controls]="step.active() ? step.panelId : null"
            [disabled]="!canActivate(i)"
            (click)="select(step)"
          >
            <span class="syui-stepper-number" aria-hidden="true">
              @if (step.completed()) {
                <svg class="syui-stepper-check" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path
                    d="M2.5 6.5L5 9L9.5 3.5"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              } @else {
                {{ i + 1 }}
              }
            </span>
            <span class="syui-stepper-label">{{ step.label() }}</span>
          </button>
          @if (!last) {
            <span class="syui-stepper-separator" aria-hidden="true"></span>
          }
        </li>
      }
    </ol>
    <ng-content />
  `,
})
export class Stepper {
  /** Value of the active step; supports two-way binding. */
  readonly value = model<unknown>();
  /** Forbids activating steps beyond the next uncompleted one. */
  readonly linear = input(false, { transform: booleanAttribute });

  readonly stepList = contentChildren(Step);

  /** Index of the active step, -1 when none matches. */
  readonly activeIndex = computed(() => this.stepList().findIndex((step) => step.active()));

  constructor() {
    // default to the first step when no value is set
    effect(() => {
      const steps = this.stepList();
      if (this.value() === undefined && steps.length) {
        this.value.set(steps[0].value());
      }
    });
  }

  /** Activates the step after the active one; no-op on the last step. */
  next(): void {
    this.activate(this.activeIndex() + 1);
  }

  /** Activates the step before the active one; no-op on the first step. */
  prev(): void {
    this.activate(this.activeIndex() - 1);
  }

  /** In linear mode only completed steps and the next step are reachable. */
  protected canActivate(index: number): boolean {
    return !this.linear() || index <= this.activeIndex() + 1;
  }

  protected select(step: Step): void {
    if (this.canActivate(step.index())) {
      this.value.set(step.value());
    }
  }

  private activate(index: number): void {
    const step = this.stepList()[index];
    if (step) {
      this.value.set(step.value());
    }
  }
}
