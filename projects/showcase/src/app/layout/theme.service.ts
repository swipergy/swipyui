import { Injectable, effect, signal } from '@angular/core';

const STORAGE_KEY = 'syui-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly dark = signal(document.documentElement.classList.contains('syui-dark'));

  constructor() {
    effect(() => {
      document.documentElement.classList.toggle('syui-dark', this.dark());
      try {
        localStorage.setItem(STORAGE_KEY, this.dark() ? 'dark' : 'light');
      } catch {
        // storage unavailable (private mode, test environment) — theme just won't persist
      }
    });
  }

  toggle(): void {
    this.dark.update((dark) => !dark);
  }
}
