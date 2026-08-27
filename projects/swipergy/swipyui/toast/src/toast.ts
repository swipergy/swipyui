import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  inject,
  input,
} from '@angular/core';
import { ToastService, ToastSeverity } from './toast.service';

export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

/**
 * Renders the queued toast messages of ToastService. Place it once,
 * usually in the root component template:
 *
 * ```html
 * <syui-toast />
 * ```
 *
 * Toasts never steal focus; each one is its own live region (assertive for
 * danger/warn, polite otherwise), carries a severity icon and a close
 * button, and its auto-dismiss timer pauses while hovered or focused.
 */
@Component({
  selector: 'syui-toast',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './toast.css',
  template: `
    <div
      class="syui-toast-region"
      [class]="'syui-toast-' + position()"
      role="region"
      [attr.aria-label]="ariaLabel()"
    >
      @for (message of toastService.messages(); track message.id) {
        <div
          class="syui-toast-message"
          [class]="'syui-toast-message-' + (message.severity ?? 'info')"
          [attr.role]="isAlert(message.severity) ? 'alert' : 'status'"
          [attr.aria-live]="isAlert(message.severity) ? 'assertive' : 'polite'"
          aria-atomic="true"
          (mouseenter)="toastService.pause(message.id)"
          (mouseleave)="resumeIfIdle(message.id, $event)"
          (focusin)="toastService.pause(message.id)"
          (focusout)="resumeIfIdle(message.id, $event)"
        >
          <svg
            class="syui-toast-icon"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            @switch (message.severity ?? 'info') {
              @case ('success') {
                <path d="M3 8.5L6.5 12L13 4.5" />
              }
              @case ('warn') {
                <path d="M8 2.5L14.75 13.5H1.25L8 2.5Z" />
                <path d="M8 6.5V9.5" />
                <path d="M8 11.75V11.751" />
              }
              @case ('danger') {
                <circle cx="8" cy="8" r="6.25" />
                <path d="M5.75 5.75L10.25 10.25M10.25 5.75L5.75 10.25" />
              }
              @default {
                <circle cx="8" cy="8" r="6.25" />
                <path d="M8 7.25V11" />
                <path d="M8 5V5.001" />
              }
            }
          </svg>
          <div class="syui-toast-body">
            <span class="syui-toast-summary">{{ message.summary }}</span>
            @if (message.detail) {
              <span class="syui-toast-detail">{{ message.detail }}</span>
            }
          </div>
          <button
            type="button"
            class="syui-toast-close"
            aria-label="Dismiss notification"
            (click)="toastService.dismiss(message.id)"
          >
            <svg viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path
                d="M3 3L11 11M11 3L3 11"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </div>
      }
    </div>
  `,
})
export class Toast {
  readonly position = input<ToastPosition>('top-right');
  /** Accessible name of the toast region. */
  readonly ariaLabel = input('Notifications');

  protected readonly toastService = inject(ToastService);

  protected isAlert(severity: ToastSeverity | undefined): boolean {
    return severity === 'danger' || severity === 'warn';
  }

  /** Resumes auto-dismiss only when the toast is neither hovered nor focused. */
  protected resumeIfIdle(id: number, event: Event): void {
    const toast = event.currentTarget as HTMLElement;
    if (toast.matches(':hover') || toast.contains(document.activeElement)) {
      return;
    }
    this.toastService.resume(id);
  }
}
