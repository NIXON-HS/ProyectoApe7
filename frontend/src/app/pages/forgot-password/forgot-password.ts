import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css']
})
export class ForgotPasswordComponent implements OnInit {
  isSubmitting = false;
  submittedEmail = '';
  readonly form;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private authService: AuthService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      correo: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit() {
    const correo = this.route.snapshot.queryParamMap.get('correo')?.trim();

    if (correo) {
      this.form.patchValue({ correo });
    }
  }

  onSubmit() {
    if (this.form.invalid || this.isSubmitting) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const correo = this.form.getRawValue().correo || '';

    this.authService.forgotPassword(correo).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.submittedEmail = correo;
        this.toastService.show(res.message, 'info');
        this.cdr.detectChanges();
      },
      error: () => {
        this.isSubmitting = false;
        this.cdr.detectChanges();
      }
    });
  }

  resetView() {
    this.submittedEmail = '';
    this.cdr.detectChanges();
  }
}
