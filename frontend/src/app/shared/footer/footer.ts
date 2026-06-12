import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { InfoGrupoService } from '../../core/services/info-grupo.service';
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

  constructor(private infoSvc: InfoGrupoService) {}

  ngOnInit() {
    this.infoSvc.getInfoGrupo().subscribe({ next: (d) => { this.info = d; }, error: () => {} });
  }
}
