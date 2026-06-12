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

@Component({
  selector: 'app-publicaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, BlockRendererComponent, AdminBarComponent],
  templateUrl: './publicaciones.html',
  styleUrls: ['./publicaciones.css']
})
export class PublicacionesComponent implements OnInit {
  isLoading = true;
  publicaciones: Publicacion[] = [];
  filteredPublicaciones: Publicacion[] = [];
  searchQuery = '';
  expandedPubId: number | null = null;
  editMode = false;
  draft: InfoGrupo = {};
  copyFeedbackId: number | null = null;
  info: InfoGrupo | null = null;

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
