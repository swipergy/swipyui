import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MeterGroup, MeterItem } from './metergroup';

@Component({
  imports: [MeterGroup],
  template: `<syui-meter-group [value]="items()" [max]="max()" [labelPosition]="labelPosition()" />`,
})
class Host {
  items = signal<MeterItem[]>([
    { label: 'Apps', value: 20 },
    { label: 'Media', value: 30, color: 'teal' },
  ]);
  max = signal(100);
  labelPosition = signal<'end' | 'start'>('end');
}

describe('MeterGroup', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const group: HTMLElement = fixture.nativeElement.querySelector('syui-meter-group');
    return { fixture, group };
  }

  it('renders one sized segment per entry', () => {
    const { group } = setup();
    const segments = group.querySelectorAll<HTMLElement>('.syui-metergroup-meter');
    expect(segments.length).toBe(2);
    expect(segments[0].style.width).toBe('20%');
    expect(segments[1].style.width).toBe('30%');
  });

  it('cycles default colors and honors explicit ones', () => {
    const { group } = setup();
    const segments = group.querySelectorAll<HTMLElement>('.syui-metergroup-meter');
    expect(segments[0].style.background).toContain('--syui-metergroup-color-1');
    expect(segments[1].style.background).toBe('teal');
  });

  it('renders a legend with labels and percentages', () => {
    const { group } = setup();
    const labels = group.querySelectorAll('.syui-metergroup-label');
    expect(labels.length).toBe(2);
    expect(labels[0].textContent).toContain('Apps (20%)');
    expect(labels[0].querySelector('.syui-metergroup-label-marker')).toBeTruthy();
  });

  it('exposes meter ARIA attributes with the summed value', () => {
    const { group } = setup();
    const track = group.querySelector('.syui-metergroup-track')!;
    expect(track.getAttribute('role')).toBe('meter');
    expect(track.getAttribute('aria-valuemin')).toBe('0');
    expect(track.getAttribute('aria-valuemax')).toBe('100');
    expect(track.getAttribute('aria-valuenow')).toBe('50');
  });

  it('scales percentages by max', () => {
    const { fixture, group } = setup();
    fixture.componentInstance.max.set(200);
    fixture.detectChanges();
    const segments = group.querySelectorAll<HTMLElement>('.syui-metergroup-meter');
    expect(segments[0].style.width).toBe('10%');
  });

  it('places the legend before the track with labelPosition="start"', () => {
    const { fixture, group } = setup();
    fixture.componentInstance.labelPosition.set('start');
    fixture.detectChanges();
    const children = Array.from(group.children);
    expect(children.findIndex((el) => el.classList.contains('syui-metergroup-labels'))).toBeLessThan(
      children.findIndex((el) => el.classList.contains('syui-metergroup-track')),
    );
  });
});
