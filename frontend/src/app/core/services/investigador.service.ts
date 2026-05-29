import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Investigador } from '../models/investigador.model';

@Injectable({
  providedIn: 'root'
})
export class InvestigadorService {
  private apiUrl = `${environment.apiUrl}/investigadores`;

  constructor(private http: HttpClient) {}

  getInvestigadores(): Observable<Investigador[]> {
    return this.http.get<{ success: boolean; data: Investigador[] }>(this.apiUrl).pipe(
      map(response => response.data)
    );
  }

  getInvestigadorById(id: number): Observable<Investigador> {
    return this.http.get<{ success: boolean; data: Investigador }>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.data)
    );
  }

  crearInvestigador(investigador: Partial<Investigador>): Observable<Investigador> {
    return this.http.post<{ success: boolean; data: Investigador }>(this.apiUrl, investigador).pipe(
      map(response => response.data)
    );
  }

  actualizarInvestigador(id: number, investigador: Partial<Investigador>): Observable<Investigador> {
    return this.http.put<{ success: boolean; data: Investigador }>(`${this.apiUrl}/${id}`, investigador).pipe(
      map(response => response.data)
    );
  }

  eliminarInvestigador(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }

  subirFoto(fileName: string, base64Data: string): Observable<{ success: boolean; url: string }> {
    return this.http.post<{ success: boolean; url: string }>(`${environment.apiUrl}/upload`, { fileName, base64Data });
  }
}
