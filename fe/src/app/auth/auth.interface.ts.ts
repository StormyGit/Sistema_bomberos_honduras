export interface User {
  id: number;
  type: 'persona' | 'entidad' | 'componente';
  nombre: string;
  correo: string;
  region: string;
  idDepartamento: string;
  rol: 'superAdmin' | 'admin';
}
