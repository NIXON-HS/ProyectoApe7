import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Publicacion } from '../models/publicacion.model';

@Injectable({
  providedIn: 'root'
})
export class PublicacionService {
  private apiUrl = `${environment.apiUrl}/publicaciones`;

  constructor(private http: HttpClient) {}

  getPublicaciones(): Observable<Publicacion[]> {
    return this.http.get<{ success: boolean; data: Publicacion[] }>(this.apiUrl).pipe(
      map(response => response.data)
    );
  }

  getPublicacionById(id: number): Observable<Publicacion> {
    return this.http.get<{ success: boolean; data: Publicacion }>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.data)
    );
  }

  crearPublicacion(publicacion: Partial<Publicacion>): Observable<Publicacion> {
    return this.http.post<{ success: boolean; data: Publicacion }>(this.apiUrl, publicacion).pipe(
      map(response => response.data)
    );
  }

  actualizarPublicacion(id: number, publicacion: Partial<Publicacion>): Observable<Publicacion> {
    return this.http.put<{ success: boolean; data: Publicacion }>(`${this.apiUrl}/${id}`, publicacion).pipe(
      map(response => response.data)
    );
  }

  eliminarPublicacion(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }
}
