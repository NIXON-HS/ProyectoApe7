import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InfoGrupoService } from '../../core/services/info-grupo.service';
import { InfoGrupo, LineaInvestigacion } from '../../core/models/info-grupo.model';
import { BlockRendererComponent } from '../../shared/block-renderer/block-renderer';
import { AdminBarComponent } from '../../shared/admin-bar/admin-bar';
import { NoticiaService } from '../../core/services/noticia.service';
import { Noticia } from '../../core/models/noticia.model';
import { CarouselService } from '../../core/services/carousel.service';
import { CarouselSlide } from '../../core/models/carousel-slide.model';
import { environment } from '../../../environments/environment';

// Fallback constants (used while API loads or if no data saved yet)
const DEFAULT_MISION = 'Generar, promover y difundir conocimiento científico y tecnológico de vanguardia e impacto multidisciplinario, articulando la ingeniería avanzada con procesos de sostenibilidad industrial y ambiental, para aportar con soluciones innovadoras a las problemáticas actuales de la naturaleza y el beneficio de la sociedad andina y global.';
const DEFAULT_OBJETIVO = 'Consolidarse como un grupo de investigación multidisciplinario líder y de referencia nacional e internacional en la optimización de sistemas productivos, desarrollo tecnológico sustentable y ciencia de datos, aportando soluciones eficientes y amigables con el medio ambiente aplicables a las dinámicas del sector industrial y social del país.';
const DEFAULT_OBJETIVOS_ESP = '1. Publicar artículos científicos de alta calidad en revistas indexadas internacionalmente (Scopus, WoS).\n2. Desarrollar proyectos piloto conjuntos con industrias metalmecánicas, textiles y ambientales de la región.\n3. Formar investigadores jóvenes de pregrado y posgrado mediante la tutoría de tesis de excelencia.\n4. Integrar hardware y software inteligente (IoT, AI) aplicados al desarrollo ecológico y optimización de recursos.';
const DEFAULT_DOMINIO = 'Optimización de los Sistemas Productivos, Diseño y Desarrollo Urbanístico de la Facultad de Ingeniería en Sistemas, Electrónica e Industrial de la Universidad Técnica de Ambato.';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, BlockRendererComponent, AdminBarComponent],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  info: InfoGrupo | null = null;
  lineas: LineaInvestigacion[] = [];
  activeTab: 'mision' | 'general' | 'especificos' = 'mision';
  editMode = false;
  draft: InfoGrupo = {};

  // Carousel state
  slides: CarouselSlide[] = [];
  currentSlideIndex = 0;
  private slideIntervalId: any;

  // Noticias state
  noticias: Noticia[] = [];
  selectedNoticia: Noticia | null = null;
  currentNewsIndex = 0;

  // Expose defaults to template
  DEFAULT_MISION     = DEFAULT_MISION;
  DEFAULT_OBJETIVO   = DEFAULT_OBJETIVO;
  DEFAULT_OBJETIVOS_ESP = DEFAULT_OBJETIVOS_ESP;
  DEFAULT_DOMINIO    = DEFAULT_DOMINIO;

  private intervalId: any;
  private newsIntervalId: any;
  private tabs: ('mision' | 'general' | 'especificos')[] = ['mision', 'general', 'especificos'];

  constructor(
    private cdr: ChangeDetectorRef,
    private infoSvc: InfoGrupoService,
    private noticiaSvc: NoticiaService,
    private carouselSvc: CarouselService
  ) {}

  ngOnInit() {
    this.startRotation();
    this.cargarInfo();
    this.cargarNoticias();
    this.cargarSlides();
    this.infoSvc.contentUpdated$.subscribe(() => {
      this.cargarInfo();
      this.cargarNoticias();
    });
  }

  ngOnDestroy() {
    this.stopRotation();
    this.stopNewsRotation();
    this.stopSlideRotation();
  }

  cargarInfo() {
    this.infoSvc.getInfoGrupo().subscribe({
      next: (data) => { this.info = data; this.cdr.detectChanges(); },
      error: () => {}
    });
    this.infoSvc.getLineas().subscribe({
      next: (data) => { this.lineas = data; this.cdr.detectChanges(); },
      error: () => {}
    });
  }

  startRotation() {
    this.stopRotation();
    this.intervalId = setInterval(() => {
      const idx = this.tabs.indexOf(this.activeTab);
      this.activeTab = this.tabs[(idx + 1) % this.tabs.length];
      this.cdr.detectChanges();
    }, 5000);
  }

  stopRotation() { if (this.intervalId) clearInterval(this.intervalId); }

  selectTab(tab: 'mision' | 'general' | 'especificos') {
    this.activeTab = tab;
    this.cdr.detectChanges();
    this.startRotation();
  }

  startEdit() {
    this.draft = { ...this.info };
    // Pre-fill hero fields with their on-screen fallbacks so the user
    // only needs to edit what they want to change, not retype everything.
    if (!this.draft.hero_badge)        this.draft.hero_badge        = 'Universidad Técnica de Ambato';
    if (!this.draft.hero_titulo)       this.draft.hero_titulo       = 'Research in Engineering and Advanced Sustainable Operations,';
    if (!this.draft.hero_nombre)       this.draft.hero_nombre       = 'Nature, and Society';
    if (!this.draft.hero_subtitulo)    this.draft.hero_subtitulo    = this.info?.descripcion
      ?? 'Investigación innovadora desde la Facultad de Ingeniería en Sistemas, Electrónica e Industrial orientada a un futuro industrial verde y sostenible.';
    if (!this.draft.hero_cita)         this.draft.hero_cita         = 'Investigación innovadora desde la Facultad de Ingeniería en Sistemas, Electrónica e Industrial orientada a un futuro industrial verde y sostenible.';
    if (!this.draft.hero_card_nombre)  this.draft.hero_card_nombre  = 'REASONS';
    if (!this.draft.hero_card_grupo)   this.draft.hero_card_grupo   = 'Grupo de Investigación UTA';
    if (!this.draft.mision)              this.draft.mision              = this.info?.mision              ?? DEFAULT_MISION;
    if (!this.draft.objetivo_general)    this.draft.objetivo_general    = this.info?.objetivo_general    ?? DEFAULT_OBJETIVO;
    if (!this.draft.objetivos_especificos) this.draft.objetivos_especificos = this.info?.objetivos_especificos ?? DEFAULT_OBJETIVOS_ESP;
    if (!this.draft.dominio)             this.draft.dominio             = this.info?.dominio             ?? DEFAULT_DOMINIO;
    this.editMode = true;
  }
  cancelEdit() { this.editMode = false; this.draft = {}; }
  saveEdit() {
    this.infoSvc.actualizarInfoGrupo({
      // Hero
      hero_badge:              this.draft.hero_badge,
      hero_titulo:             this.draft.hero_titulo,
      hero_nombre:             this.draft.hero_nombre,
      hero_subtitulo:          this.draft.hero_subtitulo,
      hero_cita:               this.draft.hero_cita,
      hero_card_nombre:        this.draft.hero_card_nombre,
      hero_card_grupo:         this.draft.hero_card_grupo,
      // Misión / Objetivos / Dominio
      descripcion:             this.draft.descripcion,
      mision:                  this.draft.mision,
      objetivo_general:        this.draft.objetivo_general,
      objetivos_especificos:   this.draft.objetivos_especificos,
      dominio:                 this.draft.dominio,
    }).subscribe({ next: () => { this.editMode = false; this.infoSvc.notifyUpdate(); this.cargarInfo(); } });
  }

  // ── Carousel ────────────────────────────────────────────────────────────────
  cargarSlides() {
    this.carouselSvc.getSlides().subscribe({
      next: (data) => {
        this.slides = data;
        this.currentSlideIndex = 0;
        this.cdr.detectChanges();
        this.startSlideRotation();
      },
      error: () => {}
    });
  }

  startSlideRotation() {
    this.stopSlideRotation();
    if (this.slides.length <= 1) return;
    this.slideIntervalId = setInterval(() => { this.nextSlide(); }, 6000);
  }

  stopSlideRotation() {
    if (this.slideIntervalId) clearInterval(this.slideIntervalId);
  }

  prevSlide() {
    if (!this.slides.length) return;
    this.currentSlideIndex = (this.currentSlideIndex - 1 + this.slides.length) % this.slides.length;
    this.cdr.detectChanges();
    this.startSlideRotation();
  }

  nextSlide() {
    if (!this.slides.length) return;
    this.currentSlideIndex = (this.currentSlideIndex + 1) % this.slides.length;
    this.cdr.detectChanges();
    this.startSlideRotation();
  }

  selectSlide(index: number) {
    this.currentSlideIndex = index;
    this.cdr.detectChanges();
    this.startSlideRotation();
  }

  lineaIconBg(i: number): string {
    return ['bg-reasons-green/10', 'bg-reasons-blue/10', 'bg-reasons-green/10'][i % 3];
  }
  lineaIconColor(i: number): string {
    return ['text-reasons-green', 'text-reasons-blue', 'text-reasons-green'][i % 3];
  }

  cargarNoticias() {
    this.noticiaSvc.getNoticias().subscribe({
      next: (data) => {
        this.noticias = data.filter(n => n.activo);
        this.currentNewsIndex = 0;
        this.cdr.detectChanges();
        this.startNewsRotation();
      },
      error: () => {}
    });
  }

  startNewsRotation() {
    this.stopNewsRotation();
    if (this.noticias.length <= 1) return;
    this.newsIntervalId = setInterval(() => {
      this.nextNews();
    }, 6000);
  }

  stopNewsRotation() {
    if (this.newsIntervalId) clearInterval(this.newsIntervalId);
  }

  prevNews() {
    if (this.noticias.length === 0) return;
    this.currentNewsIndex = (this.currentNewsIndex - 1 + this.noticias.length) % this.noticias.length;
    this.cdr.detectChanges();
    this.startNewsRotation();
  }

  nextNews() {
    if (this.noticias.length === 0) return;
    this.currentNewsIndex = (this.currentNewsIndex + 1) % this.noticias.length;
    this.cdr.detectChanges();
    this.startNewsRotation();
  }

  selectNews(index: number) {
    this.currentNewsIndex = index;
    this.cdr.detectChanges();
    this.startNewsRotation();
  }

  verNoticia(noticia: Noticia) {
    this.selectedNoticia = noticia;
    this.stopNewsRotation();
    this.cdr.detectChanges();
  }

  cerrarNoticia() {
    this.selectedNoticia = null;
    this.startNewsRotation();
    this.cdr.detectChanges();
  }

  resolveUrl(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    return `${environment.apiUrl.replace('/api', '')}/${url}`;
  }
}
