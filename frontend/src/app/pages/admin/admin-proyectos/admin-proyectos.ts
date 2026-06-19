import { Component, OnInit, Input, ViewChild, ChangeDetectorRef, NgZone, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ProyectoService } from '../../../core/services/proyecto.service';
import { InvestigadorService } from '../../../core/services/investigador.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { BlockEditorComponent, Block } from '../../../shared/block-editor/block-editor';
import { BlockRendererComponent } from '../../../shared/block-renderer/block-renderer';
import { PaginationComponent } from '../../../shared/pagination/pagination';
import { Proyecto } from '../../../core/models/proyecto.model';
import { Investigador } from '../../../core/models/investigador.model';
import { SolicitudService } from '../../../core/services/solicitud.service';

@Component({
  selector: 'app-admin-proyectos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, BlockEditorComponent, BlockRendererComponent, PaginationComponent],
  templateUrl: './admin-proyectos.html',
  styleUrls: ['./admin-proyectos.css']
})
export class AdminProyectosComponent implements OnInit {
  @Input() searchQuery = '';
  @Input() set action(val: string) {
    if (val === 'nuevo') {
      this.nuevoProyecto();
      this.actionReset.emit();
    }
  }
  @Output() actionReset = new EventEmitter<void>();

  usuario: any = null;
  proyectos: Proyecto[] = [];
  investigadores: Investigador[] = [];

  filterEstado = '';
  filterLinea = 0;
  currentPage = 1;
  readonly pageSize = 10;

  showForm = false;
  editMode = false;
  activeRecordId: number | null = null;
  isSubmitting = false;
  
  proyectoForm!: FormGroup;
  proyectoModoFlexible = false;
  proyVistaPrevia = false;

  proyDescBlocks: Block[] = [];
  proyObjBlocks: Block[] = [];
  proyResBlocks: Block[] = [];

  defaultAvatar = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23e2e8f0"/><path d="M50 50 A 15 15 0 1 0 50 20 A 15 15 0 1 0 50 50 Z M50 60 C 30 60 20 75 20 90 L 80 90 C 80 75 70 60 50 60 Z" fill="%2394a3b8"/></svg>';

  lineasDeInvestigacion = [
    { id: 1, nombre: 'Diseño, Materiales, Producción, Identidad, Sostenibilidad y Tecnologías aplicadas', abreviatura: 'DMP-IST' },
    { id: 2, nombre: 'Software, Tecnologías de la Información y Ciencias de Datos', abreviatura: 'ST-ICD' },
    { id: 3, nombre: 'Energía, Desarrollo Sostenible y Gestión de Recursos Naturales', abreviatura: 'ED-SGRN' }
  ];

  @ViewChild('editorDesc') editorDesc?: BlockEditorComponent;
  @ViewChild('editorObj') editorObj?: BlockEditorComponent;
  @ViewChild('editorRes') editorRes?: BlockEditorComponent;

  constructor(
    private fb: FormBuilder,
    private proyectoService: ProyectoService,
    private investigadorService: InvestigadorService,
    private authService: AuthService,
    private toastService: ToastService,
    private confirmService: ConfirmService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private solicitudService: SolicitudService
  ) {}

  ngOnInit() {
    this.usuario = this.authService.getUsuarioActual();
    this.cargarTodo();
    this.initProyectoForm();
  }

  cargarTodo() {
    this.investigadorService.getInvestigadores().subscribe({
      next: (list) => {
        this.investigadores = list;
        this.cdr.detectChanges();
      }
    });

    this.proyectoService.getProyectos().subscribe({
      next: (data) => {
        const esAdmin = this.usuario?.rol === 'admin';
        const correoUsuario = this.usuario?.correo?.toLowerCase();
        
        this.proyectos = esAdmin ? data : data.filter(p =>
          p.investigadores?.some((i: any) => i.correo_institucional?.toLowerCase() === correoUsuario)
        );
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando proyectos:', err);
      }
    });
  }

  initProyectoForm(data?: Proyecto) {
    const currentInvIds = data?.investigadores?.map(i => i.id) || [];

    this.proyectoForm = this.fb.group({
      titulo: [data?.titulo || '', [Validators.required]],
      descripcion: [data?.descripcion || ''],
      objetivos: [data?.objetivos || ''],
      resultados: [data?.resultados || ''],
      estado: [data?.estado || 'Activo', [Validators.required]],
      linea_id: [data?.linea_id || 1, [Validators.required]],
      investigadores: [currentInvIds]
    });

    this.proyectoModoFlexible = !!(data?.descripcion_json);
    this.proyDescBlocks = this.parseBlocks(data?.descripcion_json, data?.descripcion);
    this.proyObjBlocks = this.parseBlocks(data?.objetivos_json, data?.objetivos);
    this.proyResBlocks = this.parseBlocks(data?.resultados_json, data?.resultados);
  }

  nuevoProyecto() {
    this.editMode = false;
    this.activeRecordId = null;
    this.initProyectoForm();
    this.showForm = false;
    this.ngZone.run(() => { this.showForm = true; this.cdr.detectChanges(); });
  }

  editarProyecto(proj: Proyecto) {
    this.editMode = true;
    this.activeRecordId = proj.id;
    this.initProyectoForm(proj);
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

  get proyDescJSON() { return JSON.stringify(this.proyDescBlocks); }
  get proyObjJSON() { return JSON.stringify(this.proyObjBlocks); }
  get proyResJSON() { return JSON.stringify(this.proyResBlocks); }

  toggleProyectoInvestigador(id: number) {
    const control = this.proyectoForm.get('investigadores');
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

  isProyectoInvestigadorSelected(id: number): boolean {
    const control = this.proyectoForm?.get('investigadores');
    return control ? (control.value || []).includes(id) : false;
  }

  guardarProyecto() {
    if (this.proyectoForm.invalid) return;
    this.isSubmitting = true;

    let descripcion: string, objetivos: string, resultados: string;
    let descBlocks: Block[], objBlocks: Block[], resBlocks: Block[];

    if (this.proyectoModoFlexible) {
      descBlocks = this.editorDesc?.getBlocks() ?? this.proyDescBlocks;
      objBlocks = this.editorObj?.getBlocks() ?? this.proyObjBlocks;
      resBlocks = this.editorRes?.getBlocks() ?? this.proyResBlocks;
      descripcion = this.blocksToText(descBlocks) || ' ';
      objetivos = this.blocksToText(objBlocks) || ' ';
      resultados = this.blocksToText(resBlocks) || ' ';
    } else {
      descripcion = this.proyectoForm.get('descripcion')?.value || ' ';
      objetivos = this.proyectoForm.get('objetivos')?.value || ' ';
      resultados = this.proyectoForm.get('resultados')?.value || ' ';
      descBlocks = this.textToBlocks(descripcion);
      objBlocks = this.textToBlocks(objetivos);
      resBlocks = this.textToBlocks(resultados);
    }

    const val = {
      ...this.proyectoForm.value,
      descripcion,
      objetivos,
      resultados,
      descripcion_json: JSON.stringify(descBlocks),
      objetivos_json: JSON.stringify(objBlocks),
      resultados_json: JSON.stringify(resBlocks),
    };

    if (this.editMode && this.activeRecordId) {
      this.proyectoService.actualizarProyecto(this.activeRecordId, val).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.toastService.show('Proyecto actualizado exitosamente.', 'success');
          this.cargarTodo();
          this.cancelForm();
          this.solicitudService.triggerRefreshCount();
        },
        error: () => {
          this.isSubmitting = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.proyectoService.crearProyecto(val).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.toastService.show('Proyecto registrado exitosamente.', 'success');
          this.cargarTodo();
          this.cancelForm();
          this.solicitudService.triggerRefreshCount();
        },
        error: () => {
          this.isSubmitting = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  async eliminarProyecto(id: number, titulo: string) {
    const confirmed = await this.confirmService.confirm(
      `¿Está seguro de que desea eliminar el proyecto "${titulo}"?`,
      'Confirmar eliminación'
    );
    if (confirmed) {
      this.proyectoService.eliminarProyecto(id).subscribe({
        next: () => {
          this.toastService.show('Proyecto eliminado.', 'info');
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
    this.proyVistaPrevia = false;
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

  onFilterChange() { this.currentPage = 1; }
  onPageChange(page: number) { this.currentPage = page; }

  filtrarLista(items: any[]): any[] {
    let result = items;
    if (this.filterEstado) result = result.filter(i => i.estado === this.filterEstado);
    if (this.filterLinea) result = result.filter(i => i.linea_id === this.filterLinea);
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(i =>
        i.titulo.toLowerCase().includes(q) ||
        (i.descripcion && i.descripcion.toLowerCase().includes(q)) ||
        (i.resultados && i.resultados.toLowerCase().includes(q))
      );
    }
    return result;
  }

  pagedList(items: any[]): any[] {
    const filtered = this.filtrarLista(items);
    const start = (this.currentPage - 1) * this.pageSize;
    return filtered.slice(start, start + this.pageSize);
  }
}
