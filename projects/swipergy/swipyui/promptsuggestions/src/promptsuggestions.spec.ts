import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PromptSuggestion, PromptSuggestions, ResolvedPromptSuggestion } from './promptsuggestions';

@Component({
  imports: [PromptSuggestions],
  template: `
    <syui-prompt-suggestions
      id="suggestions"
      [suggestions]="suggestions()"
      [layout]="layout()"
      [header]="header()"
      (onSelect)="picked.set($event)"
    />
  `,
})
class Host {
  readonly suggestions = signal<(string | PromptSuggestion)[]>([
    'Summarize this page',
    {
      label: 'Draft a reply',
      value: 'Draft a reply to the last email',
      description: 'Uses the thread',
    },
    { label: 'Unavailable', disabled: true },
  ]);
  readonly layout = signal<'row' | 'grid'>('row');
  readonly header = signal<string | undefined>(undefined);
  readonly picked = signal<ResolvedPromptSuggestion | null>(null);
}

describe('PromptSuggestions', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement.querySelector('#suggestions');
    const items = () =>
      Array.from(root.querySelectorAll<HTMLButtonElement>('.syui-prompt-suggestions-item'));
    return { fixture, root, items, host: fixture.componentInstance };
  }

  it('renders a named group of suggestion buttons in a list', () => {
    const { root, items } = setup();
    expect(root.querySelector('[role=group]')?.getAttribute('aria-label')).toBe(
      'Suggested prompts',
    );
    expect(root.querySelectorAll('.syui-prompt-suggestions-list > li')).toHaveLength(3);
    expect(items()[0].querySelector('.syui-prompt-suggestions-label')?.textContent).toBe(
      'Summarize this page',
    );
  });

  it('emits plain strings with the label as the value', () => {
    const { fixture, items, host } = setup();
    items()[0].click();
    fixture.detectChanges();
    expect(host.picked()).toEqual({ label: 'Summarize this page', value: 'Summarize this page' });
  });

  it('keeps an explicit value and description', () => {
    const { fixture, items, host } = setup();
    items()[1].click();
    fixture.detectChanges();
    expect(host.picked()?.value).toBe('Draft a reply to the last email');
    expect(items()[1].querySelector('.syui-prompt-suggestions-description')?.textContent).toBe(
      'Uses the thread',
    );
  });

  it('disables suggestions marked as such', () => {
    const { fixture, items, host } = setup();
    expect(items()[2].disabled).toBe(true);
    items()[2].click();
    fixture.detectChanges();
    expect(host.picked()).toBeNull();
  });

  it('renders an optional header and the grid layout', () => {
    const { fixture, root, host } = setup();
    expect(root.querySelector('.syui-prompt-suggestions-header')).toBeNull();

    host.header.set('Try one of these');
    host.layout.set('grid');
    fixture.detectChanges();
    expect(root.querySelector('.syui-prompt-suggestions-header')?.textContent).toBe(
      'Try one of these',
    );
    expect(root.classList.contains('syui-prompt-suggestions-grid')).toBe(true);
  });
});
