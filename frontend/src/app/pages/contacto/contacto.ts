import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ContactoService } from '../../core/services/contacto.service';
import { InfoGrupoService } from '../../core/services/info-grupo.service';
import { InfoGrupo } from '../../core/models/info-grupo.model';
import { AdminBarComponent } from '../../shared/admin-bar/admin-bar';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, AdminBarComponent],
  templateUrl: './contacto.html',
  styleUrls: ['./contacto.css']
})
export class ContactoComponent implements OnInit {
  contactoForm!: FormGroup;
  isSubmitting = false;
  feedbackMsg = '';
  isSuccess = false;
  info: InfoGrupo | null = null;
  editMode = false;
  draft: InfoGrupo = {};

  constructor(
    private fb: FormBuilder,
    private service: ContactoService,
    private infoSvc: InfoGrupoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.initForm();
    this.loadInfo();
    this.infoSvc.contentUpdated$.subscribe(() => this.loadInfo());
  }

  loadInfo() {
    this.infoSvc.getInfoGrupo().subscribe({ next: (d) => { this.info = d; this.cdr.detectChanges(); }, error: () => {} });
  }

  startEdit() {
    this.draft = { ...this.info };
    if (!this.draft.contacto_badge)       this.draft.contacto_badge       = 'Póngase en Contacto';
    if (!this.draft.contacto_titulo)      this.draft.contacto_titulo      = 'Contacte con Nosotros';
    if (!this.draft.contacto_descripcion) this.draft.contacto_descripcion = '¿Tiene alguna consulta sobre nuestros proyectos o desea colaborar con REASONS? Escríbanos.';
    if (!this.draft.contacto_email)       this.draft.contacto_email       = 'reasons@uta.edu.ec';
    if (!this.draft.contacto_telefono)    this.draft.contacto_telefono    = '';
    if (!this.draft.contacto_direccion)   this.draft.contacto_direccion   = 'Facultad de Ingeniería en Sistemas, Electrónica e Industrial. Av. de Los Chasquis y Av. Río Payamino. Universidad Técnica de Ambato. Ambato – Ecuador.';
    this.editMode = true;
  }
  cancelEdit() { this.editMode = false; this.draft = {}; }
  saveEdit() {
    this.infoSvc.actualizarInfoGrupo({
      contacto_badge:       this.draft.contacto_badge,
      contacto_titulo:      this.draft.contacto_titulo,
      contacto_descripcion: this.draft.contacto_descripcion,
      contacto_email:       this.draft.contacto_email,
      contacto_telefono:    this.draft.contacto_telefono,
      contacto_direccion:   this.draft.contacto_direccion,
    }).subscribe({ next: () => { this.editMode = false; this.infoSvc.notifyUpdate(); this.loadInfo(); } });
  }

  initForm() {
    this.contactoForm = this.fb.group({
      nombre_completo: ['', [Validators.required, Validators.minLength(3)]],
      correo: ['', [Validators.required, Validators.email]],
      asunto: ['', [Validators.required]],
      mensaje: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.contactoForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit() {
    if (this.contactoForm.invalid) return;
    this.isSubmitting = true;
    this.feedbackMsg = '';

    this.service.enviarMensaje(this.contactoForm.value).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.isSuccess = true;
        this.feedbackMsg = '¡Mensaje enviado con éxito! Nos comunicaremos contigo pronto.';
        this.contactoForm.reset();
      },
      error: (err) => {
        console.error('Error submitting contact message:', err);
        this.isSubmitting = false;
        this.isSuccess = false;
        if (err.status === 429) {
          this.feedbackMsg = 'Demasiados intentos. Por favor, espere 15 minutos e intente de nuevo.';
        } else {
          this.feedbackMsg = 'Hubo un error al enviar el mensaje. Por favor, intente de nuevo.';
        }
      }
    });
  }
}
