import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ScrollTop } from './scrolltop';

@Component({
  imports: [ScrollTop],
  template: `<syui-scroll-top [threshold]="200" />`,
})
class Host {}

describe('ScrollTop', () => {
  const originalScrollTo = window.scrollTo;
  let scrollToCalls: any[];

  beforeEach(() => {
    scrollToCalls = [];
    window.scrollTo = ((options: unknown) => {
      scrollToCalls.push(options);
    }) as typeof window.scrollTo;
    setScrollY(0);
  });

  afterEach(() => {
    window.scrollTo = originalScrollTo;
    setScrollY(0);
  });

  function setScrollY(value: number) {
    Object.defineProperty(window, 'scrollY', { value, writable: true, configurable: true });
  }

  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('.syui-scrolltop');
    return { fixture, button };
  }

  function scrollTo(y: number, fixture: { detectChanges(): void }) {
    setScrollY(y);
    window.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
  }

  it('is hidden until the window is scrolled past the threshold', () => {
    const { fixture, button } = setup();
    expect(button.classList.contains('syui-scrolltop-visible')).toBe(false);

    scrollTo(150, fixture);
    expect(button.classList.contains('syui-scrolltop-visible')).toBe(false);

    scrollTo(250, fixture);
    expect(button.classList.contains('syui-scrolltop-visible')).toBe(true);
  });

  it('hides again when scrolled back above the threshold', () => {
    const { fixture, button } = setup();
    scrollTo(500, fixture);
    expect(button.classList.contains('syui-scrolltop-visible')).toBe(true);

    scrollTo(10, fixture);
    expect(button.classList.contains('syui-scrolltop-visible')).toBe(false);
  });

  it('smooth-scrolls to the top on click', () => {
    const { fixture, button } = setup();
    scrollTo(500, fixture);

    button.click();
    expect(scrollToCalls).toEqual([{ top: 0, behavior: 'smooth' }]);
  });

  it('scrolls instantly when the user prefers reduced motion', () => {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = ((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
    })) as typeof window.matchMedia;

    try {
      const { fixture, button } = setup();
      scrollTo(500, fixture);

      button.click();
      expect(scrollToCalls).toEqual([{ top: 0, behavior: 'auto' }]);
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });

  it('has an accessible label', () => {
    const { button } = setup();
    expect(button.getAttribute('aria-label')).toBe('Scroll to top');
  });

  it('removes the scroll listener on destroy', () => {
    const removed: string[] = [];
    const originalRemove = window.removeEventListener.bind(window);
    window.removeEventListener = ((type: string, ...rest: any[]) => {
      removed.push(type);
      return (originalRemove as any)(type, ...rest);
    }) as typeof window.removeEventListener;

    try {
      const { fixture } = setup();
      fixture.destroy();
      expect(removed).toContain('scroll');
    } finally {
      window.removeEventListener = originalRemove;
    }
  });
});
