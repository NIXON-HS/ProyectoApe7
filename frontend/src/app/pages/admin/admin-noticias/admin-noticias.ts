import { Component, OnInit, Input, ViewChild, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NoticiaService } from '../../../core/services/noticia.service';
import { InvestigadorService } from '../../../core/services/investigador.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { BlockEditorComponent, Block } from '../../../shared/block-editor/block-editor';
import { Noticia } from '../../../core/models/noticia.model';

@Component({
  selector: 'app-admin-noticias',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, BlockEditorComponent],
  templateUrl: './admin-noticias.html',
  styleUrls: ['./admin-noticias.css']
})
export class AdminNoticiasComponent implements OnInit {
  @Input() searchQuery = '';

  noticias: Noticia[] = [];
  showForm = false;
  editMode = false;
  activeRecordId: number | null = null;
  isSubmitting = false;
  isUploading = false;
  uploadPreview: string | null = null;

  noticiaForm!: FormGroup;
  noticiaModoFlexible = false;
  noticiaVistaPrevia = false;

  noticiaDescBlocks: Block[] = [];

  defaultAvatar = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23e2e8f0"/><path d="M50 50 A 15 15 0 1 0 50 20 A 15 15 0 1 0 50 50 Z M50 60 C 30 60 20 75 20 90 L 80 90 C 80 75 70 60 50 60 Z" fill="%2394a3b8"/></svg>';

  @ViewChild('editorNoticia') editorNoticia?: BlockEditorComponent;

  constructor(
    private fb: FormBuilder,
    private noticiaService: NoticiaService,
    private investigadorService: InvestigadorService,
    private toastService: ToastService,
    private confirmService: ConfirmService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.cargarTodo();
    this.initForm();
  }

  cargarTodo() {
    this.noticiaService.getNoticias().subscribe({
      next: (data) => {
        this.noticias = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando noticias:', err);
      }
    });
  }

  initForm(data?: Noticia) {
    this.uploadPreview = null;
    this.noticiaForm = this.fb.group({
      titulo: [data?.titulo || '', [Validators.required]],
      resumen: [data?.resumen || '', [Validators.required]],
      contenido: [data?.contenido || ''],
      categoria: [data?.categoria || 'General', [Validators.required]],
      imagen_url: [data?.imagen_url || ''],
      activo: [data?.activo !== undefined ? data?.activo : true],
      fecha: [data?.fecha ? data.fecha.substring(0, 10) : new Date().toISOString().substring(0, 10)]
    });

    this.noticiaModoFlexible = !!(data?.contenido_json);
    this.noticiaDescBlocks = this.parseBlocks(data?.contenido_json, data?.contenido);
  }

  nuevaNoticia() {
    this.editMode = false;
    this.activeRecordId = null;
    this.initForm();
    this.showForm = false;
    this.ngZone.run(() => { this.showForm = true; this.cdr.detectChanges(); });
  }

  editarNoticia(noticia: Noticia) {
    this.editMode = true;
    this.activeRecordId = noticia.id;
    this.initForm(noticia);
    this.showForm = false;
    this.ngZone.run(() => { this.showForm = true; this.cdr.detectChanges(); });
  }

  parseBlocks(jsonStr?: string | null, plainText?: string): Block[] {
    if (jsonStr) {
      try { return JSON.parse(jsonStr); } catch { /* fall through */ }
    }
    if (plainText) {
      return [{ id: crypto.randomUUID(), type: 'paragraph', content: plainText }];
    }
    return [];
  }

  private textToBlocks(text: string): Block[] {
    const t = (text || '').trim();
    if (!t) return [];
    return [{ id: crypto.randomUUID(), type: 'paragraph', content: t }];
  }

  private blocksToText(blocks: Block[]): string {
    return blocks
      .filter(b => b.content)
      .map(b => {
        const d = document.createElement('div');
        d.innerHTML = b.content!;
        return d.textContent || '';
      })
      .join('\n');
  }

  guardarNoticia() {
    if (this.noticiaForm.invalid) return;
    this.isSubmitting = true;

    let contenido: string;
    let descBlocks: Block[];

    if (this.noticiaModoFlexible) {
      descBlocks = this.editorNoticia?.getBlocks() ?? this.noticiaDescBlocks;
      contenido = this.blocksToText(descBlocks) || ' ';
    } else {
      contenido = this.noticiaForm.get('contenido')?.value || ' ';
      descBlocks = this.textToBlocks(contenido);
    }

    const val = {
      ...this.noticiaForm.value,
      contenido,
      contenido_json: JSON.stringify(descBlocks),
    };

    if (this.editMode && this.activeRecordId) {
      this.noticiaService.actualizarNoticia(this.activeRecordId, val).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.toastService.show('Noticia actualizada exitosamente.', 'success');
          this.cargarTodo();
          this.cancelForm();
        },
        error: () => {
          this.isSubmitting = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.noticiaService.crearNoticia(val).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.toastService.show('Noticia registrada exitosamente.', 'success');
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

  async eliminarNoticia(id: number, titulo: string) {
    const confirmed = await this.confirmService.confirm(
      `¿Está seguro de que desea eliminar la noticia "${titulo}"?`,
      'Confirmar eliminación'
    );
    if (confirmed) {
      this.noticiaService.eliminarNoticia(id).subscribe({
        next: () => {
          this.toastService.show('Noticia eliminada.', 'info');
          this.cargarTodo();
        },
        error: (err) => console.error(err)
      });
    }
  }

  onNoticiaFileSelected(event: any) {
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
            this.noticiaForm.patchValue({ imagen_url: res.url });
            this.cdr.detectChanges();
            this.toastService.show('¡Imagen de portada subida exitosamente!', 'success');
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
    this.noticiaVistaPrevia = false;
  }

  obtenerFotoUrl(url: string | null | undefined): string {
    if (!url) return this.defaultAvatar;
    if (url.startsWith('data:image/')) return url;
    if (url.startsWith('assets/images/team/')) {
      return `http://127.0.0.1:3000/${url}`;
    }
    return url;
  }

  filtrarLista(items: any[]): any[] {
    if (!this.searchQuery) return items;
    const q = this.searchQuery.toLowerCase();
    
    return items.filter(item => {
      return item.titulo.toLowerCase().includes(q) || 
             (item.resumen && item.resumen.toLowerCase().includes(q)) || 
             (item.categoria && item.categoria.toLowerCase().includes(q));
    });
  }
}
