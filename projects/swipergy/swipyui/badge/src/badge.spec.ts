import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Badge, BadgeDirective, type BadgeSeverity } from './badge';

@Component({
  imports: [Badge, BadgeDirective],
  template: `
    <syui-badge [value]="value()" [severity]="severity()" [size]="size()" [ariaLabel]="ariaLabel()" />
    <button
      [syuiBadge]="overlayValue()"
      [syuiBadgeSeverity]="overlaySeverity()"
      [syuiBadgeLabel]="overlayLabel()"
    >
      Inbox
    </button>
  `,
})
class Host {
  readonly value = signal<string | number>(4);
  readonly severity = signal<BadgeSeverity>(null);
  readonly size = signal<'small' | 'large' | null>(null);
  readonly ariaLabel = signal<string | undefined>(undefined);
  readonly overlayValue = signal<string | number>('3');
  readonly overlaySeverity = signal<BadgeSeverity>('danger');
  readonly overlayLabel = signal('');
}

describe('Badge', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const badge: HTMLElement = fixture.nativeElement.querySelector('syui-badge');
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    return { fixture, badge, button };
  }

  it('renders the value in a primary pill by default', () => {
    const { badge } = setup();
    expect(badge.textContent?.trim()).toBe('4');
    expect(badge.classList).toContain('syui-badge');
    expect(badge.classList).not.toContain('syui-badge-danger');
  });

  it('applies severity and size modifier classes', () => {
    const { fixture, badge } = setup();
    fixture.componentInstance.severity.set('success');
    fixture.componentInstance.size.set('large');
    fixture.detectChanges();
    expect(badge.classList).toContain('syui-badge-success');
    expect(badge.classList).toContain('syui-badge-large');
  });

  it('overlays a corner badge on the directive host', () => {
    const { button } = setup();
    expect(button.classList).toContain('syui-badge-overlay');
    const corner = button.querySelector('.syui-badge-corner');
    expect(corner?.textContent).toBe('3');
    expect(corner?.classList).toContain('syui-badge-danger');
  });

  it('updates the corner badge when the value changes', () => {
    const { fixture, button } = setup();
    fixture.componentInstance.overlayValue.set(99);
    fixture.detectChanges();
    expect(button.querySelector('.syui-badge-corner')?.textContent).toBe('99');
  });

  it('renders a dot when the directive value is empty', () => {
    const { fixture, button } = setup();
    fixture.componentInstance.overlayValue.set('');
    fixture.detectChanges();
    const corner = button.querySelector('.syui-badge-corner');
    expect(corner?.classList).toContain('syui-badge-dot');
    expect(corner?.textContent).toBe('');
  });

  it('announces the badge ariaLabel instead of the raw value', () => {
    const { fixture, badge } = setup();
    expect(badge.getAttribute('role')).toBeNull();
    fixture.componentInstance.ariaLabel.set('4 unread notifications');
    fixture.detectChanges();
    expect(badge.getAttribute('role')).toBe('img');
    expect(badge.getAttribute('aria-label')).toBe('4 unread notifications');
  });

  it('hides the corner badge from assistive technology unless labelled', () => {
    const { fixture, button } = setup();
    const corner = button.querySelector('.syui-badge-corner')!;
    expect(corner.getAttribute('aria-hidden')).toBe('true');

    fixture.componentInstance.overlayLabel.set('3 unread messages');
    fixture.detectChanges();
    expect(corner.getAttribute('aria-hidden')).toBeNull();
    expect(corner.getAttribute('role')).toBe('img');
    expect(corner.getAttribute('aria-label')).toBe('3 unread messages');
  });
});
