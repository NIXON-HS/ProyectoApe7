import { Component, OnInit, Input, ViewChild, ChangeDetectorRef, NgZone, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { PublicacionService } from '../../../../core/services/publicacion.service';
import { InvestigadorService } from '../../../../core/services/investigador.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { BlockEditorComponent, Block } from '../../../../shared/block-editor/block-editor';
import { BlockRendererComponent } from '../../../../shared/block-renderer/block-renderer';
import { Publicacion } from '../../../../core/models/publicacion.model';
import { Investigador } from '../../../../core/models/investigador.model';

@Component({
  selector: 'app-admin-publicaciones',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, BlockEditorComponent, BlockRendererComponent],
  templateUrl: './admin-publicaciones.html',
  styleUrls: ['./admin-publicaciones.css']
})
export class AdminPublicacionesComponent implements OnInit {
  @Input() searchQuery = '';
  @Input() set action(val: string) {
    if (val === 'nuevo') {
      this.nuevaPublicacion();
      this.actionReset.emit();
    }
  }
  @Output() actionReset = new EventEmitter<void>();

  usuario: any = null;
  publicaciones: Publicacion[] = [];
  investigadores: Investigador[] = [];

  showForm = false;
  editMode = false;
  activeRecordId: number | null = null;
  isSubmitting = false;

  publicacionForm!: FormGroup;
  pubModoFlexible = false;
  pubVistaPrevia = false;

  pubResumenBlocks: Block[] = [];

  defaultAvatar = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23e2e8f0"/><path d="M50 50 A 15 15 0 1 0 50 20 A 15 15 0 1 0 50 50 Z M50 60 C 30 60 20 75 20 90 L 80 90 C 80 75 70 60 50 60 Z" fill="%2394a3b8"/></svg>';

  lineasDeInvestigacion = [
    { id: 1, nombre: 'Diseño, Materiales, Producción, Identidad, Sostenibilidad y Tecnologías aplicadas', abreviatura: 'DMP-IST' },
    { id: 2, nombre: 'Software, Tecnologías de la Información y Ciencias de Datos', abreviatura: 'ST-ICD' },
    { id: 3, nombre: 'Energía, Desarrollo Sostenible y Gestión de Recursos Naturales', abreviatura: 'ED-SGRN' }
  ];

  @ViewChild('editorResumen') editorResumen?: BlockEditorComponent;

  constructor(
    private fb: FormBuilder,
    private publicacionService: PublicacionService,
    private investigadorService: InvestigadorService,
    private authService: AuthService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.usuario = this.authService.getUsuarioActual();
    this.cargarTodo();
    this.initPublicacionForm();
  }

  cargarTodo() {
    this.investigadorService.getInvestigadores().subscribe({
      next: (list) => {
        this.investigadores = list;
        this.cdr.detectChanges();
      }
    });

    this.publicacionService.getPublicaciones().subscribe({
      next: (data) => {
        const esAdmin = this.usuario?.rol === 'admin';
        const correoUsuario = this.usuario?.correo?.toLowerCase();
        
        this.publicaciones = esAdmin ? data : data.filter((p: any) =>
          p.investigadores?.some((i: any) => i.correo_institucional?.toLowerCase() === correoUsuario)
        );
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando publicaciones:', err);
      }
    });
  }

  initPublicacionForm(data?: Publicacion) {
    const currentInvIds = data?.investigadores?.map(i => i.id) || [];

    this.publicacionForm = this.fb.group({
      titulo: [data?.titulo || '', [Validators.required]],
      resumen: [data?.resumen || ''],
      cita: [data?.cita || '', [Validators.required]],
      revista_portada_url: [data?.revista_portada_url || ''],
      doi_url: [data?.doi_url || ''],
      linea_id: [data?.linea_id || 1, [Validators.required]],
      investigadores: [currentInvIds]
    });

    this.pubModoFlexible = !!(data?.resumen_json);
    this.pubResumenBlocks = this.parseBlocks(data?.resumen_json, data?.resumen);
  }

  nuevaPublicacion() {
    this.editMode = false;
    this.activeRecordId = null;
    this.initPublicacionForm();
    this.showForm = false;
    this.ngZone.run(() => { this.showForm = true; this.cdr.detectChanges(); });
  }

  editarPublicacion(pub: Publicacion) {
    this.editMode = true;
    this.activeRecordId = pub.id;
    this.initPublicacionForm(pub);
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

  get pubResumenJSON() { return JSON.stringify(this.pubResumenBlocks); }

  togglePublicacionInvestigador(id: number) {
    const control = this.publicacionForm.get('investigadores');
    if (!control) return;
    const current = [...(control.value || [])];
    const idx = current.indexOf(id);
    if (idx > -1) {
      current.splice(idx, 1);
    } else {
      current.push(id);
    }
    control.setValue(current);
    this.cdr.detectChanges();
  }

  isPublicacionInvestigadorSelected(id: number): boolean {
    const control = this.publicacionForm?.get('investigadores');
    return control ? (control.value || []).includes(id) : false;
  }

  generarCitaAPA() {
    const titulo = this.publicacionForm.get('titulo')?.value || '[Título]';
    const doi = this.publicacionForm.get('doi_url')?.value || '';
    
    const seleccionados = this.publicacionForm.get('investigadores')?.value || [];
    let autoresStr = 'Reasons, G.';
    
    if (seleccionados.length > 0) {
      const apellidos = this.investigadores
        .filter(i => seleccionados.includes(i.id))
        .map(i => {
          const partes = i.nombres.split(' ');
          const apellido = partes[partes.length - 2] || partes[0];
          const inicial = partes[0] ? partes[0].charAt(0) : 'I';
          return `${apellido}, ${inicial}.`;
        });
      
      if (apellidos.length === 1) {
        autoresStr = apellidos[0];
      } else if (apellidos.length > 1) {
        const last = apellidos.pop();
        autoresStr = `${apellidos.join(', ')} & ${last}`;
      }
    }

    const anio = new Date().getFullYear();
    const citaGenerada = `${autoresStr} (${anio}). ${titulo}. Revista Técnica de Ingeniería UTA. ${doi ? `Obtenido de ${doi}` : ''}`;
    this.publicacionForm.get('cita')?.setValue(citaGenerada);
    this.toastService.show('Cita APA generada automáticamente.', 'info');
  }

  copiarCitaAlPortapapeles() {
    const cita = this.publicacionForm.get('cita')?.value;
    if (!cita) {
      this.toastService.show('Primero debes generar la cita APA.', 'warning');
      return;
    }
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(cita).then(() => {
        this.toastService.show('¡Cita APA copiada al portapapeles exitosamente!', 'success');
      }).catch(() => {
        this.toastService.show('Error al copiar cita. Por favor selecciona el texto manualmente.', 'error');
      });
    } else {
      this.toastService.show('El navegador no soporta el copiado automático.', 'error');
    }
  }

  guardarPublicacion() {
    if (this.publicacionForm.invalid) return;
    this.isSubmitting = true;

    let resumen: string, resumenBlocks: Block[];

    if (this.pubModoFlexible) {
      resumenBlocks = this.editorResumen?.getBlocks() ?? this.pubResumenBlocks;
      resumen = this.blocksToText(resumenBlocks) || ' ';
    } else {
      resumen = this.publicacionForm.get('resumen')?.value || ' ';
      resumenBlocks = this.textToBlocks(resumen);
    }

    const val = {
      ...this.publicacionForm.value,
      resumen,
      resumen_json: JSON.stringify(resumenBlocks),
    };

    if (this.editMode && this.activeRecordId) {
      this.publicacionService.actualizarPublicacion(this.activeRecordId, val).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.toastService.show('Publicación científica actualizada.', 'success');
          this.cargarTodo();
          this.cancelForm();
        },
        error: () => {
          this.isSubmitting = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.publicacionService.crearPublicacion(val).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.toastService.show('Publicación científica registrada.', 'success');
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

  eliminarPublicacion(id: number, titulo: string) {
    if (confirm(`¿Está seguro de que desea eliminar la publicación "${titulo}"?`)) {
      this.publicacionService.eliminarPublicacion(id).subscribe({
        next: () => {
          this.toastService.show('Publicación eliminada.', 'info');
          this.cargarTodo();
        },
        error: (err) => console.error(err)
      });
    }
  }

  cancelForm() {
    this.showForm = false;
    this.editMode = false;
    this.activeRecordId = null;
    this.pubVistaPrevia = false;
  }

  obtenerFotoUrl(url: string | null | undefined): string {
    if (!url) return this.defaultAvatar;
    if (url.startsWith('data:image/')) return url;
    if (url.startsWith('assets/images/team/')) {
      return `http://127.0.0.1:3000/${url}`;
    }
    return url;
  }

  getAbreviaturaLinea(lineaId: number): string {
    const l = this.lineasDeInvestigacion.find(x => x.id === lineaId);
    return l ? l.abreviatura : 'N/A';
  }

  filtrarLista(items: any[]): any[] {
    if (!this.searchQuery) return items;
    const q = this.searchQuery.toLowerCase();
    
    return items.filter(item => {
      return item.titulo.toLowerCase().includes(q) || 
             (item.resumen && item.resumen.toLowerCase().includes(q)) ||
             (item.cita && item.cita.toLowerCase().includes(q));
    });
  }
}
