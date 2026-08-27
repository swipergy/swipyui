import { Component, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PromptInput } from './promptinput';

@Component({
  imports: [PromptInput],
  template: `
    <syui-prompt-input
      [(value)]="value"
      [disabled]="disabled()"
      [loading]="loading()"
      [submitOnEnter]="submitOnEnter()"
      [clearOnSubmit]="clearOnSubmit()"
      [maxLength]="maxLength()"
      [showCounter]="showCounter()"
      (onSubmit)="submitted.set($event)"
      (onStop)="stopped.set(stopped() + 1)"
    >
      <button slot="toolbar" class="attach">Attach</button>
    </syui-prompt-input>
  `,
})
class Host {
  readonly value = signal('');
  readonly disabled = signal(false);
  readonly loading = signal(false);
  readonly submitOnEnter = signal(true);
  readonly clearOnSubmit = signal(true);
  readonly maxLength = signal<number | undefined>(undefined);
  readonly showCounter = signal(false);
  readonly submitted = signal<string | null>(null);
  readonly stopped = signal(0);
  readonly input = viewChild.required(PromptInput);
}

describe('PromptInput', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement.querySelector('syui-prompt-input');
    const textarea: HTMLTextAreaElement = root.querySelector('textarea')!;
    return { fixture, root, textarea, host: fixture.componentInstance };
  }

  function type(
    fixture: ReturnType<typeof setup>['fixture'],
    textarea: HTMLTextAreaElement,
    text: string,
  ) {
    textarea.value = text;
    textarea.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  function enter(textarea: HTMLTextAreaElement, init: KeyboardEventInit = {}) {
    const event = new KeyboardEvent('keydown', { key: 'Enter', cancelable: true, ...init });
    textarea.dispatchEvent(event);
    return event;
  }

  it('submits the trimmed draft on Enter and clears it', () => {
    const { fixture, textarea, host } = setup();
    type(fixture, textarea, '  What changed?  ');

    const event = enter(textarea);
    fixture.detectChanges();
    expect(host.submitted()).toBe('What changed?');
    expect(event.defaultPrevented).toBe(true);
    expect(host.value()).toBe('');
  });

  it('keeps the draft when clearOnSubmit is off', () => {
    const { fixture, textarea, host } = setup();
    host.clearOnSubmit.set(false);
    type(fixture, textarea, 'Keep me');
    enter(textarea);
    fixture.detectChanges();
    expect(host.value()).toBe('Keep me');
  });

  it('inserts a newline instead of submitting on Shift+Enter and during IME composition', () => {
    const { fixture, textarea, host } = setup();
    type(fixture, textarea, 'Draft');

    expect(enter(textarea, { shiftKey: true }).defaultPrevented).toBe(false);
    expect(enter(textarea, { isComposing: true }).defaultPrevented).toBe(false);
    expect(host.submitted()).toBeNull();
  });

  it('does not submit on Enter when submitOnEnter is off', () => {
    const { fixture, textarea, host } = setup();
    host.submitOnEnter.set(false);
    type(fixture, textarea, 'Draft');
    enter(textarea);
    fixture.detectChanges();
    expect(host.submitted()).toBeNull();
  });

  it('ignores submits of blank drafts and disables the send button', () => {
    const { fixture, textarea, root, host } = setup();
    const send = () => root.querySelector<HTMLButtonElement>('.syui-prompt-input-send')!;
    expect(send().disabled).toBe(true);

    type(fixture, textarea, '   ');
    expect(send().disabled).toBe(true);
    send().click();
    fixture.detectChanges();
    expect(host.submitted()).toBeNull();

    type(fixture, textarea, 'Ready');
    expect(send().disabled).toBe(false);
    send().click();
    fixture.detectChanges();
    expect(host.submitted()).toBe('Ready');
  });

  it('does not submit while disabled', () => {
    const { fixture, textarea, host } = setup();
    type(fixture, textarea, 'Draft');
    host.disabled.set(true);
    fixture.detectChanges();
    enter(textarea);
    fixture.detectChanges();
    expect(host.submitted()).toBeNull();
  });

  it('swaps send for a stop button while loading', () => {
    const { fixture, root, host } = setup();
    host.loading.set(true);
    fixture.detectChanges();

    expect(root.querySelector('.syui-prompt-input-send')).toBeNull();
    const stop = root.querySelector<HTMLButtonElement>('.syui-prompt-input-stop')!;
    expect(stop.getAttribute('aria-label')).toBe('Stop generating');
    stop.click();
    fixture.detectChanges();
    expect(host.stopped()).toBe(1);
  });

  it('mirrors maxLength to the textarea and describes it by the counter', () => {
    const { fixture, textarea, root, host } = setup();
    host.maxLength.set(20);
    host.showCounter.set(true);
    type(fixture, textarea, 'Hello');

    expect(textarea.getAttribute('maxlength')).toBe('20');
    const counter = root.querySelector('.syui-prompt-input-counter')!;
    expect(counter.textContent?.replace(/\s/g, '')).toBe('5/20');
    expect(textarea.getAttribute('aria-describedby')).toBe(counter.id);
  });

  it('names the textarea and projects toolbar content', () => {
    const { root, textarea } = setup();
    expect(textarea.getAttribute('aria-label')).toBe('Message');
    expect(root.querySelector('.syui-prompt-input-tools .attach')).toBeTruthy();
  });

  it('focus() moves focus into the textarea', () => {
    const { fixture, textarea, host } = setup();
    host.input().focus();
    fixture.detectChanges();
    expect(document.activeElement).toBe(textarea);
  });
});
