import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  signal,
} from '@angular/core';

/** One node of `<syui-tree>`; `key` must be unique across the whole tree. */
export interface TreeNode {
  key: string;
  label: string;
  /** CSS class(es) rendered as `<i [class]>` for user-supplied icon fonts. */
  icon?: string;
  children?: TreeNode[];
  /** Forces leaf (no expander) or branch rendering; defaults to `!children?.length`. */
  leaf?: boolean;
  /** Set to false to exclude the node from selection. */
  selectable?: boolean;
}

/** Check state used for the tri-state checkboxes: 0 none, 1 partial, 2 checked. */
type CheckState = 0 | 1 | 2;

interface VisibleNode {
  node: TreeNode;
  parentKey: string | null;
}

/**
 * Hierarchical tree following the WAI-ARIA tree pattern: roving tabindex on
 * the tree items, Up/Down move through visible nodes, Right expands or enters
 * a branch, Left collapses or moves to the parent, Home/End jump, and
 * Enter/Space selects (or toggles the checkbox in checkbox mode).
 *
 * `expandedKeys` is a `Record<string, boolean>` keyed by node key; a key set
 * to true renders that branch expanded. `selection` holds `TreeNode` objects:
 * a single node in `single` mode, an array in `multiple` and `checkbox` mode.
 * In checkbox mode parents are tri-state: a parent is partial when some
 * descendants are checked, and enters the selection once all of its
 * selectable children are checked.
 *
 * ```html
 * <syui-tree [value]="files" selectionMode="single" [(selection)]="selected" />
 * <syui-tree [value]="files" selectionMode="checkbox" [(selection)]="checked" filter />
 * ```
 */
@Component({
  selector: 'syui-tree',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './tree.css',
  imports: [NgTemplateOutlet],
  host: { class: 'syui-tree' },
  template: `
    @if (filter()) {
      <input
        type="text"
        class="syui-tree-filter"
        role="searchbox"
        aria-label="Filter tree"
        [placeholder]="filterPlaceholder()"
        [value]="filterQuery()"
        (input)="onFilterInput($event)"
      />
    }
    <ul
      class="syui-tree-root"
      role="tree"
      [attr.aria-label]="ariaLabel() || null"
      [attr.aria-multiselectable]="
        selectionMode() === 'multiple' || selectionMode() === 'checkbox' ? true : null
      "
    >
      @for (node of filteredNodes().nodes; track node.key) {
        <ng-container
          *ngTemplateOutlet="
            nodeTpl;
            context: {
              $implicit: node,
              level: 1,
              posinset: $index + 1,
              setsize: filteredNodes().nodes.length,
            }
          "
        />
      } @empty {
        <li class="syui-tree-empty">{{ emptyMessage() }}</li>
      }
    </ul>

    <ng-template #nodeTpl let-node let-level="level" let-posinset="posinset" let-setsize="setsize">
      <li
        class="syui-tree-node"
        role="treeitem"
        [attr.data-key]="node.key"
        [attr.aria-level]="level"
        [attr.aria-posinset]="posinset"
        [attr.aria-setsize]="setsize"
        [attr.aria-expanded]="isLeaf(node) ? null : isExpanded(node)"
        [attr.aria-selected]="ariaSelectedFor(node)"
        [attr.aria-checked]="ariaCheckedFor(node)"
        [tabindex]="tabIndexFor(node)"
        (keydown)="onKeydown($event, node)"
      >
        <div
          class="syui-tree-node-content"
          [class.syui-tree-node-selectable]="canSelect(node)"
          [class.syui-tree-node-selected]="selectionMode() !== 'checkbox' && isSelected(node)"
          (click)="onNodeClick(node)"
        >
          <button
            type="button"
            class="syui-tree-toggler"
            tabindex="-1"
            aria-hidden="true"
            [class.syui-tree-toggler-hidden]="isLeaf(node)"
            (click)="onTogglerClick($event, node)"
          >
            <svg
              class="syui-tree-chevron"
              [class.syui-tree-chevron-expanded]="isExpanded(node)"
              viewBox="0 0 12 12"
              fill="none"
            >
              <path
                d="M4.5 2.5L8 6L4.5 9.5"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
          @if (selectionMode() === 'checkbox') {
            <span
              class="syui-tree-checkbox"
              aria-hidden="true"
              [class.syui-tree-checkbox-checked]="checkStateOf(node) === 2"
              [class.syui-tree-checkbox-partial]="checkStateOf(node) === 1"
            >
              @if (checkStateOf(node) === 2) {
                <svg viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2.5 6.5L5 9L9.5 3.5"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              } @else if (checkStateOf(node) === 1) {
                <svg viewBox="0 0 12 12" fill="none">
                  <path d="M3 6H9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                </svg>
              }
            </span>
          }
          @if (node.icon) {
            <i class="syui-tree-node-icon" [class]="node.icon" aria-hidden="true"></i>
          }
          <span class="syui-tree-node-label">{{ node.label }}</span>
        </div>
        @if (!isLeaf(node) && isExpanded(node) && node.children?.length) {
          <ul class="syui-tree-children" role="group">
            @for (child of node.children; track child.key) {
              <ng-container
                *ngTemplateOutlet="
                  nodeTpl;
                  context: {
                    $implicit: child,
                    level: level + 1,
                    posinset: $index + 1,
                    setsize: node.children.length,
                  }
                "
              />
            }
          </ul>
        }
      </li>
    </ng-template>
  `,
})
export class Tree {
  /** Root nodes of the tree. */
  readonly value = input<TreeNode[]>([]);
  /** How nodes are selected; null renders a plain, non-selectable tree. */
  readonly selectionMode = input<'single' | 'multiple' | 'checkbox' | null>(null);
  /** Selected node (single) or nodes (multiple/checkbox); supports two-way binding. */
  readonly selection = model<TreeNode | TreeNode[] | null>(null);
  /** Expansion state as a record of node key → true; supports two-way binding. */
  readonly expandedKeys = model<Record<string, boolean>>({});
  /** Shows a filter box that narrows nodes by label and auto-expands matches. */
  readonly filter = input(false, { transform: booleanAttribute });
  readonly filterPlaceholder = input('Search…');
  readonly emptyMessage = input('No nodes');
  readonly ariaLabel = input<string>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly filterQuery = signal('');
  private readonly focusedKey = signal<string | null>(null);

  /** `selection` normalized to an array. */
  private readonly selectionArray = computed(() => {
    const selection = this.selection();
    return selection == null ? [] : Array.isArray(selection) ? selection : [selection];
  });

  /** Every node of the full tree by key, with its parent for checkbox propagation. */
  private readonly nodeMap = computed(() => {
    const map = new Map<string, { node: TreeNode; parent: TreeNode | null }>();
    const walk = (nodes: TreeNode[], parent: TreeNode | null): void => {
      for (const node of nodes) {
        map.set(node.key, { node, parent });
        if (node.children) {
          walk(node.children, node);
        }
      }
    };
    walk(this.value(), null);
    return map;
  });

  /**
   * Tree narrowed by the filter query. Nodes whose label matches keep their
   * full subtree; ancestors of matches are kept (with filtered children) and
   * force-expanded via `forced` so matches are visible.
   */
  protected readonly filteredNodes = computed(() => {
    const query = this.filter() ? this.filterQuery().trim().toLowerCase() : '';
    if (!query) {
      return { nodes: this.value(), forced: null as Set<string> | null };
    }
    const forced = new Set<string>();
    const walk = (nodes: TreeNode[]): TreeNode[] => {
      const out: TreeNode[] = [];
      for (const node of nodes) {
        if (node.label.toLowerCase().includes(query)) {
          out.push(node);
          continue;
        }
        const children = node.children?.length ? walk(node.children) : [];
        if (children.length) {
          out.push({ ...node, children });
          forced.add(node.key);
        }
      }
      return out;
    };
    return { nodes: walk(this.value()), forced };
  });

  /** Visible nodes in document order, for Up/Down/Home/End navigation. */
  private readonly visibleNodes = computed(() => {
    const out: VisibleNode[] = [];
    const walk = (nodes: TreeNode[], parentKey: string | null): void => {
      for (const node of nodes) {
        out.push({ node, parentKey });
        if (!this.isLeaf(node) && this.isExpanded(node) && node.children?.length) {
          walk(node.children, node.key);
        }
      }
    };
    walk(this.filteredNodes().nodes, null);
    return out;
  });

  /** The single node carrying tabindex 0 (roving tabindex). */
  private readonly effectiveFocusKey = computed(() => {
    const key = this.focusedKey();
    const visible = this.visibleNodes();
    return key !== null && visible.some((v) => v.node.key === key)
      ? key
      : (visible[0]?.node.key ?? null);
  });

  /** Tri-state check states by key; only meaningful in checkbox mode. */
  private readonly checkStates = computed(() => {
    const selected = new Set(this.selectionArray().map((node) => node.key));
    const map = new Map<string, CheckState>();
    const walk = (node: TreeNode): CheckState => {
      const childStates = (node.children ?? []).map(walk);
      let state: CheckState = selected.has(node.key) ? 2 : 0;
      if (state !== 2 && childStates.some((s) => s > 0)) {
        state = 1;
      }
      map.set(node.key, state);
      return state;
    };
    this.value().forEach(walk);
    return map;
  });

  protected isLeaf(node: TreeNode): boolean {
    return node.leaf ?? !node.children?.length;
  }

  protected isExpanded(node: TreeNode): boolean {
    return this.filteredNodes().forced?.has(node.key) || !!this.expandedKeys()[node.key];
  }

  protected canSelect(node: TreeNode): boolean {
    return this.selectionMode() !== null && node.selectable !== false;
  }

  protected isSelected(node: TreeNode): boolean {
    if (this.selectionMode() === 'checkbox') {
      return this.checkStateOf(node) === 2;
    }
    return this.selectionArray().some((selected) => selected.key === node.key);
  }

  protected checkStateOf(node: TreeNode): CheckState {
    return this.checkStates().get(node.key) ?? 0;
  }

  protected ariaSelectedFor(node: TreeNode): boolean | null {
    const mode = this.selectionMode();
    return mode === 'single' || mode === 'multiple' ? this.isSelected(node) : null;
  }

  protected ariaCheckedFor(node: TreeNode): string | null {
    if (this.selectionMode() !== 'checkbox') {
      return null;
    }
    const state = this.checkStateOf(node);
    return state === 2 ? 'true' : state === 1 ? 'mixed' : 'false';
  }

  protected tabIndexFor(node: TreeNode): number {
    return node.key === this.effectiveFocusKey() ? 0 : -1;
  }

  protected onFilterInput(event: Event): void {
    this.filterQuery.set((event.target as HTMLInputElement).value);
  }

  protected onTogglerClick(event: Event, node: TreeNode): void {
    event.stopPropagation();
    this.focusedKey.set(node.key);
    this.setExpanded(node, !this.isExpanded(node));
  }

  protected onNodeClick(node: TreeNode): void {
    this.focusedKey.set(node.key);
    this.activate(node);
  }

  protected onKeydown(event: KeyboardEvent, node: TreeNode): void {
    // treeitems are nested; stop the event before ancestor items re-handle it
    event.stopPropagation();
    const visible = this.visibleNodes();
    const index = visible.findIndex((v) => v.node.key === node.key);
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.focusByKey(visible[index + 1]?.node.key);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.focusByKey(visible[index - 1]?.node.key);
        break;
      case 'ArrowRight':
        event.preventDefault();
        if (!this.isLeaf(node)) {
          if (!this.isExpanded(node)) {
            this.setExpanded(node, true);
          } else if (node.children?.length) {
            this.focusByKey(node.children[0].key);
          }
        }
        break;
      case 'ArrowLeft':
        event.preventDefault();
        if (!this.isLeaf(node) && this.isExpanded(node)) {
          this.setExpanded(node, false);
        } else if (index >= 0 && visible[index].parentKey !== null) {
          this.focusByKey(visible[index].parentKey!);
        }
        break;
      case 'Home':
        event.preventDefault();
        this.focusByKey(visible[0]?.node.key);
        break;
      case 'End':
        event.preventDefault();
        this.focusByKey(visible[visible.length - 1]?.node.key);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.activate(node);
        break;
    }
  }

  /** Selects, toggles the checkbox, or (without a selectionMode) toggles expansion. */
  private activate(node: TreeNode): void {
    const mode = this.selectionMode();
    if (mode === 'checkbox') {
      this.toggleCheck(node);
      return;
    }
    if (mode === 'single') {
      if (node.selectable === false) {
        return;
      }
      const current = this.selection();
      this.selection.set(!Array.isArray(current) && current?.key === node.key ? null : node);
      return;
    }
    if (mode === 'multiple') {
      if (node.selectable === false) {
        return;
      }
      const current = this.selectionArray();
      this.selection.set(
        current.some((selected) => selected.key === node.key)
          ? current.filter((selected) => selected.key !== node.key)
          : [...current, node],
      );
      return;
    }
    if (!this.isLeaf(node)) {
      this.setExpanded(node, !this.isExpanded(node));
    }
  }

  /**
   * Toggles a checkbox: (un)checks the node and all selectable descendants,
   * then walks up checking ancestors whose selectable children are now all
   * checked and unchecking the rest.
   */
  private toggleCheck(node: TreeNode): void {
    if (node.selectable === false) {
      return;
    }
    const map = this.nodeMap();
    // filtered nodes are shallow copies; toggle the full subtree from `value`
    const full = map.get(node.key)?.node ?? node;
    const selected = new Map(this.selectionArray().map((n) => [n.key, n]));
    const wasChecked = this.checkStateOf(node) === 2;
    const visit = (n: TreeNode): void => {
      if (n.selectable !== false) {
        wasChecked ? selected.delete(n.key) : selected.set(n.key, n);
      }
      n.children?.forEach(visit);
    };
    visit(full);
    let parent = map.get(node.key)?.parent ?? null;
    while (parent) {
      const children = (parent.children ?? []).filter((c) => c.selectable !== false);
      const complete = children.length > 0 && children.every((c) => selected.has(c.key));
      if (complete && parent.selectable !== false) {
        selected.set(parent.key, parent);
      } else {
        selected.delete(parent.key);
      }
      parent = map.get(parent.key)?.parent ?? null;
    }
    this.selection.set([...selected.values()]);
  }

  private setExpanded(node: TreeNode, expanded: boolean): void {
    const keys = { ...this.expandedKeys() };
    if (expanded) {
      keys[node.key] = true;
    } else {
      delete keys[node.key];
    }
    this.expandedKeys.set(keys);
  }

  private focusByKey(key: string | undefined | null): void {
    if (key == null) {
      return;
    }
    this.focusedKey.set(key);
    // escape backslashes and quotes so the key is a valid CSS attribute string
    const escaped = key.replace(/["\\]/g, '\\$&');
    const find = (): HTMLElement | null =>
      this.host.nativeElement.querySelector<HTMLElement>(`[data-key="${escaped}"]`);
    const element = find();
    if (element) {
      element.focus();
    } else {
      // node renders on the next change detection (e.g. right after expanding)
      setTimeout(() => find()?.focus());
    }
  }
}
