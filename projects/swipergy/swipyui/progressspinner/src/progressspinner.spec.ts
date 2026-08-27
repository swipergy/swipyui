import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ProgressSpinner } from './progressspinner';

@Component({
  imports: [ProgressSpinner],
  template: `<syui-progress-spinner strokeWidth="6" ariaLabel="Loading results" />`,
})
class Host {}

describe('ProgressSpinner', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const spinner: HTMLElement = fixture.nativeElement.querySelector('syui-progress-spinner');
    return { fixture, spinner };
  }

  it('renders the animated SVG circle', () => {
    const { spinner } = setup();
    expect(spinner.querySelector('svg.syui-progressspinner-svg')).toBeTruthy();
    expect(spinner.querySelector('circle.syui-progressspinner-circle')).toBeTruthy();
  });

  it('applies the stroke width to the circle', () => {
    const { spinner } = setup();
    const circle = spinner.querySelector('circle')!;
    expect(circle.getAttribute('stroke-width')).toBe('6');
  });

  it('is exposed as an indeterminate progressbar', () => {
    const { spinner } = setup();
    expect(spinner.getAttribute('role')).toBe('progressbar');
    expect(spinner.getAttribute('aria-valuenow')).toBeNull();
  });

  it('announces the configured aria-label', () => {
    const { spinner } = setup();
    expect(spinner.getAttribute('aria-label')).toBe('Loading results');
  });

  it('defaults strokeWidth and ariaLabel', () => {
    @Component({ imports: [ProgressSpinner], template: `<syui-progress-spinner />` })
    class Defaults {}
    const fixture = TestBed.createComponent(Defaults);
    fixture.detectChanges();
    const spinner: HTMLElement = fixture.nativeElement.querySelector('syui-progress-spinner');
    expect(spinner.querySelector('circle')?.getAttribute('stroke-width')).toBe('2');
    expect(spinner.getAttribute('aria-label')).toBe('Loading');
  });
});
