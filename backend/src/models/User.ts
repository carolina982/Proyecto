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
    email:{type:String, unique:true, sparse:true},
    password:{type:String,required:true},
    rol:{type:String, enum:["Admin","Operador","Ayudante General"],
        required:true
    },
    contacto:{type:String},
    photoUrl:{type:String, default:null},
    resetToken:{type:String},
    resetTokenExp:{type:Date},
},
 {timestamps:true}
);

userSchema.pre("findOneAndUpdate",async function (next){
    const update=this.getUpdate() as any;
    if (update.password){
        const salt =await bcrypt.genSalt(10);
        update.password=await bcrypt.hash(update.password,salt);
    }
})

userSchema.methods.comparePassword=function(password:string){
    if (!this.password) return false;
    return bcrypt.compare(password,this.password);
}

export default  mongoose.model <IUser>("User" , userSchema);