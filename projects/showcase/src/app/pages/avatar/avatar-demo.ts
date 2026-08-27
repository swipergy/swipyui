import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Avatar, AvatarGroup } from '@swipergy/swipyui/avatar';
import { DocsSection } from '../../shared/docs-section';
import { DocsPropTable, PropRow } from '../../shared/docs-prop-table';

const LABEL = `<syui-avatar label="FK" />
<syui-avatar label="FK" size="large" />
<syui-avatar label="FK" size="xlarge" shape="circle" />`;

const IMAGE = `<syui-avatar image="https://i.pravatar.cc/96?img=13" shape="circle" size="large" />
<!-- broken URLs fall back to the label -->
<syui-avatar image="https://example.invalid/missing.png" label="FK" shape="circle" size="large" />`;

const GROUP = `<syui-avatar-group>
  <syui-avatar image="https://i.pravatar.cc/64?img=1" shape="circle" />
  <syui-avatar image="https://i.pravatar.cc/64?img=2" shape="circle" />
  <syui-avatar image="https://i.pravatar.cc/64?img=3" shape="circle" />
  <syui-avatar label="+4" shape="circle" />
</syui-avatar-group>`;

const PROPS: PropRow[] = [
  { name: 'label', type: 'string', description: 'Initials shown when no image is set or it failed to load.' },
  { name: 'image', type: 'string', description: 'Image URL; falls back to label/icon on load error.' },
  { name: 'icon', type: 'string', description: 'CSS class of a user-supplied icon font glyph.' },
  { name: 'size', type: "'normal' | 'large' | 'xlarge'", default: "'normal'", description: 'Avatar dimensions.' },
  { name: 'shape', type: "'square' | 'circle'", default: "'square'", description: 'Rounded square or circle.' },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Avatar, AvatarGroup, DocsSection, DocsPropTable],
  template: `
    <h1>Avatar</h1>
    <p class="docs-lead">
      Represents a person or entity with an image, initials or an icon; groups overlap into a
      stack.
      <code>import {{ '{' }} Avatar, AvatarGroup {{ '}' }} from '&#64;swipergy/swipyui/avatar';</code>
    </p>

    <docs-section title="Label" [code]="label" language="html">
      <syui-avatar label="FK" />
      <syui-avatar label="FK" size="large" />
      <syui-avatar label="FK" size="xlarge" shape="circle" />
    </docs-section>

    <docs-section
      title="Image"
      [code]="image"
      language="html"
      description="When the image fails to load, the avatar falls back to the label."
    >
      <syui-avatar image="https://i.pravatar.cc/96?img=13" shape="circle" size="large" />
      <syui-avatar image="https://example.invalid/missing.png" label="FK" shape="circle" size="large" />
    </docs-section>

    <docs-section
      title="Group"
      [code]="group"
      language="html"
      description="Avatars inside syui-avatar-group overlap with a border in the page background color."
    >
      <syui-avatar-group>
        <syui-avatar image="https://i.pravatar.cc/64?img=1" shape="circle" />
        <syui-avatar image="https://i.pravatar.cc/64?img=2" shape="circle" />
        <syui-avatar image="https://i.pravatar.cc/64?img=3" shape="circle" />
        <syui-avatar label="+4" shape="circle" />
      </syui-avatar-group>
    </docs-section>

    <docs-prop-table [props]="props" />
  `,
})
export class AvatarDemo {
  readonly label = LABEL;
  readonly image = IMAGE;
  readonly group = GROUP;
  readonly props = PROPS;
}
