import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-login-card',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './login-card.html',
  styleUrls: ['./login-card.css']
})
export class LoginCardComponent implements OnInit {
  @Output() loginSuccess = new EventEmitter<void>();

  loginForm!: FormGroup;
  showPassword = false;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loginForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  get forgotPasswordQueryParams() {
    const correo = this.loginForm?.get('correo')?.value?.trim();
    return correo ? { correo } : {};
  }

  copyCredential(rol: 'admin' | 'investigador') {
    const email = rol === 'admin' ? 'admin@reasons.uta.edu.ec' : 'investigador@reasons.uta.edu.ec';
    const pass = rol === 'admin' ? 'admin123' : 'user123';
    this.loginForm.patchValue({ correo: email, password: pass });
    this.toastService.show(`Credenciales de ${rol} autocompletadas.`, 'info');
    this.onLogin();
  }

  onLogin() {
    if (this.loginForm.invalid) return;
    this.isSubmitting = true;
    this.cdr.detectChanges();

    const { correo, password } = this.loginForm.value;
    this.authService.login(correo, password).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.cdr.detectChanges();
        if (res && res.success) {
          this.toastService.show(`Sesión iniciada como ${res.data.usuario.nombres}.`, 'success');
          this.loginSuccess.emit();
        } else {
          this.toastService.show(res?.message || 'Error al iniciar sesión.', 'error');
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        this.cdr.detectChanges();
        console.error('Error logging in:', err);
        if (err.status === 401) {
          this.toastService.show('Credenciales incorrectas.', 'error');
        } else if (err.status === 429) {
          this.toastService.show('Demasiados intentos fallidos. Espere 15 minutos.', 'error');
        } else {
          this.toastService.show('Error de servidor al iniciar sesión.', 'error');
        }
      }
    });
  }
}
