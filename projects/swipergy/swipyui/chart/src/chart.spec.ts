import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Chart, ChartData, ChartType } from './chart';

const DATA: ChartData = {
  labels: ['Q1', 'Q2', 'Q3', 'Q4'],
  series: [
    { label: '2025', data: [540, 620, 580, 690] },
    { label: '2026', data: [610, 680, 720, 810] },
  ],
};

@Component({
  imports: [Chart],
  template: `<syui-chart [type]="type()" [data]="data()" ariaLabel="Revenue by quarter" />`,
})
class Host {
  readonly type = signal<ChartType>('bar');
  readonly data = signal<ChartData>(DATA);
}

describe('Chart', () => {
  function setup(type: ChartType, data: ChartData = DATA) {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.type.set(type);
    fixture.componentInstance.data.set(data);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    return { fixture, element };
  }

  it('exposes the SVG as a labelled image', () => {
    const { element } = setup('bar');
    const svg = element.querySelector('svg')!;
    expect(svg.getAttribute('role')).toBe('img');
    expect(svg.getAttribute('aria-label')).toBe('Revenue by quarter');
  });

  it('renders one bar per label and series, colored by palette slot', () => {
    const { element } = setup('bar');
    const bars = element.querySelectorAll('.syui-chart-bar');
    expect(bars.length).toBe(8);
    expect(bars[0].classList.contains('syui-chart-series-1')).toBe(true);
    expect(bars[4].classList.contains('syui-chart-series-2')).toBe(true);
    expect(bars[0].querySelector('title')!.textContent).toBe('2025 · Q1: 540');
  });

  it('renders a line with a marker per point', () => {
    const { element } = setup('line');
    expect(element.querySelectorAll('.syui-chart-line').length).toBe(2);
    expect(element.querySelectorAll('.syui-chart-marker').length).toBe(8);
    expect(element.querySelector('.syui-chart-area')).toBeNull();
  });

  it('adds a fill under each series in area mode', () => {
    const { element } = setup('area');
    expect(element.querySelectorAll('.syui-chart-area').length).toBe(2);
  });

  it('renders gridlines and formatted y ticks', () => {
    const { element } = setup('bar');
    const ticks = Array.from(element.querySelectorAll('.syui-chart-tick'), (tick) =>
      tick.textContent!.trim(),
    );
    expect(element.querySelectorAll('.syui-chart-grid').length).toBeGreaterThan(2);
    expect(ticks).toContain('0');
    expect(ticks[ticks.length - 1]).toBe('Q4'); // x labels follow the y ticks
  });

  it('shows a legend for multiple series and hides it for one', () => {
    const { element } = setup('bar');
    const legend = Array.from(element.querySelectorAll('.syui-chart-legend-item'), (item) =>
      item.textContent!.trim(),
    );
    expect(legend).toEqual(['2025', '2026']);

    const single = setup('bar', { labels: DATA.labels, series: [DATA.series[0]] });
    expect(single.element.querySelector('.syui-chart-legend')).toBeNull();
  });

  it('renders pie slices with share tooltips and a category legend', () => {
    const { element } = setup('pie', {
      labels: ['A', 'B'],
      series: [{ label: 'Total', data: [75, 25] }],
    });
    const slices = element.querySelectorAll('.syui-chart-slice');
    expect(slices.length).toBe(2);
    expect(slices[0].querySelector('title')!.textContent).toBe('A: 75 (75%)');
    const legend = Array.from(element.querySelectorAll('.syui-chart-legend-item'), (item) =>
      item.textContent!.trim(),
    );
    expect(legend).toEqual(['A', 'B']);
  });

  it('cuts a hole into donut slices', () => {
    const { element } = setup('donut', {
      labels: ['A', 'B'],
      series: [{ label: 'Total', data: [75, 25] }],
    });
    const path = element.querySelector('.syui-chart-slice')!.getAttribute('d')!;
    expect(path).toContain('A 70 70'); // inner arc
  });

  it('applies a custom series color inline', () => {
    const { element } = setup('bar', {
      labels: ['Q1'],
      series: [{ label: 'Custom', data: [10], color: 'rgb(1, 2, 3)' }],
    });
    const bar = element.querySelector<SVGPathElement>('.syui-chart-bar')!;
    expect(bar.style.fill).toBe('rgb(1, 2, 3)');
  });
});
