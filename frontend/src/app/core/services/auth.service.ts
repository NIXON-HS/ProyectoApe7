import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    usuario: {
      id: number;
      nombres: string;
      correo: string;
      rol: string;
    }
  };
}

interface MessageResponse {
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.cargarSesion();
  }

  private cargarSesion() {
    const token = localStorage.getItem('reasons_auth_token');
    const userStr = localStorage.getItem('reasons_auth_user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch (e) {
        this.logout();
      }
    }
  }

  login(correo: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { correo, password }).pipe(
      tap(res => {
        if (res && res.success && res.data.token) {
          localStorage.setItem('reasons_auth_token', res.data.token);
          localStorage.setItem('reasons_auth_user', JSON.stringify(res.data.usuario));
          this.currentUserSubject.next(res.data.usuario);
        }
      })
    );
  }

  forgotPassword(correo: string): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.apiUrl}/forgot-password`, { correo });
  }

  validateResetToken(correo: string, token: string): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.apiUrl}/validate-reset-token`, { correo, token });
  }

  resetPassword(correo: string, token: string, password: string): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.apiUrl}/reset-password`, { correo, token, password });
  }

  /** Verifica el JWT almacenado sin bcrypt — instantáneo, para reloads */
  verifyToken(): Observable<any> {
    const token = this.getToken();
    if (!token) return of(null);
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get<any>(`${this.apiUrl}/verify`, { headers }).pipe(
      tap(res => {
        if (res?.success && res.data?.usuario) {
          // Actualiza el usuario en memoria con datos frescos del token
          localStorage.setItem('reasons_auth_user', JSON.stringify(res.data.usuario));
          this.currentUserSubject.next(res.data.usuario);
        }
      }),
      catchError(() => {
        // Token inválido o expirado — limpiar sesión
        this.logout();
        return of(null);
      })
    );
  }

  logout() {
    localStorage.removeItem('reasons_auth_token');
    localStorage.removeItem('reasons_auth_user');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('reasons_auth_token');
  }

  getUsuarioActual(): any {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }
}
