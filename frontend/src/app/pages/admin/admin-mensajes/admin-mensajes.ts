import { Component, OnInit, Input, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactoService } from '../../../core/services/contacto.service';
import { SolicitudService } from '../../../core/services/solicitud.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { PaginationComponent } from '../../../shared/pagination/pagination';
import { Contacto } from '../../../core/models/contacto.model';
import { Solicitud } from '../../../core/models/solicitud.model';
import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-admin-mensajes',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './admin-mensajes.html',
  styleUrls: ['./admin-mensajes.css']
})
export class AdminMensajesComponent implements OnInit, OnDestroy {
  @Input() searchQuery = '';
  @Input() usuario: any = null;

  mensajes: Contacto[] = [];
  solicitudes: Solicitud[] = [];
  selectedMessage: Contacto | null = null;
  selectedSolicitud: Solicitud | null = null;
  activeSubTab: 'contacto' | 'solicitudes' = 'contacto';

  currentPage = 1;
  readonly pageSize = 10;

  motivoRechazo = '';
  showRechazoModal = false;

  private destroy$ = new Subject<void>();

  constructor(
    private contactoService: ContactoService,
    private solicitudService: SolicitudService,
    private toastService: ToastService,
    private confirmService: ConfirmService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (this.usuario?.rol === 'investigador') {
      this.activeSubTab = 'solicitudes';
    }
    
    // Poll the list of notifications/requests every 10 seconds
    timer(0, 10000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.cargarTodo();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarTodo() {
    if (this.usuario?.rol === 'admin') {
      this.contactoService.getContactos()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res) => {
            this.mensajes = res || [];
            if (this.selectedMessage) {
              const updatedMsg = this.mensajes.find(m => m.id === this.selectedMessage?.id);
              this.selectedMessage = updatedMsg || null;
            }
            this.cdr.detectChanges();
          },
          error: (err) => console.error('Error cargando mensajes:', err)
        });
    }

    this.solicitudService.getSolicitudes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.solicitudes = res || [];
          if (this.selectedSolicitud) {
            const updatedSol = this.solicitudes.find(s => s.id === this.selectedSolicitud?.id);
            this.selectedSolicitud = updatedSol || null;
          }
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error cargando solicitudes:', err)
      });
  }

  switchSubTab(tab: 'contacto' | 'solicitudes') {
    this.activeSubTab = tab;
    this.selectedMessage = null;
    this.selectedSolicitud = null;
    this.currentPage = 1;
    this.cdr.detectChanges();
  }

  get currentList(): any[] {
    return this.activeSubTab === 'contacto' ? this.mensajes : this.solicitudes;
  }

  verDetalle(item: any) {
    if (this.activeSubTab === 'contacto') {
      this.selectedMessage = item;
      this.selectedSolicitud = null;
    } else {
      this.selectedSolicitud = item;
      this.selectedMessage = null;
    }
    this.cdr.detectChanges();
  }

  cerrarDetalle() {
    this.selectedMessage = null;
    this.selectedSolicitud = null;
    this.cdr.detectChanges();
  }

  async eliminarMensaje(id: number) {
    const confirmed = await this.confirmService.confirm(
      '¿Está seguro de que desea eliminar este mensaje de contacto?',
      'Confirmar eliminación'
    );
    if (confirmed) {
      this.contactoService.eliminarContacto(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.toastService.show('Mensaje de contacto eliminado.', 'info');
            this.cerrarDetalle();
            this.cargarTodo();
            this.solicitudService.triggerRefreshCount();
          },
          error: (err) => console.error(err)
        });
    }
  }

  async aprobarSolicitud(id: number) {
    const confirmed = await this.confirmService.confirm(
      '¿Está seguro de que desea aprobar esta solicitud y aplicar los cambios?',
      'Confirmar aprobación'
    );
    if (confirmed) {
      this.solicitudService.procesarSolicitud(id, 'aprobado')
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res) => {
            this.toastService.show(res.message || 'Solicitud aprobada con éxito.', 'success');
            this.cerrarDetalle();
            this.cargarTodo();
            this.solicitudService.triggerRefreshCount();
          },
          error: (err) => {
            console.error(err);
            this.toastService.show('Error al aprobar la solicitud.', 'error');
          }
        });
    }
  }

  abrirRechazoModal() {
    this.motivoRechazo = '';
    this.showRechazoModal = true;
    this.cdr.detectChanges();
  }

  cerrarRechazoModal() {
    this.showRechazoModal = false;
    this.cdr.detectChanges();
  }

  confirmarRechazo() {
    if (!this.selectedSolicitud?.id) return;
    this.solicitudService.procesarSolicitud(this.selectedSolicitud.id, 'rechazado', this.motivoRechazo)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.toastService.show('Solicitud rechazada.', 'info');
          this.cerrarRechazoModal();
          this.cerrarDetalle();
          this.cargarTodo();
          this.solicitudService.triggerRefreshCount();
        },
        error: (err) => {
          console.error(err);
          this.toastService.show('Error al rechazar la solicitud.', 'error');
        }
      });
  }

  async cancelarSolicitud(id: number) {
    const confirmed = await this.confirmService.confirm(
      '¿Está seguro de que desea cancelar esta solicitud? Los cambios propuestos se descartarán.',
      'Confirmar cancelación'
    );
    if (confirmed) {
      this.solicitudService.eliminarSolicitud(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res) => {
            this.toastService.show(res.message || 'Solicitud cancelada con éxito.', 'info');
            this.cerrarDetalle();
            this.cargarTodo();
            this.solicitudService.triggerRefreshCount();
          },
          error: (err) => {
            console.error(err);
            this.toastService.show('Error al cancelar la solicitud.', 'error');
          }
        });
    }
  }

  parsearDatosNuevos(jsonStr: string): any {
    try {
      return JSON.parse(jsonStr);
    } catch {
      return {};
    }
  }

  onPageChange(page: number) { 
    this.currentPage = page; 
    this.cdr.detectChanges();
  }

  filtrarLista(items: any[]): any[] {
    if (!items) return [];
    if (!this.searchQuery) return items;
    const q = this.searchQuery.toLowerCase();
    
    if (this.activeSubTab === 'contacto') {
      return items.filter(item =>
        item.nombre_completo.toLowerCase().includes(q) ||
        item.asunto.toLowerCase().includes(q) ||
        item.mensaje.toLowerCase().includes(q)
      );
    } else {
      return items.filter(item => {
        const datos = this.parsearDatosNuevos(item.datos_nuevos);
        const userNombres = item.usuario?.nombres || '';
        const userCorreo = item.usuario?.correo || '';
        const titulo = datos.titulo || '';
        return userNombres.toLowerCase().includes(q) ||
          userCorreo.toLowerCase().includes(q) ||
          titulo.toLowerCase().includes(q) ||
          item.tipo.toLowerCase().includes(q) ||
          item.estado.toLowerCase().includes(q);
      });
    }
  }

  pagedList(items: any[]): any[] {
    const filtered = this.filtrarLista(items);
    const start = (this.currentPage - 1) * this.pageSize;
    return filtered.slice(start, start + this.pageSize);
  }
}
