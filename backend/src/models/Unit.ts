import { Document, Schema, model } from "mongoose";

export interface IUnit extends Document {
    nombre:string;
    placas:string;
    modelo:string;
}

const uniSchema =new Schema<IUnit> ({
    nombre:{type:String , required:true},
    placas:{type:String , required:true},
    modelo:{type:String,  required:true},
});

export default model<IUnit> ("unit" , uniSchema);
