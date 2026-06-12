import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InfoGrupoService } from '../../core/services/info-grupo.service';
import { InfoGrupo, LineaInvestigacion } from '../../core/models/info-grupo.model';
import { BlockRendererComponent } from '../../shared/block-renderer/block-renderer';
import { AdminBarComponent } from '../../shared/admin-bar/admin-bar';
import { NoticiaService } from '../../core/services/noticia.service';
import { Noticia } from '../../core/models/noticia.model';
import { environment } from '../../../environments/environment';

// Fallback constants (used while API loads or if no data saved yet)
const DEFAULT_MISION = 'Generar, promover y difundir conocimiento científico y tecnológico de vanguardia e impacto multidisciplinario, articulando la ingeniería avanzada con procesos de sostenibilidad industrial y ambiental, para aportar con soluciones innovadoras a las problemáticas actuales de la naturaleza y el beneficio de la sociedad andina y global.';
const DEFAULT_OBJETIVO = 'Consolidarse como un grupo de investigación multidisciplinario líder y de referencia nacional e internacional en la optimización de sistemas productivos, desarrollo tecnológico sustentable y ciencia de datos, aportando soluciones eficientes y amigables con el medio ambiente aplicables a las dinámicas del sector industrial y social del país.';
const DEFAULT_OBJETIVOS_ESP = '1. Publicar artículos científicos de alta calidad en revistas indexadas internacionalmente (Scopus, WoS).\n2. Desarrollar proyectos piloto conjuntos con industrias metalmecánicas, textiles y ambientales de la región.\n3. Formar investigadores jóvenes de pregrado y posgrado mediante la tutoría de tesis de excelencia.\n4. Integrar hardware y software inteligente (IoT, AI) aplicados al desarrollo ecológico y optimización de recursos.';
const DEFAULT_DOMINIO = 'Optimización de los Sistemas Productivos, Diseño y Desarrollo Urbanístico de la Facultad de Ingeniería en Sistemas, Electrónica e Industrial de la Universidad Técnica de Ambato.';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, BlockRendererComponent, AdminBarComponent],
  template: `
    <app-admin-bar editTab="info"
      [editMode]="editMode"
      (editStart)="startEdit()"
      (editSave)="saveEdit()"
      (editCancel)="cancelEdit()">
    </app-admin-bar>
    <!-- Hero Section -->
    <section class="relative min-h-[90vh] flex items-center justify-center pt-24 pb-16 bg-gradient-to-br from-reasons-navy via-[#0a3246] to-reasons-green overflow-hidden">
      <div class="absolute inset-0 opacity-15">
        <div class="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-reasons-green filter blur-3xl"></div>
        <div class="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-reasons-blue filter blur-3xl"></div>
      </div>

      <div class="relative max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div class="lg:col-span-7 flex flex-col gap-6 text-left">
          <!-- Hero badge -->
          <span *ngIf="!editMode" class="inline-flex px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-wider text-[#7dd87a] w-fit">
            {{ info?.hero_badge || 'Universidad Técnica de Ambato' }}
          </span>
          <input *ngIf="editMode" [(ngModel)]="draft.hero_badge"
                 class="hero-ie-badge"
                 placeholder="Etiqueta del hero (ej: Universidad Técnica de Ambato)" />

          <!-- Hero título h1 -->
          <h1 *ngIf="!editMode" class="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            {{ info?.hero_titulo || 'Research in Engineering and Advanced Sustainable Operations,' }}
            <span class="text-gradient-gold">{{ info?.hero_nombre || 'Nature, and Society' }}</span>
          </h1>
          <div *ngIf="editMode" class="flex flex-col gap-2 max-w-2xl">
            <input [(ngModel)]="draft.hero_titulo"
                   class="hero-ie-input"
                   placeholder="Título del hero (parte 1)..." />
            <input [(ngModel)]="draft.hero_nombre"
                   class="hero-ie-input text-[#fbbf24]"
                   placeholder="Título del hero (parte dorada)..." />
          </div>

          <!-- Subtítulo / descripción -->
          <p *ngIf="!editMode" class="text-lg text-slate-200 font-light leading-relaxed max-w-2xl">
            {{ info?.hero_subtitulo || info?.descripcion || 'Investigación innovadora desde la Facultad de Ingeniería en Sistemas, Electrónica e Industrial orientada a un futuro industrial verde y sostenible.' }}
          </p>
          <textarea *ngIf="editMode" [(ngModel)]="draft.hero_subtitulo" rows="3"
                    class="w-full bg-white/10 border-2 border-dashed border-white/40 rounded-2xl text-white placeholder-white/40 text-base font-light leading-relaxed p-4 outline-none resize-none max-w-2xl"
                    placeholder="Subtítulo del hero..."></textarea>
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
            <div class="flex flex-col gap-2 items-center w-full">
              <h2 *ngIf="!editMode" class="text-2xl font-bold text-white tracking-wide">
                {{ info?.hero_card_nombre || 'REASONS' }}
              </h2>
              <input *ngIf="editMode" [(ngModel)]="draft.hero_card_nombre"
                     class="hero-card-input text-center text-xl font-bold text-white tracking-wide"
                     placeholder="Nombre (ej: REASONS)" />

              <span *ngIf="!editMode" class="text-xs text-[#7dd87a] font-semibold uppercase tracking-widest">
                {{ info?.hero_card_grupo || 'Grupo de Investigación UTA' }}
              </span>
              <input *ngIf="editMode" [(ngModel)]="draft.hero_card_grupo"
                     class="hero-card-input text-center text-[10px] font-bold uppercase tracking-widest text-[#7dd87a]"
                     placeholder="Subtítulo del card (ej: Grupo de Investigación UTA)" />
            </div>
            <div class="w-full border-t border-white/10 my-2"></div>
            <p *ngIf="!editMode" class="text-slate-300 text-sm font-light leading-relaxed">
              "{{ info?.hero_cita || 'Investigación innovadora desde la Facultad de Ingeniería en Sistemas, Electrónica e Industrial orientada a un futuro industrial verde y sostenible.' }}"
            </p>
            <textarea *ngIf="editMode" [(ngModel)]="draft.hero_cita" rows="3"
                      class="w-full bg-white/10 border-2 border-dashed border-white/30 rounded-xl text-slate-300 placeholder-white/30 text-sm font-light leading-relaxed p-3 outline-none resize-none"
                      placeholder="Cita del card (sin comillas)..."></textarea>
          </div>
        </div>
      </div>
    </section>

    <!-- Misión y Objetivos Section -->
    <section class="py-24 bg-white bg-grid-pattern relative">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center max-w-3xl mx-auto flex flex-col gap-4 mb-16">
          <span class="text-xs font-bold text-reasons-green tracking-widest uppercase">Nuestros Propósitos</span>
          <h2 class="text-3xl md:text-4xl font-extrabold text-reasons-navy">Descripción y Objetivos de Excelencia</h2>
          <div class="w-16 h-1 bg-reasons-green mx-auto rounded-full"></div>
        </div>

        <div class="max-w-5xl mx-auto">
          <!-- Tab headers -->
          <div class="flex border-b border-slate-100 justify-center mb-8 overflow-x-auto">
            <button (click)="selectTab('mision')"     [class]="activeTab==='mision'     ? 'tab-btn active-tab' : 'tab-btn'">Descripción del Grupo</button>
            <button (click)="selectTab('general')"    [class]="activeTab==='general'    ? 'tab-btn active-tab' : 'tab-btn'">Objetivo General</button>
            <button (click)="selectTab('especificos')" [class]="activeTab==='especificos' ? 'tab-btn active-tab' : 'tab-btn'">Objetivos Específicos</button>
          </div>

          <div class="glass-card p-8 md:p-12 rounded-3xl min-h-[220px] shadow-lg animate-fade-in glowing-card">

            <!-- Misión -->
            <div *ngIf="activeTab==='mision'" class="flex flex-col gap-4 animate-fade-in">
              <h3 class="text-xl font-bold text-reasons-navy flex items-center gap-3">
                <svg class="h-6 w-6 text-reasons-green flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                Comprometidos con el Desarrollo Multidisciplinario
              </h3>
              <app-block-renderer *ngIf="!editMode" [blocksJson]="info?.mision_json" [fallback]="info?.mision || DEFAULT_MISION"></app-block-renderer>
              <textarea *ngIf="editMode" [(ngModel)]="draft.mision" rows="5" class="ie-textarea-light" placeholder="Misión del grupo...">{{ draft.mision }}</textarea>
            </div>

            <!-- Objetivo General -->
            <div *ngIf="activeTab==='general'" class="flex flex-col gap-4 animate-fade-in">
              <h3 class="text-xl font-bold text-reasons-navy flex items-center gap-3">
                <svg class="h-6 w-6 text-reasons-green flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                Liderazgo Científico y Tecnológico
              </h3>
              <app-block-renderer *ngIf="!editMode" [blocksJson]="info?.objetivo_general_json" [fallback]="info?.objetivo_general || DEFAULT_OBJETIVO"></app-block-renderer>
              <textarea *ngIf="editMode" [(ngModel)]="draft.objetivo_general" rows="5" class="ie-textarea-light" placeholder="Objetivo general...">{{ draft.objetivo_general }}</textarea>
            </div>

            <!-- Objetivos Específicos -->
            <div *ngIf="activeTab==='especificos'" class="flex flex-col gap-4 animate-fade-in">
              <h3 class="text-xl font-bold text-reasons-navy flex items-center gap-3">
                <svg class="h-6 w-6 text-reasons-green flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                Acciones Estratégicas del Grupo
              </h3>
              <app-block-renderer *ngIf="!editMode" [blocksJson]="info?.objetivos_especificos_json" [fallback]="info?.objetivos_especificos || DEFAULT_OBJETIVOS_ESP"></app-block-renderer>
              <textarea *ngIf="editMode" [(ngModel)]="draft.objetivos_especificos" rows="6" class="ie-textarea-light" placeholder="Objetivos específicos...">{{ draft.objetivos_especificos }}</textarea>
            </div>

          </div>
        </div>
      </div>
    </section>

    <!-- Dominio Section -->
    <section class="py-20 bg-white relative overflow-hidden">
      <!-- Decorative background glow -->
      <div class="absolute -right-40 -top-40 w-96 h-96 bg-reasons-blue/5 rounded-full filter blur-3xl"></div>
      
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center max-w-4xl mx-auto flex flex-col gap-4">
          <span class="text-xs font-bold text-reasons-green tracking-widest uppercase">Ámbito de Acción</span>
          <h2 class="text-3xl md:text-4xl font-extrabold text-reasons-navy">Dominio de Investigación</h2>
          <div class="w-16 h-1 bg-reasons-green mx-auto rounded-full mb-4"></div>
          
          <div class="glass-card max-w-3xl mx-auto p-8 rounded-3xl border border-slate-100 shadow-lg relative overflow-hidden bg-cover">
            <p *ngIf="!editMode" class="text-slate-650 font-light leading-relaxed text-base italic">
              "{{ info?.dominio || DEFAULT_DOMINIO }}"
            </p>
            <textarea *ngIf="editMode" [(ngModel)]="draft.dominio" rows="3"
                      class="w-full max-w-3xl mx-auto ie-textarea-light" placeholder="Dominio..."></textarea>
          </div>
        </div>
      </div>
    </section>

    <!-- Líneas de Investigación Section -->
    <section class="py-20 bg-reasons-bg bg-grid-pattern relative">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center max-w-3xl mx-auto flex flex-col gap-4 mb-16">
          <span class="text-xs font-bold text-reasons-blue tracking-widest uppercase">Ejes Científicos</span>
          <h2 class="text-3xl md:text-4xl font-extrabold text-reasons-navy">Líneas de Investigación</h2>
          <div class="w-16 h-1 bg-reasons-blue mx-auto rounded-full"></div>
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

    <!-- Noticias Section -->
    <section *ngIf="noticias.length > 0" class="py-20 bg-slate-50/50 relative overflow-hidden border-t border-slate-100">
      <div class="absolute -left-40 top-20 w-96 h-96 bg-reasons-green/5 rounded-full filter blur-3xl"></div>
      <div class="absolute -right-40 bottom-20 w-96 h-96 bg-reasons-blue/5 rounded-full filter blur-3xl"></div>

      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center max-w-3xl mx-auto flex flex-col gap-4 mb-16">
          <span class="text-xs font-bold text-reasons-green tracking-widest uppercase">Actualidad</span>
          <h2 class="text-3xl md:text-4xl font-extrabold text-reasons-navy">Noticias y Novedades del Grupo</h2>
          <div class="w-16 h-1 bg-reasons-green mx-auto rounded-full"></div>
        </div>

        <div class="relative max-w-4xl mx-auto">
          <!-- Card container -->
          <div class="overflow-hidden rounded-3xl shadow-xl relative min-h-[380px] bg-slate-50 border border-slate-150 transition-all duration-500 hover:shadow-2xl">
            <!-- Sliding Item -->
            <div *ngFor="let noticia of noticias; let idx = index"
                 [class]="idx === currentNewsIndex ? 'flex flex-col md:flex-row opacity-100 scale-100 translate-x-0 relative z-10' : 'absolute inset-0 flex flex-col md:flex-row opacity-0 scale-95 pointer-events-none z-0 translate-x-4'"
                 class="transition-all duration-750 cubic-bezier(0.16, 1, 0.3, 1) h-full min-h-[380px] text-left bg-white w-full">
              
              <!-- Image side -->
              <div class="md:w-1/2 relative bg-gradient-to-br from-[#00283c] to-[#043d1a] overflow-hidden min-h-[220px] md:min-h-0 flex-shrink-0 flex items-center justify-center">
                <img *ngIf="noticia.imagen_url" [src]="resolveUrl(noticia.imagen_url)" 
                     class="absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-out" 
                     [class]="idx === currentNewsIndex ? 'scale-100 opacity-100' : 'scale-110 opacity-0'" alt="News Image" />
                <div *ngIf="!noticia.imagen_url" class="absolute inset-0 flex flex-col items-center justify-center text-white/20 p-8 transition-all duration-700"
                     [class]="idx === currentNewsIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-95'">
                  <svg class="w-16 h-16 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15M9 11l3 3m0 0l3-3m-3 3V8"/></svg>
                  <span class="text-[10px] uppercase tracking-widest font-bold mt-2 text-white/40">REASONS News</span>
                </div>
                <span class="absolute top-4 left-4 inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white bg-reasons-green/80 backdrop-blur-md border border-white/20 shadow-md transition-all duration-700 delay-300 transform"
                      [class]="idx === currentNewsIndex ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'">
                  {{ noticia.categoria }}
                </span>
              </div>

              <!-- Content side -->
              <div class="md:w-1/2 p-8 md:p-12 flex flex-col justify-between bg-white text-left gap-6">
                <div class="flex flex-col gap-4">
                  <span class="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5 transition-all duration-700 delay-75 transform"
                        [class]="idx === currentNewsIndex ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'">
                    <svg class="w-4 h-4 text-reasons-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                    {{ noticia.fecha | date:'longDate' }}
                  </span>
                  <h3 class="text-xl md:text-2xl font-black text-reasons-navy leading-tight hover:text-reasons-green transition-all duration-700 delay-150 transform cursor-pointer" 
                      [class]="idx === currentNewsIndex ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'"
                      (click)="verNoticia(noticia)">
                    {{ noticia.titulo }}
                  </h3>
                  <p class="text-sm text-slate-500 font-light leading-relaxed transition-all duration-700 delay-300 transform"
                     [class]="idx === currentNewsIndex ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'">
                    {{ noticia.resumen }}
                  </p>
                </div>
                <button (click)="verNoticia(noticia)" 
                        class="group w-fit px-6 py-2.5 bg-reasons-navy hover:bg-reasons-green text-white text-xs font-bold rounded-full shadow hover-premium transition-all duration-700 delay-500 transform cursor-pointer flex items-center gap-1.5"
                        [class]="idx === currentNewsIndex ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'">
                  Leer más
                  <svg class="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/></svg>
                </button>
              </div>

            </div>
          </div>

          <!-- Controls -->
          <button (click)="prevNews()" class="group absolute left-[-20px] md:left-[-28px] top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white hover:bg-reasons-green hover:text-white text-reasons-navy border border-slate-200/80 shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer z-10 hover:shadow-reasons-green/20 hover:shadow-2xl">
            <svg class="w-5 h-5 md:w-6 md:h-6 transition-transform duration-300 group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <button (click)="nextNews()" class="group absolute right-[-20px] md:right-[-28px] top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white hover:bg-reasons-green hover:text-white text-reasons-navy border border-slate-200/80 shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer z-10 hover:shadow-reasons-green/20 hover:shadow-2xl">
            <svg class="w-5 h-5 md:w-6 md:h-6 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/></svg>
          </button>

          <!-- Dots -->
          <div class="flex justify-center gap-2 mt-8">
            <button *ngFor="let noticia of noticias; let idx = index"
                    (click)="selectNews(idx)"
                    [class]="idx === currentNewsIndex ? 'w-6 bg-reasons-green' : 'w-2 bg-slate-300 hover:bg-slate-400 hover:scale-125'"
                    class="h-2 rounded-full transition-all duration-500 cubic-bezier(0.25, 1, 0.5, 1) cursor-pointer"></button>
          </div>
        </div>

      </div>
    </section>

    <!-- News Details Backdrop Modal -->
    <div *ngIf="selectedNoticia" 
         (click)="cerrarNoticia()"
         class="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-backdrop">
      <div (click)="$event.stopPropagation()"
           class="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col text-left animate-modal-spring">
        
        <!-- Modal Cover -->
        <div class="relative bg-gradient-to-br from-[#00283c] to-[#043d1a] min-h-[220px] sm:min-h-[280px] flex items-center justify-center text-center overflow-hidden flex-shrink-0">
          <img *ngIf="selectedNoticia.imagen_url" [src]="resolveUrl(selectedNoticia.imagen_url)" class="w-full h-full object-cover" />
          <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
          <button (click)="cerrarNoticia()" class="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-all hover:rotate-90 duration-300 cursor-pointer">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
          
          <div class="absolute bottom-6 left-6 right-6 flex flex-col gap-2.5">
            <span class="inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-[#7dd87a] bg-white/10 border border-white/20 w-fit backdrop-blur-md">
              {{ selectedNoticia.categoria }}
            </span>
            <h3 class="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight">
              {{ selectedNoticia.titulo }}
            </h3>
          </div>
        </div>

        <!-- Content -->
        <div class="p-6 sm:p-8 flex flex-col gap-6">
          <div class="flex items-center gap-1.5 text-xs text-slate-400 font-bold uppercase tracking-wide border-b border-slate-100 pb-3">
            <svg class="w-4 h-4 text-reasons-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            Publicado el {{ selectedNoticia.fecha | date:'longDate' }}
          </div>

          <div class="p-4 bg-slate-50 border-l-4 border-reasons-green rounded-r-2xl font-light text-slate-650 leading-relaxed text-sm italic">
            {{ selectedNoticia.resumen }}
          </div>

          <div class="text-sm text-slate-700 font-light leading-relaxed prose max-w-none">
            <app-block-renderer
              [blocksJson]="selectedNoticia.contenido_json"
              [fallback]="selectedNoticia.contenido">
            </app-block-renderer>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-5 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button (click)="cerrarNoticia()" class="px-6 py-2 bg-reasons-navy hover:bg-reasons-green text-white text-xs font-bold rounded-full transition-colors cursor-pointer shadow-sm">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tab-btn {
      padding:.75rem 1.5rem; font-weight:600; color:#64748b;
      border-bottom:2px solid transparent; transition:all .2s ease; cursor:pointer; white-space:nowrap;
    }
    .tab-btn:hover { color:#0a3246; }
    .active-tab { color:#3c9632!important; border-color:#3c9632!important; }
    @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
    .animate-fade-in { animation:fadeIn .35s cubic-bezier(.4,0,.2,1) forwards; }
    .ie-textarea-light {
      display:block; width:100%; background:rgba(10,50,70,.04);
      border:2px dashed #94a3b8; border-radius:12px; outline:none;
      padding:10px 14px; resize:vertical; line-height:1.6; font-size:.9rem;
      color:#374151; transition:border .2s;
    }
    .ie-textarea-light:focus { border-color:#3c9632; background:rgba(60,150,50,.03); }
    /* Hero inline-edit styles */
    .hero-ie-badge {
      display:inline-block; font-size:11px; font-weight:700; text-transform:uppercase;
      letter-spacing:.1em; color:#7dd87a; background:rgba(255,255,255,.08);
      border:1.5px dashed rgba(125,216,122,.5); border-radius:999px;
      padding:6px 18px; outline:none; transition:border .2s;
    }
    .hero-ie-badge:focus { border-color:#7dd87a; background:rgba(255,255,255,.12); }
    .hero-ie-input {
      display:block; width:100%; font-size:2.5rem; font-weight:800;
      color:#fff; background:rgba(255,255,255,.08);
      border:2px dashed rgba(255,255,255,.35); border-radius:16px;
      padding:8px 14px; outline:none; line-height:1.2; transition:border .2s;
    }
    .hero-ie-input:focus { border-color:#7dd87a; background:rgba(255,255,255,.12); }
    .hero-card-input {
      display:block; width:100%; background:rgba(255,255,255,.08);
      border:1.5px dashed rgba(255,255,255,.35); border-radius:10px;
      padding:5px 10px; outline:none; transition:border .2s; color:inherit;
    }
    .hero-card-input:focus { border-color:#7dd87a; background:rgba(255,255,255,.12); }
    @keyframes scaleUp { from{opacity:0;transform:scale(.95)} to{opacity:1;transform:scale(1)} }
    .scale-up-animation { animation:scaleUp .3s cubic-bezier(.16,1,.3,1) forwards; }
    
    /* Premium News Animations */
    @keyframes backdropFade {
      from { opacity: 0; backdrop-filter: blur(0px); background-color: rgba(15, 23, 42, 0); }
      to { opacity: 1; backdrop-filter: blur(4px); background-color: rgba(15, 23, 42, 0.6); }
    }
    .animate-backdrop {
      animation: backdropFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    
    @keyframes modalSpring {
      0% { opacity: 0; transform: scale(0.92) translateY(30px); }
      100% { opacity: 1; transform: scale(1) translateY(0); }
    }
    .animate-modal-spring {
      animation: modalSpring 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }
  `]
})
export class HomeComponent implements OnInit, OnDestroy {
  info: InfoGrupo | null = null;
  lineas: LineaInvestigacion[] = [];
  activeTab: 'mision' | 'general' | 'especificos' = 'mision';
  editMode = false;
  draft: InfoGrupo = {};

  // Noticias state
  noticias: Noticia[] = [];
  selectedNoticia: Noticia | null = null;
  currentNewsIndex = 0;

  // Expose defaults to template
  DEFAULT_MISION     = DEFAULT_MISION;
  DEFAULT_OBJETIVO   = DEFAULT_OBJETIVO;
  DEFAULT_OBJETIVOS_ESP = DEFAULT_OBJETIVOS_ESP;
  DEFAULT_DOMINIO    = DEFAULT_DOMINIO;

  private intervalId: any;
  private newsIntervalId: any;
  private tabs: ('mision' | 'general' | 'especificos')[] = ['mision', 'general', 'especificos'];

  constructor(
    private cdr: ChangeDetectorRef,
    private infoSvc: InfoGrupoService,
    private noticiaSvc: NoticiaService
  ) {}

  ngOnInit() {
    this.startRotation();
    this.cargarInfo();
    this.cargarNoticias();
    this.infoSvc.contentUpdated$.subscribe(() => {
      this.cargarInfo();
      this.cargarNoticias();
    });
  }

  ngOnDestroy() {
    this.stopRotation();
    this.stopNewsRotation();
  }

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

  startEdit() {
    this.draft = { ...this.info };
    // Pre-fill hero fields with their on-screen fallbacks so the user
    // only needs to edit what they want to change, not retype everything.
    if (!this.draft.hero_badge)        this.draft.hero_badge        = 'Universidad Técnica de Ambato';
    if (!this.draft.hero_titulo)       this.draft.hero_titulo       = 'Research in Engineering and Advanced Sustainable Operations,';
    if (!this.draft.hero_nombre)       this.draft.hero_nombre       = 'Nature, and Society';
    if (!this.draft.hero_subtitulo)    this.draft.hero_subtitulo    = this.info?.descripcion
      ?? 'Investigación innovadora desde la Facultad de Ingeniería en Sistemas, Electrónica e Industrial orientada a un futuro industrial verde y sostenible.';
    if (!this.draft.hero_cita)         this.draft.hero_cita         = 'Investigación innovadora desde la Facultad de Ingeniería en Sistemas, Electrónica e Industrial orientada a un futuro industrial verde y sostenible.';
    if (!this.draft.hero_card_nombre)  this.draft.hero_card_nombre  = 'REASONS';
    if (!this.draft.hero_card_grupo)   this.draft.hero_card_grupo   = 'Grupo de Investigación UTA';
    if (!this.draft.mision)              this.draft.mision              = this.info?.mision              ?? DEFAULT_MISION;
    if (!this.draft.objetivo_general)    this.draft.objetivo_general    = this.info?.objetivo_general    ?? DEFAULT_OBJETIVO;
    if (!this.draft.objetivos_especificos) this.draft.objetivos_especificos = this.info?.objetivos_especificos ?? DEFAULT_OBJETIVOS_ESP;
    if (!this.draft.dominio)             this.draft.dominio             = this.info?.dominio             ?? DEFAULT_DOMINIO;
    this.editMode = true;
  }
  cancelEdit() { this.editMode = false; this.draft = {}; }
  saveEdit() {
    this.infoSvc.actualizarInfoGrupo({
      // Hero
      hero_badge:              this.draft.hero_badge,
      hero_titulo:             this.draft.hero_titulo,
      hero_nombre:             this.draft.hero_nombre,
      hero_subtitulo:          this.draft.hero_subtitulo,
      hero_cita:               this.draft.hero_cita,
      hero_card_nombre:        this.draft.hero_card_nombre,
      hero_card_grupo:         this.draft.hero_card_grupo,
      // Misión / Objetivos / Dominio
      descripcion:             this.draft.descripcion,
      mision:                  this.draft.mision,
      objetivo_general:        this.draft.objetivo_general,
      objetivos_especificos:   this.draft.objetivos_especificos,
      dominio:                 this.draft.dominio,
    }).subscribe({ next: () => { this.editMode = false; this.infoSvc.notifyUpdate(); this.cargarInfo(); } });
  }

  lineaIconBg(i: number): string {
    return ['bg-reasons-green/10', 'bg-reasons-blue/10', 'bg-reasons-green/10'][i % 3];
  }
  lineaIconColor(i: number): string {
    return ['text-reasons-green', 'text-reasons-blue', 'text-reasons-green'][i % 3];
  }

  cargarNoticias() {
    this.noticiaSvc.getNoticias().subscribe({
      next: (data) => {
        this.noticias = data.filter(n => n.activo);
        this.currentNewsIndex = 0;
        this.cdr.detectChanges();
        this.startNewsRotation();
      },
      error: () => {}
    });
  }

  startNewsRotation() {
    this.stopNewsRotation();
    if (this.noticias.length <= 1) return;
    this.newsIntervalId = setInterval(() => {
      this.nextNews();
    }, 6000);
  }

  stopNewsRotation() {
    if (this.newsIntervalId) clearInterval(this.newsIntervalId);
  }

  prevNews() {
    if (this.noticias.length === 0) return;
    this.currentNewsIndex = (this.currentNewsIndex - 1 + this.noticias.length) % this.noticias.length;
    this.cdr.detectChanges();
    this.startNewsRotation();
  }

  nextNews() {
    if (this.noticias.length === 0) return;
    this.currentNewsIndex = (this.currentNewsIndex + 1) % this.noticias.length;
    this.cdr.detectChanges();
    this.startNewsRotation();
  }

  selectNews(index: number) {
    this.currentNewsIndex = index;
    this.cdr.detectChanges();
    this.startNewsRotation();
  }

  verNoticia(noticia: Noticia) {
    this.selectedNoticia = noticia;
    this.stopNewsRotation();
    this.cdr.detectChanges();
  }

  cerrarNoticia() {
    this.selectedNoticia = null;
    this.startNewsRotation();
    this.cdr.detectChanges();
  }

  resolveUrl(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    return `${environment.apiUrl.replace('/api', '')}/${url}`;
  }
}
