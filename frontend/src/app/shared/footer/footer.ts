import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { InfoGrupoService } from '../../core/services/info-grupo.service';
import { VisitaService } from '../../core/services/visita.service';
import { InfoGrupo } from '../../core/models/info-grupo.model';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.html',
  styleUrls: ['./footer.css']
})
export class FooterComponent implements OnInit {
  currentYear = new Date().getFullYear();
  info: InfoGrupo | null = null;
  visitas: number | null = null;

  constructor(private infoSvc: InfoGrupoService, private visitaSvc: VisitaService) {}

  ngOnInit() {
    this.infoSvc.getInfoGrupo().subscribe({ next: (d) => { this.info = d; }, error: () => {} });
    const sid = localStorage.getItem('reasons_sid') || crypto.randomUUID();
    localStorage.setItem('reasons_sid', sid);
    this.visitaSvc.registrarVisita(sid, window.location.pathname).subscribe({
      next: (c) => { this.visitas = c; },
      error: () => { this.visitas = 0; }
    });
  }
}
