import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Proyecto } from '../models/proyecto.model';

@Injectable({
  providedIn: 'root'
})
export class ProyectoService {
  private apiUrl = `${environment.apiUrl}/proyectos`;

  constructor(private http: HttpClient) {}

  getProyectos(): Observable<Proyecto[]> {
    return this.http.get<{ success: boolean; data: Proyecto[] }>(this.apiUrl).pipe(
      map(response => response.data)
    );
  }

  getProyectoById(id: number): Observable<Proyecto> {
    return this.http.get<{ success: boolean; data: Proyecto }>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.data)
    );
  }

  crearProyecto(proyecto: Partial<Proyecto>): Observable<Proyecto> {
    return this.http.post<{ success: boolean; data: Proyecto }>(this.apiUrl, proyecto).pipe(
      map(response => response.data)
    );
  }

  actualizarProyecto(id: number, proyecto: Partial<Proyecto>): Observable<Proyecto> {
    return this.http.put<{ success: boolean; data: Proyecto }>(`${this.apiUrl}/${id}`, proyecto).pipe(
      map(response => response.data)
    );
  }

  eliminarProyecto(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }
}
