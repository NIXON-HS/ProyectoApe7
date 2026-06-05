import { Investigador } from './investigador.model';

export interface Proyecto {
  id: number;
  titulo: string;
  descripcion: string;
  objetivos: string;
  resultados: string;
  descripcion_json?: string | null;
  objetivos_json?: string | null;
  resultados_json?: string | null;
  estado: 'Activo' | 'Finalizado' | 'Propuesta';
  linea_id: number;
  linea?: {
    id: number;
    nombre: string;
    descripcion: string;
    abreviatura: string;
  };
  investigadores?: Investigador[];
}
