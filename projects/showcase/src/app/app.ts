import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ThemeService } from './layout/theme.service';
import { NAV } from './layout/nav';
import { version } from '../../../swipergy/swipyui/package.json';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly theme = inject(ThemeService);
  protected readonly version = version;

  protected readonly navQuery = signal('');

  /** Nav groups whose items match the sidebar search; empty groups are dropped. */
  protected readonly nav = computed(() => {
    const query = this.navQuery().trim().toLowerCase();
    if (!query) {
      return NAV;
    }
    return NAV.map((group) => ({
      ...group,
      items: group.items.filter((item) => item.label.toLowerCase().includes(query)),
    })).filter((group) => group.items.length > 0);
  });

  protected onNavQueryInput(event: Event): void {
    this.navQuery.set((event.target as HTMLInputElement).value);
  }
}
