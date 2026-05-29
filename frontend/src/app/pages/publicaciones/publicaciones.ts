import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PublicacionService } from '../../core/services/publicacion.service';
import { Publicacion } from '../../core/models/publicacion.model';

@Component({
  selector: 'app-publicaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen pt-32 pb-24 bg-reasons-bg bg-grid-pattern relative">
      <div class="max-w-7xl mx-auto px-6">
        <!-- Header -->
        <div class="text-center max-w-3xl mx-auto flex flex-col gap-4 mb-16 animate-fade-in">
          <span class="text-xs font-bold text-reasons-green tracking-widest uppercase">Producción Científica</span>
          <h1 class="text-4xl font-extrabold text-reasons-navy">Publicaciones Científicas</h1>
          <div class="w-16 h-1 bg-reasons-green mx-auto rounded-full"></div>
          <p class="text-slate-500 font-light leading-relaxed">
            Consulte los artículos científicos, ponencias y contribuciones de los investigadores de REASONS indexados en journals internacionales de alto impacto.
          </p>
        </div>

        <!-- Buscador por palabras clave o autor -->
        <div class="max-w-xl mx-auto mb-16 relative glass-card p-2.5 rounded-full shadow-inner border border-white/50 flex items-center gap-2 hover-premium focus-within:ring-4 focus-within:ring-reasons-blue/5 focus-within:border-reasons-blue/30 transition-all duration-300">
          <div class="flex items-center pl-4 text-slate-400">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <input type="text" [(ngModel)]="searchQuery" (input)="filterPublications()" 
                 class="w-full bg-transparent border-0 outline-none text-slate-700 text-sm py-1.5 placeholder-slate-450" 
                 placeholder="Buscar por título, palabra clave o investigador..." />
          <button *ngIf="searchQuery" (click)="clearSearch()" class="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-full transition-all">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Spinner loader -->
        <div *ngIf="isLoading" class="flex flex-col items-center justify-center py-20 gap-4">
          <div class="w-12 h-12 border-4 border-reasons-green border-t-transparent rounded-full animate-spin"></div>
          <span class="text-sm font-semibold text-reasons-blue">Cargando publicaciones...</span>
        </div>

        <div *ngIf="!isLoading && filteredPublicaciones.length === 0" class="text-center py-20 animate-fade-in">
          <p class="text-slate-400 text-sm font-light">No se encontraron artículos que coincidan con la búsqueda.</p>
        </div>

        <!-- Publications Grid -->
        <div *ngIf="!isLoading && filteredPublicaciones.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
          <div *ngFor="let pub of filteredPublicaciones" class="glowing-card glass-card rounded-3xl flex flex-col justify-between overflow-hidden text-left">
            <!-- Simulated premium printed scientific journal cover -->
            <div class="relative h-48 bg-gradient-to-br from-reasons-navy via-[#0a3246] to-[#051c27] overflow-hidden flex items-center justify-center group border-b border-slate-100">
              <!-- Scientific structural overlay grid -->
              <div class="absolute inset-0 bg-grid-pattern opacity-10 mix-blend-overlay"></div>
              <!-- Abstract decorative vector lines (SVG) -->
              <svg class="absolute inset-0 w-full h-full opacity-20 pointer-events-none transition-transform duration-700 group-hover:scale-110" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0,50 Q25,30 50,50 T100,50" fill="none" stroke="white" stroke-width="0.5"></path>
                <path d="M0,60 Q30,80 60,40 T100,60" fill="none" stroke="var(--color-reasons-green)" stroke-width="0.5"></path>
                <path d="M0,40 Q40,10 70,50 T100,30" fill="none" stroke="var(--color-reasons-gold)" stroke-width="0.3"></path>
              </svg>
              <!-- Portada content overlay -->
              <div class="relative z-20 p-6 text-center flex flex-col gap-2.5 items-center">
                <span class="text-[9px] font-bold text-reasons-gold uppercase tracking-widest border border-reasons-gold/30 px-3 py-1 rounded-full bg-reasons-navy/40 backdrop-blur-sm shadow-sm">
                  Journal Indexado
                </span>
                <span class="text-white text-xs font-bold font-display max-w-[210px] line-clamp-3 leading-relaxed mt-2 text-shadow-sm">
                  {{ pub.titulo }}
                </span>
              </div>
            </div>

            <!-- Content details -->
            <div class="p-6 md:p-8 flex flex-col gap-4">
              <div>
                <span class="text-[10px] font-bold text-reasons-green uppercase tracking-widest">
                  Línea: {{ pub.linea?.abreviatura || 'Investigación' }}
                </span>
                <h3 class="text-lg font-bold text-reasons-navy leading-tight mt-1 line-clamp-2" [title]="pub.titulo">
                  {{ pub.titulo }}
                </h3>
              </div>

              <!-- Authors list -->
              <div class="flex flex-wrap items-center gap-1.5 text-xs text-slate-505 font-light">
                <span class="font-semibold text-slate-650">Autores:</span>
                <span *ngFor="let author of pub.investigadores; let last = last" class="hover:text-reasons-green transition-colors font-medium">
                  {{ author.nombres }}{{ last ? '' : ',' }}
                </span>
              </div>

              <!-- Collapsible Resumen/Abstract -->
              <div class="flex flex-col gap-2">
                <p class="text-xs text-slate-500 font-light leading-relaxed" 
                   [class.line-clamp-3]="expandedPubId !== pub.id">
                  {{ pub.resumen }}
                </p>
                <button (click)="toggleAbstract(pub.id)" class="text-[10px] font-bold text-reasons-blue hover:text-reasons-green w-fit flex items-center gap-1 transition-all">
                  {{ expandedPubId === pub.id ? 'Leer menos' : 'Leer abstract' }}
                  <svg class="w-3 h-3 transition-transform duration-300" [class.rotate-180]="expandedPubId === pub.id" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
              </div>

              <!-- Citation copiable element -->
              <div class="p-4 rounded-2xl bg-slate-50 border-l-3 border-reasons-gold/45 border-t border-r border-b border-slate-100 flex flex-col gap-2 relative shadow-inner">
                <span class="text-[9px] font-bold text-slate-450 uppercase tracking-widest">Cita en Formato APA</span>
                <p class="text-[10px] text-slate-600 font-light leading-relaxed select-all">
                  {{ pub.cita }}
                </p>
                <button (click)="copyToClipboard(pub.cita, pub.id)" class="px-3.5 py-1.5 border hover:bg-slate-100/50 text-[10px] font-bold rounded-lg shadow-sm self-end transition-all flex items-center gap-1.5 mt-1" [class]="copyFeedbackId === pub.id ? 'bg-[#3c9632]/10 border-[#3c9632]/35 text-reasons-green shadow-[0_0_8px_rgba(60,150,50,0.15)] animate-pulse' : 'bg-white border-slate-150 text-reasons-blue hover-premium'">
                  <!-- Copy/Check SVG icons -->
                  <svg *ngIf="copyFeedbackId !== pub.id" class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
                  </svg>
                  <svg *ngIf="copyFeedbackId === pub.id" class="h-3.5 w-3.5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path>
                  </svg>
                  {{ copyFeedbackId === pub.id ? '¡Copia Exitosa!' : 'Copiar APA' }}
                </button>
              </div>
            </div>

            <!-- Actions footer (DOI Link) -->
            <div class="px-6 md:px-8 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <a *ngIf="pub.doi_url" [href]="pub.doi_url" target="_blank" class="px-4 py-2 bg-reasons-blue hover:bg-reasons-navy text-white text-xs font-bold rounded-full shadow hover-premium flex items-center gap-2">
                Ver Journal (DOI)
                <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
              </a>
              <span *ngIf="!pub.doi_url" class="text-xs text-slate-400 font-light italic">No indexable</span>
            </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .animate-fade-in {
      animation: fadeIn 0.35s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }
  `]
})
export class PublicacionesComponent implements OnInit {
  isLoading = true;
  publicaciones: Publicacion[] = [];
  filteredPublicaciones: Publicacion[] = [];
  searchQuery = '';
  expandedPubId: number | null = null;
  copyFeedbackId: number | null = null;

  constructor(private service: PublicacionService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.service.getPublicaciones().subscribe({
      next: (data) => {
        this.publicaciones = data;
        this.filteredPublicaciones = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching publications:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  filterPublications() {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) {
      this.filteredPublicaciones = this.publicaciones;
      return;
    }

    this.filteredPublicaciones = this.publicaciones.filter(pub => {
      const matchTitle = pub.titulo.toLowerCase().includes(query);
      const matchAbstract = pub.resumen.toLowerCase().includes(query);
      const matchAuthors = pub.investigadores?.some(author => 
        author.nombres.toLowerCase().includes(query)
      );
      return matchTitle || matchAbstract || !!matchAuthors;
    });
  }

  clearSearch() {
    this.searchQuery = '';
    this.filteredPublicaciones = this.publicaciones;
  }

  toggleAbstract(id: number) {
    this.expandedPubId = this.expandedPubId === id ? null : id;
  }

  copyToClipboard(text: string, id: number) {
    navigator.clipboard.writeText(text).then(() => {
      this.copyFeedbackId = id;
      setTimeout(() => {
        this.copyFeedbackId = null;
      }, 2000);
    });
  }
}
