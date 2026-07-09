import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root',
})
export class ArchivoService {
  private apiUrl = environment.serve_incidenteApplication + '/incidente';

  http = inject(HttpClient)
}
