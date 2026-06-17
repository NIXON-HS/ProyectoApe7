import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InfoGrupoService } from '../../../core/services/info-grupo.service';
import { InvestigadorService } from '../../../core/services/investigador.service';
import { ToastService } from '../../../core/services/toast.service';
import { BlockEditorComponent, Block } from '../../../shared/block-editor/block-editor';
import { InfoGrupo } from '../../../core/models/info-grupo.model';

@Component({
  selector: 'app-admin-info',
  standalone: true,
  imports: [CommonModule, FormsModule, BlockEditorComponent],
  templateUrl: './admin-info.html',
  styleUrls: ['./admin-info.css']
})
export class AdminInfoComponent implements OnInit {
  /** Which section to show. 'all' = legacy full view. */
  @Input() section: 'all' | 'inicio' | 'proyectos' | 'publicaciones' | 'contacto' = 'all';

  infoGrupo: InfoGrupo = {};
  infoLoaded = false;
  isUploading = false;

  infoDescBlocks: Block[] = [];
  infoMisionBlocks: Block[] = [];
  infoObjGenBlocks: Block[] = [];
  infoObjEspBlocks: Block[] = [];

  infoDescModo = false;
  infoMisionModo = false;
  infoObjGenModo = false;
  infoObjEspModo = false;

  private readonly DEFAULTS = {
    logo_url: '/logo.svg',
    hero_badge:       'Universidad Técnica de Ambato',
    hero_titulo:      'Research in Engineering and Advanced Sustainable Operations,',
    hero_nombre:      'Nature, and Society',
    hero_subtitulo:   'Investigación innovadora desde la Facultad de Ingeniería en Sistemas, Electrónica e Industrial orientada a un futuro industrial verde y sostenible.',
    hero_cita:        'Investigación innovadora desde la Facultad de Ingeniería en Sistemas, Electrónica e Industrial orientada a un futuro industrial verde y sostenible.',
    hero_card_nombre: 'REASONS',
    hero_card_grupo:  'Grupo de Investigación UTA',
    descripcion: 'Impulsamos la excelencia en investigación multidisciplinaria uniendo la optimización de procesos industriales, el desarrollo tecnológico computacional, la armonía con la naturaleza y el beneficio de la sociedad.',
    mision: 'Generar, promover y difundir conocimiento científico y tecnológico de vanguardia e impacto multidisciplinario, articulando la ingeniería avanzada con procesos de sostenibilidad industrial y ambiental, para aportar con soluciones innovadoras a las problemáticas actuales de la naturaleza y el beneficio de la sociedad andina y global.',
    objetivo_general: 'Consolidarse como un grupo de investigación multidisciplinario líder y de referencia nacional e internacional en la optimización de sistemas productivos, desarrollo tecnológico sustentable y ciencia de datos, aportando soluciones eficientes y amigables con el medio ambiente aplicables a las dinámicas del sector industrial y social del país.',
    objetivos_especificos: 'Publicar artículos científicos de alta calidad en revistas indexadas internacionalmente (Scopus, WoS).\nDesarrollar proyectos piloto conjuntos con industrias metalmecánicas, textiles y ambientales de la región.\nFormar investigadores jóvenes de pregrado y posgrado mediante la tutoría de tesis de excelencia.\nIntegrar hardware y software inteligente (IoT, AI) aplicados al desarrollo ecológico y optimización de recursos.',
    dominio: 'Optimización de los Sistemas Productivos, Diseño y Desarrollo Urbanístico de la Facultad de Ingeniería en Sistemas, Electrónica e Industrial de la Universidad Técnica de Ambato.',
    proyectos_badge: 'Investigación Aplicada',
    proyectos_titulo: 'Nuestros Proyectos de Investigación',
    proyectos_descripcion: 'Explore los proyectos científicos liderados por REASONS, desarrollados en colaboración con socios industriales e instituciones académicas nacionales.',
    publicaciones_badge: 'Producción Científica',
    publicaciones_titulo: 'Publicaciones Científicas',
    publicaciones_descripcion: 'Consulte los artículos científicos, ponencias y contribuciones de los investigadores de REASONS indexados en journals internacionales de alto impacto.',
    contacto_badge: 'Póngase en Contacto',
    contacto_titulo: 'Contacte con Nosotros',
    contacto_descripcion: '¿Tiene alguna consulta sobre nuestras líneas de investigación, proyectos o desea colaborar con nosotros? Complete el formulario y responderemos lo antes posible.',
    contacto_email: 'reasons@uta.edu.ec',
    contacto_telefono: '(03) 240-0200',
    contacto_direccion: 'Facultad de Ingeniería en Sistemas, Electrónica e Industrial. Av. de Los Chasquis y Av. Río Payamino. Universidad Técnica de Ambato.',
    equipo_badge: 'Talento Humano',
    equipo_titulo: 'Nuestro Equipo de Investigación',
    equipo_descripcion: 'Conoce a los científicos, ingenieros y expertos multidisciplinares que lideran el desarrollo sostenible y la innovación tecnológica avanzada en REASONS.',
  };

  constructor(
    private infoGrupoSvc: InfoGrupoService,
    private investigadorService: InvestigadorService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarInfoGrupo();
  }

  cargarInfoGrupo() {
    this.infoLoaded = false;
    this.infoGrupoSvc.getInfoGrupo().subscribe({
      next: (data) => {
        const d = this.DEFAULTS;
        this.infoGrupo = {
          logo_url:         data.logo_url         || d.logo_url,
          hero_badge:       data.hero_badge        || d.hero_badge,
          hero_titulo:      data.hero_titulo       || d.hero_titulo,
          hero_nombre:      data.hero_nombre       || d.hero_nombre,
          hero_subtitulo:   data.hero_subtitulo    || d.hero_subtitulo,
          hero_cita:        data.hero_cita         || d.hero_cita,
          hero_card_nombre: data.hero_card_nombre  || d.hero_card_nombre,
          hero_card_grupo:  data.hero_card_grupo   || d.hero_card_grupo,
          descripcion: data.descripcion || d.descripcion,
          descripcion_json: data.descripcion_json ?? null,
          mision: data.mision || d.mision,
          mision_json: data.mision_json ?? null,
          objetivo_general: data.objetivo_general || d.objetivo_general,
          objetivo_general_json: data.objetivo_general_json ?? null,
          objetivos_especificos: data.objetivos_especificos || d.objetivos_especificos,
          objetivos_especificos_json: data.objetivos_especificos_json ?? null,
          dominio: data.dominio || d.dominio,
          proyectos_badge: data.proyectos_badge || d.proyectos_badge,
          proyectos_titulo: data.proyectos_titulo || d.proyectos_titulo,
          proyectos_descripcion: data.proyectos_descripcion || d.proyectos_descripcion,
          publicaciones_badge: data.publicaciones_badge || d.publicaciones_badge,
          publicaciones_titulo: data.publicaciones_titulo || d.publicaciones_titulo,
          publicaciones_descripcion: data.publicaciones_descripcion || d.publicaciones_descripcion,
          contacto_badge: data.contacto_badge || d.contacto_badge,
          contacto_titulo: data.contacto_titulo || d.contacto_titulo,
          contacto_descripcion: data.contacto_descripcion || d.contacto_descripcion,
          contacto_email: data.contacto_email || d.contacto_email,
          contacto_telefono: data.contacto_telefono || d.contacto_telefono,
          contacto_direccion: data.contacto_direccion || d.contacto_direccion,
          equipo_badge: data.equipo_badge || d.equipo_badge,
          equipo_titulo: data.equipo_titulo || d.equipo_titulo,
          equipo_descripcion: data.equipo_descripcion || d.equipo_descripcion,
        };

        this.infoDescModo = !!(data.descripcion_json);
        this.infoMisionModo = !!(data.mision_json);
        this.infoObjGenModo = !!(data.objetivo_general_json);
        this.infoObjEspModo = !!(data.objetivos_especificos_json);

        this.infoDescBlocks = this.parseBlocks(data.descripcion_json, this.infoGrupo.descripcion || '');
        this.infoMisionBlocks = this.parseBlocks(data.mision_json, this.infoGrupo.mision || '');
        this.infoObjGenBlocks = this.parseBlocks(data.objetivo_general_json, this.infoGrupo.objetivo_general || '');
        this.infoObjEspBlocks = this.parseBlocks(data.objetivos_especificos_json, this.infoGrupo.objetivos_especificos || '');

        this.infoLoaded = true;
        this.cdr.detectChanges();
      },
      error: () => {
        this.infoLoaded = true;
        this.cdr.detectChanges();
      }
    });
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

  private buildField(flexible: boolean, blocks: Block[], plain: string) {
    if (flexible) {
      const p = this.blocksToText(blocks) || ' ';
      return { plain: p, json: JSON.stringify(blocks) };
    }
    return { plain: plain || ' ', json: JSON.stringify(this.textToBlocks(plain)) };
  }

  private saveInfo(payload: Partial<InfoGrupo>, label: string) {
    this.infoGrupoSvc.actualizarInfoGrupo(payload).subscribe({
      next: () => this.toastService.show(`${label} guardado correctamente.`, 'success'),
      error: () => this.toastService.show('Error al guardar.', 'error')
    });
  }

  onLogoFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && file.type !== 'image/svg+xml') {
      this.toastService.show('Solo se permiten imágenes (JPG, PNG, SVG, WEBP).', 'warning');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.toastService.show('El archivo no debe superar 5 MB.', 'warning');
      return;
    }

    this.isUploading = true;
    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = (reader.result as string).split(',')[1];
      this.investigadorService.subirFoto(file.name, base64Data).subscribe({
        next: (res: any) => {
          this.isUploading = false;
          if (res?.success) {
            this.infoGrupo.logo_url = res.url;
            this.cdr.detectChanges();
            this.toastService.show('Logo subido. Presiona "Guardar" para aplicar.', 'success');
          }
        },
        error: () => {
          this.isUploading = false;
          this.toastService.show('Error al subir el logo.', 'error');
        }
      });
    };
    reader.readAsDataURL(file);
  }

  guardarInfoGeneral() {
    const desc = this.buildField(this.infoDescModo, this.infoDescBlocks, this.infoGrupo.descripcion || '');
    const mision = this.buildField(this.infoMisionModo, this.infoMisionBlocks, this.infoGrupo.mision || '');
    const objGen = this.buildField(this.infoObjGenModo, this.infoObjGenBlocks, this.infoGrupo.objetivo_general || '');
    const objEsp = this.buildField(this.infoObjEspModo, this.infoObjEspBlocks, this.infoGrupo.objetivos_especificos || '');

    this.saveInfo({
      logo_url: this.infoGrupo.logo_url,
      dominio: this.infoGrupo.dominio,
      descripcion: desc.plain,
      descripcion_json: desc.json,
      mision: mision.plain,
      mision_json: mision.json,
      objetivo_general: objGen.plain,
      objetivo_general_json: objGen.json,
      objetivos_especificos: objEsp.plain,
      objetivos_especificos_json: objEsp.json,
    }, 'Información general');
  }

  guardarInfoProyectos() {
    this.saveInfo({
      proyectos_badge: this.infoGrupo.proyectos_badge,
      proyectos_titulo: this.infoGrupo.proyectos_titulo,
      proyectos_descripcion: this.infoGrupo.proyectos_descripcion,
    }, 'Página Proyectos');
  }

  guardarInfoPublicaciones() {
    this.saveInfo({
      publicaciones_badge: this.infoGrupo.publicaciones_badge,
      publicaciones_titulo: this.infoGrupo.publicaciones_titulo,
      publicaciones_descripcion: this.infoGrupo.publicaciones_descripcion,
    }, 'Página Publicaciones');
  }

  guardarInfoContacto() {
    this.saveInfo({
      contacto_badge: this.infoGrupo.contacto_badge,
      contacto_titulo: this.infoGrupo.contacto_titulo,
      contacto_descripcion: this.infoGrupo.contacto_descripcion,
      contacto_email: this.infoGrupo.contacto_email,
      contacto_telefono: this.infoGrupo.contacto_telefono,
      contacto_direccion: this.infoGrupo.contacto_direccion,
    }, 'Página Contacto');
  }

  guardarInfoEquipo() {
    this.saveInfo({
      equipo_badge: this.infoGrupo.equipo_badge,
      equipo_titulo: this.infoGrupo.equipo_titulo,
      equipo_descripcion: this.infoGrupo.equipo_descripcion,
    }, 'Página Equipo');
  }

  guardarInfoHero() {
    this.saveInfo({
      hero_badge:       this.infoGrupo.hero_badge,
      hero_titulo:      this.infoGrupo.hero_titulo,
      hero_nombre:      this.infoGrupo.hero_nombre,
      hero_subtitulo:   this.infoGrupo.hero_subtitulo,
      hero_cita:        this.infoGrupo.hero_cita,
      hero_card_nombre: this.infoGrupo.hero_card_nombre,
      hero_card_grupo:  this.infoGrupo.hero_card_grupo,
    }, 'Página Inicio (Hero)');
  }
}
