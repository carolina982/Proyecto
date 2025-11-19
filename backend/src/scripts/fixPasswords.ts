import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { MONGO_URI } from "../config/config";
import User from "../models/User";

async function fixPasswords (){
    try {
        console.log("Conectando a MongoDB ..");
        await mongoose.connect(MONGO_URI);
        const users =await User.find();
        let updateCount =0;
        for (const user of users){
            const password =user.password;
            if (typeof password === "string" && !password.startsWith ("$2b$")){
                console.log(`Re-hasheando contraseña de :${user.email}`);
                const newHash =await  bcrypt.hash(password,10);
                user.password=newHash;
                await user.save();
                updateCount++;
            }
        }
        console.log(`Proceso completado.${updateCount} usuario(s) actualizados`);
        }catch (error){
        console.error("Error reparando contraseñas", error);
     }finally{
        await mongoose.disconnect();
        console.log("Desconectando de mongodb");
    }
}

fixPasswords();
