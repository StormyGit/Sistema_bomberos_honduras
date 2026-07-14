import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router
} from '@angular/router';
import { AuthServiceService } from '../auth/authService.service';



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
