import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { InfoGrupo, LineaInvestigacion } from '../models/info-grupo.model';

@Injectable({ providedIn: 'root' })
export class InfoGrupoService {
  private api     = `${environment.apiUrl}/info-grupo`;
  private apiLinea = `${environment.apiUrl}/lineas`;

  constructor(private http: HttpClient) {}

  // ── Info Grupo ────────────────────────────────────────────────────────────
  getInfoGrupo(): Observable<InfoGrupo> {
    return this.http.get<{ success: boolean; data: InfoGrupo }>(this.api)
      .pipe(map(r => r.data));
  }

  actualizarInfoGrupo(data: Partial<InfoGrupo>): Observable<InfoGrupo> {
    return this.http.put<{ success: boolean; data: InfoGrupo }>(this.api, data)
      .pipe(map(r => r.data));
  }

  // ── Líneas de Investigación ───────────────────────────────────────────────
  getLineas(): Observable<LineaInvestigacion[]> {
    return this.http.get<{ success: boolean; data: LineaInvestigacion[] }>(this.apiLinea)
      .pipe(map(r => r.data));
  }

  crearLinea(linea: Partial<LineaInvestigacion>): Observable<LineaInvestigacion> {
    return this.http.post<{ success: boolean; data: LineaInvestigacion }>(this.apiLinea, linea)
      .pipe(map(r => r.data));
  }

  actualizarLinea(id: number, linea: Partial<LineaInvestigacion>): Observable<LineaInvestigacion> {
    return this.http.put<{ success: boolean; data: LineaInvestigacion }>(`${this.apiLinea}/${id}`, linea)
      .pipe(map(r => r.data));
  }

  eliminarLinea(id: number): Observable<any> {
    return this.http.delete(`${this.apiLinea}/${id}`);
  }
}
