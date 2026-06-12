import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { LoginCardComponent } from './components/login-card/login-card';
import { AdminDashboardComponent } from '../admin/admin-dashboard/admin-dashboard';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, LoginCardComponent, AdminDashboardComponent],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {
  isLoggedIn = false;
  usuario: any = null;

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.checkSession();
  }

  checkSession() {
    const token = this.authService.getToken();
    const storedUser = this.authService.getUsuarioActual();

    if (token && storedUser) {
      this.usuario = storedUser;
      this.isLoggedIn = true;
      this.cdr.detectChanges();
      
      this.authService.verifyToken().subscribe({
        next: (res) => {
          if (!res) {
            this.isLoggedIn = false;
            this.usuario = null;
            this.toastService.show('Tu sesión expiró. Por favor inicia sesión de nuevo.', 'warning');
          } else {
            this.usuario = res.data?.usuario ?? this.usuario;
          }
          this.cdr.detectChanges();
        },
        error: () => {
          // In case token verify request fails
          this.isLoggedIn = false;
          this.usuario = null;
          this.authService.logout();
          this.cdr.detectChanges();
        }
      });
    } else if (token && !storedUser) {
      this.authService.logout();
      this.isLoggedIn = false;
      this.usuario = null;
    } else {
      this.isLoggedIn = false;
      this.usuario = null;
    }
  }

  onLoginSuccess() {
    this.isLoggedIn = true;
    this.usuario = this.authService.getUsuarioActual();
    this.cdr.detectChanges();
  }

  onLogout() {
    this.authService.logout();
    this.isLoggedIn = false;
    this.usuario = null;
    this.toastService.show('Sesión cerrada correctamente.', 'info');
    this.cdr.detectChanges();
  }
}
