import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="fixed top-0 left-0 w-full z-50 glass-card px-6 py-4 transition-all duration-300">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <!-- Logo -->
        <a routerLink="/" class="flex items-center gap-3 group">
          <img src="/logo.svg" alt="REASONS Logo" class="h-10 w-auto object-contain transition-transform group-hover:scale-105" />
          <div class="flex flex-col">
            <span class="text-xl font-bold tracking-tight text-reasons-navy">REASONS</span>
            <span class="text-[10px] font-semibold text-reasons-green tracking-widest uppercase">UTA Research</span>
          </div>
        </a>

        <!-- Desktop Navigation Links -->
        <div class="hidden md:flex items-center gap-8">
          <a routerLink="/home" routerLinkActive="active-link" class="nav-item">Inicio</a>
          <a routerLink="/equipo" routerLinkActive="active-link" class="nav-item">Equipo</a>
          <a routerLink="/proyectos" routerLinkActive="active-link" class="nav-item">Proyectos</a>
          <a routerLink="/publicaciones" routerLinkActive="active-link" class="nav-item">Publicaciones</a>
          <a routerLink="/contacto" routerLinkActive="active-link" class="nav-item">Contacto</a>
        </div>

        <!-- Call to action button -->
        <div class="hidden md:flex items-center gap-3">
          <a routerLink="/contacto" class="px-5 py-2.5 bg-reasons-blue hover:bg-reasons-navy text-white text-sm font-semibold rounded-full shadow-md hover-premium">
            Únete a nosotros
          </a>
          <a routerLink="/login" class="px-5 py-2.5 bg-reasons-green hover:bg-[#327e2a] text-white text-sm font-semibold rounded-full shadow-md hover-premium flex items-center gap-1.5">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            Acceso Interno
          </a>
        </div>

        <!-- Mobile Menu Toggle Button -->
        <button (click)="toggleMenu()" class="md:hidden flex items-center justify-center p-2 text-reasons-blue hover:text-reasons-green transition-colors">
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path *ngIf="!isMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            <path *ngIf="isMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Mobile Dropdown Menu -->
      <div *ngIf="isMenuOpen" class="md:hidden mt-4 pt-4 border-t border-slate-100 flex flex-col gap-3 animate-fade-in">
        <a routerLink="/home" (click)="closeMenu()" routerLinkActive="active-link" class="nav-item py-2 px-3 rounded-lg hover:bg-slate-50">Inicio</a>
        <a routerLink="/equipo" (click)="closeMenu()" routerLinkActive="active-link" class="nav-item py-2 px-3 rounded-lg hover:bg-slate-50">Equipo</a>
        <a routerLink="/proyectos" (click)="closeMenu()" routerLinkActive="active-link" class="nav-item py-2 px-3 rounded-lg hover:bg-slate-50">Proyectos</a>
        <a routerLink="/publicaciones" (click)="closeMenu()" routerLinkActive="active-link" class="nav-item py-2 px-3 rounded-lg hover:bg-slate-50">Publicaciones</a>
        <a routerLink="/contacto" (click)="closeMenu()" routerLinkActive="active-link" class="nav-item py-2 px-3 rounded-lg hover:bg-slate-50">Contacto</a>
        <a routerLink="/contacto" (click)="closeMenu()" class="w-full text-center py-3 bg-reasons-blue text-white rounded-xl font-semibold shadow-md mt-2">
          Únete a nosotros
        </a>
        <a routerLink="/login" (click)="closeMenu()" class="w-full text-center py-3 bg-reasons-green text-white rounded-xl font-semibold shadow-md mt-1 flex items-center justify-center gap-1.5">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          Acceso Interno
        </a>
      </div>
    </nav>
  `,
  styles: [`
    .nav-item {
      font-weight: 500;
      font-size: 0.875rem;
      color: #475569;
      transition: color 0.2s ease;
      position: relative;
    }
    .nav-item:hover {
      color: #3c9632;
    }
    .active-link {
      color: #3c9632 !important;
      font-weight: 600;
    }
    .active-link::after {
      content: '';
      position: absolute;
      bottom: -6px;
      left: 0;
      width: 100%;
      height: 2px;
      background-color: #3c9632;
      border-radius: 9999px;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fadeIn 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }
  `]
})
export class HeaderComponent {
  isMenuOpen = false;

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }
}
