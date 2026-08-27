import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import hljs from 'highlight.js/lib/core';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import scss from 'highlight.js/lib/languages/scss';
import bash from 'highlight.js/lib/languages/bash';

hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('scss', scss);
hljs.registerLanguage('bash', bash);

/**
 * A titled demo block with Preview/Code tabs. The live demo is projected;
 * the source is passed as a string.
 */
@Component({
  selector: 'docs-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="docs-section">
      <h2 [id]="anchor()">{{ title() }}</h2>
      @if (description()) {
        <p class="docs-section-description">{{ description() }}</p>
      }
      <div class="docs-section-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          [attr.aria-selected]="tab() === 'preview'"
          [class.active]="tab() === 'preview'"
          (click)="tab.set('preview')"
        >
          Preview
        </button>
        @if (code()) {
          <button
            type="button"
            role="tab"
            [attr.aria-selected]="tab() === 'code'"
            [class.active]="tab() === 'code'"
            (click)="tab.set('code')"
          >
            Code
          </button>
        }
      </div>
      @if (tab() === 'preview') {
        <div class="docs-section-preview">
          <ng-content />
        </div>
      } @else {
        <pre class="docs-section-code"><code [innerHTML]="highlighted()"></code></pre>
      }
    </section>
  `,
})
export class DocsSection {
  readonly title = input.required<string>();
  readonly description = input<string>();
  readonly code = input<string>();
  readonly language = input<'html' | 'typescript' | 'scss' | 'bash'>('html');

  protected readonly tab = signal<'preview' | 'code'>('preview');

  private readonly sanitizer = inject(DomSanitizer);

  protected readonly anchor = computed(() =>
    this.title().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  );

  protected readonly highlighted = computed<SafeHtml>(() => {
    const code = this.code() ?? '';
    const { value } = hljs.highlight(code.trim(), { language: this.language() });
    return this.sanitizer.bypassSecurityTrustHtml(value);
  });
}
