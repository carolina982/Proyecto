import mongoose, { Document, Schema } from "mongoose";

export  interface IUser extends Document {
 nombre :string ;
 apellido?:string;
 email:string;
 password:string ;
 rol:"Admin" |"Chofer"; 
 photoUrl?:string|null;

}
const userSchema  = new Schema <IUser>({
    nombre:{type:String , required :true},
    apellido:{type:String},
    email:{type:String , required:true},
    password:{type:String, required:true},
    rol:{type:String,enum:["Admin" , "Chofer"], required:true},
    photoUrl:{type:String, default:null},
},
 {timestamps:true}
);

export default  mongoose.model <IUser>("User" , userSchema);