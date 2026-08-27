import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  afterRenderEffect,
  booleanAttribute,
  computed,
  input,
  model,
  numberAttribute,
  output,
  viewChild,
} from '@angular/core';
import { uniqueId } from '@swipergy/swipyui/core';

/**
 * Composer for agent prompts: a textarea that grows with its content up to
 * `maxRows`, a send button, and a stop button that replaces it while a reply
 * is streaming. Enter submits, Shift+Enter inserts a newline.
 *
 * The `toolbar` slot holds controls left of the send button (attach, model
 * picker, …), `attachments` renders above the textarea:
 *
 * ```html
 * <syui-prompt-input
 *   [(value)]="draft"
 *   [loading]="streaming()"
 *   (onSubmit)="send($event)"
 *   (onStop)="abort()"
 * >
 *   <syui-button slot="toolbar" label="Attach" variant="text" size="small" />
 * </syui-prompt-input>
 * ```
 */
@Component({
  selector: 'syui-prompt-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './promptinput.css',
  host: {
    class: 'syui-prompt-input',
    '[class.syui-prompt-input-disabled]': 'disabled()',
  },
  template: `
    <div class="syui-prompt-input-attachments">
      <ng-content select="[slot=attachments]" />
    </div>

    <textarea
      #textarea
      class="syui-prompt-input-textarea"
      [rows]="minRows()"
      [value]="value()"
      [placeholder]="placeholder()"
      [disabled]="disabled()"
      [attr.maxlength]="maxLength() ?? null"
      [attr.aria-label]="ariaLabel()"
      [attr.aria-describedby]="describedby()"
      (input)="onInput($event)"
      (keydown)="onKeydown($event)"
    ></textarea>

    <div class="syui-prompt-input-toolbar">
      <div class="syui-prompt-input-tools">
        <ng-content select="[slot=toolbar]" />
      </div>
      <div class="syui-prompt-input-actions">
        <ng-content select="[slot=actions]" />
        @if (showCounter() && maxLength()) {
          <span class="syui-prompt-input-counter" [id]="counterId" aria-live="off">
            {{ value().length }}/{{ maxLength() }}
          </span>
        }
        @if (loading()) {
          <button
            type="button"
            class="syui-prompt-input-button syui-prompt-input-stop"
            [attr.aria-label]="stopLabel()"
            (click)="stop()"
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <rect x="4.5" y="4.5" width="7" height="7" rx="1.5" fill="currentColor" />
            </svg>
          </button>
        } @else {
          <button
            type="button"
            class="syui-prompt-input-button syui-prompt-input-send"
            [disabled]="disabled() || !canSubmit()"
            [attr.aria-label]="sendLabel()"
            (click)="submit()"
          >
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M8 13V3.5M8 3.5L4 7.5M8 3.5L12 7.5"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        }
      </div>
    </div>
  `,
})
export class PromptInput {
  /** Current draft, two-way bindable. */
  readonly value = model('');
  readonly placeholder = input('Ask anything…');
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Swaps the send button for a stop button while a reply streams in. */
  readonly loading = input(false, { transform: booleanAttribute });
  /** Rows the empty textarea starts at. */
  readonly minRows = input(1, { transform: numberAttribute });
  /** Rows the textarea grows to before it starts scrolling. */
  readonly maxRows = input(8, { transform: numberAttribute });
  /** Enter submits; Shift+Enter always inserts a newline. */
  readonly submitOnEnter = input(true, { transform: booleanAttribute });
  /** Clears the draft after a successful submit. */
  readonly clearOnSubmit = input(true, { transform: booleanAttribute });
  /** Hard limit on the draft length, mirrored to the textarea's `maxlength`. */
  readonly maxLength = input<number>();
  /** Shows a character counter; requires `maxLength`. */
  readonly showCounter = input(false, { transform: booleanAttribute });
  /** Accessible name of the send button. */
  readonly sendLabel = input('Send message');
  /** Accessible name of the stop button. */
  readonly stopLabel = input('Stop generating');
  /** Accessible name of the textarea. */
  readonly ariaLabel = input('Message');
  /** Space-separated id(s) of help or error text describing the textarea. */
  readonly ariaDescribedby = input<string>();

  /** Emits the trimmed draft when the user submits. */
  readonly onSubmit = output<string>();
  /** Emits when the user interrupts a streaming reply. */
  readonly onStop = output<void>();

  protected readonly counterId = uniqueId('syui-prompt-input-counter');

  private readonly textarea = viewChild<ElementRef<HTMLTextAreaElement>>('textarea');

  /** True when the draft holds something other than whitespace. */
  protected readonly canSubmit = computed(() => this.value().trim().length > 0);

  protected readonly describedby = computed(
    () =>
      [this.ariaDescribedby(), this.showCounter() && this.maxLength() ? this.counterId : '']
        .filter(Boolean)
        .join(' ') || null,
  );

  constructor() {
    // Runs after every render that changed the draft, so the textarea also
    // re-fits on programmatic changes — a suggestion chip filling it, say.
    afterRenderEffect(() => {
      this.value();
      this.resize();
    });
  }

  /** Moves focus into the textarea, e.g. after picking a suggestion. */
  focus(): void {
    this.textarea()?.nativeElement.focus();
  }

  /** Emits the current draft if it is not empty. */
  submit(): void {
    if (this.disabled() || this.loading() || !this.canSubmit()) {
      return;
    }
    this.onSubmit.emit(this.value().trim());
    if (this.clearOnSubmit()) {
      this.value.set('');
    }
  }

  /** Requests interruption of the streaming reply. */
  stop(): void {
    this.onStop.emit();
  }

  protected onInput(event: Event): void {
    this.value.set((event.target as HTMLTextAreaElement).value);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (
      event.key !== 'Enter' ||
      !this.submitOnEnter() ||
      event.shiftKey ||
      // Enter confirms a candidate in an IME composition — never submits.
      event.isComposing
    ) {
      return;
    }
    event.preventDefault();
    this.submit();
  }

  private resize(): void {
    const el = this.textarea()?.nativeElement;
    if (!el) {
      return;
    }
    const style = getComputedStyle(el);
    const lineHeight = parseFloat(style.lineHeight) || 24;
    const extra =
      (parseFloat(style.paddingTop) || 0) +
      (parseFloat(style.paddingBottom) || 0) +
      (parseFloat(style.borderTopWidth) || 0) +
      (parseFloat(style.borderBottomWidth) || 0);
    const max = lineHeight * this.maxRows() + extra;
    el.style.height = 'auto';
    const height = Math.min(el.scrollHeight || 0, max);
    el.style.height = `${height}px`;
    el.style.overflowY = (el.scrollHeight || 0) > max ? 'auto' : 'hidden';
  }
}
