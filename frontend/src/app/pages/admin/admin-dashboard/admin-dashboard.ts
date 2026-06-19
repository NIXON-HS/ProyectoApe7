import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ContactoService } from '../../../core/services/contacto.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { SplashScreenComponent } from '../../../shared/splash-screen/splash-screen';
import { SolicitudService } from '../../../core/services/solicitud.service';
import { forkJoin, Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Tabs Components
import { AdminResumenComponent } from '../admin-resumen/admin-resumen';
import { AdminInvestigadoresComponent } from '../admin-investigadores/admin-investigadores';
import { AdminProyectosComponent } from '../admin-proyectos/admin-proyectos';
import { AdminPublicacionesComponent } from '../admin-publicaciones/admin-publicaciones';
import { AdminPerfilComponent } from '../admin-perfil/admin-perfil';
import { AdminInfoComponent } from '../admin-info/admin-info';
import { AdminLineasComponent } from '../admin-lineas/admin-lineas';
import { AdminNoticiasComponent } from '../admin-noticias/admin-noticias';
import { AdminMensajesComponent } from '../admin-mensajes/admin-mensajes';
import { AdminAnalyticsComponent } from '../admin-analytics/admin-analytics';
import { AdminCarouselComponent } from '../admin-carousel/admin-carousel';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    SplashScreenComponent,
    AdminResumenComponent,
    AdminInvestigadoresComponent,
    AdminProyectosComponent,
    AdminPublicacionesComponent,
    AdminPerfilComponent,
    AdminInfoComponent,
    AdminLineasComponent,
    AdminNoticiasComponent,
    AdminMensajesComponent,
    AdminAnalyticsComponent,
    AdminCarouselComponent
  ],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  @Input() usuario: any = null;
  @Output() logout = new EventEmitter<void>();

  activeTab: 'resumen' | 'investigadores' | 'proyectos' | 'publicaciones' | 'mensajes' | 'perfil' | 'info' | 'lineas' | 'noticias' | 'analytics' = 'resumen';
  infoExpanded = false;
  infoSubPage: 'inicio' | 'proyectos' | 'publicaciones' | 'contacto' | 'noticias' = 'inicio';

  isMobileSidebarOpen = false;
  searchQuery = '';
  mensajesCount = 0;
  isLoading = false;
  showSplash = false;
  splashAction: 'logout' | 'home' | null = null;

  proyectosAction = '';
  publicacionesAction = '';

  private destroy$ = new Subject<void>();

  constructor(
    private contactoService: ContactoService,
    private solicitudService: SolicitudService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    // Poll every 10 seconds to keep the count updated in real-time
    timer(0, 10000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.cargarMensajesCount();
      });

    this.solicitudService.refreshCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.cargarMensajesCount();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarMensajesCount() {
    if (this.usuario?.rol === 'admin') {
      forkJoin({
        contactos: this.contactoService.getContactos(),
        solicitudes: this.solicitudService.getSolicitudes()
      }).subscribe({
        next: ({ contactos, solicitudes }) => {
          const contactCount = contactos ? contactos.length : 0;
          const pendingSols = solicitudes ? solicitudes.filter(s => s.estado === 'pendiente').length : 0;
          this.mensajesCount = contactCount + pendingSols;
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error loading admin counts', err)
      });
    } else if (this.usuario?.rol === 'investigador') {
      this.solicitudService.getSolicitudes().subscribe({
        next: (res) => {
          this.mensajesCount = res ? res.filter(s => s.estado === 'pendiente').length : 0;
          this.cdr.detectChanges();
        }
      });
    }
  }

  switchTab(tab: 'resumen' | 'investigadores' | 'proyectos' | 'publicaciones' | 'mensajes' | 'perfil' | 'info' | 'lineas' | 'noticias' | 'analytics') {
    this.activeTab = tab;
    this.searchQuery = '';
    this.isMobileSidebarOpen = false;
    this.cdr.detectChanges();
  }

  toggleInfoSection() {
    if (this.activeTab !== 'info') {
      this.activeTab = 'info';
      this.infoExpanded = true;
    } else {
      this.infoExpanded = !this.infoExpanded;
    }
    this.isMobileSidebarOpen = false;
    this.cdr.detectChanges();
  }

  openInfoPage(sub: 'inicio' | 'proyectos' | 'publicaciones' | 'contacto' | 'noticias') {
    this.activeTab = 'info';
    this.infoSubPage = sub;
    this.infoExpanded = true;
    this.isMobileSidebarOpen = false;
    this.cdr.detectChanges();
  }

  onTabChange(tab: string) {
    if (tab === 'publicaciones-nuevo') {
      this.activeTab = 'publicaciones';
      this.publicacionesAction = 'nuevo';
    } else if (tab === 'proyectos-nuevo') {
      this.activeTab = 'proyectos';
      this.proyectosAction = 'nuevo';
    } else {
      this.switchTab(tab as any);
    }
    this.cdr.detectChanges();
  }

  onLogout() {
    this.splashAction = 'logout';
    this.showSplash = true;
    this.cdr.detectChanges();
  }

  goHome() {
    this.splashAction = 'home';
    this.showSplash = true;
    this.cdr.detectChanges();
  }

  onSplashWillExit() {
    // Navigate while splash is still fading
    if (this.splashAction === 'logout') {
      this.authService.logout();
      this.toastService.show('Sesión cerrada correctamente.', 'info');
      this.router.navigate(['/home']);
    } else if (this.splashAction === 'home') {
      this.router.navigate(['/home']);
    }
    this.splashAction = null;
  }

  onSplashComplete() {
    // Splash fully invisible — remove from DOM
    this.showSplash = false;
  }
}
