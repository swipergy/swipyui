import { Component, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Chat } from './chat';
import { ChatMessage } from './chat-message';

@Component({
  imports: [Chat, ChatMessage],
  template: `
    <syui-chat [live]="live()" [ariaLabel]="ariaLabel()">
      <syui-chat-message role="user">Hello</syui-chat-message>
      <syui-chat-message role="assistant">Hi there</syui-chat-message>
    </syui-chat>
  `,
})
class Host {
  readonly live = signal<'polite' | 'off'>('polite');
  readonly ariaLabel = signal('Conversation');
  readonly chat = viewChild.required(Chat);
}

describe('Chat', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const chat: HTMLElement = fixture.nativeElement.querySelector('syui-chat');
    return { fixture, chat };
  }

  it('is a named live log region', () => {
    const { fixture, chat } = setup();
    expect(chat.getAttribute('role')).toBe('log');
    expect(chat.getAttribute('aria-live')).toBe('polite');
    expect(chat.getAttribute('aria-label')).toBe('Conversation');

    fixture.componentInstance.live.set('off');
    fixture.componentInstance.ariaLabel.set('Support chat');
    fixture.detectChanges();
    expect(chat.getAttribute('aria-live')).toBe('off');
    expect(chat.getAttribute('aria-label')).toBe('Support chat');
  });

  it('is reachable by keyboard so the transcript can be scrolled', () => {
    const { chat } = setup();
    expect(chat.getAttribute('tabindex')).toBe('0');
  });

  it('projects the messages into the scrolling content', () => {
    const { chat } = setup();
    expect(chat.querySelectorAll('.syui-chat-content syui-chat-message')).toHaveLength(2);
  });

  it('scrollToBottom pins the transcript again', () => {
    const { fixture, chat } = setup();
    Object.defineProperty(chat, 'scrollHeight', { value: 1000, configurable: true });
    Object.defineProperty(chat, 'clientHeight', { value: 200, configurable: true });
    chat.scrollTop = 0;
    chat.dispatchEvent(new Event('scroll'));
    expect(fixture.componentInstance.chat().atBottom()).toBe(false);

    fixture.componentInstance.chat().scrollToBottom('auto');
    expect(fixture.componentInstance.chat().atBottom()).toBe(true);
  });

  it('counts positions within the threshold as being at the bottom', () => {
    const { fixture, chat } = setup();
    Object.defineProperty(chat, 'scrollHeight', { value: 1000, configurable: true });
    Object.defineProperty(chat, 'clientHeight', { value: 200, configurable: true });
    chat.scrollTop = 780;
    chat.dispatchEvent(new Event('scroll'));
    expect(fixture.componentInstance.chat().atBottom()).toBe(true);
  });
});
