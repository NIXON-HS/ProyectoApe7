import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PublicacionService } from '../../core/services/publicacion.service';
import { Publicacion } from '../../core/models/publicacion.model';
import { BlockRendererComponent } from '../../shared/block-renderer/block-renderer';
import { InfoGrupoService } from '../../core/services/info-grupo.service';
import { InfoGrupo } from '../../core/models/info-grupo.model';
import { AdminBarComponent } from '../../shared/admin-bar/admin-bar';
import { PaginationComponent } from '../../shared/pagination/pagination';

@Component({
  selector: 'app-publicaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, BlockRendererComponent, AdminBarComponent, PaginationComponent],
  templateUrl: './publicaciones.html',
  styleUrls: ['./publicaciones.css']
})
export class PublicacionesComponent implements OnInit {
  isLoading = true;
  publicaciones: Publicacion[] = [];
  searchQuery = '';
  filterLinea = 0;
  expandedPubId: number | null = null;
  editMode = false;
  draft: InfoGrupo = {};
  copyFeedbackId: number | null = null;
  info: InfoGrupo | null = null;

  currentPage = 1;
  readonly pageSize = 9;

  readonly lineas = [
    { id: 1, abreviatura: 'DMP-IST', nombre: 'Diseño, Materiales, Producción, Identidad, Sostenibilidad y Tecnologías aplicadas' },
    { id: 2, abreviatura: 'ST-ICD', nombre: 'Software, Tecnologías de la Información y Ciencias de Datos' },
    { id: 3, abreviatura: 'ED-SGRN', nombre: 'Energía, Desarrollo Sostenible y Gestión de Recursos Naturales' }
  ];

  constructor(
    private service: PublicacionService,
    private cdr: ChangeDetectorRef,
    private infoSvc: InfoGrupoService
  ) {}

  loadInfo() {
    this.infoSvc.getInfoGrupo().subscribe({ next: (d) => { this.info = d; this.cdr.detectChanges(); }, error: () => {} });
  }

  startEdit() {
    this.draft = { ...this.info };
    if (!this.draft.publicaciones_badge)        this.draft.publicaciones_badge        = 'Producción Científica';
    if (!this.draft.publicaciones_titulo)       this.draft.publicaciones_titulo       = 'Publicaciones Científicas';
    if (!this.draft.publicaciones_descripcion)  this.draft.publicaciones_descripcion  = 'Consulte los artículos científicos publicados por los investigadores de REASONS en revistas indexadas.';
    this.editMode = true;
  }
  cancelEdit() { this.editMode = false; this.draft = {}; }
  saveEdit() {
    this.infoSvc.actualizarInfoGrupo({
      publicaciones_badge:       this.draft.publicaciones_badge,
      publicaciones_titulo:      this.draft.publicaciones_titulo,
      publicaciones_descripcion: this.draft.publicaciones_descripcion,
    }).subscribe({ next: () => { this.editMode = false; this.infoSvc.notifyUpdate(); this.loadInfo(); } });
  }

  ngOnInit() {
    this.loadInfo();
    this.infoSvc.contentUpdated$.subscribe(() => this.loadInfo());
    this.service.getPublicaciones().subscribe({
      next: (data) => {
        this.publicaciones = data;
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

  onFilterChange() { this.currentPage = 1; }
  onPageChange(page: number) { this.currentPage = page; }

  filtrarPublicaciones(): Publicacion[] {
    let result = this.publicaciones;
    if (this.filterLinea) result = result.filter(p => p.linea_id === this.filterLinea);
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(pub =>
        pub.titulo.toLowerCase().includes(q) ||
        pub.resumen.toLowerCase().includes(q) ||
        pub.investigadores?.some(a => a.nombres.toLowerCase().includes(q))
      );
    }
    return result;
  }

  pagedPublicaciones(): Publicacion[] {
    const filtered = this.filtrarPublicaciones();
    const start = (this.currentPage - 1) * this.pageSize;
    return filtered.slice(start, start + this.pageSize);
  }

  filterPublications() { this.onFilterChange(); }

  clearSearch() {
    this.searchQuery = '';
    this.onFilterChange();
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
