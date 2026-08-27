import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  TemplateRef,
  ViewEncapsulation,
  contentChild,
  inject,
  input,
} from '@angular/core';

/**
 * Marks the `ng-template` rendered as the content of each `<syui-timeline>`
 * event. Context: `$implicit` event, `index`.
 */
@Directive({ selector: 'ng-template[syuiTimelineContent]' })
export class TimelineContent {
  readonly template = inject(TemplateRef);
}

/**
 * Marks the optional `ng-template` rendered on the opposite side of the
 * `<syui-timeline>` line. Context: `$implicit` event, `index`.
 */
@Directive({ selector: 'ng-template[syuiTimelineOpposite]' })
export class TimelineOpposite {
  readonly template = inject(TemplateRef);
}

/**
 * Marks the optional `ng-template` replacing the default dot marker of each
 * `<syui-timeline>` event. Context: `$implicit` event, `index`.
 */
@Directive({ selector: 'ng-template[syuiTimelineMarker]' })
export class TimelineMarker {
  readonly template = inject(TemplateRef);
}

/**
 * Displays a list of events in chronological order along a vertical or
 * horizontal line. Each event renders a
 * marker dot and a connector; content, opposite side and marker are
 * template driven.
 *
 * ```html
 * <syui-timeline [value]="events" align="alternate">
 *   <ng-template syuiTimelineOpposite let-event>{{ event.date }}</ng-template>
 *   <ng-template syuiTimelineContent let-event>{{ event.status }}</ng-template>
 * </syui-timeline>
 * ```
 */
@Component({
  selector: 'syui-timeline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './timeline.css',
  imports: [NgTemplateOutlet],
  host: {
    class: 'syui-timeline',
    '[class.syui-timeline-vertical]': "layout() === 'vertical'",
    '[class.syui-timeline-horizontal]': "layout() === 'horizontal'",
    '[class.syui-timeline-left]': "align() === 'left'",
    '[class.syui-timeline-right]': "align() === 'right'",
    '[class.syui-timeline-alternate]': "align() === 'alternate'",
  },
  template: `
    <ol class="syui-timeline-list">
      @for (event of value(); track $index; let last = $last) {
        <li class="syui-timeline-event">
          <div class="syui-timeline-event-opposite">
            @if (oppositeTemplate()?.template; as template) {
              <ng-container
                [ngTemplateOutlet]="template"
                [ngTemplateOutletContext]="{ $implicit: event, index: $index }"
              />
            }
          </div>
          <div class="syui-timeline-event-separator">
            @if (markerTemplate()?.template; as template) {
              <ng-container
                [ngTemplateOutlet]="template"
                [ngTemplateOutletContext]="{ $implicit: event, index: $index }"
              />
            } @else {
              <div class="syui-timeline-event-marker" aria-hidden="true"></div>
            }
            @if (!last) {
              <div class="syui-timeline-event-connector" aria-hidden="true"></div>
            }
          </div>
          <div class="syui-timeline-event-content">
            @if (contentTemplate()?.template; as template) {
              <ng-container
                [ngTemplateOutlet]="template"
                [ngTemplateOutletContext]="{ $implicit: event, index: $index }"
              />
            }
          </div>
        </li>
      }
    </ol>
  `,
})
export class Timeline<T = any> {
  /** Events to display, in order. */
  readonly value = input<T[]>([]);
  /** Side of the line the content is placed on; `alternate` switches per event. */
  readonly align = input<'left' | 'right' | 'alternate'>('left');
  /** Orientation of the timeline. */
  readonly layout = input<'vertical' | 'horizontal'>('vertical');

  protected readonly contentTemplate = contentChild(TimelineContent);
  protected readonly oppositeTemplate = contentChild(TimelineOpposite);
  protected readonly markerTemplate = contentChild(TimelineMarker);
}
