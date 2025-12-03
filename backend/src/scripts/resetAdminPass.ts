import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { MONGO_URI } from "../config/config";
import User from "../models/User";

(async ()=> {
    try {
        console.log("Conectando a MongoDB...");
        await mongoose.connect(MONGO_URI);
        const newPassword ="admin123";
        const newHash =await bcrypt.hash(newPassword ,10);
        const result =await User.updateOne(
            {email:"admin1@gmail.com"},
            {$set:{password:newHash}}
        );
        console.log("Resultados de actualizacin",result);
        console.log(`Contraseña del admin actualizada a :${newPassword}`);
    }catch (error){
        console.error("Error al rsetear contraseña",error);
    }finally{
        await mongoose.disconnect();
        console.log("Desconectado de MongoDB");
    }
})();