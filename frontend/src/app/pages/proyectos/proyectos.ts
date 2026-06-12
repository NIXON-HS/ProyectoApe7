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
  templateUrl: './proyectos.html',
  styleUrls: ['./proyectos.css']
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
