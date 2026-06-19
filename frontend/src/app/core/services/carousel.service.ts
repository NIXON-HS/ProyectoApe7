import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CarouselSlide } from '../models/carousel-slide.model';

@Injectable({ providedIn: 'root' })
export class CarouselService {
  private api = `${environment.apiUrl}/carousel`;

  constructor(private http: HttpClient) {}

  getSlides(): Observable<CarouselSlide[]> {
    return this.http.get<{ success: boolean; data: CarouselSlide[] }>(this.api).pipe(map(r => r.data));
  }

  getAllSlides(): Observable<CarouselSlide[]> {
    return this.http.get<{ success: boolean; data: CarouselSlide[] }>(`${this.api}/all`).pipe(map(r => r.data));
  }

  crearSlide(slide: Partial<CarouselSlide>): Observable<CarouselSlide> {
    return this.http.post<{ success: boolean; data: CarouselSlide }>(this.api, slide).pipe(map(r => r.data));
  }

  actualizarSlide(id: number, slide: Partial<CarouselSlide>): Observable<CarouselSlide> {
    return this.http.put<{ success: boolean; data: CarouselSlide }>(`${this.api}/${id}`, slide).pipe(map(r => r.data));
  }

  eliminarSlide(id: number): Observable<any> {
    return this.http.delete(`${this.api}/${id}`);
  }
}
