import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthServiceService } from './authService.service';


export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthServiceService);
  const token = authService.getToken;

  // Cuando no existe token, enviamos la petición sin modificar.
  if (!token) {
    return next(request);
  }

  // HttpRequest es inmutable, por eso se debe clonar.
  const requestWithToken = request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(requestWithToken);
};
