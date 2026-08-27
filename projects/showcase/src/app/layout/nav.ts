export interface NavItem {
  label: string;
  path: string;
  /** Short pill shown after the label, e.g. "New" for a fresh component group. */
  badge?: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV: NavGroup[] = [
  {
    label: 'Getting Started',
    items: [
      { label: 'Installation', path: '/installation' },
      { label: 'Theming', path: '/theming' },
      { label: 'Validation', path: '/validation' },
      { label: 'Demo', path: '/demo' },
    ],
  },
  {
    label: 'Button',
    items: [
      { label: 'Button', path: '/components/button' },
      { label: 'SpeedDial', path: '/components/speeddial' },
      { label: 'SplitButton', path: '/components/splitbutton' },
    ],
  },
  {
    label: 'Form',
    items: [
      { label: 'AutoComplete', path: '/components/autocomplete' },
      { label: 'Checkbox', path: '/components/checkbox' },
      { label: 'DatePicker', path: '/components/datepicker' },
      { label: 'FloatLabel', path: '/components/floatlabel' },
      { label: 'IconField', path: '/components/iconfield' },
      { label: 'InputGroup', path: '/components/inputgroup' },
      { label: 'InputMask', path: '/components/inputmask' },
      { label: 'InputNumber', path: '/components/inputnumber' },
      { label: 'InputOtp', path: '/components/inputotp' },
      { label: 'InputText', path: '/components/inputtext' },
      { label: 'Knob', path: '/components/knob' },
      { label: 'Listbox', path: '/components/listbox' },
      { label: 'MultiSelect', path: '/components/multiselect' },
      { label: 'Password', path: '/components/password' },
      { label: 'RadioButton', path: '/components/radiobutton' },
      { label: 'Rating', path: '/components/rating' },
      { label: 'Select', path: '/components/select' },
      { label: 'SelectButton', path: '/components/selectbutton' },
      { label: 'Slider', path: '/components/slider' },
      { label: 'Textarea', path: '/components/textarea' },
      { label: 'ToggleButton', path: '/components/togglebutton' },
      { label: 'ToggleSwitch', path: '/components/toggleswitch' },
      { label: 'TreeSelect', path: '/components/treeselect' },
    ],
  },
  {
    label: 'Agentic',
    items: [
      { label: 'AgentSteps', path: '/components/agentsteps', badge: 'New' },
      { label: 'Approval', path: '/components/approval', badge: 'New' },
      { label: 'Chat', path: '/components/chat', badge: 'New' },
      { label: 'Citation', path: '/components/citation', badge: 'New' },
      { label: 'PromptInput', path: '/components/promptinput', badge: 'New' },
      { label: 'PromptSuggestions', path: '/components/promptsuggestions', badge: 'New' },
      { label: 'Reasoning', path: '/components/reasoning', badge: 'New' },
      { label: 'ToolCall', path: '/components/toolcall', badge: 'New' },
    ],
  },
  {
    label: 'Overlay',
    items: [
      { label: 'CommandPalette', path: '/components/commandpalette' },
      { label: 'ConfirmDialog', path: '/components/confirmdialog' },
      { label: 'Dialog', path: '/components/dialog' },
      { label: 'Drawer', path: '/components/drawer' },
      { label: 'Popover', path: '/components/popover' },
      { label: 'Toast', path: '/components/toast' },
      { label: 'Tooltip', path: '/components/tooltip' },
    ],
  },
  {
    label: 'Data',
    items: [
      { label: 'Chart', path: '/components/chart' },
      { label: 'DataView', path: '/components/dataview' },
      { label: 'OrderList', path: '/components/orderlist' },
      { label: 'Paginator', path: '/components/paginator' },
      { label: 'PickList', path: '/components/picklist' },
      { label: 'Table', path: '/components/table' },
      { label: 'Timeline', path: '/components/timeline' },
      { label: 'Tree', path: '/components/tree' },
      { label: 'VirtualScroller', path: '/components/virtualscroller' },
    ],
  },
  {
    label: 'Panel',
    items: [
      { label: 'Accordion', path: '/components/accordion' },
      { label: 'Card', path: '/components/card' },
      { label: 'Divider', path: '/components/divider' },
      { label: 'Fieldset', path: '/components/fieldset' },
      { label: 'Panel', path: '/components/panel' },
      { label: 'ScrollPanel', path: '/components/scrollpanel' },
      { label: 'Splitter', path: '/components/splitter' },
      { label: 'Stepper', path: '/components/stepper' },
      { label: 'Tabs', path: '/components/tabs' },
      { label: 'Toolbar', path: '/components/toolbar' },
    ],
  },
  {
    label: 'Menu',
    items: [
      { label: 'Breadcrumb', path: '/components/breadcrumb' },
      { label: 'ContextMenu', path: '/components/contextmenu' },
      { label: 'Menu', path: '/components/menu' },
      { label: 'Menubar', path: '/components/menubar' },
      { label: 'PanelMenu', path: '/components/panelmenu' },
      { label: 'TieredMenu', path: '/components/tieredmenu' },
    ],
  },
  {
    label: 'Messages',
    items: [{ label: 'Message', path: '/components/message' }],
  },
  {
    label: 'Misc',
    items: [
      { label: 'Avatar', path: '/components/avatar' },
      { label: 'Badge', path: '/components/badge' },
      { label: 'Carousel', path: '/components/carousel' },
      { label: 'Chip', path: '/components/chip' },
      { label: 'EmptyState', path: '/components/emptystate' },
      { label: 'Image', path: '/components/image' },
      { label: 'Inplace', path: '/components/inplace' },
      { label: 'Kbd', path: '/components/kbd' },
      { label: 'MeterGroup', path: '/components/metergroup' },
      { label: 'ProgressBar', path: '/components/progressbar' },
      { label: 'ProgressSpinner', path: '/components/progressspinner' },
      { label: 'ScrollTop', path: '/components/scrolltop' },
      { label: 'Skeleton', path: '/components/skeleton' },
      { label: 'Tag', path: '/components/tag' },
    ],
  },
];
