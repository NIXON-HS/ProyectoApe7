import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { LoginCardComponent } from './components/login-card/login-card';
import { AdminDashboardComponent } from '../admin/admin-dashboard/admin-dashboard';
import { SplashScreenComponent } from '../../shared/splash-screen/splash-screen';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, LoginCardComponent, AdminDashboardComponent, SplashScreenComponent],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {
  isLoggedIn = false;
  showSplash = false;
  showDashboard = false;
  usuario: any = null;

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.checkSession();
  }

  checkSession() {
    const token = this.authService.getToken();
    const storedUser = this.authService.getUsuarioActual();
    const wantsDashboard = this.route.snapshot.queryParamMap.get('dashboard') === 'true';

    if (token && storedUser) {
      this.usuario = storedUser;
      if (wantsDashboard) {
        this.showDashboard = true;
        this.isLoggedIn = true;
      } else {
        this.router.navigate(['/home']);
      }
      return;
    } else if (token && !storedUser) {
      this.authService.logout();
    }
    this.isLoggedIn = false;
    this.usuario = null;
  }

  onLoginSuccess() {
    this.showSplash = true;
    this.usuario = this.authService.getUsuarioActual();
    this.cdr.detectChanges();
  }

  onSplashWillExit() {
    // Show dashboard while splash is still fading — renders underneath
    this.showDashboard = true;
    this.isLoggedIn = true;
    this.usuario = this.authService.getUsuarioActual();
    this.cdr.detectChanges();
  }

  onSplashComplete() {
    // Splash fully invisible — remove from DOM
    this.showSplash = false;
    this.cdr.detectChanges();
  }

  onLogout() {
    this.authService.logout();
    this.isLoggedIn = false;
    this.showDashboard = false;
    this.usuario = null;
    this.toastService.show('Sesión cerrada correctamente.', 'info');
    this.router.navigate(['/home']);
  }
}
