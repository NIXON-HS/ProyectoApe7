import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { InfoGrupoService } from '../../core/services/info-grupo.service';
import { InfoGrupo } from '../../core/models/info-grupo.model';

/** Fields shown in the drawer for each page type */
type EditTab = 'info' | 'proyectos' | 'publicaciones' | 'investigadores' | 'mensajes';

interface FieldDef {
  key: keyof InfoGrupo;
  label: string;
  type: 'text' | 'textarea' | 'email';
  rows?: number;
  placeholder?: string;
}

const PAGE_FIELDS: Record<EditTab, FieldDef[]> = {
  info: [
    { key: 'descripcion',           label: 'Descripción del Grupo',  type: 'textarea', rows: 4 },
    { key: 'mision',                label: 'Misión',                  type: 'textarea', rows: 3 },
    { key: 'objetivo_general',      label: 'Objetivo General',        type: 'textarea', rows: 3 },
    { key: 'objetivos_especificos', label: 'Objetivos Específicos',   type: 'textarea', rows: 4 },
    { key: 'dominio',               label: 'Dominio',                 type: 'textarea', rows: 2 },
  ],
  proyectos: [
    { key: 'proyectos_badge',       label: 'Etiqueta (badge)',        type: 'text',     placeholder: 'Investigación Aplicada' },
    { key: 'proyectos_titulo',      label: 'Título de la página',     type: 'text',     placeholder: 'Nuestros Proyectos...' },
    { key: 'proyectos_descripcion', label: 'Descripción / subtítulo', type: 'textarea', rows: 2 },
  ],
  publicaciones: [
    { key: 'publicaciones_badge',       label: 'Etiqueta (badge)',        type: 'text',     placeholder: 'Producción Científica' },
    { key: 'publicaciones_titulo',      label: 'Título de la página',     type: 'text',     placeholder: 'Publicaciones Científicas' },
    { key: 'publicaciones_descripcion', label: 'Descripción / subtítulo', type: 'textarea', rows: 2 },
  ],
  investigadores: [
    { key: 'equipo_badge',        label: 'Etiqueta (badge)',        type: 'text',     placeholder: 'Talento Humano' },
    { key: 'equipo_titulo',       label: 'Título de la página',     type: 'text',     placeholder: 'Nuestro Equipo de Investigación' },
    { key: 'equipo_descripcion',  label: 'Descripción / subtítulo', type: 'textarea', rows: 2 },
  ],
  mensajes: [
    { key: 'contacto_badge',       label: 'Etiqueta (badge)',        type: 'text',     placeholder: 'Póngase en Contacto' },
    { key: 'contacto_titulo',      label: 'Título de la página',     type: 'text',     placeholder: 'Contacte con Nosotros' },
    { key: 'contacto_descripcion', label: 'Descripción / subtítulo', type: 'textarea', rows: 2 },
    { key: 'contacto_email',       label: 'Correo electrónico',      type: 'email' },
    { key: 'contacto_telefono',    label: 'Teléfono',                type: 'text' },
    { key: 'contacto_direccion',   label: 'Dirección física',        type: 'textarea', rows: 2 },
  ],
};

@Component({
  selector: 'app-admin-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <ng-container *ngIf="isAdmin">

      <!-- ── Floating bar ─────────────────────────────────────────── -->
      <div class="fixed bottom-5 left-1/2 -translate-x-1/2 z-40
                  flex items-center gap-3 px-5 py-2.5
                  bg-reasons-navy/95 backdrop-blur-md
                  border border-white/10 rounded-full shadow-2xl
                  text-white text-xs font-semibold select-none
                  animate-slide-up">

        <span class="flex items-center gap-1.5 text-[#7dd87a]">
          <span class="w-2 h-2 rounded-full bg-[#7dd87a] animate-pulse"></span>
          Modo Admin
        </span>

        <span class="w-px h-4 bg-white/20"></span>

        <button (click)="openDrawer()" class="flex items-center gap-1.5 hover:text-[#7dd87a] transition-colors cursor-pointer">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
          </svg>
          Editar contenido
        </button>

        <span class="w-px h-4 bg-white/20"></span>

        <button (click)="goAdmin()" class="flex items-center gap-1.5 hover:text-white/70 transition-colors cursor-pointer">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
          </svg>
          Panel Completo
        </button>
      </div>

      <!-- ── Backdrop ──────────────────────────────────────────────── -->
      <div *ngIf="drawerOpen"
           class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
           (click)="closeDrawer()"></div>

      <!-- ── Drawer ────────────────────────────────────────────────── -->
      <div [class]="drawerOpen ? 'drawer-open' : 'drawer-closed'"
           class="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-50
                  shadow-2xl flex flex-col transition-transform duration-300">

        <!-- Drawer header -->
        <div class="flex items-center justify-between gap-3 p-5 bg-reasons-navy text-white flex-shrink-0">
          <div class="flex flex-col">
            <span class="font-bold text-sm">Editar contenido</span>
            <span class="text-[10px] text-white/60 uppercase tracking-widest">{{ pageLabel }}</span>
          </div>
          <button (click)="closeDrawer()" class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Loading -->
        <div *ngIf="loading" class="flex-1 flex items-center justify-center">
          <div class="w-8 h-8 border-4 border-reasons-green border-t-transparent rounded-full animate-spin"></div>
        </div>

        <!-- Fields -->
        <div *ngIf="!loading && data" class="flex-1 overflow-y-auto p-5 flex flex-col gap-5">

          <div *ngFor="let field of fields" class="flex flex-col gap-1.5">
            <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">
              {{ field.label }}
            </label>
            <textarea *ngIf="field.type === 'textarea'"
                      [(ngModel)]="data[field.key]"
                      [rows]="field.rows || 3"
                      [placeholder]="field.placeholder || ''"
                      class="drawer-input"></textarea>
            <input *ngIf="field.type !== 'textarea'"
                   [type]="field.type"
                   [(ngModel)]="data[field.key]"
                   [placeholder]="field.placeholder || ''"
                   class="drawer-input" />
          </div>

          <p class="text-[10px] text-slate-400 text-center mt-2">
            Para editar contenido rico (imágenes, formatos), usa el
            <button (click)="goAdmin()" class="text-reasons-blue underline cursor-pointer">Panel Completo</button>.
          </p>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between gap-3 p-5 border-t border-slate-100 bg-slate-50 flex-shrink-0">
          <button (click)="closeDrawer()" class="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer">
            Cancelar
          </button>
          <button (click)="save()" [disabled]="saving"
                  class="px-6 py-2.5 bg-reasons-green hover:bg-[#327e2a] text-white font-bold rounded-xl text-xs shadow-md disabled:opacity-50 transition-all cursor-pointer flex items-center gap-2">
            <span *ngIf="saving" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <svg *ngIf="!saving" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
            </svg>
            {{ saving ? 'Guardando...' : 'Guardar cambios' }}
          </button>
        </div>
      </div>

    </ng-container>
  `,
  styles: [`
    .drawer-open  { transform: translateX(0); }
    .drawer-closed { transform: translateX(100%); }

    .drawer-input {
      width: 100%; padding: .7rem 1rem;
      border: 1px solid rgba(226,232,240,.9); border-radius: .85rem;
      font-size: .8125rem; background: white;
      transition: border .25s, box-shadow .25s;
      resize: vertical;
    }
    .drawer-input:focus {
      outline: none; border-color: var(--color-reasons-blue);
      box-shadow: 0 0 0 4px rgba(10,50,70,.05);
    }

    @keyframes slide-up {
      from { opacity:0; transform: translate(-50%, 20px); }
      to   { opacity:1; transform: translate(-50%, 0); }
    }
    .animate-slide-up { animation: slide-up .3s cubic-bezier(.25,1,.5,1) forwards; }
  `]
})
export class AdminBarComponent implements OnInit {
  @Input() editTab: EditTab = 'info';

  drawerOpen = false;
  loading    = false;
  saving     = false;
  data: InfoGrupo | null = null;

  get isAdmin(): boolean {
    const user = this.auth.getUsuarioActual();
    return !!(this.auth.getToken() && user?.rol === 'admin');
  }

  get fields(): FieldDef[] { return PAGE_FIELDS[this.editTab] || []; }

  get pageLabel(): string {
    const labels: Record<EditTab, string> = {
      info: 'Inicio & Grupo', proyectos: 'Proyectos',
      publicaciones: 'Publicaciones', investigadores: 'Equipo', mensajes: 'Contacto'
    };
    return labels[this.editTab];
  }

  constructor(
    private auth: AuthService,
    private infoSvc: InfoGrupoService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {}

  openDrawer() {
    this.drawerOpen = true;
    this.loading = true;
    this.infoSvc.getInfoGrupo().subscribe({
      next: (d) => { this.data = { ...d }; this.loading = false; this.cdr.detectChanges(); },
      error: ()  => { this.loading = false; }
    });
  }

  closeDrawer() { this.drawerOpen = false; }

  save() {
    if (!this.data) return;
    this.saving = true;

    const payload: Partial<InfoGrupo> = {};
    for (const f of this.fields) {
      (payload as any)[f.key] = (this.data as any)[f.key];
    }

    this.infoSvc.actualizarInfoGrupo(payload).subscribe({
      next: () => {
        this.saving = false;
        this.drawerOpen = false;
        this.infoSvc.notifyUpdate();   // Notify all subscribed pages to refresh
        this.cdr.detectChanges();
      },
      error: () => { this.saving = false; }
    });
  }

  goAdmin() {
    this.closeDrawer();
    this.router.navigate(['/login'], { queryParams: { tab: this.editTab } });
  }
}
