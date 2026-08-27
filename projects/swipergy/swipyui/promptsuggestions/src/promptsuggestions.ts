import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
  output,
} from '@angular/core';

export interface PromptSuggestion {
  /** Text shown on the chip. */
  label: string;
  /** Prompt sent when the chip is picked; defaults to `label`. */
  value?: string;
  /** Secondary line explaining what the prompt does (grid layout only). */
  description?: string;
  /** CSS class(es) of a user-supplied icon font glyph. */
  icon?: string;
  disabled?: boolean;
}

/** A {@link PromptSuggestion} after normalization: `value` is always filled in. */
export type ResolvedPromptSuggestion = PromptSuggestion & { value: string };

/**
 * Starter prompts offered before (or between) turns. Takes plain strings or
 * {@link PromptSuggestion} objects and emits the picked one, so the composer
 * can be filled and submitted.
 *
 * ```html
 * <syui-prompt-suggestions
 *   [suggestions]="['Summarize this page', 'Draft a reply']"
 *   (onSelect)="ask($event.value)"
 * />
 * ```
 */
@Component({
  selector: 'syui-prompt-suggestions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './promptsuggestions.css',
  host: {
    class: 'syui-prompt-suggestions',
    '[class.syui-prompt-suggestions-grid]': "layout() === 'grid'",
  },
  template: `
    <div role="group" [attr.aria-label]="ariaLabel()">
      @if (header()) {
        <p class="syui-prompt-suggestions-header">{{ header() }}</p>
      }
      <ul class="syui-prompt-suggestions-list">
        @for (suggestion of normalized(); track $index) {
          <li>
            <button
              type="button"
              class="syui-prompt-suggestions-item"
              [disabled]="suggestion.disabled"
              (click)="onSelect.emit(suggestion)"
            >
              @if (suggestion.icon) {
                <i
                  class="syui-prompt-suggestions-icon"
                  [class]="suggestion.icon"
                  aria-hidden="true"
                ></i>
              }
              <span class="syui-prompt-suggestions-label">{{ suggestion.label }}</span>
              @if (suggestion.description) {
                <span class="syui-prompt-suggestions-description">{{
                  suggestion.description
                }}</span>
              }
            </button>
          </li>
        }
      </ul>
    </div>
  `,
})
export class PromptSuggestions {
  /** Prompts to offer, as strings or {@link PromptSuggestion} objects. */
  readonly suggestions = input.required<readonly (string | PromptSuggestion)[]>();
  /** `row` wraps chips inline, `grid` lays out cards that can carry a description. */
  readonly layout = input<'row' | 'grid'>('row');
  /** Optional heading above the suggestions. */
  readonly header = input<string>();
  /** Accessible name of the suggestion group. */
  readonly ariaLabel = input('Suggested prompts');

  /** Emits the picked suggestion, with `value` filled in from `label` if omitted. */
  readonly onSelect = output<ResolvedPromptSuggestion>();

  protected readonly normalized = computed<ResolvedPromptSuggestion[]>(() =>
    this.suggestions().map((suggestion) => {
      const item = typeof suggestion === 'string' ? { label: suggestion } : suggestion;
      return { ...item, value: item.value ?? item.label };
    }),
  );
}
