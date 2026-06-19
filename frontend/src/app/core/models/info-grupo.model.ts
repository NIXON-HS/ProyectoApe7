export interface InfoGrupo {
  id?: number;
  logo_url?: string | null;

  hero_badge?:    string | null;
  hero_titulo?:   string | null;
  hero_nombre?:   string | null;
  hero_subtitulo?: string | null;
  hero_cita?:     string | null;

  hero_card_nombre?: string | null;
  hero_card_grupo?:  string | null;

  descripcion?: string | null;
  descripcion_json?: string | null;
  mision?: string | null;
  mision_json?: string | null;
  objetivo_general?: string | null;
  objetivo_general_json?: string | null;
  objetivos_especificos?: string | null;
  objetivos_especificos_json?: string | null;
  dominio?: string | null;

  proyectos_badge?:       string | null;
  proyectos_titulo?:      string | null;
  proyectos_descripcion?: string | null;

  publicaciones_badge?:       string | null;
  publicaciones_titulo?:      string | null;
  publicaciones_descripcion?: string | null;

  contacto_badge?:       string | null;
  contacto_titulo?:      string | null;
  contacto_descripcion?: string | null;
  contacto_email?:       string | null;
  contacto_telefono?:    string | null;
  contacto_direccion?:   string | null;

  noticias_badge?:       string | null;
  noticias_titulo?:      string | null;
  noticias_descripcion?: string | null;

  equipo_badge?:        string | null;
  equipo_titulo?:       string | null;
  equipo_descripcion?:  string | null;
}

export interface LineaInvestigacion {
  id?: number;
  nombre: string;
  abreviatura: string;
  descripcion: string;
  descripcion_larga?: string | null;
  descripcion_larga_json?: string | null;
}
