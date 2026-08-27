import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
} from '@angular/core';

/**
 * Inline reference from a generated answer to the source it came from —
 * a numbered marker that links out and names the source on hover and to
 * assistive technology.
 *
 * ```html
 * Angular signals are glitch-free.<syui-citation [index]="1" title="Angular docs — Signals"
 *   url="https://angular.dev/guide/signals" />
 * ```
 */
@Component({
  selector: 'syui-citation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './citation.css',
  host: {
    class: 'syui-citation-host',
  },
  template: `
    @if (url()) {
      <a
        class="syui-citation"
        [href]="url()"
        target="_blank"
        rel="noreferrer noopener"
        [attr.title]="tooltip()"
        [attr.aria-label]="label()"
        >{{ marker() }}</a
      >
    } @else {
      <span
        class="syui-citation"
        [attr.title]="tooltip()"
        [attr.aria-label]="label()"
        role="note"
        >{{ marker() }}</span
      >
    }
  `,
})
export class Citation {
  /** Position of the source in the answer's source list; shown in the marker. */
  readonly index = input<number>();
  /** Title of the cited source. */
  readonly title = input<string>();
  /** Where the source can be read; renders the marker as a link when set. */
  readonly url = input<string>();
  /** Quoted passage the statement is based on, added to the hover text. */
  readonly snippet = input<string>();
  /** Overrides the composed accessible name of the marker. */
  readonly ariaLabel = input<string>();

  protected readonly marker = computed(() => this.index()?.toString() ?? '•');

  protected readonly tooltip = computed(
    () => [this.title(), this.snippet()].filter(Boolean).join(' — ') || null,
  );

  protected readonly label = computed(() => {
    const custom = this.ariaLabel();
    if (custom) {
      return custom;
    }
    const index = this.index();
    const name = this.title() ?? this.url() ?? 'unnamed';
    return index === undefined ? `Source: ${name}` : `Source ${index}: ${name}`;
  });
}
