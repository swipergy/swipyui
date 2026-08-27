import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  Timeline,
  TimelineContent,
  TimelineMarker,
  TimelineOpposite,
} from '@swipergy/swipyui/timeline';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

interface OrderEvent {
  status: string;
  date: string;
  color?: string;
}

const ORDER_EVENTS: OrderEvent[] = [
  { status: 'Ordered', date: '15/10/2025 10:30', color: 'var(--syui-info-color)' },
  { status: 'Processing', date: '15/10/2025 14:00', color: 'var(--syui-warn-color)' },
  { status: 'Shipped', date: '16/10/2025 16:15', color: 'var(--syui-primary)' },
  { status: 'Delivered', date: '17/10/2025 10:00', color: 'var(--syui-success-color)' },
];

const BASIC = `events = [
  { status: 'Ordered', date: '15/10/2025 10:30' },
  { status: 'Processing', date: '15/10/2025 14:00' },
  { status: 'Shipped', date: '16/10/2025 16:15' },
  { status: 'Delivered', date: '17/10/2025 10:00' },
];

<syui-timeline [value]="events">
  <ng-template syuiTimelineContent let-event>{{ event.status }}</ng-template>
</syui-timeline>`;

const OPPOSITE = `<syui-timeline [value]="events" align="alternate">
  <ng-template syuiTimelineOpposite let-event>
    <small>{{ event.date }}</small>
  </ng-template>
  <ng-template syuiTimelineContent let-event>{{ event.status }}</ng-template>
</syui-timeline>`;

const MARKER = `<syui-timeline [value]="events">
  <ng-template syuiTimelineMarker let-event>
    <span class="marker" [style.background]="event.color"></span>
  </ng-template>
  <ng-template syuiTimelineContent let-event>{{ event.status }}</ng-template>
</syui-timeline>`;

const HORIZONTAL = `<syui-timeline [value]="events" layout="horizontal">
  <ng-template syuiTimelineContent let-event>{{ event.status }}</ng-template>
</syui-timeline>`;

const PROPS: PropRow[] = [
  { name: 'value', type: 'T[]', default: '[]', description: 'Events to display, in order.' },
  {
    name: 'align',
    type: "'left' | 'right' | 'alternate'",
    default: "'left'",
    description: 'Side of the line the content is placed on; alternate switches per event.',
  },
  {
    name: 'layout',
    type: "'vertical' | 'horizontal'",
    default: "'vertical'",
    description: 'Orientation of the timeline.',
  },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Timeline, TimelineContent, TimelineOpposite, TimelineMarker, DocsSection, DocsPropTable],
  styles: `
    .marker {
      display: inline-block;
      width: 1.125rem;
      height: 1.125rem;
      border-radius: 50%;
    }
    .timeline-date {
      color: var(--syui-text-muted-color);
      font-size: 0.875rem;
    }
  `,
  template: `
    <h1>Timeline</h1>
    <p class="docs-lead">
      Displays a list of events in chronological order along a vertical or horizontal line, with
      template-driven content, opposite side and markers.
      <code>
        import {{ '{' }} Timeline, TimelineContent {{ '}' }} from '&#64;swipergy/swipyui/timeline';
      </code>
    </p>

    <docs-section title="Basic" [code]="basic" language="typescript">
      <syui-timeline [value]="events">
        <ng-template syuiTimelineContent let-event>{{ event.status }}</ng-template>
      </syui-timeline>
    </docs-section>

    <docs-section
      title="Opposite side and alternate alignment"
      [code]="opposite"
      language="html"
      description="syuiTimelineOpposite renders on the other side of the line; align='alternate' flips every other event."
    >
      <syui-timeline [value]="events" align="alternate">
        <ng-template syuiTimelineOpposite let-event>
          <small class="timeline-date">{{ event.date }}</small>
        </ng-template>
        <ng-template syuiTimelineContent let-event>{{ event.status }}</ng-template>
      </syui-timeline>
    </docs-section>

    <docs-section
      title="Custom markers"
      [code]="marker"
      language="html"
      description="syuiTimelineMarker replaces the default dot; the event is the implicit template variable."
    >
      <syui-timeline [value]="events">
        <ng-template syuiTimelineMarker let-event>
          <span class="marker" [style.background]="event.color"></span>
        </ng-template>
        <ng-template syuiTimelineContent let-event>{{ event.status }}</ng-template>
      </syui-timeline>
    </docs-section>

    <docs-section title="Horizontal" [code]="horizontal" language="html">
      <syui-timeline [value]="events" layout="horizontal">
        <ng-template syuiTimelineContent let-event>{{ event.status }}</ng-template>
      </syui-timeline>
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
})
export class TimelineDemo {
  readonly basic = BASIC;
  readonly opposite = OPPOSITE;
  readonly marker = MARKER;
  readonly horizontal = HORIZONTAL;
  readonly props = PROPS;

  readonly events = ORDER_EVENTS;
}
