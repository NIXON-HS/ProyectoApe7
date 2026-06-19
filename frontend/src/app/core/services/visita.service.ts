import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface SiteStats {
  visitas: number;
  investigadores: number;
  proyectos: number;
  publicaciones: number;
}

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
  ultimasVisitas: { id: number; session_id: string | null; ip_address: string | null; page: string; created_at: string }[];
  navegadores: { browser: string; count: string }[];
  dispositivos: { tipo: string; count: string }[];
}

export interface AnalyticsAvanzado {
  comparacionPeriodos: {
    semanaActual: number;
    semanaAnterior: number;
    mesActual: number;
    mesAnterior: number;
    semanaCrecimiento: number;
    mesCrecimiento: number;
  };
  calendario: { fecha: string; total: string }[];
  mejoresDias: { fecha: string; total: string }[];
  peoresDias: { fecha: string; total: string }[];
}

export interface MapaLocation {
  lat: number;
  lon: number;
  city: string;
  country: string;
  country_code: string;
  total: number;
}

export interface MapaData {
  locations: MapaLocation[];
  paises: { nombre: string; total: number }[];
  totalConUbicacion: number;
  totalIPs: number;
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

  obtenerStats(): Observable<SiteStats> {
    return this.http.get<{ success: boolean; data: SiteStats }>(`${environment.apiUrl}/stats`).pipe(
      map(response => response.data)
    );
  }

  obtenerAnalyticsAvanzado(): Observable<AnalyticsAvanzado> {
    return this.http.get<{ success: boolean; data: AnalyticsAvanzado }>(`${this.apiUrl}/analytics/advanced`).pipe(
      map(response => response.data)
    );
  }

  obtenerMapaVisitas(): Observable<MapaData> {
    return this.http.get<{ success: boolean; data: MapaData }>(`${this.apiUrl}/analytics/map`).pipe(
      map(response => response.data)
    );
  }
}
