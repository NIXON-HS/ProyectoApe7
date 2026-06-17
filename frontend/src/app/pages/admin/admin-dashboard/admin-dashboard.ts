import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ContactoService } from '../../../core/services/contacto.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { SplashScreenComponent } from '../../../shared/splash-screen/splash-screen';

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
    AdminAnalyticsComponent
  ],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent implements OnInit {
  @Input() usuario: any = null;
  @Output() logout = new EventEmitter<void>();

  activeTab: 'resumen' | 'investigadores' | 'proyectos' | 'publicaciones' | 'mensajes' | 'perfil' | 'info' | 'lineas' | 'noticias' | 'analytics' = 'resumen';
  isMobileSidebarOpen = false;
  searchQuery = '';
  mensajesCount = 0;
  isLoading = false;
  showSplash = false;
  splashAction: 'logout' | 'home' | null = null;

  proyectosAction = '';
  publicacionesAction = '';

  constructor(
    private contactoService: ContactoService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.cargarMensajesCount();
  }

  cargarMensajesCount() {
    if (this.usuario?.rol === 'admin') {
      this.contactoService.getContactos().subscribe({
        next: (res) => {
          this.mensajesCount = res ? res.length : 0;
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

  onSplashComplete() {
    this.showSplash = false;
    if (this.splashAction === 'logout') {
      this.authService.logout();
      this.toastService.show('Sesión cerrada correctamente.', 'info');
      this.router.navigate(['/home']);
    } else if (this.splashAction === 'home') {
      this.router.navigate(['/home']);
    }
    this.splashAction = null;
  }
}
