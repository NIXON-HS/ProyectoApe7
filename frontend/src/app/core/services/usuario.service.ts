import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface Usuario {
  id: number;
  nombres: string;
  correo: string;
  rol: 'admin' | 'investigador';
  reset_password_expires?: string | null;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private apiUrl = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private get headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.authService.getToken()}` });
  }

  getUsuarios(): Observable<{ success: boolean; data: Usuario[] }> {
    return this.http.get<any>(this.apiUrl, { headers: this.headers });
  }

  crearUsuario(data: { nombres: string; correo: string; rol: string }): Observable<any> {
    return this.http.post<any>(this.apiUrl, data, { headers: this.headers });
  }

  actualizarUsuario(id: number, data: Partial<Usuario>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data, { headers: this.headers });
  }

  eliminarUsuario(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers: this.headers });
  }

  reenviarActivacion(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/reenviar-activacion`, {}, { headers: this.headers });
  }
}
