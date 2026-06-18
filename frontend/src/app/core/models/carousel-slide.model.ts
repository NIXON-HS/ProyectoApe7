export interface CarouselSlide {
  id?: number;
  titulo?: string | null;
  subtitulo?: string | null;
  imagen_url?: string | null;
  enlace?: string | null;
  orden?: number;
  activo?: boolean;
  createdAt?: string;
}
