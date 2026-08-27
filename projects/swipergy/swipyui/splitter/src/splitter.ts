import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  computed,
  contentChildren,
  effect,
  forwardRef,
  inject,
  input,
  model,
} from '@angular/core';

export type SplitterLayout = 'horizontal' | 'vertical';

/**
 * One resizable pane inside `<syui-splitter>`; its size is managed by the
 * parent splitter through the `panelSizes` model.
 */
@Component({
  selector: 'syui-splitter-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'syui-splitter-panel',
    '[style.order]': '2 * index()',
    '[style.flex-grow]': 'size()',
  },
  template: `<ng-content />`,
})
export class SplitterPanel {
  private readonly splitter = inject<Splitter>(forwardRef(() => Splitter));

  /** Position of this panel among its siblings. */
  readonly index = computed(() => this.splitter.panelList().indexOf(this));

  /** Current size in percent of the splitter's usable space. */
  readonly size = computed(() => this.splitter.panelSizes()[this.index()] ?? 0);
}

/**
 * Splits its panels horizontally or vertically with draggable gutters,
 * following the WAI-ARIA window splitter pattern: each gutter is a focusable
 * separator that also resizes with the arrow keys, while Home/End shrink or
 * grow the preceding panel to its limit. Splitters nest freely.
 *
 * ```html
 * <syui-splitter [(panelSizes)]="sizes" [minSizes]="[20, 20]">
 *   <syui-splitter-panel>Left</syui-splitter-panel>
 *   <syui-splitter-panel>Right</syui-splitter-panel>
 * </syui-splitter>
 * ```
 */
@Component({
  selector: 'syui-splitter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './splitter.css',
  host: {
    class: 'syui-splitter',
    '[class.syui-splitter-vertical]': "layout() === 'vertical'",
  },
  template: `
    <ng-content />
    @for (panel of panelList(); track panel; let i = $index; let last = $last) {
      @if (!last) {
        <div
          class="syui-splitter-gutter"
          role="separator"
          tabindex="0"
          [style.order]="2 * i + 1"
          [attr.aria-orientation]="layout() === 'horizontal' ? 'vertical' : 'horizontal'"
          [attr.aria-valuenow]="rounded(i)"
          [attr.aria-valuemin]="minSizes()[i] ?? 0"
          aria-valuemax="100"
          aria-label="Resize panels"
          (pointerdown)="onPointerDown($event, i)"
          (pointermove)="onPointerMove($event, i)"
          (pointerup)="onPointerUp($event)"
          (pointercancel)="onPointerUp($event)"
          (keydown)="onKeydown($event, i)"
        ></div>
      }
    }
  `,
})
export class Splitter {
  /** Direction in which the panels are laid out. */
  readonly layout = input<SplitterLayout>('horizontal');
  /**
   * Panel sizes in percent, one entry per panel; defaults to equal sizes.
   * Supports two-way binding and is updated while dragging a gutter.
   */
  readonly panelSizes = model<number[]>([]);
  /** Minimum size in percent per panel; missing entries default to 0. */
  readonly minSizes = input<number[]>([]);

  readonly panelList = contentChildren(SplitterPanel);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  private dragging = false;
  private dragStartPos = 0;
  private dragStartSizes: number[] = [];
  private dragContainerSize = 1;

  constructor() {
    // default to equal sizes whenever the panel count and sizes disagree
    effect(() => {
      const count = this.panelList().length;
      if (count && this.panelSizes().length !== count) {
        this.panelSizes.set(Array.from({ length: count }, () => 100 / count));
      }
    });
  }

  /** Size of the panel before gutter `i`, rounded for aria-valuenow. */
  protected rounded(i: number): number {
    return Math.round(this.panelSizes()[i] ?? 0);
  }

  protected onPointerDown(event: PointerEvent, index: number): void {
    event.preventDefault();
    const gutter = event.currentTarget as HTMLElement;
    gutter.setPointerCapture?.(event.pointerId);
    const horizontal = this.layout() === 'horizontal';
    const el = this.host.nativeElement;
    const gutterSize = horizontal ? gutter.offsetWidth : gutter.offsetHeight;
    const gutterCount = this.panelList().length - 1;
    this.dragging = true;
    this.dragStartPos = horizontal ? event.clientX : event.clientY;
    this.dragStartSizes = [...this.panelSizes()];
    this.dragContainerSize = Math.max(
      (horizontal ? el.clientWidth : el.clientHeight) - gutterCount * gutterSize,
      1,
    );
  }

  protected onPointerMove(event: PointerEvent, index: number): void {
    if (!this.dragging) {
      return;
    }
    const pos = this.layout() === 'horizontal' ? event.clientX : event.clientY;
    const deltaPercent = ((pos - this.dragStartPos) / this.dragContainerSize) * 100;
    this.resizePair(index, deltaPercent, this.dragStartSizes);
  }

  protected onPointerUp(event: PointerEvent): void {
    if (!this.dragging) {
      return;
    }
    this.dragging = false;
    (event.currentTarget as HTMLElement).releasePointerCapture?.(event.pointerId);
  }

  protected onKeydown(event: KeyboardEvent, index: number): void {
    const horizontal = this.layout() === 'horizontal';
    let delta: number;
    switch (event.key) {
      case horizontal ? 'ArrowLeft' : 'ArrowUp':
        delta = -1;
        break;
      case horizontal ? 'ArrowRight' : 'ArrowDown':
        delta = 1;
        break;
      case 'Home':
        // collapse the preceding panel to its minimum size
        delta = -100;
        break;
      case 'End':
        // grow the preceding panel as far as the next panel's minimum allows
        delta = 100;
        break;
      default:
        return;
    }
    event.preventDefault();
    this.resizePair(index, delta, this.panelSizes());
  }

  /**
   * Distribute `deltaPercent` between the panels adjacent to gutter `index`,
   * clamped so neither panel shrinks below its minimum size.
   */
  private resizePair(index: number, deltaPercent: number, base: number[]): void {
    const total = base[index] + base[index + 1];
    const minPrev = this.minSizes()[index] ?? 0;
    const minNext = this.minSizes()[index + 1] ?? 0;
    const prev = Math.min(Math.max(base[index] + deltaPercent, minPrev), total - minNext);
    const sizes = [...base];
    sizes[index] = prev;
    sizes[index + 1] = total - prev;
    this.panelSizes.set(sizes);
  }
}
