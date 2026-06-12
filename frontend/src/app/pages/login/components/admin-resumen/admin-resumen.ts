import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { InvestigadorService } from '../../../../core/services/investigador.service';
import { ProyectoService } from '../../../../core/services/proyecto.service';
import { PublicacionService } from '../../../../core/services/publicacion.service';
import { ContactoService } from '../../../../core/services/contacto.service';

@Component({
  selector: 'app-admin-resumen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-resumen.html',
  styleUrls: ['./admin-resumen.css']
})
export class AdminResumenComponent implements OnInit {
  @Output() tabChange = new EventEmitter<string>();

  usuario: any = null;
  investigadoresCount = 0;
  proyectosCount = 0;
  publicacionesCount = 0;
  mensajesCount = 0;

  constructor(
    private authSvc: AuthService,
    private invSvc: InvestigadorService,
    private proySvc: ProyectoService,
    private pubSvc: PublicacionService,
    private msgSvc: ContactoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.usuario = this.authSvc.getUsuarioActual();
    this.loadCounts();
  }

  loadCounts() {
    this.invSvc.getInvestigadores().subscribe({
      next: (list) => {
        this.investigadoresCount = list.length;
        this.cdr.detectChanges();
      }
    });

    // In a real application we would load context based on role. If researcher, list only theirs.
    // However, we can just fetch the general counts for simplicity.
    this.proySvc.getProyectos().subscribe({
      next: (list) => {
        this.proyectosCount = list.length;
        this.cdr.detectChanges();
      }
    });

    this.pubSvc.getPublicaciones().subscribe({
      next: (list) => {
        this.publicacionesCount = list.length;
        this.cdr.detectChanges();
      }
    });

    if (this.usuario?.rol === 'admin') {
      this.msgSvc.getContactos().subscribe({
        next: (res) => {
          this.mensajesCount = res ? res.length : 0;
          this.cdr.detectChanges();
        }
      });
    }
  }

  requestTab(tab: string) {
    this.tabChange.emit(tab);
  }

  irARegistrarPublicacion() {
    this.tabChange.emit('publicaciones-nuevo');
  }

  irARegistrarProyecto() {
    this.tabChange.emit('proyectos-nuevo');
  }
}
