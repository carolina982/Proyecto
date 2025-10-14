import { Request, Response } from "express";
import User, { IUser } from "../models/User";
export const getUser= async (req:Request , res:Response)=>{
    try{
        const users:IUser []= await User.find ();
        res.json (users);
    }catch (error ){
        console.error (error);
        res.status(500).json({message:"Something wen wrong"});
    }
};
export const getUserById =async (req:Request , res:Response) =>{
    try{
        const {id} =req.params;
        const user:IUser | null =await User.findById (id);
        res.json(user);
    }catch (error) {
        res.status (500).json ({message:"Error  en el servidor "});
    }
};
export const createUser = async (req: Request, res: Response) => {
 
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (error: any) {
    console.error("Error creando usuario:", error.message);
    res.status(500).json({ message: "Error creando usuario", error: error.message });
}
};
export const registerUser =async (req:Request , res:Response) =>{
    const{nombre , email,password,rol}:IUser =req .body;
    try{
        const existingUser =await User.findOne({email});
        if (existingUser) return res.status(400).json ({message:"Usuario ya exite"});

        const user =await User.create({nombre,email,password,rol});
        res.status(201).json({user});
    }catch (error){
        console.error(error);
        res.status(500).json({message:"Error en el servidor"});
    }
};
export const loginUser =async (req:Request , res:Response) =>{
    const {email, password}:{email:string; password:string} =req.body;
    try{
        const user=await User.findOne({email,password});
        if (!user) return res.status(401).json({message:"Usuario  o contraseña incorrectos"});
        res.json({user});
    }catch (error){
        console.error (error);
        res.status(500).json ({message:"Error en el servidor"});
    }
};
export const updateUser = async (req:Request , res:Response)=>{
    const {id} =req.params;
    const {nombre,email,rol}=req.body;
    const photoUrl=req.file? `/uploads/${req.file.filename}`:undefined;
    try{
        const updateUser =await User.findByIdAndUpdate(
            id ,
            {nombre,email,rol, ...(photoUrl && {photoUrl})},
            {new:true}
        );
        if (!updateUser) return  res.status(404).json({message:"Usuario no econtrado"});
        res.json(updateUser);
    }catch (error){
        res.status(500).json({message:"Error actualizando usuario" , error});
    }
};
export const deleteUser =async (req:Request , res:Response) =>{
    try{
        await User.findByIdAndDelete(req.params.id);
        res.json({message:"Usuario eliminado"});
} catch (error) {
    console.error (error);
    res.status(500).json({message:"Error eliminando usuario"})
}
};