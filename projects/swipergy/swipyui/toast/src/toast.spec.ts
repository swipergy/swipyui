import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Toast } from './toast';
import { ToastService } from './toast.service';

@Component({
  imports: [Toast],
  template: `<syui-toast />`,
})
class Host {}

describe('Toast', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const service = TestBed.inject(ToastService);
    return { fixture, service };
  }

  it('renders queued messages in a labelled region with per-toast live semantics', () => {
    const { fixture, service } = setup();
    service.show({ severity: 'success', summary: 'Saved', detail: 'All good', life: 0 });
    fixture.detectChanges();

    const region = fixture.nativeElement.querySelector('.syui-toast-region');
    expect(region.getAttribute('role')).toBe('region');
    expect(region.getAttribute('aria-label')).toBe('Notifications');
    expect(region.textContent).toContain('Saved');
    expect(region.textContent).toContain('All good');

    const toast = region.querySelector('.syui-toast-message-success');
    expect(toast.getAttribute('role')).toBe('status');
    expect(toast.getAttribute('aria-live')).toBe('polite');
    expect(toast.getAttribute('aria-atomic')).toBe('true');
    expect(toast.querySelector('svg.syui-toast-icon')).toBeTruthy();
  });

  it('announces danger and warn toasts assertively as alerts', () => {
    const { fixture, service } = setup();
    service.show({ severity: 'danger', summary: 'Failed', life: 0 });
    fixture.detectChanges();

    const toast = fixture.nativeElement.querySelector('.syui-toast-message-danger');
    expect(toast.getAttribute('role')).toBe('alert');
    expect(toast.getAttribute('aria-live')).toBe('assertive');
  });

  it('dismisses a message via the close button', () => {
    const { fixture, service } = setup();
    service.show({ summary: 'Hello', life: 0 });
    fixture.detectChanges();

    fixture.nativeElement.querySelector('.syui-toast-close').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.syui-toast-message').length).toBe(0);
  });

  it('auto-dismisses after its life expires', () => {
    vi.useFakeTimers();
    const { fixture, service } = setup();
    service.show({ summary: 'Ephemeral', life: 1000 });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.syui-toast-message').length).toBe(1);

    vi.advanceTimersByTime(1001);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.syui-toast-message').length).toBe(0);
    vi.useRealTimers();
  });

  it('keeps sticky toasts until they are dismissed manually', () => {
    vi.useFakeTimers();
    const { fixture, service } = setup();
    service.show({ summary: 'Pinned', sticky: true });
    fixture.detectChanges();

    vi.advanceTimersByTime(60000);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.syui-toast-message').length).toBe(1);
    vi.useRealTimers();
  });

  it('pauses auto-dismiss while hovered and resumes afterwards', () => {
    vi.useFakeTimers();
    const { fixture, service } = setup();
    service.show({ summary: 'Hover me', life: 1000 });
    fixture.detectChanges();
    const toast = fixture.nativeElement.querySelector('.syui-toast-message');

    vi.advanceTimersByTime(500);
    toast.dispatchEvent(new Event('mouseenter'));
    vi.advanceTimersByTime(5000);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.syui-toast-message').length).toBe(1);

    toast.dispatchEvent(new Event('mouseleave'));
    vi.advanceTimersByTime(501);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.syui-toast-message').length).toBe(0);
    vi.useRealTimers();
  });

  it('pauses auto-dismiss while focus is within the toast', () => {
    vi.useFakeTimers();
    const { fixture, service } = setup();
    service.show({ summary: 'Focus me', life: 1000 });
    fixture.detectChanges();
    const toast = fixture.nativeElement.querySelector('.syui-toast-message');
    const close: HTMLButtonElement = toast.querySelector('.syui-toast-close');

    close.focus();
    toast.dispatchEvent(new Event('focusin'));
    vi.advanceTimersByTime(5000);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.syui-toast-message').length).toBe(1);

    close.blur();
    toast.dispatchEvent(new Event('focusout'));
    vi.advanceTimersByTime(1001);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.syui-toast-message').length).toBe(0);
    vi.useRealTimers();
  });
});
