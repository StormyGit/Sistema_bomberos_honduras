export interface UserSession {
  id: number;
  nombre: string;
  email: string;
  dni: string;
}

export interface dataUser {
  mensaje: string;
  dni: UserSession;
}
