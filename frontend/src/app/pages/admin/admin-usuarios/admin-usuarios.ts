import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UsuarioService, Usuario } from '../../../core/services/usuario.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-usuarios.html',
  styleUrls: ['./admin-usuarios.css']
})
export class AdminUsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  showForm = false;
  editMode = false;
  editId: number | null = null;
  isSubmitting = false;
  isResending: number | null = null;
  usuarioForm!: FormGroup;

  readonly ROLES = [
    { value: 'investigador', label: 'Investigador' },
    { value: 'admin',        label: 'Administrador' },
  ];

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarUsuarios();
    this.initForm();
  }

  cargarUsuarios() {
    this.usuarioService.getUsuarios().subscribe({
      next: (res) => { this.usuarios = res.data; this.cdr.detectChanges(); },
      error: () => this.toastService.show('Error al cargar usuarios.', 'error')
    });
  }

  initForm(data?: Usuario) {
    this.usuarioForm = this.fb.group({
      nombres: [data?.nombres || '', [Validators.required, Validators.minLength(3)]],
      correo:  [data?.correo  || '', [Validators.required, Validators.email]],
      rol:     [data?.rol     || 'investigador', Validators.required],
    });
    if (this.editMode) {
      this.usuarioForm.get('correo')?.disable();
    }
  }

  nuevoUsuario() {
    this.editMode = false;
    this.editId = null;
    this.initForm();
    this.showForm = true;
    this.cdr.detectChanges();
  }

  editarUsuario(u: Usuario) {
    this.editMode = true;
    this.editId = u.id;
    this.initForm(u);
    this.showForm = true;
    this.cdr.detectChanges();
  }

  guardar() {
    if (this.usuarioForm.invalid) return;
    this.isSubmitting = true;
    const val = this.usuarioForm.getRawValue();

    const op = this.editMode && this.editId
      ? this.usuarioService.actualizarUsuario(this.editId, { nombres: val.nombres, rol: val.rol })
      : this.usuarioService.crearUsuario(val);

    op.subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.toastService.show(res.message, 'success');
        this.cancelar();
        this.cargarUsuarios();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.toastService.show(err?.error?.message || 'Error al guardar.', 'error');
        this.cdr.detectChanges();
      }
    });
  }

  reenviarActivacion(u: Usuario) {
    this.isResending = u.id;
    this.usuarioService.reenviarActivacion(u.id).subscribe({
      next: (res) => {
        this.isResending = null;
        this.toastService.show(res.message, 'success');
        this.cargarUsuarios();
      },
      error: (err) => {
        this.isResending = null;
        this.toastService.show(err?.error?.message || 'Error al reenviar.', 'error');
        this.cdr.detectChanges();
      }
    });
  }

  eliminarUsuario(u: Usuario) {
    if (!confirm(`¿Eliminar al usuario "${u.nombres}"? Esta acción no se puede deshacer.`)) return;
    this.usuarioService.eliminarUsuario(u.id).subscribe({
      next: (res) => { this.toastService.show(res.message, 'success'); this.cargarUsuarios(); },
      error: (err) => this.toastService.show(err?.error?.message || 'Error al eliminar.', 'error')
    });
  }

  cancelar() {
    this.showForm = false;
    this.editMode = false;
    this.editId = null;
    this.cdr.detectChanges();
  }

  pendienteActivacion(u: Usuario): boolean {
    if (!u.reset_password_expires) return false;
    return new Date(u.reset_password_expires) > new Date();
  }

  rolLabel(rol: string): string {
    return this.ROLES.find(r => r.value === rol)?.label ?? rol;
  }
}
