import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
  ViewEncapsulation,
  booleanAttribute,
  effect,
  inject,
  input,
  model,
  viewChild,
} from '@angular/core';
import { GlobalPositionStrategy, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { A11yModule } from '@angular/cdk/a11y';
import { uniqueId } from '@swipergy/swipyui/core';

export type DrawerPosition = 'left' | 'right' | 'top' | 'bottom';

/** Duration of the leave animation before the overlay is disposed. */
const LEAVE_DURATION = 200;

/**
 * Panel that slides in over a mask from an edge of the viewport.
 * Body scroll is blocked while open, focus moves into the drawer and is
 * restored on close; Escape and (by default) a mask click close it.
 *
 * ```html
 * <syui-drawer [(visible)]="showDrawer" header="Settings" position="right">
 *   Drawer content
 * </syui-drawer>
 * ```
 */
@Component({
  selector: 'syui-drawer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './drawer.css',
  imports: [A11yModule],
  template: `
    <ng-template #panel>
      <div
        class="syui-drawer"
        [class]="'syui-drawer-' + position()"
        role="dialog"
        [attr.aria-modal]="modal() ? 'true' : null"
        [attr.aria-labelledby]="header() ? headerId : null"
        [attr.aria-label]="header() ? null : ariaLabel()"
        cdkTrapFocus
        cdkTrapFocusAutoCapture
        (keydown.escape)="close()"
      >
        <div class="syui-drawer-header">
          @if (header()) {
            <span class="syui-drawer-title" [id]="headerId">{{ header() }}</span>
          }
          <button
            type="button"
            class="syui-drawer-close"
            aria-label="Close drawer"
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
        </div>
        <div class="syui-drawer-content">
          <ng-content />
        </div>
      </div>
    </ng-template>
  `,
})
export class Drawer implements OnDestroy {
  /** Controls drawer visibility; supports two-way binding. */
  readonly visible = model(false);
  /** Edge of the viewport the drawer slides in from. */
  readonly position = input<DrawerPosition>('left');
  /** Title shown in the drawer header. */
  readonly header = input<string>();
  /** Accessible name of the drawer when no header is rendered. */
  readonly ariaLabel = input<string>();
  /** Renders a mask behind the drawer. */
  readonly modal = input(true, { transform: booleanAttribute });
  /** Closes the drawer when the mask is clicked. */
  readonly dismissible = input(true, { transform: booleanAttribute });

  private readonly panelTemplate = viewChild.required<TemplateRef<unknown>>('panel');

  private readonly overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private overlayRef?: OverlayRef;
  private previouslyFocused?: HTMLElement;
  private leaveTimeout?: ReturnType<typeof setTimeout>;

  protected readonly headerId = uniqueId('syui-drawer-header');

  constructor() {
    effect(() => {
      this.visible() ? this.attach() : this.detach();
    });
  }

  protected close(): void {
    this.visible.set(false);
  }

  private attach(): void {
    if (this.leaveTimeout) {
      // Reopened while animating out: discard the leaving overlay right away.
      clearTimeout(this.leaveTimeout);
      this.leaveTimeout = undefined;
      this.overlayRef?.dispose();
      this.overlayRef = undefined;
    }
    if (this.overlayRef?.hasAttached()) {
      return;
    }
    this.previouslyFocused = (document.activeElement as HTMLElement) ?? undefined;
    this.overlayRef = this.createOverlay();
    this.overlayRef.attach(new TemplatePortal(this.panelTemplate(), this.viewContainerRef));
  }

  private detach(): void {
    const overlayRef = this.overlayRef;
    if (!overlayRef?.hasAttached() || this.leaveTimeout) {
      return;
    }
    overlayRef.overlayElement.querySelector('.syui-drawer')?.classList.add('syui-drawer-leave');
    if (overlayRef.backdropElement) {
      overlayRef.detachBackdrop();
    }
    this.leaveTimeout = setTimeout(() => {
      this.leaveTimeout = undefined;
      overlayRef.dispose();
      if (this.overlayRef === overlayRef) {
        this.overlayRef = undefined;
      }
      this.previouslyFocused?.focus();
      this.previouslyFocused = undefined;
    }, LEAVE_DURATION);
  }

  private createOverlay(): OverlayRef {
    const overlayRef = this.overlay.create({
      positionStrategy: this.positionStrategy(),
      scrollStrategy: this.overlay.scrollStrategies.block(),
      hasBackdrop: this.modal(),
      backdropClass: 'syui-drawer-mask',
    });
    overlayRef.backdropClick().subscribe(() => {
      if (this.dismissible()) {
        this.close();
      }
    });
    return overlayRef;
  }

  private positionStrategy(): GlobalPositionStrategy {
    const strategy = this.overlay.position().global();
    switch (this.position()) {
      case 'right':
        return strategy.right('0').top('0');
      case 'top':
        return strategy.top('0').left('0');
      case 'bottom':
        return strategy.bottom('0').left('0');
      default:
        return strategy.left('0').top('0');
    }
  }

  ngOnDestroy(): void {
    if (this.leaveTimeout) {
      clearTimeout(this.leaveTimeout);
    }
    this.overlayRef?.dispose();
  }
}
