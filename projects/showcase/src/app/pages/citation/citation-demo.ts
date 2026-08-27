import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Citation, CitationList, CitationSource } from '@swipergy/swipyui/citation';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const INLINE = `<p>
  Signals are glitch-free.<syui-citation [index]="1" title="Angular — Signals"
    url="https://angular.dev/guide/signals" />
  Components stay OnPush.<syui-citation [index]="2" title="Angular — Change detection"
    url="https://angular.dev/best-practices/runtime-performance" />
</p>`;

const LIST = `sources = [
  { title: 'Angular — Signals', url: 'https://angular.dev/guide/signals', snippet: 'A signal is a wrapper around a value…' },
  { title: 'Angular — Change detection', url: 'https://angular.dev/best-practices/runtime-performance' },
];

<syui-citation-list [sources]="sources" (onSelect)="track($event)" />`;

const GRID = `<syui-citation-list [sources]="sources" layout="grid" header="Referenced" />`;

const CITATION_PROPS: PropRow[] = [
  {
    name: 'index',
    type: 'number',
    description:
      'Position in the source list, shown in the marker. Without it the marker is a dot.',
  },
  { name: 'title', type: 'string', description: 'Title of the cited source.' },
  {
    name: 'url',
    type: 'string',
    description: 'Where the source can be read; renders the marker as a link when set.',
  },
  {
    name: 'snippet',
    type: 'string',
    description: 'Quoted passage the statement is based on, added to the hover text.',
  },
  {
    name: 'ariaLabel',
    type: 'string',
    description: 'Overrides the composed accessible name ("Source 1: …").',
  },
];

const LIST_PROPS: PropRow[] = [
  {
    name: 'sources',
    type: 'CitationSource[]',
    description: 'Sources backing the answer, in the order the inline markers reference them.',
  },
  {
    name: 'header',
    type: 'string',
    default: "'Sources'",
    description: 'Heading above the list; pass an empty string to omit it.',
  },
  {
    name: 'layout',
    type: "'list' | 'grid'",
    default: "'list'",
    description: 'Stacks the sources, or lays them out as cards.',
  },
  {
    name: 'onSelect',
    type: 'EventEmitter<CitationSource>',
    description: 'Emits the source the user opened.',
  },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Citation, CitationList, DocsSection, DocsPropTable],
  template: `
    <h1>Citation</h1>
    <p class="docs-lead">
      References from a generated answer back to its sources: numbered inline markers, and the
      matching source list underneath.
      <code
        >import {{ '{' }} Citation, CitationList {{ '}' }} from
        '&#64;swipergy/swipyui/citation';</code
      >
    </p>

    <docs-section
      title="Inline markers"
      [code]="inline"
      language="html"
      description="Each marker links out in a new tab and is announced as “Source n: title”."
    >
      <p style="max-width: 40rem">
        Signals are glitch-free: reading one always gives a value consistent with the rest of the
        graph.<syui-citation
          [index]="1"
          title="Angular — Signals"
          url="https://angular.dev/guide/signals"
          snippet="A signal is a wrapper around a value that notifies consumers when it changes."
        />
        Components in this library stay OnPush throughout.<syui-citation
          [index]="2"
          title="Angular — Runtime performance"
          url="https://angular.dev/best-practices/runtime-performance"
        />
      </p>
    </docs-section>

    <docs-section
      title="Source list"
      [code]="list"
      language="html"
      description="The list numbers itself, so the markers and the entries stay in sync. The publisher is derived from the URL when it is not given."
    >
      <syui-citation-list [sources]="sources" />
    </docs-section>

    <docs-section
      title="Grid layout"
      [code]="grid"
      language="html"
      description="Cards work better when the sources carry snippets."
    >
      <syui-citation-list [sources]="sources" layout="grid" header="Referenced" />
    </docs-section>

    <docs-prop-table title="Citation API" [props]="citationProps" />
    <docs-prop-table title="CitationList API" [props]="listProps" />
  `,
})
export class CitationDemo {
  readonly inline = INLINE;
  readonly list = LIST;
  readonly grid = GRID;
  readonly citationProps = CITATION_PROPS;
  readonly listProps = LIST_PROPS;

  readonly sources: CitationSource[] = [
    {
      title: 'Angular — Signals',
      url: 'https://angular.dev/guide/signals',
      snippet: 'A signal is a wrapper around a value that notifies consumers when it changes.',
    },
    {
      title: 'Angular — Runtime performance',
      url: 'https://angular.dev/best-practices/runtime-performance',
      snippet: 'Use OnPush change detection to skip subtrees that cannot have changed.',
    },
    {
      title: 'Internal design doc',
      snippet: 'Agent surfaces must degrade to plain text when JavaScript is unavailable.',
      source: 'Design docs',
    },
  ];
}
