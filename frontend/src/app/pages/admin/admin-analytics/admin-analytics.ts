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
}
