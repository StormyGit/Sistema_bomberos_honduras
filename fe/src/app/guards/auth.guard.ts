import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router
} from '@angular/router';
import { AuthServiceService } from '../auth/authService.service';
import { AccionTipo, PermisosService } from '../service/seguridad/permisos-service';
import { catchError, map, of } from 'rxjs';



export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthServiceService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(
    ['/login'],
    {
      queryParams: {
        returnUrl: state.url
      }
    }
  );
};


export const authGuard_login: CanActivateFn = (_route, state) => {
  const authService = inject(AuthServiceService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(
    ['/dashboard'],
    {
      queryParams: {
        returnUrl: state.url
      }
    }
  );
};



export const permisoGuard: CanActivateFn = (
  route,
  state
) => {

  const authService =
    inject(AuthServiceService);

  const permisosService =
    inject(PermisosService);

  const router =
    inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(
      ['/login'],
      {
        queryParams: {
          returnUrl: state.url
        }
      }
    );
  }

  const objetoId =
    route.data['objetoId'] as string | undefined;

    console.log("el id del objeto", objetoId)
  const accion =
    (
      route.data['accion'] ?? 'View'
    ) as AccionTipo;


  if (!objetoId) {
    console.error(
      'La ruta no tiene un objetoId configurado'
    );

    return router.createUrlTree(
      ['/dashboard']
    );
  }

  return permisosService
    .verificarPermiso(
      objetoId,
      accion
    )
    .pipe(
      map(tienePermiso => {
        console.log("tiene permiso??: ", tienePermiso);
        if (tienePermiso) {
          return true;
        }

        return router.createUrlTree(
          ['/dashboard'],
          {
            queryParams: {
              sinPermiso: true,
              returnUrl: state.url
            }
          }
        );
      }),

      catchError(error => {
        console.error(
          'Error al verificar permiso:',
          error
        );

        return of(
          router.createUrlTree(
            ['/dashboard'],
            {
              queryParams: {
                sinPermiso: true
              }
            }
          )
        );
      })
    );
};
