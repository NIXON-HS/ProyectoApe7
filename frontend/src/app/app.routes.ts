import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { EquipoComponent } from './pages/equipo/equipo';
import { ProyectosComponent } from './pages/proyectos/proyectos';
import { ProyectoDetalleComponent } from './pages/proyectos/proyecto-detalle/proyecto-detalle';
import { PublicacionesComponent } from './pages/publicaciones/publicaciones';
import { PublicacionDetalleComponent } from './pages/publicaciones/publicacion-detalle/publicacion-detalle';
import { NoticiasComponent } from './pages/noticias/noticias';
import { ContactoComponent } from './pages/contacto/contacto';
import { LoginComponent } from './pages/login/login';
import { NotFoundComponent } from './pages/not-found/not-found';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'equipo', component: EquipoComponent },
  { path: 'proyectos',       component: ProyectosComponent,        pathMatch: 'full' },
  { path: 'proyectos/:id',   component: ProyectoDetalleComponent },
  { path: 'publicaciones',   component: PublicacionesComponent,   pathMatch: 'full' },
  { path: 'publicaciones/:id', component: PublicacionDetalleComponent },
  { path: 'noticias',        component: NoticiasComponent },
  { path: 'contacto', component: ContactoComponent },
  { path: 'login', component: LoginComponent },
  { path: '**', component: NotFoundComponent }
];
