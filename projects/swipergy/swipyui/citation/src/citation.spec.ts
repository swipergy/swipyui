import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Citation } from './citation';
import { CitationList, CitationSource } from './citation-list';

@Component({
  imports: [Citation],
  template: `
    <syui-citation
      id="citation"
      [index]="index()"
      [title]="title()"
      [url]="url()"
      [snippet]="snippet()"
    />
  `,
})
class Host {
  readonly index = signal<number | undefined>(1);
  readonly title = signal<string | undefined>('Angular docs — Signals');
  readonly url = signal<string | undefined>('https://angular.dev/guide/signals');
  readonly snippet = signal<string | undefined>(undefined);
}

describe('Citation', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement.querySelector('#citation');
    const marker = () => host.querySelector('.syui-citation')!;
    return { fixture, host, marker, component: fixture.componentInstance };
  }

  it('links out safely and names the source it points at', () => {
    const { marker } = setup();
    const link = marker() as HTMLAnchorElement;
    expect(link.tagName).toBe('A');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noreferrer noopener');
    expect(link.textContent).toBe('1');
    expect(link.getAttribute('aria-label')).toBe('Source 1: Angular docs — Signals');
    expect(link.getAttribute('title')).toBe('Angular docs — Signals');
  });

  it('adds the snippet to the hover text', () => {
    const { fixture, marker, component } = setup();
    component.snippet.set('Signals are glitch-free.');
    fixture.detectChanges();
    expect(marker().getAttribute('title')).toBe(
      'Angular docs — Signals — Signals are glitch-free.',
    );
  });

  it('falls back to a note when there is nothing to link to', () => {
    const { fixture, marker, component } = setup();
    component.url.set(undefined);
    fixture.detectChanges();
    expect(marker().tagName).toBe('SPAN');
    expect(marker().getAttribute('role')).toBe('note');
  });

  it('renders a bullet marker when the source is not numbered', () => {
    const { fixture, marker, component } = setup();
    component.index.set(undefined);
    fixture.detectChanges();
    expect(marker().textContent).toBe('•');
    expect(marker().getAttribute('aria-label')).toBe('Source: Angular docs — Signals');
  });
});

@Component({
  imports: [CitationList],
  template: `
    <syui-citation-list
      id="list"
      [sources]="sources()"
      [header]="header()"
      (onSelect)="picked.set($event)"
    />
  `,
})
class ListHost {
  readonly sources = signal<CitationSource[]>([
    {
      title: 'Angular signals',
      url: 'https://www.angular.dev/guide/signals',
      snippet: 'Glitch-free.',
    },
    { title: 'Internal design doc' },
    { title: 'Release notes', url: 'not a url', source: 'Changelog' },
  ]);
  readonly header = signal('Sources');
  readonly picked = signal<CitationSource | null>(null);
}

describe('CitationList', () => {
  function setup() {
    const fixture = TestBed.createComponent(ListHost);
    fixture.detectChanges();
    const list: HTMLElement = fixture.nativeElement.querySelector('#list');
    const items = () => Array.from(list.querySelectorAll('.syui-citation-list-item'));
    return { fixture, list, items, host: fixture.componentInstance };
  }

  it('numbers the sources in order under a labelled list', () => {
    const { list, items } = setup();
    const header = list.querySelector('.syui-citation-list-header')!;
    expect(list.querySelector('ol')?.getAttribute('aria-labelledby')).toBe(header.id);
    expect(
      items().map((item) => item.querySelector('.syui-citation-list-index')?.textContent),
    ).toEqual(['1', '2', '3']);
  });

  it('derives the origin from the URL host without the www prefix', () => {
    const { items } = setup();
    expect(items()[0].querySelector('.syui-citation-list-origin')?.textContent).toBe('angular.dev');
    expect(items()[0].querySelector('.syui-citation-list-snippet')?.textContent).toBe(
      'Glitch-free.',
    );
  });

  it('prefers an explicit source over an unparseable URL', () => {
    const { items } = setup();
    expect(items()[2].querySelector('.syui-citation-list-origin')?.textContent).toBe('Changelog');
  });

  it('renders sources without a URL as static entries', () => {
    const { items } = setup();
    expect(items()[1].querySelector('a')).toBeNull();
    expect(items()[1].querySelector('.syui-citation-list-static')).toBeTruthy();
  });

  it('emits the source the user opened', () => {
    const { fixture, items, host } = setup();
    items()[0].querySelector('a')!.click();
    fixture.detectChanges();
    expect(host.picked()?.title).toBe('Angular signals');
  });

  it('omits the header when it is empty', () => {
    const { fixture, list, host } = setup();
    host.header.set('');
    fixture.detectChanges();
    expect(list.querySelector('.syui-citation-list-header')).toBeNull();
    expect(list.querySelector('ol')?.getAttribute('aria-labelledby')).toBeNull();
  });
});
