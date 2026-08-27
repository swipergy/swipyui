import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  TemplateRef,
  ViewContainerRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  forwardRef,
  inject,
  input,
  numberAttribute,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { BaseValueControl, uniqueId } from '@swipergy/swipyui/core';
import { Tree, TreeNode } from '@swipergy/swipyui/tree';

/**
 * Form control that picks nodes from a tree rendered in an overlay panel.
 * The trigger opens a `<syui-tree>`; in `single` mode picking a node closes
 * the panel, in `checkbox` mode the panel stays open and the trigger shows
 * the selected labels comma-joined (or "n items selected" past
 * `maxSelectedLabels`). Escape closes the panel from the trigger or the tree.
 *
 * The control's value holds node **keys**, not nodes: a single key string
 * (or null) in `single` mode, and an array of the checked node keys —
 * including fully-checked parents — in `checkbox` mode.
 *
 * Implements the signal forms value contract, so it binds directly to a
 * field, and stays compatible with reactive and template-driven forms:
 *
 * ```html
 * <syui-tree-select [options]="files" placeholder="Select a file" [formField]="f.file" />
 * <syui-tree-select [options]="files" selectionMode="checkbox" [formControl]="files" />
 * <syui-tree-select [options]="files" [(value)]="file" />
 * ```
 */
@Component({
  selector: 'syui-tree-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './treeselect.css',
  imports: [Tree],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TreeSelect), multi: true },
  ],
  template: `
    <button
      #trigger
      type="button"
      class="syui-tree-select"
      role="combobox"
      aria-haspopup="tree"
      [class.syui-fluid]="fluid()"
      [class.syui-invalid]="showInvalid()"
      [class.syui-tree-select-open]="open()"
      [attr.aria-expanded]="open()"
      [attr.aria-controls]="open() ? panelId : null"
      [attr.aria-label]="ariaLabel() || null"
      [attr.aria-labelledby]="ariaLabelledby() || null"
      [attr.aria-describedby]="ariaDescribedby() || null"
      [attr.aria-invalid]="showInvalid() || null"
      [disabled]="isDisabled()"
      (click)="toggle()"
      (keydown)="onKeydown($event)"
      (blur)="onTouched()"
    >
      <span class="syui-tree-select-label" [class.syui-tree-select-placeholder]="!triggerLabel()">
        {{ triggerLabel() || placeholder() }}
      </span>
      <svg class="syui-tree-select-chevron" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path
          d="M2.5 4.5L6 8L9.5 4.5"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>

    <ng-template #panel>
      <div class="syui-tree-select-panel" [id]="panelId">
        <syui-tree
          [value]="options()"
          [selectionMode]="selectionMode()"
          [selection]="treeSelection()"
          [(expandedKeys)]="expandedKeys"
          (selectionChange)="onTreeSelectionChange($event)"
        />
      </div>
    </ng-template>
  `,
})
export class TreeSelect extends BaseValueControl<string | string[]> {
  /** Root nodes offered for selection. */
  readonly options = input<TreeNode[]>([]);
  /** Single node (value: key string) or checkbox selection (value: key array). */
  readonly selectionMode = input<'single' | 'checkbox'>('single');
  readonly placeholder = input('Select…');
  /** Above this many checked nodes the trigger shows "n items selected". */
  readonly maxSelectedLabels = input(3, { transform: numberAttribute });
  /** Stretches the trigger to the width of its container. */
  readonly fluid = input(false, { transform: booleanAttribute });
  readonly onShow = output<void>();
  readonly onHide = output<void>();

  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  private readonly panelTemplate = viewChild.required<TemplateRef<unknown>>('panel');

  private readonly overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private overlayRef?: OverlayRef;

  protected readonly panelId = uniqueId('syui-tree-select-panel');
  protected readonly open = signal(false);
  protected readonly expandedKeys = signal<Record<string, boolean>>({});

  /** Every node of the options tree by key. */
  private readonly nodeByKey = computed(() => {
    const map = new Map<string, TreeNode>();
    const walk = (nodes: TreeNode[]): void => {
      for (const node of nodes) {
        map.set(node.key, node);
        if (node.children) {
          walk(node.children);
        }
      }
    };
    walk(this.options());
    return map;
  });

  /** Nodes matching the keys in `value`; unknown keys are ignored. */
  private readonly selectedNodes = computed(() => {
    const value = this.value();
    const keys = value == null ? [] : Array.isArray(value) ? value : [value];
    const map = this.nodeByKey();
    return keys.map((key) => map.get(key)).filter((node): node is TreeNode => node !== undefined);
  });

  /** `value` translated into the Tree's selection shape. */
  protected readonly treeSelection = computed(() =>
    this.selectionMode() === 'single'
      ? (this.selectedNodes()[0] ?? null)
      : this.selectedNodes(),
  );

  protected readonly triggerLabel = computed(() => {
    const nodes = this.selectedNodes();
    if (nodes.length === 0) {
      return '';
    }
    return this.selectionMode() === 'checkbox' && nodes.length > this.maxSelectedLabels()
      ? `${nodes.length} items selected`
      : nodes.map((node) => node.label).join(', ');
  });

  constructor() {
    super();
    inject(DestroyRef).onDestroy(() => this.overlayRef?.dispose());
  }

  /** Maps the tree selection back to keys; closes the panel in single mode. */
  protected onTreeSelectionChange(selection: TreeNode | TreeNode[] | null): void {
    if (this.selectionMode() === 'single') {
      const node = Array.isArray(selection) ? selection[0] : selection;
      this.updateValue(node?.key ?? null);
      this.hide();
      this.trigger().nativeElement.focus();
    } else {
      const nodes = selection == null ? [] : Array.isArray(selection) ? selection : [selection];
      this.updateValue(nodes.map((node) => node.key));
    }
  }

  protected toggle(): void {
    this.open() ? this.hide() : this.show();
  }

  protected show(): void {
    if (this.open()) {
      return;
    }
    this.overlayRef ??= this.createOverlay();
    this.overlayRef.attach(new TemplatePortal(this.panelTemplate(), this.viewContainerRef));
    this.open.set(true);
    // move focus into the tree once it has rendered
    setTimeout(() => {
      if (this.open()) {
        this.overlayRef?.overlayElement
          ?.querySelector<HTMLElement>('[role="treeitem"][tabindex="0"]')
          ?.focus();
      }
    });
    this.onShow.emit();
  }

  protected hide(): void {
    if (!this.open()) {
      return;
    }
    this.overlayRef?.detach();
    this.open.set(false);
    this.onHide.emit();
  }

  protected onKeydown(event: KeyboardEvent): void {
    const { key } = event;
    if (!this.open()) {
      if (key === 'ArrowDown' || key === 'ArrowUp' || key === 'Enter' || key === ' ') {
        event.preventDefault();
        this.show();
      }
      return;
    }
    if (key === 'Escape' || key === 'Tab') {
      this.hide();
    }
  }

  private createOverlay(): OverlayRef {
    const trigger = this.trigger();
    const overlayRef = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(trigger)
        .withPositions([
          { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
          { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
        ]),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      minWidth: trigger.nativeElement.offsetWidth,
    });
    overlayRef.outsidePointerEvents().subscribe((event) => {
      if (!trigger.nativeElement.contains(event.target as Node)) {
        this.hide();
      }
    });
    overlayRef.keydownEvents().subscribe((event) => {
      if (event.key === 'Escape' || event.key === 'Tab') {
        // Escape dismisses; Tab closes and continues tabbing from the trigger,
        // so keyboard focus never gets stranded behind the overlay.
        this.hide();
        trigger.nativeElement.focus();
      }
    });
    return overlayRef;
  }
}
