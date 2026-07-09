import { Injectable } from '@angular/core';
import { User } from './auth.interface.ts';
import { CURRENT_USER } from '../mocks/current-user.js';

@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {

constructor() { }
  private currentUser: User = CURRENT_USER;

  get getUser():User{
    return this.currentUser;
  }



}
