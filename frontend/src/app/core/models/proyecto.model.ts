import { Investigador } from './investigador.model';

export interface Proyecto {
  id: number;
  titulo: string;
  descripcion: string;
  objetivos: string;
  resultados: string;
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
