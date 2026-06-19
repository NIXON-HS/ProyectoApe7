import { Component, OnInit, OnDestroy, ChangeDetectorRef, Input, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VisitaService, MapaData } from '../../core/services/visita.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-visitors-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="visitors-map-wrapper">
      <div *ngIf="isLoading" class="flex items-center justify-center h-64">
        <div class="text-center">
          <div class="w-8 h-8 border-4 border-[#3c9632] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p class="text-xs text-slate-400">Cargando mapa...</p>
        </div>
      </div>

      <div *ngIf="!isLoading" class="map-layout">
        <div #mapContainer class="map-canvas"></div>
        <div class="map-sidebar">
          <h4 class="sidebar-title">Visitas por País</h4>
          <div *ngIf="mapData?.paises?.length; else noPaises" class="space-y-2">
            <div *ngFor="let pais of mapData!.paises.slice(0, 8)" class="country-card">
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs text-slate-600 font-medium truncate mr-2">{{ pais.nombre }}</span>
                <span class="text-xs font-bold text-[#0a3246] flex-shrink-0">{{ pais.total }}</span>
              </div>
              <div class="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div class="h-full bg-[#3c9632] rounded-full"
                     [style.width.%]="getPercent(pais.total)"></div>
              </div>
            </div>
          </div>
          <ng-template #noPaises>
            <div class="text-center py-6">
              <svg class="w-8 h-8 text-slate-200 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              </svg>
              <p class="text-xs text-slate-300">Sin datos de ubicación</p>
              <p class="text-xs text-slate-300 mt-1">Las visitas desde IPs externas aparecerán aquí</p>
            </div>
          </ng-template>
          <div class="sidebar-stats" *ngIf="mapData">
            <div class="stat-row">
              <span class="text-xs text-slate-400">Ubicaciones</span>
              <span class="text-xs font-bold text-[#0a3246]">{{ mapData.totalConUbicacion }}</span>
            </div>
            <div class="stat-row">
              <span class="text-xs text-slate-400">IPs rastreadas</span>
              <span class="text-xs font-bold text-[#0a3246]">{{ mapData.totalIPs }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @import url('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');

    :host { display: block; }
    .visitors-map-wrapper { width: 100%; }
    .map-layout {
      display: flex;
      height: 420px;
      border-radius: 0 0 1rem 1rem;
      overflow: hidden;
    }
    .map-canvas {
      flex: 1;
      min-width: 0;
      height: 100%;
    }
    .map-sidebar {
      width: 250px;
      flex-shrink: 0;
      background: #f8fafc;
      padding: 1rem;
      overflow-y: auto;
      border-left: 1px solid #e2e8f0;
      display: flex;
      flex-direction: column;
    }

    /* Leaflet container sizing */
    .map-canvas .leaflet-container {
      width: 100%;
      height: 100%;
    }

    /* Fix Leaflet controls */
    .map-canvas .leaflet-control-zoom a {
      background-color: white;
      color: #333;
      border: 1px solid #ccc;
      width: 28px;
      height: 28px;
      line-height: 28px;
      font-size: 16px;
      text-align: center;
      text-decoration: none;
      display: block;
    }
    .map-canvas .leaflet-control-zoom a:hover {
      background-color: #f4f4f4;
    }
    .map-canvas .leaflet-control-zoom {
      border: none;
      box-shadow: 0 1px 5px rgba(0,0,0,0.2);
    }
    .map-canvas .leaflet-control-attribution {
      background: rgba(255,255,255,0.7);
      font-size: 10px;
    }

    /* Popup styling */
    .map-canvas .leaflet-popup-content-wrapper {
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    }
    .map-canvas .leaflet-popup-content {
      margin: 10px 14px;
      font-family: 'Inter', system-ui, sans-serif;
    }

    .sidebar-title {
      font-size: 0.7rem;
      font-weight: 700;
      color: #00283c;
      margin-bottom: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .country-card {
      padding: 0.5rem;
      background: white;
      border-radius: 0.5rem;
      border: 1px solid #f1f5f9;
    }
    .sidebar-stats {
      margin-top: auto;
      padding-top: 0.75rem;
      border-top: 1px solid #e2e8f0;
    }
    .stat-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.25rem;
    }
    @media (max-width: 768px) {
      .map-layout { flex-direction: column; height: auto; }
      .map-canvas { height: 300px; min-height: 300px; }
      .map-sidebar { width: 100%; border-left: none; border-top: 1px solid #e2e8f0; }
    }
  `]
})
export class VisitorsMapComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() autoLoad = true;
  @ViewChild('mapContainer') mapContainer!: ElementRef<HTMLDivElement>;

  mapData: MapaData | null = null;
  isLoading = true;

  private map: L.Map | null = null;
  private ready = false;

  constructor(
    private visitaService: VisitaService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (this.autoLoad) this.cargarMapa();
  }

  ngAfterViewInit() {
    this.ready = true;
    if (!this.isLoading && this.mapData) {
      this.initMap();
    }
  }

  ngOnDestroy() {
    this.destroyMap();
  }

  cargarMapa() {
    this.isLoading = true;
    this.visitaService.obtenerMapaVisitas().subscribe({
      next: (d) => {
        this.mapData = d;
        this.isLoading = false;
        this.cdr.detectChanges();
        if (this.ready) {
          this.tryInitMap();
        }
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private tryInitMap() {
    if (this.mapContainer?.nativeElement) {
      this.initMap();
    } else {
      setTimeout(() => this.initMap(), 200);
    }
  }

  private initMap() {
    this.destroyMap();

    const el = this.mapContainer?.nativeElement;
    if (!el) return;

    this.map = L.map(el, {
      center: [-1.8312, -78.1834],
      zoom: 3,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
      maxZoom: 18,
    }).addTo(this.map);

    if (this.mapData?.locations?.length) {
      const maxTotal = Math.max(...this.mapData.locations.map(l => l.total));

      for (const loc of this.mapData.locations) {
        const radius = Math.max(6, Math.min(20, (loc.total / maxTotal) * 20));
        const marker = L.circleMarker([loc.lat, loc.lon], {
          radius,
          fillColor: '#3c9632',
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.85,
        }).addTo(this.map);

        marker.bindPopup(`
          <div style="text-align:center;min-width:120px;padding:4px 0">
            <div style="font-size:14px;font-weight:700;color:#00283c">${loc.city}</div>
            <div style="font-size:11px;color:#64748b;margin:2px 0">${loc.country}</div>
            <div style="font-size:18px;font-weight:900;color:#3c9632;margin-top:4px">${loc.total}</div>
            <div style="font-size:10px;color:#94a3b8">visitas</div>
          </div>
        `);
      }

      setTimeout(() => {
        if (!this.map) return;
        if (this.mapData!.locations.length === 1) {
          const loc = this.mapData!.locations[0];
          this.map.setView([loc.lat, loc.lon], 10);
        } else {
          const bounds = L.latLngBounds(this.mapData!.locations.map(l => [l.lat, l.lon]));
          this.map.fitBounds(bounds, { padding: [30, 30] });
        }
      }, 100);
    } else {
      this.map.setView([-1.8312, -78.1834], 3);
    }

    setTimeout(() => { if (this.map) this.map.invalidateSize(); }, 300);
  }

  private destroyMap() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  getPercent(total: number): number {
    if (!this.mapData?.totalConUbicacion) return 0;
    return Math.round((total / this.mapData.totalConUbicacion) * 100);
  }
}
