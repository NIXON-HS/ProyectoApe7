import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactoService } from '../../../core/services/contacto.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { PaginationComponent } from '../../../shared/pagination/pagination';
import { Contacto } from '../../../core/models/contacto.model';

@Component({
  selector: 'app-admin-mensajes',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './admin-mensajes.html',
  styleUrls: ['./admin-mensajes.css']
})
export class AdminMensajesComponent implements OnInit {
  @Input() searchQuery = '';

  mensajes: Contacto[] = [];
  selectedMessage: Contacto | null = null;

  currentPage = 1;
  readonly pageSize = 10;

  constructor(
    private contactoService: ContactoService,
    private toastService: ToastService,
    private confirmService: ConfirmService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarTodo();
  }

  cargarTodo() {
    this.contactoService.getContactos().subscribe({
      next: (res) => {
        this.mensajes = res || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando mensajes:', err);
      }
    });
  }

  verDetalleMensaje(msg: Contacto) {
    this.selectedMessage = msg;
  }

  cerrarMensaje() {
    this.selectedMessage = null;
  }

  async eliminarMensaje(id: number) {
    const confirmed = await this.confirmService.confirm(
      '¿Está seguro de que desea eliminar este mensaje de contacto?',
      'Confirmar eliminación'
    );
    if (confirmed) {
      this.contactoService.eliminarContacto(id).subscribe({
        next: () => {
          this.toastService.show('Mensaje de contacto eliminado.', 'info');
          this.cerrarMensaje();
          this.cargarTodo();
        },
        error: (err) => console.error(err)
      });
    }
  }

  onPageChange(page: number) { this.currentPage = page; }

  filtrarLista(items: any[]): any[] {
    if (!this.searchQuery) return items;
    const q = this.searchQuery.toLowerCase();
    return items.filter(item =>
      item.nombre_completo.toLowerCase().includes(q) ||
      item.asunto.toLowerCase().includes(q) ||
      item.mensaje.toLowerCase().includes(q)
    );
  }

  pagedList(items: any[]): any[] {
    const filtered = this.filtrarLista(items);
    const start = (this.currentPage - 1) * this.pageSize;
    return filtered.slice(start, start + this.pageSize);
  }
}
