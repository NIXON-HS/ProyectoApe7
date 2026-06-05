export interface Investigador {
  id: number;
  nombres: string;
  orcid?: string;
  correo_institucional: string;
  biografia: string;
  posicion: 'Director' | 'Subdirector' | 'Investigador';
  foto_url?: string;
  red_facebook?: string;
  red_linkedin?: string;
  red_instagram?: string;
  red_telegram?: string;
  proyectos?: any[];
  publicaciones?: any[];
  proyecto_investigador?: { rol_proyecto?: string };
  publicacion_investigador?: { rol_publicacion?: string };
}
