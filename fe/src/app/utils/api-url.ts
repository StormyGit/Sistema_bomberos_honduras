import { Injectable } from '@angular/core';
//mport { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class ApiUrl {
  // getBaseUrl(): string {
  //   const api = environment.api;

  //   return `${api.protocol}://${api.host}:${api.port}/${api.prefix}`;
  // }

  // buildUrl(endpoint: string): string {
  //   const cleanEndpoint = endpoint.startsWith('/')
  //     ? endpoint.substring(1)
  //     : endpoint;

  //   return `${this.getBaseUrl()}/${cleanEndpoint}`;
  // }
}
