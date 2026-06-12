import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PublicacionService } from '../../../core/services/publicacion.service';
import { Publicacion } from '../../../core/models/publicacion.model';
import { BlockRendererComponent } from '../../../shared/block-renderer/block-renderer';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-publicacion-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink, BlockRendererComponent],
  templateUrl: './publicacion-detalle.html',
  styleUrls: ['./publicacion-detalle.css']
})
export class PublicacionDetalleComponent implements OnInit {
  publicacion: Publicacion | null = null;
  isLoading = true;
  citaCopied = false;

  constructor(
    private route: ActivatedRoute,
    private svc: PublicacionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      this.isLoading = true;
      this.svc.getPublicacionById(id).subscribe({
        next: (data) => {
          this.publicacion = data;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.publicacion = null;
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    });
  }

  resolveUrl(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    return `${environment.apiUrl.replace('/api', '')}/${url}`;
  }

  initials(name: string): string {
    const p = name.trim().split(/\s+/);
    return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : name[0].toUpperCase();
  }

  copiarCita() {
    if (!this.publicacion?.cita) return;
    navigator.clipboard.writeText(this.publicacion.cita).then(() => {
      this.citaCopied = true;
      setTimeout(() => { this.citaCopied = false; }, 2500);
    });
  }
}
