import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UsersServices } from '../../service/users-services';

@Component({
  selector: 'app-login-layout-component',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-layout-component.html',
  styleUrl: './login-layout-component.css',
})
export class LoginLayoutComponent {
  loginForm: FormGroup;
  showPassword = false;
  loading = signal<boolean>(false);
  errorMessage: string | null = null;


    private usersService = inject(UsersServices);

  // Ajusta esto a los datos reales de tu departamento / institución
  Departamento = 'Cuerpo de Bomberos';

  constructor(private fb: FormBuilder, private router: Router) {
    this.loginForm = this.fb.group({
      correo: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(4)]],
      recordarme: [false],
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  get usuario() {
    return this.loginForm.get('usuario');
  }

  get password() {
    return this.loginForm.get('password');
  }

  onSubmit(): void {
    this.errorMessage = null;

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);


    this.usersService.login(this.loginForm.value).subscribe({
      next: (response) => {
        //console.log('Respuesta del servidor:', response);
      },
      error: (error) => {
        //console.error('Error del servidor:', error);
        this.errorMessage = 'Usuario o contraseña incorrectos';
        this.loading.set(false);
      }
    });
  }
}
