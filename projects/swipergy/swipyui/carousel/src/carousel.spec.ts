import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Carousel } from './carousel';

@Component({
  imports: [Carousel],
  template: `
    <syui-carousel
      [value]="items"
      [numVisible]="2"
      [numScroll]="2"
      [circular]="circular()"
      ariaLabel="Fruit"
    >
      <ng-template let-item let-i="index">
        <span class="demo-item">{{ i }}: {{ item }}</span>
      </ng-template>
    </syui-carousel>
  `,
})
class Host {
  items = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry', 'Fig'];
  circular = signal(false);
}

@Component({
  imports: [Carousel],
  template: `
    <syui-carousel [value]="items" [autoplayInterval]="5000">
      <ng-template let-item>{{ item }}</ng-template>
    </syui-carousel>
  `,
})
class AutoplayHost {
  items = ['Apple', 'Banana', 'Cherry'];
}

describe('Carousel', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    const track = element.querySelector('.syui-carousel-track') as HTMLElement;
    const next = element.querySelector('.syui-carousel-next') as HTMLButtonElement;
    const prev = element.querySelector('.syui-carousel-prev') as HTMLButtonElement;
    const dots = () =>
      Array.from(element.querySelectorAll<HTMLButtonElement>('.syui-carousel-dot'));
    return { fixture, element, track, next, prev, dots };
  }

  it('renders items through the projected template with item and index context', () => {
    const { element } = setup();
    const items = element.querySelectorAll('.demo-item');
    expect(items.length).toBe(6);
    expect(items[0].textContent).toContain('0: Apple');
    expect(items[5].textContent).toContain('5: Fig');
  });

  it('exposes the carousel region and slide roles', () => {
    const { element } = setup();
    const region = element.querySelector('syui-carousel')!;
    expect(region.getAttribute('role')).toBe('region');
    expect(region.getAttribute('aria-roledescription')).toBe('carousel');
    expect(region.getAttribute('aria-label')).toBe('Fruit');
    const slide = element.querySelector('.syui-carousel-item')!;
    expect(slide.getAttribute('aria-roledescription')).toBe('slide');
    expect(slide.getAttribute('aria-label')).toBe('1 of 6');
  });

  it('scrolls the track by numScroll items on next and back on prev', () => {
    const { fixture, track, next, prev } = setup();
    expect(track.style.transform).toBe('translateX(-0%)');

    next.click();
    fixture.detectChanges();
    // 2 items scrolled × 50% item width
    expect(track.style.transform).toBe('translateX(-100%)');

    prev.click();
    fixture.detectChanges();
    expect(track.style.transform).toBe('translateX(-0%)');
  });

  it('renders one dot per page with aria-label and aria-current', () => {
    const { fixture, dots } = setup();
    // 6 items, 2 visible, 2 per scroll → 3 pages
    expect(dots().length).toBe(3);
    expect(dots()[1].getAttribute('aria-label')).toBe('Page 2 of 3');
    expect(dots()[0].getAttribute('aria-current')).toBe('true');

    dots()[2].click();
    fixture.detectChanges();
    expect(dots()[2].getAttribute('aria-current')).toBe('true');
    expect(dots()[0].getAttribute('aria-current')).toBeNull();
  });

  it('disables prev on the first and next on the last page when not circular', () => {
    const { fixture, next, prev, dots } = setup();
    expect(prev.disabled).toBe(true);
    expect(next.disabled).toBe(false);

    dots()[2].click();
    fixture.detectChanges();
    expect(next.disabled).toBe(true);
    expect(prev.disabled).toBe(false);
  });

  it('shows a play/pause control only with autoplay and toggles it on click', () => {
    const { element } = setup();
    expect(element.querySelector('.syui-carousel-play-toggle')).toBeNull();

    const fixture = TestBed.createComponent(AutoplayHost);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    const toggle = root.querySelector<HTMLButtonElement>('.syui-carousel-play-toggle')!;
    const status = () => root.querySelector('.syui-carousel-status')!;

    // While slides advance on their own, the live region stays silent.
    expect(toggle.getAttribute('aria-label')).toBe('Stop automatic slide show');
    expect(status().getAttribute('aria-live')).toBe('polite');
    expect(status().textContent?.trim()).toBe('');

    toggle.click();
    fixture.detectChanges();
    expect(toggle.getAttribute('aria-label')).toBe('Start automatic slide show');
    expect(status().textContent).toContain('Page 1 of');
  });

  it('wraps from the last page to the first when circular', () => {
    const { fixture, next, dots } = setup();
    fixture.componentInstance.circular.set(true);
    fixture.detectChanges();

    dots()[2].click();
    fixture.detectChanges();
    next.click();
    fixture.detectChanges();
    expect(dots()[0].getAttribute('aria-current')).toBe('true');
  });
});
