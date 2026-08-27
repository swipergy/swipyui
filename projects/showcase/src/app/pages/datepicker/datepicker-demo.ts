import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DatePicker } from '@swipergy/swipyui/datepicker';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `<syui-datepicker placeholder="mm/dd/yyyy" [formControl]="date" />`;

const FORMAT = `<!-- dd = day, mm = month, yy = 4-digit year, y = 2-digit year -->
<syui-datepicker dateFormat="dd.mm.yy" placeholder="dd.mm.yyyy" [formControl]="german" />
<syui-datepicker dateFormat="yy-mm-dd" placeholder="yyyy-mm-dd" [formControl]="iso" />`;

const MIN_MAX = `// Only the next 30 days are selectable.
minDate = new Date();
maxDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

<syui-datepicker [minDate]="minDate" [maxDate]="maxDate" [formControl]="booking" />`;

const RANGE = `readonly vacation = new FormControl<Date[] | null>(null);

<syui-datepicker selectionMode="range" placeholder="From - to" [formControl]="vacation" />`;

const INLINE = `<syui-datepicker inline [formControl]="inlineDate" />`;

const MONTH_VIEW = `<!-- Click the month/year label in the header to jump by month, chevrons then move by year. -->
<syui-datepicker dateFormat="mm/yy" placeholder="Pick any month" [formControl]="monthNav" />`;

const PROPS: PropRow[] = [
  {
    name: 'selectionMode',
    type: "'single' | 'range'",
    default: "'single'",
    description: 'range selects a from–to pair inside one calendar; the value becomes a Date[].',
  },
  {
    name: 'dateFormat',
    type: 'string',
    default: "'mm/dd/yy'",
    description: 'Display/parse format from dd, mm, yy (4-digit year) and y (2-digit year) tokens.',
  },
  { name: 'minDate', type: 'Date', description: 'Earliest selectable date (inclusive).' },
  { name: 'maxDate', type: 'Date', description: 'Latest selectable date (inclusive).' },
  { name: 'disabledDates', type: 'Date[]', description: 'Individual dates that cannot be selected.' },
  {
    name: 'firstDayOfWeek',
    type: 'number',
    default: '0',
    description: 'First day of the week: 0 = Sunday, 1 = Monday, …',
  },
  { name: 'placeholder', type: 'string', description: 'Text shown while the input is empty.' },
  { name: 'fluid', type: 'boolean', default: 'false', description: 'Stretches the field to the container width.' },
  {
    name: 'readonlyInput',
    type: 'boolean',
    default: 'false',
    description: 'Prevents typing; dates can only be picked from the calendar.',
  },
  { name: 'showIcon', type: 'boolean', default: 'true', description: 'Shows the calendar trigger button.' },
  {
    name: 'inline',
    type: 'boolean',
    default: 'false',
    description: 'Renders the calendar directly, without input or overlay.',
  },
  { name: 'locale', type: 'string', default: "'en-US'", description: 'Locale for month and weekday names.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the datepicker.' },
  { name: 'onShow', type: 'output<void>', description: 'Emitted when the calendar opens.' },
  { name: 'onHide', type: 'output<void>', description: 'Emitted when the calendar closes.' },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePicker, ReactiveFormsModule, DocsSection, DocsPropTable],
  template: `
    <h1>DatePicker</h1>
    <p class="docs-lead">
      Date-only picker with a text input, a calendar overlay following the ARIA date grid pattern,
      and Intl-based localization.
      <code>import {{ '{' }} DatePicker {{ '}' }} from '&#64;swipergy/swipyui/datepicker';</code>
    </p>

    <docs-section
      title="Basic"
      [code]="basic"
      language="html"
      description="Pick a date from the calendar or type it; invalid text reverts on blur."
    >
      <syui-datepicker placeholder="mm/dd/yyyy" [formControl]="date" />
      <span class="docs-muted">value: {{ date.value?.toDateString() }}</span>
    </docs-section>

    <docs-section
      title="Format"
      [code]="format"
      language="html"
      description="dateFormat controls both display and parsing of typed input."
    >
      <syui-datepicker dateFormat="dd.mm.yy" placeholder="dd.mm.yyyy" [formControl]="german" />
      <syui-datepicker dateFormat="yy-mm-dd" placeholder="yyyy-mm-dd" [formControl]="iso" />
    </docs-section>

    <docs-section
      title="Min / max"
      [code]="minMax"
      language="typescript"
      description="Days outside the range are disabled in the grid, rejected when typed, and month/year navigation stops at the bounds."
    >
      <syui-datepicker [minDate]="minDate" [maxDate]="maxDate" [formControl]="booking" />
    </docs-section>

    <docs-section
      title="Range (from–to)"
      [code]="range"
      language="html"
      description="selectionMode='range' picks a from–to pair inside one calendar: the first click sets the start, the second the end (a click before the start restarts the range). The value is a Date[] and typed input accepts 'start - end'."
    >
      <syui-datepicker selectionMode="range" placeholder="From - to" [formControl]="vacation" />
      <span class="docs-muted">
        value:
        {{ vacation.value?.[0]?.toDateString() ?? '—' }} →
        {{ vacation.value?.[1]?.toDateString() ?? '—' }}
      </span>
    </docs-section>

    <docs-section
      title="Inline"
      [code]="inline"
      language="html"
      description="With inline the calendar renders directly into the page, without input or overlay."
    >
      <syui-datepicker inline [formControl]="inlineDate" />
      <span class="docs-muted">value: {{ inlineDate.value?.toDateString() }}</span>
    </docs-section>

    <docs-section
      title="Month view"
      [code]="monthView"
      language="html"
      description="Clicking the month/year label in the header switches to a 3×4 month grid; the chevrons then navigate by year, and picking a month returns to the day grid."
    >
      <syui-datepicker dateFormat="mm/yy" placeholder="Pick any month" [formControl]="monthNav" />
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
})
export class DatePickerDemo {
  readonly basic = BASIC;
  readonly format = FORMAT;
  readonly range = RANGE;
  readonly minMax = MIN_MAX;
  readonly inline = INLINE;
  readonly monthView = MONTH_VIEW;
  readonly props = PROPS;

  readonly minDate = new Date();
  readonly maxDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  readonly date = new FormControl<Date | null>(null);
  readonly german = new FormControl<Date | null>(new Date());
  readonly iso = new FormControl<Date | null>(null);
  readonly booking = new FormControl<Date | null>(null);
  readonly vacation = new FormControl<Date[] | null>(null);
  readonly inlineDate = new FormControl<Date | null>(new Date());
  readonly monthNav = new FormControl<Date | null>(null);
}
