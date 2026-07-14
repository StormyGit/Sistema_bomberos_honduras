import { inject, Injectable } from '@angular/core';
import { User } from './auth.interface.ts';
import { CURRENT_USER } from '../mocks/current-user.js';
import { PermisosService } from '../service/seguridad/permisos-service.js';

@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {

  private currentUser: User | null = null;
  private token: string | null = null;

  constructor() {
    this.loadSession();
  }

  get getUser(): User | null {
    return this.currentUser;
  }

  get getToken(): string | null {
    return this.token ?? sessionStorage.getItem('token');
  }

  setSession(user: User, token: string): void {
    this.currentUser = user;
    this.token = token;

    sessionStorage.setItem('user', JSON.stringify(user));
    sessionStorage.setItem('token', token);
  }

  private loadSession(): void {
    const storedUser = sessionStorage.getItem('user');
    const storedToken = sessionStorage.getItem('token');

    this.token = storedToken;

    if (!storedUser) {
      this.currentUser = null;
      return;
    }

    try {
      this.currentUser = JSON.parse(storedUser) as User;
    } catch (error) {
      console.error('No se pudo recuperar el usuario:', error);

      this.currentUser = null;
      sessionStorage.removeItem('user');
    }
  }

  isAuthenticated(): boolean {
    return Boolean(this.token);
  }

  logout(): void {
    this.currentUser = null;
    this.token = null;

    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
  }
}
