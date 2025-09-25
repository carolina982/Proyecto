import { Document, Schema, model } from "mongoose";

export interface IViatic extends Document {
    tripId:string;
    monto:number;
    descripcion:string;
    fecha:Date;

}

const viaticSchema =new Schema <IViatic>({
    tripId:{type:String, required:true},
    monto:{type:Number, requited:true },
    descripcion:{type:String , required:true},
    fecha:{type:Date , default:Date.now},

});
export default model<IViatic> ("Viatic" , viaticSchema);