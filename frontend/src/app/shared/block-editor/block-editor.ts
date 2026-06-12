import {
  Component, Directive, Input, Output, EventEmitter,
  AfterViewInit, HostListener, ElementRef, OnInit,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export type BlockType =
  | 'paragraph' | 'heading' | 'subheading' | 'list-bullet' | 'list-number' | 'list'
  | 'image' | 'pdf' | 'quote' | 'callout' | 'separator' | 'code';

export interface Block {
  id: string;
  type: BlockType;
  content?: string;
  url?: string;
  fileName?: string;
  calloutVariant?: 'info' | 'warning' | 'success';
}

// ── Directive: init contenteditable once per element lifecycle ─────────────────
@Directive({ selector: '[blockEditable]', standalone: true })
export class BlockEditableDirective implements AfterViewInit {
  @Input('blockEditable') initialHtml: string = '';
  @Output() htmlChange = new EventEmitter<string>();

  constructor(private el: ElementRef<HTMLElement>) {}

  ngAfterViewInit() {
    this.el.nativeElement.innerHTML = this.initialHtml;
  }

  @HostListener('input')
  onInput() { this.htmlChange.emit(this.el.nativeElement.innerHTML); }

  @HostListener('keydown', ['$event'])
  onKeydown(e: KeyboardEvent) {
    const t = this.el.nativeElement.dataset['bt'];
    if (e.key === 'Enter' && !e.shiftKey && (t === 'heading' || t === 'subheading' || t === 'code')) {
      e.preventDefault();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') { e.preventDefault(); document.execCommand('bold',       false); }
    if ((e.ctrlKey || e.metaKey) && e.key === 'i') { e.preventDefault(); document.execCommand('italic',     false); }
    if ((e.ctrlKey || e.metaKey) && e.key === 'u') { e.preventDefault(); document.execCommand('underline',  false); }
  }
}

// ── Main Component ─────────────────────────────────────────────────────────────
@Component({
  selector: 'app-block-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, BlockEditableDirective],
  templateUrl: './block-editor.html',
  styleUrls: ['./block-editor.css']
})
export class BlockEditorComponent implements OnInit {
  blocks: Block[] = [];
  activeId: string | null = null;
  uploadingId: string | null = null;
  undoBlock: { block: Block; index: number } | null = null;
  private undoTimer: any;
  private _init: Block[] = [];

  @Input() set initialBlocks(val: Block[]) { this._init = val || []; }
  @Output() blocksChange = new EventEmitter<Block[]>();

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.blocks = this._init.length > 0 ? JSON.parse(JSON.stringify(this._init)) : [];
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  trackById(_: number, b: Block) { return b.id; }
  isText(t: BlockType) {
    return ['paragraph','heading','subheading','list-bullet','list-number','quote','callout','code'].includes(t);
  }

  typeLabel(t: BlockType): string {
    const m: Record<BlockType,string> = {
      paragraph:'Párrafo', heading:'Título H2', subheading:'Subtítulo H3',
      'list-bullet':'Lista •', 'list-number':'Lista 1.', list:'Lista',
      quote:'Cita', callout:'Aviso', code:'Código',
      image:'Imagen', pdf:'PDF', separator:'Separador'
    };
    return m[t];
  }

  typeIcon(t: BlockType): string {
    const icons: Record<BlockType, string> = {
      paragraph:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 6h16M4 12h10M4 18h16"/></svg>',
      heading:      '<b style="font-size:10px">H2</b>',
      subheading:   '<b style="font-size:9px">H3</b>',
      'list-bullet':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1.5" fill="currentColor"/><circle cx="4" cy="12" r="1.5" fill="currentColor"/><circle cx="4" cy="18" r="1.5" fill="currentColor"/></svg>',
      'list-number':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1M4 12l2-2v4" fill="none" stroke="currentColor"/></svg>',
      list:         '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1.5" fill="currentColor"/><circle cx="4" cy="12" r="1.5" fill="currentColor"/><circle cx="4" cy="18" r="1.5" fill="currentColor"/></svg>',
      quote:        '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1zm12 0c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>',
      callout:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
      code:         '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
      image:        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
      pdf:          '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/></svg>',
      separator:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    };
    return icons[t] || '';
  }

  typeChip(t: BlockType): string {
    const m: Record<BlockType,string> = {
      paragraph:'chip-para', heading:'chip-h2', subheading:'chip-h3',
      'list-bullet':'chip-ulst', 'list-number':'chip-olst', list:'chip-ulst',
      quote:'chip-quote', callout:'chip-call', code:'chip-code',
      image:'chip-img', pdf:'chip-pdf', separator:'chip-sep'
    };
    return `be-btype ${m[t]}`;
  }

  calloutClass(b: Block) {
    const v = b.calloutVariant || 'info';
    return `be-callout-${v}`;
  }
  calloutIcon(b: Block) {
    return { info:'ℹ️', warning:'⚠️', success:'✅' }[b.calloutVariant || 'info'];
  }

  resolve(url: string): string {
    if (!url || url.startsWith('http') || url.startsWith('data:')) return url;
    return `${environment.apiUrl.replace('/api', '')}/${url}`;
  }

  // ── Block CRUD ─────────────────────────────────────────────────────────────
  add(type: BlockType) {
    const b: Block = { id: crypto.randomUUID(), type };
    if (type === 'list-bullet' || type === 'list-number') b.content = '<li>Elemento</li>';
    if (type === 'callout') b.calloutVariant = 'info';
    this.blocks = [...this.blocks, b];
    this.emit();
    // Auto-scroll to new block
    setTimeout(() => {
      const el = document.querySelector(`[data-block-id="${b.id}"]`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }

  remove(i: number) {
    const removed = this.blocks[i];
    this.blocks = this.blocks.filter((_, idx) => idx !== i);
    this.emit();
    // Show undo bar
    clearTimeout(this.undoTimer);
    this.undoBlock = { block: removed, index: i };
    this.undoTimer = setTimeout(() => { this.undoBlock = null; this.cdr.markForCheck(); }, 5000);
  }

  undo() {
    if (!this.undoBlock) return;
    const { block, index } = this.undoBlock;
    this.blocks.splice(index, 0, block);
    this.blocks = [...this.blocks];
    this.undoBlock = null;
    clearTimeout(this.undoTimer);
    this.emit();
  }

  duplicate(i: number) {
    const copy: Block = { ...JSON.parse(JSON.stringify(this.blocks[i])), id: crypto.randomUUID() };
    this.blocks.splice(i + 1, 0, copy);
    this.blocks = [...this.blocks];
    this.emit();
  }

  moveUp(i: number) {
    if (i === 0) return;
    [this.blocks[i-1], this.blocks[i]] = [this.blocks[i], this.blocks[i-1]];
    this.blocks = [...this.blocks];
    this.emit();
  }

  moveDown(i: number) {
    if (i === this.blocks.length - 1) return;
    [this.blocks[i], this.blocks[i+1]] = [this.blocks[i+1], this.blocks[i]];
    this.blocks = [...this.blocks];
    this.emit();
  }

  clearMedia(b: Block) { b.url = undefined; b.fileName = undefined; this.emit(); }

  onHtml(html: string, b: Block) { b.content = html; this.emit(); }

  emit() { this.blocksChange.emit(JSON.parse(JSON.stringify(this.blocks))); }

  // ── Formatting ─────────────────────────────────────────────────────────────
  fmt(cmd: string)  { document.execCommand(cmd, false); }
  fmtStrike()  { document.execCommand('strikeThrough', false); }
  fmtClear()   { document.execCommand('removeFormat', false); }
  fmtLink()    {
    const url = prompt('URL del enlace (deja vacío para quitar):');
    if (url === null) return;
    if (url === '') { document.execCommand('unlink', false); }
    else { document.execCommand('createLink', false, url); }
  }

  // ── Upload ─────────────────────────────────────────────────────────────────
  upload(event: Event, block: Block) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert('Archivo mayor a 10 MB'); return; }

    this.uploadingId = block.id;
    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = (reader.result as string).split(',')[1];
      this.http.post<any>(`${environment.apiUrl}/upload/media`, { fileName: file.name, base64Data })
        .subscribe({
          next: (res) => {
            this.uploadingId = null;
            if (res.success) {
              block.url = res.url;
              block.fileName = res.fileName || file.name;
              this.emit();
              this.cdr.markForCheck();
            }
          },
          error: () => { this.uploadingId = null; alert('Error al subir. Inténtalo de nuevo.'); }
        });
    };
    reader.readAsDataURL(file);
  }

  // ── Public API ─────────────────────────────────────────────────────────────
  getBlocks(): Block[] { return JSON.parse(JSON.stringify(this.blocks)); }

  getPlainText(): string {
    return this.blocks.filter(b => b.content)
      .map(b => { const d = document.createElement('div'); d.innerHTML = b.content!; return d.textContent || ''; })
      .join('\n');
  }
}
