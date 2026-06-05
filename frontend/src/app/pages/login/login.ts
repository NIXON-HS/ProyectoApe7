import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

// Services
import { AuthService } from '../../core/services/auth.service';
import { InvestigadorService } from '../../core/services/investigador.service';
import { ProyectoService } from '../../core/services/proyecto.service';
import { PublicacionService } from '../../core/services/publicacion.service';
import { ContactoService } from '../../core/services/contacto.service';
import { ToastService } from '../../core/services/toast.service';

// Models
import { Investigador } from '../../core/models/investigador.model';
import { Proyecto } from '../../core/models/proyecto.model';
import { Publicacion } from '../../core/models/publicacion.model';
import { Contacto } from '../../core/models/contacto.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {
  // Session & UI Navigation State
  isLoggedIn = false;
  usuario: any = null;
  activeTab: 'resumen' | 'investigadores' | 'proyectos' | 'publicaciones' | 'mensajes' | 'perfil' = 'resumen';
  showPassword = false; // Toggler de visibilidad de contraseña

  // Forms
  loginForm!: FormGroup;
  investigadorForm!: FormGroup;
  proyectoForm!: FormGroup;
  publicacionForm!: FormGroup;

  // Data collections
  investigadores: Investigador[] = [];
  proyectos: Proyecto[] = [];
  publicaciones: Publicacion[] = [];
  mensajes: Contacto[] = [];

  // Search & Filter Query
  searchQuery = '';

  // Loading & Action states
  isLoading = false;
  isSubmitting = false;
  isUploading = false;
  defaultAvatar = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23e2e8f0"/><path d="M50 50 A 15 15 0 1 0 50 20 A 15 15 0 1 0 50 50 Z M50 60 C 30 60 20 75 20 90 L 80 90 C 80 75 70 60 50 60 Z" fill="%2394a3b8"/></svg>';
  selectedMessage: Contacto | null = null;
  
  // Create / Edit active records
  editMode = false;
  activeRecordId: number | null = null;
  showForm = false; // Toggles forms within tabs

  // Research lines hardcoded to match the database and schema
  lineasDeInvestigacion = [
    { id: 1, nombre: 'Diseño, Materiales, Producción, Identidad, Sostenibilidad y Tecnologías aplicadas', abreviatura: 'DMP-IST' },
    { id: 2, nombre: 'Software, Tecnologías de la Información y Ciencias de Datos', abreviatura: 'ST-ICD' },
    { id: 3, nombre: 'Energía, Desarrollo Sostenible y Gestión de Recursos Naturales', abreviatura: 'ED-SGRN' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private investigadorService: InvestigadorService,
    private proyectoService: ProyectoService,
    private publicacionService: PublicacionService,
    private contactoService: ContactoService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit() {
    this.initLoginForm();
    this.checkSession();
  }

  // ==========================================
  // AUTENTICACIÓN Y SESIÓN
  // ==========================================
  checkSession() {
    const token = this.authService.getToken();
    const storedUser = this.authService.getUsuarioActual();

    if (token && storedUser) {
      // Mostrar el dashboard inmediatamente con el usuario de localStorage
      this.usuario = storedUser;
      this.isLoggedIn = true;
      // Cargar datos de inmediato (en paralelo)
      this.cargarTodo();
      // Verificar el token en background — si expiró, desloguear silenciosamente
      this.authService.verifyToken().subscribe(res => {
        if (!res) {
          // Token inválido: desloguear
          this.isLoggedIn = false;
          this.usuario = null;
          this.toastService.show('Tu sesión expiró. Por favor inicia sesión de nuevo.', 'warning');
        } else {
          // Actualizar usuario con datos frescos del token
          this.usuario = res.data?.usuario ?? this.usuario;
        }
      });
    } else if (token && !storedUser) {
      // Token sin usuario: limpiar
      this.authService.logout();
      this.isLoggedIn = false;
      this.usuario = null;
    } else {
      this.isLoggedIn = false;
      this.usuario = null;
    }
  }

  get miPerfil(): Investigador | null {
    if (!this.usuario) return null;
    return this.investigadores.find(i => i.correo_institucional?.toLowerCase() === this.usuario?.correo?.toLowerCase()) || null;
  }

  obtenerFotoUrl(url: string | null | undefined): string {
    if (!url) return this.defaultAvatar;
    if (url.startsWith('data:image/')) return url;
    if (url.startsWith('assets/images/team/')) {
      return `http://127.0.0.1:3000/${url}`;
    }
    return url;
  }

  editarMiPerfil() {
    const p = this.miPerfil;
    if (p) {
      this.editMode = true;
      this.activeRecordId = p.id;
      this.initInvestigadorForm(p);
    }
  }

  initLoginForm() {
    this.loginForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onLogin() {
    if (this.loginForm.invalid) return;
    this.isSubmitting = true;

    const { correo, password } = this.loginForm.value;
    this.authService.login(correo, password).subscribe({
      next: (res) => {
        this.usuario = res.data.usuario;
        this.isLoggedIn = true;       // Show dashboard immediately
        this.isSubmitting = false;    // Stop spinner
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top to show dashboard
        this.toastService.show(`¡Bienvenido, ${res.data.usuario?.nombres || 'Usuario'}!`, 'success');
        this.cargarTodo();            // Load data in background (non-blocking)
      },
      error: (err) => {
        this.isSubmitting = false;
        const msg = err?.error?.message || 'Credenciales incorrectas. Verifica tu correo y contraseña.';
        this.toastService.show(msg, 'error');
        console.error('Error logging in:', err);
      }
    });
  }

  onLogout() {
    this.authService.logout();
    this.isLoggedIn = false;
    this.usuario = null;
    this.toastService.show('Sesión cerrada correctamente.', 'info');
    this.router.navigate(['/']);
  }

  // ==========================================
  // HELPERS DE ACCESO Y COPIADO
  // ==========================================
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  copyCredential(role: 'admin' | 'investigador') {
    const email = role === 'admin' ? 'admin@reasons.uta.edu.ec' : 'investigador@reasons.uta.edu.ec';
    const password = role === 'admin' ? 'admin123' : 'user123';
    
    // Rellenar automáticamente el formulario
    this.loginForm.patchValue({
      correo: email,
      password: password
    });
    this.loginForm.markAllAsTouched();

    // Copiar al portapapeles
    const credentialText = `Usuario: ${email}\nContraseña: ${password}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(credentialText).then(() => {
        this.toastService.show(`Credenciales autocompletadas. Presiona "Ingresar al Portal" para continuar.`, 'success');
      }).catch(() => {
        this.toastService.show(`Credenciales autocompletadas en el formulario.`, 'info');
      });
    } else {
      this.toastService.show(`Credenciales autocompletadas en el formulario.`, 'info');
    }
    // El usuario debe hacer clic en "Ingresar al Portal" manualmente
  }

  copiarCitaAlPortapapeles() {
    const cita = this.publicacionForm.get('cita')?.value;
    if (!cita) {
      this.toastService.show('Primero debes generar la cita APA.', 'warning');
      return;
    }
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(cita).then(() => {
        this.toastService.show('¡Cita APA copiada al portapapeles exitosamente!', 'success');
      }).catch(() => {
        this.toastService.show('Error al copiar cita. Por favor selecciona el texto manualmente.', 'error');
      });
    } else {
      this.toastService.show('El navegador no soporta el copiado automático.', 'error');
    }
  }

  irARegistrarProyecto() {
    this.switchTab('proyectos');
    this.nuevoProyecto();
  }

  irARegistrarPublicacion() {
    this.switchTab('publicaciones');
    this.nuevaPublicacion();
  }

  // ==========================================
  // CARGA DE DATOS DESDE LA API
  // ==========================================
  cargarTodo() {
    this.isLoading = true;

    // Re-evaluate rol fresh at call time to avoid closure capture issues
    const rol = this.usuario?.rol ?? '';
    const esAdmin = rol === 'admin';

    // Track each parallel load with a simple counter
    let pendientes = esAdmin ? 4 : 3;
    const finalizarUna = () => {
      pendientes--;
      if (pendientes <= 0) {
        this.isLoading = false;
      }
    };

    // Safety timeout: if any request hangs, force-stop loading after 10s
    const safetyTimer = setTimeout(() => {
      if (this.isLoading) {
        this.isLoading = false;
        console.warn('cargarTodo: timeout de seguridad alcanzado, forzando fin de carga.');
      }
    }, 10000);

    // 1. Investigadores
    this.investigadorService.getInvestigadores().subscribe({
      next: (data) => { this.investigadores = data; finalizarUna(); },
      error: (err) => { console.error('Error cargando investigadores:', err); finalizarUna(); }
    });

    // 2. Proyectos
    this.proyectoService.getProyectos().subscribe({
      next: (data) => {
        const correoUsuario = this.usuario?.correo?.toLowerCase();
        this.proyectos = esAdmin ? data : data.filter(p =>
          p.investigadores?.some((i: any) => i.correo_institucional?.toLowerCase() === correoUsuario)
        );
        finalizarUna();
      },
      error: (err) => { console.error('Error cargando proyectos:', err); finalizarUna(); }
    });

    // 3. Publicaciones
    this.publicacionService.getPublicaciones().subscribe({
      next: (data) => {
        const correoUsuario = this.usuario?.correo?.toLowerCase();
        this.publicaciones = esAdmin ? data : data.filter((p: any) =>
          p.investigadores?.some((i: any) => i.correo_institucional?.toLowerCase() === correoUsuario)
        );
        finalizarUna();
      },
      error: (err) => { console.error('Error cargando publicaciones:', err); finalizarUna(); }
    });

    // 4. Mensajes (solo admin)
    if (esAdmin) {
      this.contactoService.getContactos().subscribe({
        next: (data) => { this.mensajes = data; finalizarUna(); },
        error: (err) => { console.error('Error cargando mensajes:', err); finalizarUna(); }
      });
    } else {
      this.mensajes = [];
    }

    // Clear safety timer once all loaded
    const originalFinalizar = finalizarUna;
    // Timer auto-clears via the timeout itself; no additional cleanup needed
    void safetyTimer; // suppress unused warning
  }

  // ==========================================
  // TAB NAVIGATION
  // ==========================================
  switchTab(tab: 'resumen' | 'investigadores' | 'proyectos' | 'publicaciones' | 'mensajes' | 'perfil') {
    this.activeTab = tab;
    this.searchQuery = '';
    this.cancelForm();
    
    if (tab === 'perfil') {
      // Iniciar el perfil en vista previa
      this.showForm = false;
    }
  }

  // ==========================================
  // FORMULARIO DE INVESTIGADORES
  // ==========================================
  initInvestigadorForm(data?: Investigador) {
    this.investigadorForm = this.fb.group({
      nombres: [data?.nombres || '', [Validators.required, Validators.minLength(3)]],
      orcid: [data?.orcid || ''],
      correo_institucional: [data?.correo_institucional || '', [Validators.required, Validators.email]],
      biografia: [data?.biografia || '', [Validators.required, Validators.minLength(10)]],
      posicion: [data?.posicion || 'Investigador', [Validators.required]],
      foto_url: [data?.foto_url || ''],
      red_facebook: [data?.red_facebook || ''],
      red_linkedin: [data?.red_linkedin || ''],
      red_instagram: [data?.red_instagram || ''],
      red_telegram: [data?.red_telegram || '']
    });
    this.showForm = true;
  }

  nuevoInvestigador() {
    this.editMode = false;
    this.activeRecordId = null;
    this.initInvestigadorForm();
  }

  editarInvestigador(inv: Investigador) {
    this.editMode = true;
    this.activeRecordId = inv.id;
    this.initInvestigadorForm(inv);
  }

  guardarInvestigador() {
    if (this.investigadorForm.invalid) return;
    this.isSubmitting = true;
    const val = this.investigadorForm.value;

    if (this.editMode && this.activeRecordId) {
      this.investigadorService.actualizarInvestigador(this.activeRecordId, val).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.toastService.show('Investigador actualizado exitosamente.', 'success');
          this.cargarTodo();
          this.cancelForm();
        },
        error: () => this.isSubmitting = false
      });
    } else {
      this.investigadorService.crearInvestigador(val).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.toastService.show('Investigador registrado exitosamente.', 'success');
          this.cargarTodo();
          this.cancelForm();
        },
        error: () => this.isSubmitting = false
      });
    }
  }

  eliminarInvestigador(id: number, nombres: string) {
    if (confirm(`¿Está seguro de que desea eliminar a "${nombres}"? Esta acción no se puede deshacer.`)) {
      this.investigadorService.eliminarInvestigador(id).subscribe({
        next: () => {
          this.toastService.show('Investigador eliminado.', 'info');
          this.cargarTodo();
        },
        error: (err) => console.error(err)
      });
    }
  }

  // ==========================================
  // FORMULARIO DE PROYECTOS
  // ==========================================
  initProyectoForm(data?: Proyecto) {
    // Array of selected researcher IDs
    const currentInvIds = data?.investigadores?.map(i => i.id) || [];
    
    this.proyectoForm = this.fb.group({
      titulo: [data?.titulo || '', [Validators.required]],
      descripcion: [data?.descripcion || '', [Validators.required]],
      objetivos: [data?.objetivos || '', [Validators.required]],
      resultados: [data?.resultados || '', [Validators.required]],
      estado: [data?.estado || 'Activo', [Validators.required]],
      linea_id: [data?.linea_id || 1, [Validators.required]],
      investigadores: [currentInvIds] // Array values
    });
    this.showForm = true;
  }

  nuevoProyecto() {
    this.editMode = false;
    this.activeRecordId = null;
    this.initProyectoForm();
  }

  editarProyecto(proj: Proyecto) {
    this.editMode = true;
    this.activeRecordId = proj.id;
    this.initProyectoForm(proj);
  }

  // Toggle selection in multi-select array helper
  toggleProyectoInvestigador(id: number) {
    const control = this.proyectoForm.get('investigadores');
    if (!control) return;
    const current = [...(control.value || [])];
    const idx = current.indexOf(id);
    if (idx > -1) {
      current.splice(idx, 1);
    } else {
      current.push(id);
    }
    control.setValue(current);
  }

  isProyectoInvestigadorSelected(id: number): boolean {
    const control = this.proyectoForm?.get('investigadores');
    return control ? (control.value || []).includes(id) : false;
  }

  guardarProyecto() {
    if (this.proyectoForm.invalid) return;
    this.isSubmitting = true;
    const val = this.proyectoForm.value;

    if (this.editMode && this.activeRecordId) {
      this.proyectoService.actualizarProyecto(this.activeRecordId, val).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.toastService.show('Proyecto actualizado exitosamente.', 'success');
          this.cargarTodo();
          this.cancelForm();
        },
        error: () => this.isSubmitting = false
      });
    } else {
      this.proyectoService.crearProyecto(val).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.toastService.show('Proyecto registrado exitosamente.', 'success');
          this.cargarTodo();
          this.cancelForm();
        },
        error: () => this.isSubmitting = false
      });
    }
  }

  eliminarProyecto(id: number, titulo: string) {
    if (confirm(`¿Está seguro de que desea eliminar el proyecto "${titulo}"?`)) {
      this.proyectoService.eliminarProyecto(id).subscribe({
        next: () => {
          this.toastService.show('Proyecto eliminado.', 'info');
          this.cargarTodo();
        },
        error: (err) => console.error(err)
      });
    }
  }

  // ==========================================
  // FORMULARIO DE PUBLICACIONES
  // ==========================================
  initPublicacionForm(data?: Publicacion) {
    const currentInvIds = data?.investigadores?.map(i => i.id) || [];

    this.publicacionForm = this.fb.group({
      titulo: [data?.titulo || '', [Validators.required]],
      resumen: [data?.resumen || '', [Validators.required]],
      cita: [data?.cita || '', [Validators.required]],
      revista_portada_url: [data?.revista_portada_url || ''],
      doi_url: [data?.doi_url || ''],
      linea_id: [data?.linea_id || 1, [Validators.required]],
      investigadores: [currentInvIds]
    });
    this.showForm = true;
  }

  nuevaPublicacion() {
    this.editMode = false;
    this.activeRecordId = null;
    this.initPublicacionForm();
  }

  editarPublicacion(pub: Publicacion) {
    this.editMode = true;
    this.activeRecordId = pub.id;
    this.initPublicacionForm(pub);
  }

  togglePublicacionInvestigador(id: number) {
    const control = this.publicacionForm.get('investigadores');
    if (!control) return;
    const current = [...(control.value || [])];
    const idx = current.indexOf(id);
    if (idx > -1) {
      current.splice(idx, 1);
    } else {
      current.push(id);
    }
    control.setValue(current);
  }

  isPublicacionInvestigadorSelected(id: number): boolean {
    const control = this.publicacionForm?.get('investigadores');
    return control ? (control.value || []).includes(id) : false;
  }

  generarCitaAPA() {
    const titulo = this.publicacionForm.get('titulo')?.value || '[Título]';
    const doi = this.publicacionForm.get('doi_url')?.value || '';
    
    // Tomar apellidos de los investigadores seleccionados
    const seleccionados = this.publicacionForm.get('investigadores')?.value || [];
    let autoresStr = 'Razons, G.';
    
    if (seleccionados.length > 0) {
      const apellidos = this.investigadores
        .filter(i => seleccionados.includes(i.id))
        .map(i => {
          const partes = i.nombres.split(' ');
          const apellido = partes[partes.length - 2] || partes[0]; // Penúltimo o primero
          const inicial = partes[0] ? partes[0].charAt(0) : 'I';
          return `${apellido}, ${inicial}.`;
        });
      
      if (apellidos.length === 1) {
        autoresStr = apellidos[0];
      } else if (apellidos.length > 1) {
        const last = apellidos.pop();
        autoresStr = `${apellidos.join(', ')} & ${last}`;
      }
    }

    const anio = new Date().getFullYear();
    const citaGenerada = `${autoresStr} (${anio}). ${titulo}. Revista Técnica de Ingeniería UTA. ${doi ? `Obtenido de ${doi}` : ''}`;
    this.publicacionForm.get('cita')?.setValue(citaGenerada);
    this.toastService.show('Cita APA generada automáticamente.', 'info');
  }

  guardarPublicacion() {
    if (this.publicacionForm.invalid) return;
    this.isSubmitting = true;
    const val = this.publicacionForm.value;

    if (this.editMode && this.activeRecordId) {
      this.publicacionService.actualizarPublicacion(this.activeRecordId, val).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.toastService.show('Publicación científica actualizada.', 'success');
          this.cargarTodo();
          this.cancelForm();
        },
        error: () => this.isSubmitting = false
      });
    } else {
      this.publicacionService.crearPublicacion(val).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.toastService.show('Publicación científica registrada.', 'success');
          this.cargarTodo();
          this.cancelForm();
        },
        error: () => this.isSubmitting = false
      });
    }
  }

  eliminarPublicacion(id: number, titulo: string) {
    if (confirm(`¿Está seguro de que desea eliminar la publicación "${titulo}"?`)) {
      this.publicacionService.eliminarPublicacion(id).subscribe({
        next: () => {
          this.toastService.show('Publicación eliminada.', 'info');
          this.cargarTodo();
        },
        error: (err) => console.error(err)
      });
    }
  }

  // ==========================================
  // MENSAJES DE CONTACTO
  // ==========================================
  verDetalleMensaje(msg: Contacto) {
    this.selectedMessage = msg;
  }

  cerrarMensaje() {
    this.selectedMessage = null;
  }

  eliminarMensaje(id: number) {
    if (confirm('¿Está seguro de que desea eliminar este mensaje de contacto?')) {
      this.contactoService.eliminarContacto(id).subscribe({
        next: () => {
          this.toastService.show('Mensaje de contacto eliminado.', 'info');
          this.cerrarMensaje();
          this.cargarTodo();
        },
        error: (err) => console.error(err)
      });
    }
  }

  // ==========================================
  // BÚSQUEDA Y CANCELACIÓN
  // ==========================================
  cancelForm() {
    this.showForm = false;
    this.editMode = false;
    this.activeRecordId = null;
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
      const base64Data = e.target.result.split(',')[1];
      this.investigadorService.subirFoto(file.name, base64Data).subscribe({
        next: (res) => {
          this.isUploading = false;
          if (res && res.success) {
            this.investigadorForm.patchValue({
              foto_url: res.url
            });
            this.toastService.show('¡Imagen de perfil subida y vinculada exitosamente!', 'success');
          }
        },
        error: (err) => {
          this.isUploading = false;
          console.error('Error al subir imagen:', err);
          this.toastService.show('Error al subir la imagen al servidor.', 'error');
        }
      });
    };
    reader.readAsDataURL(file);
  }

  filtrarLista(items: any[]): any[] {
    if (!this.searchQuery) return items;
    const q = this.searchQuery.toLowerCase();
    
    return items.filter(item => {
      if (item.nombres) return item.nombres.toLowerCase().includes(q) || item.correo_institucional.toLowerCase().includes(q);
      if (item.titulo) return item.titulo.toLowerCase().includes(q) || (item.descripcion && item.descripcion.toLowerCase().includes(q));
      if (item.nombre_completo) return item.nombre_completo.toLowerCase().includes(q) || item.asunto.toLowerCase().includes(q) || item.mensaje.toLowerCase().includes(q);
      return false;
    });
  }

  getAbreviaturaLinea(lineaId: number): string {
    const l = this.lineasDeInvestigacion.find(x => x.id === lineaId);
    return l ? l.abreviatura : 'N/A';
  }
}
