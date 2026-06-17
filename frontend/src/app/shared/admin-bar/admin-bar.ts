import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SplashScreenComponent } from '../splash-screen/splash-screen';

@Component({
  selector: 'app-admin-bar',
  standalone: true,
  imports: [CommonModule, SplashScreenComponent],
  templateUrl: './admin-bar.html',
  styleUrls: ['./admin-bar.css']
})
export class AdminBarComponent {
  @Input()  editMode = false;
  @Input()  editTab  = 'info';
  @Output() editStart  = new EventEmitter<void>();
  @Output() editSave   = new EventEmitter<void>();
  @Output() editCancel = new EventEmitter<void>();

  showSplash = false;

  get isAdmin(): boolean {
    const user = this.auth.getUsuarioActual();
    return !!(this.auth.getToken() && user?.rol === 'admin');
  }

  get isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  constructor(private auth: AuthService, private router: Router, private cdr: ChangeDetectorRef) {}

  startEdit()   { this.editStart.emit(); }
  emitSave()    { this.editSave.emit(); }
  emitCancel()  { this.editCancel.emit(); }

  goAdmin() {
    this.showSplash = true;
    this.cdr.detectChanges();
  }

  onSplashComplete() {
    this.showSplash = false;
    this.router.navigate(['/login'], { queryParams: { dashboard: true } });
  }
}
