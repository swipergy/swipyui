import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Avatar, AvatarGroup } from './avatar';

@Component({
  imports: [Avatar, AvatarGroup],
  template: `
    <syui-avatar
      id="plain"
      [label]="label()"
      [image]="image()"
      [ariaLabel]="ariaLabel()"
      [size]="size()"
      [shape]="shape()"
    />
    <syui-avatar-group id="group">
      <syui-avatar label="A" />
      <syui-avatar label="B" />
    </syui-avatar-group>
  `,
})
class Host {
  readonly label = signal<string | undefined>('FK');
  readonly image = signal<string | undefined>(undefined);
  readonly ariaLabel = signal<string | undefined>(undefined);
  readonly size = signal<'normal' | 'large' | 'xlarge'>('normal');
  readonly shape = signal<'square' | 'circle'>('square');
}

describe('Avatar', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const avatar: HTMLElement = fixture.nativeElement.querySelector('#plain');
    return { fixture, avatar };
  }

  it('renders the label initials', () => {
    const { avatar } = setup();
    expect(avatar.querySelector('.syui-avatar-label')?.textContent?.trim()).toBe('FK');
    expect(avatar.classList).toContain('syui-avatar');
  });

  it('renders an image when set', () => {
    const { fixture, avatar } = setup();
    fixture.componentInstance.image.set('avatar.png');
    fixture.detectChanges();
    const img = avatar.querySelector<HTMLImageElement>('.syui-avatar-image');
    expect(img).toBeTruthy();
    expect(img!.getAttribute('src')).toBe('avatar.png');
    expect(avatar.querySelector('.syui-avatar-label')).toBeNull();
  });

  it('falls back to the label when the image fails to load', () => {
    const { fixture, avatar } = setup();
    fixture.componentInstance.image.set('broken.png');
    fixture.detectChanges();
    avatar.querySelector('img')!.dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(avatar.querySelector('img')).toBeNull();
    expect(avatar.querySelector('.syui-avatar-label')?.textContent?.trim()).toBe('FK');
  });

  it('applies size and shape modifier classes', () => {
    const { fixture, avatar } = setup();
    fixture.componentInstance.size.set('xlarge');
    fixture.componentInstance.shape.set('circle');
    fixture.detectChanges();
    expect(avatar.classList).toContain('syui-avatar-xlarge');
    expect(avatar.classList).toContain('syui-avatar-circle');
  });

  it('uses the label as the image alt text', () => {
    const { fixture, avatar } = setup();
    fixture.componentInstance.image.set('avatar.png');
    fixture.detectChanges();
    expect(avatar.querySelector('img')?.getAttribute('alt')).toBe('FK');
  });

  it('exposes ariaLabel as an img role and hides the initials', () => {
    const { fixture, avatar } = setup();
    expect(avatar.getAttribute('role')).toBeNull();
    expect(avatar.getAttribute('aria-label')).toBeNull();

    fixture.componentInstance.ariaLabel.set('Frank Kuhn');
    fixture.detectChanges();
    expect(avatar.getAttribute('role')).toBe('img');
    expect(avatar.getAttribute('aria-label')).toBe('Frank Kuhn');
    expect(avatar.querySelector('.syui-avatar-label')?.getAttribute('aria-hidden')).toBe('true');

    fixture.componentInstance.image.set('avatar.png');
    fixture.detectChanges();
    expect(avatar.querySelector('img')?.getAttribute('alt')).toBe('');
  });

  it('renders grouped avatars inside syui-avatar-group', () => {
    const { fixture } = setup();
    const group: HTMLElement = fixture.nativeElement.querySelector('#group');
    expect(group.classList).toContain('syui-avatar-group');
    expect(group.querySelectorAll('.syui-avatar').length).toBe(2);
  });
});
