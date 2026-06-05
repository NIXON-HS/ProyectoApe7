import { Component, OnInit, ViewChild, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BlockEditorComponent, Block } from '../../shared/block-editor/block-editor';
import { InfoGrupoService } from '../../core/services/info-grupo.service';
import { InfoGrupo, LineaInvestigacion } from '../../core/models/info-grupo.model';

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
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink, BlockEditorComponent],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {
  // Session & UI Navigation State
  isLoggedIn = false;
  usuario: any = null;
  activeTab: 'resumen' | 'investigadores' | 'proyectos' | 'publicaciones' | 'mensajes' | 'perfil' | 'info' | 'lineas' = 'resumen';
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

  // Block editor state – proyecto
  proyDescBlocks: Block[] = [];
  proyObjBlocks:  Block[] = [];
  proyResBlocks:  Block[] = [];

  // Block editor state – publicacion
  pubResumenBlocks: Block[] = [];

  // Mode toggles: false = simple textarea, true = block editor
  proyectoModoFlexible = false;
  pubModoFlexible = false;

  // ── Info del Grupo ────────────────────────────────────────────────────────
  infoGrupo: InfoGrupo = {};
  lineasAdmin: LineaInvestigacion[] = [];

  // Block state for info grupo fields
  infoDescBlocks:  Block[] = [];
  infoMisionBlocks: Block[] = [];
  infoObjGenBlocks: Block[] = [];
  infoObjEspBlocks: Block[] = [];

  // Controls whether block editors are rendered (true only after data is loaded)
  infoLoaded = false;

  // Mode toggles for info fields
  infoDescModo   = false;
  infoMisionModo = false;
  infoObjGenModo = false;
  infoObjEspModo = false;

  // Línea form
  lineaEditando: LineaInvestigacion | null = null;
  lineaForm!: FormGroup;
  lineaModoFlexible = false;
  lineaDescBlocks: Block[] = [];
  showLineaForm = false;
  lineaPendienteEliminar: LineaInvestigacion | null = null; // for inline confirm UI

  // ViewChild refs for block editors (accessed after form is shown)
  @ViewChild('editorDesc')    editorDesc?:    BlockEditorComponent;
  @ViewChild('editorObj')     editorObj?:     BlockEditorComponent;
  @ViewChild('editorRes')     editorRes?:     BlockEditorComponent;
  @ViewChild('editorResumen') editorResumen?: BlockEditorComponent;

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
    private router: Router,
    private infoGrupoSvc: InfoGrupoService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
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
      this.usuario = storedUser;
      this.isLoggedIn = true;
      this.cdr.detectChanges();
      this.cargarTodo();
      this.authService.verifyToken().subscribe(res => {
        if (!res) {
          this.isLoggedIn = false;
          this.usuario = null;
          this.toastService.show('Tu sesión expiró. Por favor inicia sesión de nuevo.', 'warning');
        } else {
          this.usuario = res.data?.usuario ?? this.usuario;
        }
        this.cdr.detectChanges();
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
        this.isLoggedIn = true;
        this.isSubmitting = false;
        window.scrollTo({ top: 0, behavior: 'smooth' });
        this.toastService.show(`¡Bienvenido, ${res.data.usuario?.nombres || 'Usuario'}!`, 'success');
        this.cdr.detectChanges();
        this.cargarTodo();
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
        this.cdr.detectChanges();
      }
    };

    // Safety timeout — wrapped in NgZone so change detection fires
    setTimeout(() => {
      this.ngZone.run(() => {
        if (this.isLoading) {
          this.isLoading = false;
          this.cdr.detectChanges();
          console.warn('cargarTodo: timeout de seguridad alcanzado.');
        }
      });
    }, 8000);

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
  }

  // ==========================================
  // TAB NAVIGATION
  // ==========================================
  switchTab(tab: 'resumen' | 'investigadores' | 'proyectos' | 'publicaciones' | 'mensajes' | 'perfil' | 'info' | 'lineas') {
    this.activeTab = tab;
    this.searchQuery = '';
    this.cancelForm();
    if (tab === 'perfil') this.showForm = false;
    if (tab === 'info')   this.cargarInfoGrupo();
    if (tab === 'lineas') this.cargarLineas();
  }

  cargarLineas() {
    this.infoGrupoSvc.getLineas().subscribe({
      next: (data) => { this.lineasAdmin = data; this.cdr.detectChanges(); },
      error: () => {}
    });
  }

  // ==========================================
  // INFO DEL GRUPO
  // ==========================================
  // ── Fallback defaults (same as home.ts constants) ────────────────────────
  private readonly DEFAULTS = {
    logo_url:              '/logo.svg',
    descripcion:           'Impulsamos la excelencia en investigación multidisciplinaria uniendo la optimización de procesos industriales, el desarrollo tecnológico computacional, la armonía con la naturaleza y el beneficio de la sociedad.',
    mision:                'Generar, promover y difundir conocimiento científico y tecnológico de vanguardia e impacto multidisciplinario, articulando la ingeniería avanzada con procesos de sostenibilidad industrial y ambiental, para aportar con soluciones innovadoras a las problemáticas actuales de la naturaleza y el beneficio de la sociedad andina y global.',
    objetivo_general:      'Consolidarse como un grupo de investigación multidisciplinario líder y de referencia nacional e internacional en la optimización de sistemas productivos, desarrollo tecnológico sustentable y ciencia de datos, aportando soluciones eficientes y amigables con el medio ambiente aplicables a las dinámicas del sector industrial y social del país.',
    objetivos_especificos: 'Publicar artículos científicos de alta calidad en revistas indexadas internacionalmente (Scopus, WoS).\nDesarrollar proyectos piloto conjuntos con industrias metalmecánicas, textiles y ambientales de la región.\nFormar investigadores jóvenes de pregrado y posgrado mediante la tutoría de tesis de excelencia.\nIntegrar hardware y software inteligente (IoT, AI) aplicados al desarrollo ecológico y optimización de recursos.',
    dominio:               'Optimización de los Sistemas Productivos, Diseño y Desarrollo Urbanístico de la Facultad de Ingeniería en Sistemas, Electrónica e Industrial de la Universidad Técnica de Ambato.',
    proyectos_titulo:      'Nuestros Proyectos de Investigación',
    proyectos_descripcion: 'Explore los proyectos científicos liderados por REASONS, desarrollados en colaboración con socios industriales e instituciones académicas nacionales.',
    publicaciones_titulo:       'Publicaciones Científicas',
    publicaciones_descripcion:  'Consulte los artículos científicos, ponencias y contribuciones de los investigadores de REASONS indexados en journals internacionales de alto impacto.',
    contacto_titulo:       'Contacte con Nosotros',
    contacto_descripcion:  '¿Tiene alguna consulta sobre nuestras líneas de investigación, proyectos o desea colaborar con nosotros? Complete el formulario y responderemos lo antes posible.',
    contacto_email:        'reasons@uta.edu.ec',
    contacto_telefono:     '(03) 240-0200',
    contacto_direccion:    'Facultad de Ingeniería en Sistemas, Electrónica e Industrial. Av. de Los Chasquis y Av. Río Payamino. Universidad Técnica de Ambato.',
  };

  cargarInfoGrupo() {
    this.infoLoaded = false;
    this.cdr.detectChanges();
    this.infoGrupoSvc.getInfoGrupo().subscribe({
      next: (data) => {
        // Populate with defaults for any null fields so the admin sees current content
        const d = this.DEFAULTS;
        this.infoGrupo = {
          logo_url:                  data.logo_url                  || d.logo_url,
          descripcion:               data.descripcion               || d.descripcion,
          descripcion_json:          data.descripcion_json          ?? null,
          mision:                    data.mision                    || d.mision,
          mision_json:               data.mision_json               ?? null,
          objetivo_general:          data.objetivo_general          || d.objetivo_general,
          objetivo_general_json:     data.objetivo_general_json     ?? null,
          objetivos_especificos:     data.objetivos_especificos     || d.objetivos_especificos,
          objetivos_especificos_json: data.objetivos_especificos_json ?? null,
          dominio:                   data.dominio                   || d.dominio,
          proyectos_titulo:          data.proyectos_titulo          || d.proyectos_titulo,
          proyectos_descripcion:     data.proyectos_descripcion     || d.proyectos_descripcion,
          publicaciones_titulo:      data.publicaciones_titulo      || d.publicaciones_titulo,
          publicaciones_descripcion: data.publicaciones_descripcion || d.publicaciones_descripcion,
          contacto_titulo:           data.contacto_titulo           || d.contacto_titulo,
          contacto_descripcion:      data.contacto_descripcion      || d.contacto_descripcion,
          contacto_email:            data.contacto_email            || d.contacto_email,
          contacto_telefono:         data.contacto_telefono         || d.contacto_telefono,
          contacto_direccion:        data.contacto_direccion        || d.contacto_direccion,
        };

        this.infoDescBlocks   = this.parseBlocks(data.descripcion_json,            this.infoGrupo.descripcion || '');
        this.infoMisionBlocks = this.parseBlocks(data.mision_json,                 this.infoGrupo.mision || '');
        this.infoObjGenBlocks = this.parseBlocks(data.objetivo_general_json,       this.infoGrupo.objetivo_general || '');
        this.infoObjEspBlocks = this.parseBlocks(data.objetivos_especificos_json,  this.infoGrupo.objetivos_especificos || '');

        this.infoLoaded = true;
        this.cdr.detectChanges();
      },
      error: () => { this.infoLoaded = true; this.cdr.detectChanges(); }
    });
  }

  private buildField(flexible: boolean, blocks: Block[], plain: string) {
    if (flexible) {
      const p = this.blocksToText(blocks) || ' ';
      return { plain: p, json: JSON.stringify(blocks) };
    }
    return { plain: plain || ' ', json: JSON.stringify(this.textToBlocks(plain)) };
  }

  private saveInfo(payload: Partial<InfoGrupo>, label: string) {
    this.infoGrupoSvc.actualizarInfoGrupo(payload).subscribe({
      next: () => this.toastService.show(`${label} guardado correctamente.`, 'success'),
      error: () => this.toastService.show('Error al guardar.', 'error')
    });
  }

  onLogoFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && file.type !== 'image/svg+xml') {
      this.toastService.show('Solo se permiten imágenes (JPG, PNG, SVG, WEBP).', 'warning');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.toastService.show('El archivo no debe superar 5 MB.', 'warning');
      return;
    }

    this.isUploading = true;
    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = (reader.result as string).split(',')[1];
      this.investigadorService.subirFoto(file.name, base64Data).subscribe({
        next: (res: any) => {
          this.isUploading = false;
          if (res?.success) {
            this.infoGrupo.logo_url = res.url;
            this.cdr.detectChanges();
            this.toastService.show('Logo subido. Presiona "Guardar" para aplicar.', 'success');
          }
        },
        error: () => {
          this.isUploading = false;
          this.toastService.show('Error al subir el logo.', 'error');
        }
      });
    };
    reader.readAsDataURL(file);
  }

  guardarInfoGeneral() {
    const desc   = this.buildField(this.infoDescModo,    this.infoDescBlocks,   this.infoGrupo.descripcion || '');
    const mision = this.buildField(this.infoMisionModo,  this.infoMisionBlocks, this.infoGrupo.mision || '');
    const objGen = this.buildField(this.infoObjGenModo,  this.infoObjGenBlocks, this.infoGrupo.objetivo_general || '');
    const objEsp = this.buildField(this.infoObjEspModo,  this.infoObjEspBlocks, this.infoGrupo.objetivos_especificos || '');

    this.saveInfo({
      logo_url:                   this.infoGrupo.logo_url,
      dominio:                    this.infoGrupo.dominio,
      descripcion:                desc.plain,  descripcion_json:           desc.json,
      mision:                     mision.plain, mision_json:                mision.json,
      objetivo_general:           objGen.plain, objetivo_general_json:      objGen.json,
      objetivos_especificos:      objEsp.plain, objetivos_especificos_json: objEsp.json,
    }, 'Información general');
  }

  guardarInfoProyectos() {
    this.saveInfo({
      proyectos_titulo:        this.infoGrupo.proyectos_titulo,
      proyectos_descripcion:   this.infoGrupo.proyectos_descripcion,
    }, 'Página Proyectos');
  }

  guardarInfoPublicaciones() {
    this.saveInfo({
      publicaciones_titulo:       this.infoGrupo.publicaciones_titulo,
      publicaciones_descripcion:  this.infoGrupo.publicaciones_descripcion,
    }, 'Página Publicaciones');
  }

  guardarInfoContacto() {
    this.saveInfo({
      contacto_titulo:      this.infoGrupo.contacto_titulo,
      contacto_descripcion: this.infoGrupo.contacto_descripcion,
      contacto_email:       this.infoGrupo.contacto_email,
      contacto_telefono:    this.infoGrupo.contacto_telefono,
      contacto_direccion:   this.infoGrupo.contacto_direccion,
    }, 'Página Contacto');
  }

  // ── Líneas de investigación CRUD ─────────────────────────────────────────

  nuevaLinea() {
    this.lineaEditando = null;
    this.lineaModoFlexible = false;
    this.lineaDescBlocks = [];
    this.lineaForm = this.fb.group({
      nombre:      ['', [Validators.required]],
      abreviatura: ['', [Validators.required]],
      descripcion: [''],
    });
    this.showLineaForm = false;
    this.ngZone.run(() => { this.showLineaForm = true; this.cdr.detectChanges(); });
  }

  editarLinea(linea: LineaInvestigacion) {
    this.lineaEditando = linea;
    this.lineaModoFlexible = !!(linea.descripcion_larga_json);
    this.lineaDescBlocks = this.parseBlocks(linea.descripcion_larga_json, linea.descripcion_larga || linea.descripcion);
    this.lineaForm = this.fb.group({
      nombre:      [linea.nombre,      [Validators.required]],
      abreviatura: [linea.abreviatura, [Validators.required]],
      descripcion: [linea.descripcion],
    });
    this.showLineaForm = false;
    this.ngZone.run(() => { this.showLineaForm = true; this.cdr.detectChanges(); });
  }

  guardarLinea() {
    if (this.lineaForm.invalid) return;

    let descripcion_larga: string, descripcion_larga_json: string;
    if (this.lineaModoFlexible) {
      descripcion_larga      = this.blocksToText(this.lineaDescBlocks) || ' ';
      descripcion_larga_json = JSON.stringify(this.lineaDescBlocks);
    } else {
      descripcion_larga      = this.lineaForm.get('descripcion')?.value || ' ';
      descripcion_larga_json = JSON.stringify(this.textToBlocks(descripcion_larga));
    }

    const payload: Partial<LineaInvestigacion> = {
      ...this.lineaForm.value,
      descripcion: this.lineaForm.get('descripcion')?.value || ' ',
      descripcion_larga,
      descripcion_larga_json,
    };

    const req$ = this.lineaEditando?.id
      ? this.infoGrupoSvc.actualizarLinea(this.lineaEditando.id, payload)
      : this.infoGrupoSvc.crearLinea(payload);

    req$.subscribe({
      next: () => {
        this.toastService.show(this.lineaEditando ? 'Línea actualizada.' : 'Línea creada.', 'success');
        this.showLineaForm = false;
        this.cargarInfoGrupo();
      },
      error: () => this.toastService.show('Error al guardar la línea.', 'error')
    });
  }

  eliminarLinea(linea: LineaInvestigacion) {
    this.lineaPendienteEliminar = linea;
  }

  confirmarEliminarLinea() {
    const linea = this.lineaPendienteEliminar;
    if (!linea?.id) return;
    this.lineaPendienteEliminar = null;
    this.infoGrupoSvc.eliminarLinea(linea.id).subscribe({
      next: () => { this.toastService.show('Línea eliminada.', 'info'); this.cargarLineas(); },
      error: (err) => {
        const msg = err?.error?.message || 'No se pudo eliminar la línea.';
        this.toastService.show(msg, 'error');
      }
    });
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
    const currentInvIds = data?.investigadores?.map(i => i.id) || [];

    this.proyectoForm = this.fb.group({
      titulo:      [data?.titulo      || '', [Validators.required]],
      descripcion: [data?.descripcion || ''],
      objetivos:   [data?.objetivos   || ''],
      resultados:  [data?.resultados  || ''],
      estado:      [data?.estado      || 'Activo', [Validators.required]],
      linea_id:    [data?.linea_id    || 1, [Validators.required]],
      investigadores: [currentInvIds]
    });

    // Auto-detect: use flexible if project already has rich content
    this.proyectoModoFlexible = !!(data?.descripcion_json);

    this.proyDescBlocks = this.parseBlocks(data?.descripcion_json, data?.descripcion);
    this.proyObjBlocks  = this.parseBlocks(data?.objetivos_json,   data?.objetivos);
    this.proyResBlocks  = this.parseBlocks(data?.resultados_json,  data?.resultados);

    this.showForm = false;
    this.ngZone.run(() => { this.showForm = true; this.cdr.detectChanges(); });
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

  /** Convert a blocks JSON string (or plain text) into a Block array */
  parseBlocks(jsonStr?: string | null, plainText?: string): Block[] {
    if (jsonStr) {
      try { return JSON.parse(jsonStr); } catch { /* fall through */ }
    }
    if (plainText) {
      return [{ id: crypto.randomUUID(), type: 'paragraph', content: plainText }];
    }
    return [];
  }

  /** Converts plain text into a single paragraph block (used in simple mode) */
  private textToBlocks(text: string): Block[] {
    const t = (text || '').trim();
    if (!t) return [];
    return [{ id: crypto.randomUUID(), type: 'paragraph', content: t }];
  }

  /** Extract plain-text from current block editors (used as DB fallback) */
  private blocksToText(blocks: Block[]): string {
    return blocks
      .filter(b => b.content)
      .map(b => { const d = document.createElement('div'); d.innerHTML = b.content!; return d.textContent || ''; })
      .join('\n');
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

    let descripcion: string, objetivos: string, resultados: string;
    let descBlocks: Block[], objBlocks: Block[], resBlocks: Block[];

    if (this.proyectoModoFlexible) {
      descBlocks  = this.editorDesc?.getBlocks()  ?? this.proyDescBlocks;
      objBlocks   = this.editorObj?.getBlocks()   ?? this.proyObjBlocks;
      resBlocks   = this.editorRes?.getBlocks()   ?? this.proyResBlocks;
      descripcion = this.blocksToText(descBlocks) || ' ';
      objetivos   = this.blocksToText(objBlocks)  || ' ';
      resultados  = this.blocksToText(resBlocks)  || ' ';
    } else {
      descripcion = this.proyectoForm.get('descripcion')?.value || ' ';
      objetivos   = this.proyectoForm.get('objetivos')?.value   || ' ';
      resultados  = this.proyectoForm.get('resultados')?.value  || ' ';
      descBlocks  = this.textToBlocks(descripcion);
      objBlocks   = this.textToBlocks(objetivos);
      resBlocks   = this.textToBlocks(resultados);
    }

    const val = {
      ...this.proyectoForm.value,
      descripcion,
      objetivos,
      resultados,
      descripcion_json: JSON.stringify(descBlocks),
      objetivos_json:   JSON.stringify(objBlocks),
      resultados_json:  JSON.stringify(resBlocks),
    };

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
      titulo:              [data?.titulo              || '', [Validators.required]],
      resumen:             [data?.resumen             || ''],
      cita:                [data?.cita                || '', [Validators.required]],
      revista_portada_url: [data?.revista_portada_url || ''],
      doi_url:             [data?.doi_url             || ''],
      linea_id:            [data?.linea_id            || 1,  [Validators.required]],
      investigadores:      [currentInvIds]
    });

    this.pubModoFlexible  = !!(data?.resumen_json);
    this.pubResumenBlocks = this.parseBlocks(data?.resumen_json, data?.resumen);

    this.showForm = false;
    this.ngZone.run(() => { this.showForm = true; this.cdr.detectChanges(); });
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

    let resumen: string, resumenBlocks: Block[];

    if (this.pubModoFlexible) {
      resumenBlocks = this.editorResumen?.getBlocks() ?? this.pubResumenBlocks;
      resumen       = this.blocksToText(resumenBlocks) || ' ';
    } else {
      resumen       = this.publicacionForm.get('resumen')?.value || ' ';
      resumenBlocks = this.textToBlocks(resumen);
    }

    const val = {
      ...this.publicacionForm.value,
      resumen,
      resumen_json: JSON.stringify(resumenBlocks),
    };

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
