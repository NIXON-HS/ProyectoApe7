import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { InfoGrupoService } from '../../../core/services/info-grupo.service';
import { ToastService } from '../../../core/services/toast.service';
import { BlockEditorComponent, Block } from '../../../shared/block-editor/block-editor';
import { PaginationComponent } from '../../../shared/pagination/pagination';
import { LineaInvestigacion } from '../../../core/models/info-grupo.model';

@Component({
  selector: 'app-admin-lineas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, BlockEditorComponent, PaginationComponent],
  templateUrl: './admin-lineas.html',
  styleUrls: ['./admin-lineas.css']
})
export class AdminLineasComponent implements OnInit {
  lineasAdmin: LineaInvestigacion[] = [];
  lineaEditando: LineaInvestigacion | null = null;

  searchQuery = '';
  currentPage = 1;
  readonly pageSize = 10;
  lineaForm!: FormGroup;
  lineaModoFlexible = false;
  lineaDescBlocks: Block[] = [];
  showLineaForm = false;
  lineaPendienteEliminar: LineaInvestigacion | null = null;

  constructor(
    private fb: FormBuilder,
    private infoGrupoSvc: InfoGrupoService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.cargarLineas();
    this.initForm();
  }

  cargarLineas() {
    this.infoGrupoSvc.getLineas().subscribe({
      next: (data) => {
        this.lineasAdmin = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando líneas:', err);
      }
    });
  }

  initForm(data?: LineaInvestigacion) {
    this.lineaForm = this.fb.group({
      nombre: [data?.nombre || '', [Validators.required]],
      abreviatura: [data?.abreviatura || '', [Validators.required]],
      descripcion: [data?.descripcion || '']
    });
  }

  nuevaLinea() {
    this.lineaEditando = null;
    this.lineaModoFlexible = false;
    this.lineaDescBlocks = [];
    this.initForm();
    this.showLineaForm = false;
    this.ngZone.run(() => { this.showLineaForm = true; this.cdr.detectChanges(); });
  }

  editarLinea(linea: LineaInvestigacion) {
    this.lineaEditando = linea;
    this.lineaModoFlexible = !!(linea.descripcion_larga_json);
    this.lineaDescBlocks = this.parseBlocks(linea.descripcion_larga_json, linea.descripcion_larga || linea.descripcion);
    this.initForm(linea);
    this.showLineaForm = false;
    this.ngZone.run(() => { this.showLineaForm = true; this.cdr.detectChanges(); });
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

  guardarLinea() {
    if (this.lineaForm.invalid) return;

    let descripcion_larga: string, descripcion_larga_json: string;
    if (this.lineaModoFlexible) {
      descripcion_larga = this.blocksToText(this.lineaDescBlocks) || ' ';
      descripcion_larga_json = JSON.stringify(this.lineaDescBlocks);
    } else {
      descripcion_larga = this.lineaForm.get('descripcion')?.value || ' ';
      descripcion_larga_json = JSON.stringify(this.textToBlocks(descripcion_larga));
    }

    const payload: Partial<LineaInvestigacion> = {
      ...this.lineaForm.value,
      descripcion: this.lineaForm.get('descripcion')?.value || ' ',
      descripcion_larga,
      descripcion_larga_json
    };

    const req$ = this.lineaEditando?.id
      ? this.infoGrupoSvc.actualizarLinea(this.lineaEditando.id, payload)
      : this.infoGrupoSvc.crearLinea(payload);

    req$.subscribe({
      next: () => {
        this.toastService.show(this.lineaEditando ? 'Línea actualizada.' : 'Línea creada.', 'success');
        this.showLineaForm = false;
        this.cargarLineas();
      },
      error: () => this.toastService.show('Error al guardar la línea.', 'error')
    });
  }

  onSearchChange() { this.currentPage = 1; }
  onPageChange(page: number) { this.currentPage = page; }

  filtrarLineas(): LineaInvestigacion[] {
    if (!this.searchQuery) return this.lineasAdmin;
    const q = this.searchQuery.toLowerCase();
    return this.lineasAdmin.filter(l =>
      l.nombre.toLowerCase().includes(q) ||
      l.abreviatura.toLowerCase().includes(q) ||
      (l.descripcion && l.descripcion.toLowerCase().includes(q))
    );
  }

  pagedList(items: any[]): any[] {
    const filtered = this.filtrarLineas();
    const start = (this.currentPage - 1) * this.pageSize;
    return filtered.slice(start, start + this.pageSize);
  }

  eliminarLinea(linea: LineaInvestigacion) {
    this.lineaPendienteEliminar = linea;
  }

  confirmarEliminarLinea() {
    const linea = this.lineaPendienteEliminar;
    if (!linea?.id) return;
    this.lineaPendienteEliminar = null;
    this.infoGrupoSvc.eliminarLinea(linea.id).subscribe({
      next: () => {
        this.toastService.show('Línea eliminada.', 'info');
        this.cargarLineas();
      },
      error: (err) => {
        const msg = err?.error?.message || 'No se pudo eliminar la línea.';
        this.toastService.show(msg, 'error');
      }
    });
  }
}
