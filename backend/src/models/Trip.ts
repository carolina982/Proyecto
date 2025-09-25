import { Document, model, Schema } from "mongoose";

export  interface ITrip extends Document {
 chofer:string;
 unidad:string;
 fechaSalida:Date;
 fechaLlegada:Date;
 destino:string
}
const tripSchema  = new Schema({
     chofer:{type:Schema.Types.ObjectId, ref:"User" , required:true},
     unidad:{type:String ,required:true},
     fechaSalida:{type:Date , required:true},
     fechaLlegada:{type:Date , required:true},
     destino :{type:String , required:true},
});

export default model <ITrip>("Trip" , tripSchema);