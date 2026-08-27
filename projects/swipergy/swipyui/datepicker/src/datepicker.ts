import { NgTemplateOutlet } from '@angular/common';
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
  linkedSignal,
  numberAttribute,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { BaseValueControl, uniqueId } from '@swipergy/swipyui/core';

/** One cell of the day grid. */
interface DayCell {
  date: Date;
  day: number;
  otherMonth: boolean;
  disabled: boolean;
  today: boolean;
  selected: boolean;
  /** Strictly between the two endpoints of a selected range. */
  inRange: boolean;
  rangeStart: boolean;
  rangeEnd: boolean;
  focused: boolean;
  ariaLabel: string;
}

/** One cell of the month-picker grid. */
interface MonthCell {
  index: number;
  label: string;
  disabled: boolean;
  current: boolean;
}

/**
 * Date-only picker: a text input with a calendar button that opens a month
 * grid in a CDK overlay (or renders it directly with `inline`). Follows the
 * WAI-ARIA date grid pattern: arrow keys move by day/week, PageUp/PageDown by
 * month (by year with Shift), Home/End to the week bounds, Enter selects and
 * Escape closes.
 *
 * Typed input is parsed against `dateFormat` (`dd`, `mm`,
 * `yy` = 4-digit year, `y` = 2-digit year); invalid text reverts. Month and
 * weekday names come from `Intl.DateTimeFormat` for the given `locale`.
 *
 * With `selectionMode="range"` the value is a `Date[]`: the first click
 * selects the start (`[start]`), the second the end (`[start, end]`); a click
 * before the start restarts the range. Days in between are highlighted and
 * typed input accepts `start - end`.
 *
 * ```html
 * <syui-datepicker [formField]="f.birthday" />
 * <syui-datepicker dateFormat="dd.mm.yy" [minDate]="min" [formControl]="date" />
 * <syui-datepicker inline [(value)]="date" />
 * <syui-datepicker selectionMode="range" [(value)]="vacation" />
 * ```
 */
@Component({
  selector: 'syui-datepicker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './datepicker.css',
  imports: [NgTemplateOutlet],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DatePicker), multi: true },
  ],
  template: `
    @if (inline()) {
      <div class="syui-datepicker-inline">
        <ng-container [ngTemplateOutlet]="calendar" />
      </div>
    } @else {
      <span
        #container
        class="syui-datepicker"
        [class.syui-fluid]="fluid()"
        [class.syui-invalid]="showInvalid()"
        [class.syui-datepicker-disabled]="isDisabled()"
      >
        <input
          #inputEl
          type="text"
          class="syui-datepicker-input"
          autocomplete="off"
          role="combobox"
          aria-haspopup="dialog"
          [attr.aria-expanded]="open()"
          [attr.aria-controls]="open() ? panelId : null"
          [attr.aria-label]="ariaLabel() || null"
          [attr.aria-labelledby]="ariaLabelledby() || null"
          [attr.aria-describedby]="ariaDescribedby() || null"
          [attr.aria-invalid]="showInvalid() || null"
          [value]="displayValue()"
          [placeholder]="placeholder() ?? ''"
          [readOnly]="readonlyInput()"
          [disabled]="isDisabled()"
          (click)="show()"
          (change)="onInputChange($event)"
          (keydown)="onInputKeydown($event)"
          (blur)="onTouched()"
        />
        @if (showIcon()) {
          <button
            type="button"
            class="syui-datepicker-trigger"
            aria-label="Choose date"
            aria-haspopup="dialog"
            [attr.aria-expanded]="open()"
            [disabled]="isDisabled()"
            (click)="toggle()"
            (keydown.escape)="hide()"
          >
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <rect x="1.75" y="2.75" width="12.5" height="11.5" rx="1.5" stroke="currentColor" stroke-width="1.5" />
              <path d="M1.75 6.25h12.5" stroke="currentColor" stroke-width="1.5" />
              <path d="M5 1v3M11 1v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
          </button>
        }
      </span>

      <ng-template #panel>
        <div class="syui-datepicker-panel" role="dialog" aria-label="Choose date" [id]="panelId">
          <ng-container [ngTemplateOutlet]="calendar" />
        </div>
      </ng-template>
    }

    <ng-template #calendar>
      <div class="syui-datepicker-calendar" (keydown.escape)="onCalendarEscape()">
        <div class="syui-datepicker-header">
          <button
            type="button"
            class="syui-datepicker-nav"
            [attr.aria-label]="view() === 'date' ? 'Previous month' : 'Previous year'"
            [disabled]="prevDisabled()"
            (click)="navigate(-1)"
          >
            <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M7.5 2.5L4 6l3.5 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
          @if (view() === 'date') {
            <!-- No static aria-label: the visible month/year names the button (and the
                 grid via aria-labelledby), so aria-live announces month changes. -->
            <button
              type="button"
              class="syui-datepicker-title"
              aria-live="polite"
              [id]="titleId"
              (click)="showMonthView($event)"
            >
              {{ monthYearLabel() }}
            </button>
          } @else {
            <span class="syui-datepicker-title" aria-live="polite" [id]="titleId">
              {{ viewDate().getFullYear() }}
            </span>
          }
          <button
            type="button"
            class="syui-datepicker-nav"
            [attr.aria-label]="view() === 'date' ? 'Next month' : 'Next year'"
            [disabled]="nextDisabled()"
            (click)="navigate(1)"
          >
            <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M4.5 2.5L8 6l-3.5 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </div>

        @if (view() === 'date') {
          <table class="syui-datepicker-grid" role="grid" [attr.aria-labelledby]="titleId">
            <thead>
              <tr>
                @for (weekday of weekdays(); track $index) {
                  <th class="syui-datepicker-weekday" scope="col" [attr.abbr]="weekday.long">
                    {{ weekday.short }}
                  </th>
                }
              </tr>
            </thead>
            <tbody (keydown)="onGridKeydown($event)">
              @for (week of weeks(); track $index) {
                <tr>
                  @for (cell of week; track cell.date.getTime()) {
                    <td
                      role="gridcell"
                      class="syui-datepicker-day"
                      [class.syui-datepicker-day-other]="cell.otherMonth"
                      [class.syui-datepicker-day-today]="cell.today"
                      [class.syui-datepicker-day-selected]="cell.selected"
                      [class.syui-datepicker-day-in-range]="cell.inRange"
                      [class.syui-datepicker-day-range-start]="cell.rangeStart"
                      [class.syui-datepicker-day-range-end]="cell.rangeEnd"
                      [class.syui-datepicker-day-disabled]="cell.disabled"
                      [attr.tabindex]="cell.otherMonth ? null : cell.focused ? 0 : -1"
                      [attr.aria-selected]="cell.otherMonth ? null : cell.selected"
                      [attr.aria-current]="cell.today && !cell.otherMonth ? 'date' : null"
                      [attr.aria-disabled]="cell.disabled || null"
                      [attr.aria-label]="cell.ariaLabel"
                      (click)="selectCell(cell)"
                    >
                      {{ cell.day }}
                    </td>
                  }
                </tr>
              }
            </tbody>
          </table>
        } @else {
          <div class="syui-datepicker-months" (keydown)="onMonthsKeydown($event)">
            @for (month of months(); track month.index) {
              <button
                type="button"
                class="syui-datepicker-month"
                [class.syui-datepicker-month-current]="month.current"
                [disabled]="month.disabled"
                (click)="selectMonth($event, month.index)"
              >
                {{ month.label }}
              </button>
            }
          </div>
        }
      </div>
    </ng-template>
  `,
})
export class DatePicker extends BaseValueControl<Date | Date[]> {
  /** Display/parse format built from `dd`, `mm`, `yy` (4-digit) and `y` (2-digit) tokens. */
  readonly dateFormat = input('mm/dd/yy');
  /** `range` selects a from–to pair of dates; the value becomes a `Date[]`. */
  readonly selectionMode = input<'single' | 'range'>('single');
  /** Earliest selectable date (inclusive, time of day ignored). */
  readonly minDate = input<Date>();
  /** Latest selectable date (inclusive, time of day ignored). */
  readonly maxDate = input<Date>();
  /** Individual dates that cannot be selected. */
  readonly disabledDates = input<Date[]>();
  /** First day of the week: 0 = Sunday (default), 1 = Monday, … */
  readonly firstDayOfWeek = input(0, { transform: numberAttribute });
  readonly placeholder = input<string>();
  /** Stretches the field to the width of its container. */
  readonly fluid = input(false, { transform: booleanAttribute });
  /** Prevents typing; the calendar becomes the only way to pick a date. */
  readonly readonlyInput = input(false, { transform: booleanAttribute });
  /** Shows the calendar trigger button next to the input. */
  readonly showIcon = input(true, { transform: booleanAttribute });
  /** Renders the calendar directly, without input or overlay. */
  readonly inline = input(false, { transform: booleanAttribute });
  /** BCP 47 locale used for month and weekday names. */
  readonly locale = input('en-US');
  readonly onShow = output<void>();
  readonly onHide = output<void>();

  private readonly container = viewChild<ElementRef<HTMLElement>>('container');
  private readonly inputEl = viewChild<ElementRef<HTMLInputElement>>('inputEl');
  private readonly panelTemplate = viewChild<TemplateRef<unknown>>('panel');

  private readonly overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private overlayRef?: OverlayRef;

  protected readonly panelId = uniqueId('syui-datepicker-panel');
  protected readonly titleId = uniqueId('syui-datepicker-title');
  protected readonly open = signal(false);
  /** 'date' shows the day grid, 'month' the 3×4 month picker. */
  protected readonly view = signal<'date' | 'month'>('date');

  /** Start and end of the selected range; `null`s outside `range` mode. */
  private readonly range = computed<[Date | null, Date | null]>(() => {
    const value = this.value();
    if (this.selectionMode() !== 'range' || !Array.isArray(value)) {
      return [null, null];
    }
    return [value[0] ? stripTime(value[0]) : null, value[1] ? stripTime(value[1]) : null];
  });

  /** The date the calendar opens on: the single value or the start of the range. */
  private readonly anchorDate = computed(() => {
    const value = this.value();
    const anchor = Array.isArray(value) ? (value[1] ?? value[0]) : value;
    return anchor ? stripTime(anchor) : null;
  });

  /** First day of the displayed month; follows the value, writable for navigation. */
  protected readonly viewDate = linkedSignal(() => startOfMonth(this.anchorDate() ?? today()));
  /** Roving-tabindex position inside the day grid. */
  protected readonly focusedDate = linkedSignal(() => this.anchorDate() ?? today());

  protected readonly displayValue = computed(() => {
    const value = this.value();
    const format = this.dateFormat();
    if (Array.isArray(value)) {
      const [start, end] = value;
      if (!start) {
        return '';
      }
      return end ? `${this.format(start, format)} - ${this.format(end, format)}` : this.format(start, format);
    }
    return value ? this.format(value, format) : '';
  });

  protected readonly monthYearLabel = computed(() =>
    new Intl.DateTimeFormat(this.locale(), { month: 'long', year: 'numeric' }).format(
      this.viewDate(),
    ),
  );

  protected readonly weekdays = computed(() => {
    const short = new Intl.DateTimeFormat(this.locale(), { weekday: 'short' });
    const long = new Intl.DateTimeFormat(this.locale(), { weekday: 'long' });
    const first = this.firstDayOfWeek();
    // 2021-08-01 is a Sunday; offset from it to honour firstDayOfWeek.
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(2021, 7, 1 + ((first + i) % 7));
      return { short: short.format(day), long: long.format(day) };
    });
  });

  protected readonly weeks = computed<DayCell[][]>(() => {
    const view = this.viewDate();
    const value = this.value();
    const selected = value instanceof Date ? stripTime(value) : null;
    const [rangeStart, rangeEnd] = this.range();
    const focused = clampToMonth(this.focusedDate(), view);
    const now = today();
    const fullFormat = new Intl.DateTimeFormat(this.locale(), {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const lead = (startOfMonth(view).getDay() - this.firstDayOfWeek() + 7) % 7;
    const rows = Math.ceil((lead + daysInMonth(view)) / 7);
    const cursor = new Date(view.getFullYear(), view.getMonth(), 1 - lead);
    const weeks: DayCell[][] = [];
    for (let row = 0; row < rows; row++) {
      const week: DayCell[] = [];
      for (let col = 0; col < 7; col++) {
        const date = new Date(cursor);
        const otherMonth = date.getMonth() !== view.getMonth();
        const isStart = rangeStart !== null && sameDate(date, rangeStart);
        const isEnd = rangeEnd !== null && sameDate(date, rangeEnd);
        week.push({
          date,
          day: date.getDate(),
          otherMonth,
          disabled: otherMonth || this.isDateDisabled(date),
          today: sameDate(date, now),
          selected: (selected !== null && sameDate(date, selected)) || isStart || isEnd,
          inRange:
            rangeStart !== null &&
            rangeEnd !== null &&
            date.getTime() > rangeStart.getTime() &&
            date.getTime() < rangeEnd.getTime(),
          // Corner flattening only once the range is complete.
          rangeStart: isStart && rangeEnd !== null,
          rangeEnd: isEnd,
          focused: !otherMonth && sameDate(date, focused),
          ariaLabel: fullFormat.format(date),
        });
        cursor.setDate(cursor.getDate() + 1);
      }
      weeks.push(week);
    }
    return weeks;
  });

  protected readonly months = computed<MonthCell[]>(() => {
    const year = this.viewDate().getFullYear();
    const current = this.viewDate().getMonth();
    const format = new Intl.DateTimeFormat(this.locale(), { month: 'short' });
    return Array.from({ length: 12 }, (_, index) => ({
      index,
      label: format.format(new Date(year, index, 1)),
      disabled: this.isMonthDisabled(year, index),
      current: index === current,
    }));
  });

  protected readonly prevDisabled = computed(() => {
    const min = this.minDate();
    if (!min) {
      return false;
    }
    const view = this.viewDate();
    return this.view() === 'date'
      ? view.getTime() <= startOfMonth(min).getTime()
      : view.getFullYear() <= min.getFullYear();
  });

  protected readonly nextDisabled = computed(() => {
    const max = this.maxDate();
    if (!max) {
      return false;
    }
    const view = this.viewDate();
    return this.view() === 'date'
      ? view.getTime() >= startOfMonth(max).getTime()
      : view.getFullYear() >= max.getFullYear();
  });

  constructor() {
    super();
    inject(DestroyRef).onDestroy(() => this.overlayRef?.dispose());
  }

  // ---------------------------------------------------------------- overlay

  protected toggle(): void {
    if (this.open()) {
      this.hide();
      return;
    }
    this.show();
    // The trigger opens a dialog, so focus moves onto the focusable day cell.
    this.focusGridCell();
  }

  protected show(): void {
    if (this.open() || this.inline() || this.isDisabled()) {
      return;
    }
    this.overlayRef ??= this.createOverlay();
    this.overlayRef.attach(new TemplatePortal(this.panelTemplate()!, this.viewContainerRef));
    const base = this.anchorDate() ?? today();
    this.viewDate.set(startOfMonth(base));
    this.focusedDate.set(base);
    this.view.set('date');
    this.open.set(true);
    this.onShow.emit();
  }

  protected hide(): void {
    if (!this.open()) {
      return;
    }
    this.overlayRef?.detach();
    this.open.set(false);
    this.onHide.emit();
  }

  protected onCalendarEscape(): void {
    if (this.inline()) {
      this.view.set('date');
      return;
    }
    this.hide();
    this.inputEl()?.nativeElement.focus();
  }

  private createOverlay(): OverlayRef {
    const container = this.container()!.nativeElement;
    const overlayRef = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(container)
        .withPositions([
          { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
          { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
        ]),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
    });
    overlayRef.outsidePointerEvents().subscribe((event) => {
      if (!container.contains(event.target as Node)) {
        this.hide();
      }
    });
    return overlayRef;
  }

  private focusGridCell(): void {
    setTimeout(() => {
      const root = this.inline() ? this.host.nativeElement : this.overlayRef?.overlayElement;
      root?.querySelector<HTMLElement>('.syui-datepicker-day[tabindex="0"]')?.focus();
    });
  }

  // ------------------------------------------------------------------ input

  protected onInputChange(event: Event): void {
    const element = event.target as HTMLInputElement;
    const text = element.value.trim();
    if (!text) {
      this.updateValue(null);
    } else if (this.selectionMode() === 'range') {
      this.parseRangeInput(text);
    } else {
      const parsed = this.parse(text, this.dateFormat());
      if (parsed && !this.isDateDisabled(parsed)) {
        this.updateValue(parsed);
      }
    }
    // Normalizes valid input to the canonical format and reverts invalid text.
    element.value = this.displayValue();
  }

  /** Accepts `start - end` (or a single date as an open range) in `range` mode. */
  private parseRangeInput(text: string): void {
    const format = this.dateFormat();
    const parts = text.split(' - ');
    if (parts.length === 1) {
      const start = this.parse(parts[0].trim(), format);
      if (start && !this.isDateDisabled(start)) {
        this.updateValue([start]);
      }
      return;
    }
    if (parts.length !== 2) {
      return;
    }
    const start = this.parse(parts[0].trim(), format);
    const end = this.parse(parts[1].trim(), format);
    if (
      start &&
      end &&
      start.getTime() <= end.getTime() &&
      !this.isDateDisabled(start) &&
      !this.isDateDisabled(end)
    ) {
      this.updateValue([start, end]);
    }
  }

  protected onInputKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.show();
      this.focusGridCell();
    } else if (event.key === 'Escape') {
      this.hide();
    }
  }

  // -------------------------------------------------------------- day grid

  protected selectCell(cell: DayCell): void {
    if (cell.disabled || cell.otherMonth) {
      return;
    }
    this.selectDate(cell.date);
  }

  private selectDate(date: Date): void {
    const day = stripTime(date);
    if (this.selectionMode() === 'range') {
      const value = this.value();
      const start = Array.isArray(value) && !value[1] ? (value[0] ?? null) : null;
      if (!start || day.getTime() < start.getTime()) {
        // No open range (or clicked before its start): begin a new one and
        // keep the calendar open for the end date.
        this.updateValue([day]);
        this.onTouched();
        this.focusedDate.set(day);
        return;
      }
      this.updateValue([start, day]);
    } else {
      this.updateValue(day);
    }
    this.onTouched();
    if (!this.inline()) {
      this.hide();
      this.inputEl()?.nativeElement.focus();
    }
  }

  protected onGridKeydown(event: KeyboardEvent): void {
    const focused = this.focusedDate();
    let target: Date | null = null;
    switch (event.key) {
      case 'ArrowRight':
        target = addDays(focused, 1);
        break;
      case 'ArrowLeft':
        target = addDays(focused, -1);
        break;
      case 'ArrowDown':
        target = addDays(focused, 7);
        break;
      case 'ArrowUp':
        target = addDays(focused, -7);
        break;
      case 'PageUp':
        target = addMonths(focused, event.shiftKey ? -12 : -1);
        break;
      case 'PageDown':
        target = addMonths(focused, event.shiftKey ? 12 : 1);
        break;
      case 'Home':
        target = addDays(focused, -this.weekdayIndex(focused));
        break;
      case 'End':
        target = addDays(focused, 6 - this.weekdayIndex(focused));
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!this.isDateDisabled(focused)) {
          this.selectDate(focused);
        }
        return;
      default:
        return;
    }
    event.preventDefault();
    this.moveFocus(target);
  }

  private moveFocus(target: Date): void {
    const min = this.minDate();
    const max = this.maxDate();
    if (min && target.getTime() < stripTime(min).getTime()) {
      target = stripTime(min);
    }
    if (max && target.getTime() > stripTime(max).getTime()) {
      target = stripTime(max);
    }
    this.focusedDate.set(target);
    if (!sameMonth(target, this.viewDate())) {
      this.viewDate.set(startOfMonth(target));
    }
    this.focusGridCell();
  }

  private weekdayIndex(date: Date): number {
    return (date.getDay() - this.firstDayOfWeek() + 7) % 7;
  }

  // ------------------------------------------------------------ month view

  protected showMonthView(event: Event): void {
    this.view.set('month');
    const calendar = (event.currentTarget as HTMLElement).closest('.syui-datepicker-calendar');
    setTimeout(() => {
      const months = calendar?.querySelectorAll<HTMLButtonElement>('.syui-datepicker-month');
      const current = calendar?.querySelector<HTMLButtonElement>(
        '.syui-datepicker-month-current:enabled',
      );
      (current ?? months?.[0])?.focus();
    });
  }

  protected selectMonth(event: Event, month: number): void {
    const view = new Date(this.viewDate().getFullYear(), month, 1);
    this.viewDate.set(view);
    this.focusedDate.set(clampToMonth(this.focusedDate(), view));
    this.view.set('date');
    const calendar = (event.currentTarget as HTMLElement).closest('.syui-datepicker-calendar');
    setTimeout(() =>
      calendar?.querySelector<HTMLElement>('.syui-datepicker-day[tabindex="0"]')?.focus(),
    );
  }

  protected navigate(delta: number): void {
    if (this.view() === 'date') {
      const view = addMonths(this.viewDate(), delta);
      this.viewDate.set(startOfMonth(view));
      this.focusedDate.set(clampToMonth(this.focusedDate(), view));
    } else {
      const view = this.viewDate();
      this.viewDate.set(new Date(view.getFullYear() + delta, view.getMonth(), 1));
    }
  }

  protected onMonthsKeydown(event: KeyboardEvent): void {
    const deltas: Record<string, number> = {
      ArrowRight: 1,
      ArrowLeft: -1,
      ArrowDown: 3,
      ArrowUp: -3,
    };
    const delta = deltas[event.key];
    if (delta === undefined && event.key !== 'Home' && event.key !== 'End') {
      return;
    }
    event.preventDefault();
    const buttons = Array.from(
      (event.currentTarget as HTMLElement).querySelectorAll<HTMLButtonElement>(
        '.syui-datepicker-month',
      ),
    );
    const index = buttons.indexOf(event.target as HTMLButtonElement);
    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? buttons.length - 1
          : Math.min(Math.max(index + delta, 0), buttons.length - 1);
    buttons[next]?.focus();
  }

  // ------------------------------------------------------- date validation

  private isDateDisabled(date: Date): boolean {
    const time = stripTime(date).getTime();
    const min = this.minDate();
    if (min && time < stripTime(min).getTime()) {
      return true;
    }
    const max = this.maxDate();
    if (max && time > stripTime(max).getTime()) {
      return true;
    }
    return this.disabledDates()?.some((disabled) => sameDate(disabled, date)) ?? false;
  }

  private isMonthDisabled(year: number, month: number): boolean {
    const min = this.minDate();
    if (min && new Date(year, month + 1, 0).getTime() < stripTime(min).getTime()) {
      return true;
    }
    const max = this.maxDate();
    return !!max && new Date(year, month, 1).getTime() > stripTime(max).getTime();
  }

  // ------------------------------------------------------ format / parse

  private format(date: Date, format: string): string {
    let out = '';
    for (let i = 0; i < format.length; ) {
      if (format.startsWith('dd', i)) {
        out += String(date.getDate()).padStart(2, '0');
        i += 2;
      } else if (format.startsWith('mm', i)) {
        out += String(date.getMonth() + 1).padStart(2, '0');
        i += 2;
      } else if (format.startsWith('yy', i)) {
        out += String(date.getFullYear()).padStart(4, '0');
        i += 2;
      } else if (format[i] === 'y') {
        out += String(date.getFullYear() % 100).padStart(2, '0');
        i += 1;
      } else {
        out += format[i];
        i += 1;
      }
    }
    return out;
  }

  private parse(text: string, format: string): Date | null {
    let day = 1;
    let month = 1;
    let year = today().getFullYear();
    let t = 0;
    const readDigits = (length: number): number | null => {
      const slice = text.slice(t, t + length);
      if (slice.length < length || [...slice].some((char) => char < '0' || char > '9')) {
        return null;
      }
      t += length;
      return Number(slice);
    };
    for (let f = 0; f < format.length; ) {
      let read: number | null;
      if (format.startsWith('dd', f)) {
        if ((read = readDigits(2)) === null) return null;
        day = read;
        f += 2;
      } else if (format.startsWith('mm', f)) {
        if ((read = readDigits(2)) === null) return null;
        month = read;
        f += 2;
      } else if (format.startsWith('yy', f)) {
        if ((read = readDigits(4)) === null) return null;
        year = read;
        f += 2;
      } else if (format[f] === 'y') {
        if ((read = readDigits(2)) === null) return null;
        // Two-digit years pivot ten years ahead of the current year.
        year = read + (read <= (today().getFullYear() % 100) + 10 ? 2000 : 1900);
        f += 1;
      } else {
        if (text[t] !== format[f]) {
          return null;
        }
        t += 1;
        f += 1;
      }
    }
    if (t !== text.length) {
      return null;
    }
    const date = new Date(year, month - 1, day);
    const roundTrips =
      date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
    return roundTrips ? date : null;
  }
}

// -------------------------------------------------------- date-only helpers

function today(): Date {
  return stripTime(new Date());
}

function stripTime(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function daysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function addMonths(date: Date, months: number): Date {
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1);
  return clampToMonth(date, target);
}

/** Same day-of-month inside the target month, clamped to that month's length. */
function clampToMonth(date: Date, month: Date): Date {
  if (sameMonth(date, month)) {
    return date;
  }
  const day = Math.min(date.getDate(), daysInMonth(month));
  return new Date(month.getFullYear(), month.getMonth(), day);
}

function sameDate(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  );
}

function sameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}
