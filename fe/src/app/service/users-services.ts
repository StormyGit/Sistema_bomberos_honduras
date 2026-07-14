import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { AuthServiceService } from '../auth/authService.service';
import { Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { User, UsuarioCreateRequest, UsuarioResponse, UsuarioUpdateRequest } from '../auth/auth.interface.ts';
import { Router } from '@angular/router';

export interface LoginResponse {
  token: string;
  usuario: any;
}

@Injectable({
  providedIn: 'root',
})
export class UsersServices {
  private readonly apiUrl_auth = environment.serve_usersApplication + '/auth';
  private readonly apiUrl = environment.serve_usersApplication + '/usuarios';

  private router = inject(Router);
  private authsvr = inject(AuthServiceService);
  private user_current = this.authsvr.getUser;
  private readonly http = inject(HttpClient);

  login(data: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl_auth}/login`, data).pipe(
      tap((response ) => {
        const user: User = {
          id: null,
          type: response.usuario.tipo,
          nombre:  response.usuario.nombre,
          correo: response.usuario.correoOrCodigo,
          region: response.usuario.departamentoNombre,
          idDepartamento: response.usuario.departamentoId,
          rol: response.usuario.rolNombre
        };
        console.log(response);
/*
{
    "token": "eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBnbWFpbC5jb20iLCJpYXQiOjE3ODM5ODgzNTEsImV4cCI6MTc4NDA3NDc1MX0.E-Rhu2n75ZyqAemIVeTa34yfCt6zmUSIsitOEeYIZ5kigveh-SVOmUuKdzbGeE89",
    "usuario": {
        "id": "bc9f8d11-feca-4c94-a920-216181528ffc",
        "nombre": "administrador",
        "apellido": "Lopez",
        "correoOrCodigo": "admin@gmail.com",
        "tipo": "Persona",
        "departamentoId": "11e52c2c-73ee-4916-b048-ac74320e51a6",
        "departamentoNombre": "FRANCISCO MORAZÁN",
        "estacionId": "07cc136b-2115-4fa2-8caa-dff35b2dcc1a",
        "estacionNombre": "Cuartel General",
        "rolId": "8b1234de-ec14-4299-a822-0f7a1f19964c",
        "rolCodigo": "ADMIN_PROGRAMER",
        "rolNombre": "administrador del sistema"
    }
}
*/


        this.authsvr.setSession(user, response.token );
        this.router.navigate(['/dashboard']);
      })
    );
  }

  getAll(): Observable<UsuarioResponse[]> {
    return this.http.get<UsuarioResponse[]>(
      this.apiUrl
    );
  }

  getById( id: string ): Observable<UsuarioResponse | null> {

    return this.http.get<UsuarioResponse | null>(
      `${this.apiUrl}/${id}`
    );
  }

  create( usuario: UsuarioCreateRequest ): Observable<UsuarioResponse | null> {

    return this.http.post<UsuarioResponse | null>(
      this.apiUrl,
      usuario
    );
  }

  update( id: string, usuario: UsuarioUpdateRequest ): Observable<UsuarioResponse | null> {

    return this.http.put<UsuarioResponse | null>(
      `${this.apiUrl}/${id}`,
      usuario
    );
  }

  delete( id: string ): Observable<boolean> {

    return this.http.delete<boolean>(
      `${this.apiUrl}/${id}`
    );
  }
}
