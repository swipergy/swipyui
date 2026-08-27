import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ProgressBar } from './progressbar';

@Component({
  imports: [ProgressBar],
  template: `
    <syui-progress-bar
      [value]="value()"
      [mode]="mode()"
      [showValue]="showValue()"
      [ariaLabel]="ariaLabel()"
    />
  `,
})
class Host {
  value = signal(40);
  mode = signal<'determinate' | 'indeterminate'>('determinate');
  showValue = signal(true);
  ariaLabel = signal<string | undefined>(undefined);
}

describe('ProgressBar', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const bar: HTMLElement = fixture.nativeElement.querySelector('syui-progress-bar');
    return { fixture, bar };
  }

  it('fills the track to the given percentage and labels it', () => {
    const { bar } = setup();
    const fill: HTMLElement = bar.querySelector('.syui-progressbar-value')!;
    expect(fill.style.width).toBe('40%');
    expect(bar.querySelector('.syui-progressbar-label')?.textContent).toContain('40%');
  });

  it('exposes the progressbar ARIA attributes', () => {
    const { bar } = setup();
    expect(bar.getAttribute('role')).toBe('progressbar');
    expect(bar.getAttribute('aria-valuemin')).toBe('0');
    expect(bar.getAttribute('aria-valuemax')).toBe('100');
    expect(bar.getAttribute('aria-valuenow')).toBe('40');
  });

  it('announces the configured ariaLabel', () => {
    const { fixture, bar } = setup();
    expect(bar.getAttribute('aria-label')).toBeNull();
    fixture.componentInstance.ariaLabel.set('Upload progress');
    fixture.detectChanges();
    expect(bar.getAttribute('aria-label')).toBe('Upload progress');
  });

  it('clamps out-of-range values', () => {
    const { fixture, bar } = setup();
    fixture.componentInstance.value.set(150);
    fixture.detectChanges();
    expect(bar.getAttribute('aria-valuenow')).toBe('100');
    expect((bar.querySelector('.syui-progressbar-value') as HTMLElement).style.width).toBe('100%');
  });

  it('hides the label when showValue is false', () => {
    const { fixture, bar } = setup();
    fixture.componentInstance.showValue.set(false);
    fixture.detectChanges();
    expect(bar.querySelector('.syui-progressbar-label')).toBeNull();
  });

  it('drops aria-valuenow and animates in indeterminate mode', () => {
    const { fixture, bar } = setup();
    fixture.componentInstance.mode.set('indeterminate');
    fixture.detectChanges();
    expect(bar.classList).toContain('syui-progressbar-indeterminate');
    expect(bar.getAttribute('aria-valuenow')).toBeNull();
    expect(bar.querySelector('.syui-progressbar-label')).toBeNull();
  });
});
