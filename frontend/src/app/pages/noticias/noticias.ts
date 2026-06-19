import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NoticiaService } from '../../core/services/noticia.service';
import { Noticia } from '../../core/models/noticia.model';
import { BlockRendererComponent } from '../../shared/block-renderer/block-renderer';
import { AdminBarComponent } from '../../shared/admin-bar/admin-bar';
import { InfoGrupoService } from '../../core/services/info-grupo.service';
import { InfoGrupo } from '../../core/models/info-grupo.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-noticias',
  standalone: true,
  imports: [CommonModule, FormsModule, BlockRendererComponent, AdminBarComponent],
  templateUrl: './noticias.html',
  styleUrls: ['./noticias.css']
})
export class NoticiasComponent implements OnInit {
  noticias: Noticia[] = [];
  isLoading = true;
  searchQuery = '';
  filterCategoria = '';
  selectedNoticia: Noticia | null = null;
  editMode = false;
  info: InfoGrupo | null = null;
  draft: InfoGrupo = {};

  constructor(
    private cdr: ChangeDetectorRef,
    private noticiaSvc: NoticiaService,
    private route: ActivatedRoute,
    private infoSvc: InfoGrupoService
  ) {}

  ngOnInit() {
    this.loadInfo();
    this.infoSvc.contentUpdated$.subscribe(() => this.loadInfo());
    this.noticiaSvc.getNoticias().subscribe({
      next: (data) => {
        this.noticias = data.filter(n => n.activo);
        this.isLoading = false;
        this.cdr.detectChanges();
        this.route.queryParams.subscribe(params => {
          const id = Number(params['id']);
          if (id) {
            const found = this.noticias.find(n => n.id === id);
            if (found) this.abrirNoticia(found);
          }
        });
      },
      error: () => { this.isLoading = false; this.cdr.detectChanges(); }
    });
  }

  loadInfo() {
    this.infoSvc.getInfoGrupo().subscribe({ next: (d) => { this.info = d; this.cdr.detectChanges(); }, error: () => {} });
  }

  get categorias(): string[] {
    const cats = [...new Set(this.noticias.map(n => n.categoria).filter(Boolean))];
    return (cats as string[]).sort();
  }

  get filtradas(): Noticia[] {
    let result = this.noticias;
    if (this.filterCategoria) result = result.filter(n => n.categoria === this.filterCategoria);
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(n =>
        n.titulo.toLowerCase().includes(q) ||
        n.resumen.toLowerCase().includes(q) ||
        n.categoria?.toLowerCase().includes(q)
      );
    }
    return result;
  }

  abrirNoticia(noticia: Noticia) {
    this.selectedNoticia = noticia;
    document.body.style.overflow = 'hidden';
  }

  cerrarNoticia() {
    this.selectedNoticia = null;
    document.body.style.overflow = '';
  }

  startEdit() {
    this.draft = { ...this.info };
    if (!this.draft.noticias_badge)       this.draft.noticias_badge       = 'Actualidad';
    if (!this.draft.noticias_titulo)      this.draft.noticias_titulo      = 'Noticias y Novedades';
    if (!this.draft.noticias_descripcion) this.draft.noticias_descripcion = 'Mantente informado sobre las últimas actividades, publicaciones y logros del grupo REASONS.';
    this.editMode = true;
  }

  cancelEdit() { this.editMode = false; this.draft = {}; }

  saveEdit() {
    this.infoSvc.actualizarInfoGrupo({
      noticias_badge:       this.draft.noticias_badge,
      noticias_titulo:      this.draft.noticias_titulo,
      noticias_descripcion: this.draft.noticias_descripcion,
    }).subscribe({
      next: () => {
        this.editMode = false;
        this.infoSvc.notifyUpdate();
        this.loadInfo();
      },
      error: () => {}
    });
  }

  resolveUrl(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    return `${environment.apiUrl.replace('/api', '')}/${url}`;
  }
}
