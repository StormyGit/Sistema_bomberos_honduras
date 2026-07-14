export interface User {
  id?: string | null;
  type: string;
  nombre: string;
  correo: string;
  region: string;
  idDepartamento: string;
  rol: string;
  rolId: string;
  rolCodigo: string;
}


export type UsuarioTipo =
  | 'Persona'
  | 'Entidad'
  | 'Componente';

export interface UsuarioCreateRequest {
  nombre: string;
  apellido: string;
  correoOrCodigo: string;
  password: string;
  departamentoId: string;
  estacionId?: string | null;
  rolId: string;
  tipo: UsuarioTipo;
}

export interface UsuarioUpdateRequest {
  nombre: string;
  apellido: string;
  correoOrCodigo: string;

  /*
   * Si se envía vacío, el backend mantiene
   * la contraseña anterior.
   */
  password?: string | null;

  departamentoId: string;
  estacionId?: string | null;
  rolId: string;
  tipo: UsuarioTipo;
}

export interface UsuarioResponse {
  id: string;
  nombre: string;
  apellido: string;
  correoOrCodigo: string;
  tipo: UsuarioTipo;

  departamentoId: string | null;
  departamentoNombre: string | null;

  estacionId: string | null;
  estacionNombre: string | null;

  rolId: string | null;
  rolCodigo: string | null;
  rolNombre: string | null;
}


/*

nombre,
correo,
rol <-  solo un rol

region <- es el departamento del pais

type <- persona: un usuarios, entidad: puede ser un departamento, compañia: es como un turno

*/
