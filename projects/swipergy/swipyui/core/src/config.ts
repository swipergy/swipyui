import { InjectionToken, Provider, inject } from '@angular/core';

export interface SwipyUIConfig {
  /**
   * Base z-index for overlays (dialog, select panel, toast, tooltip).
   * Defaults to 1000.
   */
  zIndex?: number;
}

const DEFAULT_CONFIG: Required<SwipyUIConfig> = {
  zIndex: 1000,
};

export const SWIPY_UI_CONFIG = new InjectionToken<Required<SwipyUIConfig>>('SWIPY_UI_CONFIG', {
  factory: () => DEFAULT_CONFIG,
});

/**
 * Optional application-level configuration for SwipyUI components.
 *
 * ```ts
 * bootstrapApplication(App, { providers: [provideSwipyUI({ zIndex: 2000 })] });
 * ```
 */
export function provideSwipyUI(config: SwipyUIConfig = {}): Provider {
  return { provide: SWIPY_UI_CONFIG, useValue: { ...DEFAULT_CONFIG, ...config } };
}

export function injectSwipyUIConfig(): Required<SwipyUIConfig> {
  return inject(SWIPY_UI_CONFIG);
}
