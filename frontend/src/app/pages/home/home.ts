import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { InfoGrupoService } from '../../core/services/info-grupo.service';
import { InfoGrupo, LineaInvestigacion } from '../../core/models/info-grupo.model';
import { BlockRendererComponent } from '../../shared/block-renderer/block-renderer';
import { AdminBarComponent } from '../../shared/admin-bar/admin-bar';

// Fallback constants (used while API loads or if no data saved yet)
const DEFAULT_MISION = 'Generar, promover y difundir conocimiento científico y tecnológico de vanguardia e impacto multidisciplinario, articulando la ingeniería avanzada con procesos de sostenibilidad industrial y ambiental, para aportar con soluciones innovadoras a las problemáticas actuales de la naturaleza y el beneficio de la sociedad andina y global.';
const DEFAULT_OBJETIVO = 'Consolidarse como un grupo de investigación multidisciplinario líder y de referencia nacional e internacional en la optimización de sistemas productivos, desarrollo tecnológico sustentable y ciencia de datos, aportando soluciones eficientes y amigables con el medio ambiente aplicables a las dinámicas del sector industrial y social del país.';
const DEFAULT_OBJETIVOS_ESP = '1. Publicar artículos científicos de alta calidad en revistas indexadas internacionalmente (Scopus, WoS).\n2. Desarrollar proyectos piloto conjuntos con industrias metalmecánicas, textiles y ambientales de la región.\n3. Formar investigadores jóvenes de pregrado y posgrado mediante la tutoría de tesis de excelencia.\n4. Integrar hardware y software inteligente (IoT, AI) aplicados al desarrollo ecológico y optimización de recursos.';
const DEFAULT_DOMINIO = 'Optimización de los Sistemas Productivos, Diseño y Desarrollo Urbanístico de la Facultad de Ingeniería en Sistemas, Electrónica e Industrial de la Universidad Técnica de Ambato.';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, BlockRendererComponent, AdminBarComponent],
  template: `
    <app-admin-bar editTab="info"></app-admin-bar>
    <!-- Hero Section -->
    <section class="relative min-h-[90vh] flex items-center justify-center pt-24 pb-16 bg-gradient-to-br from-reasons-navy via-[#0a3246] to-reasons-green overflow-hidden">
      <div class="absolute inset-0 opacity-15">
        <div class="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-reasons-green filter blur-3xl"></div>
        <div class="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-reasons-blue filter blur-3xl"></div>
      </div>

      <div class="relative max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div class="lg:col-span-7 flex flex-col gap-6 text-left">
          <span class="inline-flex px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-wider text-[#7dd87a] w-fit">
            Universidad Técnica de Ambato
          </span>
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Research in Engineering and Advanced Sustainable Operations, <span class="text-gradient-gold">Nature, and Society</span>
          </h1>
          <p class="text-lg text-slate-200 font-light leading-relaxed max-w-2xl">
            {{ info?.descripcion || 'Impulsamos la excelencia en investigación multidisciplinaria uniendo la optimización de procesos industriales, el desarrollo tecnológico computacional, la armonía con la naturaleza y el beneficio de la sociedad.' }}
          </p>
          <div class="flex flex-wrap gap-4 mt-4">
            <a routerLink="/equipo" class="px-8 py-3.5 bg-reasons-green hover:bg-[#327e2a] text-white font-semibold rounded-full shadow-lg hover-premium transition-all">
              Conocer el Equipo
            </a>
            <a routerLink="/contacto" class="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-full border border-white/20 shadow-md backdrop-blur-md hover-premium transition-all">
              Contáctanos
            </a>
          </div>
        </div>

        <!-- Logo Card -->
        <div class="lg:col-span-5 flex justify-center">
          <div class="glass-dark-card p-8 rounded-3xl flex flex-col items-center gap-6 max-w-md w-full text-center hover-premium glowing-card animate-float">
            <div class="w-32 h-32 rounded-full bg-white p-4 flex items-center justify-center shadow-xl">
              <img [src]="info?.logo_url || '/logo.svg'" alt="REASONS Group Logo" class="h-24 w-auto object-contain" (error)="$any($event.target).src='/logo.svg'" />
            </div>
            <div class="flex flex-col gap-2">
              <h2 class="text-2xl font-bold text-white tracking-wide">REASONS</h2>
              <span class="text-xs text-[#7dd87a] font-semibold uppercase tracking-widest">Grupo de Investigación UTA</span>
            </div>
            <div class="w-full border-t border-white/10 my-2"></div>
            <p class="text-slate-300 text-sm font-light leading-relaxed">
              "Investigación innovadora desde la Facultad de Ingeniería en Sistemas, Electrónica e Industrial orientada a un futuro industrial verde y sostenible."
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Misión y Objetivos Section -->
    <section class="py-24 bg-white bg-grid-pattern relative">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center max-w-3xl mx-auto flex flex-col gap-4 mb-16">
          <span class="text-xs font-bold text-reasons-green tracking-widest uppercase">Nuestros Propósitos</span>
          <h2 class="text-3xl md:text-4xl font-extrabold text-reasons-navy">Misión y Objetivos de Excelencia</h2>
          <div class="w-16 h-1 bg-reasons-green mx-auto rounded-full"></div>
        </div>

        <div class="max-w-5xl mx-auto">
          <!-- Tab headers -->
          <div class="flex border-b border-slate-100 justify-center mb-8 overflow-x-auto">
            <button (click)="selectTab('mision')"     [class]="activeTab==='mision'     ? 'tab-btn active-tab' : 'tab-btn'">Nuestra Misión</button>
            <button (click)="selectTab('general')"    [class]="activeTab==='general'    ? 'tab-btn active-tab' : 'tab-btn'">Objetivo General</button>
            <button (click)="selectTab('especificos')" [class]="activeTab==='especificos' ? 'tab-btn active-tab' : 'tab-btn'">Objetivos Específicos</button>
          </div>

          <div class="glass-card p-8 md:p-12 rounded-3xl min-h-[220px] shadow-lg animate-fade-in glowing-card">

            <!-- Misión -->
            <div *ngIf="activeTab==='mision'" class="flex flex-col gap-4 animate-fade-in">
              <h3 class="text-xl font-bold text-reasons-navy flex items-center gap-3">
                <svg class="h-6 w-6 text-reasons-green flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
                Comprometidos con el Desarrollo Multidisciplinario
              </h3>
              <app-block-renderer [blocksJson]="info?.mision_json" [fallback]="info?.mision || DEFAULT_MISION"></app-block-renderer>
            </div>

            <!-- Objetivo General -->
            <div *ngIf="activeTab==='general'" class="flex flex-col gap-4 animate-fade-in">
              <h3 class="text-xl font-bold text-reasons-navy flex items-center gap-3">
                <svg class="h-6 w-6 text-reasons-green flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Liderazgo Científico y Tecnológico
              </h3>
              <app-block-renderer [blocksJson]="info?.objetivo_general_json" [fallback]="info?.objetivo_general || DEFAULT_OBJETIVO"></app-block-renderer>
            </div>

            <!-- Objetivos Específicos -->
            <div *ngIf="activeTab==='especificos'" class="flex flex-col gap-4 animate-fade-in">
              <h3 class="text-xl font-bold text-reasons-navy flex items-center gap-3">
                <svg class="h-6 w-6 text-reasons-green flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
                Acciones Estratégicas del Grupo
              </h3>
              <app-block-renderer [blocksJson]="info?.objetivos_especificos_json" [fallback]="info?.objetivos_especificos || DEFAULT_OBJETIVOS_ESP"></app-block-renderer>
            </div>

          </div>
        </div>
      </div>
    </section>

    <!-- Dominio y Líneas de Investigación -->
    <section class="py-24 bg-reasons-bg bg-grid-pattern">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center max-w-4xl mx-auto flex flex-col gap-4 mb-16">
          <span class="text-xs font-bold text-reasons-green tracking-widest uppercase">Ámbito de Acción</span>
          <h2 class="text-3xl md:text-4xl font-extrabold text-reasons-navy">Dominio y Líneas de Investigación</h2>
          <div class="w-16 h-1 bg-reasons-green mx-auto rounded-full mb-2"></div>
          <p class="text-slate-500 font-light max-w-3xl mx-auto leading-relaxed">
            <strong class="text-reasons-blue font-semibold">{{ info?.dominio || DEFAULT_DOMINIO }}</strong>
          </p>
        </div>

        <!-- Líneas de investigación — dinámicas desde la BD -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div *ngFor="let linea of lineas; let i = index"
               [id]="'linea-' + linea.id"
               class="glass-card p-8 rounded-3xl flex flex-col gap-6 hover-premium glowing-card">
            <!-- Icon -->
            <div class="w-14 h-14 rounded-2xl flex items-center justify-center" [class]="lineaIconBg(i)">
              <svg class="h-8 w-8" [class]="lineaIconColor(i)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path *ngIf="i % 3 === 0" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                <path *ngIf="i % 3 === 0" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path *ngIf="i % 3 === 1" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                <path *ngIf="i % 3 === 2" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z"/>
              </svg>
            </div>
            <!-- Label + Title -->
            <div class="flex flex-col gap-2">
              <span class="text-xs font-bold tracking-widest uppercase" [class]="lineaIconColor(i)">
                Línea {{ i + 1 }} ({{ linea.abreviatura }})
              </span>
              <h3 class="text-xl font-bold text-reasons-navy">{{ linea.nombre }}</h3>
            </div>
            <!-- Description: larga si existe, si no la corta -->
            <p class="text-slate-500 font-light text-sm leading-relaxed">
              {{ linea.descripcion_larga || linea.descripcion }}
            </p>
          </div>
        </div>

        <!-- Loading skeleton lineas -->
        <div *ngIf="lineas.length === 0" class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div *ngFor="let _ of [1,2,3]" class="glass-card p-8 rounded-3xl flex flex-col gap-4 animate-pulse">
            <div class="w-14 h-14 rounded-2xl bg-slate-200"></div>
            <div class="h-4 w-24 bg-slate-200 rounded"></div>
            <div class="h-6 w-full bg-slate-200 rounded"></div>
            <div class="h-16 w-full bg-slate-100 rounded"></div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .tab-btn {
      padding: .75rem 1.5rem; font-weight:600; color:#64748b;
      border-bottom:2px solid transparent; transition:all .2s ease; cursor:pointer;
      white-space:nowrap;
    }
    .tab-btn:hover { color:#0a3246; }
    .active-tab { color:#3c9632!important; border-color:#3c9632!important; }
    @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
    .animate-fade-in { animation:fadeIn .35s cubic-bezier(.4,0,.2,1) forwards; }
  `]
})
export class HomeComponent implements OnInit, OnDestroy {
  info: InfoGrupo | null = null;
  lineas: LineaInvestigacion[] = [];
  activeTab: 'mision' | 'general' | 'especificos' = 'mision';

  // Expose defaults to template
  DEFAULT_MISION     = DEFAULT_MISION;
  DEFAULT_OBJETIVO   = DEFAULT_OBJETIVO;
  DEFAULT_OBJETIVOS_ESP = DEFAULT_OBJETIVOS_ESP;
  DEFAULT_DOMINIO    = DEFAULT_DOMINIO;

  private intervalId: any;
  private tabs: ('mision' | 'general' | 'especificos')[] = ['mision', 'general', 'especificos'];

  constructor(private cdr: ChangeDetectorRef, private infoSvc: InfoGrupoService) {}

  ngOnInit() {
    this.startRotation();
    this.cargarInfo();
    this.infoSvc.contentUpdated$.subscribe(() => this.cargarInfo());
  }

  ngOnDestroy() { this.stopRotation(); }

  cargarInfo() {
    this.infoSvc.getInfoGrupo().subscribe({
      next: (data) => { this.info = data; this.cdr.detectChanges(); },
      error: () => {}
    });
    this.infoSvc.getLineas().subscribe({
      next: (data) => { this.lineas = data; this.cdr.detectChanges(); },
      error: () => {}
    });
  }

  startRotation() {
    this.stopRotation();
    this.intervalId = setInterval(() => {
      const idx = this.tabs.indexOf(this.activeTab);
      this.activeTab = this.tabs[(idx + 1) % this.tabs.length];
      this.cdr.detectChanges();
    }, 5000);
  }

  stopRotation() { if (this.intervalId) clearInterval(this.intervalId); }

  selectTab(tab: 'mision' | 'general' | 'especificos') {
    this.activeTab = tab;
    this.cdr.detectChanges();
    this.startRotation();
  }

  lineaIconBg(i: number): string {
    return ['bg-reasons-green/10', 'bg-reasons-blue/10', 'bg-reasons-green/10'][i % 3];
  }
  lineaIconColor(i: number): string {
    return ['text-reasons-green', 'text-reasons-blue', 'text-reasons-green'][i % 3];
  }
}
