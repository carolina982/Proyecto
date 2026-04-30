import mongoose, { Document, Schema } from "mongoose";

export interface IUnit extends Document {
    nombre:string;
    placas:string;
    modelo:string;
    capacidad:string;
    estado:"Disponible" | "Mantenimiento " | "Ocupado";
    tipoRemolque?:"Lowboy" |"Caja Seca" |"";
    placaRemolque?:string;

    inventarios?:{
      archivo:string;
      conductorId:string;
      fecha:Date;
    }[];
}
const uniSchema =new Schema<IUnit> ({
    nombre:{type:String , required:true},
    placas:{type:String , required:true},
    modelo:{type:String,  required:true},
    capacidad:{type:String , required:true},
    estado:{type:String , enum:["Disponible" , "Mantenimiento" , "Ocupado"]},
    tipoRemolque:{type:String, enum:["Lowboy","Caja Seca",""],default:""},
    placaRemolque:{type:String,default:""},
    inventarios:[
      {
        archivo:{type:String, required:true},
        conductorId:{type:Schema.Types.ObjectId,ref:"Users"},
        fecha:{type:Date,default:Date.now}
      }
    ],
},
{timestamps:true}
);
uniSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  },
});




export default  mongoose.model<IUnit> ("unit" , uniSchema);