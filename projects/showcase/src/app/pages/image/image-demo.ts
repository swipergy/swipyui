import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Image } from '@swipergy/swipyui/image';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const BASIC = `<syui-image src="https://picsum.photos/id/1015/400/260" alt="River between mountains"
  width="400" />`;

const PREVIEW = `<syui-image src="https://picsum.photos/id/1018/400/260" alt="Mountain valley"
  width="400" preview />`;

const PROPS: PropRow[] = [
  { name: 'src', type: 'string', description: 'Image source URL (required).' },
  { name: 'alt', type: 'string', default: "''", description: 'Alternative text of the image.' },
  { name: 'width', type: 'string | number', description: 'Rendered as the img width attribute.' },
  { name: 'height', type: 'string | number', description: 'Rendered as the img height attribute.' },
  {
    name: 'preview',
    type: 'boolean',
    default: 'false',
    description:
      'Shows a magnifier overlay on hover and opens a full-screen preview with rotate/zoom controls on click.',
  },
  { name: 'onShow', type: 'output<void>', description: 'Emitted when the preview opens.' },
  { name: 'onHide', type: 'output<void>', description: 'Emitted when the preview closes.' },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Image, DocsSection, DocsPropTable],
  template: `
    <h1>Image</h1>
    <p class="docs-lead">
      Displays an image with an optional full-screen preview: rotate and zoom from a toolbar,
      close with Escape, the mask or the close button.
      <code>import {{ '{' }} Image {{ '}' }} from '&#64;swipergy/swipyui/image';</code>
    </p>

    <docs-section title="Basic" [code]="basic">
      <syui-image
        src="https://picsum.photos/id/1015/400/260"
        alt="River between mountains"
        width="400"
      />
    </docs-section>

    <docs-section
      title="Preview"
      [code]="preview"
      description="Hover shows a magnifier indicator; clicking opens the image full-screen with rotate left/right, zoom in/out and close controls."
    >
      <syui-image
        src="https://picsum.photos/id/1018/400/260"
        alt="Mountain valley"
        width="400"
        preview
      />
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
})
export class ImageDemo {
  readonly basic = BASIC;
  readonly preview = PREVIEW;
  readonly props = PROPS;
}
