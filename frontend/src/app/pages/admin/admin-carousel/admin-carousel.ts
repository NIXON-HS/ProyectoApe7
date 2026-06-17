import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarouselService } from '../../../core/services/carousel.service';
import { InvestigadorService } from '../../../core/services/investigador.service';
import { ToastService } from '../../../core/services/toast.service';
import { CarouselSlide } from '../../../core/models/carousel-slide.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-carousel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-carousel.html',
  styleUrls: ['./admin-carousel.css']
})
export class AdminCarouselComponent implements OnInit {
  slides: CarouselSlide[] = [];
  isLoading = false;
  isUploading = false;

  showForm = false;
  editingId: number | null = null;
  pendingDelete: number | null = null;

  form: Partial<CarouselSlide> = this.emptyForm();

  constructor(
    private carouselSvc: CarouselService,
    private investigadorSvc: InvestigadorService,
    private toastSvc: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() { this.cargar(); }

  emptyForm(): Partial<CarouselSlide> {
    return { titulo: '', subtitulo: '', imagen_url: '', enlace: '', orden: 0, activo: true };
  }

  cargar() {
    this.isLoading = true;
    this.carouselSvc.getAllSlides().subscribe({
      next: (data) => { this.slides = data; this.isLoading = false; this.cdr.detectChanges(); },
      error: () => { this.isLoading = false; this.cdr.detectChanges(); }
    });
  }

  abrirNuevo() {
    this.editingId = null;
    this.form = this.emptyForm();
    this.showForm = true;
    this.cdr.detectChanges();
  }

  abrirEditar(slide: CarouselSlide) {
    this.editingId = slide.id ?? null;
    this.form = { ...slide };
    this.showForm = true;
    this.cdr.detectChanges();
  }

  cancelarForm() {
    this.showForm = false;
    this.editingId = null;
    this.form = this.emptyForm();
  }

  guardar() {
    if (this.editingId) {
      this.carouselSvc.actualizarSlide(this.editingId, this.form).subscribe({
        next: () => { this.toastSvc.show('Slide actualizado.', 'success'); this.cancelarForm(); this.cargar(); },
        error: () => this.toastSvc.show('Error al actualizar.', 'error')
      });
    } else {
      this.carouselSvc.crearSlide(this.form).subscribe({
        next: () => { this.toastSvc.show('Slide creado.', 'success'); this.cancelarForm(); this.cargar(); },
        error: () => this.toastSvc.show('Error al crear.', 'error')
      });
    }
  }

  toggleActivo(slide: CarouselSlide) {
    this.carouselSvc.actualizarSlide(slide.id!, { activo: !slide.activo }).subscribe({
      next: () => { slide.activo = !slide.activo; this.cdr.detectChanges(); },
      error: () => this.toastSvc.show('Error al cambiar estado.', 'error')
    });
  }

  moverArriba(i: number) {
    if (i === 0) return;
    const a = this.slides[i - 1], b = this.slides[i];
    const oa = a.orden ?? i - 1, ob = b.orden ?? i;
    this.carouselSvc.actualizarSlide(a.id!, { orden: ob }).subscribe();
    this.carouselSvc.actualizarSlide(b.id!, { orden: oa }).subscribe({
      next: () => this.cargar()
    });
  }

  moverAbajo(i: number) {
    if (i === this.slides.length - 1) return;
    const a = this.slides[i], b = this.slides[i + 1];
    const oa = a.orden ?? i, ob = b.orden ?? i + 1;
    this.carouselSvc.actualizarSlide(a.id!, { orden: ob }).subscribe();
    this.carouselSvc.actualizarSlide(b.id!, { orden: oa }).subscribe({
      next: () => this.cargar()
    });
  }

  confirmarEliminar(id: number) { this.pendingDelete = id; this.cdr.detectChanges(); }
  cancelarEliminar() { this.pendingDelete = null; }

  eliminar(id: number) {
    this.carouselSvc.eliminarSlide(id).subscribe({
      next: () => { this.toastSvc.show('Slide eliminado.', 'success'); this.pendingDelete = null; this.cargar(); },
      error: () => this.toastSvc.show('Error al eliminar.', 'error')
    });
  }

  onImagenFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { this.toastSvc.show('Solo se permiten imágenes.', 'warning'); return; }
    if (file.size > 8 * 1024 * 1024) { this.toastSvc.show('La imagen no debe superar 8 MB.', 'warning'); return; }

    this.isUploading = true;
    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = (reader.result as string).split(',')[1];
      this.investigadorSvc.subirFoto(file.name, base64Data).subscribe({
        next: (res: any) => {
          this.isUploading = false;
          if (res?.success) { this.form.imagen_url = res.url; this.cdr.detectChanges(); }
        },
        error: () => { this.isUploading = false; this.toastSvc.show('Error al subir imagen.', 'error'); }
      });
    };
    reader.readAsDataURL(file);
  }

  resolveUrl(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('/')) return url;
    return `${environment.apiUrl.replace('/api', '')}/${url}`;
  }
}
