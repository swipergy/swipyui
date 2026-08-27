import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
  ViewEncapsulation,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';

/**
 * Overlay panel anchored to an arbitrary element, opened imperatively
 * from a template reference. The anchor is the `currentTarget` of the
 * event passed to `toggle()`/`show()`. Closes on outside click and Escape.
 *
 * ```html
 * <syui-button label="Options" (onClick)="op.toggle($event)" />
 * <syui-popover #op>
 *   <p>Projected content</p>
 * </syui-popover>
 * ```
 */
@Component({
  selector: 'syui-popover',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './popover.css',
  template: `
    <ng-template #panel>
      <div
        class="syui-popover"
        role="dialog"
        [attr.aria-label]="ariaLabel() || null"
        [attr.aria-labelledby]="ariaLabelledby() || null"
        (keydown.escape)="hide()"
      >
        <ng-content />
      </div>
    </ng-template>
  `,
})
export class Popover implements OnDestroy {
  /** Accessible name of the dialog panel. */
  readonly ariaLabel = input<string>();
  /** Id of an element inside the panel (e.g. a heading) that names it; wins over `ariaLabel`. */
  readonly ariaLabelledby = input<string>();
  /** Emitted after the panel opened. */
  readonly onShow = output<void>();
  /** Emitted after the panel closed. */
  readonly onHide = output<void>();

  private readonly panelTemplate = viewChild.required<TemplateRef<unknown>>('panel');

  private readonly overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private overlayRef?: OverlayRef;
  private target?: HTMLElement;

  /** Whether the panel is currently open. */
  readonly visible = signal(false);

  private readonly onDocumentKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      this.hide();
    }
  };

  /** Opens the panel anchored to the event's currentTarget, or closes it. */
  toggle(event: Event): void {
    this.visible() ? this.hide() : this.show(event);
  }

  /** Opens the panel anchored to the event's currentTarget. */
  show(event: Event): void {
    const target = (event.currentTarget ?? event.target) as HTMLElement;
    if (this.visible()) {
      this.hide();
    }
    this.target = target;
    this.overlayRef = this.createOverlay(target);
    this.overlayRef.attach(new TemplatePortal(this.panelTemplate(), this.viewContainerRef));
    document.addEventListener('keydown', this.onDocumentKeydown);
    this.visible.set(true);
    this.onShow.emit();
  }

  /** Closes the panel; focus moved into the panel returns to the anchor. */
  hide(): void {
    if (!this.visible()) {
      return;
    }
    document.removeEventListener('keydown', this.onDocumentKeydown);
    const target = this.target;
    const focusWasInside =
      this.overlayRef?.overlayElement.contains(document.activeElement) ?? false;
    this.overlayRef?.dispose();
    this.overlayRef = undefined;
    this.target = undefined;
    this.visible.set(false);
    if (focusWasInside) {
      target?.focus();
    }
    this.onHide.emit();
  }

  private createOverlay(target: HTMLElement): OverlayRef {
    const overlayRef = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(target)
        .withPositions([
          { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 8 },
          { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -8 },
          { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 8 },
          { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -8 },
        ]),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
    });
    overlayRef.outsidePointerEvents().subscribe((event) => {
      if (!this.target?.contains(event.target as Node)) {
        this.hide();
      }
    });
    return overlayRef;
  }

  ngOnDestroy(): void {
    document.removeEventListener('keydown', this.onDocumentKeydown);
    this.overlayRef?.dispose();
  }
}
