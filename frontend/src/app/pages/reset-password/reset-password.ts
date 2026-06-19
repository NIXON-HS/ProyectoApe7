import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { finalize } from 'rxjs/operators';

const passwordMatchValidator = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (!password || !confirmPassword) {
    return null;
  }

  return password === confirmPassword ? null : { passwordMismatch: true };
};

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.css']
})
export class ResetPasswordComponent implements OnInit {
  isSubmitting = false;
  isValidatingToken = true;
  isTokenValid = false;
  token = '';
  email = '';
  readonly form;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: passwordMatchValidator });
  }

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    this.email = this.route.snapshot.queryParamMap.get('email') || '';

    if (!this.token || !this.email) {
      this.isValidatingToken = false;
      this.isTokenValid = false;
      this.toastService.show('El enlace de recuperación es inválido.', 'error');
      this.cdr.detectChanges();
      return;
    }

    this.authService.validateResetToken(this.email, this.token)
      .pipe(finalize(() => {
        this.isValidatingToken = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: () => {
          this.isTokenValid = true;
        },
        error: () => {
          this.isTokenValid = false;
        }
      });
  }

  onSubmit() {
    if (this.form.invalid || this.isSubmitting || !this.token || !this.email || !this.isTokenValid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const { password } = this.form.getRawValue();

    this.authService.resetPassword(this.email, this.token, password || '').subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.toastService.show(res.message, 'success');
        this.router.navigate(['/login']);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.isTokenValid = false;
        this.toastService.show(err?.error?.message || 'No se pudo actualizar la contraseña. El enlace puede haber expirado.', 'error');
        this.cdr.detectChanges();
      }
    });
  }
}
