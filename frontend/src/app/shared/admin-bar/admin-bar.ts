import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-bar.html',
  styleUrls: ['./admin-bar.css']
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
