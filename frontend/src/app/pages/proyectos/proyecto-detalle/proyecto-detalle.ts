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
  templateUrl: './proyecto-detalle.html',
  styleUrls: ['./proyecto-detalle.css']
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
