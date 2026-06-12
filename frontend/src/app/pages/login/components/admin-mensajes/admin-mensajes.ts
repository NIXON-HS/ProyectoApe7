import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactoService } from '../../../../core/services/contacto.service';
import { ToastService } from '../../../../core/services/toast.service';
import { Contacto } from '../../../../core/models/contacto.model';

@Component({
  selector: 'app-admin-mensajes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-mensajes.html',
  styleUrls: ['./admin-mensajes.css']
})
export class AdminMensajesComponent implements OnInit {
  @Input() searchQuery = '';

  mensajes: Contacto[] = [];
  selectedMessage: Contacto | null = null;

  constructor(
    private contactoService: ContactoService,
    private toastService: ToastService,
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

  eliminarMensaje(id: number) {
    if (confirm('¿Está seguro de que desea eliminar este mensaje de contacto?')) {
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

  filtrarLista(items: any[]): any[] {
    if (!this.searchQuery) return items;
    const q = this.searchQuery.toLowerCase();
    
    return items.filter(item => {
      return item.nombre_completo.toLowerCase().includes(q) || 
             item.asunto.toLowerCase().includes(q) || 
             item.mensaje.toLowerCase().includes(q);
    });
  }
}
