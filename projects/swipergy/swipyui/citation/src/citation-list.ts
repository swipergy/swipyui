import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
  output,
} from '@angular/core';
import { uniqueId } from '@swipergy/swipyui/core';

export interface CitationSource {
  /** Title of the source, shown as the link text. */
  title: string;
  /** Where the source can be read. */
  url?: string;
  /** Quoted passage the answer drew from. */
  snippet?: string;
  /** Publisher shown next to the index; defaults to the host name of `url`. */
  source?: string;
}

interface ResolvedSource extends CitationSource {
  index: number;
  origin: string | null;
}

/**
 * The numbered source list under a generated answer, matching the inline
 * `<syui-citation>` markers by position.
 *
 * ```html
 * <syui-citation-list [sources]="answer().sources" (onSelect)="open($event)" />
 * ```
 */
@Component({
  selector: 'syui-citation-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './citation-list.css',
  imports: [NgTemplateOutlet],
  host: {
    class: 'syui-citation-list',
    '[class.syui-citation-list-grid]': "layout() === 'grid'",
  },
  template: `
    @if (header()) {
      <p class="syui-citation-list-header" [id]="headerId">{{ header() }}</p>
    }
    <ol class="syui-citation-list-items" [attr.aria-labelledby]="header() ? headerId : null">
      @for (source of resolved(); track $index) {
        <li class="syui-citation-list-item">
          @if (source.url) {
            <a
              class="syui-citation-list-link"
              [href]="source.url"
              target="_blank"
              rel="noreferrer noopener"
              (click)="onSelect.emit(source)"
            >
              <ng-container
                [ngTemplateOutlet]="body"
                [ngTemplateOutletContext]="{ $implicit: source }"
              />
            </a>
          } @else {
            <div class="syui-citation-list-link syui-citation-list-static">
              <ng-container
                [ngTemplateOutlet]="body"
                [ngTemplateOutletContext]="{ $implicit: source }"
              />
            </div>
          }
        </li>
      }
    </ol>

    <ng-template #body let-source>
      <span class="syui-citation-list-index" aria-hidden="true">{{ source.index }}</span>
      <span class="syui-citation-list-text">
        <span class="syui-citation-list-title">{{ source.title }}</span>
        @if (source.snippet) {
          <span class="syui-citation-list-snippet">{{ source.snippet }}</span>
        }
        @if (source.source ?? source.origin; as origin) {
          <span class="syui-citation-list-origin">{{ origin }}</span>
        }
      </span>
    </ng-template>
  `,
})
export class CitationList {
  /** Sources backing the answer, in the order the inline markers reference them. */
  readonly sources = input.required<readonly CitationSource[]>();
  /** Heading above the list; pass an empty string to omit it. */
  readonly header = input('Sources');
  /** `list` stacks the sources, `grid` lays them out as cards. */
  readonly layout = input<'list' | 'grid'>('list');

  /** Emits the source the user opened. */
  readonly onSelect = output<CitationSource>();

  protected readonly headerId = uniqueId('syui-citation-list-header');

  protected readonly resolved = computed<ResolvedSource[]>(() =>
    this.sources().map((source, i) => ({ ...source, index: i + 1, origin: hostName(source.url) })),
  );
}

/** Host name of a URL without the `www.` prefix, or null when it is not parseable. */
function hostName(url: string | undefined): string | null {
  if (!url) {
    return null;
  }
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}
