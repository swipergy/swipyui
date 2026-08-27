import { Injectable, signal } from '@angular/core';

export type ConfirmSeverity = 'primary' | 'danger';

export interface Confirmation {
  /** Title shown in the dialog header. */
  header?: string;
  /** Question shown in the dialog body. */
  message?: string;
  /** Label of the accept button. Default 'Confirm'. */
  acceptLabel?: string;
  /** Label of the reject button. Default 'Cancel'. */
  rejectLabel?: string;
  /**
   * Styles the accept button; 'danger' additionally moves the initial
   * focus to the reject button. Default 'primary'.
   */
  severity?: ConfirmSeverity;
  /** Called when the user accepts. */
  accept?: () => void;
  /** Called when the user rejects (button, Escape or mask click). */
  reject?: () => void;
}

/**
 * Signal-based confirmation state. Render a single `<syui-confirm-dialog />`
 * outlet once (e.g. in the root component), then call `confirm()` from
 * anywhere:
 *
 * ```ts
 * confirmationService.confirm({
 *   header: 'Delete file',
 *   message: 'This cannot be undone. Continue?',
 *   severity: 'danger',
 *   accept: () => this.delete(),
 * });
 * ```
 */
@Injectable({ providedIn: 'root' })
export class ConfirmationService {
  /** Currently pending confirmation, or null when idle. */
  readonly confirmation = signal<Confirmation | null>(null);

  /** Opens the confirm dialog with the given options. */
  confirm(confirmation: Confirmation): void {
    this.confirmation.set(confirmation);
  }

  /** Dismisses the pending confirmation without invoking any callback. */
  close(): void {
    this.confirmation.set(null);
  }
}
