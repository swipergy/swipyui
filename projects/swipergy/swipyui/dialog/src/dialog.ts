import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
  booleanAttribute,
  effect,
  inject,
  input,
  model,
} from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { A11yModule } from '@angular/cdk/a11y';
import { uniqueId } from '@swipergy/swipyui/core';

/**
 * Modal dialog with focus trap, ESC/backdrop close and focus restore.
 *
 * ```html
 * <syui-dialog [(visible)]="showDialog" header="Confirm">
 *   Are you sure?
 *   <div slot="footer">…</div>
 * </syui-dialog>
 * ```
 */
@Component({
  selector: 'syui-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './dialog.css',
  imports: [A11yModule],
  template: `
    <ng-template #panel>
      <div
        class="syui-dialog"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="header() ? headerId : null"
        [attr.aria-label]="header() ? null : ariaLabel()"
        [style.width]="width()"
        cdkTrapFocus
        cdkTrapFocusAutoCapture
        (keydown.escape)="closable() && close()"
      >
        @if (header() || closable()) {
          <div class="syui-dialog-header">
            @if (header()) {
              <span class="syui-dialog-title" [id]="headerId">{{ header() }}</span>
            }
            @if (closable()) {
              <button
                type="button"
                class="syui-dialog-close"
                aria-label="Close dialog"
                (click)="close()"
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
            }
          </div>
        }
        <div class="syui-dialog-content">
          <ng-content />
        </div>
        <div class="syui-dialog-footer">
          <ng-content select="[slot=footer]" />
        </div>
      </div>
    </ng-template>
  `,
})
export class Dialog implements OnDestroy {
  /** Controls dialog visibility; supports two-way binding. */
  readonly visible = model(false);
  /** Title shown in the dialog header. */
  readonly header = input<string>();
  /** Accessible name of the dialog when no header is rendered. */
  readonly ariaLabel = input<string>();
  /** Shows the close button and enables the Escape key. */
  readonly closable = input(true, { transform: booleanAttribute });
  /** Closes the dialog when the backdrop is clicked. */
  readonly dismissableMask = input(true, { transform: booleanAttribute });
  readonly width = input('32rem');

  @ViewChild('panel', { static: true })
  private panelTemplate!: TemplateRef<unknown>;

  private readonly overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private overlayRef?: OverlayRef;
  private previouslyFocused?: HTMLElement;

  protected readonly headerId = uniqueId('syui-dialog-header');

  constructor() {
    effect(() => {
      this.visible() ? this.attach() : this.detach();
    });
  }

  protected close(): void {
    this.visible.set(false);
  }

  private attach(): void {
    if (this.overlayRef?.hasAttached()) {
      return;
    }
    this.previouslyFocused = (document.activeElement as HTMLElement) ?? undefined;
    this.overlayRef ??= this.createOverlay();
    this.overlayRef.attach(new TemplatePortal(this.panelTemplate, this.viewContainerRef));
  }

  private detach(): void {
    if (!this.overlayRef?.hasAttached()) {
      return;
    }
    this.overlayRef.detach();
    this.previouslyFocused?.focus();
    this.previouslyFocused = undefined;
  }

  private createOverlay(): OverlayRef {
    const overlayRef = this.overlay.create({
      positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
      scrollStrategy: this.overlay.scrollStrategies.block(),
      hasBackdrop: true,
      backdropClass: 'syui-dialog-mask',
    });
    overlayRef.backdropClick().subscribe(() => {
      if (this.dismissableMask() && this.closable()) {
        this.close();
      }
    });
    return overlayRef;
  }

  ngOnDestroy(): void {
    this.overlayRef?.dispose();
  }
}
