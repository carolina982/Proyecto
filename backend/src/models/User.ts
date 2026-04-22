import bcrypt from "bcryptjs";
import mongoose, { Document, Schema } from "mongoose";

export  interface IUser extends Document {
 nombre :string ;
 apellido:string;
 email:string;
 password:string ;
 rol:string; 
 contacto:string;
 photoUrl?:string|null;
 resetToken?:string;
 resetTokenExp?:Date;
 comparePassword(password:string):Promise<boolean>;

}
const userSchema  = new Schema <IUser>({
    nombre:{type:String , required :true},
    apellido:{type:String},
    email:{type:String , required:true},
    password:{type:String, required:true},
    rol:{type:String, enum:["Admin","Chofer"], required:true},
    contacto:{type:String},
    photoUrl:{type:String, default:null},
    resetToken:{type:String},
    resetTokenExp:{type:Date},
},
 {timestamps:true}
);

userSchema.pre("save",async function (next){
    if (!this.isModified("password")) return next ();
    const salt=await bcrypt.genSalt(10);
    this.password=await bcrypt.hash(this.password,salt);
    next();
});

userSchema.methods.comparePassword=function(password:string){
    return bcrypt.compare(password,this.password);
};

export default  mongoose.model <IUser>("User" , userSchema);