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
  template: `
  <div class="be-root">

    <!-- ── Toolbar ──────────────────────────────────────────────────────── -->
    <div class="be-toolbar">
      <span class="be-toolbar-label">Añadir:</span>
      <div class="be-toolbar-btns">
        <button type="button" (click)="add('paragraph')"    class="be-tbtn be-tbtn-text" title="Párrafo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h10M4 18h16"/></svg>Párrafo
        </button>
        <button type="button" (click)="add('heading')"      class="be-tbtn be-tbtn-head" title="Título H2">
          <b>H2</b>
        </button>
        <button type="button" (click)="add('subheading')"   class="be-tbtn be-tbtn-head" title="Subtítulo H3">
          <span style="font-size:10px;font-weight:800">H3</span>
        </button>
        <button type="button" (click)="add('list-bullet')"  class="be-tbtn be-tbtn-list" title="Lista con viñetas">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>Lista
        </button>
        <button type="button" (click)="add('list-number')"  class="be-tbtn be-tbtn-list" title="Lista numerada">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 6h11M10 12h11M10 18h11M4 6h1M4 12l2-2v4M4 18h2a1 1 0 01-1 1H4a1 1 0 010-2"/></svg>Nros.
        </button>
        <button type="button" (click)="add('quote')"        class="be-tbtn be-tbtn-quote" title="Cita / Blockquote">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1zm12 0c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>Cita
        </button>
        <button type="button" (click)="add('callout')"      class="be-tbtn be-tbtn-call" title="Recuadro destacado">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>Aviso
        </button>
        <button type="button" (click)="add('code')"         class="be-tbtn be-tbtn-code" title="Bloque de código">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>Código
        </button>
        <button type="button" (click)="add('image')"        class="be-tbtn be-tbtn-media" title="Imagen">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>Imagen
        </button>
        <button type="button" (click)="add('pdf')"          class="be-tbtn be-tbtn-media" title="PDF">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>PDF
        </button>
        <button type="button" (click)="add('separator')"    class="be-tbtn be-tbtn-sep" title="Separador">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>—
        </button>
      </div>
      <span class="be-counter">{{ blocks.length }} bloque{{ blocks.length !== 1 ? 's' : '' }}</span>
    </div>

    <!-- ── Empty state ──────────────────────────────────────────────────── -->
    <div *ngIf="blocks.length === 0" class="be-empty">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
      <p>Empieza añadiendo bloques con la barra de arriba</p>
      <div class="be-empty-hints">
        <span (click)="add('paragraph')">+ Párrafo</span>
        <span (click)="add('heading')">+ Título</span>
        <span (click)="add('list-bullet')">+ Lista</span>
        <span (click)="add('image')">+ Imagen</span>
        <span (click)="add('pdf')">+ PDF</span>
      </div>
    </div>

    <!-- ── Block list ────────────────────────────────────────────────────── -->
    <div class="be-list">
      <div *ngFor="let block of blocks; let i = index; trackBy: trackById"
           class="be-block"
           [class.be-block-active]="activeId === block.id">

        <!-- Block header -->
        <div class="be-bhead">
          <div class="be-btype" [class]="typeChip(block.type)">
            <span [innerHTML]="typeIcon(block.type)"></span>
            {{ typeLabel(block.type) }}
          </div>

          <!-- Callout variant selector -->
          <div *ngIf="block.type === 'callout'" class="flex gap-1">
            <button type="button" (click)="block.calloutVariant='info';    emit()" class="be-variant-btn" [class.active]="!block.calloutVariant || block.calloutVariant==='info'"    title="Info">ℹ</button>
            <button type="button" (click)="block.calloutVariant='warning'; emit()" class="be-variant-btn" [class.active]="block.calloutVariant==='warning'" title="Aviso">⚠</button>
            <button type="button" (click)="block.calloutVariant='success'; emit()" class="be-variant-btn" [class.active]="block.calloutVariant==='success'" title="Éxito">✓</button>
          </div>

          <div class="be-bactions">
            <!-- Format buttons (text blocks) -->
            <ng-container *ngIf="isText(block.type)">
              <div class="be-fmts">
                <button type="button" (click)="fmt('bold')"      title="Negrita (Ctrl+B)"  class="be-fmt-btn"><b>B</b></button>
                <button type="button" (click)="fmt('italic')"    title="Cursiva (Ctrl+I)"  class="be-fmt-btn"><i>I</i></button>
                <button type="button" (click)="fmt('underline')" title="Subrayado (Ctrl+U)" class="be-fmt-btn"><u>U</u></button>
                <button type="button" (click)="fmtStrike()"      title="Tachado"            class="be-fmt-btn"><s>S</s></button>
                <button type="button" (click)="fmtLink()"        title="Insertar enlace"    class="be-fmt-btn">🔗</button>
                <button type="button" (click)="fmtClear()"       title="Limpiar formato"    class="be-fmt-btn text-rose-400">✕f</button>
              </div>
              <div class="be-divider"></div>
            </ng-container>

            <!-- Duplicate -->
            <button type="button" (click)="duplicate(i)" title="Duplicar" class="be-ctrl-btn be-ctrl-dup">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
            </button>
            <!-- Move up -->
            <button type="button" (click)="moveUp(i)"   [disabled]="i===0"                    title="Subir"  class="be-ctrl-btn">↑</button>
            <!-- Move down -->
            <button type="button" (click)="moveDown(i)" [disabled]="i===blocks.length-1"       title="Bajar"  class="be-ctrl-btn">↓</button>
            <!-- Delete -->
            <button type="button" (click)="remove(i)"  title="Eliminar" class="be-ctrl-btn be-ctrl-del">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
            </button>
          </div>
        </div>

        <!-- Block content area -->
        <div class="be-bbody">

          <!-- PARAGRAPH -->
          <div *ngIf="block.type==='paragraph'"
               contenteditable="true"
               [blockEditable]="block.content||''"
               (htmlChange)="onHtml($event,block)"
               (focus)="activeId=block.id"
               (blur)="activeId=null"
               [attr.data-bt]="'paragraph'"
               class="be-editable be-para"
               data-ph="Escribe un párrafo..."></div>

          <!-- HEADING H2 -->
          <div *ngIf="block.type==='heading'"
               contenteditable="true"
               [blockEditable]="block.content||''"
               (htmlChange)="onHtml($event,block)"
               (focus)="activeId=block.id" (blur)="activeId=null"
               [attr.data-bt]="'heading'"
               class="be-editable be-h2"
               data-ph="Título principal..."></div>

          <!-- SUBHEADING H3 -->
          <div *ngIf="block.type==='subheading'"
               contenteditable="true"
               [blockEditable]="block.content||''"
               (htmlChange)="onHtml($event,block)"
               (focus)="activeId=block.id" (blur)="activeId=null"
               [attr.data-bt]="'subheading'"
               class="be-editable be-h3"
               data-ph="Subtítulo..."></div>

          <!-- LIST BULLET -->
          <ul *ngIf="block.type==='list-bullet'"
              contenteditable="true"
              [blockEditable]="block.content||'<li>Elemento</li>'"
              (htmlChange)="onHtml($event,block)"
              (focus)="activeId=block.id" (blur)="activeId=null"
              class="be-editable be-list-ul"
              data-ph="• Elemento (Enter para nuevo)..."></ul>

          <!-- LIST NUMBER -->
          <ol *ngIf="block.type==='list-number'"
              contenteditable="true"
              [blockEditable]="block.content||'<li>Elemento</li>'"
              (htmlChange)="onHtml($event,block)"
              (focus)="activeId=block.id" (blur)="activeId=null"
              class="be-editable be-list-ol"
              data-ph="1. Elemento (Enter para nuevo)..."></ol>

          <!-- QUOTE -->
          <blockquote *ngIf="block.type==='quote'"
               contenteditable="true"
               [blockEditable]="block.content||''"
               (htmlChange)="onHtml($event,block)"
               (focus)="activeId=block.id" (blur)="activeId=null"
               class="be-editable be-quote"
               data-ph="Escribe una cita o texto destacado..."></blockquote>

          <!-- CALLOUT -->
          <div *ngIf="block.type==='callout'"
               [class]="calloutClass(block)"
               class="be-callout">
            <span class="be-callout-icon">{{ calloutIcon(block) }}</span>
            <div contenteditable="true"
                 [blockEditable]="block.content||''"
                 (htmlChange)="onHtml($event,block)"
                 (focus)="activeId=block.id" (blur)="activeId=null"
                 class="be-editable flex-1"
                 data-ph="Escribe un aviso importante..."></div>
          </div>

          <!-- CODE -->
          <pre *ngIf="block.type==='code'"
               contenteditable="true"
               [blockEditable]="block.content||''"
               (htmlChange)="onHtml($event,block)"
               (focus)="activeId=block.id" (blur)="activeId=null"
               [attr.data-bt]="'code'"
               class="be-editable be-code"
               data-ph="// Escribe código aquí..."></pre>

          <!-- SEPARATOR -->
          <div *ngIf="block.type==='separator'" class="be-separator">
            <hr />
          </div>

          <!-- IMAGE -->
          <div *ngIf="block.type==='image'" class="be-media">
            <div *ngIf="block.url" class="be-img-preview">
              <img [src]="resolve(block.url)" alt="Imagen" />
              <button type="button" (click)="clearMedia(block)" class="be-img-del" title="Quitar imagen">×</button>
            </div>
            <label *ngIf="!block.url" class="be-upload-zone">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
              <strong>Haz clic para subir imagen</strong>
              <span>JPG, PNG, GIF, WEBP · máx. 10 MB</span>
              <input type="file" accept="image/*" class="sr-only" (change)="upload($event, block)" />
            </label>
            <div class="be-url-row">
              <span>o pega URL:</span>
              <input type="text" placeholder="https://..." [(ngModel)]="block.url" (change)="emit()"
                     class="be-url-input" />
            </div>
            <div *ngIf="uploadingId===block.id" class="be-uploading">
              <span class="be-spinner"></span> Subiendo imagen...
            </div>
          </div>

          <!-- PDF -->
          <div *ngIf="block.type==='pdf'" class="be-media">
            <div *ngIf="block.url" class="be-pdf-preview">
              <svg class="be-pdf-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8" fill="none" stroke="currentColor" stroke-width="2"/><line x1="9" y1="13" x2="15" y2="13" fill="none" stroke="currentColor" stroke-width="2"/><line x1="9" y1="17" x2="15" y2="17" fill="none" stroke="currentColor" stroke-width="2"/></svg>
              <div class="be-pdf-info">
                <p>{{ block.fileName || 'Documento PDF' }}</p>
                <a [href]="resolve(block.url)" target="_blank">Abrir / Descargar ↗</a>
              </div>
              <button type="button" (click)="clearMedia(block)" class="be-pdf-del" title="Quitar PDF">×</button>
            </div>
            <label *ngIf="!block.url" class="be-upload-zone be-upload-pdf">
              <svg class="be-pdf-icon-lg" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8" fill="none" stroke="currentColor" stroke-width="2"/></svg>
              <strong>Haz clic para subir PDF</strong>
              <span>Archivo PDF · máx. 10 MB</span>
              <input type="file" accept=".pdf" class="sr-only" (change)="upload($event, block)" />
            </label>
            <div *ngIf="uploadingId===block.id" class="be-uploading be-uploading-pdf">
              <span class="be-spinner be-spinner-red"></span> Subiendo PDF...
            </div>
          </div>

        </div><!-- /bbody -->
      </div><!-- /be-block -->
    </div><!-- /be-list -->

    <!-- ── Undo bar ───────────────────────────────────────────────────────── -->
    <div *ngIf="undoBlock" class="be-undo-bar">
      <span>Bloque eliminado</span>
      <button type="button" (click)="undo()">Deshacer</button>
    </div>

  </div><!-- /be-root -->
  `,
  styles: [`
    /* ── Root ───────────────────────────────────────────────────────────── */
    .be-root { display:flex; flex-direction:column; gap:12px; font-family:inherit; }

    /* ── Toolbar ─────────────────────────────────────────────────────────── */
    .be-toolbar {
      display:flex; align-items:center; gap:8px; flex-wrap:wrap;
      padding:8px 12px; background:#f8fafc; border:1px solid #e2e8f0;
      border-radius:12px;
    }
    .be-toolbar-label { font-size:10px; font-weight:800; text-transform:uppercase;
      letter-spacing:.07em; color:#94a3b8; white-space:nowrap; }
    .be-toolbar-btns {
      display:flex; flex-wrap:wrap; gap:4px; flex:1; min-width:0;
    }
    .be-counter { font-size:10px; font-weight:700; color:#cbd5e1;
      white-space:nowrap; margin-left:auto; }

    .be-tbtn {
      display:inline-flex; align-items:center; gap:4px;
      padding:4px 9px; font-size:11px; font-weight:600;
      border:1px solid #e2e8f0; border-radius:8px;
      background:white; color:#475569; cursor:pointer;
      transition:all .15s; line-height:1;
      white-space:nowrap;
    }
    .be-tbtn svg { width:13px; height:13px; flex-shrink:0; }
    .be-tbtn:hover { transform:translateY(-1px); box-shadow:0 2px 6px rgba(0,0,0,.08); }
    .be-tbtn-text:hover  { background:#0a3246; color:white; border-color:#0a3246; }
    .be-tbtn-head:hover  { background:#1e3a5f; color:white; border-color:#1e3a5f; }
    .be-tbtn-list:hover  { background:#3c9632; color:white; border-color:#3c9632; }
    .be-tbtn-quote:hover { background:#6366f1; color:white; border-color:#6366f1; }
    .be-tbtn-call:hover  { background:#f59e0b; color:white; border-color:#f59e0b; }
    .be-tbtn-code:hover  { background:#1e293b; color:#a5f3fc; border-color:#1e293b; }
    .be-tbtn-media:hover { background:#0284c7; color:white; border-color:#0284c7; }
    .be-tbtn-sep:hover   { background:#64748b; color:white; border-color:#64748b; }

    /* ── Empty state ──────────────────────────────────────────────────────── */
    .be-empty {
      display:flex; flex-direction:column; align-items:center; gap:8px;
      padding:32px 16px; border:2px dashed #e2e8f0; border-radius:12px;
      color:#94a3b8; text-align:center;
    }
    .be-empty svg { width:36px; height:36px; color:#cbd5e1; }
    .be-empty p { font-size:13px; font-weight:500; }
    .be-empty-hints { display:flex; flex-wrap:wrap; gap:6px; justify-content:center; margin-top:4px; }
    .be-empty-hints span {
      font-size:11px; font-weight:700; padding:4px 10px;
      background:#f1f5f9; border:1px solid #e2e8f0; border-radius:20px;
      color:#0a3246; cursor:pointer; transition:all .15s;
    }
    .be-empty-hints span:hover { background:#0a3246; color:white; border-color:#0a3246; }

    /* ── Block card ───────────────────────────────────────────────────────── */
    .be-list { display:flex; flex-direction:column; gap:8px; }
    .be-block {
      border:1px solid #e2e8f0; border-radius:12px; background:white;
      overflow:hidden; transition:box-shadow .2s, border-color .2s;
    }
    .be-block:hover, .be-block-active {
      border-color:#cbd5e1; box-shadow:0 4px 16px rgba(10,50,70,.07);
    }

    /* Block header */
    .be-bhead {
      display:flex; align-items:center; gap:6px; flex-wrap:wrap;
      padding:6px 10px; background:#f8fafc; border-bottom:1px solid #f1f5f9;
      min-height:36px;
    }
    .be-btype {
      display:inline-flex; align-items:center; gap:4px;
      font-size:9px; font-weight:800; text-transform:uppercase;
      letter-spacing:.07em; padding:2px 8px; border-radius:20px;
      white-space:nowrap;
    }
    .be-btype svg { width:10px; height:10px; }

    /* Type chips */
    .chip-para  { background:#f1f5f9; color:#64748b; }
    .chip-h2    { background:#dbeafe; color:#1e40af; }
    .chip-h3    { background:#e0e7ff; color:#3730a3; }
    .chip-ulst  { background:#dcfce7; color:#166534; }
    .chip-olst  { background:#d1fae5; color:#065f46; }
    .chip-quote { background:#ede9fe; color:#5b21b6; }
    .chip-call  { background:#fef3c7; color:#92400e; }
    .chip-code  { background:#1e293b; color:#a5f3fc; }
    .chip-img   { background:#e0f2fe; color:#0369a1; }
    .chip-pdf   { background:#fee2e2; color:#991b1b; }
    .chip-sep   { background:#f1f5f9; color:#94a3b8; }

    .be-bactions {
      display:flex; align-items:center; gap:3px; margin-left:auto; flex-wrap:wrap;
    }
    .be-fmts { display:flex; align-items:center; gap:2px; }
    .be-divider { width:1px; height:16px; background:#e2e8f0; margin:0 3px; }

    .be-fmt-btn {
      width:22px; height:22px; display:flex; align-items:center; justify-content:center;
      font-size:11px; border-radius:5px; cursor:pointer; color:#475569;
      background:transparent; transition:background .15s;
    }
    .be-fmt-btn:hover { background:#e2e8f0; }

    .be-ctrl-btn {
      width:24px; height:24px; display:flex; align-items:center; justify-content:center;
      font-size:12px; border-radius:6px; cursor:pointer; color:#94a3b8;
      background:transparent; transition:all .15s; border:none; padding:0;
    }
    .be-ctrl-btn svg { width:13px; height:13px; }
    .be-ctrl-btn:hover:not(:disabled) { background:#f1f5f9; color:#0a3246; }
    .be-ctrl-btn:disabled { opacity:.25; cursor:default; }
    .be-ctrl-dup:hover:not(:disabled) { background:#dbeafe; color:#2563eb; }
    .be-ctrl-del:hover { background:#fee2e2 !important; color:#ef4444 !important; }

    .be-variant-btn {
      width:22px; height:22px; font-size:11px; border-radius:5px;
      cursor:pointer; background:#f1f5f9; color:#64748b;
      border:1px solid #e2e8f0; transition:all .15s;
    }
    .be-variant-btn.active { background:#fef3c7; color:#92400e; border-color:#fde68a; }

    /* ── Block body ───────────────────────────────────────────────────────── */
    .be-bbody { padding:10px 12px; }

    /* Editable elements */
    .be-editable {
      min-height:40px; padding:6px; border-radius:8px; outline:none;
      transition:background .15s; word-break:break-word; white-space:pre-wrap;
      line-height:1.6;
    }
    .be-editable:focus { background:#f8fafc; }
    .be-editable:empty:before {
      content:attr(data-ph); color:#cbd5e1; pointer-events:none;
    }

    .be-para    { font-size:13px; color:#374151; }
    .be-h2      { font-size:20px; font-weight:800; color:#00283c; }
    .be-h3      { font-size:15px; font-weight:700; color:#0a3246; }
    .be-list-ul { list-style:disc inside; font-size:13px; color:#374151; padding-left:8px; }
    .be-list-ol { list-style:decimal inside; font-size:13px; color:#374151; padding-left:8px; }
    .be-quote   {
      border-left:4px solid #6366f1; padding:8px 14px; font-size:13px;
      font-style:italic; color:#6b7280; background:#faf5ff;
      border-radius:0 8px 8px 0; min-height:52px;
    }
    .be-callout {
      display:flex; align-items:flex-start; gap:10px;
      padding:10px 14px; border-radius:10px; font-size:13px;
    }
    .be-callout-info    { background:#eff6ff; border:1px solid #bfdbfe; }
    .be-callout-warning { background:#fffbeb; border:1px solid #fde68a; }
    .be-callout-success { background:#f0fdf4; border:1px solid #bbf7d0; }
    .be-callout-icon { font-size:18px; flex-shrink:0; margin-top:2px; }
    .be-code {
      background:#1e293b; color:#e2e8f0; font-family:monospace;
      font-size:12px; padding:14px; border-radius:10px;
      min-height:60px; overflow-x:auto; white-space:pre;
    }
    .be-code:focus { background:#1e293b; }

    .be-separator { padding:8px 0; }
    .be-separator hr { border:none; border-top:2px dashed #e2e8f0; }

    /* ── Media blocks ─────────────────────────────────────────────────────── */
    .be-media { display:flex; flex-direction:column; gap:10px; }

    .be-img-preview {
      position:relative; display:inline-block; max-width:100%;
    }
    .be-img-preview img {
      max-height:280px; border-radius:10px; border:1px solid #e2e8f0;
      object-fit:contain; max-width:100%; display:block;
    }
    .be-img-del {
      position:absolute; top:6px; right:6px; width:26px; height:26px;
      background:#ef4444; color:white; border-radius:50%; font-size:16px;
      display:flex; align-items:center; justify-content:center; cursor:pointer;
      border:none; line-height:1; transition:background .15s;
    }
    .be-img-del:hover { background:#dc2626; }

    .be-upload-zone {
      display:flex; flex-direction:column; align-items:center; gap:6px;
      padding:28px 16px; border:2px dashed #e2e8f0; border-radius:12px;
      cursor:pointer; text-align:center; transition:all .2s;
      color:#94a3b8;
    }
    .be-upload-zone:hover { border-color:#0a3246; background:#f0f9ff; color:#0a3246; }
    .be-upload-zone svg { width:32px; height:32px; }
    .be-upload-zone strong { font-size:13px; font-weight:700; }
    .be-upload-zone span { font-size:11px; }
    .be-upload-pdf:hover { border-color:#ef4444; background:#fff1f2; color:#ef4444; }

    .be-url-row {
      display:flex; align-items:center; gap:8px; font-size:11px; color:#94a3b8;
    }
    .be-url-input {
      flex:1; padding:6px 10px; border:1px solid #e2e8f0; border-radius:8px;
      font-size:12px; outline:none; transition:border .15s;
    }
    .be-url-input:focus { border-color:#0a3246; }

    .be-uploading {
      display:flex; align-items:center; gap:8px;
      font-size:11px; color:#0284c7; font-weight:600;
    }
    .be-uploading-pdf { color:#ef4444; }
    .be-spinner {
      width:12px; height:12px; border:2px solid #bae6fd;
      border-top-color:#0284c7; border-radius:50%;
      animation:be-spin 1s linear infinite; display:inline-block;
    }
    .be-spinner-red { border-color:#fecaca; border-top-color:#ef4444; }

    .be-pdf-preview {
      display:flex; align-items:center; gap:12px; padding:12px;
      background:#fff1f2; border:1px solid #fecaca; border-radius:10px;
    }
    .be-pdf-icon { width:32px; height:32px; color:#ef4444; flex-shrink:0; }
    .be-pdf-icon-lg { width:40px; height:40px; color:#ef4444; }
    .be-pdf-info { flex:1; min-width:0; }
    .be-pdf-info p { font-size:13px; font-weight:700; color:#374151; overflow:hidden;
      text-overflow:ellipsis; white-space:nowrap; }
    .be-pdf-info a { font-size:11px; color:#ef4444; text-decoration:none; font-weight:600; }
    .be-pdf-info a:hover { text-decoration:underline; }
    .be-pdf-del { background:none; border:none; font-size:20px; color:#94a3b8;
      cursor:pointer; line-height:1; padding:0 4px; transition:color .15s; }
    .be-pdf-del:hover { color:#ef4444; }

    /* ── Undo bar ──────────────────────────────────────────────────────────── */
    .be-undo-bar {
      display:flex; align-items:center; justify-content:space-between; gap:8px;
      padding:10px 14px; background:#1e293b; border-radius:10px;
      font-size:12px; color:#e2e8f0; font-weight:500;
      animation:be-slide-in .2s ease;
    }
    .be-undo-bar button {
      padding:4px 12px; background:#3b82f6; color:white;
      border:none; border-radius:6px; font-size:11px; font-weight:700;
      cursor:pointer; transition:background .15s;
    }
    .be-undo-bar button:hover { background:#2563eb; }

    /* ── Animations ────────────────────────────────────────────────────────── */
    @keyframes be-spin { to { transform:rotate(360deg); } }
    @keyframes be-slide-in { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:none; } }

    /* ── Responsive ────────────────────────────────────────────────────────── */
    @media (max-width: 640px) {
      .be-toolbar { padding:8px; gap:6px; }
      .be-toolbar-label { display:none; }
      .be-tbtn { padding:4px 7px; font-size:10px; }
      .be-bhead { gap:4px; padding:5px 8px; }
      .be-fmts .be-fmt-btn:nth-child(n+4) { display:none; } /* hide less used on mobile */
      .be-bbody { padding:8px 10px; }
    }
  `]
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
