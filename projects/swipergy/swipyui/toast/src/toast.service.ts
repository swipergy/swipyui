import { Injectable, signal } from '@angular/core';

export type ToastSeverity = 'success' | 'info' | 'warn' | 'danger';

export interface ToastMessage {
  severity?: ToastSeverity;
  summary: string;
  detail?: string;
  /** Milliseconds before auto-dismiss; 0 keeps the toast until closed. Default 4000. */
  life?: number;
  /** Keeps the toast until it is closed manually, regardless of `life`. */
  sticky?: boolean;
}

export interface ActiveToast extends ToastMessage {
  id: number;
}

interface ToastTimer {
  /** Undefined while the timer is paused. */
  timeout?: ReturnType<typeof setTimeout>;
  startedAt: number;
  remaining: number;
}

/**
 * Signal-based toast queue. Render a single `<syui-toast />` outlet once
 * (e.g. in the root component), then call `show()` from anywhere.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 0;
  private readonly timers = new Map<number, ToastTimer>();
  readonly messages = signal<ActiveToast[]>([]);

  show(message: ToastMessage): void {
    const toast: ActiveToast = { severity: 'info', life: 4000, ...message, id: ++this.nextId };
    this.messages.update((messages) => [...messages, toast]);
    if (!toast.sticky && toast.life! > 0) {
      this.startTimer(toast.id, toast.life!);
    }
  }

  /** Pauses the auto-dismiss timer, e.g. while the toast is hovered or focused. */
  pause(id: number): void {
    const timer = this.timers.get(id);
    if (!timer?.timeout) {
      return;
    }
    clearTimeout(timer.timeout);
    timer.timeout = undefined;
    timer.remaining -= Date.now() - timer.startedAt;
  }

  /** Resumes a previously paused auto-dismiss timer. */
  resume(id: number): void {
    const timer = this.timers.get(id);
    if (!timer || timer.timeout) {
      return;
    }
    this.startTimer(id, Math.max(timer.remaining, 0));
  }

  dismiss(id: number): void {
    this.clearTimer(id);
    this.messages.update((messages) => messages.filter((message) => message.id !== id));
  }

  clear(): void {
    for (const id of [...this.timers.keys()]) {
      this.clearTimer(id);
    }
    this.messages.set([]);
  }

  private startTimer(id: number, remaining: number): void {
    this.timers.set(id, {
      timeout: setTimeout(() => this.dismiss(id), remaining),
      startedAt: Date.now(),
      remaining,
    });
  }

  private clearTimer(id: number): void {
    const timer = this.timers.get(id);
    if (timer?.timeout) {
      clearTimeout(timer.timeout);
    }
    this.timers.delete(id);
  }
}
