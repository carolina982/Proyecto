export type Role = "Admin" | "Chofer";

export interface User {
  id: string;
  nombre: string;
  email: string;
  rol: Role;
  unitId :string ;
}

export interface Trip {
  id: string;
  choferId: string;
  origen: string;
  destino: string;
  kilometros: number;
  estado: "pendiente" | "en_ruta" | "entregado";
  tickets?: string[];
}

export interface Unit {
  id: string;
  nombre: string;
  items: string[];
}

export interface Viatic {
  id: string;
  choferId: string;
  monto: number;
  fecha: string;
  comprobantes?: string[];
}