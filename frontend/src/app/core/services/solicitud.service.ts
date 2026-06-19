import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Solicitud } from '../models/solicitud.model';

@Injectable({
  providedIn: 'root'
})
export class SolicitudService {
  private apiUrl = `${environment.apiUrl}/solicitudes`;

  private refreshCountSource = new Subject<void>();
  refreshCount$ = this.refreshCountSource.asObservable();

  triggerRefreshCount() {
    this.refreshCountSource.next();
  }

  constructor(private http: HttpClient) {}

  getSolicitudes(): Observable<Solicitud[]> {
    return this.http.get<{ success: boolean; data: Solicitud[] }>(this.apiUrl).pipe(
      map(res => res.data)
    );
  }

  procesarSolicitud(id: number, estado: 'aprobado' | 'rechazado', motivoRechazo?: string): Observable<any> {
    return this.http.put<{ success: boolean; message: string; data: Solicitud }>(
      `${this.apiUrl}/${id}/procesar`,
      { estado, motivo_rechazo: motivoRechazo }
    );
  }

  eliminarSolicitud(id: number): Observable<any> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }
}
