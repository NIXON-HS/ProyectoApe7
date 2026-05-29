import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { EquipoComponent } from './pages/equipo/equipo';
import { ProyectosComponent } from './pages/proyectos/proyectos';
import { PublicacionesComponent } from './pages/publicaciones/publicaciones';
import { ContactoComponent } from './pages/contacto/contacto';
import { LoginComponent } from './pages/login/login';
import { NotFoundComponent } from './pages/not-found/not-found';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'equipo', component: EquipoComponent },
  { path: 'proyectos', component: ProyectosComponent },
  { path: 'publicaciones', component: PublicacionesComponent },
  { path: 'contacto', component: ContactoComponent },
  { path: 'login', component: LoginComponent },
  { path: '**', component: NotFoundComponent }
];
