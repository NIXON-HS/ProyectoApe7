import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Block } from '../block-editor/block-editor';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-block-renderer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="block-render-root prose-reasons">
      <ng-container *ngFor="let block of blocks">

        <!-- Paragraph -->
        <p *ngIf="block.type === 'paragraph' && block.content"
           class="text-slate-600 leading-relaxed font-light text-sm mb-3"
           [innerHTML]="safe(block.content)"></p>

        <!-- Heading H2 -->
        <h2 *ngIf="block.type === 'heading' && block.content"
            class="text-xl font-extrabold text-reasons-navy mb-2 mt-4"
            [innerHTML]="safe(block.content)"></h2>

        <!-- Subheading H3 -->
        <h3 *ngIf="block.type === 'subheading' && block.content"
            class="text-base font-bold text-reasons-navy mb-2 mt-3"
            [innerHTML]="safe(block.content)"></h3>

        <!-- List -->
        <ul *ngIf="block.type === 'list' && block.content"
            class="list-disc list-inside text-sm text-slate-600 leading-relaxed font-light mb-3 space-y-1"
            [innerHTML]="safe(block.content)"></ul>

        <!-- Quote -->
        <blockquote *ngIf="block.type === 'quote' && block.content"
                    class="border-l-4 border-reasons-blue pl-4 py-1 italic text-slate-500 text-sm mb-3"
                    [innerHTML]="safe(block.content)"></blockquote>

        <!-- Separator -->
        <hr *ngIf="block.type === 'separator'"
            class="border-slate-200 my-4" />

        <!-- Image -->
        <figure *ngIf="block.type === 'image' && block.url" class="mb-4">
          <img [src]="resolveUrl(block.url)"
               alt="Imagen"
               class="rounded-xl border border-slate-200 max-h-96 object-contain w-full" />
        </figure>

        <!-- PDF -->
        <div *ngIf="block.type === 'pdf' && block.url"
             class="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-xl mb-3 hover:bg-red-100 transition-colors">
          <svg class="w-8 h-8 text-red-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
          </svg>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-bold text-slate-700 truncate">{{ block.fileName || 'Documento PDF' }}</p>
            <a [href]="resolveUrl(block.url)" target="_blank"
               class="text-xs text-red-600 hover:underline font-medium">
              Abrir / Descargar PDF ↗
            </a>
          </div>
        </div>

      </ng-container>

      <!-- Fallback: plain text when no blocks -->
      <p *ngIf="blocks.length === 0 && fallback"
         class="text-slate-600 leading-relaxed font-light text-sm whitespace-pre-line">{{ fallback }}</p>
    </div>
  `,
})
export class BlockRendererComponent implements OnChanges {
  @Input() blocksJson: string | null | undefined = null;
  @Input() fallback: string = '';

  blocks: Block[] = [];

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['blocksJson']) {
      this.blocks = this.parse(this.blocksJson);
    }
  }

  private parse(json: string | null | undefined): Block[] {
    if (!json) return [];
    try { return JSON.parse(json); } catch { return []; }
  }

  safe(html: string | undefined): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html || '');
  }

  resolveUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    return `${environment.apiUrl.replace('/api', '')}/${url}`;
  }
}
