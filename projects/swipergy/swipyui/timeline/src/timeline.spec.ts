import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Timeline, TimelineContent, TimelineMarker, TimelineOpposite } from './timeline';

interface OrderEvent {
  status: string;
  date: string;
}

const EVENTS: OrderEvent[] = [
  { status: 'Ordered', date: '15/10' },
  { status: 'Processing', date: '16/10' },
  { status: 'Shipped', date: '17/10' },
];

@Component({
  imports: [Timeline, TimelineContent, TimelineOpposite],
  template: `
    <syui-timeline [value]="events" [align]="align()">
      <ng-template syuiTimelineOpposite let-event>
        <small class="opposite">{{ event.date }}</small>
      </ng-template>
      <ng-template syuiTimelineContent let-event let-i="index">
        <span class="content">{{ i }}:{{ event.status }}</span>
      </ng-template>
    </syui-timeline>
  `,
})
class Host {
  readonly events = EVENTS;
  readonly align = signal<'left' | 'right' | 'alternate'>('left');
}

@Component({
  imports: [Timeline, TimelineContent, TimelineMarker],
  template: `
    <syui-timeline [value]="events" layout="horizontal">
      <ng-template syuiTimelineMarker let-event>
        <span class="custom-marker">{{ event.status[0] }}</span>
      </ng-template>
      <ng-template syuiTimelineContent let-event>{{ event.status }}</ng-template>
    </syui-timeline>
  `,
})
class MarkerHost {
  readonly events = EVENTS;
}

describe('Timeline', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    return { fixture, element, timeline: element.querySelector('syui-timeline')! };
  }

  it('renders an ordered list with one item and marker per event', () => {
    const { element } = setup();
    expect(element.querySelector('ol.syui-timeline-list')).not.toBeNull();
    expect(element.querySelectorAll('li.syui-timeline-event').length).toBe(3);
    expect(element.querySelectorAll('.syui-timeline-event-marker').length).toBe(3);
  });

  it('renders the content template with event and index in context', () => {
    const { element } = setup();
    const contents = Array.from(element.querySelectorAll('.content')).map((el) =>
      el.textContent!.trim(),
    );
    expect(contents).toEqual(['0:Ordered', '1:Processing', '2:Shipped']);
  });

  it('renders the opposite template on the other side of the line', () => {
    const { element } = setup();
    const opposites = element.querySelectorAll('.syui-timeline-event-opposite .opposite');
    expect(opposites.length).toBe(3);
    expect(opposites[0].textContent).toContain('15/10');
  });

  it('draws a connector between events but not after the last one', () => {
    const { element } = setup();
    expect(element.querySelectorAll('.syui-timeline-event-connector').length).toBe(2);
    const last = element.querySelectorAll('.syui-timeline-event')[2];
    expect(last.querySelector('.syui-timeline-event-connector')).toBeNull();
  });

  it('reflects align and layout in host classes', () => {
    const { fixture, timeline } = setup();
    expect(timeline.classList).toContain('syui-timeline-vertical');
    expect(timeline.classList).toContain('syui-timeline-left');

    fixture.componentInstance.align.set('alternate');
    fixture.detectChanges();
    expect(timeline.classList).toContain('syui-timeline-alternate');
    expect(timeline.classList).not.toContain('syui-timeline-left');
  });

  it('replaces the default dot with a custom marker template', () => {
    const fixture = TestBed.createComponent(MarkerHost);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelectorAll('.custom-marker').length).toBe(3);
    expect(element.querySelector('.syui-timeline-event-marker')).toBeNull();
    expect(element.querySelector('syui-timeline')!.classList).toContain('syui-timeline-horizontal');
  });
});
