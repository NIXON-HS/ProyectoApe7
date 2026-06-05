import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ContactoService } from '../../core/services/contacto.service';
import { InfoGrupoService } from '../../core/services/info-grupo.service';
import { InfoGrupo } from '../../core/models/info-grupo.model';
import { AdminBarComponent } from '../../shared/admin-bar/admin-bar';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AdminBarComponent],
  template: `
    <app-admin-bar editTab="info"></app-admin-bar>
    <div class="min-h-screen pt-32 pb-24 bg-reasons-bg bg-grid-pattern relative">
      <div class="max-w-7xl mx-auto px-6">
        <!-- Header -->
        <div class="text-center max-w-3xl mx-auto flex flex-col gap-4 mb-20 animate-fade-in">
          <span class="text-xs font-bold text-reasons-green tracking-widest uppercase">{{ info?.contacto_badge || 'Póngase en Contacto' }}</span>
          <h1 class="text-4xl font-extrabold text-reasons-navy">{{ info?.contacto_titulo || 'Contacte con Nosotros' }}</h1>
          <div class="w-16 h-1 bg-reasons-green mx-auto rounded-full"></div>
          <p class="text-slate-500 font-light leading-relaxed">
            {{ info?.contacto_descripcion || '¿Tiene alguna consulta sobre nuestras líneas de investigación, proyectos o desea colaborar con nosotros? Complete el formulario y responderemos lo antes posible.' }}
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch animate-fade-in">
          <!-- Columna 1: Información Institucional (Left 5 columns) -->
          <div class="lg:col-span-5 flex flex-col gap-8 text-left">
            <div class="glowing-card glass-card p-8 rounded-3xl flex flex-col gap-8 h-full shadow-lg justify-between relative overflow-hidden">
              <div class="flex flex-col gap-6">
                <h3 class="text-xl font-bold text-reasons-navy">Información de Contacto</h3>
                <div class="w-10 h-1 bg-reasons-green rounded-full"></div>

                <!-- Info blocks -->
                <div class="flex flex-col gap-6 text-sm font-light text-slate-650 mt-2">
                  <!-- Address block with circular gradient icon -->
                  <div class="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all duration-300">
                    <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-reasons-green/20 to-reasons-green/5 text-reasons-green flex items-center justify-center flex-shrink-0 shadow-sm border border-reasons-green/15">
                      <svg class="h-5.5 w-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                    </div>
                    <div class="flex flex-col gap-1.5">
                      <span class="font-bold text-reasons-navy text-xs uppercase tracking-wider">Dirección Principal</span>
                      <span class="leading-relaxed">{{ info?.contacto_direccion || 'Facultad de Ingeniería en Sistemas, Electrónica e Industrial. Av. de Los Chasquis y Av. Río Payamino. Universidad Técnica de Ambato. Ambato – Ecuador.' }}</span>
                    </div>
                  </div>

                  <!-- Email block with circular gradient icon -->
                  <div class="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all duration-300">
                    <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-reasons-blue/20 to-reasons-blue/5 text-reasons-blue flex items-center justify-center flex-shrink-0 shadow-sm border border-reasons-blue/15">
                      <svg class="h-5.5 w-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    <div class="flex flex-col gap-1.5">
                      <span class="font-bold text-reasons-navy text-xs uppercase tracking-wider">Correo Electrónico</span>
                      <a [href]="'mailto:' + (info?.contacto_email || 'reasons@uta.edu.ec')" class="text-reasons-blue hover:text-reasons-green transition-colors font-medium text-sm leading-relaxed">{{ info?.contacto_email || 'reasons&#64;uta.edu.ec' }}</a>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Embedded Google Map iframe -->
              <div class="w-full h-64 rounded-2xl overflow-hidden border border-slate-150 shadow-inner mt-4 transition-transform duration-300 hover:scale-[1.01]">
                <iframe 
                  src="https://maps.google.com/maps?q=Universidad%20T%C3%A9cnica%20de%20Ambato%20Campus%20Huachi%2C%20Ambato%2C%20Ecuador&t=&z=16&ie=UTF8&iwloc=&output=embed" 
                  width="100%" 
                  height="100%" 
                  style="border:0;" 
                  allowfullscreen="" 
                  loading="lazy" 
                  referrerpolicy="no-referrer-when-downgrade">
                </iframe>
              </div>
            </div>
          </div>

          <!-- Columna 2: Formulario Interactivo (Right 7 columns) -->
          <div class="lg:col-span-7 flex flex-col text-left">
            <div class="glowing-card glass-card p-8 md:p-10 rounded-3xl shadow-lg h-full flex flex-col justify-between border border-white/20">
              <div class="flex flex-col gap-6">
                <h3 class="text-xl font-bold text-reasons-navy">Formulario de Contacto</h3>
                <div class="w-10 h-1 bg-reasons-green rounded-full"></div>

                <form [formGroup]="contactoForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-5 mt-2">
                  <!-- Nombre Completo -->
                  <div class="flex flex-col gap-1.5">
                    <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">Nombre Completo</label>
                    <input type="text" formControlName="nombre_completo" class="input-field" placeholder="Su nombre y apellido..." />
                    <span *ngIf="isFieldInvalid('nombre_completo')" class="validation-error">El nombre completo es requerido (mínimo 3 caracteres).</span>
                  </div>

                  <!-- Correo -->
                  <div class="flex flex-col gap-1.5">
                    <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">Correo Electrónico</label>
                    <input type="email" formControlName="correo" class="input-field" placeholder="ejemplo@dominio.com" />
                    <span *ngIf="isFieldInvalid('correo')" class="validation-error">Se requiere un correo electrónico válido.</span>
                  </div>

                  <!-- Asunto -->
                  <div class="flex flex-col gap-1.5">
                    <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">Asunto</label>
                    <input type="text" formControlName="asunto" class="input-field" placeholder="Motivo de su mensaje..." />
                    <span *ngIf="isFieldInvalid('asunto')" class="validation-error">El asunto es requerido.</span>
                  </div>

                  <!-- Mensaje -->
                  <div class="flex flex-col gap-1.5">
                    <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">Mensaje</label>
                    <textarea formControlName="mensaje" rows="4" class="input-field" placeholder="Redacte su mensaje aquí..."></textarea>
                    <span *ngIf="isFieldInvalid('mensaje')" class="validation-error">El mensaje debe tener al menos 10 caracteres.</span>
                  </div>

                  <!-- Success/Error Feedback Alerts -->
                  <div *ngIf="feedbackMsg" class="px-5 py-3 rounded-2xl text-sm font-semibold transition-all animate-slide-down" 
                       [class]="isSuccess ? 'bg-reasons-green/10 text-reasons-green border border-reasons-green/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'">
                    {{ feedbackMsg }}
                  </div>

                  <!-- Submit button -->
                  <button type="submit" [disabled]="contactoForm.invalid || isSubmitting" class="w-full mt-4 py-3.5 bg-reasons-green hover:bg-[#327e2a] text-white font-semibold rounded-2xl shadow-md hover-premium flex items-center justify-center gap-2 disabled:opacity-50 transition-all">
                    <span *ngIf="isSubmitting" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    {{ isSubmitting ? 'Enviando Mensaje...' : 'Enviar Mensaje' }}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .input-field {
      width: 100%;
      padding: 0.8rem 1.1rem;
      border: 1px solid rgba(226, 232, 240, 0.8);
      border-radius: 1rem;
      font-size: 0.8125rem;
      background: rgba(255, 255, 255, 0.75);
      backdrop-filter: blur(4px);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .input-field:focus {
      outline: none;
      border-color: var(--color-reasons-blue);
      background: white;
      box-shadow: 0 0 0 4px rgba(10, 50, 70, 0.06), 0 10px 15px -3px rgba(0, 0, 0, 0.03);
      transform: translateY(-1px);
    }
    .validation-error {
      font-size: 9px;
      color: #ef4444;
      font-weight: 500;
      padding-left: 0.25rem;
    }
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-slide-down {
      animation: slideDown 0.3s cubic-bezier(0.25, 1, 0.5, 1) forwards;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .animate-fade-in {
      animation: fadeIn 0.35s cubic-bezier(0.25, 1, 0.5, 1) forwards;
    }
  `]
})
export class ContactoComponent implements OnInit {
  contactoForm!: FormGroup;
  isSubmitting = false;
  feedbackMsg = '';
  isSuccess = false;
  info: InfoGrupo | null = null;

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
