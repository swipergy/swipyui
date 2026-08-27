import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  TemplateRef,
  ViewContainerRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { A11yModule } from '@angular/cdk/a11y';

const MIN_SCALE = 0.25;
const MAX_SCALE = 4;
const SCALE_STEP = 0.25;

/**
 * Displays an image with an optional full-screen preview: with `preview`
 * enabled, hovering shows a magnifier indicator and clicking opens the image
 * in a masked CDK overlay with rotate/zoom controls; Escape, the mask and the
 * close button dismiss it.
 *
 * ```html
 * <syui-image src="/photos/beach.jpg" alt="Beach" width="250" preview />
 * ```
 */
@Component({
  selector: 'syui-image',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './image.css',
  imports: [A11yModule],
  host: { class: 'syui-image' },
  template: `
    <img
      class="syui-image-img"
      [src]="src()"
      [alt]="alt()"
      [attr.width]="width() ?? null"
      [attr.height]="height() ?? null"
    />
    @if (preview()) {
      <button
        type="button"
        class="syui-image-preview-indicator"
        aria-label="Preview image"
        (click)="show()"
      >
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="7" cy="7" r="4.5" stroke="currentColor" stroke-width="1.5" />
          <path d="M10.5 10.5L14 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      </button>
    }

    <ng-template #previewPanel>
      <div
        class="syui-image-preview"
        role="dialog"
        aria-modal="true"
        aria-label="Image preview"
        cdkTrapFocus
        cdkTrapFocusAutoCapture
        (keydown.escape)="hide()"
      >
        <div class="syui-image-toolbar">
          <button
            type="button"
            class="syui-image-action"
            aria-label="Rotate left"
            (click)="rotateLeft()"
          >
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M4 6.5H2V4.5M2.2 6.3A6 6 0 1 1 2 8"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            class="syui-image-action"
            aria-label="Rotate right"
            (click)="rotateRight()"
          >
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M12 6.5H14V4.5M13.8 6.3A6 6 0 1 0 14 8"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            class="syui-image-action"
            aria-label="Zoom out"
            [disabled]="scale() <= minScale"
            (click)="zoomOut()"
          >
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="7" cy="7" r="4.5" stroke="currentColor" stroke-width="1.5" />
              <path d="M10.5 10.5L14 14M5 7H9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
          </button>
          <button
            type="button"
            class="syui-image-action"
            aria-label="Zoom in"
            [disabled]="scale() >= maxScale"
            (click)="zoomIn()"
          >
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="7" cy="7" r="4.5" stroke="currentColor" stroke-width="1.5" />
              <path
                d="M10.5 10.5L14 14M5 7H9M7 5V9"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            </svg>
          </button>
          <button type="button" class="syui-image-action" aria-label="Close preview" (click)="hide()">
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
          </button>
        </div>
        <img
          class="syui-image-preview-img"
          [src]="src()"
          [alt]="alt()"
          [style.transform]="previewTransform()"
        />
      </div>
    </ng-template>
  `,
})
export class Image {
  readonly src = input.required<string>();
  readonly alt = input('');
  /** Rendered as the img `width` attribute. */
  readonly width = input<string | number>();
  /** Rendered as the img `height` attribute. */
  readonly height = input<string | number>();
  /** Enables the full-screen preview with rotate and zoom controls. */
  readonly preview = input(false, { transform: booleanAttribute });

  readonly onShow = output<void>();
  readonly onHide = output<void>();

  private readonly previewTemplate = viewChild.required<TemplateRef<unknown>>('previewPanel');

  private readonly overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private overlayRef?: OverlayRef;
  private previouslyFocused?: HTMLElement;

  protected readonly minScale = MIN_SCALE;
  protected readonly maxScale = MAX_SCALE;

  protected readonly rotation = signal(0);
  protected readonly scale = signal(1);

  protected readonly previewTransform = computed(
    () => `rotate(${this.rotation()}deg) scale(${this.scale()})`,
  );

  constructor() {
    inject(DestroyRef).onDestroy(() => this.overlayRef?.dispose());
  }

  protected show(): void {
    if (this.overlayRef?.hasAttached()) {
      return;
    }
    this.previouslyFocused = (document.activeElement as HTMLElement) ?? undefined;
    this.rotation.set(0);
    this.scale.set(1);
    this.overlayRef ??= this.createOverlay();
    this.overlayRef.attach(new TemplatePortal(this.previewTemplate(), this.viewContainerRef));
    this.onShow.emit();
  }

  protected hide(): void {
    if (!this.overlayRef?.hasAttached()) {
      return;
    }
    this.overlayRef.detach();
    this.previouslyFocused?.focus();
    this.previouslyFocused = undefined;
    this.onHide.emit();
  }

  protected rotateLeft(): void {
    this.rotation.update((deg) => deg - 90);
  }

  protected rotateRight(): void {
    this.rotation.update((deg) => deg + 90);
  }

  protected zoomIn(): void {
    this.scale.update((scale) => Math.min(MAX_SCALE, scale + SCALE_STEP));
  }

  protected zoomOut(): void {
    this.scale.update((scale) => Math.max(MIN_SCALE, scale - SCALE_STEP));
  }

  private createOverlay(): OverlayRef {
    const overlayRef = this.overlay.create({
      positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
      scrollStrategy: this.overlay.scrollStrategies.block(),
      hasBackdrop: true,
      backdropClass: 'syui-image-mask',
    });
    overlayRef.backdropClick().subscribe(() => this.hide());
    return overlayRef;
  }
}
