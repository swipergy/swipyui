import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Chip } from './chip';

@Component({
  imports: [Chip],
  template: `
    <syui-chip id="basic" label="Angular" [removable]="removable()" (onRemove)="removed = true" />
    <syui-chip id="projected" label="Ignored"><strong>Custom</strong></syui-chip>
  `,
})
class Host {
  readonly removable = signal(false);
  removed = false;
}

describe('Chip', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const chip: HTMLElement = fixture.nativeElement.querySelector('#basic');
    return { fixture, chip };
  }

  it('renders the label', () => {
    const { chip } = setup();
    expect(chip.querySelector('.syui-chip-label')?.textContent?.trim()).toBe('Angular');
    expect(chip.classList).toContain('syui-chip');
  });

  it('shows the remove button only when removable', () => {
    const { fixture, chip } = setup();
    expect(chip.querySelector('.syui-chip-remove')).toBeNull();

    fixture.componentInstance.removable.set(true);
    fixture.detectChanges();
    expect(chip.querySelector('.syui-chip-remove')).toBeTruthy();
  });

  it('labels the remove button with the chip label', () => {
    const { fixture, chip } = setup();
    fixture.componentInstance.removable.set(true);
    fixture.detectChanges();
    expect(chip.querySelector('.syui-chip-remove')?.getAttribute('aria-label')).toBe(
      'Remove Angular',
    );
  });

  it('hides itself and emits onRemove when removed', () => {
    const { fixture, chip } = setup();
    fixture.componentInstance.removable.set(true);
    fixture.detectChanges();

    chip.querySelector<HTMLButtonElement>('.syui-chip-remove')!.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.removed).toBe(true);
    expect(chip.classList).toContain('syui-chip-hidden');
  });

  it('lets projected content override the label', () => {
    const { fixture } = setup();
    const chip: HTMLElement = fixture.nativeElement.querySelector('#projected');
    expect(chip.querySelector('strong')?.textContent).toBe('Custom');
    expect(chip.textContent).not.toContain('Ignored');
  });
});
