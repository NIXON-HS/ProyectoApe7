import { Investigador } from './investigador.model';

export interface Publicacion {
  id: number;
  titulo: string;
  resumen: string;
  resumen_json?: string | null;
  cita: string;
  revista_portada_url?: string;
  doi_url?: string;
  linea_id?: number;
  linea?: {
    id: number;
    nombre: string;
    descripcion: string;
    abreviatura: string;
  };
  investigadores?: Investigador[];
}
