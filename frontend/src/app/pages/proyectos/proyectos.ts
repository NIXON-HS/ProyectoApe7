import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProyectoService } from '../../core/services/proyecto.service';
import { Proyecto } from '../../core/models/proyecto.model';
import { BlockRendererComponent } from '../../shared/block-renderer/block-renderer';
import { InfoGrupoService } from '../../core/services/info-grupo.service';
import { InfoGrupo } from '../../core/models/info-grupo.model';
import { AdminBarComponent } from '../../shared/admin-bar/admin-bar';

@Component({
  selector: 'app-proyectos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, BlockRendererComponent, AdminBarComponent],
  template: `
    <app-admin-bar editTab="proyectos"
      [editMode]="editMode"
      (editStart)="startEdit()"
      (editSave)="saveEdit()"
      (editCancel)="cancelEdit()">
    </app-admin-bar>

    <div class="min-h-screen pt-32 pb-24 bg-reasons-bg bg-grid-pattern relative">
      <div class="max-w-7xl mx-auto px-6">

        <!-- ── Edit mode highlight frame ─────────────────────────────── -->
        <div *ngIf="editMode" class="mb-4 px-4 py-2 bg-reasons-green/10 border border-reasons-green/30 rounded-2xl text-xs text-reasons-green font-semibold text-center animate-fade-in">
          ✏ Modo edición activo — modifica los textos directamente y presiona "Guardar cambios"
        </div>

        <!-- Header -->
        <div class="text-center max-w-3xl mx-auto flex flex-col gap-4 mb-20 animate-fade-in">

          <!-- Badge -->
          <span *ngIf="!editMode" class="text-xs font-bold text-reasons-green tracking-widest uppercase">
            {{ info?.proyectos_badge || 'Investigación Aplicada' }}
          </span>
          <input *ngIf="editMode" [(ngModel)]="draft.proyectos_badge"
                 class="ie-badge ie-badge-green" placeholder="Etiqueta..."/>

          <!-- Title -->
          <h1 *ngIf="!editMode" class="text-4xl font-extrabold text-reasons-navy">
            {{ info?.proyectos_titulo || 'Nuestros Proyectos de Investigación' }}
          </h1>
          <input *ngIf="editMode" [(ngModel)]="draft.proyectos_titulo"
                 class="ie-title" placeholder="Título..."/>

          <div class="w-16 h-1 bg-reasons-green mx-auto rounded-full"></div>

          <!-- Description -->
          <p *ngIf="!editMode" class="text-slate-500 font-light leading-relaxed">
            {{ info?.proyectos_descripcion || 'Explore los proyectos científicos liderados por REASONS en distintas áreas del conocimiento.' }}
          </p>
          <textarea *ngIf="editMode" [(ngModel)]="draft.proyectos_descripcion" rows="3"
                    class="ie-desc" placeholder="Descripción..."></textarea>
        </div>

        <!-- Spinner loader -->
        <div *ngIf="isLoading" class="flex flex-col items-center justify-center py-20 gap-4">
          <div class="w-12 h-12 border-4 border-reasons-green border-t-transparent rounded-full animate-spin"></div>
          <span class="text-sm font-semibold text-reasons-blue">Cargando proyectos...</span>
        </div>

        <div *ngIf="!isLoading" class="max-w-4xl mx-auto flex flex-col gap-8 animate-fade-in">
          <!-- Projects List -->
          <div *ngFor="let proj of proyectos" class="glowing-card glass-card p-6 md:p-8 rounded-3xl flex flex-col gap-6 relative overflow-hidden text-left">
            <!-- Top decoration and status badge with pulsing LED -->
            <div class="flex items-center justify-between gap-4">
              <span class="text-[10px] font-bold text-reasons-green uppercase tracking-widest">
                Línea: {{ proj.linea?.abreviatura || 'Investigación' }}
              </span>
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/70 border border-slate-100 shadow-sm" [class]="proj.estado === 'Activo' ? 'text-reasons-green' : 'text-reasons-blue'">
                <span class="w-1.5 h-1.5 rounded-full" [class]="proj.estado === 'Activo' ? 'bg-reasons-green animate-pulse shadow-[0_0_8px_rgba(60,150,50,0.6)]' : 'bg-reasons-blue shadow-[0_0_8px_rgba(10,50,70,0.4)]'"></span>
                {{ proj.estado }}
              </span>
            </div>

            <!-- Title & Desc -->
            <div>
              <h3 class="text-xl font-bold text-reasons-navy mb-3 leading-snug">{{ proj.titulo }}</h3>
              <p class="text-slate-500 font-light text-sm leading-relaxed">
                {{ proj.descripcion }}
              </p>
            </div>

            <!-- Collapsible detailed view -->
            <div *ngIf="expandedProjectId === proj.id" class="border-t border-slate-100 pt-6 mt-2 flex flex-col gap-6 animate-slide-down">

              <!-- Descripción -->
              <div class="flex flex-col gap-2 p-4 rounded-2xl bg-slate-50/60 border border-slate-100 shadow-sm">
                <h4 class="text-xs font-bold text-reasons-navy uppercase tracking-wider flex items-center gap-2">
                  <svg class="w-4 h-4 text-reasons-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h10M4 18h16"/>
                  </svg>
                  Descripción
                </h4>
                <app-block-renderer
                  [blocksJson]="proj.descripcion_json"
                  [fallback]="proj.descripcion">
                </app-block-renderer>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Objetivos -->
                <div class="flex flex-col gap-2 p-4 rounded-2xl bg-slate-50/60 border border-slate-100 shadow-sm">
                  <h4 class="text-xs font-bold text-reasons-navy uppercase tracking-wider flex items-center gap-2">
                    <svg class="w-4 h-4 text-reasons-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke-width="2"/>
                      <circle cx="12" cy="12" r="6"  stroke-width="2"/>
                      <circle cx="12" cy="12" r="2"  fill="currentColor"/>
                    </svg>
                    Objetivos
                  </h4>
                  <app-block-renderer
                    [blocksJson]="proj.objetivos_json"
                    [fallback]="proj.objetivos">
                  </app-block-renderer>
                </div>

                <!-- Resultados -->
                <div class="flex flex-col gap-2 p-4 rounded-2xl bg-slate-50/60 border border-slate-100 shadow-sm">
                  <h4 class="text-xs font-bold text-reasons-navy uppercase tracking-wider flex items-center gap-2">
                    <svg class="w-4 h-4 text-reasons-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Resultados Esperados
                  </h4>
                  <app-block-renderer
                    [blocksJson]="proj.resultados_json"
                    [fallback]="proj.resultados">
                  </app-block-renderer>
                </div>
              </div>
            </div>

            <!-- Footer with participants and actions -->
            <div class="border-t border-slate-100 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <!-- Collaborators avatars -->
              <div class="flex items-center gap-2.5">
                <span class="text-xs text-slate-400 font-light">Colaboradores:</span>
                <div class="flex -space-x-2">
                  <div *ngFor="let author of proj.investigadores"
                       class="w-8 h-8 rounded-full bg-gradient-to-br from-reasons-navy to-reasons-blue border-2 border-white flex items-center justify-center text-white text-[10px] font-bold shadow overflow-hidden"
                       [title]="author.nombres">
                    <img *ngIf="author.foto_url" [src]="obtenerFotoUrl(author.foto_url)"
                         (error)="author.foto_url = ''" class="w-full h-full object-cover" alt="Avatar" />
                    <span *ngIf="!author.foto_url">{{ author.nombres.charAt(0) }}</span>
                  </div>
                  <span *ngIf="!proj.investigadores || proj.investigadores.length === 0"
                        class="text-slate-400 text-xs italic ml-2">Ninguno asignado</span>
                </div>
              </div>

              <!-- Action buttons -->
              <div class="flex items-center gap-2 flex-wrap">
                <!-- Expand/collapse preview -->
                <button (click)="toggleExpand(proj.id)"
                        class="text-xs font-semibold text-slate-500 hover:text-reasons-blue transition-all flex items-center gap-1 cursor-pointer border border-slate-200 rounded-full px-3 py-1.5 hover:border-reasons-blue hover:bg-reasons-blue/5">
                  {{ expandedProjectId === proj.id ? 'Contraer' : 'Vista previa' }}
                  <svg class="w-3 h-3 transition-transform duration-300" [class.rotate-90]="expandedProjectId === proj.id" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
                <!-- Full detail link -->
                <a [routerLink]="['/proyectos', proj.id]"
                   class="text-xs font-bold text-white bg-reasons-blue hover:bg-reasons-navy transition-all flex items-center gap-1.5 rounded-full px-4 py-1.5 shadow-sm hover:shadow-md">
                  Ver proyecto completo
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-slide-down {
      animation: slideDown 0.3s cubic-bezier(0.25, 1, 0.5, 1) forwards;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .animate-fade-in {
      animation: fadeIn 0.35s cubic-bezier(0.25, 1, 0.5, 1) forwards;
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .animate-spin { animation: spin 1s linear infinite; }
    /* ── Inline edit styles ────────────────────────────────── */
    .ie-badge { display:block; width:100%; font-size:10px; font-weight:700;
      text-transform:uppercase; letter-spacing:.1em; color:#3c9632;
      background:transparent; border:none; border-bottom:2px dashed #3c9632;
      text-align:center; outline:none; padding:2px 4px; }
    .ie-badge-green::placeholder { color:#a7f3d0; }
    .ie-title { display:block; width:100%; font-size:2.25rem; font-weight:800;
      color:#00283c; background:rgba(10,50,70,.04); border:2px dashed #0a3246;
      border-radius:12px; text-align:center; outline:none; padding:8px 12px; }
    .ie-desc { display:block; width:100%; font-weight:300; color:#64748b;
      background:rgba(0,0,0,.02); border:2px dashed #cbd5e1;
      border-radius:10px; outline:none; padding:8px 12px; resize:vertical;
      line-height:1.6; text-align:center; }
    @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
    .animate-fade-in { animation:fadeIn .35s cubic-bezier(.4,0,.2,1) forwards; }
  `]
})
export class ProyectosComponent implements OnInit {
  isLoading = true;
  proyectos: Proyecto[] = [];
  expandedProjectId: number | null = null;
  info: InfoGrupo | null = null;
  editMode = false;
  draft: InfoGrupo = {};

  constructor(
    private service: ProyectoService,
    private cdr: ChangeDetectorRef,
    private infoSvc: InfoGrupoService
  ) {}

  obtenerFotoUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    if (url.startsWith('data:image/')) return url;
    if (url.startsWith('assets/images/team/')) {
      return `http://127.0.0.1:3000/${url}`;
    }
    return url;
  }

  ngOnInit() {
    this.fetchProyectos();
    this.loadInfo();
    this.infoSvc.contentUpdated$.subscribe(() => this.loadInfo());
  }

  loadInfo() {
    this.infoSvc.getInfoGrupo().subscribe({ next: (d) => { this.info = d; this.cdr.detectChanges(); }, error: () => {} });
  }

  startEdit() {
    this.draft = { ...this.info };
    if (!this.draft.proyectos_badge)        this.draft.proyectos_badge        = 'Investigación Aplicada';
    if (!this.draft.proyectos_titulo)       this.draft.proyectos_titulo       = 'Nuestros Proyectos de Investigación';
    if (!this.draft.proyectos_descripcion)  this.draft.proyectos_descripcion  = 'Explore los proyectos científicos liderados por REASONS en distintas áreas del conocimiento.';
    this.editMode = true;
    this.cdr.detectChanges();
  }

  cancelEdit() { this.editMode = false; this.draft = {}; }

  saveEdit() {
    this.infoSvc.actualizarInfoGrupo({
      proyectos_badge:        this.draft.proyectos_badge,
      proyectos_titulo:       this.draft.proyectos_titulo,
      proyectos_descripcion:  this.draft.proyectos_descripcion,
    }).subscribe({
      next: () => {
        this.editMode = false;
        this.infoSvc.notifyUpdate();
        this.loadInfo();
      },
      error: () => {}
    });
  }

  fetchProyectos() {
    this.service.getProyectos().subscribe({
      next: (data) => {
        this.proyectos = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching projects:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleExpand(id: number) {
    this.expandedProjectId = this.expandedProjectId === id ? null : id;
  }
}
