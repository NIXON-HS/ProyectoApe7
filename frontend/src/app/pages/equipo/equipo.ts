import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InvestigadorService } from '../../core/services/investigador.service';
import { InfoGrupoService } from '../../core/services/info-grupo.service';
import { InfoGrupo } from '../../core/models/info-grupo.model';
import { AdminBarComponent } from '../../shared/admin-bar/admin-bar';
import { PaginationComponent } from '../../shared/pagination/pagination';
import { Investigador } from '../../core/models/investigador.model';

@Component({
  selector: 'app-equipo',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminBarComponent, PaginationComponent],
  templateUrl: './equipo.html',
  styleUrls: ['./equipo.css']
})
export class EquipoComponent implements OnInit {
  isLoading = true;
  directiva: Investigador[] = [];
  investigadoresList: Investigador[] = [];
  selectedMember: Investigador | null = null;
  info: InfoGrupo | null = null;
  editMode = false;
  draft: InfoGrupo = {};

  searchQuery = '';
  currentPage = 1;
  readonly pageSize = 8;

  constructor(
    private service: InvestigadorService,
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
    this.infoSvc.getInfoGrupo().subscribe({ next: (d) => { this.info = d; this.cdr.detectChanges(); }, error: () => {} });
    this.infoSvc.contentUpdated$.subscribe(() => this.infoSvc.getInfoGrupo().subscribe({ next: (d) => { this.info = d; this.cdr.detectChanges(); } }));
    this.service.getInvestigadores().subscribe({
      next: (data) => {
        this.directiva = data.filter(m => m.posicion === 'Director' || m.posicion === 'Subdirector');
        this.investigadoresList = data.filter(m => m.posicion === 'Investigador');
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching team members:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSearchChange() { this.currentPage = 1; }
  onPageChange(page: number) { this.currentPage = page; }

  filtrarInvestigadores(items: Investigador[]): Investigador[] {
    if (!this.searchQuery) return items;
    const q = this.searchQuery.toLowerCase();
    return items.filter(i =>
      i.nombres.toLowerCase().includes(q) ||
      (i.biografia && i.biografia.toLowerCase().includes(q)) ||
      (i.orcid && i.orcid.toLowerCase().includes(q))
    );
  }

  pagedInvestigadores(items: Investigador[]): Investigador[] {
    const filtered = this.filtrarInvestigadores(items);
    const start = (this.currentPage - 1) * this.pageSize;
    return filtered.slice(start, start + this.pageSize);
  }

  getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  }

  openDetail(member: Investigador) {
    this.selectedMember = member;
  }

  closeDetail() { this.selectedMember = null; }

  startEdit() {
    this.draft = { ...this.info };
    if (!this.draft.equipo_badge)       this.draft.equipo_badge       = 'Talento Humano';
    if (!this.draft.equipo_titulo)      this.draft.equipo_titulo      = 'Nuestro Equipo de Investigación';
    if (!this.draft.equipo_descripcion) this.draft.equipo_descripcion = 'Conoce a los científicos, ingenieros y expertos multidisciplinares que forman parte de REASONS.';
    this.editMode = true;
  }
  cancelEdit() { this.editMode = false; this.draft = {}; }
  saveEdit() {
    this.infoSvc.actualizarInfoGrupo({
      equipo_badge:       this.draft.equipo_badge,
      equipo_titulo:      this.draft.equipo_titulo,
      equipo_descripcion: this.draft.equipo_descripcion,
    }).subscribe({ next: () => { this.editMode = false; this.infoSvc.notifyUpdate(); this.infoSvc.getInfoGrupo().subscribe({ next: (d) => { this.info = d; this.cdr.detectChanges(); } }); } });
  }
}
