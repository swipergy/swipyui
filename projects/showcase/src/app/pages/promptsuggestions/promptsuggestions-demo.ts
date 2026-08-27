import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { PromptSuggestions, ResolvedPromptSuggestion } from '@swipergy/swipyui/promptsuggestions';
import { PromptInput } from '@swipergy/swipyui/promptinput';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `<syui-prompt-suggestions
  [suggestions]="['Summarize this page', 'Draft a reply', 'Find the failing test']"
  (onSelect)="ask($event.value)"
/>`;

const GRID = `suggestions = [
  { label: 'Explain this file', description: 'Walks through the code top to bottom' },
  { label: 'Write tests', description: 'Covers the branches that are missing' },
  { label: 'Find the bug', value: 'Find the bug in the failing spec' },
];

<syui-prompt-suggestions [suggestions]="suggestions" layout="grid" header="Try one of these" />`;

const COMPOSER = `ask(suggestion: ResolvedPromptSuggestion) {
  this.draft.set(suggestion.value);
}`;

const PROPS: PropRow[] = [
  {
    name: 'suggestions',
    type: '(string | PromptSuggestion)[]',
    description: 'Prompts to offer. Strings become { label, value } pairs.',
  },
  {
    name: 'layout',
    type: "'row' | 'grid'",
    default: "'row'",
    description: 'Wraps chips inline, or lays out cards that can carry a description.',
  },
  { name: 'header', type: 'string', description: 'Optional heading above the suggestions.' },
  {
    name: 'ariaLabel',
    type: 'string',
    default: "'Suggested prompts'",
    description: 'Accessible name of the suggestion group.',
  },
  {
    name: 'onSelect',
    type: 'EventEmitter<ResolvedPromptSuggestion>',
    description: 'Emits the picked suggestion, with value filled in from label if omitted.',
  },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PromptSuggestions, PromptInput, DocsSection, DocsPropTable],
  template: `
    <h1>PromptSuggestions</h1>
    <p class="docs-lead">
      Starter prompts offered before — or between — turns. Takes plain strings or objects and emits
      the picked one, so the composer can be filled and sent.
      <code
        >import {{ '{' }} PromptSuggestions {{ '}' }} from
        '&#64;swipergy/swipyui/promptsuggestions';</code
      >
    </p>

    <docs-section title="Basic" [code]="basic" language="html">
      <syui-prompt-suggestions [suggestions]="simple" (onSelect)="picked.set($event.value)" />
      @if (picked(); as prompt) {
        <p class="docs-muted">Picked: “{{ prompt }}”</p>
      }
    </docs-section>

    <docs-section
      title="Grid with descriptions"
      [code]="grid"
      language="html"
      description="The grid layout gives each suggestion a card with a second line."
    >
      <syui-prompt-suggestions
        [suggestions]="detailed"
        layout="grid"
        header="Try one of these"
        (onSelect)="picked.set($event.value)"
      />
    </docs-section>

    <docs-section
      title="Filling the composer"
      [code]="composer"
      language="typescript"
      description="The usual pairing: picking a suggestion writes it into the PromptInput, leaving the user free to edit before sending."
    >
      <syui-prompt-suggestions [suggestions]="simple" (onSelect)="fill($event)" />
      <syui-prompt-input [(value)]="draft" />
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
})
export class PromptSuggestionsDemo {
  readonly basic = BASIC;
  readonly grid = GRID;
  readonly composer = COMPOSER;
  readonly props = PROPS;

  readonly simple = ['Summarize this page', 'Draft a reply', 'Find the failing test'];
  readonly detailed = [
    { label: 'Explain this file', description: 'Walks through the code top to bottom' },
    { label: 'Write tests', description: 'Covers the branches that are missing' },
    { label: 'Find the bug', value: 'Find the bug in the failing spec' },
  ];

  readonly picked = signal<string | null>(null);
  readonly draft = signal('');

  fill(suggestion: ResolvedPromptSuggestion): void {
    this.draft.set(suggestion.value);
  }
}
