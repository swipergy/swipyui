import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  afterNextRender,
  inject,
  input,
} from '@angular/core';

/**
 * Layout container that groups actions into start, center, and end slots,
 * selected with the `syui-toolbar-start`, `syui-toolbar-center`, and
 * `syui-toolbar-end` attributes. The toolbar is a single tab stop:
 * ArrowLeft/ArrowRight move focus between the toolbar's controls, Home/End
 * jump to the edges (WAI-ARIA toolbar pattern).
 *
 * ```html
 * <syui-toolbar ariaLabel="Editor actions">
 *   <div syui-toolbar-start><syui-button label="New" /></div>
 *   <div syui-toolbar-center>search…</div>
 *   <div syui-toolbar-end><syui-button label="Save" /></div>
 * </syui-toolbar>
 * ```
 */
@Component({
  selector: 'syui-toolbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './toolbar.css',
  host: {
    class: 'syui-toolbar',
    role: 'toolbar',
    '[attr.aria-label]': 'ariaLabel() || null',
    '(keydown)': 'onKeydown($event)',
    '(focusin)': 'updateTabStops($event.target)',
  },
  template: `
    <div class="syui-toolbar-start">
      <ng-content select="[syui-toolbar-start]" />
    </div>
    <div class="syui-toolbar-center">
      <ng-content select="[syui-toolbar-center]" />
    </div>
    <div class="syui-toolbar-end">
      <ng-content select="[syui-toolbar-end]" />
    </div>
  `,
})
export class Toolbar {
  /** Accessible name for the toolbar. */
  readonly ariaLabel = input<string>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    afterNextRender(() => this.updateTabStops());
  }

  /** Moves focus between the toolbar's controls (WAI-ARIA toolbar pattern). */
  protected onKeydown(event: KeyboardEvent): void {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) {
      return;
    }
    const target = event.target as HTMLElement;
    // Leave caret movement inside text fields alone.
    if (target.matches('input, textarea, select, [contenteditable="true"]')) {
      return;
    }
    const controls = this.focusableControls();
    const index = controls.indexOf(target);
    if (index < 0) {
      return;
    }
    let next: number;
    switch (event.key) {
      case 'ArrowRight':
        next = (index + 1) % controls.length;
        break;
      case 'ArrowLeft':
        next = (index - 1 + controls.length) % controls.length;
        break;
      case 'Home':
        next = 0;
        break;
      default:
        next = controls.length - 1;
    }
    event.preventDefault();
    controls[next].focus();
  }

  /**
   * Roving tabindex: exactly one of the toolbar's controls stays in the Tab
   * sequence. Only controls without their own `tabindex` management are
   * touched, so composite widgets inside the toolbar keep working.
   */
  protected updateTabStops(active?: EventTarget | null): void {
    const controls = this.rovingCandidates();
    if (!controls.length) {
      return;
    }
    const current =
      active instanceof HTMLElement && controls.includes(active)
        ? active
        : (controls.find((control) => control.getAttribute('tabindex') === '0') ?? controls[0]);
    for (const control of controls) {
      control.setAttribute('tabindex', control === current ? '0' : '-1');
      control.dataset['syuiToolbarItem'] = 'true';
    }
  }

  /** Natively tabbable controls, plus the ones this toolbar already manages. */
  private rovingCandidates(): HTMLElement[] {
    return Array.from(
      this.host.nativeElement.querySelectorAll<HTMLElement>(
        'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled)',
      ),
    ).filter(
      (control) => !control.hasAttribute('tabindex') || 'syuiToolbarItem' in control.dataset,
    );
  }

  private focusableControls(): HTMLElement[] {
    return Array.from(
      this.host.nativeElement.querySelectorAll<HTMLElement>(
        'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), ' +
          'textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
      ),
    );
  }
}
