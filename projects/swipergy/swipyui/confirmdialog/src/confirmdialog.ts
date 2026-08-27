import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
  ViewEncapsulation,
  effect,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { A11yModule } from '@angular/cdk/a11y';
import { uniqueId } from '@swipergy/swipyui/core';
import { Button } from '@swipergy/swipyui/button';
import { ConfirmationService } from './confirmation.service';

/**
 * Outlet for confirmations raised through ConfirmationService. Uses the same
 * CDK global-overlay/mask technique as Dialog (the Dialog API cannot express
 * "Escape rejects" or the severity-dependent initial focus, so the panel is
 * rendered directly). Place it once, usually in the root component template:
 *
 * ```html
 * <syui-confirm-dialog />
 * ```
 *
 * Escape, the mask and the reject button all invoke `reject`; the accept
 * button invokes `accept`. Focus lands on the accept button, or on the
 * reject button for `severity: 'danger'`, and is restored on close.
 */
@Component({
  selector: 'syui-confirm-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './confirmdialog.css',
  imports: [A11yModule, Button],
  template: `
    <ng-template #panel>
      <div
        class="syui-confirmdialog"
        role="alertdialog"
        aria-modal="true"
        [attr.aria-labelledby]="confirmation()?.header ? headerId : null"
        [attr.aria-label]="confirmation()?.header ? null : ariaLabel()"
        [attr.aria-describedby]="messageId"
        cdkTrapFocus
        (keydown.escape)="reject()"
      >
        @if (confirmation()?.header) {
          <div class="syui-confirmdialog-header">
            <span class="syui-confirmdialog-title" [id]="headerId">
              {{ confirmation()?.header }}
            </span>
          </div>
        }
        <div class="syui-confirmdialog-message" [id]="messageId">
          {{ confirmation()?.message }}
        </div>
        <div class="syui-confirmdialog-footer">
          <syui-button
            class="syui-confirmdialog-reject"
            severity="secondary"
            variant="outlined"
            [label]="confirmation()?.rejectLabel ?? 'Cancel'"
            (onClick)="reject()"
          />
          <syui-button
            class="syui-confirmdialog-accept"
            [severity]="confirmation()?.severity === 'danger' ? 'danger' : 'primary'"
            [label]="confirmation()?.acceptLabel ?? 'Confirm'"
            (onClick)="accept()"
          />
        </div>
      </div>
    </ng-template>
  `,
})
export class ConfirmDialog implements OnDestroy {
  /** Accessible name of the dialog when the confirmation has no `header`. */
  readonly ariaLabel = input('Confirmation');

  private readonly panelTemplate = viewChild.required<TemplateRef<unknown>>('panel');

  private readonly confirmationService = inject(ConfirmationService);
  private readonly overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private overlayRef?: OverlayRef;
  private previouslyFocused?: HTMLElement;

  protected readonly headerId = uniqueId('syui-confirmdialog-header');
  protected readonly messageId = uniqueId('syui-confirmdialog-message');
  protected readonly confirmation = this.confirmationService.confirmation;

  constructor() {
    effect(() => {
      this.confirmation() ? this.attach() : this.detach();
    });
  }

  protected accept(): void {
    const confirmation = this.confirmation();
    this.confirmationService.close();
    confirmation?.accept?.();
  }

  protected reject(): void {
    const confirmation = this.confirmation();
    this.confirmationService.close();
    confirmation?.reject?.();
  }

  private attach(): void {
    if (this.overlayRef?.hasAttached()) {
      return;
    }
    this.previouslyFocused = (document.activeElement as HTMLElement) ?? undefined;
    this.overlayRef ??= this.createOverlay();
    this.overlayRef.attach(new TemplatePortal(this.panelTemplate(), this.viewContainerRef));
    this.focusInitialButton();
  }

  private detach(): void {
    if (!this.overlayRef?.hasAttached()) {
      return;
    }
    this.overlayRef.detach();
    this.previouslyFocused?.focus();
    this.previouslyFocused = undefined;
  }

  private focusInitialButton(): void {
    const initial =
      this.confirmation()?.severity === 'danger'
        ? '.syui-confirmdialog-reject'
        : '.syui-confirmdialog-accept';
    this.overlayRef?.overlayElement
      .querySelector<HTMLButtonElement>(`${initial} button`)
      ?.focus();
  }

  private createOverlay(): OverlayRef {
    const overlayRef = this.overlay.create({
      positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
      scrollStrategy: this.overlay.scrollStrategies.block(),
      hasBackdrop: true,
      backdropClass: 'syui-confirmdialog-mask',
    });
    overlayRef.backdropClick().subscribe(() => this.reject());
    return overlayRef;
  }

  ngOnDestroy(): void {
    this.overlayRef?.dispose();
  }
}
