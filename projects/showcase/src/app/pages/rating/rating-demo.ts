import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Rating } from '@swipergy/swipyui/rating';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `<syui-rating [formControl]="score" />`;

const STARS = `<syui-rating [stars]="10" [(value)]="score" />`;

const READONLY = `<syui-rating [value]="4" readonly />`;

const PROPS: PropRow[] = [
  { name: 'stars', type: 'number', default: '5', description: 'Number of stars to render.' },
  {
    name: 'readonly',
    type: 'boolean',
    default: 'false',
    description: 'Shows the value but blocks pointer and keyboard editing.',
  },
  { name: 'value', type: 'model<number | null>', default: 'null', description: 'Current rating.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the rating.' },
  { name: 'ariaLabel', type: 'string', default: "'Rating'", description: 'Accessible name of the radio group.' },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Rating, ReactiveFormsModule, DocsSection, DocsPropTable],
  template: `
    <h1>Rating</h1>
    <p class="docs-lead">
      Star rating built on visually hidden radio inputs, so arrow keys move the selection natively.
      Clicking the selected star clears the value.
      <code>import {{ '{' }} Rating {{ '}' }} from '&#64;swipergy/swipyui/rating';</code>
    </p>

    <docs-section
      title="Basic"
      [code]="basic"
      language="html"
      description="Click a star to rate; click the same star again to clear."
    >
      <syui-rating [formControl]="score" />
      <span class="docs-muted">value: {{ score.value }}</span>
    </docs-section>

    <docs-section title="Custom star count" [code]="stars" language="html">
      <syui-rating [stars]="10" [formControl]="detailed" />
      <span class="docs-muted">value: {{ detailed.value }}</span>
    </docs-section>

    <docs-section title="Readonly" [code]="readonly" language="html">
      <syui-rating [value]="4" readonly />
    </docs-section>

    <docs-section title="Disabled" code='<syui-rating [value]="3" disabled />' language="html">
      <syui-rating [value]="3" disabled />
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
})
export class RatingDemo {
  readonly basic = BASIC;
  readonly stars = STARS;
  readonly readonly = READONLY;
  readonly props = PROPS;

  readonly score = new FormControl<number | null>(3);
  readonly detailed = new FormControl<number | null>(7);
}
