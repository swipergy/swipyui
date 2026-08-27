/**
 * Item model shared by all menu-style components (Menu, Menubar, Breadcrumb,
 * TieredMenu, ContextMenu, PanelMenu, SplitButton, SpeedDial, Stepper …).
 */
export interface MenuItem {
  label?: string;
  /**
   * Accessible name for the item when `label` alone is missing or
   * insufficient (e.g. icon-only items); rendered as `aria-label`.
   */
  ariaLabel?: string;
  /** CSS class(es) for a user-supplied icon font, rendered as `<i [class]>`. */
  icon?: string;
  disabled?: boolean;
  /** Hides the item entirely when false. */
  visible?: boolean;
  /** Renders a separator instead of a link. */
  separator?: boolean;
  /** External link target; rendered as a plain anchor. */
  url?: string;
  target?: string;
  /** Angular router link; rendered with routerLink when set. */
  routerLink?: string | unknown[];
  /** Invoked when the item is activated. */
  command?: (event: { originalEvent?: Event; item: MenuItem }) => void;
  /** Nested items for hierarchical menus. */
  items?: MenuItem[];
}
