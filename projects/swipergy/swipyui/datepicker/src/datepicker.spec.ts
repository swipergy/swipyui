import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DatePicker } from './datepicker';

@Component({
  imports: [DatePicker, ReactiveFormsModule],
  template: `
    <syui-datepicker
      [formControl]="control"
      [dateFormat]="dateFormat()"
      [minDate]="min()"
      [maxDate]="max()"
      [inline]="inline()"
    />
  `,
})
class Host {
  control = new FormControl<Date | null>(null);
  dateFormat = signal('mm/dd/yy');
  min = signal<Date | undefined>(undefined);
  max = signal<Date | undefined>(undefined);
  inline = signal(false);
}

describe('DatePicker', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('.syui-datepicker-input');
    const trigger: HTMLButtonElement =
      fixture.nativeElement.querySelector('.syui-datepicker-trigger');
    return { fixture, input, trigger };
  }

  function panel(): HTMLElement | null {
    return document.querySelector('.syui-datepicker-panel');
  }

  function dayCell(day: number): HTMLElement {
    const cells = panel()!.querySelectorAll<HTMLElement>(
      '.syui-datepicker-day:not(.syui-datepicker-day-other)',
    );
    return Array.from(cells).find((cell) => cell.textContent!.trim() === String(day))!;
  }

  afterEach(() => {
    document.querySelector('.cdk-overlay-container')?.remove();
  });

  it('formats the value into the input per dateFormat', () => {
    const { fixture, input } = setup();
    fixture.componentInstance.control.setValue(new Date(2026, 1, 3));
    fixture.detectChanges();
    expect(input.value).toBe('02/03/2026');

    fixture.componentInstance.dateFormat.set('dd.mm.y');
    fixture.detectChanges();
    expect(input.value).toBe('03.02.26');
  });

  it('parses typed text into the form value', () => {
    const { fixture, input } = setup();
    input.value = '12/31/2025';
    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const value = fixture.componentInstance.control.value!;
    expect(value.getFullYear()).toBe(2025);
    expect(value.getMonth()).toBe(11);
    expect(value.getDate()).toBe(31);
  });

  it('reverts invalid text and keeps the previous value', () => {
    const { fixture, input } = setup();
    fixture.componentInstance.control.setValue(new Date(2026, 5, 15));
    fixture.detectChanges();

    input.value = '99/99/nope';
    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(input.value).toBe('06/15/2026');
    expect(fixture.componentInstance.control.value!.getDate()).toBe(15);
  });

  it('selects a day from the grid, updates the form and closes', () => {
    const { fixture, trigger } = setup();
    fixture.componentInstance.control.setValue(new Date(2026, 5, 10));
    fixture.detectChanges();

    trigger.click();
    fixture.detectChanges();
    expect(panel()).toBeTruthy();

    dayCell(20).click();
    fixture.detectChanges();

    const value = fixture.componentInstance.control.value!;
    expect(value.getFullYear()).toBe(2026);
    expect(value.getMonth()).toBe(5);
    expect(value.getDate()).toBe(20);
    expect(panel()).toBeNull();
  });

  it('disables days outside minDate/maxDate', () => {
    const { fixture, trigger } = setup();
    fixture.componentInstance.control.setValue(new Date(2026, 5, 15));
    fixture.componentInstance.min.set(new Date(2026, 5, 10));
    fixture.componentInstance.max.set(new Date(2026, 5, 20));
    fixture.detectChanges();

    trigger.click();
    fixture.detectChanges();

    expect(dayCell(5).getAttribute('aria-disabled')).toBe('true');
    expect(dayCell(25).getAttribute('aria-disabled')).toBe('true');
    expect(dayCell(15).getAttribute('aria-disabled')).toBeNull();

    dayCell(25).click();
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value!.getDate()).toBe(15);
  });

  it('moves grid focus with arrow keys and selects with Enter', () => {
    const { fixture, trigger } = setup();
    fixture.componentInstance.control.setValue(new Date(2026, 5, 15));
    fixture.detectChanges();
    trigger.click();
    fixture.detectChanges();

    const focused = () => panel()!.querySelector<HTMLElement>('.syui-datepicker-day[tabindex="0"]');
    expect(focused()!.textContent!.trim()).toBe('15');

    const keys = ['ArrowRight', 'ArrowDown'];
    for (const key of keys) {
      focused()!.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
      fixture.detectChanges();
    }
    expect(focused()!.textContent!.trim()).toBe('23');

    focused()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value!.getDate()).toBe(23);
    expect(panel()).toBeNull();
  });

  it('jumps a month/year back and forth with PageUp/PageDown and Shift', () => {
    const { fixture, trigger } = setup();
    fixture.componentInstance.control.setValue(new Date(2026, 5, 15));
    fixture.detectChanges();
    trigger.click();
    fixture.detectChanges();

    const focused = () => panel()!.querySelector<HTMLElement>('.syui-datepicker-day[tabindex="0"]');
    const title = () => panel()!.querySelector('.syui-datepicker-title')!.textContent;

    focused()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageUp', bubbles: true }));
    fixture.detectChanges();
    expect(title()).toContain('May 2026');

    focused()!.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'PageUp', shiftKey: true, bubbles: true }),
    );
    fixture.detectChanges();
    expect(title()).toContain('May 2025');

    focused()!.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'PageDown', shiftKey: true, bubbles: true }),
    );
    fixture.detectChanges();
    expect(title()).toContain('May 2026');
  });

  it('marks today with aria-current="date"', () => {
    const { fixture, trigger } = setup();
    trigger.click();
    fixture.detectChanges();

    const current = panel()!.querySelector<HTMLElement>('[aria-current="date"]');
    expect(current).toBeTruthy();
    expect(current!.textContent!.trim()).toBe(String(new Date().getDate()));
  });

  it('closes on Escape without selecting', () => {
    const { fixture, trigger } = setup();
    trigger.click();
    fixture.detectChanges();

    panel()!
      .querySelector('.syui-datepicker-day[tabindex="0"]')!
      .dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();

    expect(panel()).toBeNull();
    expect(fixture.componentInstance.control.value).toBeNull();
  });

  describe('range mode', () => {
    @Component({
      imports: [DatePicker, ReactiveFormsModule],
      template: `<syui-datepicker selectionMode="range" [formControl]="control" />`,
    })
    class RangeHost {
      control = new FormControl<Date[] | null>(null);
    }

    function setupRange() {
      const fixture = TestBed.createComponent(RangeHost);
      fixture.detectChanges();
      const input: HTMLInputElement = fixture.nativeElement.querySelector('.syui-datepicker-input');
      const trigger: HTMLButtonElement =
        fixture.nativeElement.querySelector('.syui-datepicker-trigger');
      return { fixture, input, trigger };
    }

    it('selects start then end, keeping the panel open in between', () => {
      const { fixture, trigger, input } = setupRange();
      // Pins the view to June 2026; clicking before the 15th restarts the range.
      fixture.componentInstance.control.setValue([new Date(2026, 5, 15)]);
      fixture.detectChanges();
      trigger.click();
      fixture.detectChanges();

      dayCell(10).click();
      fixture.detectChanges();
      expect(fixture.componentInstance.control.value).toEqual([new Date(2026, 5, 10)]);
      expect(panel()).toBeTruthy();

      dayCell(20).click();
      fixture.detectChanges();
      expect(fixture.componentInstance.control.value).toEqual([
        new Date(2026, 5, 10),
        new Date(2026, 5, 20),
      ]);
      expect(panel()).toBeNull();
      expect(input.value).toBe('06/10/2026 - 06/20/2026');
    });

    it('highlights the days between the endpoints', () => {
      const { fixture, trigger } = setupRange();
      fixture.componentInstance.control.setValue([new Date(2026, 5, 10), new Date(2026, 5, 13)]);
      fixture.detectChanges();
      trigger.click();
      fixture.detectChanges();

      expect(dayCell(10).classList).toContain('syui-datepicker-day-selected');
      expect(dayCell(13).classList).toContain('syui-datepicker-day-selected');
      expect(dayCell(11).classList).toContain('syui-datepicker-day-in-range');
      expect(dayCell(12).classList).toContain('syui-datepicker-day-in-range');
      expect(dayCell(9).classList).not.toContain('syui-datepicker-day-in-range');
      expect(dayCell(14).classList).not.toContain('syui-datepicker-day-in-range');
    });

    it('restarts the range when clicking before the start', () => {
      const { fixture, trigger } = setupRange();
      fixture.componentInstance.control.setValue([new Date(2026, 5, 15)]);
      fixture.detectChanges();
      trigger.click();
      fixture.detectChanges();

      dayCell(5).click();
      fixture.detectChanges();
      expect(fixture.componentInstance.control.value).toEqual([new Date(2026, 5, 5)]);
      expect(panel()).toBeTruthy();
    });

    it('parses a typed "start - end" range and reverts invalid ones', () => {
      const { fixture, input } = setupRange();
      input.value = '06/10/2026 - 06/20/2026';
      input.dispatchEvent(new Event('change'));
      fixture.detectChanges();
      expect(fixture.componentInstance.control.value).toEqual([
        new Date(2026, 5, 10),
        new Date(2026, 5, 20),
      ]);

      input.value = '06/20/2026 - 06/10/2026';
      input.dispatchEvent(new Event('change'));
      fixture.detectChanges();
      expect(input.value).toBe('06/10/2026 - 06/20/2026');
    });
  });

  it('renders the calendar without input or overlay when inline', () => {
    const { fixture } = setup();
    fixture.componentInstance.inline.set(true);
    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelector('.syui-datepicker-input')).toBeNull();
    expect(host.querySelector('.syui-datepicker-inline .syui-datepicker-grid')).toBeTruthy();
    expect(panel()).toBeNull();
  });

  it('shows invalid styling from reactive-form validators after touch', async () => {
    const { fixture, input } = setup();
    fixture.detectChanges();
    await fixture.whenStable();
    const container = () => fixture.nativeElement.querySelector('.syui-datepicker');
    const control = fixture.componentInstance.control;

    control.addValidators([(c) => (c.value ? null : { required: true })]);
    control.updateValueAndValidity();
    fixture.detectChanges();
    expect(container().classList).not.toContain('syui-invalid');

    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(container().classList).toContain('syui-invalid');

    control.setValue(new Date(2026, 5, 15));
    fixture.detectChanges();
    expect(container().classList).not.toContain('syui-invalid');
  });

  it('disables via the forms API', () => {
    const { fixture, input, trigger } = setup();
    fixture.componentInstance.control.disable();
    fixture.detectChanges();

    expect(input.disabled).toBe(true);
    expect(trigger.disabled).toBe(true);
    trigger.click();
    fixture.detectChanges();
    expect(panel()).toBeNull();
  });
});
