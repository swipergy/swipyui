import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/landing/landing').then((m) => m.Landing),
  },
  {
    path: 'installation',
    loadComponent: () => import('./pages/installation/installation').then((m) => m.Installation),
  },
  {
    path: 'theming',
    loadComponent: () => import('./pages/theming/theming').then((m) => m.Theming),
  },
  {
    path: 'validation',
    loadComponent: () => import('./pages/validation/validation').then((m) => m.Validation),
  },
  {
    path: 'demo',
    loadComponent: () => import('./pages/demo/demo').then((m) => m.Demo),
  },
  {
    path: 'components/button',
    loadComponent: () => import('./pages/button/button-demo').then((m) => m.ButtonDemo),
  },
  {
    path: 'components/inputtext',
    loadComponent: () =>
      import('./pages/inputtext/inputtext-demo').then((m) => m.InputTextDemo),
  },
  {
    path: 'components/textarea',
    loadComponent: () => import('./pages/textarea/textarea-demo').then((m) => m.TextareaDemo),
  },
  {
    path: 'components/checkbox',
    loadComponent: () => import('./pages/checkbox/checkbox-demo').then((m) => m.CheckboxDemo),
  },
  {
    path: 'components/radiobutton',
    loadComponent: () =>
      import('./pages/radiobutton/radiobutton-demo').then((m) => m.RadioButtonDemo),
  },
  {
    path: 'components/toggleswitch',
    loadComponent: () =>
      import('./pages/toggleswitch/toggleswitch-demo').then((m) => m.ToggleSwitchDemo),
  },
  {
    path: 'components/tooltip',
    loadComponent: () => import('./pages/tooltip/tooltip-demo').then((m) => m.TooltipDemo),
  },
  {
    path: 'components/select',
    loadComponent: () => import('./pages/select/select-demo').then((m) => m.SelectDemo),
  },
  {
    path: 'components/dialog',
    loadComponent: () => import('./pages/dialog/dialog-demo').then((m) => m.DialogDemo),
  },
  {
    path: 'components/toast',
    loadComponent: () => import('./pages/toast/toast-demo').then((m) => m.ToastDemo),
  },
  {
    path: 'components/card',
    loadComponent: () => import('./pages/card/card-demo').then((m) => m.CardDemo),
  },
  {
    path: 'components/tabs',
    loadComponent: () => import('./pages/tabs/tabs-demo').then((m) => m.TabsDemo),
  },
  {
    path: 'components/table',
    loadComponent: () => import('./pages/table/table-demo').then((m) => m.TableDemo),
  },
  {
    path: 'components/carousel',
    loadComponent: () => import('./pages/carousel/carousel-demo').then((m) => m.CarouselDemo),
  },
  {
    path: 'components/image',
    loadComponent: () => import('./pages/image/image-demo').then((m) => m.ImageDemo),
  },
  {
    path: 'components/scrolltop',
    loadComponent: () => import('./pages/scrolltop/scrolltop-demo').then((m) => m.ScrolltopDemo),
  },
  {
    path: 'components/inplace',
    loadComponent: () => import('./pages/inplace/inplace-demo').then((m) => m.InplaceDemo),
  },
  {
    path: 'components/splitbutton',
    loadComponent: () =>
      import('./pages/splitbutton/splitbutton-demo').then((m) => m.SplitButtonDemo),
  },
  {
    path: 'components/speeddial',
    loadComponent: () => import('./pages/speeddial/speeddial-demo').then((m) => m.SpeedDialDemo),
  },
  {
    path: 'components/selectbutton',
    loadComponent: () =>
      import('./pages/selectbutton/selectbutton-demo').then((m) => m.SelectButtonDemo),
  },
  {
    path: 'components/togglebutton',
    loadComponent: () =>
      import('./pages/togglebutton/togglebutton-demo').then((m) => m.ToggleButtonDemo),
  },
  {
    path: 'components/iconfield',
    loadComponent: () => import('./pages/iconfield/iconfield-demo').then((m) => m.IconFieldDemo),
  },
  {
    path: 'components/inputgroup',
    loadComponent: () =>
      import('./pages/inputgroup/inputgroup-demo').then((m) => m.InputGroupDemo),
  },
  {
    path: 'components/floatlabel',
    loadComponent: () =>
      import('./pages/floatlabel/floatlabel-demo').then((m) => m.FloatLabelDemo),
  },
  {
    path: 'components/accordion',
    loadComponent: () => import('./pages/accordion/accordion-demo').then((m) => m.AccordionDemo),
  },
  {
    path: 'components/panel',
    loadComponent: () => import('./pages/panel/panel-demo').then((m) => m.PanelDemo),
  },
  {
    path: 'components/fieldset',
    loadComponent: () => import('./pages/fieldset/fieldset-demo').then((m) => m.FieldsetDemo),
  },
  {
    path: 'components/toolbar',
    loadComponent: () => import('./pages/toolbar/toolbar-demo').then((m) => m.ToolbarDemo),
  },
  {
    path: 'components/autocomplete',
    loadComponent: () =>
      import('./pages/autocomplete/autocomplete-demo').then((m) => m.AutocompleteDemo),
  },
  {
    path: 'components/password',
    loadComponent: () => import('./pages/password/password-demo').then((m) => m.PasswordDemo),
  },
  {
    path: 'components/menu',
    loadComponent: () => import('./pages/menu/menu-demo').then((m) => m.MenuDemo),
  },
  {
    path: 'components/menubar',
    loadComponent: () => import('./pages/menubar/menubar-demo').then((m) => m.MenubarDemo),
  },
  {
    path: 'components/breadcrumb',
    loadComponent: () =>
      import('./pages/breadcrumb/breadcrumb-demo').then((m) => m.BreadcrumbDemo),
  },
  {
    path: 'components/multiselect',
    loadComponent: () =>
      import('./pages/multiselect/multiselect-demo').then((m) => m.MultiSelectDemo),
  },
  {
    path: 'components/listbox',
    loadComponent: () => import('./pages/listbox/listbox-demo').then((m) => m.ListboxDemo),
  },
  {
    path: 'components/slider',
    loadComponent: () => import('./pages/slider/slider-demo').then((m) => m.SliderDemo),
  },
  {
    path: 'components/knob',
    loadComponent: () => import('./pages/knob/knob-demo').then((m) => m.KnobDemo),
  },
  {
    path: 'components/rating',
    loadComponent: () => import('./pages/rating/rating-demo').then((m) => m.RatingDemo),
  },
  {
    path: 'components/avatar',
    loadComponent: () => import('./pages/avatar/avatar-demo').then((m) => m.AvatarDemo),
  },
  {
    path: 'components/badge',
    loadComponent: () => import('./pages/badge/badge-demo').then((m) => m.BadgeDemo),
  },
  {
    path: 'components/chip',
    loadComponent: () => import('./pages/chip/chip-demo').then((m) => m.ChipDemo),
  },
  {
    path: 'components/tag',
    loadComponent: () => import('./pages/tag/tag-demo').then((m) => m.TagDemo),
  },
  {
    path: 'components/paginator',
    loadComponent: () => import('./pages/paginator/paginator-demo').then((m) => m.PaginatorDemo),
  },
  {
    path: 'components/dataview',
    loadComponent: () => import('./pages/dataview/dataview-demo').then((m) => m.DataViewDemo),
  },
  {
    path: 'components/timeline',
    loadComponent: () => import('./pages/timeline/timeline-demo').then((m) => m.TimelineDemo),
  },
  {
    path: 'components/divider',
    loadComponent: () => import('./pages/divider/divider-demo').then((m) => m.DividerDemo),
  },
  {
    path: 'components/splitter',
    loadComponent: () => import('./pages/splitter/splitter-demo').then((m) => m.SplitterDemo),
  },
  {
    path: 'components/scrollpanel',
    loadComponent: () =>
      import('./pages/scrollpanel/scrollpanel-demo').then((m) => m.ScrollPanelDemo),
  },
  {
    path: 'components/stepper',
    loadComponent: () => import('./pages/stepper/stepper-demo').then((m) => m.StepperDemo),
  },
  {
    path: 'components/confirmdialog',
    loadComponent: () =>
      import('./pages/confirmdialog/confirmdialog-demo').then((m) => m.ConfirmDialogDemo),
  },
  {
    path: 'components/popover',
    loadComponent: () => import('./pages/popover/popover-demo').then((m) => m.PopoverDemo),
  },
  {
    path: 'components/drawer',
    loadComponent: () => import('./pages/drawer/drawer-demo').then((m) => m.DrawerDemo),
  },
  {
    path: 'components/tieredmenu',
    loadComponent: () =>
      import('./pages/tieredmenu/tieredmenu-demo').then((m) => m.TieredMenuDemo),
  },
  {
    path: 'components/contextmenu',
    loadComponent: () =>
      import('./pages/contextmenu/contextmenu-demo').then((m) => m.ContextMenuDemo),
  },
  {
    path: 'components/panelmenu',
    loadComponent: () => import('./pages/panelmenu/panelmenu-demo').then((m) => m.PanelMenuDemo),
  },
  {
    path: 'components/message',
    loadComponent: () => import('./pages/message/message-demo').then((m) => m.MessageDemo),
  },
  {
    path: 'components/progressbar',
    loadComponent: () =>
      import('./pages/progressbar/progressbar-demo').then((m) => m.ProgressBarDemo),
  },
  {
    path: 'components/progressspinner',
    loadComponent: () =>
      import('./pages/progressspinner/progressspinner-demo').then((m) => m.ProgressSpinnerDemo),
  },
  {
    path: 'components/skeleton',
    loadComponent: () => import('./pages/skeleton/skeleton-demo').then((m) => m.SkeletonDemo),
  },
  {
    path: 'components/metergroup',
    loadComponent: () =>
      import('./pages/metergroup/metergroup-demo').then((m) => m.MeterGroupDemo),
  },
  {
    path: 'components/datepicker',
    loadComponent: () =>
      import('./pages/datepicker/datepicker-demo').then((m) => m.DatePickerDemo),
  },
  {
    path: 'components/inputnumber',
    loadComponent: () =>
      import('./pages/inputnumber/inputnumber-demo').then((m) => m.InputNumberDemo),
  },
  {
    path: 'components/inputmask',
    loadComponent: () => import('./pages/inputmask/inputmask-demo').then((m) => m.InputMaskDemo),
  },
  {
    path: 'components/inputotp',
    loadComponent: () => import('./pages/inputotp/inputotp-demo').then((m) => m.InputOtpDemo),
  },
  {
    path: 'components/orderlist',
    loadComponent: () => import('./pages/orderlist/orderlist-demo').then((m) => m.OrderListDemo),
  },
  {
    path: 'components/picklist',
    loadComponent: () => import('./pages/picklist/picklist-demo').then((m) => m.PickListDemo),
  },
  {
    path: 'components/tree',
    loadComponent: () => import('./pages/tree/tree-demo').then((m) => m.TreeDemo),
  },
  {
    path: 'components/treeselect',
    loadComponent: () =>
      import('./pages/treeselect/treeselect-demo').then((m) => m.TreeSelectDemo),
  },
  {
    path: 'components/commandpalette',
    loadComponent: () =>
      import('./pages/commandpalette/commandpalette-demo').then((m) => m.CommandPaletteDemo),
  },
  {
    path: 'components/kbd',
    loadComponent: () => import('./pages/kbd/kbd-demo').then((m) => m.KbdDemo),
  },
  {
    path: 'components/emptystate',
    loadComponent: () =>
      import('./pages/emptystate/emptystate-demo').then((m) => m.EmptyStateDemo),
  },
  {
    path: 'components/chart',
    loadComponent: () => import('./pages/chart/chart-demo').then((m) => m.ChartDemo),
  },
  {
    path: 'components/virtualscroller',
    loadComponent: () =>
      import('./pages/virtualscroller/virtualscroller-demo').then((m) => m.VirtualScrollerDemo),
  },
  { path: '**', redirectTo: '' },
];
