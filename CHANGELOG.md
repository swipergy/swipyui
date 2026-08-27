# Changelog

## 1.4.0

- **Table**: column filter menus — `filterDisplay="menu"` replaces the inline filter row with a funnel icon in each filterable header that opens a popup filter. Text columns take one or more match-mode constraints (`startsWith`, `contains`, `notContains`, `endsWith`, `equals`, `notEquals`) joined by Match All (AND) or Match Any (OR), with Add Rule / Clear / Apply; select columns show their dropdown. New per-column `filterMatchModeOptions` restricts the modes offered, `filterMatchMode` gained `notContains`/`notEquals`, and the `onLazyLoad` event carries the full per-column `filterMeta` alongside the existing `filters` map. The default `filterDisplay="row"` is unchanged.

## 1.3.0

- **Prefix rename**: the library prefix changed from `sy` to `syui` — component selectors (`<sy-button>` → `<syui-button>`), directive selectors and inputs (`syTooltip` → `syuiTooltip`, `syDataViewListItem` → `syuiDataViewListItem`, …), CSS classes (`.sy-*` → `.syui-*`), design tokens (`--sy-*` → `--syui-*`) and the dark-theme class (`.syui-dark`). TypeScript class names and the package name are unchanged.
- **Table**: users can reorder columns by dragging a column header onto another (`reorderableColumns`); the drop side is indicated while dragging. New two-way bindable `columnOrder` (keyed like `hiddenColumns`) to persist the arrangement, and an `onColumnReorder` event.
- **Table**: dropdown column filters — `filterType="select"` renders the column's filter as a dropdown of its distinct values (or the choices passed via `filterOptions`) with an "All" reset choice; select filters match exactly.
- **Accessibility**: fixes from a WCAG 2.2 / WAI-ARIA re-audit of the full catalog. Table column reordering gained a keyboard path (Arrow Left/Right on the focused header) as the SC 2.5.7 alternative to dragging, row checkboxes carry row-identifying labels, and the column chooser announces as a dialog. Autocomplete, Select, MultiSelect, TreeSelect, DatePicker and ToggleButton now expose `aria-invalid` and honor `ariaLabelledby`/`ariaDescribedby`. Popover (new `ariaLabel`/`ariaLabelledby` inputs), CommandPalette and header-less ConfirmDialog have accessible dialog names. DatePicker's month button no longer masks the visible month/year, so grid naming and month-change announcements work. Chart line/area series get per-series dash patterns (mirrored in the legend) and pie/donut slices direct labels (SC 1.4.1). Carousel hides off-viewport slides from AT and the tab order (`inert`), announces page changes via a status region, and has a default region name. SelectButton is a `radiogroup` in single mode, InputNumber exposes `aria-valuetext` for formatted values, Tabs' tablist and ScrollPanel/VirtualScroller regions are only landmarks when named, Toolbar implements a roving tabindex (single tab stop), PanelMenu uses disclosure semantics on the focusable items instead of orphaned tree roles, and Chip images no longer duplicate the visible label.
- **Docs**: the showcase sidebar has a component search box, and tables span the full width of the demo previews.
- **Chart** (new): dependency-free SVG charts — line, area, grouped bar, pie and donut. Series colors come from a new categorical theme palette (`--sy-chart-color-1…8`, hue order chosen for color-vision-deficiency separation, re-stepped for dark mode); every mark carries a native tooltip with its exact value, multi-series charts get a legend, and the SVG scales to its container.
- **VirtualScroller** (new): renders only the visible slice of a large fixed-item-size list (vertical or horizontal), with native scrolling, `overscan` control, `scrollToIndex()`, and an `onScrollIndexChange` output.

## 1.2.2

- **SplitButton**: fixed white gaps between the two halves — the chevron button's inner corners could keep their rounding depending on stylesheet injection order and cut into the primary button.

## 1.2.1

- **MultiSelect**: chips no longer widen or wrap the trigger. In `display="chip"` the control keeps its width; chips that don't fit collapse into a "+n" chip whose tooltip lists the hidden selections, and a lone oversized chip ellipsizes. Re-fits automatically on selection changes and trigger resize.

## 1.1.1

- **Docs**: README now lists the complete component catalog (71 components across all groups) for the npm package page.

## 1.1.0

Accessibility release: all components target WCAG 2.2 Level AAA.

- **Contrast (SC 1.4.6)**: default-theme semantic tokens reworked so every text/background pair meets ≥ 7:1 in light and dark mode — primary is now indigo-700 (light) / indigo-300 (dark), muted text zinc-600 / zinc-300, placeholders zinc-600 / zinc-400, status colors moved to 900-shades on light backgrounds and 300/400-shades in dark mode. New status-palette primitives (`--sy-green/red/amber/blue-300/700/800/900`).
- **Target size (SC 2.5.5)**: new `--sy-target-size` token (2.75rem / 44px); interactive controls get a minimum 44×44 px pointer target, either directly or via invisible hit-area expansion on visually small controls (checkboxes, switches, chip/close icons, slider thumbs, paginator buttons, …).
- **Reduced motion (SC 2.3.3)**: global `prefers-reduced-motion` support in the theme disables component transitions and animations; essential motion (e.g. the progress spinner) falls back to a slowed, subtle variant.
- **Focus appearance (SC 2.4.7 / 2.4.11 / 2.4.13)**: consistent `:focus-visible` rings on all interactive elements via the `--sy-focus-ring-*` tokens, ≥ 2px thick with AAA-contrast ring color.
- **Keyboard operability (SC 2.1.1 / 2.1.3)**: component-by-component audit of the full catalog against the corresponding WAI-ARIA APG patterns — menus, combobox pickers, datepicker grid, tree, table sorting, splitter resize, slider/knob/rating all fully keyboard-operable with correct focus management (Escape close + focus restore, roving tabindex, no traps outside modals).
- **ARIA & semantics (SC 4.1.2 / 4.1.3 / 1.3.1)**: roles, states and properties completed across the catalog; live-region announcements for toasts, messages and autocomplete result counts; `ariaLabel` inputs for icon-only controls; status severities carry icons so meaning is not conveyed by color alone (SC 1.4.1).
- **Timing (SC 2.2.3)**: toast auto-dismiss pauses on hover/focus and can be disabled entirely.
- **Docs**: new “Accessibility (WCAG 2.2 AAA)” section in the styling manual.

## 1.0.0

First stable release.

- Full component catalog (~70 secondary entry points) covering form, data, panel, overlay, menu, messages and misc groups.
- **Table**: lazy mode (`httpResource` demo), global filter, column toggle, built-in CSV export toolbar button.
- **Datepicker**: range selection and forms validation support.
- **CommandPalette, Kbd, EmptyState** components; styling manual (`STYLING.md`).
- Signal forms support for all form controls.
- Showcase app with per-component demo pages, deployable bundle (`npm run build:showcase`) targeting www.swipergy.com/swipyui/.

## 0.1.0

Initial release.

- **Theming**: three-layer design-token system (primitive / semantic / component) as CSS custom properties, default theme, dark mode via the `sy-dark` class.
- **Form**: Button, InputText, Textarea, Checkbox, RadioButton, Select, ToggleSwitch — all ControlValueAccessors work with template-driven, reactive and signal forms.
- **Overlay**: Dialog (focus trap, ESC/backdrop close), Toast (service + live-region outlet), Tooltip.
- **Panel**: Card, Tabs (ARIA tabs pattern).
- Per-component secondary entry points (`@swipergy/swipyui/button`, …), standalone signal-based components, `OnPush` change detection.
