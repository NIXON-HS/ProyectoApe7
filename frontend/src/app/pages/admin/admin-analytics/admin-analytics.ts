import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VisitaService, AnalyticsData, SiteStats } from '../../../core/services/visita.service';

@Component({
  selector: 'app-admin-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-analytics.html',
  styleUrls: ['./admin-analytics.css']
})
export class AdminAnalyticsComponent implements OnInit {
  data: AnalyticsData | null = null;
  stats: SiteStats | null = null;
  isLoading = true;
  chartMax = 0;
  chartPeriod: '7d' | '30d' | 'semanas' = '30d';
  chartData: { fecha: string; total: string }[] = [];
  recentFilter = '';
  readonly SVG_W = 600;
  readonly SVG_H = 160;

  private readonly MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  private readonly DIAS  = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

  constructor(
    private visitaService: VisitaService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() { this.cargar(); }

  cargar() {
    this.isLoading = true;
    this.visitaService.obtenerAnalytics().subscribe({
      next: (d) => {
        this.data = d;
        this.updateChart();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.isLoading = false; this.cdr.detectChanges(); }
    });
    this.visitaService.obtenerStats().subscribe({
      next: (s) => { this.stats = s; this.cdr.detectChanges(); },
      error: () => {}
    });
  }

  setChartPeriod(p: '7d' | '30d' | 'semanas') {
    this.chartPeriod = p;
    this.updateChart();
    this.cdr.detectChanges();
  }

  private updateChart() {
    const raw = this.data?.visitasPorDia || [];
    if (this.chartPeriod === '7d')       this.chartData = raw.slice(-7);
    else if (this.chartPeriod === 'semanas') this.chartData = this.groupByWeek(raw);
    else                                 this.chartData = raw;
    this.chartMax = this.chartData.length
      ? (Math.max(...this.chartData.map(v => parseInt(v.total))) || 1)
      : 1;
  }

  private groupByWeek(data: { fecha: string; total: string }[]): { fecha: string; total: string }[] {
    const weeks: { fecha: string; total: string }[] = [];
    for (let i = 0; i < data.length; i += 7) {
      const chunk = data.slice(i, i + 7);
      weeks.push({ fecha: chunk[0].fecha, total: String(chunk.reduce((s, d) => s + parseInt(d.total), 0)) });
    }
    return weeks;
  }

  // ── Chart helpers ──────────────────────────────────────────────

  getChartTotal(): number {
    return this.chartData.reduce((s, v) => s + parseInt(v.total), 0);
  }

  getChartSubtitle(): string {
    if (!this.chartData.length) return '';
    const first = new Date(this.chartData[0].fecha);
    const last  = new Date(this.chartData[this.chartData.length - 1].fecha);
    const f = `${first.getDate()} ${this.MESES[first.getMonth()]}`;
    const l = `${last.getDate()} ${this.MESES[last.getMonth()]} ${last.getFullYear()}`;
    if (this.chartPeriod === 'semanas') return `${this.chartData.length} semanas · ${f} – ${l}`;
    return `${f} – ${l}`;
  }

  getPeakDay(): { label: string; total: number } {
    if (!this.chartData.length) return { label: '—', total: 0 };
    const peak = this.chartData.reduce((a, b) => parseInt(a.total) >= parseInt(b.total) ? a : b);
    const d = new Date(peak.fecha);
    return {
      label: this.chartPeriod === 'semanas'
        ? `Semana del ${d.getDate()} ${this.MESES[d.getMonth()]}`
        : `${this.DIAS[d.getDay()]} ${d.getDate()} ${this.MESES[d.getMonth()]}`,
      total: parseInt(peak.total)
    };
  }

  getChartAvg(): number {
    if (!this.chartData.length) return 0;
    return Math.round(this.getChartTotal() / this.chartData.length);
  }

  /** SVG bar chart — used when chartPeriod === '7d' */
  getBarRects(): { x: number; y: number; w: number; h: number; total: string; label: string; isToday: boolean }[] {
    const n = this.chartData.length;
    if (!n) return [];
    const padH = 18, padBot = 22, padSide = 8;
    const availH = this.SVG_H - padH - padBot;
    const availW = this.SVG_W - padSide * 2;
    const gap = 6;
    const barW = (availW - gap * (n - 1)) / n;
    const today = new Date().toDateString();
    return this.chartData.map((v, i) => {
      const val = parseInt(v.total);
      const barH = this.chartMax > 0 ? Math.max((val / this.chartMax) * availH, val > 0 ? 3 : 0) : 0;
      return {
        x: padSide + i * (barW + gap),
        y: padH + availH - barH,
        w: barW,
        h: barH,
        total: String(val),
        label: this.DIAS[new Date(v.fecha).getDay()],
        isToday: new Date(v.fecha).toDateString() === today
      };
    });
  }

  /** SVG smooth area+line — used for 30d and semanas */
  private getSvgPoints(): { x: number; y: number }[] {
    const pts = this.chartData;
    if (pts.length < 2) return [];
    const pad = 6, w = this.SVG_W - pad * 2, h = this.SVG_H - pad * 2;
    return pts.map((v, i) => ({
      x: pad + (i / (pts.length - 1)) * w,
      y: pad + h - (parseInt(v.total) / (this.chartMax || 1)) * h
    }));
  }

  getSvgLine(): string {
    const pts = this.getSvgPoints();
    if (pts.length < 2) return '';
    let d = `M ${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
    for (let i = 1; i < pts.length; i++) {
      const cpx = (pts[i - 1].x + pts[i].x) / 2;
      d += ` C ${cpx.toFixed(1)},${pts[i-1].y.toFixed(1)} ${cpx.toFixed(1)},${pts[i].y.toFixed(1)} ${pts[i].x.toFixed(1)},${pts[i].y.toFixed(1)}`;
    }
    return d;
  }

  getSvgArea(): string {
    const pts = this.getSvgPoints();
    if (pts.length < 2) return '';
    return `${this.getSvgLine()} L ${pts[pts.length-1].x.toFixed(1)},${this.SVG_H} L ${pts[0].x.toFixed(1)},${this.SVG_H} Z`;
  }

  getSvgAvgLine(): string {
    const avg = this.getChartAvg();
    if (!avg || this.chartMax === 0) return '';
    const pad = 6, h = this.SVG_H - pad * 2;
    const y = (pad + h - (avg / this.chartMax) * h).toFixed(1);
    return `M ${pad},${y} L ${this.SVG_W - pad},${y}`;
  }

  getXLabels(): { label: string; pct: number }[] {
    const n = this.chartData.length;
    if (n < 2) return [];
    if (this.chartPeriod === '7d') {
      return this.chartData.map((v, i) => ({
        label: this.DIAS[new Date(v.fecha).getDay()],
        pct: (i / (n - 1)) * 100
      }));
    }
    if (this.chartPeriod === 'semanas') {
      return this.chartData.map((v, i) => ({
        label: `Sem ${i + 1}`,
        pct: (i / (n - 1)) * 100
      }));
    }
    // 30d — ~6 evenly spaced
    const step = Math.ceil(n / 6);
    const indices: number[] = [];
    for (let i = 0; i < n; i += step) indices.push(i);
    if (indices[indices.length - 1] !== n - 1) indices.push(n - 1);
    return indices.map(i => {
      const d = new Date(this.chartData[i].fecha);
      return { label: `${d.getDate()} ${this.MESES[d.getMonth()]}`, pct: (i / (n - 1)) * 100 };
    });
  }

  // ── Recent visits ──────────────────────────────────────────────

  getFilteredRecentVisits() {
    const visits = this.data?.ultimasVisitas || [];
    if (!this.recentFilter) return visits;
    const q = this.recentFilter.toLowerCase();
    return visits.filter(v => this.getPageInfo(v.page).name.toLowerCase().includes(q));
  }

  getVisitorCode(sessionId: string | null): string {
    if (!sessionId) return 'Anónimo';
    return '#' + sessionId.replace(/-/g, '').slice(0, 8).toUpperCase();
  }

  // ── Utility ────────────────────────────────────────────────────

  formatDuration(seconds: number): string {
    if (!seconds || seconds <= 0) return '0:00';
    const m = Math.floor(seconds / 60), s = Math.round(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  maskIp(ip: string | null): string {
    if (!ip) return 'N/A';
    const parts = ip.replace('::ffff:', '').split('.');
    if (parts.length === 4) return `${parts[0]}.${parts[1]}.*.*`;
    return ip.substring(0, 10) + '...';
  }

  getTimeAgo(fecha: string): string {
    const diff = Date.now() - new Date(fecha).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Ahora';
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    if (h < 24) return `${h}h`;
    return `${Math.floor(h / 24)}d`;
  }

  parseNum(val: string | number): number { return parseInt(String(val), 10) || 0; }

  getPercent(val: string | number): number {
    const num = this.parseNum(val);
    return this.data?.totalVisitas ? Math.round((num / this.data.totalVisitas) * 100) : 0;
  }

  getTrend(): number {
    if (!this.data?.visitasAyer) return 0;
    return Math.round(((this.data.visitasHoy - this.data.visitasAyer) / (this.data.visitasAyer || 1)) * 100);
  }

  getPageInfo(page: string): { icon: string; name: string; desc: string; color: string } {
    const iconHome  = '<svg class="w-5 h-5 text-reasons-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>';
    const iconTeam  = '<svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>';
    const iconProj  = '<svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>';
    const iconPub   = '<svg class="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>';
    const iconMail  = '<svg class="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>';
    const iconLogin = '<svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/></svg>';
    const iconNews  = '<svg class="w-5 h-5 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/></svg>';
    const iconAdmin = '<svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>';

    const map: Record<string, { icon: string; name: string; desc: string; color: string }> = {
      '/':             { icon: iconHome,  name: 'Inicio',            desc: 'Página principal',             color: 'green'  },
      '/home':         { icon: iconHome,  name: 'Inicio',            desc: 'Página principal',             color: 'green'  },
      '/equipo':       { icon: iconTeam,  name: 'Equipo',            desc: 'Investigadores del grupo',     color: 'blue'   },
      '/proyectos':    { icon: iconProj,  name: 'Proyectos',         desc: 'Proyectos de investigación',   color: 'amber'  },
      '/publicaciones':{ icon: iconPub,   name: 'Publicaciones',     desc: 'Artículos científicos',        color: 'violet' },
      '/contacto':     { icon: iconMail,  name: 'Contacto',          desc: 'Formulario de contacto',       color: 'rose'   },
      '/login':        { icon: iconLogin, name: 'Inicio de Sesión',  desc: 'Acceso al panel admin',        color: 'slate'  },
      '/noticias':     { icon: iconNews,  name: 'Noticias',          desc: 'Noticias y eventos',           color: 'blue'   },
      '/admin':        { icon: iconAdmin, name: 'Panel Admin',       desc: 'Dashboard de administración',  color: 'slate'  },
    };

    if (map[page]) return map[page];
    if (page.startsWith('/proyectos/'))    return { icon: iconProj,  name: 'Detalle de Proyecto',    desc: 'Vista de proyecto',    color: 'amber'  };
    if (page.startsWith('/publicaciones/'))return { icon: iconPub,   name: 'Detalle de Publicación', desc: 'Vista de publicación', color: 'violet' };
    if (page.startsWith('/admin'))         return { icon: iconAdmin, name: 'Panel Admin',            desc: 'Administración',       color: 'slate'  };

    const cleanName = page.replace(/^\//, '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Página';
    return { icon: iconAdmin, name: cleanName, desc: 'Página del sitio', color: 'slate' };
  }
}
