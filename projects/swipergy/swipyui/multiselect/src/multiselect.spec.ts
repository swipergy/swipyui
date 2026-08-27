import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SelectOption } from '@swipergy/swipyui/select';
import { MultiSelect } from './multiselect';

@Component({
  imports: [MultiSelect, ReactiveFormsModule],
  template: `<syui-multiselect
    [options]="options"
    placeholder="Pick cities"
    [display]="display()"
    [filter]="filter()"
    [formControl]="control"
  />`,
})
class Host {
  options: SelectOption[] = [
    { label: 'Berlin', value: 'BER' },
    { label: 'Hamburg', value: 'HAM', disabled: true },
    { label: 'Munich', value: 'MUC' },
    { label: 'Cologne', value: 'CGN' },
  ];
  display = signal<'comma' | 'chip'>('comma');
  filter = signal(false);
  control = new FormControl<string[] | null>(null);
}

describe('MultiSelect', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const trigger: HTMLElement = fixture.nativeElement.querySelector('.syui-multiselect');
    return { fixture, trigger };
  }

  function panel(): HTMLElement | null {
    return document.querySelector('.syui-multiselect-panel');
  }

  afterEach(() => {
    document.querySelector('.cdk-overlay-container')?.remove();
  });

  it('shows the placeholder until values are set', () => {
    const { fixture, trigger } = setup();
    expect(trigger.textContent).toContain('Pick cities');

    fixture.componentInstance.control.setValue(['BER', 'MUC']);
    fixture.detectChanges();
    expect(trigger.textContent).toContain('Berlin, Munich');
  });

  it('summarizes past maxSelectedLabels', () => {
    const { fixture, trigger } = setup();
    fixture.componentInstance.control.setValue(['BER', 'HAM', 'MUC', 'CGN']);
    fixture.detectChanges();
    expect(trigger.textContent).toContain('4 items selected');
  });

  it('toggles options by click and keeps the panel open', () => {
    const { fixture, trigger } = setup();
    trigger.click();
    fixture.detectChanges();

    const options = panel()!.querySelectorAll('.syui-multiselect-option');
    (options[0] as HTMLElement).click();
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toEqual(['BER']);
    expect(panel()).toBeTruthy();

    (options[0] as HTMLElement).click();
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toEqual([]);
  });

  it('toggles the active option with the keyboard, skipping disabled options', () => {
    const { fixture, trigger } = setup();
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();
    expect(panel()).toBeTruthy();

    // active starts on Berlin, next ArrowDown skips disabled Hamburg
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toEqual(['MUC']);
    expect(panel()).toBeTruthy();

    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(panel()).toBeNull();
  });

  it('selects and clears all enabled options via toggle-all', () => {
    const { fixture, trigger } = setup();
    trigger.click();
    fixture.detectChanges();

    const toggleAll = panel()!.querySelector<HTMLInputElement>('.syui-multiselect-toggle-all')!;
    toggleAll.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toEqual(['BER', 'MUC', 'CGN']);

    toggleAll.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toEqual([]);
  });

  it('announces the filtered result count via a status live region', () => {
    const { fixture, trigger } = setup();
    fixture.componentInstance.filter.set(true);
    fixture.detectChanges();
    trigger.click();
    fixture.detectChanges();

    const status = () => panel()!.querySelector('[role="status"]')!;
    expect(status().textContent).toContain('4 results available');

    const input = panel()!.querySelector<HTMLInputElement>('.syui-multiselect-filter')!;
    input.value = 'ber';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(status().textContent).toContain('1 result available');
  });

  function visibleChips(fixture: { nativeElement: HTMLElement }): NodeListOf<HTMLElement> {
    return fixture.nativeElement.querySelectorAll(
      '.syui-multiselect-chips:not(.syui-multiselect-chips-measure) .syui-multiselect-chip-item',
    );
  }

  it('renders chips with remove buttons in chip display', () => {
    const { fixture } = setup();
    fixture.componentInstance.display.set('chip');
    fixture.componentInstance.control.setValue(['BER', 'MUC']);
    fixture.detectChanges();

    const chips = visibleChips(fixture);
    expect(chips.length).toBe(2);

    const remove: HTMLButtonElement = chips[0].querySelector('.syui-multiselect-chip-remove')!;
    remove.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toEqual(['MUC']);
  });

  it('collapses chips that do not fit the trigger into a "+n" chip', async () => {
    // jsdom has no layout, so fake it: a 100px chips row holding 60px chips
    // with a 4px gap — only one chip fits next to the "+n" chip.
    const proto = HTMLElement.prototype;
    const original = {
      clientWidth: Object.getOwnPropertyDescriptor(proto, 'clientWidth'),
      offsetWidth: Object.getOwnPropertyDescriptor(proto, 'offsetWidth'),
      offsetLeft: Object.getOwnPropertyDescriptor(proto, 'offsetLeft'),
    };
    Object.defineProperty(proto, 'clientWidth', { configurable: true, get: () => 100 });
    Object.defineProperty(proto, 'offsetWidth', { configurable: true, get: () => 60 });
    Object.defineProperty(proto, 'offsetLeft', {
      configurable: true,
      get(this: HTMLElement) {
        let index = 0;
        for (let el = this.previousElementSibling; el; el = el.previousElementSibling) {
          index++;
        }
        return index * 64;
      },
    });

    try {
      const { fixture } = setup();
      fixture.componentInstance.display.set('chip');
      fixture.componentInstance.control.setValue(['BER', 'MUC', 'CGN']);
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const chips = visibleChips(fixture);
      expect(chips.length).toBe(2);
      expect(chips[0].textContent).toContain('Berlin');
      const overflow = chips[1];
      expect(overflow.classList.contains('syui-multiselect-chip-overflow')).toBe(true);
      expect(overflow.textContent).toContain('+2');
      expect(overflow.getAttribute('title')).toBe('Munich, Cologne');
    } finally {
      for (const [key, descriptor] of Object.entries(original)) {
        if (descriptor) {
          Object.defineProperty(proto, key, descriptor);
        } else {
          delete (proto as unknown as Record<string, unknown>)[key];
        }
      }
    }
  });

  it('does not open when disabled via the forms API', () => {
    const { fixture, trigger } = setup();
    fixture.componentInstance.control.disable();
    fixture.detectChanges();

    trigger.click();
    fixture.detectChanges();
    expect(panel()).toBeNull();
    expect(trigger.getAttribute('aria-disabled')).toBe('true');
  });
});
