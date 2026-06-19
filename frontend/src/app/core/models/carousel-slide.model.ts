export interface CarouselSlide {
  id?: number;
  tipo?: 'standard' | 'brand' | null;
  titulo?: string | null;
  subtitulo?: string | null;
  descripcion?: string | null;
  imagen_url?: string | null;
  enlace?: string | null;
  boton1_texto?: string | null;
  boton2_texto?: string | null;
  boton2_url?: string | null;
  color_overlay?: string | null;
  alineacion?: 'left' | 'center' | 'right' | null;
  texto_oscuro?: boolean | null;
  orden?: number;
  activo?: boolean;
  createdAt?: string;
}
