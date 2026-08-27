import {
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  Directive,
  ElementRef,
  OnDestroy,
  ViewEncapsulation,
  inject,
  input,
  signal,
} from '@angular/core';
import { ConnectedPosition, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { uniqueId } from '@swipergy/swipyui/core';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

const POSITIONS: Record<TooltipPosition, ConnectedPosition[]> = {
  top: [
    { originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom', offsetY: -8 },
    { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top', offsetY: 8 },
  ],
  bottom: [
    { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top', offsetY: 8 },
    { originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom', offsetY: -8 },
  ],
  left: [
    { originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center', offsetX: -8 },
    { originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center', offsetX: 8 },
  ],
  right: [
    { originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center', offsetX: 8 },
    { originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center', offsetX: -8 },
  ],
};

@Component({
  selector: 'syui-tooltip-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './tooltip.css',
  host: {
    class: 'syui-tooltip',
    role: 'tooltip',
    '[id]': 'id',
  },
  template: `{{ text() }}`,
})
export class TooltipPanel {
  readonly text = signal('');
  readonly id = uniqueId('syui-tooltip');
}

/** Grace period that lets the pointer travel from the trigger onto the tooltip. */
const HIDE_DELAY = 150;

/**
 * Shows a text tooltip on hover and keyboard focus. The tooltip stays open
 * while the trigger is focused or the trigger/tooltip is hovered, and can be
 * dismissed with Escape without moving focus.
 *
 * ```html
 * <syui-button label="Save" syuiTooltip="Persist your changes" />
 * <input syuiInputText syuiTooltip="At least 8 characters" tooltipPosition="right" />
 * ```
 */
@Directive({
  selector: '[syuiTooltip]',
  host: {
    '(mouseenter)': 'show()',
    '(mouseleave)': 'scheduleHide()',
    '(focusin)': 'show()',
    '(focusout)': 'scheduleHide()',
  },
})
export class Tooltip implements OnDestroy {
  /** Tooltip text; empty string disables the tooltip. */
  readonly syuiTooltip = input.required<string>();
  readonly tooltipPosition = input<TooltipPosition>('top');

  private readonly overlay = inject(Overlay);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  private overlayRef?: OverlayRef;
  private panelRef?: ComponentRef<TooltipPanel>;
  private hideTimeout?: ReturnType<typeof setTimeout>;

  /** Dismisses on Escape without moving focus; capture keeps enclosing overlays open. */
  private readonly onDocumentKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      this.hide();
    }
  };

  protected show(): void {
    this.cancelHide();
    if (!this.syuiTooltip() || this.overlayRef?.hasAttached()) {
      return;
    }
    this.overlayRef ??= this.createOverlay();
    this.panelRef = this.overlayRef.attach(new ComponentPortal(TooltipPanel));
    this.panelRef.instance.text.set(this.syuiTooltip());
    this.host.nativeElement.setAttribute('aria-describedby', this.panelRef.instance.id);
    document.addEventListener('keydown', this.onDocumentKeydown, true);
  }

  /** Hides after a grace period unless the trigger is still hovered or focused. */
  protected scheduleHide(): void {
    this.cancelHide();
    this.hideTimeout = setTimeout(() => {
      this.hideTimeout = undefined;
      const host = this.host.nativeElement;
      if (host.matches(':hover') || host.contains(document.activeElement)) {
        return;
      }
      this.hide();
    }, HIDE_DELAY);
  }

  protected hide(): void {
    this.cancelHide();
    document.removeEventListener('keydown', this.onDocumentKeydown, true);
    this.overlayRef?.detach();
    this.host.nativeElement.removeAttribute('aria-describedby');
  }

  private cancelHide(): void {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = undefined;
    }
  }

  private createOverlay(): OverlayRef {
    const overlayRef = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(this.host)
        .withPositions(POSITIONS[this.tooltipPosition()]),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
    });
    // Keep the tooltip open while the pointer rests on it.
    overlayRef.overlayElement.addEventListener('mouseenter', () => this.cancelHide());
    overlayRef.overlayElement.addEventListener('mouseleave', () => this.scheduleHide());
    return overlayRef;
  }

  ngOnDestroy(): void {
    this.cancelHide();
    document.removeEventListener('keydown', this.onDocumentKeydown, true);
    this.overlayRef?.dispose();
  }
}
