import {
  Component, Directive, Input, Output, EventEmitter,
  AfterViewInit, HostListener, ElementRef, OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export type BlockType = 'paragraph' | 'heading' | 'subheading' | 'list' | 'image' | 'pdf' | 'quote' | 'separator';

export interface Block {
  id: string;
  type: BlockType;
  content?: string;
  url?: string;
  fileName?: string;
}

// ─── Directive: manages a single contenteditable div ──────────────────────────
@Directive({ selector: '[blockEditable]', standalone: true })
export class BlockEditableDirective implements AfterViewInit {
  @Input('blockEditable') initialHtml: string = '';
  @Output() htmlChange = new EventEmitter<string>();

  constructor(private el: ElementRef<HTMLElement>) {}

  ngAfterViewInit() {
    this.el.nativeElement.innerHTML = this.initialHtml;
  }

  @HostListener('input')
  onInput() {
    this.htmlChange.emit(this.el.nativeElement.innerHTML);
  }

  @HostListener('keydown', ['$event'])
  onKeydown(e: KeyboardEvent) {
    const type = this.el.nativeElement.dataset['blockType'];
    // Prevent newlines in headings/subheadings
    if (e.key === 'Enter' && !e.shiftKey && (type === 'heading' || type === 'subheading')) {
      e.preventDefault();
    }
  }
}

// ─── Component: full block-based editor ───────────────────────────────────────
@Component({
  selector: 'app-block-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, BlockEditableDirective],
  template: `
    <!-- Toolbar: Add Blocks -->
    <div class="flex flex-wrap gap-1.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl mb-3">
      <button type="button" (click)="add('paragraph')" class="tbtn">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h10M4 18h16"/></svg>
        Párrafo
      </button>
      <button type="button" (click)="add('heading')" class="tbtn font-black">H2</button>
      <button type="button" (click)="add('subheading')" class="tbtn font-bold text-xs">H3</button>
      <button type="button" (click)="add('list')" class="tbtn">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>
        Lista
      </button>
      <button type="button" (click)="add('quote')" class="tbtn">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
        Cita
      </button>
      <button type="button" (click)="add('image')" class="tbtn">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
        Imagen
      </button>
      <button type="button" (click)="add('pdf')" class="tbtn">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
        PDF
      </button>
      <button type="button" (click)="add('separator')" class="tbtn text-slate-400">— Separador</button>
    </div>

    <!-- Empty state -->
    <div *ngIf="blocks.length === 0"
         class="flex flex-col items-center justify-center gap-2 py-10 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm">
      <svg class="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
      </svg>
      Agrega bloques con los botones de arriba
    </div>

    <!-- Block list -->
    <div class="flex flex-col gap-2">
      <div *ngFor="let block of blocks; let i = index; trackBy: trackById" class="group relative">

        <!-- Block card -->
        <div class="border border-slate-200 rounded-xl bg-white shadow-sm transition-shadow group-hover:shadow-md group-hover:border-slate-300 overflow-hidden">

          <!-- Block header bar -->
          <div class="flex items-center justify-between gap-2 px-3 py-1.5 bg-slate-50 border-b border-slate-100">
            <span class="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded"
                  [class]="typeClass(block.type)">
              {{ typeLabel(block.type) }}
            </span>

            <div class="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <!-- Format buttons (text blocks only) -->
              <ng-container *ngIf="isText(block.type)">
                <button type="button" (click)="fmt('bold')"       class="fmtbtn font-bold"      title="Negrita (Ctrl+B)">B</button>
                <button type="button" (click)="fmt('italic')"     class="fmtbtn italic"         title="Cursiva (Ctrl+I)">I</button>
                <button type="button" (click)="fmt('underline')"  class="fmtbtn underline"      title="Subrayado (Ctrl+U)">U</button>
                <button type="button" (click)="insertLink()"      class="fmtbtn text-reasons-blue" title="Insertar enlace">🔗</button>
                <div class="w-px h-4 bg-slate-200 mx-0.5"></div>
              </ng-container>
              <!-- Move up / down -->
              <button type="button" (click)="moveUp(i)"   [disabled]="i === 0"                    class="movebtn" title="Subir">↑</button>
              <button type="button" (click)="moveDown(i)" [disabled]="i === blocks.length - 1"     class="movebtn" title="Bajar">↓</button>
              <!-- Delete -->
              <button type="button" (click)="remove(block.id)" class="delbtn" title="Eliminar bloque">×</button>
            </div>
          </div>

          <!-- Block body -->
          <div class="p-3">

            <!-- PARAGRAPH -->
            <div *ngIf="block.type === 'paragraph'"
                 contenteditable="true"
                 [blockEditable]="block.content || ''"
                 (htmlChange)="onHtml($event, block)"
                 [attr.data-block-type]="'paragraph'"
                 class="min-h-[72px] text-sm text-slate-700 leading-relaxed focus:outline-none"
                 data-placeholder="Escribe un párrafo..."></div>

            <!-- HEADING H2 -->
            <div *ngIf="block.type === 'heading'"
                 contenteditable="true"
                 [blockEditable]="block.content || ''"
                 (htmlChange)="onHtml($event, block)"
                 [attr.data-block-type]="'heading'"
                 class="text-xl font-extrabold text-reasons-navy focus:outline-none min-h-[36px]"
                 data-placeholder="Título..."></div>

            <!-- SUBHEADING H3 -->
            <div *ngIf="block.type === 'subheading'"
                 contenteditable="true"
                 [blockEditable]="block.content || ''"
                 (htmlChange)="onHtml($event, block)"
                 [attr.data-block-type]="'subheading'"
                 class="text-base font-bold text-reasons-navy focus:outline-none min-h-[32px]"
                 data-placeholder="Subtítulo..."></div>

            <!-- LIST -->
            <ul contenteditable="true"
                *ngIf="block.type === 'list'"
                [blockEditable]="block.content || '<li>Elemento</li>'"
                (htmlChange)="onHtml($event, block)"
                class="list-disc list-inside text-sm text-slate-700 leading-relaxed focus:outline-none min-h-[60px] space-y-1"
                data-placeholder="• Elemento (Enter para nuevo)..."></ul>

            <!-- QUOTE -->
            <div *ngIf="block.type === 'quote'"
                 contenteditable="true"
                 [blockEditable]="block.content || ''"
                 (htmlChange)="onHtml($event, block)"
                 class="border-l-4 border-reasons-blue pl-4 text-sm italic text-slate-600 focus:outline-none min-h-[52px]"
                 data-placeholder="Escribe una cita destacada..."></div>

            <!-- SEPARATOR -->
            <div *ngIf="block.type === 'separator'" class="py-2">
              <hr class="border-slate-300">
            </div>

            <!-- IMAGE -->
            <div *ngIf="block.type === 'image'" class="flex flex-col gap-3">
              <!-- Preview -->
              <div *ngIf="block.url" class="relative inline-block">
                <img [src]="resolveUrl(block.url)" alt="Imagen" class="max-h-64 rounded-lg border border-slate-200 object-contain" />
                <button type="button" (click)="clearMedia(block)" class="absolute top-1 right-1 w-6 h-6 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center text-sm leading-none">×</button>
              </div>
              <!-- Upload zone -->
              <label *ngIf="!block.url" class="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-reasons-blue hover:bg-slate-50 transition-all">
                <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                <span class="text-sm text-slate-500 font-medium">Haz clic para subir imagen</span>
                <span class="text-xs text-slate-400">JPG, PNG, GIF, WEBP</span>
                <input type="file" accept="image/*" class="hidden" (change)="uploadMedia($event, block)" />
              </label>
              <!-- Or paste URL -->
              <div class="flex items-center gap-2">
                <span class="text-xs text-slate-400 whitespace-nowrap">o pega URL:</span>
                <input type="text" placeholder="https://..." [(ngModel)]="block.url" (change)="emit()"
                       class="flex-1 text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-reasons-blue transition-colors" />
              </div>
              <div *ngIf="isUploading && uploadingId === block.id" class="flex items-center gap-2 text-xs text-reasons-blue">
                <span class="w-3 h-3 border-2 border-reasons-blue border-t-transparent rounded-full animate-spin"></span>
                Subiendo...
              </div>
            </div>

            <!-- PDF -->
            <div *ngIf="block.type === 'pdf'" class="flex flex-col gap-3">
              <!-- Preview -->
              <div *ngIf="block.url" class="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-xl">
                <svg class="w-9 h-9 text-red-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                </svg>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-bold text-slate-700 truncate">{{ block.fileName || 'Documento PDF' }}</p>
                  <a [href]="resolveUrl(block.url)" target="_blank" class="text-xs text-red-500 hover:underline">Abrir PDF ↗</a>
                </div>
                <button type="button" (click)="clearMedia(block)" class="text-slate-400 hover:text-rose-500 text-xl leading-none">×</button>
              </div>
              <!-- Upload zone -->
              <label *ngIf="!block.url" class="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-red-200 rounded-xl cursor-pointer hover:border-red-400 hover:bg-red-50 transition-all">
                <svg class="w-8 h-8 text-red-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                </svg>
                <span class="text-sm text-red-500 font-medium">Haz clic para subir PDF</span>
                <span class="text-xs text-red-300">Máximo 10 MB</span>
                <input type="file" accept=".pdf" class="hidden" (change)="uploadMedia($event, block)" />
              </label>
              <div *ngIf="isUploading && uploadingId === block.id" class="flex items-center gap-2 text-xs text-red-500">
                <span class="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></span>
                Subiendo PDF...
              </div>
            </div>

          </div><!-- /block body -->
        </div><!-- /block card -->
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .tbtn {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 4px 10px; font-size: 11px; font-weight: 600;
      background: white; border: 1px solid #e2e8f0; border-radius: 8px;
      color: #475569; cursor: pointer; transition: all .15s;
    }
    .tbtn:hover { background: #0a3246; color: white; border-color: #0a3246; }

    .fmtbtn {
      width: 22px; height: 22px; display: flex; align-items: center; justify-content: center;
      font-size: 11px; border-radius: 4px; cursor: pointer; color: #475569;
      transition: background .15s;
    }
    .fmtbtn:hover { background: #e2e8f0; }

    .movebtn {
      width: 22px; height: 22px; display: flex; align-items: center; justify-content: center;
      font-size: 13px; border-radius: 4px; cursor: pointer; color: #94a3b8;
      transition: background .15s;
    }
    .movebtn:hover:not(:disabled) { background: #e2e8f0; color: #0a3246; }
    .movebtn:disabled { opacity: .3; cursor: default; }

    .delbtn {
      width: 22px; height: 22px; display: flex; align-items: center; justify-content: center;
      font-size: 16px; border-radius: 4px; cursor: pointer; color: #ef4444;
      transition: background .15s;
    }
    .delbtn:hover { background: #fee2e2; }

    [contenteditable]:empty:before {
      content: attr(data-placeholder);
      color: #cbd5e1;
      pointer-events: none;
    }
    [contenteditable] { white-space: pre-wrap; word-break: break-word; }
  `]
})
export class BlockEditorComponent implements OnInit {
  blocks: Block[] = [];
  isUploading = false;
  uploadingId: string | null = null;

  private _initialBlocks: Block[] = [];

  @Input() set initialBlocks(val: Block[]) {
    this._initialBlocks = val || [];
  }

  @Output() blocksChange = new EventEmitter<Block[]>();

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.blocks = this._initialBlocks.length > 0
      ? JSON.parse(JSON.stringify(this._initialBlocks))
      : [];
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  trackById(_: number, b: Block) { return b.id; }

  isText(type: BlockType) {
    return ['paragraph', 'heading', 'subheading', 'list', 'quote'].includes(type);
  }

  typeLabel(type: BlockType): string {
    const map: Record<BlockType, string> = {
      paragraph: 'Párrafo', heading: 'Título H2', subheading: 'Subtítulo H3',
      list: 'Lista', quote: 'Cita', image: 'Imagen', pdf: 'PDF', separator: 'Separador'
    };
    return map[type];
  }

  typeClass(type: BlockType): string {
    const map: Record<BlockType, string> = {
      paragraph:  'bg-slate-100  text-slate-500',
      heading:    'bg-reasons-navy/10 text-reasons-navy',
      subheading: 'bg-reasons-blue/10 text-reasons-blue',
      list:       'bg-green-100  text-green-700',
      quote:      'bg-indigo-100 text-indigo-700',
      image:      'bg-sky-100    text-sky-700',
      pdf:        'bg-red-100    text-red-700',
      separator:  'bg-slate-100  text-slate-400',
    };
    return map[type];
  }

  resolveUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    return `${environment.apiUrl.replace('/api', '')}/${url}`;
  }

  private newId(): string {
    return crypto.randomUUID();
  }

  // ── Block CRUD ─────────────────────────────────────────────────────────────

  add(type: BlockType) {
    const block: Block = { id: this.newId(), type };
    if (type === 'list')      block.content = '<li>Elemento</li>';
    if (type === 'paragraph') block.content = '';
    this.blocks.push(block);
    this.emit();
  }

  remove(id: string) {
    this.blocks = this.blocks.filter(b => b.id !== id);
    this.emit();
  }

  moveUp(i: number) {
    if (i === 0) return;
    [this.blocks[i - 1], this.blocks[i]] = [this.blocks[i], this.blocks[i - 1]];
    this.blocks = [...this.blocks];
    this.emit();
  }

  moveDown(i: number) {
    if (i === this.blocks.length - 1) return;
    [this.blocks[i], this.blocks[i + 1]] = [this.blocks[i + 1], this.blocks[i]];
    this.blocks = [...this.blocks];
    this.emit();
  }

  clearMedia(block: Block) {
    block.url = undefined;
    block.fileName = undefined;
    this.emit();
  }

  // ── Content changes ────────────────────────────────────────────────────────

  onHtml(html: string, block: Block) {
    block.content = html;
    this.emit();
  }

  emit() {
    this.blocksChange.emit(JSON.parse(JSON.stringify(this.blocks)));
  }

  // ── Text formatting ────────────────────────────────────────────────────────

  fmt(command: string) {
    document.execCommand(command, false);
  }

  insertLink() {
    const url = prompt('URL del enlace:');
    if (url) document.execCommand('createLink', false, url);
  }

  // ── File upload ────────────────────────────────────────────────────────────

  uploadMedia(event: Event, block: Block) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('El archivo supera los 10 MB permitidos.');
      return;
    }

    this.isUploading = true;
    this.uploadingId = block.id;

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = (reader.result as string).split(',')[1];
      this.http.post<any>(`${environment.apiUrl}/upload/media`, {
        fileName: file.name,
        base64Data
      }).subscribe({
        next: (res) => {
          this.isUploading = false;
          this.uploadingId = null;
          if (res.success) {
            block.url = res.url;
            block.fileName = res.fileName || file.name;
            this.emit();
          }
        },
        error: () => {
          this.isUploading = false;
          this.uploadingId = null;
          alert('Error al subir el archivo. Inténtalo de nuevo.');
        }
      });
    };
    reader.readAsDataURL(file);
  }

  // ── Public: extract plain-text fallback ───────────────────────────────────

  getPlainText(): string {
    return this.blocks
      .filter(b => b.content)
      .map(b => {
        const tmp = document.createElement('div');
        tmp.innerHTML = b.content || '';
        return tmp.textContent || '';
      })
      .join('\n');
  }

  getBlocks(): Block[] {
    return JSON.parse(JSON.stringify(this.blocks));
  }
}
