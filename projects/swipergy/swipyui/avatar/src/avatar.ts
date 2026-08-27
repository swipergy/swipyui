import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  linkedSignal,
} from '@angular/core';

export type AvatarSize = 'normal' | 'large' | 'xlarge';
export type AvatarShape = 'square' | 'circle';

/**
 * Represents a person or entity with an image, initials or an icon.
 * When the image fails to load, the avatar falls back to the label
 * (or icon) automatically.
 *
 * ```html
 * <syui-avatar label="FK" shape="circle" />
 * <syui-avatar image="https://example.com/frank.png" label="FK" size="large" />
 * ```
 */
@Component({
  selector: 'syui-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './avatar.css',
  host: {
    class: 'syui-avatar',
    '[class.syui-avatar-circle]': "shape() === 'circle'",
    '[class.syui-avatar-large]': "size() === 'large'",
    '[class.syui-avatar-xlarge]': "size() === 'xlarge'",
    '[attr.role]': "ariaLabel() ? 'img' : null",
    '[attr.aria-label]': 'ariaLabel() ?? null',
  },
  template: `
    @if (image() && !imageFailed()) {
      <img
        class="syui-avatar-image"
        [src]="image()"
        [alt]="ariaLabel() ? '' : (label() ?? '')"
        (error)="imageFailed.set(true)"
      />
    } @else if (label()) {
      <span class="syui-avatar-label" [attr.aria-hidden]="ariaLabel() ? 'true' : null">{{
        label()
      }}</span>
    } @else if (icon()) {
      <i class="syui-avatar-icon" [class]="icon()" aria-hidden="true"></i>
    }
    <ng-content />
  `,
})
export class Avatar {
  /** Initials shown when no image is set (or the image failed to load). */
  readonly label = input<string>();
  /** Image URL; falls back to `label`/`icon` on load error. */
  readonly image = input<string>();
  /** CSS class of a user-supplied icon font glyph. */
  readonly icon = input<string>();
  /**
   * Accessible name of the avatar, e.g. the full person name. When set, the
   * host gets `role="img"` and the initials/image are hidden from assistive
   * technology in favor of this label.
   */
  readonly ariaLabel = input<string>();
  readonly size = input<AvatarSize>('normal');
  readonly shape = input<AvatarShape>('square');

  /** True once the current image URL failed to load; resets when `image` changes. */
  protected readonly imageFailed = linkedSignal({
    source: this.image,
    computation: () => false,
  });
}

/**
 * Lays out projected `<syui-avatar>` children as an overlapping stack.
 *
 * ```html
 * <syui-avatar-group>
 *   <syui-avatar label="A" shape="circle" />
 *   <syui-avatar label="B" shape="circle" />
 *   <syui-avatar label="+2" shape="circle" />
 * </syui-avatar-group>
 * ```
 */
@Component({
  selector: 'syui-avatar-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './avatar.css',
  host: { class: 'syui-avatar-group' },
  template: `<ng-content />`,
})
export class AvatarGroup {}
