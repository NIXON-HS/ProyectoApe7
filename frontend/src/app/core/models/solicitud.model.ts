export interface Solicitud {
  id?: number;
  usuario_id: number;
  tipo: 'proyecto' | 'publicacion';
  accion: 'crear' | 'editar';
  registro_id?: number;
  datos_nuevos: string; // JSON string
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  motivo_rechazo?: string;
  creado_en?: string;
  procesado_en?: string;
  usuario?: {
    id: number;
    nombres: string;
    correo: string;
    rol: string;
  };
}
