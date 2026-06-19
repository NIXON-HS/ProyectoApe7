import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { PaginationComponent } from '../../../shared/pagination/pagination';
import { InvestigadorService } from '../../../core/services/investigador.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { Investigador } from '../../../core/models/investigador.model';

@Component({
  selector: 'app-admin-investigadores',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, PaginationComponent],
  templateUrl: './admin-investigadores.html',
  styleUrls: ['./admin-investigadores.css']
})
export class AdminInvestigadoresComponent implements OnInit {
  @Input() searchQuery = '';

  investigadores: Investigador[] = [];

  // Filtros y paginación
  filterPosicion = '';
  currentPage = 1;
  readonly pageSize = 10;

  showForm = false;
  editMode = false;
  activeRecordId: number | null = null;
  isSubmitting = false;
  isUploading = false;
  uploadPreview: string | null = null;
  investigadorForm!: FormGroup;

  defaultAvatar = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23e2e8f0"/><path d="M50 50 A 15 15 0 1 0 50 20 A 15 15 0 1 0 50 50 Z M50 60 C 30 60 20 75 20 90 L 80 90 C 80 75 70 60 50 60 Z" fill="%2394a3b8"/></svg>';

  constructor(
    private fb: FormBuilder,
    private investigadorService: InvestigadorService,
    private toastService: ToastService,
    private confirmService: ConfirmService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarTodo();
    this.initInvestigadorForm();
  }

  cargarTodo() {
    this.investigadorService.getInvestigadores().subscribe({
      next: (data) => {
        this.investigadores = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando investigadores:', err);
      }
    });
  }

  initInvestigadorForm(data?: Investigador) {
    this.uploadPreview = null;
    this.investigadorForm = this.fb.group({
      nombres: [data?.nombres || '', [Validators.required, Validators.minLength(3)]],
      orcid: [data?.orcid || ''],
      correo_institucional: [data?.correo_institucional || '', [Validators.required, Validators.email]],
      biografia: [data?.biografia || '', [Validators.required, Validators.minLength(10)]],
      posicion: [data?.posicion || 'Investigador', [Validators.required]],
      foto_url: [data?.foto_url || ''],
      red_facebook: [data?.red_facebook || ''],
      red_linkedin: [data?.red_linkedin || ''],
      red_instagram: [data?.red_instagram || ''],
      red_telegram: [data?.red_telegram || '']
    });
  }

  nuevoInvestigador() {
    this.editMode = false;
    this.activeRecordId = null;
    this.initInvestigadorForm();
    this.showForm = true;
  }

  editarInvestigador(inv: Investigador) {
    this.editMode = true;
    this.activeRecordId = inv.id;
    this.initInvestigadorForm(inv);
    this.showForm = true;
  }

  guardarInvestigador() {
    if (this.investigadorForm.invalid) return;
    this.isSubmitting = true;
    const val = this.investigadorForm.value;

    if (this.editMode && this.activeRecordId) {
      this.investigadorService.actualizarInvestigador(this.activeRecordId, val).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.toastService.show('Investigador actualizado exitosamente.', 'success');
          this.cargarTodo();
          this.cancelForm();
        },
        error: () => {
          this.isSubmitting = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.investigadorService.crearInvestigador(val).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.toastService.show('Investigador registrado exitosamente.', 'success');
          this.cargarTodo();
          this.cancelForm();
        },
        error: () => {
          this.isSubmitting = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  async eliminarInvestigador(id: number, nombres: string) {
    const confirmed = await this.confirmService.confirm(
      `¿Está seguro de que desea eliminar a "${nombres}"? Esta acción no se puede deshacer.`,
      'Confirmar eliminación'
    );
    if (confirmed) {
      this.investigadorService.eliminarInvestigador(id).subscribe({
        next: () => {
          this.toastService.show('Investigador eliminado.', 'info');
          this.cargarTodo();
        },
        error: (err) => console.error(err)
      });
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.toastService.show('Por favor seleccione un archivo de imagen válido.', 'warning');
      return;
    }

    this.isUploading = true;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.uploadPreview = e.target.result as string;
      this.cdr.detectChanges();

      const base64Data = (e.target.result as string).split(',')[1];
      this.investigadorService.subirFoto(file.name, base64Data).subscribe({
        next: (res) => {
          this.isUploading = false;
          if (res && res.success) {
            this.investigadorForm.patchValue({ foto_url: res.url });
            this.cdr.detectChanges();
            this.toastService.show('¡Imagen de perfil subida y vinculada exitosamente!', 'success');
          }
        },
        error: (err) => {
          this.isUploading = false;
          this.cdr.detectChanges();
          console.error('Error al subir imagen:', err);
          this.toastService.show('Error al subir la imagen al servidor.', 'error');
        }
      });
    };
    reader.readAsDataURL(file);
  }

  cancelForm() {
    this.showForm = false;
    this.editMode = false;
    this.activeRecordId = null;
    this.uploadPreview = null;
  }

  obtenerFotoUrl(url: string | null | undefined): string {
    if (!url) return this.defaultAvatar;
    if (url.startsWith('data:image/')) return url;
    if (url.startsWith('assets/images/team/')) {
      return `http://127.0.0.1:3000/${url}`;
    }
    return url;
  }

  onFilterChange() { this.currentPage = 1; }
  onPageChange(page: number) { this.currentPage = page; }

  filtrarLista(items: any[]): any[] {
    let result = items;
    if (this.filterPosicion) result = result.filter(i => i.posicion === this.filterPosicion);
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(i => i.nombres?.toLowerCase().includes(q) || i.correo_institucional?.toLowerCase().includes(q));
    }
    return result;
  }

  pagedList(items: any[]): any[] {
    const filtered = this.filtrarLista(items);
    const start = (this.currentPage - 1) * this.pageSize;
    return filtered.slice(start, start + this.pageSize);
  }
}
