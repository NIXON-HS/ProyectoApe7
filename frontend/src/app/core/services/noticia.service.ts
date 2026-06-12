import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Noticia } from '../models/noticia.model';

@Injectable({
  providedIn: 'root'
})
export class NoticiaService {
  private apiUrl = `${environment.apiUrl}/noticias`;

  constructor(private http: HttpClient) {}

  getNoticias(): Observable<Noticia[]> {
    return this.http.get<{ success: boolean; data: Noticia[] }>(this.apiUrl).pipe(
      map(response => response.data)
    );
  }

  getNoticiaById(id: number): Observable<Noticia> {
    return this.http.get<{ success: boolean; data: Noticia }>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.data)
    );
  }

  crearNoticia(noticia: Partial<Noticia>): Observable<Noticia> {
    return this.http.post<{ success: boolean; data: Noticia }>(this.apiUrl, noticia).pipe(
      map(response => response.data)
    );
  }

  actualizarNoticia(id: number, noticia: Partial<Noticia>): Observable<Noticia> {
    return this.http.put<{ success: boolean; data: Noticia }>(`${this.apiUrl}/${id}`, noticia).pipe(
      map(response => response.data)
    );
  }

  eliminarNoticia(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }
}
