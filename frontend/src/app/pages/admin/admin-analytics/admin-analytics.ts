import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VisitaService, AnalyticsData } from '../../../core/services/visita.service';

@Component({
  selector: 'app-admin-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-analytics.html',
  styleUrls: ['./admin-analytics.css']
})
export class AdminAnalyticsComponent implements OnInit {
  data: AnalyticsData | null = null;
  isLoading = true;
  chartMax = 0;
  maxBarHeight = 200;

  constructor(
    private visitaService: VisitaService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.isLoading = true;
    this.visitaService.obtenerAnalytics().subscribe({
      next: (d) => {
        this.data = d;
        if (d.visitasPorDia.length) {
          this.chartMax = Math.max(...d.visitasPorDia.map(v => parseInt(v.total))) || 1;
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getBarHeight(total: string): number {
    const val = parseInt(total);
    if (this.chartMax === 0) return 0;
    return Math.max((val / this.chartMax) * this.maxBarHeight, 4);
  }

  formatDate(fecha: string): string {
    const d = new Date(fecha);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  }

  formatDuration(seconds: number): string {
    if (!seconds || seconds <= 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  maskIp(ip: string | null): string {
    if (!ip) return 'N/A';
    const parts = ip.replace('::ffff:', '').split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.*.*`;
    }
    return ip.substring(0, 10) + '...';
  }

  getTimeAgo(fecha: string): string {
    const now = new Date();
    const diff = now.getTime() - new Date(fecha).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Ahora';
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  }

  parseNum(val: string | number): number {
    return parseInt(String(val), 10) || 0;
  }

  getPercent(val: string | number): number {
    const num = this.parseNum(val);
    if (this.data?.totalVisitas === 0) return 0;
    return Math.round((num / (this.data?.totalVisitas || 1)) * 100);
  }

  getPageInfo(page: string): { icon: string; name: string; desc: string; color: string } {
    const map: Record<string, { icon: string; name: string; desc: string; color: string }> = {
      '/': {
        icon: '<svg class="w-5 h-5 text-reasons-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>',
        name: 'Inicio',
        desc: 'Página principal del portal',
        color: 'green'
      },
      '/equipo': {
        icon: '<svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>',
        name: 'Equipo',
        desc: 'Investigadores del grupo',
        color: 'blue'
      },
      '/proyectos': {
        icon: '<svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>',
        name: 'Proyectos',
        desc: 'Proyectos de investigación',
        color: 'amber'
      },
      '/publicaciones': {
        icon: '<svg class="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>',
        name: 'Publicaciones',
        desc: 'Artículos científicos indexados',
        color: 'violet'
      },
      '/contacto': {
        icon: '<svg class="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>',
        name: 'Contacto',
        desc: 'Formulario de contacto',
        color: 'rose'
      },
      '/login': {
        icon: '<svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/></svg>',
        name: 'Login',
        desc: 'Acceso al panel admin',
        color: 'slate'
      },
    };

    if (map[page]) return map[page];

    if (page.startsWith('/proyectos/')) {
      return {
        icon: '<svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>',
        name: 'Detalle Proyecto',
        desc: 'Vista detallada de proyecto',
        color: 'amber'
      };
    }
    if (page.startsWith('/publicaciones/')) {
      return {
        icon: '<svg class="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>',
        name: 'Detalle Publicación',
        desc: 'Vista detallada de publicación',
        color: 'violet'
      };
    }

    return {
      icon: '<svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>',
      name: page,
      desc: 'Página del sitio',
      color: 'slate'
    };
  }
}
