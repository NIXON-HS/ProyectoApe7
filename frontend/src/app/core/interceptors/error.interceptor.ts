import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ocurrió un error inesperado';
      
      if (error.error instanceof ErrorEvent) {
        // Error del lado del cliente
        errorMessage = `Error del Cliente: ${error.error.message}`;
      } else {
        // Error del lado del servidor
        if (error.status === 429) {
          errorMessage = 'Demasiados intentos. Por favor, intente de nuevo en 15 minutos.';
        } else if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else {
          errorMessage = `Error de comunicación (Código: ${error.status})`;
        }
      }
      
      console.error('HTTP Error capturado por el Interceptor:', errorMessage);
      
      // Muestra una notificación visual no bloqueante premium de color rojo (error)
      toastService.show(errorMessage, 'error');
      
      return throwError(() => new Error(errorMessage));
    })
  );
};
