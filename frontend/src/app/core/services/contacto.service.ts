import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Contacto } from '../models/contacto.model';

@Injectable({
  providedIn: 'root'
})
export class ContactoService {
  private apiUrl = `${environment.apiUrl}/contacto`;

  constructor(private http: HttpClient) {}

  enviarMensaje(contacto: Contacto): Observable<{ success: boolean; message: string; data: Contacto }> {
    return this.http.post<{ success: boolean; message: string; data: Contacto }>(this.apiUrl, contacto);
  }

  getContactos(): Observable<Contacto[]> {
    return this.http.get<{ success: boolean; data: Contacto[] }>(this.apiUrl).pipe(
      map(response => response.data)
    );
  }

  eliminarContacto(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }
}
