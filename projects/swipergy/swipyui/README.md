# SwipyUI

SwipyUI is an Angular UI component library with design-token based theming. Components are standalone, signal-based, OnPush, and styled out of the box with CSS custom properties — including dark mode.

**Live demo:** <https://www.swipergy.com/swipyui>

## Installation

```bash
npm install @swipergy/swipyui @angular/cdk
```

Add the default theme and the Angular CDK overlay styles to your `styles.scss` (or the `styles` array in `angular.json`):

```scss
@import "@angular/cdk/overlay-prebuilt.css";
@import "@swipergy/swipyui/themes/default/default.css";
```

## Usage

Every component ships as its own entry point, so you only import what you use:

```ts
import { Button } from '@swipergy/swipyui/button';

@Component({
  imports: [Button],
  template: `<syui-button label="Save" severity="primary" />`,
})
export class MyComponent {}
```

## Components

| Category | Components |
|---|---|
| Button | Button, SpeedDial, SplitButton |
| Form | AutoComplete, Checkbox, DatePicker, FloatLabel, IconField, InputGroup, InputMask, InputNumber, InputOtp, InputText, Knob, Listbox, MultiSelect, Password, RadioButton, Rating, Select, SelectButton, Slider, Textarea, ToggleButton, ToggleSwitch, TreeSelect |
| Overlay | CommandPalette, ConfirmDialog, Dialog, Drawer, Popover, Toast, Tooltip |
| Data | Chart, DataView, OrderList, Paginator, PickList, Table, Timeline, Tree, VirtualScroller |
| Panel | Accordion, Card, Divider, Fieldset, Panel, ScrollPanel, Splitter, Stepper, Tabs, Toolbar |
| Menu | Breadcrumb, ContextMenu, Menu, Menubar, PanelMenu, TieredMenu |
| Messages | Message |
| Misc | Avatar, Badge, Carousel, Chip, EmptyState, Image, Inplace, Kbd, MeterGroup, ProgressBar, ProgressSpinner, ScrollTop, Skeleton, Tag |

## Theming

SwipyUI is themed entirely through CSS custom properties in three layers: primitive tokens (`--syui-primary-500`), semantic tokens (`--syui-primary`, `--syui-text-color`), and component tokens (`--syui-button-primary-background`). Override any layer in your own stylesheet to customize — see the [styling manual](STYLING.md) for the full guide with recipes.

Dark mode: add the `syui-dark` class to `<html>` or `<body>`.

```js
document.documentElement.classList.toggle('syui-dark');
```

## License

MIT
