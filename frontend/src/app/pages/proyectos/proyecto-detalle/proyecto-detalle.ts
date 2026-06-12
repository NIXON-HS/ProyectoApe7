import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProyectoService } from '../../../core/services/proyecto.service';
import { Proyecto } from '../../../core/models/proyecto.model';
import { BlockRendererComponent } from '../../../shared/block-renderer/block-renderer';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-proyecto-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink, BlockRendererComponent],
  template: `
    <div class="min-h-screen bg-reasons-bg bg-grid-pattern">

      <!-- Loading skeleton -->
      <div *ngIf="isLoading" class="max-w-5xl mx-auto px-4 sm:px-6 pt-28 pb-20 flex flex-col gap-6 animate-pulse">
        <div class="h-8 w-48 bg-slate-200 rounded-full"></div>
        <div class="h-12 w-3/4 bg-slate-200 rounded-xl"></div>
        <div class="flex gap-3"><div class="h-7 w-24 bg-slate-200 rounded-full"></div><div class="h-7 w-24 bg-slate-200 rounded-full"></div></div>
        <div class="h-48 bg-slate-200 rounded-2xl"></div>
        <div class="grid grid-cols-2 gap-4"><div class="h-40 bg-slate-200 rounded-2xl"></div><div class="h-40 bg-slate-200 rounded-2xl"></div></div>
      </div>

      <!-- Error state -->
      <div *ngIf="!isLoading && !proyecto" class="flex flex-col items-center justify-center min-h-[70vh] gap-4 text-center px-6">
        <svg class="w-16 h-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <h2 class="text-xl font-bold text-slate-500">Proyecto no encontrado</h2>
        <a routerLink="/proyectos" class="text-sm text-reasons-blue hover:underline">← Volver a proyectos</a>
      </div>

      <!-- Detail content -->
      <div *ngIf="!isLoading && proyecto" class="max-w-5xl mx-auto px-4 sm:px-6 pt-28 pb-20">

        <!-- Back + breadcrumb -->
        <nav class="flex items-center gap-2 text-xs text-slate-400 mb-8 animate-fade-in">
          <a routerLink="/proyectos" class="flex items-center gap-1 hover:text-reasons-blue transition-colors font-semibold">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/>
            </svg>
            Proyectos
          </a>
          <span>/</span>
          <span class="text-slate-500 truncate max-w-xs">{{ proyecto.titulo }}</span>
        </nav>

        <!-- ── Hero ───────────────────────────────────────────────────── -->
        <div class="glass-card rounded-3xl overflow-hidden shadow-xl mb-8 animate-fade-in">
          <!-- Color band -->
          <div class="h-2 bg-gradient-to-r from-reasons-navy via-reasons-blue to-reasons-green"></div>

          <div class="p-6 sm:p-8 md:p-10">
            <!-- Badges row -->
            <div class="flex flex-wrap items-center gap-2 mb-4">
              <span *ngIf="proyecto.linea" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-reasons-blue/10 text-reasons-blue border border-reasons-blue/20">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
                </svg>
                {{ proyecto.linea.abreviatura }}
              </span>
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                    [class]="estadoClass(proyecto.estado)">
                <span class="w-1.5 h-1.5 rounded-full" [class]="estadoDotClass(proyecto.estado)"></span>
                {{ proyecto.estado }}
              </span>
            </div>

            <!-- Title -->
            <h1 class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-reasons-navy leading-tight mb-6">
              {{ proyecto.titulo }}
            </h1>

            <!-- Participants -->
            <div *ngIf="proyecto.investigadores && proyecto.investigadores.length > 0">
              <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Participantes</p>
              <div class="flex flex-wrap gap-3">
                <div *ngFor="let inv of proyecto.investigadores"
                     class="flex items-center gap-2.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-slate-100 hover:border-slate-300 transition-all">

                  <!-- Avatar con fallback a iniciales -->
                  <div class="w-9 h-9 rounded-full bg-gradient-to-br from-reasons-blue via-reasons-navy to-reasons-green p-[1.5px] flex-shrink-0 shadow-sm">
                    <div class="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
                      <img *ngIf="inv.foto_url"
                           [src]="fotoUrl(inv.foto_url)"
                           (error)="$any(inv).foto_url = null"
                           class="w-full h-full object-cover" alt="" />
                      <span *ngIf="!inv.foto_url"
                            class="w-full h-full rounded-full bg-gradient-to-br from-[#0f3a52] to-[#051c27] flex items-center justify-center text-white text-xs font-extrabold">
                        {{ initials(inv.nombres) }}
                      </span>
                    </div>
                  </div>

                  <!-- Info -->
                  <div class="flex flex-col min-w-0">
                    <span class="text-xs font-bold text-reasons-navy leading-tight truncate max-w-[140px]">{{ inv.nombres }}</span>
                    <span *ngIf="$any(inv).proyecto_investigador?.rol_proyecto"
                          class="text-[9px] font-semibold text-slate-500 truncate">
                      {{ $any(inv).proyecto_investigador.rol_proyecto }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Content sections: apiladas verticalmente ─────────────────── -->
        <div class="flex flex-col gap-6 mb-8">

          <!-- Descripción -->
          <section class="glass-card rounded-3xl p-6 shadow-lg animate-fade-in overflow-hidden">
            <div class="flex items-center gap-2 mb-4">
              <div class="w-7 h-7 rounded-lg bg-reasons-blue/10 text-reasons-blue flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h10M4 18h16"/>
                </svg>
              </div>
              <h2 class="text-sm font-extrabold text-reasons-navy uppercase tracking-wide">Descripción</h2>
            </div>
            <div class="break-words overflow-hidden">
              <app-block-renderer
                [blocksJson]="proyecto.descripcion_json"
                [fallback]="proyecto.descripcion">
              </app-block-renderer>
            </div>
          </section>

          <!-- Objetivos -->
          <section class="glass-card rounded-3xl p-6 shadow-lg animate-fade-in overflow-hidden">
            <div class="flex items-center gap-2 mb-4">
              <div class="w-7 h-7 rounded-lg bg-reasons-green/10 text-reasons-green flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke-width="2"/>
                  <circle cx="12" cy="12" r="6"  stroke-width="2"/>
                  <circle cx="12" cy="12" r="2"  fill="currentColor"/>
                </svg>
              </div>
              <h2 class="text-sm font-extrabold text-reasons-navy uppercase tracking-wide">Objetivos</h2>
            </div>
            <div class="break-words overflow-hidden">
              <app-block-renderer
                [blocksJson]="proyecto.objetivos_json"
                [fallback]="proyecto.objetivos">
              </app-block-renderer>
            </div>
          </section>

          <!-- Resultados -->
          <section class="glass-card rounded-3xl p-6 shadow-lg animate-fade-in overflow-hidden">
            <div class="flex items-center gap-2 mb-4">
              <div class="w-7 h-7 rounded-lg bg-reasons-navy/10 text-reasons-navy flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h2 class="text-sm font-extrabold text-reasons-navy uppercase tracking-wide">Resultados Esperados</h2>
            </div>
            <div class="break-words overflow-hidden">
              <app-block-renderer
                [blocksJson]="proyecto.resultados_json"
                [fallback]="proyecto.resultados">
              </app-block-renderer>
            </div>
          </section>

        </div>

        <!-- ── Footer actions ─────────────────────────────────────────── -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 animate-fade-in">
          <a routerLink="/proyectos"
             class="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-reasons-blue transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/>
            </svg>
            Ver todos los proyectos
          </a>
          <a routerLink="/contacto"
             class="px-6 py-2.5 bg-reasons-green hover:bg-[#327e2a] text-white text-sm font-bold rounded-full shadow hover-premium transition-all">
            ¿Te interesa colaborar? →
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
    .animate-fade-in { animation: fadeIn .35s cubic-bezier(.4,0,.2,1) forwards; }
  `]
})
export class ProyectoDetalleComponent implements OnInit {
  proyecto: Proyecto | null = null;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private svc: ProyectoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      this.isLoading = true;
      this.svc.getProyectoById(id).subscribe({
        next: (data) => {
          this.proyecto = data;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.proyecto = null;
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    });
  }

  estadoClass(estado: string): string {
    if (estado === 'Activo')     return 'bg-reasons-green/10 text-reasons-green border border-reasons-green/20';
    if (estado === 'Finalizado') return 'bg-reasons-blue/10 text-reasons-blue border border-reasons-blue/20';
    return 'bg-slate-100 text-slate-500 border border-slate-200';
  }

  estadoDotClass(estado: string): string {
    if (estado === 'Activo')     return 'bg-reasons-green animate-pulse';
    if (estado === 'Finalizado') return 'bg-reasons-blue';
    return 'bg-slate-400';
  }

  fotoUrl(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('data:') || url.startsWith('http')) return url;
    return `${environment.apiUrl.replace('/api', '')}/${url}`;
  }

  initials(name: string): string {
    const p = name.trim().split(/\s+/);
    return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : name[0].toUpperCase();
  }
}
