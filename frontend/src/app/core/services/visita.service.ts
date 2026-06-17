import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface AnalyticsData {
  totalVisitas: number;
  visitasHoy: number;
  visitasAyer: number;
  visitasSemana: number;
  visitasMes: number;
  sesionesUnicas: number;
  usuariosUnicos: number;
  usuariosUnicosHoy: number;
  promedioDiario: number;
  avgDuration: number;
  bounceRate: number;
  paginasMasVistas: { page: string; count: string }[];
  visitasPorDia: { fecha: string; total: string }[];
  ultimasVisitas: { id: number; session_id: string; ip_address: string; page: string; createdAt: string }[];
  navegadores: { browser: string; count: string }[];
  dispositivos: { tipo: string; count: string }[];
}

@Injectable({
  providedIn: 'root'
})
export class VisitaService {
  private apiUrl = `${environment.apiUrl}/visitas`;

  constructor(private http: HttpClient) {}

  obtenerContador(): Observable<number> {
    return this.http.get<{ success: boolean; data: { contador: number } }>(this.apiUrl).pipe(
      map(response => response.data.contador)
    );
  }

  registrarVisita(sessionId: string, page: string): Observable<number> {
    return this.http.post<{ success: boolean; data: { contador: number } }>(`${this.apiUrl}/registrar`, { session_id: sessionId, page }).pipe(
      map(response => response.data.contador)
    );
  }

  obtenerAnalytics(): Observable<AnalyticsData> {
    return this.http.get<{ success: boolean; data: AnalyticsData }>(`${this.apiUrl}/analytics`).pipe(
      map(response => response.data)
    );
  }
}
