import mongoose, { Document, Schema } from "mongoose";

export interface IUnit extends Document {
    nombre:string;
    placas:string;
    modelo:string;
    capacidad:number;
    
    estado:"Disponible" | "Mantenimiento " | "Ocupado";
}

const uniSchema =new Schema<IUnit> ({
    nombre:{type:String , required:true},
    placas:{type:String , required:true},
    modelo:{type:String,  required:true},
    capacidad:{type:Number , required:true},
    estado:{type:String , enum:["Disponible" , "Mantenimiento" , "Ocupado"]},
},
{timestamps:true}
);

export default  mongoose.model<IUnit> ("unit" , uniSchema);
