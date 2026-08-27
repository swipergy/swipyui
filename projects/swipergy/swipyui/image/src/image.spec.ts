import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Image } from './image';

@Component({
  imports: [Image],
  template: `<syui-image src="/photo.jpg" alt="A photo" width="200" preview />`,
})
class Host {}

describe('Image', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const img: HTMLImageElement = fixture.nativeElement.querySelector('.syui-image-img');
    const indicator: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.syui-image-preview-indicator',
    );
    return { fixture, img, indicator };
  }

  function preview(): HTMLElement | null {
    return document.querySelector('.syui-image-preview');
  }

  function action(label: string): HTMLButtonElement {
    return document.querySelector(`.syui-image-action[aria-label="${label}"]`) as HTMLButtonElement;
  }

  afterEach(() => {
    document.querySelector('.cdk-overlay-container')?.remove();
  });

  it('renders the image with src, alt and width', () => {
    const { img } = setup();
    expect(img.getAttribute('src')).toBe('/photo.jpg');
    expect(img.getAttribute('alt')).toBe('A photo');
    expect(img.getAttribute('width')).toBe('200');
  });

  it('opens the full-screen preview from the indicator button', async () => {
    const { fixture, indicator } = setup();
    expect(preview()).toBeNull();
    expect(indicator.getAttribute('aria-label')).toBe('Preview image');

    indicator.click();
    await fixture.whenStable();
    expect(preview()).toBeTruthy();
    expect(document.querySelector('.syui-image-preview-img')?.getAttribute('src')).toBe('/photo.jpg');
  });

  it('applies rotate and zoom transforms to the previewed image', async () => {
    const { fixture, indicator } = setup();
    indicator.click();
    await fixture.whenStable();

    const previewImg = document.querySelector('.syui-image-preview-img') as HTMLElement;
    expect(previewImg.style.transform).toBe('rotate(0deg) scale(1)');

    action('Rotate right').click();
    action('Zoom in').click();
    await fixture.whenStable();
    expect(previewImg.style.transform).toBe('rotate(90deg) scale(1.25)');

    action('Rotate left').click();
    action('Rotate left').click();
    action('Zoom out').click();
    await fixture.whenStable();
    expect(previewImg.style.transform).toBe('rotate(-90deg) scale(1)');
  });

  it('closes via the close button', async () => {
    const { fixture, indicator } = setup();
    indicator.click();
    await fixture.whenStable();

    action('Close preview').click();
    await fixture.whenStable();
    expect(preview()).toBeNull();
  });

  it('closes on Escape', async () => {
    const { fixture, indicator } = setup();
    indicator.click();
    await fixture.whenStable();

    preview()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await fixture.whenStable();
    expect(preview()).toBeNull();
  });

  it('resets transforms when reopened', async () => {
    const { fixture, indicator } = setup();
    indicator.click();
    await fixture.whenStable();
    action('Zoom in').click();
    action('Close preview').click();
    await fixture.whenStable();

    indicator.click();
    await fixture.whenStable();
    const previewImg = document.querySelector('.syui-image-preview-img') as HTMLElement;
    expect(previewImg.style.transform).toBe('rotate(0deg) scale(1)');
  });
});
