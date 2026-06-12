export interface Noticia {
  id: number;
  titulo: string;
  resumen: string;
  contenido: string;
  contenido_json?: string | null;
  imagen_url?: string | null;
  fecha: string;
  categoria: string;
  activo: boolean;
}
