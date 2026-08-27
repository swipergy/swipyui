import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ChatMessage, ChatRole } from './chat-message';

@Component({
  imports: [ChatMessage],
  template: `
    <syui-chat-message
      id="message"
      [role]="role()"
      [author]="author()"
      [timestamp]="timestamp()"
      [pending]="pending()"
      [showHeader]="showHeader()"
      [variant]="variant()"
    >
      Body text
      <button slot="actions" class="copy">Copy</button>
    </syui-chat-message>
  `,
})
class Host {
  readonly role = signal<ChatRole>('assistant');
  readonly author = signal<string | undefined>(undefined);
  readonly timestamp = signal<Date | string | number | undefined>(undefined);
  readonly pending = signal(false);
  readonly showHeader = signal(true);
  readonly variant = signal<'bubble' | 'plain'>('bubble');
}

describe('ChatMessage', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const message: HTMLElement = fixture.nativeElement.querySelector('#message');
    return { fixture, message, host: fixture.componentInstance };
  }

  it('names the speaker from the role and derives the avatar initials', () => {
    const { fixture, message, host } = setup();
    expect(message.querySelector('.syui-chat-message-author')?.textContent).toBe('Assistant');
    expect(message.querySelector('.syui-chat-message-avatar-label')?.textContent).toBe('A');

    host.role.set('user');
    fixture.detectChanges();
    expect(message.querySelector('.syui-chat-message-author')?.textContent).toBe('You');
    expect(message.classList.contains('syui-chat-message-user')).toBe(true);
  });

  it('prefers an explicit author over the role default', () => {
    const { fixture, message, host } = setup();
    host.author.set('Ada Lovelace');
    fixture.detectChanges();
    expect(message.querySelector('.syui-chat-message-author')?.textContent).toBe('Ada Lovelace');
    expect(message.querySelector('.syui-chat-message-avatar-label')?.textContent).toBe('AL');
  });

  it('keeps the author announced when the header is hidden', () => {
    const { fixture, message, host } = setup();
    host.showHeader.set(false);
    fixture.detectChanges();
    expect(message.querySelector('.syui-chat-message-header')).toBeNull();
    expect(message.querySelector('.syui-sr-only')?.textContent).toBe('Assistant');
  });

  it('renders a machine-readable time for date timestamps and text verbatim', () => {
    const { fixture, message, host } = setup();
    const date = new Date('2026-08-27T10:30:00Z');
    host.timestamp.set(date);
    fixture.detectChanges();
    const time = message.querySelector('.syui-chat-message-time')!;
    expect(time.getAttribute('datetime')).toBe(date.toISOString());

    host.timestamp.set('just now');
    fixture.detectChanges();
    expect(message.querySelector('.syui-chat-message-time')?.textContent?.trim()).toBe('just now');
  });

  it('replaces the body with an announced typing indicator while pending', () => {
    const { fixture, message, host } = setup();
    expect(message.textContent).toContain('Body text');

    host.pending.set(true);
    fixture.detectChanges();
    expect(message.textContent).not.toContain('Body text');
    expect(message.querySelectorAll('.syui-chat-message-dot')).toHaveLength(3);
    expect(message.querySelector('.syui-chat-message-typing .syui-sr-only')?.textContent).toBe(
      'Assistant is replying',
    );
    expect(message.getAttribute('aria-busy')).toBe('true');
  });

  it('projects actions below the body', () => {
    const { message } = setup();
    expect(message.querySelector('.syui-chat-message-actions .copy')?.textContent).toBe('Copy');
  });

  it('drops the bubble styling in the plain variant', () => {
    const { fixture, message, host } = setup();
    expect(message.classList.contains('syui-chat-message-bubble')).toBe(true);

    host.variant.set('plain');
    fixture.detectChanges();
    expect(message.classList.contains('syui-chat-message-bubble')).toBe(false);
  });
});
