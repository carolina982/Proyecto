//Usuario 
export interface User {
    _id: string;
    id:string;
    nombre:string;
    apellido?:string;
    email:string ;
    password?:string ;
    rol :"Admin" |"Chofer";
    photoUrl?:string |null;
}

//Unidad 
 export interface Unit {
    id:string;
    nombre:string;
    tipo:string;
    placa?:string;
 }

 //viatico 
export interface Viatic {
    id:string;
    tripId:string;
    concepto:string;
    monto:number;
    comprobante?:string;
}

//viaje 
export interface Trip{
    id:string;
    conductorId:string;
    destino:string;
    fechaInicio:String;
    fechaFin:string;
    unidades:string [];
    viaticos:string [];
    estado :"pendiente" |"en curso "| "finalizado";
}