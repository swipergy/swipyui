import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  inject,
  input,
  numberAttribute,
  signal,
  viewChild,
} from '@angular/core';

/**
 * Scrolling transcript of a conversation. Wraps `<syui-chat-message>`
 * children in a live region so streamed replies are announced, and keeps the
 * view pinned to the newest message while the user is at the bottom — once
 * they scroll up to read, auto-scrolling stops until they return.
 *
 * ```html
 * <syui-chat>
 *   @for (message of messages(); track message.id) {
 *     <syui-chat-message [role]="message.role">{{ message.text }}</syui-chat-message>
 *   }
 * </syui-chat>
 * ```
 */
@Component({
  selector: 'syui-chat',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './chat.css',
  host: {
    class: 'syui-chat',
    role: 'log',
    tabindex: '0',
    '[attr.aria-live]': 'live()',
    '[attr.aria-label]': 'ariaLabel()',
    '(scroll)': 'updateAtBottom()',
  },
  template: `
    <div class="syui-chat-content" #content>
      <ng-content />
    </div>
  `,
})
export class Chat {
  /**
   * Keeps the transcript scrolled to the newest content while the user is at
   * the bottom. Scrolling up pauses it until the bottom is reached again.
   */
  readonly autoScroll = input(true, { transform: booleanAttribute });
  /**
   * Politeness of the log region. Set to `off` when replies are announced
   * elsewhere, e.g. by a status message of your own.
   */
  readonly live = input<'polite' | 'off'>('polite');
  /** Accessible name of the transcript region. */
  readonly ariaLabel = input('Conversation');
  /** Distance from the bottom edge, in pixels, still counted as "at bottom". */
  readonly threshold = input(48, { transform: numberAttribute });

  /** True while the transcript is scrolled to (or near) the bottom. */
  readonly atBottom = signal(true);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly content = viewChild.required<ElementRef<HTMLElement>>('content');

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      this.scrollToBottom('auto');
      if (typeof ResizeObserver === 'undefined') {
        return;
      }
      // Content grows token by token while a reply streams in; a resize
      // observer catches that without the caller notifying us.
      const observer = new ResizeObserver(() => {
        if (this.autoScroll() && this.atBottom()) {
          this.scrollToBottom('auto');
        }
      });
      observer.observe(this.content().nativeElement);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  /** Scrolls the transcript to the newest message. */
  scrollToBottom(behavior: ScrollBehavior = 'smooth'): void {
    const el = this.host.nativeElement;
    if (typeof el.scrollTo === 'function') {
      el.scrollTo({ top: el.scrollHeight, behavior });
    } else {
      el.scrollTop = el.scrollHeight;
    }
    this.atBottom.set(true);
  }

  protected updateAtBottom(): void {
    const el = this.host.nativeElement;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    this.atBottom.set(distance <= this.threshold());
  }
}
