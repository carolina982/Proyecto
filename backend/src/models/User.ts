import { Document, model, Schema } from "mongoose";

export  interface IUser extends Document {
 nombre :string ;
 email:string;
 password:string ;
 rol:string; 

}
const userSchema  = new Schema({
    nombre:{type:String , required :true},
    email:{type:String , required:true},
    password:{type:String, required:true},
    rol:{type:String, required:true},
});

export default model <IUser>("User" , userSchema);