import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Block } from '../block-editor/block-editor';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-block-renderer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './block-renderer.html',
  styleUrls: ['./block-renderer.css']
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

  /** Handles both new 'list-bullet' and legacy 'list' type */
  isBulletList(block: Block): boolean {
    return block.type === 'list-bullet' || block.type === 'list';
  }

  safe(html: string | undefined): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html || '');
  }

  calloutClass(block: Block): Record<string, boolean> {
    const v = (block as any).calloutVariant as string || 'info';
    return {
      'bg-blue-50  border border-blue-200  text-blue-800':  v === 'info',
      'bg-amber-50 border border-amber-200 text-amber-800': v === 'warning',
      'bg-green-50 border border-green-200 text-green-800': v === 'success',
    };
  }

  calloutIcon(block: Block): string {
    const v = (block as any).calloutVariant as string || 'info';
    const icons: Record<string, string> = { info: 'ℹ️', warning: '⚠️', success: '✅' };
    return icons[v] ?? 'ℹ️';
  }

  resolveUrl(url: string): string {
    if (!url || url.startsWith('http') || url.startsWith('data:')) return url;
    return `${environment.apiUrl.replace('/api', '')}/${url}`;
  }
}
