import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  output,
} from '@angular/core';

export type ButtonSeverity = 'primary' | 'secondary' | 'success' | 'danger';
export type ButtonVariant = 'filled' | 'outlined' | 'text';
export type ButtonSize = 'small' | 'normal' | 'large';

/**
 * Button with severity, variant, and size options, plus a loading state.
 *
 * ```html
 * <syui-button label="Save" severity="primary" (onClick)="save()" />
 * <syui-button severity="danger" variant="outlined">Delete</syui-button>
 * ```
 */
@Component({
  selector: 'syui-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './button.css',
  template: `
    <button
      class="syui-button"
      [type]="type()"
      [class]="cssClass()"
      [disabled]="disabled() || loading()"
      [attr.aria-busy]="loading() || null"
      [attr.aria-label]="ariaLabel() || null"
      (click)="onClick.emit($event)"
    >
      @if (loading()) {
        <span class="syui-button-spinner" aria-hidden="true"></span>
      }
      @if (label()) {
        <span class="syui-button-label">{{ label() }}</span>
      } @else {
        <ng-content />
      }
    </button>
  `,
})
export class Button {
  /** Text shown inside the button; alternative to projected content. */
  readonly label = input<string>();
  readonly severity = input<ButtonSeverity>('primary');
  readonly variant = input<ButtonVariant>('filled');
  readonly size = input<ButtonSize>('normal');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Shows a spinner and disables the button while true. */
  readonly loading = input(false, { transform: booleanAttribute });
  readonly ariaLabel = input<string>();

  readonly onClick = output<MouseEvent>();

  protected readonly cssClass = computed(() =>
    [
      `syui-button-${this.severity()}`,
      `syui-button-${this.variant()}`,
      this.size() !== 'normal' ? `syui-button-${this.size()}` : '',
      this.loading() ? 'syui-button-loading' : '',
    ]
      .filter(Boolean)
      .join(' '),
  );
}
