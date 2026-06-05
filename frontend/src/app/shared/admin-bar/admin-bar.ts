import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isAdmin"
         class="fixed bottom-5 left-1/2 -translate-x-1/2 z-50
                flex items-center gap-2 sm:gap-3 px-3 py-2 sm:px-5 sm:py-2.5
                backdrop-blur-md border rounded-full shadow-2xl
                text-[10px] sm:text-xs font-semibold select-none animate-slide-up transition-all duration-300"
         [class]="editMode
           ? 'bg-reasons-green/95 border-white/20 text-white'
           : 'bg-reasons-navy/95 border-white/10 text-white'">

      <!-- Indicator -->
      <span class="flex items-center gap-1.5" [class]="editMode ? 'text-white' : 'text-[#7dd87a]'">
        <span class="w-2 h-2 rounded-full animate-pulse"
              [class]="editMode ? 'bg-white' : 'bg-[#7dd87a]'"></span>
        <span class="hidden md:inline">{{ editMode ? 'Editando...' : 'Modo Admin' }}</span>
      </span>

      <span class="w-px h-4 bg-white/30"></span>

      <!-- EDIT MODE OFF → show "Editar" -->
      <ng-container *ngIf="!editMode">
        <button (click)="startEdit()" class="flex items-center gap-1 hover:text-[#7dd87a] transition-colors cursor-pointer">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
          </svg>
          <span class="hidden sm:inline">Editar esta página</span>
          <span class="sm:hidden">Editar</span>
        </button>
        <span class="w-px h-4 bg-white/20"></span>
        <button (click)="goAdmin()" class="flex items-center gap-1 hover:text-white/70 transition-colors cursor-pointer">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
          </svg>
          <span class="hidden sm:inline">Panel Admin</span>
          <span class="sm:hidden">Panel</span>
        </button>
      </ng-container>

      <!-- EDIT MODE ON → show Save / Cancel -->
      <ng-container *ngIf="editMode">
        <button (click)="emitSave()" class="flex items-center gap-1 font-bold hover:text-white/80 transition-colors cursor-pointer">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
          </svg>
          <span class="hidden sm:inline">Guardar cambios</span>
          <span class="sm:hidden">Guardar</span>
        </button>
        <span class="w-px h-4 bg-white/30"></span>
        <button (click)="emitCancel()" class="flex items-center gap-1 hover:text-white/70 transition-colors cursor-pointer">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
          </svg>
          <span class="hidden sm:inline">Cancelar cambios</span>
          <span class="sm:hidden">Cancelar</span>
        </button>
      </ng-container>
    </div>
  `,
  styles: [`
    @keyframes slide-up {
      from { opacity:0; transform: translate(-50%, 20px); }
      to   { opacity:1; transform: translate(-50%, 0); }
    }
    .animate-slide-up { animation: slide-up .3s cubic-bezier(.25,1,.5,1) forwards; }
  `]
})
export class AdminBarComponent {
  @Input()  editMode = false;
  @Input()  editTab  = 'info';
  @Output() editStart  = new EventEmitter<void>();
  @Output() editSave   = new EventEmitter<void>();
  @Output() editCancel = new EventEmitter<void>();

  get isAdmin(): boolean {
    const user = this.auth.getUsuarioActual();
    return !!(this.auth.getToken() && user?.rol === 'admin');
  }

  constructor(private auth: AuthService, private router: Router) {}

  startEdit()   { this.editStart.emit(); }
  emitSave()    { this.editSave.emit(); }
  emitCancel()  { this.editCancel.emit(); }
  goAdmin()     { this.router.navigate(['/login']); }
}
