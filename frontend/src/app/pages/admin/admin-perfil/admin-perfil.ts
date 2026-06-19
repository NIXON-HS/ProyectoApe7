import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { InvestigadorService } from '../../../core/services/investigador.service';
import { ProyectoService } from '../../../core/services/proyecto.service';
import { PublicacionService } from '../../../core/services/publicacion.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Investigador } from '../../../core/models/investigador.model';

@Component({
  selector: 'app-admin-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './admin-perfil.html',
  styleUrls: ['./admin-perfil.css']
})
export class AdminPerfilComponent implements OnInit {
  usuario: any = null;
  miPerfil: Investigador | null = null;
  showForm = false;
  showPasswordForm = false;
  isSubmitting = false;
  isSubmittingPassword = false;
  isUploading = false;
  uploadPreview: string | null = null;
  investigadorForm!: FormGroup;
  passwordForm!: FormGroup;

  passwordSubmitAttempted = false;
  showPasswordActual = false;
  showPasswordNuevo = false;
  showPasswordConfirmar = false;

  miProyectosCount = 0;
  miPublicacionesCount = 0;

  defaultAvatar = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23e2e8f0"/><path d="M50 50 A 15 15 0 1 0 50 20 A 15 15 0 1 0 50 50 Z M50 60 C 30 60 20 75 20 90 L 80 90 C 80 75 70 60 50 60 Z" fill="%2394a3b8"/></svg>';

  constructor(
    private fb: FormBuilder,
    private investigadorService: InvestigadorService,
    private proyectoService: ProyectoService,
    private publicacionService: PublicacionService,
    private authService: AuthService,
    private toastService: ToastService,
    public cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.usuario = this.authService.getUsuarioActual();
    this.cargarPerfil();
    this.initForm();
    this.initPasswordForm();
  }

  cargarPerfil() {
    if (!this.usuario) return;

    this.investigadorService.getInvestigadores().subscribe({
      next: (list) => {
        const correo = this.usuario?.correo?.toLowerCase();
        this.miPerfil = list.find(i => i.correo_institucional?.toLowerCase() === correo) || null;
        this.cdr.detectChanges();

        if (this.miPerfil) {
          this.cargarMetricas();
        }
      }
    });
  }

  cargarMetricas() {
    const correo = this.usuario?.correo?.toLowerCase();

    this.proyectoService.getProyectos().subscribe({
      next: (data) => {
        this.miProyectosCount = data.filter(p =>
          p.investigadores?.some((i: any) => i.correo_institucional?.toLowerCase() === correo)
        ).length;
        this.cdr.detectChanges();
      }
    });

    this.publicacionService.getPublicaciones().subscribe({
      next: (data) => {
        this.miPublicacionesCount = data.filter((p: any) =>
          p.investigadores?.some((i: any) => i.correo_institucional?.toLowerCase() === correo)
        ).length;
        this.cdr.detectChanges();
      }
    });
  }

  initForm(data?: Investigador) {
    this.uploadPreview = null;
    this.investigadorForm = this.fb.group({
      nombres: [data?.nombres || '', [Validators.required, Validators.minLength(3)]],
      orcid: [data?.orcid || ''],
      correo_institucional: [data?.correo_institucional || this.usuario?.correo || '', [Validators.required, Validators.email]],
      biografia: [data?.biografia || '', [Validators.required, Validators.minLength(10)]],
      posicion: [data?.posicion || 'Investigador', [Validators.required]],
      foto_url: [data?.foto_url || ''],
      red_facebook: [data?.red_facebook || ''],
      red_linkedin: [data?.red_linkedin || ''],
      red_instagram: [data?.red_instagram || ''],
      red_telegram: [data?.red_telegram || '']
    });
  }

  editarMiPerfil() {
    if (this.miPerfil) {
      this.initForm(this.miPerfil);
      this.showForm = true;
      this.cdr.detectChanges();
    }
  }

  guardarInvestigador() {
    if (this.investigadorForm.invalid || !this.miPerfil?.id) return;
    this.isSubmitting = true;
    const val = this.investigadorForm.value;

    this.investigadorService.actualizarInvestigador(this.miPerfil.id, val).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.toastService.show('Perfil actualizado exitosamente.', 'success');
        this.cargarPerfil();
        this.cancelForm();
      },
      error: () => {
        this.isSubmitting = false;
        this.cdr.detectChanges();
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.toastService.show('Por favor seleccione un archivo de imagen válido.', 'warning');
      return;
    }

    this.isUploading = true;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.uploadPreview = e.target.result as string;
      this.cdr.detectChanges();

      const base64Data = (e.target.result as string).split(',')[1];
      this.investigadorService.subirFoto(file.name, base64Data).subscribe({
        next: (res) => {
          this.isUploading = false;
          if (res && res.success) {
            this.investigadorForm.patchValue({ foto_url: res.url });
            this.cdr.detectChanges();
            this.toastService.show('¡Imagen de perfil subida exitosamente!', 'success');
          }
        },
        error: (err) => {
          this.isUploading = false;
          this.cdr.detectChanges();
          console.error('Error al subir imagen:', err);
          this.toastService.show('Error al subir la imagen al servidor.', 'error');
        }
      });
    };
    reader.readAsDataURL(file);
  }

  cancelForm() {
    this.showForm = false;
    this.uploadPreview = null;
    this.cdr.detectChanges();
  }

  initPasswordForm() {
    this.passwordForm = this.fb.group({
      passwordActual: ['', [Validators.required]],
      passwordNuevo: ['', [Validators.required, Validators.minLength(6)]],
      passwordConfirmar: ['', [Validators.required]]
    }, { validators: this.passwordsCoinciden });
  }

  passwordsCoinciden(group: FormGroup) {
    const nuevo = group.get('passwordNuevo')?.value;
    const confirmar = group.get('passwordConfirmar')?.value;
    return nuevo === confirmar ? null : { noCoinciden: true };
  }

  cambiarPassword() {
    this.passwordSubmitAttempted = true;
    this.passwordForm.markAllAsTouched();
    if (this.passwordForm.invalid) {
      this.cdr.detectChanges();
      return;
    }
    this.isSubmittingPassword = true;
    const { passwordActual, passwordNuevo } = this.passwordForm.value;

    this.authService.cambiarPassword(passwordActual, passwordNuevo).subscribe({
      next: () => {
        this.isSubmittingPassword = false;
        this.toastService.show('Contraseña actualizada exitosamente.', 'success');
        this.showPasswordForm = false;
        this.initPasswordForm();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isSubmittingPassword = false;
        const msg = err?.error?.message || 'Error al actualizar la contraseña.';
        this.toastService.show(msg, 'error');
        this.cdr.detectChanges();
      }
    });
  }

  cancelPasswordForm() {
    this.showPasswordForm = false;
    this.passwordSubmitAttempted = false;
    this.showPasswordActual = false;
    this.showPasswordNuevo = false;
    this.showPasswordConfirmar = false;
    this.initPasswordForm();
    this.cdr.detectChanges();
  }

  get passwordStrength(): { level: number; label: string; hint: string } {
    const val: string = this.passwordForm?.get('passwordNuevo')?.value || '';
    if (!val) return { level: 0, label: '', hint: '' };
    let score = 0;
    if (val.length >= 6) score++;
    if (val.length >= 10) score++;
    if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    if (score <= 1) return { level: 1, label: 'Muy débil', hint: 'Muy fácil de adivinar' };
    if (score === 2) return { level: 2, label: 'Débil', hint: 'Agrega mayúsculas y números' };
    if (score === 3) return { level: 3, label: 'Moderada', hint: 'Añade símbolos para más seguridad' };
    return { level: 4, label: 'Muy segura', hint: '¡Excelente contraseña!' };
  }

  getSegmentColor(segment: number): string {
    const { level } = this.passwordStrength;
    if (level === 0 || segment > level) return '#e2e8f0';
    if (level === 1) return '#ef4444';
    if (level === 2) return '#f97316';
    if (level === 3) return '#f59e0b';
    return '#3c9632';
  }

  getStrengthColor(): string {
    const { level } = this.passwordStrength;
    if (level === 1) return '#ef4444';
    if (level === 2) return '#f97316';
    if (level === 3) return '#f59e0b';
    if (level === 4) return '#3c9632';
    return '#94a3b8';
  }

  isFieldInvalid(controlName: string): boolean {
    const ctrl = this.passwordForm.get(controlName);
    return !!(ctrl?.invalid && (ctrl.touched || this.passwordSubmitAttempted));
  }

  isFieldValid(controlName: string): boolean {
    const ctrl = this.passwordForm.get(controlName);
    return !!(ctrl?.valid && ctrl.dirty);
  }

  obtenerFotoUrl(url: string | null | undefined): string {
    if (!url) return this.defaultAvatar;
    if (url.startsWith('data:image/')) return url;
    if (url.startsWith('assets/images/team/')) {
      return `http://127.0.0.1:3000/${url}`;
    }
    return url;
  }
}
