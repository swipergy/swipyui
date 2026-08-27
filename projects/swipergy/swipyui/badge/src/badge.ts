import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  Renderer2,
  ViewEncapsulation,
  effect,
  inject,
  input,
} from '@angular/core';

export type BadgeSeverity = 'secondary' | 'success' | 'info' | 'warn' | 'danger' | null;
export type BadgeSize = 'small' | 'large' | null;

/**
 * Standalone numeric/status pill, e.g. an unread count next to a label.
 * Without a severity it uses the primary color.
 *
 * ```html
 * Inbox <syui-badge [value]="12" />
 * <syui-badge value="new" severity="success" size="small" />
 * ```
 */
@Component({
  selector: 'syui-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './badge.css',
  host: {
    class: 'syui-badge',
    '[class.syui-badge-secondary]': "severity() === 'secondary'",
    '[class.syui-badge-success]': "severity() === 'success'",
    '[class.syui-badge-info]': "severity() === 'info'",
    '[class.syui-badge-warn]': "severity() === 'warn'",
    '[class.syui-badge-danger]': "severity() === 'danger'",
    '[class.syui-badge-small]': "size() === 'small'",
    '[class.syui-badge-large]': "size() === 'large'",
    '[attr.role]': "ariaLabel() ? 'img' : null",
    '[attr.aria-label]': 'ariaLabel() ?? null',
  },
  template: `{{ value() }}`,
})
export class Badge {
  /** Text or number shown inside the pill. */
  readonly value = input<string | number>('');
  readonly severity = input<BadgeSeverity>(null);
  readonly size = input<BadgeSize>(null);
  /**
   * Text alternative announced instead of the raw value, e.g.
   * "3 unread notifications" for a value of 3.
   */
  readonly ariaLabel = input<string>();
}

/**
 * Overlays a small badge on the top-right corner of the host element,
 * e.g. a notification count on an icon button. An empty value renders
 * a plain dot.
 *
 * ```html
 * <button syuiBadge="3" syuiBadgeSeverity="danger" syuiBadgeLabel="3 unread">Notifications</button>
 * <syui-avatar label="FK" syuiBadge syuiBadgeLabel="New activity" />
 * ```
 */
@Directive({
  selector: '[syuiBadge]',
  host: { class: 'syui-badge-overlay' },
})
export class BadgeDirective {
  /** Text or number shown in the corner badge; empty renders a dot. */
  readonly syuiBadge = input<string | number>('');
  readonly syuiBadgeSeverity = input<BadgeSeverity>(null);
  /**
   * Text alternative announced for the badge, e.g. "3 unread notifications".
   * Required for dot badges, which otherwise convey their meaning by color
   * alone; without it the badge is hidden from assistive technology.
   */
  readonly syuiBadgeLabel = input<string>('');

  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private badgeElement?: HTMLElement;

  constructor() {
    effect(() => {
      const value = this.syuiBadge();
      const severity = this.syuiBadgeSeverity();
      const label = this.syuiBadgeLabel();
      if (!this.badgeElement) {
        this.badgeElement = this.renderer.createElement('span');
        this.renderer.appendChild(this.elementRef.nativeElement, this.badgeElement);
      }
      const text = value == null || value === '' ? '' : String(value);
      const classes = ['syui-badge', 'syui-badge-corner'];
      if (severity) {
        classes.push(`syui-badge-${severity}`);
      }
      if (!text) {
        classes.push('syui-badge-dot');
      }
      this.badgeElement!.className = classes.join(' ');
      this.badgeElement!.textContent = text;
      if (label) {
        this.renderer.setAttribute(this.badgeElement!, 'role', 'img');
        this.renderer.setAttribute(this.badgeElement!, 'aria-label', label);
        this.renderer.removeAttribute(this.badgeElement!, 'aria-hidden');
      } else {
        this.renderer.setAttribute(this.badgeElement!, 'aria-hidden', 'true');
        this.renderer.removeAttribute(this.badgeElement!, 'role');
        this.renderer.removeAttribute(this.badgeElement!, 'aria-label');
      }
    });
  }
}
